import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type StudyGroup = Tables<'study_groups'>;
type GroupMember = Tables<'group_members'>;

export const useStudyGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [myGroups, setMyGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('study_groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load groups');
      console.error(error);
    } else {
      setGroups(data || []);
    }
    setLoading(false);
  };

  const fetchMyMemberships = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setMyGroups(data.map(m => m.group_id));
    }
  };

  const createGroup = async (group: Omit<TablesInsert<'study_groups'>, 'created_by'>) => {
    if (!user) {
      toast.error('Please sign in to create a group');
      return null;
    }

    const { data, error } = await supabase
      .from('study_groups')
      .insert({ ...group, created_by: user.id })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create group');
      console.error(error);
      return null;
    }

    // Auto-join the group
    await joinGroup(data.id);
    toast.success('Group created successfully!');
    fetchGroups();
    return data;
  };

  const joinGroup = async (groupId: string) => {
    if (!user) {
      toast.error('Please sign in to join a group');
      return false;
    }

    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: user.id });

    if (error) {
      if (error.code === '23505') {
        toast.error('You are already a member of this group');
      } else {
        toast.error('Failed to join group');
        console.error(error);
      }
      return false;
    }

    toast.success('Joined group successfully!');
    fetchMyMemberships();
    return true;
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to leave group');
      console.error(error);
      return false;
    }

    toast.success('Left group successfully');
    fetchMyMemberships();
    return true;
  };

  const getMemberCount = async (groupId: string): Promise<number> => {
    const { count } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);
    return count || 0;
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchMyMemberships();
  }, [user]);

  return {
    groups,
    myGroups,
    loading,
    createGroup,
    joinGroup,
    leaveGroup,
    getMemberCount,
    refetch: fetchGroups,
    isMember: (groupId: string) => myGroups.includes(groupId),
  };
};

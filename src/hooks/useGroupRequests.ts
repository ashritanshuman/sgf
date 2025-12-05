import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type GroupRequestRow = Tables<'group_requests'>;

export interface GroupRequest {
  id: string;
  requester_id: string;
  group_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

const mapRequest = (row: GroupRequestRow): GroupRequest => ({
  id: row.id,
  requester_id: row.requester_id,
  group_id: row.group_id,
  status: row.status as 'pending' | 'accepted' | 'rejected',
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const useGroupRequests = () => {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState<GroupRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<GroupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('group_requests')
      .select('*')
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setMyRequests((data || []).map(mapRequest));
    }
  };

  const fetchIncomingRequests = async () => {
    if (!user) return;

    // First get groups created by user
    const { data: myGroups } = await supabase
      .from('study_groups')
      .select('id')
      .eq('created_by', user.id);

    if (!myGroups || myGroups.length === 0) {
      setIncomingRequests([]);
      return;
    }

    const groupIds = myGroups.map(g => g.id);

    const { data, error } = await supabase
      .from('group_requests')
      .select('*')
      .in('group_id', groupIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!error) {
      setIncomingRequests((data || []).map(mapRequest));
    }
  };

  const sendJoinRequest = async (groupId: string, groupCreatorId: string, groupName: string) => {
    if (!user) {
      toast.error('Please sign in to request to join');
      return false;
    }

    // Check if already requested
    const existingRequest = myRequests.find(r => r.group_id === groupId);
    if (existingRequest) {
      toast.error('You have already requested to join this group');
      return false;
    }

    const { error } = await supabase
      .from('group_requests')
      .insert([{
        requester_id: user.id,
        group_id: groupId,
        status: 'pending',
      }]);

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already requested to join this group');
      } else {
        toast.error('Failed to send join request');
        console.error(error);
      }
      return false;
    }

    // Send notification to group creator
    await supabase
      .from('notifications')
      .insert([{
        user_id: groupCreatorId,
        type: 'join_request',
        title: 'New Join Request',
        message: `Someone from your university wants to join "${groupName}"`,
        data: { group_id: groupId, requester_id: user.id },
      }]);

    toast.success('Join request sent successfully!');
    fetchMyRequests();
    return true;
  };

  const acceptRequest = async (requestId: string, requesterId: string, groupId: string, groupName: string) => {
    if (!user) return false;

    // Update request status
    const { error: updateError } = await supabase
      .from('group_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (updateError) {
      toast.error('Failed to accept request');
      return false;
    }

    // Add user to group members
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([{
        group_id: groupId,
        user_id: requesterId,
      }]);

    if (memberError) {
      console.error('Error adding member:', memberError);
    }

    // Notify the requester
    await supabase
      .from('notifications')
      .insert([{
        user_id: requesterId,
        type: 'request_accepted',
        title: 'Request Accepted',
        message: `Your request to join "${groupName}" has been accepted!`,
        data: { group_id: groupId },
      }]);

    toast.success('Request accepted!');
    fetchIncomingRequests();
    return true;
  };

  const rejectRequest = async (requestId: string, requesterId: string, groupName: string) => {
    const { error } = await supabase
      .from('group_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) {
      toast.error('Failed to reject request');
      return false;
    }

    // Notify the requester
    await supabase
      .from('notifications')
      .insert([{
        user_id: requesterId,
        type: 'request_rejected',
        title: 'Request Declined',
        message: `Your request to join "${groupName}" was declined.`,
        data: {},
      }]);

    toast.success('Request rejected');
    fetchIncomingRequests();
    return true;
  };

  const getRequestStatus = (groupId: string): 'none' | 'pending' | 'accepted' | 'rejected' => {
    const request = myRequests.find(r => r.group_id === groupId);
    return request?.status || 'none';
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchMyRequests(), fetchIncomingRequests()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  // Set up realtime subscription for incoming requests
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('group-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_requests',
        },
        () => {
          fetchMyRequests();
          fetchIncomingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    myRequests,
    incomingRequests,
    loading,
    sendJoinRequest,
    acceptRequest,
    rejectRequest,
    getRequestStatus,
    refetch: () => {
      fetchMyRequests();
      fetchIncomingRequests();
    },
  };
};

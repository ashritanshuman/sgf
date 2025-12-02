import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  const fetchProfile = async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile:', error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<TablesUpdate<'profiles'>>) => {
    if (!user) {
      toast.error('Please sign in to update your profile');
      return false;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update profile');
      console.error(error);
      return false;
    }

    toast.success('Profile updated successfully!');
    fetchProfile();
    return true;
  };

  useEffect(() => {
    fetchProfile();
  }, [targetUserId]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
};

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load profiles:', error);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return {
    profiles,
    loading,
    refetch: fetchProfiles,
  };
};

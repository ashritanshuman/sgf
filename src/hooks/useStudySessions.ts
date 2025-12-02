import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type StudySession = Tables<'study_sessions'>;

export const useStudySessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (error) {
      toast.error('Failed to load sessions');
      console.error(error);
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  const createSession = async (session: Omit<TablesInsert<'study_sessions'>, 'host_id'>) => {
    if (!user) {
      toast.error('Please sign in to create a session');
      return null;
    }

    const { data, error } = await supabase
      .from('study_sessions')
      .insert({ ...session, host_id: user.id })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create session');
      console.error(error);
      return null;
    }

    toast.success('Session created successfully!');
    fetchSessions();
    return data;
  };

  const updateSession = async (sessionId: string, updates: Partial<StudySession>) => {
    if (!user) {
      toast.error('Please sign in to update session');
      return false;
    }

    const { error } = await supabase
      .from('study_sessions')
      .update(updates)
      .eq('id', sessionId)
      .eq('host_id', user.id);

    if (error) {
      toast.error('Failed to update session');
      console.error(error);
      return false;
    }

    toast.success('Session updated successfully!');
    fetchSessions();
    return true;
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessions,
    loading,
    createSession,
    updateSession,
    refetch: fetchSessions,
  };
};

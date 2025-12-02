import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type StudyProgress = Tables<'study_progress'>;

export const useStudyProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<StudyProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('study_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('week_start', { ascending: false });

    if (error) {
      console.error('Failed to load progress:', error);
    } else {
      setProgress(data || []);
    }
    setLoading(false);
  };

  const updateProgress = async (
    subject: string,
    weekStart: string,
    updates: Partial<Pick<StudyProgress, 'hours_studied' | 'sessions_completed' | 'goals_met'>>
  ) => {
    if (!user) {
      toast.error('Please sign in');
      return false;
    }

    // Check if entry exists
    const { data: existing } = await supabase
      .from('study_progress')
      .select('id, hours_studied, sessions_completed, goals_met')
      .eq('user_id', user.id)
      .eq('subject', subject)
      .eq('week_start', weekStart)
      .maybeSingle();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('study_progress')
        .update({
          hours_studied: (Number(existing.hours_studied) || 0) + (Number(updates.hours_studied) || 0),
          sessions_completed: (existing.sessions_completed || 0) + (updates.sessions_completed || 0),
          goals_met: (existing.goals_met || 0) + (updates.goals_met || 0),
        })
        .eq('id', existing.id);

      if (error) {
        toast.error('Failed to update progress');
        console.error(error);
        return false;
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('study_progress')
        .insert({
          user_id: user.id,
          subject,
          week_start: weekStart,
          hours_studied: updates.hours_studied || 0,
          sessions_completed: updates.sessions_completed || 0,
          goals_met: updates.goals_met || 0,
        });

      if (error) {
        toast.error('Failed to create progress');
        console.error(error);
        return false;
      }
    }

    fetchProgress();
    return true;
  };

  const getTotalStats = () => {
    const totals = progress.reduce(
      (acc, p) => ({
        hours_studied: acc.hours_studied + Number(p.hours_studied || 0),
        sessions_completed: acc.sessions_completed + (p.sessions_completed || 0),
        goals_met: acc.goals_met + (p.goals_met || 0),
      }),
      { hours_studied: 0, sessions_completed: 0, goals_met: 0 }
    );
    return totals;
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  return {
    progress,
    loading,
    updateProgress,
    getTotalStats,
    refetch: fetchProgress,
  };
};

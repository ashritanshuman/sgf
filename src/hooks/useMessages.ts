import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Message = Tables<'messages'>;

interface MessageWithProfile extends Message {
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface FileAttachment {
  file: File;
  preview?: string;
}

export const useMessages = (groupId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!groupId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load messages:', error);
    } else {
      // Fetch profiles for messages
      const userIds = [...new Set(data?.map(m => m.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
      
      const messagesWithProfiles = (data || []).map(m => ({
        ...m,
        profile: profileMap.get(m.user_id),
      }));

      setMessages(messagesWithProfiles);
    }
    setLoading(false);
  }, [groupId]);

  const uploadFile = async (file: File): Promise<{ url: string; name: string; type: string } | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error('Failed to upload file');
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(fileName);

    return {
      url: publicUrl,
      name: file.name,
      type: file.type,
    };
  };

  const sendMessage = async (content: string, attachment?: FileAttachment) => {
    if (!user || !groupId) {
      toast.error('Unable to send message');
      return false;
    }

    let fileData: { url: string; name: string; type: string } | null = null;

    if (attachment) {
      fileData = await uploadFile(attachment.file);
      if (!fileData) return false;
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        content: content || (fileData ? fileData.name : ''),
        group_id: groupId,
        user_id: user.id,
        file_url: fileData?.url || null,
        file_name: fileData?.name || null,
        file_type: fileData?.type || null,
      });

    if (error) {
      toast.error('Failed to send message');
      console.error(error);
      return false;
    }

    return true;
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!groupId) return;

    fetchMessages();

    const channel = supabase
      .channel(`messages-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // Fetch profile for new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .eq('user_id', newMessage.user_id)
            .maybeSingle();

          setMessages(prev => [...prev, { ...newMessage, profile: profile || undefined }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, fetchMessages]);

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages,
    isOwnMessage: (message: Message) => message.user_id === user?.id,
  };
};

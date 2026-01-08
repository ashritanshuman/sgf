-- Make the chat-attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'chat-attachments';

-- Drop the old permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view chat attachments" ON storage.objects;

-- Create a new SELECT policy that requires group membership
CREATE POLICY "Group members can view attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-attachments' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.group_members gm ON gm.group_id = m.group_id
    WHERE m.file_url = name
    AND gm.user_id = auth.uid()
  )
);
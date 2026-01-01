-- Make the chat-attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'chat-attachments';
-- Fix notifications INSERT policy security vulnerability
-- The current policy allows any authenticated user to create notifications for any user

-- Drop the insecure policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create a secure INSERT policy that validates notification creation
-- Users can only create notifications when they have a legitimate reason:
-- 1. Join request notifications: when the user is actually requesting to join a group
-- 2. Accept/reject notifications: when the user is the group creator responding to a request
CREATE POLICY "Users can create validated notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (
  -- Users can create join_request notifications to group creators
  -- when they are the requester
  (
    type = 'join_request' 
    AND (data->>'requester_id')::uuid = auth.uid()
    AND user_id IN (
      SELECT sg.created_by FROM study_groups sg
      WHERE sg.id = (data->>'group_id')::uuid
    )
  )
  OR
  -- Group creators can send accept/reject notifications to requesters
  (
    type IN ('request_accepted', 'request_rejected')
    AND EXISTS (
      SELECT 1 FROM study_groups sg
      WHERE sg.created_by = auth.uid()
      AND sg.id = (data->>'group_id')::uuid
    )
  )
);
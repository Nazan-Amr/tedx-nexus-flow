-- Add missing RLS policies with correct syntax

-- Security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

-- Badges policies
CREATE POLICY "Everyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Management board can insert badges" ON public.badges FOR INSERT WITH CHECK (
  public.get_current_user_role() = 'management_board'
);
CREATE POLICY "Management board can update badges" ON public.badges FOR UPDATE USING (
  public.get_current_user_role() = 'management_board'
);
CREATE POLICY "Management board can delete badges" ON public.badges FOR DELETE USING (
  public.get_current_user_role() = 'management_board'
);

-- User badges policies
CREATE POLICY "Users can view all user badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Management and high board can award badges" ON public.user_badges FOR INSERT WITH CHECK (
  public.get_current_user_role() IN ('management_board', 'high_board')
);

-- Task submissions policies
CREATE POLICY "Users can view relevant task submissions" ON public.task_submissions FOR SELECT USING (
  auth.uid() = submitted_by OR
  auth.uid() = (SELECT created_by FROM public.tasks WHERE id = task_id) OR
  public.get_current_user_role() = 'management_board'
);

CREATE POLICY "Users can submit tasks" ON public.task_submissions FOR INSERT WITH CHECK (
  auth.uid() = submitted_by
);

CREATE POLICY "Users can update own submissions" ON public.task_submissions FOR UPDATE USING (
  auth.uid() = submitted_by
);

-- Calendar events policies
CREATE POLICY "Users can view department events" ON public.calendar_events FOR SELECT USING (
  public.get_current_user_role() = 'management_board' OR
  department = (SELECT department FROM public.profiles WHERE user_id = auth.uid()) OR
  auth.uid() = ANY(attendees)
);

CREATE POLICY "High board and management can create events" ON public.calendar_events FOR INSERT WITH CHECK (
  public.get_current_user_role() IN ('high_board', 'management_board')
);

CREATE POLICY "High board and management can update events" ON public.calendar_events FOR UPDATE USING (
  auth.uid() = created_by OR
  public.get_current_user_role() = 'management_board'
);

CREATE POLICY "High board and management can delete events" ON public.calendar_events FOR DELETE USING (
  auth.uid() = created_by OR
  public.get_current_user_role() = 'management_board'
);

-- Feedback policies
CREATE POLICY "All users can submit feedback" ON public.feedback FOR INSERT WITH CHECK (
  auth.uid() = submitted_by OR is_anonymous = true
);

CREATE POLICY "Management board can view all feedback" ON public.feedback FOR SELECT USING (
  public.get_current_user_role() = 'management_board'
);

-- Innovation proposals policies
CREATE POLICY "Users can view own proposals" ON public.innovation_proposals FOR SELECT USING (
  auth.uid() = submitted_by OR
  public.get_current_user_role() = 'management_board'
);

CREATE POLICY "All users can submit proposals" ON public.innovation_proposals FOR INSERT WITH CHECK (
  auth.uid() = submitted_by
);

CREATE POLICY "Management board can update proposals" ON public.innovation_proposals FOR UPDATE USING (
  public.get_current_user_role() = 'management_board'
);

-- Anonymous reports policies
CREATE POLICY "Anyone can submit anonymous reports" ON public.anonymous_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Management board can view anonymous reports" ON public.anonymous_reports FOR SELECT USING (
  public.get_current_user_role() = 'management_board'
);

-- Attendance records policies
CREATE POLICY "Management board can insert attendance" ON public.attendance_records FOR INSERT WITH CHECK (
  public.get_current_user_role() = 'management_board'
);
CREATE POLICY "Management board can update attendance" ON public.attendance_records FOR UPDATE USING (
  public.get_current_user_role() = 'management_board'
);
CREATE POLICY "Management board can delete attendance" ON public.attendance_records FOR DELETE USING (
  public.get_current_user_role() = 'management_board'
);
CREATE POLICY "Users can view own attendance" ON public.attendance_records FOR SELECT USING (
  auth.uid() = user_id OR
  public.get_current_user_role() = 'management_board'
);

-- Training assignments policies
CREATE POLICY "Users can view relevant training assignments" ON public.training_assignments FOR SELECT USING (
  auth.uid() = assigned_by OR
  auth.uid() = ANY(assigned_to) OR
  public.get_current_user_role() = 'management_board'
);

CREATE POLICY "High board and management can create training" ON public.training_assignments FOR INSERT WITH CHECK (
  public.get_current_user_role() IN ('high_board', 'management_board')
);

-- Training submissions policies
CREATE POLICY "Users can view relevant training submissions" ON public.training_submissions FOR SELECT USING (
  auth.uid() = submitted_by OR
  auth.uid() = (SELECT assigned_by FROM public.training_assignments WHERE id = assignment_id) OR
  public.get_current_user_role() = 'management_board'
);

CREATE POLICY "Users can submit training" ON public.training_submissions FOR INSERT WITH CHECK (
  auth.uid() = submitted_by
);

-- Chat rooms policies
CREATE POLICY "Users can view relevant chat rooms" ON public.chat_rooms FOR SELECT USING (
  auth.uid() = ANY(participants) OR
  public.get_current_user_role() = 'management_board'
);

CREATE POLICY "Management board can create chat rooms" ON public.chat_rooms FOR INSERT WITH CHECK (
  public.get_current_user_role() = 'management_board'
);

-- Messages policies
CREATE POLICY "Users can view messages in accessible rooms" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE id = room_id AND (
      auth.uid() = ANY(participants) OR
      public.get_current_user_role() = 'management_board'
    )
  )
);

CREATE POLICY "Users can send messages to accessible rooms" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE id = room_id AND (
      auth.uid() = ANY(participants) OR
      public.get_current_user_role() = 'management_board'
    )
  )
);

-- Tools policies
CREATE POLICY "Users can view role-appropriate tools" ON public.tools FOR SELECT USING (
  required_role = public.get_current_user_role() OR
  public.get_current_user_role() = 'management_board'
);

CREATE POLICY "Management board can insert tools" ON public.tools FOR INSERT WITH CHECK (
  public.get_current_user_role() = 'management_board'
);
CREATE POLICY "Management board can update tools" ON public.tools FOR UPDATE USING (
  public.get_current_user_role() = 'management_board'
);
CREATE POLICY "Management board can delete tools" ON public.tools FOR DELETE USING (
  public.get_current_user_role() = 'management_board'
);

-- Update reports policies to be more comprehensive
DROP POLICY IF EXISTS "Users can view own reports or management can view all" ON public.reports;
DROP POLICY IF EXISTS "High board can submit reports" ON public.reports;

CREATE POLICY "Users can view own reports or management can view all" ON public.reports FOR SELECT USING (
  auth.uid() = submitted_by OR
  public.get_current_user_role() = 'management_board'
);

CREATE POLICY "High board can submit reports" ON public.reports FOR INSERT WITH CHECK (
  auth.uid() = submitted_by AND
  public.get_current_user_role() IN ('high_board', 'management_board')
);

CREATE POLICY "Management board can update reports" ON public.reports FOR UPDATE USING (
  public.get_current_user_role() = 'management_board'
);

-- Update tasks policies to be more comprehensive
DROP POLICY IF EXISTS "Users can view relevant tasks" ON public.tasks;
DROP POLICY IF EXISTS "High board and management can create tasks" ON public.tasks;

CREATE POLICY "Users can view relevant tasks" ON public.tasks FOR SELECT USING (
  auth.uid() = created_by OR 
  auth.uid() = ANY(assigned_to) OR
  public.get_current_user_role() = 'management_board'
);

CREATE POLICY "High board and management can create tasks" ON public.tasks FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  public.get_current_user_role() IN ('high_board', 'management_board')
);

CREATE POLICY "Task creators and management can update tasks" ON public.tasks FOR UPDATE USING (
  auth.uid() = created_by OR
  public.get_current_user_role() = 'management_board'
);

CREATE POLICY "Task creators and management can delete tasks" ON public.tasks FOR DELETE USING (
  auth.uid() = created_by OR
  public.get_current_user_role() = 'management_board'
);
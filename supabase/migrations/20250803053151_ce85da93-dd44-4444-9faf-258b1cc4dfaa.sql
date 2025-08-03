-- Create user roles enum
CREATE TYPE user_role AS ENUM ('management_board', 'high_board', 'member');

-- Create department enum
CREATE TYPE department_type AS ENUM ('IT', 'Organizing', 'Graphic Design', 'Public Relations', 'Treasury', 'Marketing & Social Media', 'Content Writing', 'HR');

-- Create report type enum
CREATE TYPE report_type AS ENUM ('event_updates', 'financials', 'weekly_progress', 'other');

-- Create feedback type enum
CREATE TYPE feedback_type AS ENUM ('high_board_session', 'member_session', 'general');

-- Create task status enum
CREATE TYPE task_status AS ENUM ('pending', 'submitted', 'approved', 'rejected', 'in_review');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL,
  department department_type,
  position TEXT, -- Head, Vice-Head, etc.
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id),
  awarded_by UUID REFERENCES public.profiles(user_id),
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  assigned_to UUID[],
  department department_type,
  deadline TIMESTAMP WITH TIME ZONE,
  status task_status DEFAULT 'pending',
  attachments JSONB DEFAULT '[]',
  creative_followup BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_submissions table
CREATE TABLE public.task_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL,
  description TEXT,
  attachments JSONB DEFAULT '[]',
  status task_status DEFAULT 'submitted',
  feedback TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_creative_followup BOOLEAN DEFAULT false
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type report_type NOT NULL,
  description TEXT,
  submitted_by UUID NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  file_url TEXT,
  status TEXT DEFAULT 'submitted',
  management_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calendar_events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL,
  department department_type,
  attendees UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type feedback_type NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  submitted_by UUID,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create innovation_proposals table
CREATE TABLE public.innovation_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  submitted_by UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  management_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create anonymous_reports table
CREATE TABLE public.anonymous_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_date DATE NOT NULL,
  session_title TEXT,
  attendance_status TEXT NOT NULL,
  attention_level INTEGER CHECK (attention_level >= 1 AND attention_level <= 5),
  notes TEXT,
  recorded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training_assignments table
CREATE TABLE public.training_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_by UUID NOT NULL,
  assigned_to UUID[],
  department department_type,
  deadline TIMESTAMP WITH TIME ZONE,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training_submissions table
CREATE TABLE public.training_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.training_assignments(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL,
  content TEXT,
  attachments JSONB DEFAULT '[]',
  comments TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_rooms table
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department department_type,
  participants UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  message_type TEXT DEFAULT 'text', -- text, file, voice
  file_url TEXT,
  voice_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tools table
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  required_role user_role NOT NULL,
  department department_type,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for tasks
CREATE POLICY "Users can view relevant tasks" ON public.tasks FOR SELECT USING (
  auth.uid() = created_by OR 
  auth.uid() = ANY(assigned_to) OR
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'management_board'
);

CREATE POLICY "High board and management can create tasks" ON public.tasks FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('high_board', 'management_board')
);

-- Create RLS policies for reports
CREATE POLICY "Users can view own reports or management can view all" ON public.reports FOR SELECT USING (
  auth.uid() = submitted_by OR
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'management_board'
);

CREATE POLICY "High board can submit reports" ON public.reports FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('high_board', 'management_board')
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_innovation_proposals_updated_at BEFORE UPDATE ON public.innovation_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial badges
INSERT INTO public.badges (name, description, icon) VALUES
('Gold Contributor', 'Top performer with exceptional contributions', '🏆'),
('Punctual Performer', 'Always meets deadlines', '⏰'),
('Team Spirit', 'Excellent collaboration and teamwork', '🤝'),
('Creative Innovator', 'Outstanding creative contributions', '💡'),
('Best Performer', 'Exceptional overall performance', '⭐');

-- Insert initial tools for different roles
INSERT INTO public.tools (name, description, url, required_role) VALUES
('Google Drive - Management', 'Management board documents', 'https://drive.google.com', 'management_board'),
('Notion Dashboard - Management', 'Management planning workspace', 'https://notion.so', 'management_board'),
('Google Drive - High Board', 'Department heads documents', 'https://drive.google.com', 'high_board'),
('Meeting Templates', 'Standard meeting templates', 'https://docs.google.com', 'high_board'),
('Planning Sheets', 'Project planning resources', 'https://sheets.google.com', 'member');

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role, department)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'member'),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'department' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'department')::department_type
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
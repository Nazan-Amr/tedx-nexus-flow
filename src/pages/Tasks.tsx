import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { NavigationHeader } from '@/components/NavigationHeader';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  department: string;
  created_by: string;
  assigned_to: string[];
  attachments: any;
  creative_followup: boolean;
}

interface TaskSubmission {
  id: string;
  task_id: string;
  description: string;
  status: string;
  submitted_by: string;
  submitted_at: string;
  attachments: any;
}

export default function Tasks() {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    department: '',
    deadline: undefined as Date | undefined,
    assigned_to: [] as string[],
    creative_followup: false
  });

  const [submission, setSubmission] = useState({
    description: '',
    attachments: [] as any[]
  });

  useEffect(() => {
    fetchTasks();
    fetchProfiles();
    fetchSubmissions();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch tasks', variant: 'destructive' });
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*');
    setProfiles(data || []);
  };

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from('task_submissions')
      .select('*');
    setSubmissions(data || []);
  };

  const createTask = async () => {
    if (!newTask.title || !user) return;

    const { error } = await supabase
      .from('tasks')
      .insert({
        title: newTask.title,
        description: newTask.description,
        department: (newTask.department as any) || 'IT',
        deadline: newTask.deadline?.toISOString() || null,
        assigned_to: newTask.assigned_to,
        creative_followup: newTask.creative_followup,
        created_by: user.id
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create task', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Task created successfully' });
      setIsCreateOpen(false);
      setNewTask({ title: '', description: '', department: '', deadline: undefined, assigned_to: [], creative_followup: false });
      fetchTasks();
    }
  };

  const submitTask = async () => {
    if (!selectedTask || !user) return;

    const { error } = await supabase
      .from('task_submissions')
      .insert({
        task_id: selectedTask.id,
        description: submission.description,
        attachments: submission.attachments,
        submitted_by: user.id
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit task', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Task submitted successfully' });
      setIsSubmitOpen(false);
      setSubmission({ description: '', attachments: [] });
      fetchSubmissions();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in_progress': return 'bg-warning';
      case 'pending': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const canCreateTasks = profile?.role === 'management_board' || profile?.role === 'high_board';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader title="Tasks" description="Manage and track organizational tasks" />
        <div className="container mx-auto p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title="Tasks" 
        description="Manage and track organizational tasks" 
      />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          {canCreateTasks && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Task title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Task description"
                    />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Select value={newTask.department} onValueChange={(value) => setNewTask({ ...newTask, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Organizing">Organizing</SelectItem>
                        <SelectItem value="Marketing & Social Media">Marketing & Social Media</SelectItem>
                        <SelectItem value="Public Relations">Public Relations</SelectItem>
                        <SelectItem value="Treasury">Treasury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Deadline</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTask.deadline ? format(newTask.deadline, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newTask.deadline}
                          onSelect={(date) => setNewTask({ ...newTask, deadline: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button onClick={createTask} className="w-full">Create Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-4">
          {tasks.map((task) => {
            const hasSubmitted = submissions.some(s => s.task_id === task.id && s.submitted_by === user?.id);
            const isAssigned = task.assigned_to.includes(user?.id || '');
            
            return (
              <Card key={task.id} className="border-border">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-foreground">{task.title}</CardTitle>
                      <p className="text-muted-foreground mt-1">{task.description}</p>
                    </div>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {task.deadline && `Due: ${format(new Date(task.deadline), 'PPP')}`}
                      {task.department && ` • ${task.department.replace('_', ' ')}`}
                    </div>
                    {isAssigned && !hasSubmitted && (
                      <Dialog open={isSubmitOpen && selectedTask?.id === task.id} onOpenChange={(open) => {
                        setIsSubmitOpen(open);
                        if (open) setSelectedTask(task);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm">Submit</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Task: {task.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="submission-desc">Description</Label>
                              <Textarea
                                id="submission-desc"
                                value={submission.description}
                                onChange={(e) => setSubmission({ ...submission, description: e.target.value })}
                                placeholder="Describe your submission"
                              />
                            </div>
                            <Button onClick={submitTask} className="w-full">Submit Task</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {hasSubmitted && (
                      <Badge variant="secondary">Submitted</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {tasks.length === 0 && (
          <Card className="border-border">
            <CardContent className="text-center py-8">
              <div className="text-muted-foreground">No tasks available</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
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
import { CalendarIcon, Plus, BookOpen, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface TrainingAssignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  department: string;
  assigned_to: string[];
  assigned_by: string;
  attachments: any;
  created_at: string;
}

interface TrainingSubmission {
  id: string;
  assignment_id: string;
  content: string;
  comments: string;
  submitted_by: string;
  submitted_at: string;
  attachments: any;
}

export default function Training() {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [submissions, setSubmissions] = useState<TrainingSubmission[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TrainingAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    department: '',
    deadline: undefined as Date | undefined,
    assigned_to: [] as string[]
  });

  const [submission, setSubmission] = useState({
    content: '',
    comments: ''
  });

  useEffect(() => {
    fetchAssignments();
    fetchProfiles();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from('training_assignments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch training assignments', variant: 'destructive' });
    } else {
      setAssignments(data || []);
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
      .from('training_submissions')
      .select('*');
    setSubmissions(data || []);
  };

  const createAssignment = async () => {
    if (!newAssignment.title || !user) return;

      const { error } = await supabase
        .from('training_assignments')
        .insert({
          title: newAssignment.title,
          description: newAssignment.description,
          department: (newAssignment.department as any) || 'IT',
          deadline: newAssignment.deadline?.toISOString() || null,
          assigned_to: newAssignment.assigned_to,
          assigned_by: user.id
        });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create training assignment', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Training assignment created successfully' });
      setIsCreateOpen(false);
      setNewAssignment({ title: '', description: '', department: '', deadline: undefined, assigned_to: [] });
      fetchAssignments();
    }
  };

  const submitTraining = async () => {
    if (!selectedAssignment || !user) return;

    const { error } = await supabase
      .from('training_submissions')
      .insert({
        assignment_id: selectedAssignment.id,
        content: submission.content,
        comments: submission.comments,
        submitted_by: user.id
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit training', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Training submitted successfully' });
      setIsSubmitOpen(false);
      setSubmission({ content: '', comments: '' });
      fetchSubmissions();
    }
  };

  const canCreateAssignments = profile?.role === 'management_board' || profile?.role === 'high_board';

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Training</h1>
          <p className="text-muted-foreground">Manage training assignments and submissions</p>
        </div>
        {canCreateAssignments && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Training Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    placeholder="Training title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    placeholder="Training description"
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Select value={newAssignment.department} onValueChange={(value) => setNewAssignment({ ...newAssignment, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Organizing">Organizing</SelectItem>
                      <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                      <SelectItem value="Public Relations">Public Relations</SelectItem>
                      <SelectItem value="Treasury">Treasury</SelectItem>
                      <SelectItem value="Marketing & Social Media">Marketing & Social Media</SelectItem>
                      <SelectItem value="Content Writing">Content Writing</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newAssignment.deadline ? format(newAssignment.deadline, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newAssignment.deadline}
                        onSelect={(date) => setNewAssignment({ ...newAssignment, deadline: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button onClick={createAssignment} className="w-full">Create Assignment</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment) => {
          const hasSubmitted = submissions.some(s => s.assignment_id === assignment.id && s.submitted_by === user?.id);
          const isAssigned = assignment.assigned_to.includes(user?.id || '');
          
          return (
            <Card key={assignment.id} className="border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <CardTitle className="text-foreground">{assignment.title}</CardTitle>
                      <p className="text-muted-foreground mt-1">{assignment.description}</p>
                    </div>
                  </div>
                  {hasSubmitted && (
                    <Badge variant="secondary">Submitted</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {assignment.deadline && `Due: ${format(new Date(assignment.deadline), 'PPP')}`}
                    {assignment.department && ` • ${assignment.department.replace('_', ' ')}`}
                  </div>
                  {isAssigned && !hasSubmitted && (
                    <Dialog open={isSubmitOpen && selectedAssignment?.id === assignment.id} onOpenChange={(open) => {
                      setIsSubmitOpen(open);
                      if (open) setSelectedAssignment(assignment);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Send className="w-4 h-4 mr-2" />
                          Submit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Submit Training: {assignment.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                              id="content"
                              value={submission.content}
                              onChange={(e) => setSubmission({ ...submission, content: e.target.value })}
                              placeholder="Training completion details"
                            />
                          </div>
                          <div>
                            <Label htmlFor="comments">Comments</Label>
                            <Textarea
                              id="comments"
                              value={submission.comments}
                              onChange={(e) => setSubmission({ ...submission, comments: e.target.value })}
                              placeholder="Additional comments"
                            />
                          </div>
                          <Button onClick={submitTraining} className="w-full">Submit Training</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <Card className="border-border">
          <CardContent className="text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No training assignments</h3>
            <p className="text-muted-foreground">
              {canCreateAssignments ? 'Create your first training assignment.' : 'No training assignments have been created yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
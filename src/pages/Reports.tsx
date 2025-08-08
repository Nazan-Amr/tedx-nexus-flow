import { useState, useEffect } from 'react';
import { NavigationHeader } from '@/components/NavigationHeader';
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
import { CalendarIcon, Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface Report {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  deadline: string;
  submitted_by: string;
  management_feedback: string;
  file_url: string;
  created_at: string;
}

export default function Reports() {
  const { user, profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    type: '',
    deadline: undefined as Date | undefined
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch reports', variant: 'destructive' });
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const createReport = async () => {
    if (!newReport.title || !user) return;

      const { error } = await supabase
        .from('reports')
        .insert({
          title: newReport.title,
          description: newReport.description,
          type: newReport.type as 'event_updates' | 'financials' | 'weekly_progress' | 'other',
          deadline: newReport.deadline?.toISOString() || null,
          submitted_by: user.id
        });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create report', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Report submitted successfully' });
      setIsCreateOpen(false);
      setNewReport({ title: '', description: '', type: '', deadline: undefined });
      fetchReports();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'under_review': return 'bg-warning';
      case 'submitted': return 'bg-muted';
      case 'rejected': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'bg-primary';
      case 'activity': return 'bg-secondary';
      case 'progress': return 'bg-accent';
      default: return 'bg-muted';
    }
  };

  const canSubmitReports = profile?.role === 'management_board' || profile?.role === 'high_board';

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title="Reports & Documentation" 
        description="Submit and manage team reports"
      />
      <div className="container mx-auto p-6 space-y-6">
        {canSubmitReports && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Submit Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Submit New Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    placeholder="Report title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    placeholder="Report description"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={newReport.type} onValueChange={(value) => setNewReport({ ...newReport, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event_updates">Event Updates</SelectItem>
                      <SelectItem value="financials">Financials</SelectItem>
                      <SelectItem value="weekly_progress">Weekly Progress</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newReport.deadline ? format(newReport.deadline, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newReport.deadline}
                        onSelect={(date) => setNewReport({ ...newReport, deadline: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button onClick={createReport} className="w-full">Submit Report</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="border-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <CardTitle className="text-foreground">{report.title}</CardTitle>
                    <p className="text-muted-foreground mt-1">{report.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(report.type)}>
                    {report.type}
                  </Badge>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div>
                  Submitted: {format(new Date(report.created_at), 'PPP')}
                  {report.deadline && ` • Due: ${format(new Date(report.deadline), 'PPP')}`}
                </div>
              </div>
              {report.management_feedback && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium text-foreground">Management Feedback:</p>
                  <p className="text-sm text-muted-foreground mt-1">{report.management_feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <Card className="border-border">
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No reports yet</h3>
            <p className="text-muted-foreground">
              {canSubmitReports ? 'Submit your first report to get started.' : 'No reports have been submitted yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
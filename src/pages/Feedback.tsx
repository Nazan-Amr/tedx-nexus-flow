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
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, Plus, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface Feedback {
  id: string;
  title: string;
  content: string;
  type: string;
  is_anonymous: boolean;
  submitted_by: string;
  created_at: string;
}

interface AnonymousReport {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
}

export default function Feedback() {
  const { user, profile } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [reports, setReports] = useState<AnonymousReport[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feedback' | 'reports'>('feedback');
  
  const [newFeedback, setNewFeedback] = useState({
    title: '',
    content: '',
    type: '',
    is_anonymous: false
  });

  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    fetchFeedbacks();
    fetchReports();
    fetchProfiles();
  }, []);

  const fetchFeedbacks = async () => {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch feedback', variant: 'destructive' });
    } else {
      setFeedbacks(data || []);
    }
    setLoading(false);
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('anonymous_reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error && profile?.role === 'management_board') {
      toast({ title: 'Error', description: 'Failed to fetch reports', variant: 'destructive' });
    } else {
      setReports(data || []);
    }
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*');
    setProfiles(data || []);
  };

  const submitFeedback = async () => {
    if (!newFeedback.content || !user) return;

      const { error } = await supabase
        .from('feedback')
        .insert({
          content: newFeedback.content,
          type: newFeedback.type as 'high_board_session' | 'member_session' | 'general',
          is_anonymous: newFeedback.is_anonymous,
          submitted_by: newFeedback.is_anonymous ? null : user.id
        });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit feedback', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Feedback submitted successfully' });
      setIsFeedbackOpen(false);
      setNewFeedback({ title: '', content: '', type: '', is_anonymous: false });
      fetchFeedbacks();
    }
  };

  const submitReport = async () => {
    if (!newReport.description) return;

    const { error } = await supabase
      .from('anonymous_reports')
      .insert({
        title: newReport.title,
        description: newReport.description,
        category: newReport.category
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit report', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Report submitted successfully' });
      setIsReportOpen(false);
      setNewReport({ title: '', description: '', category: '' });
      fetchReports();
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'bg-primary';
      case 'complaint': return 'bg-warning';
      case 'compliment': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'harassment': return 'bg-destructive';
      case 'misconduct': return 'bg-warning';
      case 'policy_violation': return 'bg-orange-500';
      case 'safety_concern': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const getProfileName = (userId: string) => {
    const userProfile = profiles.find(p => p.user_id === userId);
    return userProfile?.full_name || 'Unknown User';
  };

  const canViewReports = profile?.role === 'management_board';

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
          <h1 className="text-3xl font-bold text-foreground">Feedback & Reports</h1>
          <p className="text-muted-foreground">Share feedback and submit anonymous reports</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={newFeedback.title}
                    onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                    placeholder="Feedback title"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newFeedback.content}
                    onChange={(e) => setNewFeedback({ ...newFeedback, content: e.target.value })}
                    placeholder="Share your feedback"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={newFeedback.type} onValueChange={(value) => setNewFeedback({ ...newFeedback, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high_board_session">High Board Session</SelectItem>
                      <SelectItem value="member_session">Member Session</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={newFeedback.is_anonymous}
                    onCheckedChange={(checked) => setNewFeedback({ ...newFeedback, is_anonymous: checked as boolean })}
                  />
                  <Label htmlFor="anonymous">Submit anonymously</Label>
                </div>
                <Button onClick={submitFeedback} className="w-full">Submit Feedback</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Anonymous Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Anonymous Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="report-title">Title (Optional)</Label>
                  <Input
                    id="report-title"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    placeholder="Report title"
                  />
                </div>
                <div>
                  <Label htmlFor="report-description">Description</Label>
                  <Textarea
                    id="report-description"
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    placeholder="Describe the issue"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newReport.category} onValueChange={(value) => setNewReport({ ...newReport, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="misconduct">Misconduct</SelectItem>
                      <SelectItem value="policy_violation">Policy Violation</SelectItem>
                      <SelectItem value="safety_concern">Safety Concern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={submitReport} className="w-full">Submit Report</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'feedback' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          Feedback
        </button>
        {canViewReports && (
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-2 px-1 border-b-2 transition-colors ${
              activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
            }`}
          >
            Anonymous Reports
          </button>
        )}
      </div>

      {activeTab === 'feedback' && (
        <div className="grid gap-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-primary mt-1" />
                    <div>
                      {feedback.title && <CardTitle className="text-foreground">{feedback.title}</CardTitle>}
                      <p className="text-muted-foreground mt-1">{feedback.content}</p>
                    </div>
                  </div>
                  <Badge className={getTypeColor(feedback.type)}>
                    {feedback.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div>
                    {feedback.is_anonymous ? 'Anonymous' : `By: ${getProfileName(feedback.submitted_by)}`}
                  </div>
                  <div>
                    {format(new Date(feedback.created_at), 'PPP')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'reports' && canViewReports && (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-destructive mt-1" />
                    <div>
                      {report.title && <CardTitle className="text-foreground">{report.title}</CardTitle>}
                      <p className="text-muted-foreground mt-1">{report.description}</p>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(report.category)}>
                    {report.category.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground text-right">
                  {format(new Date(report.created_at), 'PPP')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {((activeTab === 'feedback' && feedbacks.length === 0) || 
        (activeTab === 'reports' && reports.length === 0)) && (
        <Card className="border-border">
          <CardContent className="text-center py-8">
            {activeTab === 'feedback' ? (
              <>
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No feedback yet</h3>
                <p className="text-muted-foreground">Be the first to share your feedback.</p>
              </>
            ) : (
              <>
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No reports submitted</h3>
                <p className="text-muted-foreground">No anonymous reports have been submitted yet.</p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
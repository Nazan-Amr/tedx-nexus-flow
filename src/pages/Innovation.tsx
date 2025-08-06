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
import { Lightbulb, Plus, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface InnovationProposal {
  id: string;
  title: string;
  description: string;
  status: string;
  submitted_by: string;
  management_comment: string;
  created_at: string;
  updated_at: string;
}

export default function Innovation() {
  const { user, profile } = useAuth();
  const [proposals, setProposals] = useState<InnovationProposal[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<InnovationProposal | null>(null);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [managementComment, setManagementComment] = useState('');
  const [proposalStatus, setProposalStatus] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchProposals();
    fetchProfiles();
  }, []);

  const fetchProposals = async () => {
    const { data, error } = await supabase
      .from('innovation_proposals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch proposals', variant: 'destructive' });
    } else {
      setProposals(data || []);
    }
    setLoading(false);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*');
    setProfiles(data || []);
  };

  const createProposal = async () => {
    if (!newProposal.title || !user) return;

    const { error } = await supabase
      .from('innovation_proposals')
      .insert({
        title: newProposal.title,
        description: newProposal.description,
        submitted_by: user.id
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit proposal', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Proposal submitted successfully' });
      setIsCreateOpen(false);
      setNewProposal({ title: '', description: '' });
      fetchProposals();
    }
  };

  const updateProposal = async () => {
    if (!selectedProposal) return;

    const { error } = await supabase
      .from('innovation_proposals')
      .update({
        management_comment: managementComment,
        status: proposalStatus
      })
      .eq('id', selectedProposal.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update proposal', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Proposal updated successfully' });
      setIsCommentOpen(false);
      setManagementComment('');
      setProposalStatus('');
      fetchProposals();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'under_review': return 'bg-warning';
      case 'pending': return 'bg-muted';
      case 'rejected': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getProfileName = (userId: string) => {
    const userProfile = profiles.find(p => p.user_id === userId);
    return userProfile?.full_name || 'Unknown User';
  };

  const canManageProposals = profile?.role === 'management_board';

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
          <h1 className="text-3xl font-bold text-foreground">Innovation Proposals</h1>
          <p className="text-muted-foreground">Submit and track innovative ideas for TEDx</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Submit Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Innovation Proposal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                  placeholder="Proposal title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  placeholder="Describe your innovative idea"
                  rows={6}
                />
              </div>
              <Button onClick={createProposal} className="w-full">Submit Proposal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="border-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <CardTitle className="text-foreground">{proposal.title}</CardTitle>
                    <p className="text-muted-foreground mt-1">{proposal.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(proposal.status)}>
                    {proposal.status.replace('_', ' ')}
                  </Badge>
                  {canManageProposals && (
                    <Dialog open={isCommentOpen && selectedProposal?.id === proposal.id} onOpenChange={(open) => {
                      setIsCommentOpen(open);
                      if (open) {
                        setSelectedProposal(proposal);
                        setManagementComment(proposal.management_comment || '');
                        setProposalStatus(proposal.status);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Review Proposal: {proposal.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Status</Label>
                            <select
                              className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                              value={proposalStatus}
                              onChange={(e) => setProposalStatus(e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="under_review">Under Review</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="comment">Management Comment</Label>
                            <Textarea
                              id="comment"
                              value={managementComment}
                              onChange={(e) => setManagementComment(e.target.value)}
                              placeholder="Add feedback or comments"
                              rows={4}
                            />
                          </div>
                          <Button onClick={updateProposal} className="w-full">Update Proposal</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
                <div>
                  Submitted by: {getProfileName(proposal.submitted_by)}
                </div>
                <div>
                  {format(new Date(proposal.created_at), 'PPP')}
                </div>
              </div>
              {proposal.management_comment && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium text-foreground">Management Feedback:</p>
                  <p className="text-sm text-muted-foreground mt-1">{proposal.management_comment}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {proposals.length === 0 && (
        <Card className="border-border">
          <CardContent className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No proposals yet</h3>
            <p className="text-muted-foreground">Submit your first innovative idea to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
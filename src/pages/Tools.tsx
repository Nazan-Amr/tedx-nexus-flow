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
import { ExternalLink, Plus, Settings, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ToolItem {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  required_role: string;
  department: string;
  created_at: string;
}

export default function Tools() {
  const { user, profile } = useAuth();
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [toolForm, setToolForm] = useState({
    name: '',
    description: '',
    url: '',
    icon: '',
    required_role: '',
    department: ''
  });

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch tools', variant: 'destructive' });
    } else {
      setTools(data || []);
    }
    setLoading(false);
  };

  const createTool = async () => {
    if (!toolForm.name || !toolForm.url || !user) return;

        const { error } = await supabase
          .from('tools')
          .insert({
            name: toolForm.name,
            description: toolForm.description,
            url: toolForm.url,
            required_role: (toolForm.required_role as any) || 'member',
            department: (toolForm.department as any) || 'IT'
          });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create tool', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Tool created successfully' });
      setIsCreateOpen(false);
      resetForm();
      fetchTools();
    }
  };

  const updateTool = async () => {
    if (!selectedTool || !toolForm.name || !toolForm.url) return;

        const { error } = await supabase
          .from('tools')
          .update({
            name: toolForm.name,
            description: toolForm.description,
            url: toolForm.url,
            required_role: (toolForm.required_role as any) || 'member',
            department: (toolForm.department as any) || 'IT'
          })
          .eq('id', selectedTool.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update tool', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Tool updated successfully' });
      setIsEditOpen(false);
      resetForm();
      fetchTools();
    }
  };

  const deleteTool = async (toolId: string) => {
    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', toolId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete tool', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Tool deleted successfully' });
      fetchTools();
    }
  };

  const resetForm = () => {
    setToolForm({
      name: '',
      description: '',
      url: '',
      icon: '',
      required_role: '',
      department: ''
    });
    setSelectedTool(null);
  };

  const openEditDialog = (tool: ToolItem) => {
    setSelectedTool(tool);
    setToolForm({
      name: tool.name,
      description: tool.description || '',
      url: tool.url,
      icon: tool.icon || '',
      required_role: tool.required_role,
      department: tool.department || ''
    });
    setIsEditOpen(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'management_board': return 'bg-destructive';
      case 'high_board': return 'bg-warning';
      case 'member': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'organizing_committee': return 'bg-primary';
      case 'production': return 'bg-secondary';
      case 'marketing': return 'bg-accent';
      case 'logistics': return 'bg-warning';
      case 'speakers': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const canManageTools = profile?.role === 'management_board';

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
        title="Organization Tools" 
        description="Access helpful tools and resources"
      />
      <div className="container mx-auto p-6 space-y-6">
        {canManageTools && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Tool
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Tool</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={toolForm.name}
                    onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                    placeholder="Tool name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={toolForm.description}
                    onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                    placeholder="Tool description"
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={toolForm.url}
                    onChange={(e) => setToolForm({ ...toolForm, url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label>Required Role</Label>
                  <Select value={toolForm.required_role} onValueChange={(value) => setToolForm({ ...toolForm, required_role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select required role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="high_board">High Board</SelectItem>
                      <SelectItem value="management_board">Management Board</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department (Optional)</Label>
                  <Select value={toolForm.department} onValueChange={(value) => setToolForm({ ...toolForm, department: value })}>
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
                <Button onClick={createTool} className="w-full">Add Tool</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Card key={tool.id} className="border-border group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <Settings className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <CardTitle className="text-foreground">{tool.name}</CardTitle>
                    {tool.description && (
                      <p className="text-muted-foreground mt-1 text-sm">{tool.description}</p>
                    )}
                  </div>
                </div>
                {canManageTools && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(tool)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTool(tool.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Badge className={getRoleColor(tool.required_role)}>
                    {tool.required_role.replace('_', ' ')}
                  </Badge>
                  {tool.department && (
                    <Badge className={getDepartmentColor(tool.department)}>
                      {tool.department.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={() => window.open(tool.url, '_blank')}
                  className="w-full"
                  variant="outline"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Tool
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tools.length === 0 && (
        <Card className="border-border">
          <CardContent className="text-center py-8">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No tools available</h3>
            <p className="text-muted-foreground">
              {canManageTools ? 'Add your first tool to get started.' : 'No tools have been added yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Tool Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tool</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={toolForm.name}
                onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                placeholder="Tool name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={toolForm.description}
                onChange={(e) => setToolForm({ ...toolForm, description: e.target.value })}
                placeholder="Tool description"
              />
            </div>
            <div>
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                value={toolForm.url}
                onChange={(e) => setToolForm({ ...toolForm, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label>Required Role</Label>
              <Select value={toolForm.required_role} onValueChange={(value) => setToolForm({ ...toolForm, required_role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select required role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="high_board">High Board</SelectItem>
                  <SelectItem value="management_board">Management Board</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department (Optional)</Label>
              <Select value={toolForm.department} onValueChange={(value) => setToolForm({ ...toolForm, department: value })}>
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
            <Button onClick={updateTool} className="w-full">Update Tool</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
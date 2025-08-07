import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Target, 
  Award, 
  Settings,
  LogOut,
  Bell,
  Plus,
  BookOpen,
  Lightbulb,
  BarChart3,
  Wrench
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'management_board':
        return 'bg-primary text-primary-foreground';
      case 'high_board':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const navigationItems = [
    { icon: Target, label: 'Tasks', href: '/tasks', description: 'Manage and track tasks' },
    { icon: Calendar, label: 'Calendar', href: '/calendar', description: 'Schedule and view events' },
    { icon: MessageSquare, label: 'Chat', href: '/chat', description: 'Team communication' },
    { icon: FileText, label: 'Reports', href: '/reports', description: 'Submit progress reports', roles: ['management_board', 'high_board'] },
    { icon: BookOpen, label: 'Training', href: '/training', description: 'Training assignments' },
    { icon: Lightbulb, label: 'Innovation', href: '/innovation', description: 'Submit proposals' },
    { icon: MessageSquare, label: 'Feedback', href: '/feedback', description: 'Share feedback' },
    { icon: Wrench, label: 'Tools', href: '/tools', description: 'Access resources' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics', description: 'View insights', roles: ['management_board'] },
  ];

  const visibleNavItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(profile.role)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold tedx-gradient bg-clip-text text-transparent">
                TEDxNewCairoYouth
              </h1>
              <Separator orientation="vertical" className="h-6" />
              <Badge className={getRoleBadgeColor(profile.role)}>
                {formatRole(profile.role)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    {profile.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{profile.full_name}</p>
                  <p className="text-muted-foreground">{profile.department}</p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile.full_name.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening in your TEDx journey today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="tedx-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Points</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{profile.points}</div>
              <p className="text-xs text-muted-foreground">Keep contributing!</p>
            </CardContent>
          </Card>
          
          <Card className="tedx-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 due this week</p>
            </CardContent>
          </Card>
          
          <Card className="tedx-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Next: Team meeting</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleNavItems.map((item) => (
            <Card 
              key={item.label}
              className="tedx-card hover:shadow-lg tedx-transition cursor-pointer group"
              onClick={() => navigate(item.href)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 tedx-transition">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-sm">{item.label}</CardTitle>
                <CardDescription className="text-xs">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        {(profile.role === 'management_board' || profile.role === 'high_board') && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                className="justify-start h-auto p-4" 
                variant="outline"
                onClick={() => navigate('/tasks')}
              >
                <Plus className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Create Task</div>
                  <div className="text-sm text-muted-foreground">Assign new task to team</div>
                </div>
              </Button>
              
              <Button 
                className="justify-start h-auto p-4" 
                variant="outline"
                onClick={() => navigate('/calendar')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Schedule Event</div>
                  <div className="text-sm text-muted-foreground">Add calendar event</div>
                </div>
              </Button>
              
              <Button 
                className="justify-start h-auto p-4" 
                variant="outline"
                onClick={() => navigate('/reports')}
              >
                <FileText className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Submit Report</div>
                  <div className="text-sm text-muted-foreground">Create progress report</div>
                </div>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
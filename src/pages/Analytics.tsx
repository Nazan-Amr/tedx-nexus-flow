import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, CheckCircle, Calendar, MessageSquare, TrendingUp, Award } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  completedTasks: number;
  pendingTasks: number;
  upcomingEvents: number;
  totalMessages: number;
  departmentStats: any[];
  taskStatusData: any[];
  monthlyActivity: any[];
}

export default function Analytics() {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    completedTasks: 0,
    pendingTasks: 0,
    upcomingEvents: 0,
    totalMessages: 0,
    departmentStats: [],
    taskStatusData: [],
    monthlyActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'management_board') {
      fetchAnalytics();
    }
  }, [profile]);

  const fetchAnalytics = async () => {
    try {
      // Fetch user stats
      const { data: users } = await supabase.from('profiles').select('*');
      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u.points && u.points > 0).length || 0;

      // Fetch task stats
      const { data: tasks } = await supabase.from('tasks').select('status');
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0;

      // Fetch event stats
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', new Date().toISOString());
      const upcomingEvents = events?.length || 0;

      // Fetch message stats
      const { data: messages } = await supabase.from('messages').select('id');
      const totalMessages = messages?.length || 0;

      // Department stats
      const departmentStats = [
        { name: 'Organizing Committee', value: users?.filter(u => u.department === 'organizing_committee').length || 0 },
        { name: 'Production', value: users?.filter(u => u.department === 'production').length || 0 },
        { name: 'Marketing', value: users?.filter(u => u.department === 'marketing').length || 0 },
        { name: 'Logistics', value: users?.filter(u => u.department === 'logistics').length || 0 },
        { name: 'Speakers', value: users?.filter(u => u.department === 'speakers').length || 0 }
      ].filter(dept => dept.value > 0);

      // Task status data
      const taskStatusData = [
        { name: 'Completed', value: completedTasks, color: '#10b981' },
        { name: 'In Progress', value: tasks?.filter(t => t.status === 'in_progress').length || 0, color: '#f59e0b' },
        { name: 'Pending', value: pendingTasks, color: '#6b7280' }
      ];

      // Monthly activity (mock data for demonstration)
      const monthlyActivity = [
        { month: 'Jan', tasks: 12, events: 3, messages: 145 },
        { month: 'Feb', tasks: 18, events: 5, messages: 234 },
        { month: 'Mar', tasks: 15, events: 4, messages: 189 },
        { month: 'Apr', tasks: 22, events: 6, messages: 278 },
        { month: 'May', tasks: 19, events: 7, messages: 312 },
        { month: 'Jun', tasks: 25, events: 8, messages: 298 }
      ];

      setAnalytics({
        totalUsers,
        activeUsers,
        completedTasks,
        pendingTasks,
        upcomingEvents,
        totalMessages,
        departmentStats,
        taskStatusData,
        monthlyActivity
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role !== 'management_board') {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-border">
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
            <p className="text-muted-foreground">Only management board members can view analytics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  const COLORS = ['#e11d48', '#dc2626', '#ea580c', '#d97706', '#ca8a04'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Organizational insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">{analytics.activeUsers}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                <p className="text-2xl font-bold text-foreground">{analytics.completedTasks}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold text-foreground">{analytics.pendingTasks}</p>
              </div>
              <Award className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
                <p className="text-2xl font-bold text-foreground">{analytics.upcomingEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totalMessages}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.departmentStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Task Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.taskStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#e11d48" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Monthly Activity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analytics.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="tasks" stroke="#e11d48" strokeWidth={2} />
              <Line type="monotone" dataKey="events" stroke="#dc2626" strokeWidth={2} />
              <Line type="monotone" dataKey="messages" stroke="#ea580c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm text-muted-foreground">5 tasks completed this week</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">3 events scheduled this month</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">127 messages sent today</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">2 new members joined</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Task Completion Rate</span>
                  <Badge variant="outline">
                    {analytics.completedTasks > 0 ? 
                      Math.round((analytics.completedTasks / (analytics.completedTasks + analytics.pendingTasks)) * 100) : 0}%
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all" 
                    style={{ 
                      width: `${analytics.completedTasks > 0 ? 
                        Math.round((analytics.completedTasks / (analytics.completedTasks + analytics.pendingTasks)) * 100) : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">User Engagement</span>
                  <Badge variant="outline">
                    {analytics.totalUsers > 0 ? Math.round((analytics.activeUsers / analytics.totalUsers) * 100) : 0}%
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ 
                      width: `${analytics.totalUsers > 0 ? Math.round((analytics.activeUsers / analytics.totalUsers) * 100) : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
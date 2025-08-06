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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Clock, MapPin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  department: string;
  attendees: string[];
  created_by: string;
  created_at: string;
}

export default function Calendar() {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    department: '',
    start_time: '',
    end_time: '',
    attendees: [] as string[]
  });

  useEffect(() => {
    fetchEvents();
  }, [selectedDate]);

  const fetchEvents = async () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString())
      .order('start_time', { ascending: true });
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch events', variant: 'destructive' });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.start_time || !newEvent.end_time || !user) return;

    const { error } = await supabase
      .from('calendar_events')
      .insert({
        title: newEvent.title,
        description: newEvent.description,
        department: newEvent.department || null,
        start_time: newEvent.start_time,
        end_time: newEvent.end_time,
        attendees: newEvent.attendees,
        created_by: user.id
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create event', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Event created successfully' });
      setIsCreateOpen(false);
      setNewEvent({ title: '', description: '', department: '', start_time: '', end_time: '', attendees: [] });
      fetchEvents();
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

  const canCreateEvents = profile?.role === 'management_board' || profile?.role === 'high_board';

  const todayEvents = events.filter(event => {
    const eventDate = parseISO(event.start_time);
    return format(eventDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  });

  const upcomingEvents = events.filter(event => {
    const eventDate = parseISO(event.start_time);
    return eventDate > new Date();
  }).slice(0, 5);

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
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground">Manage organizational events and meetings</p>
        </div>
        {canCreateEvents && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event description"
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Select value={newEvent.department} onValueChange={(value) => setNewEvent({ ...newEvent, department: value })}>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={createEvent} className="w-full">Create Event</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Today's Events</CardTitle>
            </CardHeader>
            <CardContent>
              {todayEvents.length > 0 ? (
                <div className="space-y-3">
                  {todayEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(event.start_time), 'HH:mm')} - {format(parseISO(event.end_time), 'HH:mm')}
                        </p>
                      </div>
                      {event.department && (
                        <Badge className={getDepartmentColor(event.department)}>
                          {event.department.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No events today</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-3 border border-border rounded-lg">
                      <h4 className="font-medium text-foreground">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(parseISO(event.start_time), 'PPP')} at {format(parseISO(event.start_time), 'HH:mm')}
                      </p>
                      {event.department && (
                        <Badge className={`${getDepartmentColor(event.department)} mt-2`}>
                          {event.department.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No upcoming events</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
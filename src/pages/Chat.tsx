import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Plus, Send, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface ChatRoom {
  id: string;
  name: string;
  department: string;
  participants: string[];
  created_at: string;
}

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
}

export default function Chat() {
  const { user, profile } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [newRoom, setNewRoom] = useState({
    name: '',
    department: '',
    participants: [] as string[]
  });

  useEffect(() => {
    fetchRooms();
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch chat rooms', variant: 'destructive' });
    } else {
      setRooms(data || []);
      if (data && data.length > 0 && !selectedRoom) {
        setSelectedRoom(data[0]);
      }
    }
    setLoading(false);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*');
    setProfiles(data || []);
  };

  const fetchMessages = async () => {
    if (!selectedRoom) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', selectedRoom.id)
      .order('created_at', { ascending: true });
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch messages', variant: 'destructive' });
    } else {
      setMessages(data || []);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedRoom) return;

    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `room_id=eq.${selectedRoom.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createRoom = async () => {
    if (!newRoom.name || !user) return;

    const { error } = await supabase
      .from('chat_rooms')
      .insert({
        name: newRoom.name,
        department: newRoom.department || null,
        participants: [...newRoom.participants, user.id]
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create chat room', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Chat room created successfully' });
      setIsCreateOpen(false);
      setNewRoom({ name: '', department: '', participants: [] });
      fetchRooms();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        room_id: selectedRoom.id,
        sender_id: user.id,
        content: newMessage,
        message_type: 'text'
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    } else {
      setNewMessage('');
    }
  };

  const getProfileName = (userId: string) => {
    const userProfile = profiles.find(p => p.user_id === userId);
    return userProfile?.full_name || 'Unknown User';
  };

  const canCreateRooms = profile?.role === 'management_board';

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chat</h1>
          <p className="text-muted-foreground">Team communication and collaboration</p>
        </div>
        {canCreateRooms && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Chat Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    placeholder="Room name"
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Select value={newRoom.department} onValueChange={(value) => setNewRoom({ ...newRoom, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organizing_committee">Organizing Committee</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="logistics">Logistics</SelectItem>
                      <SelectItem value="speakers">Speakers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createRoom} className="w-full">Create Room</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-6 h-full">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat Rooms
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full text-left p-3 hover:bg-muted transition-colors ${
                    selectedRoom?.id === room.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="font-medium text-foreground">{room.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    {room.participants.length} members
                    {room.department && (
                      <Badge variant="outline" className="text-xs">
                        {room.department.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          {selectedRoom ? (
            <Card className="border-border h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-foreground">{selectedRoom.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {message.sender_id !== user?.id && (
                          <div className="text-xs opacity-70 mb-1">
                            {getProfileName(message.sender_id)}
                          </div>
                        )}
                        <div>{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {format(new Date(message.created_at), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a chat room</h3>
                <p className="text-muted-foreground">Choose a room to start chatting</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
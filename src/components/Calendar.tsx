
import React, { useState, useEffect } from 'react';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Event {
  id: string;
  title: string;
  time: string;
  date: string;
  type: 'work' | 'personal' | 'other';
}

export const Calendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    time: '',
    date: new Date().toISOString().split('T')[0],
    type: 'personal'
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Fetch events from Supabase
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }
    
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .order('date', { ascending: true })
          .order('time', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setEvents(data.map(event => ({
            id: event.id,
            title: event.title,
            time: event.time,
            date: event.date,
            type: event.type as 'work' | 'personal' | 'other'
          })));
        }
      } catch (error: any) {
        console.error('Error fetching events:', error);
        toast({
          variant: "destructive",
          title: "Error fetching events",
          description: error.message || "Failed to load your events"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [user, toast]);
  
  const addEvent = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to add events"
      });
      return;
    }
    
    if (!newEvent.title || !newEvent.time || !newEvent.date) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: newEvent.title,
          date: newEvent.date,
          time: newEvent.time,
          type: newEvent.type,
          user_id: user.id
        })
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        const addedEvent = {
          id: data[0].id,
          title: data[0].title,
          time: data[0].time,
          date: data[0].date,
          type: data[0].type as 'work' | 'personal' | 'other'
        };
        
        setEvents(prev => {
          // Sort events by date and time
          return [...prev, addedEvent].sort((a, b) => {
            if (a.date !== b.date) {
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            }
            return a.time.localeCompare(b.time);
          });
        });
        
        toast({
          title: "Event added",
          description: `${newEvent.title} has been scheduled`
        });
      }
      
      setNewEvent({
        title: '',
        time: '',
        date: new Date().toISOString().split('T')[0],
        type: 'personal'
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error adding event:', error);
      toast({
        variant: "destructive",
        title: "Error adding event",
        description: error.message || "Failed to add your event"
      });
    }
  };
  
  const removeEvent = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setEvents(events.filter(event => event.id !== id));
      
      toast({
        title: "Event removed",
        description: "Event has been removed from your calendar"
      });
    } catch (error: any) {
      console.error('Error removing event:', error);
      toast({
        variant: "destructive",
        title: "Error removing event",
        description: error.message || "Failed to remove the event"
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'work': return 'bg-morning-blue';
      case 'personal': return 'bg-morning-purple';
      default: return 'bg-morning-orange';
    }
  };
  
  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="card-title m-0">
          <CalendarIcon className="h-5 w-5 text-morning-purple" />
          Calendar
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title">Event Title</label>
                <Input 
                  id="title" 
                  placeholder="Enter event title" 
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="date">Date</label>
                  <Input 
                    id="date" 
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="time">Time</label>
                  <Input 
                    id="time" 
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="type">Event Type</label>
                <Select 
                  value={newEvent.type} 
                  onValueChange={(value: 'work' | 'personal' | 'other') => setNewEvent({...newEvent, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={addEvent}>Add Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <ScrollArea className="h-[16rem]">
        <div className="space-y-2 pr-3">
          {loading ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground">
                {user ? "No events scheduled" : "Sign in to view your calendar"}
              </p>
            </div>
          ) : (
            events.map((event) => (
              <div 
                key={event.id} 
                className="flex items-center p-2 rounded-md border hover:bg-muted/50 group animate-enter"
              >
                <div className={`${getEventTypeColor(event.type)} w-3 h-14 rounded-full mr-3`}></div>
                <div className="flex-1">
                  <h4 className="font-medium">{event.title}</h4>
                  <div className="flex text-xs text-muted-foreground">
                    <span>{event.time}</span>
                    <span className="mx-1">•</span>
                    <span>{formatDate(event.date)}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100" 
                  onClick={() => removeEvent(event.id)}
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

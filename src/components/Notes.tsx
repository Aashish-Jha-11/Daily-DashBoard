
import React, { useState, useEffect } from 'react';
import { StickyNote, Save, Plus, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export const Notes = () => {
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notesList, setNotesList] = useState<{id: string, content: string, updated_at: string}[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch notes from Supabase when user changes
  useEffect(() => {
    if (!user) {
      setNotes('');
      setSavedNotes('');
      setNotesList([]);
      setActiveNoteId(null);
      setLoading(false);
      return;
    }
    
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('id, content, updated_at')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setNotesList(data);
        // Set the most recent note as active
        setActiveNoteId(data[0].id);
        setNotes(data[0].content || '');
        setSavedNotes(data[0].content || '');
      } else {
        // No notes found
        setNotesList([]);
        setNotes('');
        setSavedNotes('');
        setActiveNoteId(null);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        variant: "destructive", 
        title: "Failed to load notes", 
        description: "Your notes couldn't be retrieved. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to save notes"
      });
      return;
    }
    
    setSaving(true);
    
    try {
      if (activeNoteId) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({ 
            content: notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeNoteId);
          
        if (error) throw error;
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('notes')
          .insert({ 
            content: notes,
            user_id: user.id
          })
          .select('id');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setActiveNoteId(data[0].id);
        }
      }
      
      // Refresh notes list
      await fetchNotes();
      
      setSavedNotes(notes);
      toast({
        title: "Notes saved",
        description: "Your note has been saved successfully",
        className: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
      });
    } catch (error: any) {
      console.error('Error saving notes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save your notes"
      });
    } finally {
      setSaving(false);
    }
  };

  const createNewNote = () => {
    setActiveNoteId(null);
    setNotes('');
    setSavedNotes('');
  };

  const selectNote = (id: string, content: string) => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Do you want to discard them?')) {
        setActiveNoteId(id);
        setNotes(content);
        setSavedNotes(content);
      }
    } else {
      setActiveNoteId(id);
      setNotes(content);
      setSavedNotes(content);
    }
  };

  const deleteNote = async (id: string) => {
    if (!user || !id) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: "Note deleted",
          description: "Your note has been deleted successfully"
        });
        
        // If the active note is deleted, reset the form
        if (id === activeNoteId) {
          setActiveNoteId(null);
          setNotes('');
          setSavedNotes('');
        }
        
        // Refresh notes list
        await fetchNotes();
      } catch (error: any) {
        console.error('Error deleting note:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to delete your note"
        });
      }
    }
  };

  const hasChanges = notes !== savedNotes;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-card bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-800/30 shadow-lg dark:shadow-indigo-900/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-cyan-400" />
          <h3 className="card-title text-xl m-0 font-bold text-white">Notes</h3>
        </div>
        {hasChanges && (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-300 border-yellow-500/30 animate-pulse">
            Unsaved changes
          </Badge>
        )}
      </div>
      
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-[12rem] w-full" />
          <div className="flex justify-end">
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Notes List Sidebar */}
          <div className="md:col-span-1 space-y-2 p-2 bg-slate-900/50 rounded-md border border-slate-800/50 max-h-[20rem] overflow-auto">
            <Button 
              onClick={createNewNote} 
              className="w-full bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-700 dark:hover:bg-cyan-600 text-white flex items-center gap-1.5 mb-2"
              size="sm"
              disabled={!user}
            >
              <Plus className="h-4 w-4" />
              New Note
            </Button>
            
            <div className="space-y-1.5">
              {notesList.length > 0 ? (
                notesList.map(note => (
                  <div 
                    key={note.id}
                    onClick={() => selectNote(note.id, note.content)}
                    className={`p-2 rounded-md cursor-pointer transition-all text-left text-sm flex items-start justify-between group ${
                      note.id === activeNoteId 
                        ? 'bg-cyan-600/20 border border-cyan-500/30' 
                        : 'bg-slate-800/50 hover:bg-slate-700/50 border border-transparent'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <div className="truncate text-slate-200">
                        {note.content ? note.content.substring(0, 30) : 'Empty note'}
                        {note.content && note.content.length > 30 ? '...' : ''}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {formatDate(note.updated_at)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-sm">
                  {user ? 'No notes yet. Create one!' : 'Sign in to create notes'}
                </div>
              )}
            </div>
          </div>
          
          {/* Note Editor */}
          <div className="md:col-span-3">
            <Textarea
              placeholder={user ? "Write your notes here..." : "Sign in to save your notes"}
              className="min-h-[12rem] resize-none focus-visible:ring-cyan-500 dark:focus-visible:ring-cyan-700 bg-slate-900/50 border border-slate-700/50 text-white"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!user}
            />
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={saveNotes} 
                disabled={saving || !hasChanges || !user}
                className="bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-700 dark:hover:bg-cyan-600 text-white flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

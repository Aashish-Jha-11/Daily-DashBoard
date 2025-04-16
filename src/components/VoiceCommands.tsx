
import { useEffect } from 'react';
import voiceCommandManager from '@/utils/voiceCommandUtils';
import { useToast } from '@/components/ui/use-toast';

interface VoiceCommandsProps {
  onWeatherCommand: () => void;
  onNewsCommand: () => void;
  onCalendarCommand: () => void;
  onNotesCommand: () => void;
  onMotivationCommand: () => void;
  onToggleDarkMode: () => void;
}

export const VoiceCommands: React.FC<VoiceCommandsProps> = ({
  onWeatherCommand,
  onNewsCommand,
  onCalendarCommand,
  onNotesCommand,
  onMotivationCommand,
  onToggleDarkMode
}) => {
  const { toast } = useToast();
  
  useEffect(() => {
    if (!voiceCommandManager) return;
    
    // Register commands
    voiceCommandManager.registerCommand(
      'weather',
      ['show weather', 'weather', 'check weather'],
      () => {
        onWeatherCommand();
        toast({ description: "Showing weather information" });
      }
    );
    
    voiceCommandManager.registerCommand(
      'news',
      ['show news', 'news', 'latest news'],
      () => {
        onNewsCommand();
        toast({ description: "Showing latest news" });
      }
    );
    
    voiceCommandManager.registerCommand(
      'calendar',
      ['show calendar', 'calendar', 'my schedule', 'my events'],
      () => {
        onCalendarCommand();
        toast({ description: "Showing your calendar" });
      }
    );
    
    voiceCommandManager.registerCommand(
      'notes',
      ['show notes', 'my notes', 'notes'],
      () => {
        onNotesCommand();
        toast({ description: "Showing your notes" });
      }
    );
    
    voiceCommandManager.registerCommand(
      'motivation',
      ['show motivation', 'motivation', 'inspire me'],
      () => {
        onMotivationCommand();
        toast({ description: "Showing motivation" });
      }
    );
    
    voiceCommandManager.registerCommand(
      'darkMode',
      ['dark mode', 'toggle dark mode', 'switch theme', 'light mode'],
      () => {
        onToggleDarkMode();
        toast({ description: "Toggling dark mode" });
      }
    );
    
    return () => {
      // Clean up
      if (voiceCommandManager.isActive()) {
        voiceCommandManager.stop();
      }
    };
  }, [
    onWeatherCommand, 
    onNewsCommand, 
    onCalendarCommand, 
    onNotesCommand, 
    onMotivationCommand, 
    onToggleDarkMode,
    toast
  ]);
  
  return null; // This is just a logic component, no UI
};

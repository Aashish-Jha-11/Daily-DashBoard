
import React, { useRef, useState } from 'react';
import { Weather } from './Weather';
import { News } from './News';
import { Calendar } from './Calendar';
import { Notes } from './Notes';
import { Motivation } from './Motivation';
import { VoiceCommands } from './VoiceCommands';
import { Header } from './Header';

export const Dashboard: React.FC = () => {
  const weatherRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const motivationRef = useRef<HTMLDivElement>(null);
  
  const [themeToggle, setThemeToggle] = useState<HTMLButtonElement | null>(null);
  
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const handleToggleDarkMode = () => {
    if (themeToggle) {
      themeToggle.click();
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 dark:from-gray-950 dark:to-gray-900 pb-16">
      <Header />
      
      <VoiceCommands
        onWeatherCommand={() => scrollToSection(weatherRef)}
        onNewsCommand={() => scrollToSection(newsRef)}
        onCalendarCommand={() => scrollToSection(calendarRef)}
        onNotesCommand={() => scrollToSection(notesRef)}
        onMotivationCommand={() => scrollToSection(motivationRef)}
        onToggleDarkMode={handleToggleDarkMode}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div ref={weatherRef} className="animate-slide-in" style={{animationDelay: '0.1s'}}>
          <Weather defaultCity="Indore" />
        </div>
        
        <div ref={motivationRef} className="animate-slide-in" style={{animationDelay: '0.2s'}}>
          <Motivation />
        </div>
        
        <div ref={calendarRef} className="animate-slide-in" style={{animationDelay: '0.3s'}}>
          <Calendar />
        </div>
        
        <div ref={notesRef} className="animate-slide-in" style={{animationDelay: '0.4s'}}>
          <Notes />
        </div>
        
        <div ref={newsRef} className="md:col-span-2 animate-slide-in" style={{animationDelay: '0.5s'}}>
          <News />
        </div>
      </div>
    </div>
  );
};

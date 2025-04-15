
import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Quote {
  text: string;
  author: string;
}

const motivationalQuotes: Quote[] = [
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" }
];

const productivityTips: string[] = [
  "Break large tasks into smaller, manageable steps.",
  "Use the Pomodoro Technique: 25 minutes of focus, then a 5-minute break.",
  "Eliminate distractions by turning off notifications.",
  "Start your day by completing your most important task.",
  "Take regular breaks to maintain mental clarity.",
  "Stay hydrated throughout the day.",
  "Plan tomorrow's tasks before ending today's work.",
  "Keep a clean and organized workspace.",
  "Exercise regularly to boost energy and mental sharpness.",
  "Practice mindfulness to improve focus and reduce stress."
];

export const Motivation: React.FC = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [tip, setTip] = useState<string>('');
  
  const generateRandomMotivation = () => {
    const randomQuoteIndex = Math.floor(Math.random() * motivationalQuotes.length);
    const randomTipIndex = Math.floor(Math.random() * productivityTips.length);
    
    setQuote(motivationalQuotes[randomQuoteIndex]);
    setTip(productivityTips[randomTipIndex]);
  };
  
  useEffect(() => {
    generateRandomMotivation();
  }, []);
  
  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="card-title m-0">
          <Sparkles className="h-5 w-5 text-morning-teal" />
          Daily Inspiration
        </h3>
        <Button variant="ghost" size="sm" onClick={generateRandomMotivation}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      
      <div className="space-y-4">
        {quote && (
          <div className="bg-gradient-to-r from-primary/10 to-morning-purple/10 p-4 rounded-lg animate-fade-in">
            <p className="text-lg italic">"{quote.text}"</p>
            <p className="text-sm text-right mt-2">— {quote.author}</p>
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-medium mb-2">Today's Productivity Tip</h4>
          <p className="text-muted-foreground animate-slide-in">{tip}</p>
        </div>
      </div>
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, Filter, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsItem {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsItem[];
}

export const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchNews();
  }, [category]);
  
  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('indian-news');
      
      if (error) throw error;
      
      const newsResponse = data as NewsResponse;
      
      if (newsResponse && newsResponse.articles) {
        setNews(newsResponse.articles);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast({
        variant: "destructive",
        title: "Failed to load news",
        description: "Could not fetch the latest headlines. Please try again later."
      });
      
      // Fallback to mock data if error
      const mockNews = [
        {
          source: { id: 'mock1', name: 'Indian News' },
          author: 'Reporter',
          title: 'Latest Headlines from India',
          description: 'Important news from across India',
          url: 'https://example.com/news/1',
          urlToImage: null,
          publishedAt: new Date().toISOString(),
          content: 'Content of the news article'
        },
        {
          source: { id: 'mock2', name: 'Tech News India' },
          author: 'Tech Reporter',
          title: 'Technology Updates from Indian Market',
          description: 'Latest tech trends in India',
          url: 'https://example.com/news/2',
          urlToImage: null,
          publishedAt: new Date().toISOString(),
          content: 'Content of the technology news'
        }
      ];
      setNews(mockNews);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  const getCategories = () => ['general', 'technology', 'business', 'health', 'entertainment', 'sports', 'science'];

  return (
    <div className="dashboard-card bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Newspaper className="h-6 w-6 text-morning-blue" />
          <h3 className="card-title text-xl m-0 font-bold">Indian News</h3>
          <Badge variant="outline" className="ml-2 bg-morning-blue/10 text-morning-blue dark:bg-morning-blue/20">
            {news.length} Headlines
          </Badge>
        </div>
        
        <div className="flex space-x-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px] h-8 bg-white/80 dark:bg-gray-800/80 border-morning-blue/20 hover:border-morning-blue/40">
              <div className="flex items-center space-x-1">
                <Filter className="h-3.5 w-3.5 text-morning-blue/70" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {getCategories().map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-white/80 dark:bg-gray-800/80 border-morning-blue/20 hover:border-morning-blue/40" 
            onClick={() => fetchNews()}
          >
            <RefreshCw className="h-3.5 w-3.5 text-morning-blue/70" />
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="border-b pb-4 last:border-0">
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[18rem] pr-4">
          <div className="space-y-5">
            {news.map((item, index) => (
              <div 
                key={index} 
                className="border-b pb-4 last:border-0 animate-enter hover:bg-blue-50/50 dark:hover:bg-gray-800/50 p-3 rounded-md -mx-3 transition-colors"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 ml-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-full bg-white/80 dark:bg-gray-700/60 hover:bg-morning-blue/10 dark:hover:bg-morning-blue/20"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                )}
                <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-morning-blue dark:text-morning-blue/80">{item.source.name}</span>
                  <span>{formatDate(item.publishedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

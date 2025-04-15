import { supabase } from '@/integrations/supabase/client';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

export async function getIndianNews(): Promise<NewsArticle[]> {
  try {
    const { data, error } = await supabase.functions.invoke('indian-news');
    
    if (error) {
      console.error('Error calling Indian news edge function:', error);
      return [];
    }
    
    if (!data || !data.articles) {
      console.error('Invalid response from Indian news edge function:', data);
      return [];
    }
    
    // Process and return the news data
    return data.articles.map((article: any) => ({
      title: article.title || 'No title',
      description: article.description || 'No description available',
      url: article.url || '#',
      urlToImage: article.urlToImage || '/placeholder.svg',
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: {
        name: article.source?.name || 'Unknown Source'
      }
    }));
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return [];
  }
}

export async function getTopHeadlines(category = 'general'): Promise<NewsArticle[]> {
  try {
    const apiKey = import.meta.env.VITE_NEWS_API_KEY || '';
    const apiUrl = import.meta.env.VITE_NEWS_API_URL || '';
    
    const response = await fetch(`${apiUrl}?country=us&category=${category}&apiKey=${apiKey}`);
    const data = await response.json();
    
    if (!response.ok || !data.articles) {
      throw new Error(data.message || 'Failed to fetch headlines');
    }
    
    return data.articles.map((article: any) => ({
      title: article.title || 'No title',
      description: article.description || 'No description available',
      url: article.url || '#',
      urlToImage: article.urlToImage || '/placeholder.svg',
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: {
        name: article.source?.name || 'Unknown Source'
      }
    }));
  } catch (error) {
    console.error('Failed to fetch headlines:', error);
    return [];
  }
}

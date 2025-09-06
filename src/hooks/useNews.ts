'use client';

import { useState, useEffect, useCallback } from 'react';
import { NewsArticle, NewsCategory } from '@/lib/newsTypes';

interface UseNewsProps {
  category?: NewsCategory;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseNewsReturn {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  refreshNews: () => Promise<void>;
  searchNews: (query: string) => Promise<void>;
  clearError: () => void;
}

export function useNews({ 
  category, 
  autoRefresh = false, 
  refreshInterval = 300000 // 5 minutes
}: UseNewsProps = {}): UseNewsReturn {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (searchQuery?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (searchQuery) params.set('query', searchQuery);
      params.set('limit', '20');

      const endpoint = searchQuery 
        ? `/api/news/search?${params}`
        : `/api/news/fetch?${params}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch news');
      }

      setArticles(data.articles || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  const refreshNews = useCallback(async () => {
    await fetchNews();
  }, [fetchNews]);

  const searchNews = useCallback(async (query: string) => {
    await fetchNews(query);
  }, [fetchNews]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNews();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchNews]);

  return {
    articles,
    loading,
    error,
    refreshNews,
    searchNews,
    clearError
  };
}
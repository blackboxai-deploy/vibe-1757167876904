'use client';

import { useState } from 'react';
import { useNews } from '@/hooks/useNews';
import { NewsCard } from '@/components/NewsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NewsArticle, NewsCategory } from '@/lib/newsTypes';

interface NewsListProps {
  category?: NewsCategory;
  title?: string;
  showSearch?: boolean;
  autoRefresh?: boolean;
}

export function NewsList({ 
  category, 
  title, 
  showSearch = false, 
  autoRefresh = false 
}: NewsListProps) {
  const { articles, loading, error, refreshNews, searchNews, clearError } = useNews({
    category,
    autoRefresh,
    refreshInterval: 300000 // 5 minutes
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      await searchNews(searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSummarize = async (article: NewsArticle) => {
    try {
      const response = await fetch('/api/news/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId: article.id
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update article with summary (in a real app, you'd update state)
        console.log('Summary:', data.summary);
        // For now, just open a simple alert with the summary
        alert(`Summary: ${data.summary.summary}`);
      } else {
        throw new Error(data.error || 'Failed to summarize article');
      }
    } catch (error) {
      console.error('Error summarizing article:', error);
      alert('Failed to summarize article. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            {title || `${category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Latest'} News`}
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={refreshNews}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
        
        {category && (
          <p className="text-muted-foreground mt-2">
            Latest Malaysian {category} news and updates
          </p>
        )}
      </div>

      {/* Search */}
      {showSearch && (
        <div className="mb-6">
          <div className="flex gap-2 max-w-md">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search news..."
              disabled={isSearching}
            />
            <Button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && articles.length === 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Articles */}
      {articles.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onSummarize={handleSummarize}
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && articles.length === 0 && !error && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No articles found
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery ? 'Try a different search term' : 'Check back later for updates'}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              refreshNews();
            }}>
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="fixed bottom-4 right-4">
          <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs">
            Auto-refreshing every 5 minutes
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { NewsArticle } from '@/lib/newsTypes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NewsCardProps {
  article: NewsArticle;
  compact?: boolean;
  showSummary?: boolean;
  onSummarize?: (article: NewsArticle) => void;
}

export function NewsCard({ article, compact = false, showSummary = false, onSummarize }: NewsCardProps) {
  const [summarizing, setSummarizing] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-MY', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'politics':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'economy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'social':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleSummarize = async () => {
    if (!onSummarize) return;
    
    setSummarizing(true);
    try {
      await onSummarize(article);
    } finally {
      setSummarizing(false);
    }
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-3">
          <div className="flex gap-3">
            {article.urlToImage && (
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-16 h-16 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 text-foreground">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className={`text-xs ${getCategoryColor(article.category)}`}>
                  {article.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(article.publishedAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(article.url, '_blank')}
              className="text-xs h-7 flex-1"
            >
              Read Article
            </Button>
            {onSummarize && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSummarize}
                disabled={summarizing}
                className="text-xs h-7 flex-1"
              >
                {summarizing ? 'Summarizing...' : 'Summarize'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg leading-snug text-foreground">
              {article.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className={getCategoryColor(article.category)}>
                {article.category}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {article.source.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDate(article.publishedAt)}
              </span>
            </div>
          </div>
          {article.urlToImage && (
            <img
              src={article.urlToImage}
              alt={article.title}
              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {article.description && (
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            {article.description}
          </CardDescription>
        )}

        {showSummary && article.summary && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <h5 className="font-medium text-sm text-foreground mb-2">AI Summary:</h5>
            <p className="text-sm text-muted-foreground">{article.summary}</p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => window.open(article.url, '_blank')}
            className="flex-1"
          >
            Read Full Article
          </Button>
          {onSummarize && !showSummary && (
            <Button
              variant="outline"
              onClick={handleSummarize}
              disabled={summarizing}
              className="flex-1"
            >
              {summarizing ? 'Summarizing...' : 'Get Summary'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
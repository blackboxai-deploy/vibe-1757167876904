import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';
import { newsApiService } from '@/lib/newsApi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleUrl, articleId, maxLength = 200 } = body;

    if (!articleUrl && !articleId) {
      return NextResponse.json(
        { error: 'Either articleUrl or articleId is required' },
        { status: 400 }
      );
    }

    let article;

    if (articleId) {
      // Try to find article in cache or recent fetch
      const latestNews = await newsApiService.getLatestNews(50);
      article = latestNews.find(a => a.id === articleId);
      
      if (!article) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }
    } else {
      // Create a temporary article object for URL-based summarization
      article = {
        id: 'temp-' + Date.now(),
        title: 'Article to Summarize',
        description: 'Article content from provided URL',
        url: articleUrl,
        publishedAt: new Date().toISOString(),
        source: { id: 'external', name: 'External Source' },
        category: 'general' as const
      };
    }

    const summary = await aiService.summarizeArticle(article, maxLength);

    return NextResponse.json({
      summary,
      article: {
        id: article.id,
        title: article.title,
        url: article.url,
        source: article.source.name
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Article summarization API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to summarize article',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Article Summarization API',
    usage: {
      method: 'POST',
      parameters: {
        articleUrl: 'URL of the article to summarize (optional)',
        articleId: 'ID of cached article to summarize (optional)', 
        maxLength: 'Maximum length of summary (default: 200)'
      },
      note: 'Either articleUrl or articleId is required'
    }
  });
}
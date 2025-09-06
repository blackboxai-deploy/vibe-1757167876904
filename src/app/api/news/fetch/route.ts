import { NextRequest, NextResponse } from 'next/server';
import { newsApiService } from '@/lib/newsApi';
import { NewsCategory } from '@/lib/newsTypes';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as NewsCategory | null;
    const limit = parseInt(searchParams.get('limit') || '20');
    const query = searchParams.get('query');

    let articles;

    if (query) {
      // Search for specific query
      articles = await newsApiService.searchNews(query, category || undefined);
    } else if (category && category !== 'general') {
      // Get news by category
      articles = await newsApiService.getNewsByCategory(category);
    } else {
      // Get latest news
      articles = await newsApiService.getLatestNews(limit);
    }

    return NextResponse.json({
      articles: articles.slice(0, limit),
      total: articles.length,
      timestamp: new Date().toISOString(),
      category: category || 'all',
      query: query || null
    });

  } catch (error) {
    console.error('News fetch API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch news',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch news.' },
    { status: 405 }
  );
}
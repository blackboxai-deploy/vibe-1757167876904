import { NextRequest, NextResponse } from 'next/server';
import { newsApiService } from '@/lib/newsApi';
import { NewsCategory } from '@/lib/newsTypes';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query');
    const category = searchParams.get('category') as NewsCategory | null;
    const limit = parseInt(searchParams.get('limit') || '15');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const articles = await newsApiService.searchNews(
      query,
      category || undefined
    );

    return NextResponse.json({
      articles: articles.slice(0, limit),
      total: articles.length,
      query,
      category: category || 'all',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('News search API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to search news',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to search news.' },
    { status: 405 }
  );
}
import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';
import { newsApiService } from '@/lib/newsApi';
import { NewsArticle } from '@/lib/newsTypes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, includeNews = false, newsQuery } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    let contextArticles: NewsArticle[] = [];

    // Fetch relevant news if requested
    if (includeNews && newsQuery) {
      try {
        contextArticles = await newsApiService.searchNews(newsQuery);
        contextArticles = contextArticles.slice(0, 5); // Limit to 5 most relevant articles
      } catch (newsError) {
        console.error('Error fetching news context:', newsError);
        // Continue without news context
      }
    }

    // Get AI response
    const aiResponse = await aiService.sendChatMessage(
      messages,
      contextArticles.length > 0 ? { articles: contextArticles, userQuery: newsQuery } : undefined
    );

    return NextResponse.json({
      response: aiResponse,
      contextArticles: contextArticles.length > 0 ? contextArticles : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Malaysia News Chatbot API',
    endpoints: {
      chat: 'POST /api/chat - Send chat messages',
      news: {
        fetch: 'GET /api/news/fetch - Fetch latest news',
        search: 'GET /api/news/search - Search news',
        summarize: 'POST /api/news/summarize - Summarize articles'
      }
    }
  });
}
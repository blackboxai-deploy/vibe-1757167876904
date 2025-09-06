// Core types for the Malaysia news chatbot

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: NewsSource;
  category: NewsCategory;
  author?: string;
  summary?: string;
}

export interface NewsSource {
  id: string;
  name: string;
  url?: string;
}

export type NewsCategory = 'politics' | 'economy' | 'social' | 'general';

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  newsArticles?: NewsArticle[];
  type?: 'text' | 'news' | 'summary';
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface NewsSearchParams {
  query?: string;
  category?: NewsCategory;
  sources?: string[];
  from?: string;
  to?: string;
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
  pageSize?: number;
  page?: number;
}

export interface SummarizeRequest {
  articleUrl: string;
  maxLength?: number;
  focusPoints?: string[];
}

export interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  category: NewsCategory;
}

export interface NewsError {
  code: string;
  message: string;
  details?: any;
}

// Malaysian news sources configuration
export const MALAYSIAN_NEWS_SOURCES = [
  {
    id: 'the-star',
    name: 'The Star',
    url: 'https://www.thestar.com.my',
    rssFeeds: {
      general: 'https://www.thestar.com.my/news/rss',
      politics: 'https://www.thestar.com.my/news/nation/rss',
      economy: 'https://www.thestar.com.my/business/rss',
    }
  },
  {
    id: 'nst',
    name: 'New Straits Times',
    url: 'https://www.nst.com.my',
    rssFeeds: {
      general: 'https://www.nst.com.my/rss',
      politics: 'https://www.nst.com.my/news/politics/rss',
      economy: 'https://www.nst.com.my/business/rss',
    }
  },
  {
    id: 'malaymail',
    name: 'Malay Mail',
    url: 'https://www.malaymail.com',
    rssFeeds: {
      general: 'https://www.malaymail.com/rss',
      politics: 'https://www.malaymail.com/news/politics/rss',
      economy: 'https://www.malaymail.com/news/money/rss',
    }
  }
];

export const NEWS_CATEGORIES: { [key in NewsCategory]: string } = {
  politics: 'Politics',
  economy: 'Economy',
  social: 'Social Issues',
  general: 'General News'
};
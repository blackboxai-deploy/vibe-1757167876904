// News API service for fetching Malaysian news from multiple sources

import { NewsArticle, NewsApiResponse, NewsSearchParams, NewsCategory } from './newsTypes';

export class NewsAPIService {
  private readonly newsApiKey = typeof window === 'undefined' ? 'demo_key' : 'demo_key';
  private readonly newsApiBaseUrl = 'https://newsapi.org/v2';

  // Cache for storing fetched news
  private newsCache = new Map<string, { data: NewsArticle[]; timestamp: number }>();
  private cacheExpiry = 10 * 60 * 1000; // 10 minutes

  private getCacheKey(params: NewsSearchParams): string {
    return JSON.stringify(params);
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheExpiry;
  }

  async fetchMalaysianNews(params: NewsSearchParams = {}): Promise<NewsArticle[]> {
    const cacheKey = this.getCacheKey(params);
    const cached = this.newsCache.get(cacheKey);

    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const articles = await this.fetchFromNewsAPI(params);
      
      // Cache the results
      this.newsCache.set(cacheKey, {
        data: articles,
        timestamp: Date.now()
      });

      return articles;
    } catch (error) {
      console.error('Error fetching Malaysian news:', error);
      
      // Return cached data if available, even if expired
      if (cached) {
        return cached.data;
      }
      
      // Return mock data if no cache available
      return this.getMockNews(params.category);
    }
  }

  private async fetchFromNewsAPI(params: NewsSearchParams): Promise<NewsArticle[]> {
    const searchParams = new URLSearchParams({
      country: 'my', // Malaysia country code
      apiKey: this.newsApiKey,
      pageSize: (params.pageSize || 20).toString(),
      page: (params.page || 1).toString(),
      sortBy: params.sortBy || 'publishedAt'
    });

    // Add category if specified
    if (params.category && params.category !== 'general') {
      if (params.category === 'politics') {
        searchParams.set('category', 'general');
        searchParams.set('q', 'Malaysia politics government parliament');
      } else if (params.category === 'economy') {
        searchParams.set('category', 'business');
        searchParams.set('q', 'Malaysia economy business finance');
      } else if (params.category === 'social') {
        searchParams.set('category', 'general');
        searchParams.set('q', 'Malaysia social society community');
      }
    }

    // Add custom query if provided
    if (params.query) {
      const existingQ = searchParams.get('q');
      searchParams.set('q', existingQ ? `${existingQ} ${params.query}` : `Malaysia ${params.query}`);
    }

    // Add date filters if provided
    if (params.from) searchParams.set('from', params.from);
    if (params.to) searchParams.set('to', params.to);

    const response = await fetch(`${this.newsApiBaseUrl}/top-headlines?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }

    const data: NewsApiResponse = await response.json();
    
    return data.articles.map(article => ({
      id: this.generateArticleId(article.url),
      title: article.title,
      description: article.description || '',
      content: article.content,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: {
        id: article.source.id || 'unknown',
        name: article.source.name || 'Unknown Source'
      },
      category: this.inferCategory(article.title, article.description),
      author: article.author
    }));
  }

  private generateArticleId(url: string): string {
    // Simple hash function for generating article IDs
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).slice(0, 10);
  }

  private inferCategory(title: string, description: string): NewsCategory {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('politic') || text.includes('government') || text.includes('parliament') || 
        text.includes('minister') || text.includes('election') || text.includes('policy')) {
      return 'politics';
    }
    
    if (text.includes('economic') || text.includes('business') || text.includes('finance') || 
        text.includes('market') || text.includes('trade') || text.includes('ringgit')) {
      return 'economy';
    }
    
    if (text.includes('social') || text.includes('community') || text.includes('society') || 
        text.includes('education') || text.includes('health') || text.includes('culture')) {
      return 'social';
    }
    
    return 'general';
  }

  async searchNews(query: string, category?: NewsCategory): Promise<NewsArticle[]> {
    return this.fetchMalaysianNews({
      query,
      category,
      sortBy: 'relevancy',
      pageSize: 15
    });
  }

  async getNewsByCategory(category: NewsCategory): Promise<NewsArticle[]> {
    return this.fetchMalaysianNews({
      category,
      pageSize: 20,
      sortBy: 'publishedAt'
    });
  }

  async getLatestNews(limit = 10): Promise<NewsArticle[]> {
    const articles = await this.fetchMalaysianNews({
      pageSize: limit,
      sortBy: 'publishedAt'
    });
    
    return articles.slice(0, limit);
  }

  private getMockNews(category?: NewsCategory): NewsArticle[] {
    const baseArticles = [
      {
        id: 'mock-1',
        title: 'Malaysia Announces New Economic Recovery Plan',
        description: 'The Malaysian government unveils a comprehensive economic recovery plan to boost post-pandemic growth.',
        url: 'https://example.com/article-1',
        urlToImage: 'https://placehold.co/600x400?text=Malaysia+Economic+Recovery+Plan+Government+Building',
        publishedAt: new Date().toISOString(),
        source: { id: 'mock-source', name: 'Malaysia Today' },
        category: 'economy' as NewsCategory,
        author: 'Economic Reporter'
      },
      {
        id: 'mock-2', 
        title: 'Parliament Debates New Healthcare Reform Bill',
        description: 'Heated discussions in Parliament as lawmakers examine proposed healthcare system improvements.',
        url: 'https://example.com/article-2',
        urlToImage: 'https://placehold.co/600x400?text=Malaysian+Parliament+Building+Healthcare+Reform+Debate',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { id: 'mock-source-2', name: 'The Malaysian' },
        category: 'politics' as NewsCategory,
        author: 'Political Correspondent'
      },
      {
        id: 'mock-3',
        title: 'Community Initiative Addresses Urban Housing Crisis',
        description: 'Local communities in Kuala Lumpur launch innovative programs to tackle affordable housing shortage.',
        url: 'https://example.com/article-3',
        urlToImage: 'https://placehold.co/600x400?text=Kuala+Lumpur+Urban+Housing+Community+Initiative',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { id: 'mock-source-3', name: 'Community News' },
        category: 'social' as NewsCategory,
        author: 'Social Reporter'
      },
      {
        id: 'mock-4',
        title: 'Tech Sector Shows Strong Growth in Q4',
        description: 'Malaysian technology companies report record profits as digital transformation accelerates.',
        url: 'https://example.com/article-4',
        urlToImage: 'https://placehold.co/600x400?text=Malaysian+Technology+Sector+Growth+Digital+Office',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { id: 'mock-source-4', name: 'Tech Malaysia' },
        category: 'economy' as NewsCategory,
        author: 'Tech Analyst'
      }
    ];

    if (!category) return baseArticles;
    return baseArticles.filter(article => article.category === category);
  }

  clearCache(): void {
    this.newsCache.clear();
  }
}

export const newsApiService = new NewsAPIService();
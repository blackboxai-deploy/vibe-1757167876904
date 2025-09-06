// AI service for news chatbot using OpenRouter with Claude Sonnet-4

import { ChatMessage, NewsArticle, SummarizeResponse, NewsCategory } from './newsTypes';

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIService {
  private readonly apiEndpoint = 'https://oi-server.onrender.com/chat/completions';
  private readonly model = 'openrouter/anthropic/claude-sonnet-4';
  private readonly headers = {
    'customerId': 'mohammadshahrilizwaniii@gmail.com',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  };

  private readonly systemPrompt = `You are a knowledgeable Malaysian news assistant and chatbot. Your role is to:

1. Provide helpful information about current events in Malaysia
2. Summarize Malaysian news articles clearly and concisely
3. Answer questions about Malaysian politics, economy, and social issues
4. Engage in natural conversation about Malaysian current affairs
5. Always provide accurate, unbiased, and well-informed responses

Guidelines:
- Focus on Malaysian context and perspectives
- Provide balanced viewpoints on political and social issues
- Use clear, accessible language for all users
- When summarizing articles, highlight key points and implications
- If you don't have current information, clearly state this limitation
- Encourage users to verify important information from official sources

You should be conversational, helpful, and informative while maintaining journalistic objectivity.`;

  async sendChatMessage(
    messages: ChatMessage[],
    context?: { articles?: NewsArticle[]; userQuery?: string }
  ): Promise<string> {
    try {
      const aiMessages: AIMessage[] = [
        { role: 'system', content: this.systemPrompt }
      ];

      // Add context if provided
      if (context?.articles && context.articles.length > 0) {
        const articlesContext = context.articles.map(article => 
          `Title: ${article.title}\nDescription: ${article.description}\nSource: ${article.source.name}\nPublished: ${article.publishedAt}\nURL: ${article.url}`
        ).join('\n\n');
        
        aiMessages.push({
          role: 'system',
          content: `Here are some relevant Malaysian news articles for context:\n\n${articlesContext}`
        });
      }

      // Convert chat messages to AI format
      messages.forEach(msg => {
        aiMessages.push({
          role: msg.role,
          content: msg.content
        });
      });

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: this.model,
          messages: aiMessages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status} ${response.statusText}`);
      }

      const data: AIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  async summarizeArticle(article: NewsArticle, maxLength = 200): Promise<SummarizeResponse> {
    try {
      const prompt = `Please provide a concise summary of this Malaysian news article:

Title: ${article.title}
Description: ${article.description}
Source: ${article.source.name}
Published: ${article.publishedAt}
${article.content ? `Content: ${article.content.slice(0, 2000)}` : ''}

Please provide:
1. A summary in ${maxLength} words or less
2. 3-5 key points
3. The overall sentiment (positive, negative, or neutral)
4. The main category this falls under (politics, economy, social, or general)

Format your response as JSON with the following structure:
{
  "summary": "...",
  "keyPoints": ["...", "...", "..."],
  "sentiment": "positive|negative|neutral",
  "category": "politics|economy|social|general"
}`;

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a professional news summarizer specializing in Malaysian news. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status} ${response.statusText}`);
      }

      const data: AIResponse = await response.json();
      const content = data.choices[0]?.message?.content || '{}';
      
      try {
        const parsed = JSON.parse(content);
        return {
          summary: parsed.summary || 'Summary not available',
          keyPoints: parsed.keyPoints || [],
          sentiment: parsed.sentiment || 'neutral',
          category: parsed.category || 'general'
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          summary: content.length > maxLength ? content.slice(0, maxLength) + '...' : content,
          keyPoints: [],
          sentiment: 'neutral',
          category: 'general'
        };
      }
    } catch (error) {
      console.error('Article Summarization Error:', error);
      throw new Error('Failed to summarize article. Please try again.');
    }
  }

  async categorizeNews(articles: NewsArticle[]): Promise<NewsArticle[]> {
    try {
      const categorized = await Promise.all(
        articles.map(async (article) => {
          if (article.category !== 'general') return article;

          const prompt = `Categorize this Malaysian news article into one of these categories: politics, economy, social, general

Title: ${article.title}
Description: ${article.description}

Respond with only one word: politics, economy, social, or general`;

          const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
              model: this.model,
              messages: [
                { role: 'system', content: 'You are a news categorization expert for Malaysian news. Respond with only the category name.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.1,
              max_tokens: 10
            })
          });

          if (response.ok) {
            const data: AIResponse = await response.json();
            const category = data.choices[0]?.message?.content?.trim().toLowerCase();
            if (['politics', 'economy', 'social', 'general'].includes(category || '')) {
              article.category = category as NewsCategory;
            }
          }

          return article;
        })
      );

      return categorized;
    } catch (error) {
      console.error('News Categorization Error:', error);
      return articles; // Return original articles if categorization fails
    }
  }
}

export const aiService = new AIService();
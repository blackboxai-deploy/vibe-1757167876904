'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '@/lib/newsTypes';

interface UseChatProps {
  maxMessages?: number;
  includeNewsContext?: boolean;
}

interface UseChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, newsQuery?: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export function useChat({ 
  maxMessages = 50,
  includeNewsContext = true 
}: UseChatProps = {}): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your Malaysian news assistant. Ask me about the latest news in politics, economy, social issues, or any current events in Malaysia. I can also summarize articles for you!',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageIdCounter = useRef(0);

  const generateMessageId = useCallback(() => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  }, []);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateMessageId()
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      // Keep only the latest messages to prevent memory issues
      return updated.slice(-maxMessages);
    });

    return newMessage;
  }, [generateMessageId, maxMessages]);

  const sendMessage = useCallback(async (content: string, newsQuery?: string) => {
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    // Add user message
    const userMessage = addMessage({
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      type: 'text'
    });

    try {
      // Determine if we should include news context
      const shouldIncludeNews = includeNewsContext && (
        newsQuery ||
        content.toLowerCase().includes('news') ||
        content.toLowerCase().includes('latest') ||
        content.toLowerCase().includes('current') ||
        content.toLowerCase().includes('politics') ||
        content.toLowerCase().includes('economy') ||
        content.toLowerCase().includes('social')
      );

      const requestBody = {
        messages: messages.concat([userMessage]).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        includeNews: shouldIncludeNews,
        newsQuery: newsQuery || (shouldIncludeNews ? content : undefined)
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add AI response
      addMessage({
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        type: data.contextArticles ? 'news' : 'text',
        newsArticles: data.contextArticles
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      
      // Add error message
      addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your message. Please try again.',
        timestamp: new Date(),
        type: 'text'
      });

      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  }, [messages, addMessage, includeNewsContext]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m your Malaysian news assistant. Ask me about the latest news in politics, economy, social issues, or any current events in Malaysia. I can also summarize articles for you!',
        timestamp: new Date(),
        type: 'text'
      }
    ]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
    clearError
  };
}
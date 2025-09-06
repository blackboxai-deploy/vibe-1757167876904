'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NewsCard } from '@/components/NewsCard';
import { TypingIndicator } from '@/components/TypingIndicator';
import { ChatMessage } from '@/lib/newsTypes';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const { messages, loading, error, sendMessage, clearMessages, clearError } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    
    await sendMessage(message);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="border-b border-border p-4 bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Malaysia News Chat</h1>
            <p className="text-sm text-muted-foreground">
              Your AI assistant for Malaysian current affairs
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearMessages}
            className="text-xs"
          >
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4">
          <Card className="border-destructive/50 bg-destructive/10 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              formatTime={formatTime}
            />
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 max-w-xs">
                <TypingIndicator />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4 bg-background/95 backdrop-blur">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about Malaysian news, politics, economy, or social issues..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || loading}
            className="px-6"
          >
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {['Latest news', 'Politics update', 'Economy news', 'Social issues'].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => setInputValue(suggestion)}
              disabled={loading}
              className="text-xs h-7"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  formatTime: (date: Date) => string;
}

function MessageBubble({ message, formatTime }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg p-3 ${
            isUser
              ? 'bg-primary text-primary-foreground ml-4'
              : 'bg-muted text-foreground mr-4'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className={`text-xs mt-1 opacity-70`}>
            {formatTime(message.timestamp)}
          </p>
        </div>

        {/* News articles for assistant messages */}
        {!isUser && message.newsArticles && message.newsArticles.length > 0 && (
          <div className="mt-3 space-y-2 mr-4">
            <p className="text-xs text-muted-foreground font-medium">Related Articles:</p>
            {message.newsArticles.slice(0, 3).map((article) => (
              <NewsCard key={article.id} article={article} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
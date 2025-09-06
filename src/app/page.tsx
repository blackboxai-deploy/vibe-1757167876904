'use client';

import { ChatInterface } from '@/components/ChatInterface';

export default function HomePage() {
  return (
    <div className="h-screen w-full bg-background">
      <ChatInterface className="h-full" />
    </div>
  );
}
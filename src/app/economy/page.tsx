'use client';

import { NewsList } from '@/components/NewsList';

export default function EconomyPage() {
  return (
    <div className="min-h-screen bg-background">
      <NewsList 
        category="economy" 
        title="Malaysian Economy"
        showSearch={true}
        autoRefresh={true}
      />
    </div>
  );
}
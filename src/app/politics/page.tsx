'use client';

import { NewsList } from '@/components/NewsList';

export default function PoliticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <NewsList 
        category="politics" 
        title="Malaysian Politics"
        showSearch={true}
        autoRefresh={true}
      />
    </div>
  );
}
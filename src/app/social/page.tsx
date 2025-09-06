'use client';

import { NewsList } from '@/components/NewsList';

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-background">
      <NewsList 
        category="social" 
        title="Malaysian Social Issues"
        showSearch={true}
        autoRefresh={true}
      />
    </div>
  );
}
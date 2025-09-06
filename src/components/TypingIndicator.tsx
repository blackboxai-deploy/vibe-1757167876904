'use client';

import { useEffect, useState } from 'react';

export function TypingIndicator() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-1">
      <span className="text-muted-foreground text-sm">Typing</span>
      <span className="text-muted-foreground text-sm w-4 inline-block">{dots}</span>
    </div>
  );
}
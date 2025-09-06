'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Chat Assistant',
      description: 'AI-powered news chat',
      active: pathname === '/'
    },
    {
      href: '/politics',
      label: 'Politics',
      description: 'Government & policy news',
      active: pathname === '/politics'
    },
    {
      href: '/economy',
      label: 'Economy',
      description: 'Business & finance news',
      active: pathname === '/economy'
    },
    {
      href: '/social',
      label: 'Social Issues',
      description: 'Community & society news',
      active: pathname === '/social'
    }
  ];

  return (
    <div className="w-64 h-full bg-background border-r border-border p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">
          Malaysia News
        </h2>
        <p className="text-sm text-muted-foreground">
          Your source for Malaysian current affairs
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start h-auto p-3 ${
                item.active 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <div className="text-left">
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs opacity-80 mt-1">{item.description}</div>
              </div>
            </Button>
          </Link>
        ))}
      </nav>

      <Card className="mt-6 p-3">
        <div className="text-xs text-muted-foreground mb-2">
          <strong>Features:</strong>
        </div>
        <div className="space-y-1">
          <Badge variant="secondary" className="text-xs">
            AI Chat Assistant
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Article Summarization
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Real-time Updates
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Category Filtering
          </Badge>
        </div>
      </Card>

      <div className="mt-6 text-xs text-muted-foreground">
        <p className="mb-2">
          <strong>Tips:</strong>
        </p>
        <ul className="space-y-1">
          <li>• Ask about specific news topics</li>
          <li>• Request article summaries</li>
          <li>• Browse by category</li>
          <li>• Use natural language</li>
        </ul>
      </div>
    </div>
  );
}
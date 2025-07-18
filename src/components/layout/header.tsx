import { Wand2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Wand2 className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold font-headline text-primary">
            Style AI
          </span>
        </Link>
        <nav className="flex items-center gap-2">
           {/* Future nav links can be added here */}
        </nav>
      </div>
    </header>
  );
}

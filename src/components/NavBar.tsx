import { Link } from '@tanstack/react-router';
import { Music2 } from 'lucide-react';

export function NavBar() {
  return (
    <div className="fixed left-0 top-0 z-50 flex h-16 w-full items-center border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Link to="/" className="flex items-center gap-2 hover:text-primary">
        <Music2 className="h-6 w-6" />
        <h1 className="text-xl font-bold">Blind Test</h1>
      </Link>
    </div>
  );
}

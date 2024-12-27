import { createLazyFileRoute } from '@tanstack/react-router';
import { Music2 } from 'lucide-react';
import { CreateRoomForm } from '@/components/forms/CreateRoomForm';
import { JoinRoomForm } from '@/components/forms/JoinRoomForm';

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Music2 className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Blind Test</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Challenge your friends to a music quiz!
          </p>
        </div>

        <div className="space-y-4 rounded-lg border border-border/50 bg-card p-6">
          <CreateRoomForm />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <JoinRoomForm />
        </div>
      </div>
    </div>
  );
}

import { createLazyFileRoute } from '@tanstack/react-router';
import { CreateRoomForm } from '@/components/forms/CreateRoomForm';

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-16 p-6">
      <img src="/logo.gif" alt="Blind Test Game" className="w-32 h-32" />
      <div className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">Blind Test</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Create a room, invite your friends, and test your music knowledge in
          this fun multiplayer game!
        </p>
      </div>
      <CreateRoomForm className="w-full max-w-sm" />
    </div>
  );
}

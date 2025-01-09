import { createLazyFileRoute } from "@tanstack/react-router";
import { CreateGameForm } from "@/components/forms/create-game-form";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center space-y-16 p-6">
      <img src="/logo.gif" alt="Blind Test Game" className="h-32 w-32" />
      <div className="flex flex-col items-center space-y-4 text-center">
        <h1 className="text-4xl font-bold md:text-5xl">Blind Test</h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Create a game, invite your friends, and test your music knowledge in
          this fun multiplayer game!
        </p>
      </div>
      <CreateGameForm className="w-full max-w-sm" />
    </div>
  );
}

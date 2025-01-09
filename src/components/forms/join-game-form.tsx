import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { fetchGame, joinGame } from "@/utils/api/game";

export const joinGameSchema = z.object({
  gameCode: z.string().min(1, "Game code is required"),
});

export type JoinGameFormValues = z.infer<typeof joinGameSchema>;

interface JoinGameFormProps {
  className?: string;
}

export function JoinGameForm({ className }: JoinGameFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<JoinGameFormValues>({
    resolver: zodResolver(joinGameSchema),
    defaultValues: {
      gameCode: "",
    },
  });

  const onSubmit = async (values: JoinGameFormValues) => {
    try {
      setLoading(true);

      // Check if game exists using the getGame function
      const game = await fetchGame(values.gameCode);
      if (!game) {
        form.setError("gameCode", {
          type: "manual",
          message: "Game not found",
        });
        return;
      }

      // Sign in anonymously if not already signed in
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        await supabase.auth.signInAnonymously();
      }

      // Join the game
      await joinGame(game.game_id, "Anonymous");

      await navigate({ to: `/game/${game.game_id}` });
    } catch (error) {
      toast.error("Failed to join game");
      console.error("Failed to join game:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("w-full space-y-6", className)}
      >
        <FormField
          control={form.control}
          name="gameCode"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Game Code"
                  className="text-center"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Join the Game
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/hooks/use-session";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { joinGame } from "@/utils/api/game";
import { useGame } from "@/hooks/use-game";

const joinGameSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
});

type JoinGameFormValues = z.infer<typeof joinGameSchema>;

interface JoinGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinGameDialog({ open, onOpenChange }: JoinGameDialogProps) {
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { game } = useGame();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = useForm<JoinGameFormValues>({
    resolver: zodResolver(joinGameSchema),
    defaultValues: {
      username: "",
    },
  });

  if (!game) return null;

  const onSubmit = async (values: JoinGameFormValues) => {
    setLoading(true);

    try {
      // If the user is not signed in, sign them in anonymously
      if (!session) {
        await supabase.auth.signInAnonymously();
      }

      await joinGame(game.game_id, values.username);

      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to join game", {
        description: "Please try again later.",
      });
      console.error("Failed to join game:", error);
    } finally {
      setLoading(false);
    }
  };

  const FormContent = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Username" disabled={loading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" loading={loading}>
          Join Game
        </Button>
      </form>
    </Form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open}>
        <DialogContent hideClose>
          <DialogHeader>
            <DialogTitle>Join Game</DialogTitle>
            <DialogDescription>
              Enter your username to join the game.
            </DialogDescription>
          </DialogHeader>
          {FormContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Join Game</DrawerTitle>
          <DrawerDescription>
            Enter your username to join the game.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">{FormContent}</div>
      </DrawerContent>
    </Drawer>
  );
}

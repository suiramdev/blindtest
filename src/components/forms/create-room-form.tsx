import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/hooks/use-session";
import { createRoom, joinRoom } from "@/utils/api/room";
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

export const createRoomSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
});

export type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

interface CreateRoomFormProps {
  className?: string;
}

export function CreateRoomForm({ className }: CreateRoomFormProps) {
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const navigate = useNavigate();

  const form = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      username: "",
    },
  });

  const onSubmit: SubmitHandler<CreateRoomFormValues> = async (values) => {
    try {
      setLoading(true);

      if (!session) {
        await supabase.auth.signInAnonymously();
      }

      const room = await createRoom();
      await joinRoom(room.room_id, values.username);

      await navigate({ to: `/room/${room.room_id}` });
    } catch (error) {
      toast.error("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("w-full space-y-4", className)}
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Username"
                  className="text-center"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          <PlusIcon className="h-4 w-4" />
          Create a Room
        </Button>
      </form>
    </Form>
  );
}

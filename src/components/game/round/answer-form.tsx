import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
import { memo, useCallback, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { type SubmitAnswerResponse } from "@/utils/api/round";
import { ProfilerProvider } from "@/components/providers/profiler-provider";

const answerSchema = z.object({
  answer: z.string().min(1, "Please enter an answer"),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

interface AnswerFormProps {
  onSubmitAnswer: (answer: string) => Promise<SubmitAnswerResponse>;
  results?: ReactNode;
}

export const AnswerForm = memo(function AnswerForm({
  onSubmitAnswer,
  results,
}: AnswerFormProps) {
  const [shakeKey, setShakeKey] = useState(0);

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: "",
    },
  });

  const onSubmit = useCallback(
    async (values: AnswerFormValues) => {
      try {
        await onSubmitAnswer(values.answer);

        form.reset(
          {
            answer: "",
          },
          {
            keepDirty: true,
            keepErrors: true,
          },
        );
      } catch (error) {
        setShakeKey((prev) => prev + 1);
        form.setError("answer", {
          type: "manual",
          message: "Wrong answer, try again!",
        });
      }
    },
    [onSubmitAnswer, form],
  );

  return (
    <ProfilerProvider id="AnswerForm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {results}
          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-2" key={shakeKey}>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter song name or artist..."
                      disabled={form.formState.isSubmitting}
                      className={cn(
                        "h-10",
                        form.formState.errors.answer &&
                          "animate-shake border-destructive",
                      )}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                  <Button
                    type="submit"
                    loading={form.formState.isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    <Check className="h-4 w-4" />
                    Validate
                  </Button>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ProfilerProvider>
  );
});

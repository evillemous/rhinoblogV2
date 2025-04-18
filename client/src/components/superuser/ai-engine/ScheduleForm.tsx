import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ScheduleFormProps {
  currentSchedule?: {
    enabled: boolean;
    cronExpression: string;
  };
}

// Form schema
const scheduleSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(["daily", "weekly", "custom"]),
  customCron: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export function ScheduleForm({ currentSchedule }: ScheduleFormProps) {
  const { toast } = useToast();
  
  // Determine initial frequency from cron expression
  const getCronFrequency = (cronExp: string) => {
    if (cronExp === "0 12 * * *") return "daily";
    if (cronExp === "0 12 * * 1") return "weekly";
    return "custom";
  };
  
  // Initialize form
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      enabled: currentSchedule?.enabled || false,
      frequency: currentSchedule?.cronExpression ? getCronFrequency(currentSchedule.cronExpression) : "daily",
      customCron: currentSchedule?.cronExpression === "0 12 * * *" || currentSchedule?.cronExpression === "0 12 * * 1" 
        ? undefined 
        : currentSchedule?.cronExpression,
    },
  });
  
  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async (data: { enabled: boolean; cronExpression: string }) => {
      const res = await apiRequest("POST", "/api/admin/schedule", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Schedule Updated",
        description: "Content generation schedule has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/schedule'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update schedule",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: ScheduleFormValues) => {
    let cronExpression = "0 12 * * *"; // Default: daily at noon
    
    // Set cron expression based on frequency
    if (data.frequency === "daily") {
      cronExpression = "0 12 * * *"; // Every day at 12 PM
    } else if (data.frequency === "weekly") {
      cronExpression = "0 12 * * 1"; // Every Monday at 12 PM
    } else if (data.frequency === "custom" && data.customCron) {
      cronExpression = data.customCron;
    }
    
    updateScheduleMutation.mutate({
      enabled: data.enabled,
      cronExpression,
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable Scheduled Content</FormLabel>
                <FormDescription>
                  When enabled, new content will be automatically generated according to schedule
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Generation Frequency</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={!form.watch("enabled")}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom Schedule</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How often should new content be generated
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.watch("frequency") === "custom" && (
          <FormField
            control={form.control}
            name="customCron"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Cron Expression</FormLabel>
                <FormControl>
                  <input
                    placeholder="0 12 * * *"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    disabled={!form.watch("enabled")}
                  />
                </FormControl>
                <FormDescription>
                  Advanced: Enter a cron expression (e.g., "0 12 * * *" for daily at noon)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={updateScheduleMutation.isPending || !form.formState.isDirty}
          >
            {updateScheduleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : "Save Schedule"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Topic } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the form schema for creating/editing topics
const topicFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  icon: z.string().min(1, "Icon is required"),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

type TopicFormValues = z.infer<typeof topicFormSchema>;

const AdminTopicManagement = () => {
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch all topics
  const { data: topics, isLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
    staleTime: 30000, // 30 seconds
  });

  // Form setup
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      icon: "",
      description: "",
      sortOrder: 0,
    },
  });

  // Reset form with optional topic data
  const resetForm = (topic?: Topic) => {
    form.reset(
      topic
        ? {
            name: topic.name,
            slug: topic.slug,
            icon: topic.icon,
            description: topic.description || "",
            sortOrder: topic.sortOrder || 0,
          }
        : {
            name: "",
            slug: "",
            icon: "",
            description: "",
            sortOrder: 0,
          }
    );
  };

  // Create topic mutation
  const createTopicMutation = useMutation({
    mutationFn: async (data: TopicFormValues) => {
      const res = await apiRequest("POST", "/api/topics", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      resetForm();
      toast({
        title: "Topic created",
        description: "The topic has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create topic",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update topic mutation
  const updateTopicMutation = useMutation({
    mutationFn: async (data: TopicFormValues) => {
      if (!editingTopic) return null;
      const res = await apiRequest("PUT", `/api/topics/${editingTopic.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      setEditingTopic(null);
      resetForm();
      toast({
        title: "Topic updated",
        description: "The topic has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update topic",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete topic mutation
  const deleteTopicMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/topics/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      setDeletingTopic(null);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Topic deleted",
        description: "The topic has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete topic",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: TopicFormValues) => {
    if (editingTopic) {
      updateTopicMutation.mutate(data);
    } else {
      createTopicMutation.mutate(data);
    }
  };

  // Handle edit button click
  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    resetForm(topic);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingTopic(null);
    resetForm();
  };

  // Handle delete button click
  const handleDeleteClick = (topic: Topic) => {
    setDeletingTopic(topic);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (deletingTopic) {
      deleteTopicMutation.mutate(deletingTopic.id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingTopic ? "Edit Topic" : "Create New Topic"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Topic name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="topic-slug" 
                          {...field} 
                          onChange={(e) => {
                            // Auto-generate slug from name if empty
                            if (!editingTopic && field.value === "" && form.getValues("name") !== "") {
                              form.setValue(
                                "slug",
                                form.getValues("name")
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")
                                  .replace(/[^a-z0-9-]/g, "")
                              );
                            } else {
                              field.onChange(e);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon (Emoji)</FormLabel>
                      <FormControl>
                        <Input placeholder="👃" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Topic description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                {editingTopic ? (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateTopicMutation.isPending}
                    >
                      {updateTopicMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                          Updating...
                        </div>
                      ) : (
                        "Update Topic"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button 
                    type="submit"
                    disabled={createTopicMutation.isPending}
                  >
                    {createTopicMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                        Creating...
                      </div>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Topic
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Topic List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
            </div>
          ) : topics && topics.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Icon</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="w-12 text-center">Order</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topics
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map((topic) => (
                      <TableRow key={topic.id}>
                        <TableCell className="text-center text-xl">{topic.icon}</TableCell>
                        <TableCell className="font-medium">{topic.name}</TableCell>
                        <TableCell>{topic.slug}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {topic.description
                            ? topic.description.length > 50
                              ? `${topic.description.substring(0, 50)}...`
                              : topic.description
                            : "—"}
                        </TableCell>
                        <TableCell className="text-center">{topic.sortOrder || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(topic)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(topic)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No topics found. Create your first topic above.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the topic "{deletingTopic?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTopicManagement;
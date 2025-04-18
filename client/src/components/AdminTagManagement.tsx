import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTagSchema, Tag } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTagColor } from "@/lib/utils";

// Define the tag form schema
const tagFormSchema = insertTagSchema.extend({
  color: z.string().min(1, "Please select a color"),
});

// Define the form values type
type TagFormValues = z.infer<typeof tagFormSchema>;

const AdminTagManagement = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all tags
  const {
    data: tags,
    isLoading,
    error,
  } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
    staleTime: 60000,
  });

  // Initialize form with react-hook-form
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: "",
      color: "blue",
    },
  });

  // Reset form when editing a tag
  const resetForm = (tag?: Tag) => {
    if (tag) {
      form.reset({
        name: tag.name,
        color: tag.color,
      });
      setEditingTag(tag);
    } else {
      form.reset({
        name: "",
        color: "blue",
      });
      setEditingTag(undefined);
    }
  };

  // Create a new tag
  const createTagMutation = useMutation({
    mutationFn: async (data: TagFormValues) => {
      const res = await apiRequest("POST", "/api/tags", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      toast({
        title: "Tag created",
        description: "The tag has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an existing tag
  const updateTagMutation = useMutation({
    mutationFn: async (data: { id: number; data: Partial<TagFormValues> }) => {
      const res = await apiRequest("PUT", `/api/tags/${data.id}`, data.data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      toast({
        title: "Tag updated",
        description: "The tag has been updated successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
      setEditingTag(undefined);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a tag
  const deleteTagMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/tags/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      toast({
        title: "Tag deleted",
        description: "The tag has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: TagFormValues) => {
    if (editingTag) {
      updateTagMutation.mutate({
        id: editingTag.id,
        data: {
          name: data.name,
          color: data.color,
        },
      });
    } else {
      createTagMutation.mutate(data);
    }
  };

  // Filter tags based on search query
  const filteredTags = tags?.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Available colors for tags
  const colors = [
    "blue",
    "green",
    "red",
    "yellow",
    "purple",
    "pink",
    "indigo",
    "gray",
    "orange",
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Tag Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => resetForm()}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTag ? "Edit Tag" : "Create New Tag"}
              </DialogTitle>
              <DialogDescription>
                {editingTag
                  ? "Update the tag details below."
                  : "Add a new tag to categorize posts."}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tag Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter tag name"
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormDescription>
                        Tag name should be clear and concise.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-4 w-4 rounded-full"
                                  style={{ backgroundColor: getTagColor(color) }}
                                ></div>
                                <span className="capitalize">{color}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="mt-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createTagMutation.isPending || updateTagMutation.isPending
                    }
                    className="mt-2"
                  >
                    {(createTagMutation.isPending ||
                      updateTagMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingTag ? "Update Tag" : "Create Tag"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
        <div className="mb-4">
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-rhino-navy" />
          </div>
        ) : error ? (
          <div className="text-red-500 py-4">
            Error loading tags. Please try again.
          </div>
        ) : filteredTags && filteredTags.length > 0 ? (
          <Table>
            <TableCaption>List of all tags in the system.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.id}</TableCell>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell className="capitalize">{tag.color}</TableCell>
                  <TableCell>
                    <Badge
                      style={{ backgroundColor: getTagColor(tag.name) }}
                    >
                      #{tag.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        resetForm(tag);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this tag?"
                          )
                        ) {
                          deleteTagMutation.mutate(tag.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 text-gray-500">
            {searchQuery ? "No tags matching your search." : "No tags found."}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTagManagement;
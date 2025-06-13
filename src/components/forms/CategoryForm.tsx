
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface CategoryFormData {
  name: string;
  description: string;
  slug: string;
  image_url: string;
}

export function CategoryForm() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch, setValue } = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      image_url: "",
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const { error } = await supabase
        .from('categories')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Category created successfully");
      setOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error("Failed to create category: " + error.message);
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    mutation.mutate(data);
  };

  // Auto-generate slug from name
  const name = watch("name");
  React.useEffect(() => {
    if (name) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setValue("slug", slug);
    }
  }, [name, setValue]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input {...register("name", { required: true })} placeholder="Category name" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input {...register("slug", { required: true })} placeholder="category-slug" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea {...register("description")} placeholder="Category description" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input {...register("image_url")} placeholder="https://example.com/image.jpg" />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  sku: string;
  brand: string;
  stock_quantity: number;
  category_id: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
}

interface ProductFormProps {
  product?: any;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, watch, reset } = useForm<ProductFormData>({
    defaultValues: product ? {
      name: product.name,
      description: product.description || "",
      price: Number(product.price),
      sale_price: product.sale_price ? Number(product.sale_price) : undefined,
      sku: product.sku || "",
      brand: product.brand || "",
      stock_quantity: product.stock_quantity,
      category_id: product.category_id || "",
      image_url: product.image_url || "",
      is_active: product.is_active,
      is_featured: product.is_featured,
    } : {
      name: "",
      description: "",
      price: 0,
      sku: "",
      brand: "",
      stock_quantity: 0,
      category_id: "",
      image_url: "",
      is_active: true,
      is_featured: false,
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (product) {
        const { error } = await supabase
          .from('products')
          .update(data)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(product ? "Product updated successfully" : "Product created successfully");
      setOpen(false);
      reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to save product: " + error.message);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {product ? (
          <Button variant="ghost" size="sm">Edit</Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input {...register("name", { required: true })} placeholder="Product name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input {...register("sku")} placeholder="Product SKU" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea {...register("description")} placeholder="Product description" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input type="number" step="0.01" {...register("price", { required: true, valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale Price</Label>
              <Input type="number" step="0.01" {...register("sale_price", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input {...register("brand")} placeholder="Brand name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input type="number" {...register("stock_quantity", { required: true, valueAsNumber: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <Select onValueChange={(value) => setValue("category_id", value)} defaultValue={product?.category_id}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input {...register("image_url")} placeholder="https://example.com/image.jpg" />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={watch("is_active")}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
              <Label>Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={watch("is_featured")}
                onCheckedChange={(checked) => setValue("is_featured", checked)}
              />
              <Label>Featured</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : product ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

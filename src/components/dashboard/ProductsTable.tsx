
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function ProductsTable() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading products...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading products</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStockStatus = (stockQuantity: number) => {
    if (stockQuantity === 0) return "Out of Stock";
    if (stockQuantity <= 10) return "Low Stock";
    return "Active";
  };

  const getStockVariant = (stockQuantity: number) => {
    if (stockQuantity === 0) return "destructive";
    if (stockQuantity <= 10) return "secondary";
    return "default";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products ({products?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Product</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">SKU</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Price</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Stock</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Brand</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                  <td className="py-3 px-2 font-medium">{product.name}</td>
                  <td className="py-3 px-2 text-muted-foreground">{product.sku || 'N/A'}</td>
                  <td className="py-3 px-2">
                    {product.sale_price ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-red-600">${product.sale_price}</span>
                        <span className="text-muted-foreground line-through text-sm">${product.price}</span>
                      </div>
                    ) : (
                      <span>${product.price}</span>
                    )}
                  </td>
                  <td className="py-3 px-2">{product.stock_quantity}</td>
                  <td className="py-3 px-2">
                    <Badge variant={getStockVariant(product.stock_quantity)}>
                      {getStockStatus(product.stock_quantity)}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">{product.brand || 'N/A'}</td>
                  <td className="py-3 px-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No products found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

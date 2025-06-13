
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function InventoryWidget() {
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory-status'],
    queryFn: async () => {
      // Get products with categories
      const { data: products } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .eq('is_active', true);

      if (!products) return [];

      // Group by category
      const categoryGroups = products.reduce((acc, product) => {
        const categoryName = product.categories?.name || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = {
            category: categoryName,
            products: [],
            totalStock: 0,
            availableStock: 0,
          };
        }
        acc[categoryName].products.push(product);
        acc[categoryName].totalStock += product.stock_quantity;
        acc[categoryName].availableStock += product.stock_quantity;
        return acc;
      }, {} as Record<string, any>);

      // Convert to array and calculate percentages
      return Object.values(categoryGroups).map((group: any) => ({
        category: group.category,
        total: group.products.length,
        available: group.products.filter((p: any) => p.stock_quantity > 0).length,
        percentage: Math.round((group.products.filter((p: any) => p.stock_quantity > 0).length / group.products.length) * 100),
        totalStock: group.totalStock,
        lowStock: group.products.filter((p: any) => p.stock_quantity <= 10 && p.stock_quantity > 0).length,
        outOfStock: group.products.filter((p: any) => p.stock_quantity === 0).length,
      }));
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Inventory Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading inventory...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalLowStock = inventoryData?.reduce((sum, item) => sum + item.lowStock, 0) || 0;
  const totalOutOfStock = inventoryData?.reduce((sum, item) => sum + item.outOfStock, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Inventory Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {inventoryData?.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{item.category}</span>
                  {item.percentage < 30 && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{item.available}/{item.total}</span>
                  {item.outOfStock > 0 && <TrendingDown className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              <Progress 
                value={item.percentage} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                {item.percentage}% in stock
                {item.lowStock > 0 && (
                  <span className="text-orange-600 ml-2">
                    ({item.lowStock} low stock)
                  </span>
                )}
                {item.outOfStock > 0 && (
                  <span className="text-red-600 ml-2">
                    ({item.outOfStock} out of stock)
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {inventoryData && inventoryData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No inventory data found
            </div>
          )}
          
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total Alerts</span>
              <span className={`font-semibold ${(totalLowStock + totalOutOfStock) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {totalLowStock + totalOutOfStock} items
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalLowStock > 0 && `${totalLowStock} low stock`}
              {totalLowStock > 0 && totalOutOfStock > 0 && ', '}
              {totalOutOfStock > 0 && `${totalOutOfStock} out of stock`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

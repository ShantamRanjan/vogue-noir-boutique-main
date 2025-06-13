
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function MetricsGrid() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      // Get total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed');
      
      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Get total orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get low stock products
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lte('stock_quantity', 10)
        .eq('is_active', true);

      return {
        totalRevenue,
        totalOrders: totalOrders || 0,
        totalProducts: totalProducts || 0,
        lowStockCount: lowStockCount || 0,
      };
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const metricsData = [
    {
      title: "Total Revenue",
      value: isLoading ? "Loading..." : formatCurrency(metrics?.totalRevenue || 0),
      change: "+12.5%", // This would need historical data to calculate
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Orders",
      value: isLoading ? "Loading..." : (metrics?.totalOrders || 0).toLocaleString(),
      change: "+8.2%", // This would need historical data to calculate
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Active Products",
      value: isLoading ? "Loading..." : (metrics?.totalProducts || 0).toLocaleString(),
      change: "+15.3%", // This would need historical data to calculate
      trend: "up",
      icon: Package,
      color: "text-purple-600",
    },
    {
      title: "Low Stock Items",
      value: isLoading ? "Loading..." : (metrics?.lowStockCount || 0).toLocaleString(),
      change: metrics?.lowStockCount ? `${metrics.lowStockCount} items` : "0 items",
      trend: metrics?.lowStockCount && metrics.lowStockCount > 0 ? "down" : "up",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsData.map((metric) => (
        <Card key={metric.title} className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-5 w-5 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            <div className="flex items-center space-x-1 text-sm">
              {metric.trend === "up" ? (
                <ArrowUpIcon className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-600" />
              )}
              <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>
                {metric.change}
              </span>
              <span className="text-muted-foreground">
                {metric.title === "Low Stock Items" ? "need attention" : "from last month"}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

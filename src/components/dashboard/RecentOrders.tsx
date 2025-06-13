
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export function RecentOrders() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Fetch profiles for each order separately
      const ordersWithProfiles = await Promise.all(
        data.map(async (order) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', order.user_id)
            .single();
          
          return {
            ...order,
            profile
          };
        })
      );
      
      return ordersWithProfiles;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading orders...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading orders</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'outline';
      case 'pending':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders?.map((order) => (
            <div key={order.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <Avatar>
                <AvatarFallback>
                  {order.profile?.full_name 
                    ? order.profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                    : order.profile?.email?.charAt(0).toUpperCase() || '?'
                  }
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {order.profile?.full_name || order.profile?.email || 'Guest'}
                  </p>
                  <p className="text-sm font-bold">${order.total_amount}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">#{order.order_number}</p>
                  <Badge 
                    variant={getStatusVariant(order.status)}
                    className="text-xs"
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          {orders?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No recent orders found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

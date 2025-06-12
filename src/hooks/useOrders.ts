
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Order = Tables<'orders'> & {
  order_items: (Tables<'order_items'> & {
    products: Tables<'products'>;
  })[];
};

type CreateOrderData = {
  items: {
    product_id: string;
    quantity: number;
    size?: string;
    color?: string;
    price: number;
  }[];
  shipping_address: any;
  billing_address?: any;
  payment_method?: string;
};

export const useOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data as Order[];
    },
    enabled: !!user,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      if (!user) throw new Error('User not authenticated');

      const totalAmount = orderData.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );

      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number');

      if (orderNumberError) {
        console.error('Error generating order number:', orderNumberError);
        throw orderNumberError;
      }

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumberData,
          total_amount: totalAmount,
          shipping_address: orderData.shipping_address,
          billing_address: orderData.billing_address,
          payment_method: orderData.payment_method,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw itemsError;
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error,
    createOrder: createOrderMutation.mutateAsync,
    isCreatingOrder: createOrderMutation.isPending,
  };
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type CartItem = Tables<'cart'> & {
  products: Tables<'products'>;
};

export const useCart = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          products(*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart:', error);
        throw error;
      }

      return data as CartItem[];
    },
    enabled: !!user,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (item: Omit<TablesInsert<'cart'>, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cart')
        .upsert({
          ...item,
          user_id: user.id,
        }, {
          onConflict: 'user_id,product_id,size,color'
        })
        .select();

      if (error) {
        console.error('Error adding to cart:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'cart'> }) => {
      const { data, error } = await supabase
        .from('cart')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating cart:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing from cart:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
  });

  return {
    cart: cartQuery.data || [],
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,
    addToCart: addToCartMutation.mutateAsync,
    updateCart: updateCartMutation.mutateAsync,
    removeFromCart: removeFromCartMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
  };
};

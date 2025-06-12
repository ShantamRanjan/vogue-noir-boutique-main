
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type CartItem = Tables<'cart'> & {
  products: Tables<'products'>;
};

export const cartService = {
  async getCart(userId: string) {
    const { data, error } = await supabase
      .from('cart')
      .select(`
        *,
        products(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }

    return data as CartItem[];
  },

  async addToCart(item: TablesInsert<'cart'>) {
    const { data, error } = await supabase
      .from('cart')
      .upsert(item, {
        onConflict: 'user_id,product_id,size,color'
      })
      .select(`
        *,
        products(*)
      `);

    if (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }

    return data[0] as CartItem;
  },

  async updateCartItem(id: string, updates: TablesUpdate<'cart'>) {
    const { data, error } = await supabase
      .from('cart')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        products(*)
      `);

    if (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }

    return data[0] as CartItem;
  },

  async removeFromCart(id: string) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  async clearCart(userId: string) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  async getCartCount(userId: string) {
    const { count, error } = await supabase
      .from('cart')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting cart count:', error);
      throw error;
    }

    return count || 0;
  },
};

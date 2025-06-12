
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Product = Tables<'products'>;
export type Category = Tables<'categories'>;

export const productService = {
  async getProducts(filters?: {
    categorySlug?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sizes?: string[];
    colors?: string[];
  }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories(*)
      `)
      .eq('is_active', true);

    if (filters?.categorySlug) {
      query = query.eq('categories.slug', filters.categorySlug);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.sizes && filters.sizes.length > 0) {
      query = query.overlaps('sizes', filters.sizes);
    }

    if (filters?.colors && filters.colors.length > 0) {
      query = query.overlaps('colors', filters.colors);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return data;
  },

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    return data;
  },

  async getFeaturedProducts(limit = 8) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(*)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(limit);

    if (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }

    return data;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data;
  },

  async getProductsByCategory(categorySlug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner(*)
      `)
      .eq('categories.slug', categorySlug)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }

    return data;
  },
};


import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';

interface CartContextType {
  cartItems: any[];
  wishlistItems: any[];
  cartCount: number;
  wishlistCount: number;
  addToCart: (productId: string, quantity: number, size?: string, color?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartQuantity: (itemId: string, quantity: number) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  moveToCart: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { 
    cart, 
    addToCart: addToCartMutation, 
    removeFromCart: removeFromCartMutation,
    updateCart: updateCartMutation,
    clearCart: clearCartMutation,
  } = useCart();
  
  const { 
    wishlist, 
    addToWishlist: addToWishlistMutation, 
    removeFromWishlist: removeFromWishlistMutation,
    isInWishlist: checkIsInWishlist
  } = useWishlist();

  const cartItems = cart.map(item => ({
    id: item.id,
    name: item.products.name,
    price: item.products.price,
    image: item.products.image_url || '/placeholder.svg',
    quantity: item.quantity,
    size: item.size || '',
    productId: item.product_id,
  }));

  const wishlistItems = wishlist.map(item => ({
    id: item.products.id,
    name: item.products.name,
    price: item.products.price,
    image: item.products.image_url || '/placeholder.svg',
    category: item.products.brand || '',
    productId: item.product_id,
  }));

  const addToCart = async (productId: string, quantity: number, size?: string, color?: string) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      await addToCartMutation({
        product_id: productId,
        quantity,
        size,
        color,
      });
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await removeFromCartMutation(itemId);
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove from cart');
    }
  };

  const updateCartQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateCartMutation({ id: itemId, updates: { quantity } });
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please log in to add items to wishlist');
      return;
    }

    try {
      await addToWishlistMutation(productId);
      toast.success('Added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlistMutation(productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const moveToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      await removeFromWishlist(productId);
      toast.success('Moved to cart!');
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast.error('Failed to move to cart');
    }
  };

  const clearCart = async () => {
    try {
      await clearCartMutation();
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const value = {
    cartItems,
    wishlistItems,
    cartCount: cartItems.length,
    wishlistCount: wishlistItems.length,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    isInWishlist: checkIsInWishlist,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};

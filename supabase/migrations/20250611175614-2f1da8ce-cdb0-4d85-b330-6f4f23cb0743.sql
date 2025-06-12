
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id),
  brand TEXT,
  sku TEXT UNIQUE,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  images TEXT[], -- Array of image URLs
  sizes TEXT[], -- Array of available sizes
  colors TEXT[], -- Array of available colors
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart table
CREATE TABLE public.cart (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, size, color)
);

-- Create wishlist table
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  size TEXT,
  color TEXT,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (public read access)
CREATE POLICY "Anyone can view categories" 
  ON public.categories 
  FOR SELECT 
  USING (true);

-- Create policies for products (public read access)
CREATE POLICY "Anyone can view active products" 
  ON public.products 
  FOR SELECT 
  USING (is_active = true);

-- Create policies for cart (users can only access their own cart)
CREATE POLICY "Users can view their own cart" 
  ON public.cart 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own cart" 
  ON public.cart 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart" 
  ON public.cart 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart" 
  ON public.cart 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for wishlist (users can only access their own wishlist)
CREATE POLICY "Users can view their own wishlist" 
  ON public.wishlist 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own wishlist" 
  ON public.wishlist 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist" 
  ON public.wishlist 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for orders (users can only access their own orders)
CREATE POLICY "Users can view their own orders" 
  ON public.orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policies for order_items (users can only view items from their own orders)
CREATE POLICY "Users can view their own order items" 
  ON public.order_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own order items" 
  ON public.order_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Create some sample data
INSERT INTO public.categories (name, slug, description) VALUES
  ('Men', 'men', 'Mens fashion and clothing'),
  ('Women', 'women', 'Womens fashion and clothing'),
  ('Accessories', 'accessories', 'Fashion accessories for everyone');

-- Insert sample products
INSERT INTO public.products (name, description, price, sale_price, category_id, brand, sku, stock_quantity, image_url, sizes, colors, is_featured) VALUES
  ('Classic White T-Shirt', 'Premium cotton t-shirt for everyday wear', 29.99, NULL, (SELECT id FROM public.categories WHERE slug = 'men'), 'YUTH', 'MEN-TSH-001', 50, '/placeholder.svg', ARRAY['S', 'M', 'L', 'XL'], ARRAY['White', 'Black', 'Gray'], true),
  ('Denim Jeans', 'Comfortable straight-fit denim jeans', 79.99, 59.99, (SELECT id FROM public.categories WHERE slug = 'men'), 'YUTH', 'MEN-JNS-001', 30, '/placeholder.svg', ARRAY['28', '30', '32', '34', '36'], ARRAY['Blue', 'Black'], true),
  ('Summer Dress', 'Elegant summer dress perfect for any occasion', 89.99, NULL, (SELECT id FROM public.categories WHERE slug = 'women'), 'YUTH', 'WMN-DRS-001', 25, '/placeholder.svg', ARRAY['XS', 'S', 'M', 'L'], ARRAY['Red', 'Blue', 'Pink'], true),
  ('Leather Handbag', 'Premium leather handbag with multiple compartments', 149.99, 119.99, (SELECT id FROM public.categories WHERE slug = 'women'), 'YUTH', 'WMN-BAG-001', 15, '/placeholder.svg', ARRAY['One Size'], ARRAY['Brown', 'Black', 'Tan'], false);

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number() RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON public.cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

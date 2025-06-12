import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Star, Minus, Plus, MapPin, Truck, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const Product = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Mock product data
  const product = {
    id: parseInt(id || '1'),
    name: "Classic White Shirt",
    price: 2999,
    originalPrice: 3999,
    rating: 4.5,
    reviews: 128,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop&brightness=1.1",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop&contrast=1.1"
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: "A timeless classic white shirt crafted from premium cotton. Perfect for both formal and casual occasions.",
    features: [
      "100% Premium Cotton",
      "Machine Washable",
      "Wrinkle Resistant",
      "Classic Fit"
    ],
    category: "Shirts"
  };

  const [selectedImage, setSelectedImage] = useState(product.images[0]);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation. Please enter your pincode manually.",
        variant: "destructive"
      });
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Using a free reverse geocoding API
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          const address = `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`;
          const postalCode = data.postcode || '';
          
          setCurrentLocation(address);
          setPincode(postalCode);
          
          // Automatically check delivery for the detected location
          if (postalCode && postalCode.length === 6) {
            setDeliveryInfo({
              available: true,
              estimatedDays: '3-5',
              charge: postalCode.startsWith('1') ? 0 : 99
            });
          }
          
          toast({
            title: "Location detected",
            description: `Delivery location set to: ${address}`,
          });
        } catch (error) {
          toast({
            title: "Error getting address",
            description: "Could not get your address details. Please enter your pincode manually.",
            variant: "destructive"
          });
        }
        
        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = "Could not get your location. Please enter your pincode manually.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enter your pincode manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please enter your pincode manually.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please enter your pincode manually.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive"
        });
        
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryInfo({
        available: true,
        estimatedDays: '3-5',
        charge: pincode.startsWith('1') ? 0 : 99
      });
    }
  };

  const addToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size before adding to cart.",
        variant: "destructive"
      });
      return;
    }
    setCartCount(prev => prev + quantity);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Mock related products
  const relatedProducts = [
    {
      id: 2,
      name: "Casual Blazer",
      price: 6999,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop"
    },
    {
      id: 3,
      name: "Slim Fit Jeans",
      price: 3499,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop"
    },
    {
      id: 4,
      name: "Cotton T-Shirt",
      price: 1499,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-black">
              YUTH
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link to="/men" className="text-gray-900 hover:text-gray-600 font-medium">
                MEN
              </Link>
              <Link to="/women" className="text-gray-900 hover:text-gray-600 font-medium">
                WOMEN
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 py-4 text-sm text-gray-600">
        <Link to="/" className="hover:text-black">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/men" className="hover:text-black">Men</Link>
        <span className="mx-2">/</span>
        <span className="text-black">{product.name}</span>
      </nav>

      {/* Product Details */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`w-20 h-20 border-2 overflow-hidden ${
                    selectedImage === image ? 'border-black' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 text-sm rounded">
                  25% OFF
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Size</h3>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border text-sm font-medium ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Enhanced Delivery Section with Location Detection */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery to your location
              </h3>
              
              {currentLocation && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Current Location:</p>
                  <p className="text-sm text-green-700">{currentLocation}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  {isLoadingLocation ? 'Getting your location...' : 'Use My Current Location'}
                </Button>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Or enter pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    className="flex-1"
                  />
                  <Button onClick={checkDelivery} variant="outline">
                    Check
                  </Button>
                </div>
              </div>
              
              {deliveryInfo && (
                <div className="space-y-2 text-sm mt-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <Truck className="h-4 w-4" />
                    <span>Delivery available in {deliveryInfo.estimatedDays} business days</span>
                  </div>
                  <div className="text-gray-600">
                    Delivery charge: {deliveryInfo.charge === 0 ? 'FREE' : `₹${deliveryInfo.charge}`}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-black text-white hover:bg-gray-800 py-3"
                onClick={addToCart}
              >
                ADD TO CART
              </Button>
              <Button
                variant="outline"
                className="w-full py-3"
                onClick={() => setWishlistCount(prev => prev + 1)}
              >
                <Heart className="h-4 w-4 mr-2" />
                ADD TO WISHLIST
              </Button>
            </div>

            <div className="border-t pt-6">
              <Tabs defaultValue="description">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                  <p className="text-gray-600">{product.description}</p>
                </TabsContent>
                <TabsContent value="features" className="mt-4">
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="text-gray-600">• {feature}</li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {relatedProducts.map((item) => (
            <Card key={item.id} className="group cursor-pointer border-none shadow-none">
              <CardContent className="p-0">
                <Link to={`/product/${item.id}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="pt-4">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">₹{item.price.toLocaleString()}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">YUTH</h3>
              <p className="text-gray-400">
                Redefining fashion with contemporary designs and timeless elegance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">SHOP</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/men" className="hover:text-white">Men's Collection</Link></li>
                <li><Link to="/women" className="hover:text-white">Women's Collection</Link></li>
                <li><Link to="/new-arrivals" className="hover:text-white">New Arrivals</Link></li>
                <li><Link to="/sale" className="hover:text-white">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">CUSTOMER CARE</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="/shipping" className="hover:text-white">Shipping Info</Link></li>
                <li><Link to="/returns" className="hover:text-white">Returns</Link></li>
                <li><Link to="/size-guide" className="hover:text-white">Size Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">CONNECT</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Instagram</a></li>
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">Newsletter</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 YUTH. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Product;

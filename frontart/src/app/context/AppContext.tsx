import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getMe } from '../utils/api';
import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  createOrder as apiCreateOrder,
  getMyOrders as apiGetMyOrders,
  getWishlist as apiGetWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
  toggleWishlistItem as apiToggleWishlistItem
} from '../utils/api';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  format?: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'artist' | 'admin';
  avatar?: string;
}

export interface CheckoutState {
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingInfo: CheckoutState['shippingInfo'];
  paymentMethod: string;
  deliveryDate: string;
}

interface AppContextType {
  user: User | null;
  isAuthLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<User>;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateCartQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  toggleWishlist: (item: WishlistItem) => Promise<void>;
  checkoutState: CheckoutState;
  updateCheckoutState: (updates: Partial<CheckoutState>) => void;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'deliveryDate'> & { razorpayPaymentId?: string }) => Promise<void>;
  loginWithGoogle: () => void;
}

// Create context with a default value that will be overridden by the provider
const defaultContextValue: AppContextType = {
  user: null,
  isAuthLoading: true,
  setUser: () => { },
  logout: () => { },
  login: async () => { throw new Error('Not implemented'); },
  cart: [],
  addToCart: async () => { },
  removeFromCart: async () => { },
  updateCartQuantity: async () => { },
  clearCart: async () => { },
  cartCount: 0,
  cartTotal: 0,
  wishlist: [],
  addToWishlist: async () => { },
  removeFromWishlist: async () => { },
  toggleWishlist: async () => { },
  checkoutState: {
    shippingInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    paymentMethod: 'razorpay'
  },
  updateCheckoutState: () => { },
  orders: [],
  addOrder: async () => { },
  loginWithGoogle: () => { }
};

const AppContext = createContext<AppContextType>(defaultContextValue);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const mapBackendCart = (cartData: any): CartItem[] => {
    const items = cartData?.data?.cart?.items || [];
    return items.map((item: any) => ({
      id: item.product?._id,
      title: item.product?.title,
      price: item.product?.price,
      image: item.product?.images?.[0]?.url || '',
      quantity: item.quantity
    })).filter((item: CartItem) => !!item.id);
  };

  const mapBackendWishlist = (wishlistData: any): WishlistItem[] => {
    const products = wishlistData?.data?.wishlist?.products || [];
    return products.map((item: any) => {
      const product = item.product;
      return {
        id: product?._id,
        title: product?.title,
        price: product?.price,
        image: product?.images?.[0]?.url || '',
        slug: product?.slug
      };
    }).filter((item: WishlistItem) => !!item.id);
  };

  const mapBackendOrders = (orderData: any): Order[] => {
    const orders = orderData?.data?.orders || [];
    const statusMap: Record<string, Order['status']> = {
      pending: 'Placed',
      confirmed: 'Processing',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };

    return orders.map((order: any) => ({
      id: order.orderNumber || order._id,
      date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: (order.items || []).map((item: any) => ({
        id: item.product?._id || item.product,
        title: item.title,
        price: item.price,
        image: item.image || '',
        quantity: item.quantity
      })),
      total: order.total || 0,
      status: statusMap[order.status] || 'Placed',
      shippingInfo: {
        fullName: order.shippingAddress?.fullName || '',
        email: '',
        phone: order.shippingAddress?.phone || '',
        address: order.shippingAddress?.street || '',
        city: order.shippingAddress?.city || '',
        state: order.shippingAddress?.state || '',
        pincode: order.shippingAddress?.pincode || ''
      },
      paymentMethod: order.payment?.method || 'razorpay',
      deliveryDate: order.shipping?.estimatedDelivery
        ? new Date(order.shipping.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : ''
    }));
  };

  // Load user, cart, wishlist and orders from localStorage and backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const userData = await getMe();
            const backendUser = userData?.data?.user;
            const user: User = {
              id: backendUser._id,
              name: backendUser.displayName || backendUser.username,
              email: backendUser.email,
              phone: backendUser.phone || null,
              role: backendUser.role,
              avatar: backendUser.avatar
            };
            setUser(user);

            // Load cart and wishlist from backend
            try {
              const cartData = await apiGetCart();
              if (cartData.success) {
                setCart(mapBackendCart(cartData));
              }
            } catch (error) {
              console.error('Error loading cart:', error);
            }

            try {
              const wishlistData = await apiGetWishlist();
              if (wishlistData.success) {
                setWishlist(mapBackendWishlist(wishlistData));
              }
            } catch (error) {
              console.error('Error loading wishlist:', error);
            }
            try {
              const ordersData = await apiGetMyOrders();
              if (ordersData.success) {
                setOrders(mapBackendOrders(ordersData));
              }
            } catch (error) {
              console.error('Error loading orders:', error);
            }
          } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
        }
        const savedOrders = localStorage.getItem('artvpp-orders');
        if (!token && savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('artvpp-cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Save orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('artvpp-orders', JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders to localStorage:', error);
    }
  }, [orders]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    try {
      if (user) {
        // User is logged in, use backend
        await apiAddToCart({
          productId: item.id,
          quantity: 1,
          size: item.size,
          format: item.format
        });
        // Refresh cart from backend
        const cartData = await apiGetCart();
        if (cartData.success) {
          setCart(mapBackendCart(cartData));
        }
      } else {
        // User not logged in, use local state
        setCart(prevCart => {
          const existingItem = prevCart.find(i =>
            i.id === item.id && i.size === item.size && i.format === item.format
          );

          if (existingItem) {
            return prevCart.map(i =>
              i.id === item.id && i.size === item.size && i.format === item.format
                ? { ...i, quantity: i.quantity + 1 }
                : i
            );
          }

          return [...prevCart, { ...item, quantity: 1 }];
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to local state
      setCart(prevCart => {
        const existingItem = prevCart.find(i =>
          i.id === item.id && i.size === item.size && i.format === item.format
        );

        if (existingItem) {
          return prevCart.map(i =>
            i.id === item.id && i.size === item.size && i.format === item.format
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }

        return [...prevCart, { ...item, quantity: 1 }];
      });
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      if (user) {
        // User is logged in, use backend
        await apiRemoveFromCart(id);
        // Refresh cart from backend
        const cartData = await apiGetCart();
        if (cartData.success) {
          setCart(mapBackendCart(cartData));
        }
      } else {
        // User not logged in, use local state
        setCart(prevCart => prevCart.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Fallback to local state
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    }
  };

  const updateCartQuantity = async (id: string, quantity: number) => {
    try {
      if (user) {
        // User is logged in, use backend
        await apiUpdateCartItem({ productId: id, quantity });
        // Refresh cart from backend
        const cartData = await apiGetCart();
        if (cartData.success) {
          setCart(mapBackendCart(cartData));
        }
      } else {
        // User not logged in, use local state
        if (quantity <= 0) {
          await removeFromCart(id);
          return;
        }
        setCart(prevCart =>
          prevCart.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      // Fallback to local state
      if (quantity <= 0) {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
        return;
      }
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        // User is logged in, use backend
        await apiClearCart();
      }
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Fallback to local state
      setCart([]);
    }
  };

  const addToWishlist = async (item: WishlistItem) => {
    try {
      if (user) {
        // User is logged in, use backend
        await apiAddToWishlist({ productId: item.id });
        // Refresh wishlist from backend
        const wishlistData = await apiGetWishlist();
        if (wishlistData.success) {
          setWishlist(mapBackendWishlist(wishlistData));
        }
      } else {
        // User not logged in, use local state
        setWishlist(prevWishlist => {
          const exists = prevWishlist.find(i => i.id === item.id);
          if (!exists) {
            return [...prevWishlist, item];
          }
          return prevWishlist;
        });
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Fallback to local state
      setWishlist(prevWishlist => {
        const exists = prevWishlist.find(i => i.id === item.id);
        if (!exists) {
          return [...prevWishlist, item];
        }
        return prevWishlist;
      });
    }
  };

  const removeFromWishlist = async (id: string) => {
    try {
      if (user) {
        // User is logged in, use backend
        await apiRemoveFromWishlist(id);
        // Refresh wishlist from backend
        const wishlistData = await apiGetWishlist();
        if (wishlistData.success) {
          setWishlist(mapBackendWishlist(wishlistData));
        }
      } else {
        // User not logged in, use local state
        setWishlist(prevWishlist => prevWishlist.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Fallback to local state
      setWishlist(prevWishlist => prevWishlist.filter(item => item.id !== id));
    }
  };

  const toggleWishlist = async (item: WishlistItem) => {
    try {
      if (user) {
        // User is logged in, use backend
        await apiToggleWishlistItem({ productId: item.id });
        // Refresh wishlist from backend
        const wishlistData = await apiGetWishlist();
        if (wishlistData.success) {
          setWishlist(mapBackendWishlist(wishlistData));
        }
      } else {
        // User not logged in, use local state
        setWishlist(prevWishlist => {
          const exists = prevWishlist.find(i => i.id === item.id);
          if (exists) {
            return prevWishlist.filter(i => i.id !== item.id);
          } else {
            return [...prevWishlist, item];
          }
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Fallback to local state
      setWishlist(prevWishlist => {
        const exists = prevWishlist.find(i => i.id === item.id);
        if (exists) {
          return prevWishlist.filter(i => i.id !== item.id);
        } else {
          return [...prevWishlist, item];
        }
      });
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status' | 'deliveryDate'> & { razorpayPaymentId?: string }) => {
    if (user) {
      const response = await apiCreateOrder({
        shippingAddress: {
          fullName: orderData.shippingInfo.fullName,
          phone: orderData.shippingInfo.phone,
          street: orderData.shippingInfo.address,
          city: orderData.shippingInfo.city,
          state: orderData.shippingInfo.state,
          pincode: orderData.shippingInfo.pincode
        },
        paymentMethod: orderData.paymentMethod,
        ...(orderData.razorpayPaymentId && { razorpayPaymentId: orderData.razorpayPaymentId })
      });

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to create order');
      }

      const createdOrder = response?.data?.order;
      if (createdOrder) {
        const mapped = mapBackendOrders({ data: { orders: [createdOrder] } });
        if (mapped.length > 0) {
          setOrders(prev => [mapped[0], ...prev]);
        }
      }
      return;
    }

    const newOrder: Order = {
      ...orderData,
      id: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Placed',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    if (response.success) {
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      const userObj: User = {
        id: user._id,
        name: user.displayName || user.username,
        email: user.email,
        phone: user.phone || null,
        role: user.role,
        avatar: user.avatar
      };
      setUser(userObj);

      try {
        const [cartData, wishlistData, ordersData] = await Promise.all([
          apiGetCart(),
          apiGetWishlist(),
          apiGetMyOrders()
        ]);
        if (cartData.success) setCart(mapBackendCart(cartData));
        if (wishlistData.success) setWishlist(mapBackendWishlist(wishlistData));
        if (ordersData.success) setOrders(mapBackendOrders(ordersData));
      } catch (error) {
        console.error('Error loading user data after login:', error);
      }

      return userObj;
    } else {
      throw new Error(response.message);
    }
  };

  const loginWithGoogle = () => {
    // Redirect to Google OAuth
    window.location.href = 'http://localhost:5000/api/v1/auth/google';
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setCart([]);
    setWishlist([]);
    setOrders([]);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  // Checkout State
  const [checkoutState, setCheckoutState] = useState({
    shippingInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    paymentMethod: 'razorpay'
  });

  const updateCheckoutState = (updates: Partial<typeof checkoutState>) => {
    setCheckoutState(prev => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider value={{
      user,
      isAuthLoading: !isLoaded,
      setUser,
      logout,
      login,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartCount,
      cartTotal,
      wishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      checkoutState,
      updateCheckoutState,
      orders,
      addOrder,
      loginWithGoogle
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

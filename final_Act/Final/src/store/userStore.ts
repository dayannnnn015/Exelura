// userStore.ts - FINAL VERSION WITH SELLER FUNCTIONALITY
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  role?: 'user' | 'seller' | 'admin';
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  thumbnail: string;
  discountPercentage?: number;
  originalPrice?: number;
  category?: string;
  isSelected: boolean;
}

export interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  tags?: string[];
  thumbnail: string;
  category?: string;
  qrCode?: string;
  reviews?: any[];
  [key: string]: any;
}

export interface ProductInput {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  discountPercentage?: number;
  stock?: number;
  category?: string;
  qrCode?: string;
  [key: string]: any;
}

// Seller Dashboard Interfaces
export interface SellerProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sold: number;
  rating: number;
  images: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  thumbnail: string;
}

export interface Order {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  paymentMethod: 'credit_card' | 'paypal' | 'gcash' | 'paymaya' | 'bank_transfer' | 'cash_on_delivery';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  monthlyGrowth: number;
  popularCategories: Array<{ name: string; count: number }>;
}

interface UserStore {
  // User state
  currentUser: User | null;
  isLoggedIn: boolean;
  isSeller: boolean; // Added seller flag
  
  // Cart state
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  
  // Products state (cached)
  products: Product[];
  
  // Seller Dashboard State
  sellerProducts: SellerProduct[];
  orders: Order[];
  sellerStats: SellerStats;
  
  // User actions
  login: (user: User) => void;
  logout: () => void;
  register: (user: User) => void;
  updateProfile: (userData: Partial<User>) => void;
  
  // Seller switching actions
  switchToSeller: () => void;
  switchToUser: () => void;
  
  // Cart actions
  addToCart: (product: ProductInput, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateCartItem: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  
  // Selection actions
  toggleCartItemSelection: (itemId: number) => void;
  toggleAllSelection: (checked: boolean) => void;
  checkoutSelectedItems: () => void;
  
  // Order actions
  createOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: number, status: Order['status']) => void;
  cancelOrder: (orderId: number) => void;
  getCustomerOrders: () => Order[];
  getSellerOrders: () => Order[];
  
  // Seller Product Management
  addSellerProduct: (product: Partial<SellerProduct>) => void;
  updateSellerProduct: (productId: number, updates: Partial<SellerProduct>) => void;
  deleteSellerProduct: (productId: number) => void;
  getSellerProducts: () => SellerProduct[];
  updateProductStock: (productId: number, newStock: number) => void;
  
  // Seller Stats
  updateSellerStats: () => void;
  
  // Products actions
  setProducts: (products: Product[]) => void;
  
  // Helper functions
  getDiscountedPrice: (price: number, discountPercentage?: number) => number;
  calculateCartTotal: () => void;
  
  // Initialize with demo user
  initialize: () => void;
}

// Dummy users for initial state
const DUMMY_USERS: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@xelura.com',
    phone: '+1234567890',
    address: '123 Main Street, New York, NY',
    createdAt: new Date().toISOString(),
    role: 'user'
  },
  {
    id: 2,
    name: 'Jane Smith (Seller)',
    email: 'jane@xelura.com',
    phone: '+0987654321',
    address: '456 Oak Avenue, Los Angeles, CA',
    createdAt: new Date().toISOString(),
    role: 'seller'
  },
  {
    id: 3,
    name: 'Seller User',
    email: 'seller@xelura.com',
    phone: '+1234567890',
    address: '456 Seller Street, Los Angeles, CA',
    createdAt: new Date().toISOString(),
    role: 'seller'
  }
];

const defaultUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@xelura.com',
  phone: '+1234567890',
  address: '123 Main Street, New York, NY',
  createdAt: new Date().toISOString(),
  role: 'user'
};

// Initial Seller Products
const initialSellerProducts: SellerProduct[] = [
  {
    id: 1,
    title: 'Premium Smartphone X',
    description: 'Latest smartphone with advanced features',
    price: 999,
    category: 'smartphones',
    stock: 45,
    sold: 120,
    rating: 4.5,
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Luxury Watch Pro',
    description: 'Premium luxury watch with diamond dial',
    price: 2499,
    category: 'womens-watches',
    stock: 12,
    sold: 45,
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=400&fit=crop'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Initial Orders
const initialOrders: Order[] = [
  {
    id: 1001,
    userId: 1,
    customerName: 'John Doe',
    customerEmail: 'john@xelura.com',
    customerPhone: '+1234567890',
    items: [
      {
        id: 1,
        productId: 1,
        productName: 'Premium Smartphone X',
        quantity: 1,
        price: 999,
        thumbnail: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150&h=150&fit=crop'
      }
    ],
    subtotal: 999,
    shippingFee: 15,
    tax: 89.91,
    total: 1103.91,
    status: 'pending',
    shippingAddress: '123 Main Street, New York, NY',
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    createdAt: new Date('2024-03-15').toISOString(),
    updatedAt: new Date('2024-03-15').toISOString(),
  },
  {
    id: 1002,
    userId: 2,
    customerName: 'Jane Smith',
    customerEmail: 'jane@xelura.com',
    customerPhone: '+0987654321',
    items: [
      {
        id: 2,
        productId: 2,
        productName: 'Luxury Watch Pro',
        quantity: 1,
        price: 2499,
        thumbnail: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=150&h=150&fit=crop'
      }
    ],
    subtotal: 2499,
    shippingFee: 25,
    tax: 224.91,
    total: 2748.91,
    status: 'approved',
    shippingAddress: '456 Oak Avenue, Los Angeles, CA',
    paymentMethod: 'paypal',
    paymentStatus: 'paid',
    createdAt: new Date('2024-03-14').toISOString(),
    updatedAt: new Date('2024-03-14').toISOString(),
  }
];

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isLoggedIn: false,
      isSeller: false, // Initialize seller flag
      cart: [],
      cartTotal: 0,
      cartCount: 0,
      products: [],
      
      // Seller state
      sellerProducts: initialSellerProducts,
      orders: initialOrders,
      sellerStats: {
        totalRevenue: 3852.82,
        totalOrders: 2,
        totalProducts: 2,
        totalCustomers: 2,
        monthlyGrowth: 12.5,
        popularCategories: [
          { name: 'smartphones', count: 120 },
          { name: 'womens-watches', count: 45 }
        ]
      },
      
      // Initialize with demo user
      initialize: () => {
        const { isLoggedIn } = get();
        if (!isLoggedIn) {
          console.log('🔧 Initializing store with demo user');
          set({
            currentUser: defaultUser,
            isLoggedIn: true,
            isSeller: false,
          });
        }
      },
      
      // User actions
      login: (user) => set({ 
        currentUser: user, 
        isLoggedIn: true,
        isSeller: user.role === 'seller'
      }),
      
      logout: () => set({ 
        currentUser: null, 
        isLoggedIn: false,
        isSeller: false,
        cart: [],
        cartTotal: 0,
        cartCount: 0
      }),
      
      register: (user) => {
        const newUser = {
          ...user,
          id: DUMMY_USERS.length + 1,
          role: 'user',
          createdAt: new Date().toISOString()
        };
        
        DUMMY_USERS.push(newUser);
        
        set({ 
          currentUser: newUser, 
          isLoggedIn: true,
          isSeller: false
        });
      },
      
      updateProfile: (userData) => set((state) => ({
        currentUser: state.currentUser 
          ? { ...state.currentUser, ...userData } 
          : null
      })),
      
      // Seller switching actions
      switchToSeller: () => {
        const state = get();
        if (state.currentUser) {
          // Switch existing user to seller mode
          const updatedUser = {
            ...state.currentUser,
            role: 'seller'
          };
          set({ 
            currentUser: updatedUser,
            isSeller: true 
          });
          console.log('🔄 Switched to seller mode');
        }
      },
      
      switchToUser: () => {
        const state = get();
        if (state.currentUser) {
          // Switch existing user to regular user mode
          const updatedUser = {
            ...state.currentUser,
            role: 'user'
          };
          set({ 
            currentUser: updatedUser,
            isSeller: false 
          });
          console.log('🔄 Switched to user mode');
        }
      },
      
      // Cart actions
      addToCart: (product, quantity = 1) => {
        console.log('🛒 Adding to cart:', product.title || product.name);
        
        const state = get();
        const existingItem = state.cart.find(item => item.productId === product.id);
        
        const productPrice = product.price || product.currentPrice || 0;
        const discountPercentage = product.discountPercentage || 0;
        const discountedPrice = state.getDiscountedPrice(productPrice, discountPercentage);
        const productName = product.title || product.name || 'Unnamed Product';
        const thumbnail = product.thumbnail || product.image || product.images?.[0] || '';
        const category = product.category || '';
        
        let newCart: CartItem[];
        
        if (existingItem) {
          newCart = state.cart.map(item =>
            item.productId === product.id
              ? { 
                  ...item, 
                  quantity: item.quantity + quantity,
                  price: discountedPrice,
                  productName: productName,
                  thumbnail: thumbnail,
                  category: category,
                  isSelected: item.isSelected
                }
              : item
          );
        } else {
          newCart = [
            ...state.cart,
            {
              id: Date.now(),
              productId: product.id,
              productName: productName,
              quantity,
              price: discountedPrice,
              originalPrice: productPrice,
              thumbnail: thumbnail,
              discountPercentage: discountPercentage,
              category: category,
              isSelected: true,
            }
          ];
        }
        
        set({ cart: newCart });
        state.calculateCartTotal();
      },
      
      removeFromCart: (itemId) => {
        const state = get();
        const newCart = state.cart.filter(item => item.id !== itemId);
        set({ cart: newCart });
        state.calculateCartTotal();
      },
      
      updateCartItem: (itemId, quantity) => {
        const state = get();
        if (quantity <= 0) {
          state.removeFromCart(itemId);
          return;
        }
        
        const newCart = state.cart.map(item =>
          item.id === itemId
            ? { ...item, quantity }
            : item
        );
        
        set({ cart: newCart });
        state.calculateCartTotal();
      },
      
      clearCart: () => set({ 
        cart: [], 
        cartTotal: 0, 
        cartCount: 0 
      }),

      toggleCartItemSelection: (itemId) => set((state) => {
        const newCart = state.cart.map((item) =>
          item.id === itemId
            ? { ...item, isSelected: !item.isSelected }
            : item
        );
        return { cart: newCart };
      }),

      toggleAllSelection: (checked) => set((state) => {
        const newCart = state.cart.map((item) => ({ 
          ...item, 
          isSelected: checked 
        }));
        return { cart: newCart };
      }),

      checkoutSelectedItems: () => {
        const state = get();
        const newCart = state.cart.filter(item => !item.isSelected);
        set({ cart: newCart });
        state.calculateCartTotal();
        console.log('✅ Checkout complete, removed selected items:', newCart.length, 'items remaining');
      },
      
      // Order Management
      createOrder: (orderData) => {
        const state = get();
        const selectedItems = state.cart.filter(item => item.isSelected);
        
        if (selectedItems.length === 0) {
          throw new Error('No items selected for checkout');
        }
        
        const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = 15;
        const tax = subtotal * 0.09;
        const total = subtotal + shippingFee + tax;
        
        const newOrder: Order = {
          id: Date.now(),
          userId: state.currentUser?.id || 0,
          customerName: state.currentUser?.name || 'Guest',
          customerEmail: state.currentUser?.email || '',
          customerPhone: state.currentUser?.phone || '',
          items: selectedItems.map(item => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            thumbnail: item.thumbnail
          })),
          subtotal,
          shippingFee,
          tax,
          total,
          status: 'pending',
          shippingAddress: orderData.shippingAddress || state.currentUser?.address || '',
          paymentMethod: orderData.paymentMethod || 'credit_card',
          paymentStatus: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...orderData
        };
        
        // Update sold count for products
        selectedItems.forEach(item => {
          const product = state.sellerProducts.find(p => p.id === item.productId);
          if (product) {
            state.updateSellerProduct(item.productId, {
              sold: product.sold + item.quantity,
              stock: product.stock - item.quantity
            });
          }
        });
        
        set((state) => ({
          orders: [...state.orders, newOrder],
          cart: state.cart.filter(item => !item.isSelected)
        }));
        
        // Update stats
        state.updateSellerStats();
        
        console.log('✅ Order created:', newOrder);
        return newOrder;
      },
      
      updateOrderStatus: (orderId, status) => {
        const state = get();
        const updatedOrders = state.orders.map(order =>
          order.id === orderId
            ? { 
                ...order, 
                status, 
                updatedAt: new Date().toISOString(),
                // If shipping, update payment status to paid
                paymentStatus: status === 'shipped' ? 'paid' : order.paymentStatus
              }
            : order
        );
        
        set({ orders: updatedOrders });
        state.updateSellerStats();
        
        // In a real app, send notification to user here
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
          console.log(`📢 Notification sent to ${order.customerName}: Order #${orderId} status updated to ${status}`);
        }
      },
      
      cancelOrder: (orderId) => {
        const state = get();
        const updatedOrders = state.orders.map(order =>
          order.id === orderId
            ? { 
                ...order, 
                status: 'cancelled', 
                paymentStatus: 'refunded',
                updatedAt: new Date().toISOString()
              }
            : order
        );
        
        // Restore stock for cancelled items
        const cancelledOrder = state.orders.find(o => o.id === orderId);
        if (cancelledOrder) {
          cancelledOrder.items.forEach(item => {
            const product = state.sellerProducts.find(p => p.id === item.productId);
            if (product) {
              state.updateSellerProduct(item.productId, {
                sold: product.sold - item.quantity,
                stock: product.stock + item.quantity
              });
            }
          });
        }
        
        set({ orders: updatedOrders });
        state.updateSellerStats();
      },
      
      getCustomerOrders: () => {
        const state = get();
        const userId = state.currentUser?.id;
        return state.orders.filter(order => order.userId === userId);
      },
      
      getSellerOrders: () => {
        // In a real app, this would filter by seller
        // For now, return all orders
        const state = get();
        return state.orders;
      },
      
      // Seller Product Management
      addSellerProduct: (productData) => {
        const state = get();
        const newProduct: SellerProduct = {
          id: Date.now(),
          title: productData.title || 'New Product',
          description: productData.description || '',
          price: productData.price || 0,
          category: productData.category || 'uncategorized',
          stock: productData.stock || 0,
          sold: 0,
          rating: 0,
          images: productData.images || [],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...productData
        };
        
        set((state) => ({
          sellerProducts: [...state.sellerProducts, newProduct]
        }));
        
        state.updateSellerStats();
      },
      
      updateSellerProduct: (productId, updates) => {
        const state = get();
        const updatedProducts = state.sellerProducts.map(product =>
          product.id === productId
            ? { ...product, ...updates, updatedAt: new Date().toISOString() }
            : product
        );
        
        set({ sellerProducts: updatedProducts });
        state.updateSellerStats();
      },
      
      deleteSellerProduct: (productId) => {
        const state = get();
        set({
          sellerProducts: state.sellerProducts.filter(product => product.id !== productId)
        });
        state.updateSellerStats();
      },
      
      getSellerProducts: () => {
        const state = get();
        return state.sellerProducts;
      },
      
      updateProductStock: (productId, newStock) => {
        const state = get();
        state.updateSellerProduct(productId, { 
          stock: newStock,
          status: newStock === 0 ? 'out_of_stock' : 'active'
        });
      },
      
      // Seller Stats
      updateSellerStats: () => {
        const state = get();
        const orders = state.orders;
        const products = state.sellerProducts;
        
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const totalProducts = products.length;
        const totalCustomers = [...new Set(orders.map(order => order.userId))].length;
        
        const popularCategories = products.reduce((acc, product) => {
          const existing = acc.find(cat => cat.name === product.category);
          if (existing) {
            existing.count += product.sold;
          } else {
            acc.push({ name: product.category, count: product.sold });
          }
          return acc;
        }, [] as Array<{ name: string; count: number }>);
        
        set({
          sellerStats: {
            totalRevenue,
            totalOrders,
            totalProducts,
            totalCustomers,
            monthlyGrowth: state.sellerStats.monthlyGrowth, // Keep existing growth for now
            popularCategories: popularCategories.sort((a, b) => b.count - a.count)
          }
        });
      },
      
      // Products actions
      setProducts: (products) => set({ products }),
      
      // Helper functions
      getDiscountedPrice: (price, discountPercentage = 0) => {
        return discountPercentage > 0 
          ? price - (price * (discountPercentage / 100))
          : price;
      },
      
      calculateCartTotal: () => {
        const state = get();
        const total = state.cart.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        );
        const count = state.cart.reduce((sum, item) => 
          sum + item.quantity, 0
        );
        
        set({ cartTotal: total, cartCount: count });
      }
    }),
    {
      name: 'xelura-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        isLoggedIn: state.isLoggedIn,
        isSeller: state.isSeller,
        cart: state.cart,
        cartTotal: state.cartTotal,
        cartCount: state.cartCount,
        sellerProducts: state.sellerProducts,
        orders: state.orders,
        sellerStats: state.sellerStats
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.calculateCartTotal();
          state.updateSellerStats();
        }
      }
    }
  )
);

// Initialize with dummy users (simulating database)
export const initializeStore = () => {
  const store = useUserStore.getState();
  store.initialize();
};

// Export a helper function for debugging
export const logStoreState = () => {
  const state = useUserStore.getState();
  console.log('📦 Store State:', {
    isLoggedIn: state.isLoggedIn,
    user: state.currentUser,
    isSeller: state.isSeller,
    cart: state.cart,
    cartTotal: state.cartTotal,
    cartCount: state.cartCount,
    sellerProducts: state.sellerProducts.length,
    orders: state.orders.length,
    sellerStats: state.sellerStats
  });
};
// userStore.ts - FINAL VERSION (CLEAN - NO DEFAULT DATA)
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
  sellerId?: number; // Always 2 for single seller
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
  sellerId?: number; // Always 2 for single seller
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
  sellerId?: number; // Always 2
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
  sellerId: number; // Always 2
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  thumbnail: string;
  sellerId: number; // Always 2
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
  sellerId?: number; // Always 2 for single seller
}

export interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  monthlyGrowth: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  popularCategories: Array<{ name: string; count: number }>;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'order' | 'promotion' | 'system' | 'new_order' | 'cancelled' | 'shipped' | 'delivered';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  createdAt: string;
}

interface UserStore {
  // User state
  currentUser: User | null;
  isLoggedIn: boolean;
  isSeller: boolean;
  
  // Notification state
  notifications: Notification[];
  unreadNotificationCount: number;
  messages: Message[];
  unreadMessageCount: number;
  
  // Cart state
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  
  // Products state (from API)
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
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markNotificationAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
  clearAllNotifications: (userId?: number) => void;
  addMessage: (message: Message) => void;
  markMessageAsRead: (id: number) => void;
  
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
  createOrder: (orderData: {
    shippingAddress: string;
    paymentMethod: Order['paymentMethod'];
    notes?: string;
  }) => Order[];
  updateOrderStatus: (orderId: number, status: Order['status']) => void;
  sendOrderNotification: (orderId: number, status: Order['status'] | 'status_update', customerEmail: string) => void;
  cancelOrder: (orderId: number) => void;
  deleteOrder: (orderId: number) => void; // NEW: Delete order completely
  deleteAllOrders: () => void; // NEW: Delete all orders
  getCustomerOrders: () => Order[];
  getSellerOrders: (sellerId?: number) => Order[];
  
  // Seller Product Management
  addSellerProduct: (product: Partial<SellerProduct>) => void;
  updateSellerProduct: (productId: number, updates: Partial<SellerProduct>) => void;
  deleteSellerProduct: (productId: number) => void;
  getSellerProducts: () => SellerProduct[];
  updateProductStock: (productId: number, newStock: number) => void;
  
  // Seller Stats
  updateSellerStats: (sellerId?: number) => void;
  
  // Products actions
  setProducts: (products: Product[]) => void;
  syncProductsWithAPI: () => Promise<void>;
  
  // Helper functions
  getDiscountedPrice: (price: number, discountPercentage?: number) => number;
  calculateCartTotal: () => void;
  
  // Initialize with demo user
  initialize: () => void;
}

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

// EMPTY initial data
const initialNotifications: Notification[] = [];
const initialMessages: Message[] = [];
const initialOrders: Order[] = [];

// Initial Seller Products - ALL belong to seller ID 2
const initialSellerProducts: SellerProduct[] = [
  {
    id: 1,
    title: 'Premium Smartphone X',
    description: 'Latest smartphone with advanced features',
    price: 999,
    category: 'smartphones',
    stock: 45,
    sold: 0,
    rating: 4.5,
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: 2
  },
  {
    id: 2,
    title: 'Luxury Watch Pro',
    description: 'Premium luxury watch with diamond dial',
    price: 2499,
    category: 'womens-watches',
    stock: 12,
    sold: 0,
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=400&fit=crop'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: 2
  },
  {
    id: 3,
    title: 'Wireless Headphones',
    description: 'Noise-cancelling wireless headphones',
    price: 299,
    category: 'electronics',
    stock: 25,
    sold: 0,
    rating: 4.3,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: 2
  }
];

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state - EMPTY
      currentUser: null,
      isLoggedIn: false,
      isSeller: false,
      
      notifications: initialNotifications,
      unreadNotificationCount: 0,
      messages: initialMessages,
      unreadMessageCount: 0,
      
      cart: [],
      cartTotal: 0,
      cartCount: 0,
      products: [],
      
      sellerProducts: initialSellerProducts,
      orders: initialOrders,
      sellerStats: {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 3,
        totalCustomers: 0,
        monthlyGrowth: 0,
        lowStockProducts: 1,
        outOfStockProducts: 0,
        popularCategories: []
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
            unreadNotificationCount: 0,
            unreadMessageCount: 0,
          });
        }
      },
      
      // User actions
      login: (user) => set({ 
        currentUser: user, 
        isLoggedIn: true,
        isSeller: user.role === 'seller',
        unreadNotificationCount: get().notifications.filter(n => !n.read && n.userId === user.id).length,
        unreadMessageCount: 0,
      }),
      
      logout: () => set({ 
        currentUser: null, 
        isLoggedIn: false,
        isSeller: false,
        cart: [],
        cartTotal: 0,
        cartCount: 0,
        unreadNotificationCount: 0,
        unreadMessageCount: 0,
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
          isSeller: false,
          unreadNotificationCount: 0,
          unreadMessageCount: 0,
        });
      },
      
      updateProfile: (userData) => set((state) => ({
        currentUser: state.currentUser 
          ? { ...state.currentUser, ...userData } 
          : null
      })),
      
      // Notification actions
      addNotification: (notificationData) => {
        const newNotification: Notification = {
          id: Date.now(),
          ...notificationData
        };
        
        set((state) => {
          const newNotifications = [...state.notifications, newNotification];
          const unreadCount = newNotifications.filter(
            n => !n.read && n.userId === state.currentUser?.id
          ).length;
          
          return {
            notifications: newNotifications,
            unreadNotificationCount: unreadCount
          };
        });
        
        console.log('🔔 Notification added:', newNotification.title);
      },
      
      markNotificationAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map(notification =>
            notification.id === id 
              ? { ...notification, read: true }
              : notification
          );
          
          const unreadCount = updatedNotifications.filter(
            n => !n.read && n.userId === state.currentUser?.id
          ).length;
          
          return {
            notifications: updatedNotifications,
            unreadNotificationCount: unreadCount
          };
        });
      },
      
      deleteNotification: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.filter(notification => notification.id !== id);
          const unreadCount = updatedNotifications.filter(
            n => !n.read && n.userId === state.currentUser?.id
          ).length;
          
          return {
            notifications: updatedNotifications,
            unreadNotificationCount: unreadCount
          };
        });
        
        console.log('🗑️ Notification deleted:', id);
      },
      
      clearAllNotifications: (userId?: number) => {
        set((state) => {
          if (userId) {
            // Clear notifications for specific user
            const filteredNotifications = state.notifications.filter(n => n.userId !== userId);
            return {
              notifications: filteredNotifications,
              unreadNotificationCount: 0
            };
          } else {
            // Clear all notifications
            return {
              notifications: [],
              unreadNotificationCount: 0
            };
          }
        });
        
        console.log('🗑️ All notifications cleared');
      },
      
      // Message actions (simplified for single seller)
      addMessage: (message) => {
        set((state) => {
          const newMessages = [...state.messages, message];
          const unreadCount = newMessages.filter(
            m => !m.read && m.receiverId === state.currentUser?.id
          ).length;
          
          return {
            messages: newMessages,
            unreadMessageCount: unreadCount
          };
        });
      },
      
      markMessageAsRead: (id) => {
        set((state) => {
          const updatedMessages = state.messages.map(message =>
            message.id === id 
              ? { ...message, read: true }
              : message
          );
          
          const unreadCount = updatedMessages.filter(
            m => !m.read && m.receiverId === state.currentUser?.id
          ).length;
          
          return {
            messages: updatedMessages,
            unreadMessageCount: unreadCount
          };
        });
      },
      
      // Seller switching actions
      switchToSeller: () => {
        const state = get();
        if (state.currentUser) {
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
        const sellerId = 2; // Always seller ID 2
        
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
                  sellerId: sellerId,
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
              sellerId: sellerId,
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
      
      // Order Management - Single Seller
      createOrder: (orderData) => {
        const state = get();
        const selectedItems = state.cart.filter(item => item.isSelected);
        
        if (selectedItems.length === 0) {
          throw new Error('No items selected for checkout');
        }
        
        const sellerId = 2; // Always seller ID 2
        
        const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = 15;
        const tax = subtotal * 0.09;
        const total = subtotal + shippingFee + tax;
        
        const newOrder: Order = {
          id: Date.now() + Math.floor(Math.random() * 1000),
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
            thumbnail: item.thumbnail,
            sellerId: sellerId
          })),
          subtotal,
          shippingFee,
          tax,
          total,
          status: 'pending',
          shippingAddress: orderData.shippingAddress || state.currentUser?.address || '',
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
          notes: orderData.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sellerId: sellerId
        };
        
        // Update sold count for products
        selectedItems.forEach(item => {
          const product = state.sellerProducts.find(p => p.id === item.productId);
          if (product) {
            state.updateSellerProduct(item.productId, {
              sold: product.sold + item.quantity,
              stock: Math.max(0, product.stock - item.quantity),
              status: product.stock - item.quantity <= 0 ? 'out_of_stock' : product.status
            });
          }
        });
        
        // Create notification for seller (ID 2) - NEW ORDER
        const sellerNotification = {
          userId: 2,
          type: 'new_order' as const,
          title: '🎉 New Order Received!',
          message: `You have a new order #${newOrder.id} from ${state.currentUser?.name || 'Customer'} for ${usdFormatted.format(total)}`,
          data: { 
            orderId: newOrder.id, 
            customerName: state.currentUser?.name,
            total,
            priority: 'high'
          },
          read: false,
          createdAt: new Date().toISOString()
        };
        state.addNotification(sellerNotification);
        
        // Create notification for customer
        const customerNotification = {
          userId: state.currentUser?.id || 0,
          type: 'order' as const,
          title: 'Order Confirmed',
          message: `Your order #${newOrder.id} has been confirmed`,
          data: { orderId: newOrder.id },
          read: false,
          createdAt: new Date().toISOString()
        };
        
        // Add order to store
        set((state) => ({
          orders: [...state.orders, newOrder],
          cart: state.cart.filter(item => !item.isSelected)
        }));
        
        // Add customer notification
        state.addNotification(customerNotification);
        
        // Update stats for seller 2
        state.updateSellerStats(2);
        
        console.log('✅ Order created for seller 2:', newOrder);
        return [newOrder];
      },
      
      updateOrderStatus: (orderId, status) => {
        const state = get();
        const updatedOrders = state.orders.map(order =>
          order.id === orderId
            ? { 
                ...order, 
                status, 
                updatedAt: new Date().toISOString(),
                paymentStatus: status === 'shipped' ? 'paid' : order.paymentStatus
              }
            : order
        );
        
        // Create notification for customer
        const order = state.orders.find(o => o.id === orderId);
        if (order && order.userId) {
          const statusNotification = {
            userId: order.userId,
            type: status as any,
            title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your order #${orderId} status has been updated to ${status}`,
            data: { orderId, status },
            read: false,
            createdAt: new Date().toISOString()
          };
          state.addNotification(statusNotification);
        }
        
        // Create notification for seller
        const sellerNotification = {
          userId: 2,
          type: status as any,
          title: `Order #${orderId} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: `Order #${orderId} has been marked as ${status}`,
          data: { orderId, status },
          read: false,
          createdAt: new Date().toISOString()
        };
        state.addNotification(sellerNotification);
        
        set({ orders: updatedOrders });
        state.updateSellerStats(2);
        
        console.log(`📢 Order #${orderId} status updated to ${status}`);
      },
      
      sendOrderNotification: (orderId, status, customerEmail) => {
        console.log(`📧 Sending ${status} notification for order #${orderId} to ${customerEmail}`);
        
        const state = get();
        const order = state.orders.find(o => o.id === orderId);
        
        if (order) {
          const notification = {
            userId: order.userId,
            type: 'order' as const,
            title: 'Order Notification',
            message: `Your order #${orderId} has been ${status}`,
            data: { orderId, status },
            read: false,
            createdAt: new Date().toISOString()
          };
          
          state.addNotification(notification);
          console.log(`✅ Notification sent to user ${order.userId}`);
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
                stock: product.stock + item.quantity,
                status: product.stock + item.quantity > 0 ? 'active' : product.status
              });
            }
          });
          
          // Create notification for cancellation
          if (cancelledOrder.userId) {
            const cancelNotification = {
              userId: cancelledOrder.userId,
              type: 'cancelled' as const,
              title: 'Order Cancelled',
              message: `Your order #${orderId} has been cancelled`,
              data: { orderId, status: 'cancelled' },
              read: false,
              createdAt: new Date().toISOString()
            };
            state.addNotification(cancelNotification);
          }
        }
        
        set({ orders: updatedOrders });
        state.updateSellerStats(2);
      },
      
      // NEW: Delete order completely
      deleteOrder: (orderId) => {
        const state = get();
        const orderToDelete = state.orders.find(order => order.id === orderId);
        
        // Create deletion notification if order exists
        if (orderToDelete) {
          const deleteNotification = {
            userId: orderToDelete.userId,
            type: 'system' as const,
            title: 'Order Deleted',
            message: `Order #${orderId} has been deleted by the seller`,
            data: { orderId, status: 'deleted' },
            read: false,
            createdAt: new Date().toISOString()
          };
          state.addNotification(deleteNotification);
        }
        
        // Remove the order
        set((state) => ({
          orders: state.orders.filter(order => order.id !== orderId)
        }));
        
        // Update seller stats
        state.updateSellerStats(2);
        console.log(`🗑️ Order #${orderId} deleted`);
      },
      
      // NEW: Delete all orders
      deleteAllOrders: () => {
        const state = get();
        
        // Create notifications for all affected users
        const userIds = [...new Set(state.orders.map(order => order.userId))];
        userIds.forEach(userId => {
          const deleteNotification = {
            userId,
            type: 'system' as const,
            title: 'Orders Cleared',
            message: 'All orders have been cleared by the seller',
            data: { action: 'clear_all_orders' },
            read: false,
            createdAt: new Date().toISOString()
          };
          state.addNotification(deleteNotification);
        });
        
        // Remove all orders
        set({ orders: [] });
        
        // Update seller stats
        state.updateSellerStats(2);
        console.log('🗑️ All orders deleted');
      },
      
      getCustomerOrders: () => {
        const state = get();
        const userId = state.currentUser?.id;
        return state.orders.filter(order => order.userId === userId);
      },
      
      getSellerOrders: (sellerId?: number) => {
        const state = get();
        const targetSellerId = sellerId || 2; // Always seller 2
        
        // Return orders for seller 2
        return state.orders.filter(order => order.sellerId === targetSellerId);
      },
      
      // Seller Product Management
      addSellerProduct: (productData) => {
        const state = get();
        const sellerId = 2; // Always seller ID 2
        
        const newProduct: SellerProduct = {
          id: Date.now(),
          title: productData.title || 'New Product',
          description: productData.description || '',
          price: productData.price || 0,
          category: productData.category || 'uncategorized',
          stock: productData.stock || 0,
          sold: 0,
          rating: 0,
          images: productData.images || ['https://via.placeholder.com/300x300?text=New+Product'],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sellerId: sellerId,
          ...productData
        };
        
        set((state) => ({
          sellerProducts: [...state.sellerProducts, newProduct]
        }));
        
        state.updateSellerStats(sellerId);
      },
      
      updateSellerProduct: (productId, updates) => {
        const state = get();
        const updatedProducts = state.sellerProducts.map(product =>
          product.id === productId
            ? { ...product, ...updates, updatedAt: new Date().toISOString() }
            : product
        );
        
        set({ sellerProducts: updatedProducts });
        state.updateSellerStats(2);
      },
      
      deleteSellerProduct: (productId) => {
        const state = get();
        set({
          sellerProducts: state.sellerProducts.filter(product => product.id !== productId)
        });
        
        state.updateSellerStats(2);
      },
      
      getSellerProducts: () => {
        const state = get();
        return state.sellerProducts.filter(product => product.sellerId === 2);
      },
      
      updateProductStock: (productId, newStock) => {
        const state = get();
        state.updateSellerProduct(productId, { 
          stock: newStock,
          status: newStock === 0 ? 'out_of_stock' : 'active'
        });
      },
      
      // Seller Stats - Single Seller
      updateSellerStats: (sellerId?: number) => {
        const state = get();
        const targetSellerId = 2; // Always seller 2
        
        // Filter orders for seller 2
        const sellerOrders = state.orders.filter(order => order.sellerId === targetSellerId);
        
        // Filter products for seller 2
        const sellerProducts = state.sellerProducts.filter(product => product.sellerId === targetSellerId);
        
        const totalRevenue = sellerOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = sellerOrders.length;
        const totalProducts = sellerProducts.length;
        const totalCustomers = [...new Set(sellerOrders.map(order => order.userId))].length;
        
        const popularCategories = sellerProducts.reduce((acc, product) => {
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
            monthlyGrowth: totalOrders > 0 ? 12.5 : 0,
            lowStockProducts: sellerProducts.filter(p => p.stock < 10 && p.stock > 0).length,
            outOfStockProducts: sellerProducts.filter(p => p.stock === 0).length,
            popularCategories: popularCategories.sort((a, b) => b.count - a.count)
          }
        });
      },
      
      // Products actions
      setProducts: (products) => set({ products }),
      
      // Sync products from API
      syncProductsWithAPI: async () => {
        try {
          const PRODUCTS_ENDPOINT = 'https://dummyjson.com/products';
          const response = await fetch(`${PRODUCTS_ENDPOINT}?limit=20`);
          const data = await response.json();
          
          const enhancedProducts = data.products.map((product: any) => ({
            ...product,
            sellerId: 2, // Always seller 2
            sellerInfo: {
              id: 2,
              name: "Luxury Elite Store",
              rating: 4.8,
              verified: true
            }
          }));
          
          set({ products: enhancedProducts });
          console.log('✅ Synced products from API');
        } catch (error) {
          console.error('❌ Error syncing products:', error);
        }
      },
      
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
        notifications: state.notifications,
        messages: state.messages,
        sellerProducts: state.sellerProducts,
        orders: state.orders,
        sellerStats: state.sellerStats
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.calculateCartTotal();
          
          // Update unread counts after rehydration
          if (state.currentUser) {
            const unreadNotificationCount = state.notifications.filter(
              n => !n.read && n.userId === state.currentUser?.id
            ).length;
            
            state.unreadNotificationCount = unreadNotificationCount;
          }
          
          // Update seller stats
          state.updateSellerStats(2);
        }
      }
    }
  )
);

// Helper for currency formatting
const usdFormatted = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export const initializeStore = () => {
  const store = useUserStore.getState();
  store.initialize();
};

export const logStoreState = () => {
  const state = useUserStore.getState();
  console.log('📦 Store State:', {
    isLoggedIn: state.isLoggedIn,
    user: state.currentUser,
    isSeller: state.isSeller,
    cart: state.cart.length,
    cartTotal: state.cartTotal,
    cartCount: state.cartCount,
    notifications: state.notifications.length,
    unreadNotifications: state.unreadNotificationCount,
    sellerProducts: state.sellerProducts.length,
    orders: state.orders.length,
    sellerStats: state.sellerStats
  });
};
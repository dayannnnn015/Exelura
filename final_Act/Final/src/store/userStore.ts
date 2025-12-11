// userStore.ts - FINAL VERSION
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface CartItem {
  id: number; // Cart item ID (unique for each cart item)
  productId: number; // Product ID from database
  productName: string;
  quantity: number;
  price: number;
  thumbnail: string;
  discountPercentage?: number;
  originalPrice?: number;
  category?: string;
  // 💡 REQUIRED: Added for checklist functionality
  isSelected: boolean; 
}

// Make Product interface more flexible with optional properties
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
  [key: string]: any; // Allow extra properties
}

// Add a more flexible product type for addToCart
export interface ProductInput {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  discountPercentage?: number;
  stock?: number;
  category?: string;
  qrCode?: string;
  [key: string]: any; // Allow extra properties
}

interface UserStore {
  // User state
  currentUser: User | null;
  isLoggedIn: boolean;
  
  // Cart state
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  
  // Products state (cached)
  products: Product[];
  
  // User actions
  login: (user: User) => void;
  logout: () => void;
  register: (user: User) => void;
  updateProfile: (userData: Partial<User>) => void;
  
  // Cart actions
  addToCart: (product: ProductInput, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateCartItem: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  
  // 💡 REQUIRED: Actions for checklist functionality
  toggleCartItemSelection: (itemId: number) => void;
  toggleAllSelection: (checked: boolean) => void;
  checkoutSelectedItems: () => void; // 💡 NEW: Remove selected items after purchase
  
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
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@xelura.com',
    phone: '+0987654321',
    address: '456 Oak Avenue, Los Angeles, CA',
    createdAt: new Date().toISOString()
  }
];

const defaultUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@xelura.com',
  phone: '+1234567890',
  address: '123 Main Street, New York, NY',
  createdAt: new Date().toISOString()
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isLoggedIn: false,
      cart: [],
      cartTotal: 0,
      cartCount: 0,
      products: [],
      
      // Initialize with demo user
      initialize: () => {
        const { isLoggedIn } = get();
        if (!isLoggedIn) {
          console.log('🔧 Initializing store with demo user');
          set({
            currentUser: defaultUser,
            isLoggedIn: true,
          });
        }
      },
      
      // User actions
      login: (user) => set({ 
        currentUser: user, 
        isLoggedIn: true 
      }),
      
      logout: () => set({ 
        currentUser: null, 
        isLoggedIn: false,
        cart: [],
        cartTotal: 0,
        cartCount: 0
      }),
      
      register: (user) => {
        const newUser = {
          ...user,
          id: DUMMY_USERS.length + 1,
          createdAt: new Date().toISOString()
        };
        
        DUMMY_USERS.push(newUser);
        
        set({ 
          currentUser: newUser, 
          isLoggedIn: true 
        });
      },
      
      updateProfile: (userData) => set((state) => ({
        currentUser: state.currentUser 
          ? { ...state.currentUser, ...userData } 
          : null
      })),
      
      // Cart actions - IMPROVED VERSION WITH BETTER TYPE HANDLING
      addToCart: (product, quantity = 1) => {
        console.log('🛒 Adding to cart:', product.title || product.name);
        
        const state = get();
        const existingItem = state.cart.find(item => item.productId === product.id);
        
        // Use the product's price or default to 0
        const productPrice = product.price || product.currentPrice || 0;
        const discountPercentage = product.discountPercentage || 0;
        const discountedPrice = state.getDiscountedPrice(productPrice, discountPercentage);
        const productName = product.title || product.name || 'Unnamed Product';
        const thumbnail = product.thumbnail || product.image || product.images?.[0] || '';
        const category = product.category || '';
        
        let newCart: CartItem[];
        
        if (existingItem) {
          // Preserve isSelected status when updating existing item
          newCart = state.cart.map(item =>
            item.productId === product.id
              ? { 
                  ...item, 
                  quantity: item.quantity + quantity,
                  price: discountedPrice,
                  productName: productName,
                  thumbnail: thumbnail,
                  category: category,
                  // Keep existing isSelected status
                  isSelected: item.isSelected
                }
              : item
          );
        } else {
          newCart = [
            ...state.cart,
            {
              id: Date.now(), // Unique cart item ID
              productId: product.id,
              productName: productName,
              quantity,
              price: discountedPrice,
              originalPrice: productPrice,
              thumbnail: thumbnail,
              discountPercentage: discountPercentage,
              category: category,
              isSelected: true, // New items are selected by default
            }
          ];
        }
        
        set({ cart: newCart });
        state.calculateCartTotal();
        
        // Debug log
        console.log('✅ Cart after adding:', newCart);
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

      // 💡 REQUIRED: Toggle a single item's selection status
      toggleCartItemSelection: (itemId) => set((state) => {
        const newCart = state.cart.map((item) =>
          item.id === itemId
            ? { ...item, isSelected: !item.isSelected }
            : item
        );
        return { cart: newCart };
      }),

      // 💡 REQUIRED: Toggle all items' selection status
      toggleAllSelection: (checked) => set((state) => {
        const newCart = state.cart.map((item) => ({ 
          ...item, 
          isSelected: checked 
        }));
        return { cart: newCart };
      }),

      // 💡 REQUIRED: Remove only selected items after checkout
      checkoutSelectedItems: () => {
        const state = get();
        // Keep only items that are NOT selected (remove selected ones)
        const newCart = state.cart.filter(item => !item.isSelected);
        set({ cart: newCart });
        state.calculateCartTotal();
        console.log('✅ Checkout complete, removed selected items:', newCart.length, 'items remaining');
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
        console.log('💰 Cart calculated:', { total, count });
      }
    }),
    {
      name: 'xelura-store',
      storage: createJSONStorage(() => localStorage),
      // 💡 IMPORTANT: Ensure cart (with isSelected property) is persisted
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        isLoggedIn: state.isLoggedIn,
        cart: state.cart,
        cartTotal: state.cartTotal,
        cartCount: state.cartCount
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.calculateCartTotal();
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
    cart: state.cart,
    cartTotal: state.cartTotal,
    cartCount: state.cartCount
  });
};
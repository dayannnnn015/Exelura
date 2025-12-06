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
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  thumbnail: string;
  discountPercentage?: number;
  originalPrice?: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  thumbnail: string;
  category: string;
  qrCode: string;
  reviews: string[];
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
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateCartItem: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  
  // Products actions
  setProducts: (products: Product[]) => void;
  
  // Helper computed values
  getDiscountedPrice: (price: number, discountPercentage: number) => number;
  calculateCartTotal: () => void;
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
        
        // Add to dummy users (in a real app, this would be an API call)
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
      
      // Cart actions
      addToCart: (product, quantity = 1) => {
        const state = get();
        const existingItem = state.cart.find(item => item.productId === product.id);
        const discountedPrice = state.getDiscountedPrice(product.price, product.discountPercentage);
        
        let newCart: CartItem[];
        
        if (existingItem) {
          newCart = state.cart.map(item =>
            item.productId === product.id
              ? { 
                  ...item, 
                  quantity: item.quantity + quantity,
                  price: discountedPrice
                }
              : item
          );
        } else {
          newCart = [
            ...state.cart,
            {
              id: Date.now(),
              productId: product.id,
              productName: product.title,
              quantity,
              price: discountedPrice,
              originalPrice: product.price,
              thumbnail: product.thumbnail,
              discountPercentage: product.discountPercentage
            }
          ];
        }
        
        set({ cart: newCart });
        get().calculateCartTotal();
      },
      
      removeFromCart: (itemId) => {
        const newCart = get().cart.filter(item => item.id !== itemId);
        set({ cart: newCart });
        get().calculateCartTotal();
      },
      
      updateCartItem: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }
        
        const newCart = get().cart.map(item =>
          item.id === itemId
            ? { ...item, quantity }
            : item
        );
        
        set({ cart: newCart });
        get().calculateCartTotal();
      },
      
      clearCart: () => set({ 
        cart: [], 
        cartTotal: 0, 
        cartCount: 0 
      }),
      
      // Products actions
      setProducts: (products) => set({ products }),
      
      // Helper functions
      getDiscountedPrice: (price, discountPercentage) => {
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
  // You could load initial data here
};
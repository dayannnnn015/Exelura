// store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  gender?: string;
  dob?: string;
  username?: string;
}

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  thumbnail: string;
  quantity: number;
  category: string;
  brand: string;
}

interface UserStore {
  // Auth state
  currentUser: User | null;
  isLoggedIn: boolean;
  
  // Cart state
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  
  // Auth actions
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  
  // Cart actions
  addToCart: (product: any, quantity?: number) => void;
  updateCartItem: (itemId: number, newQuantity: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  
  // Initialize
  initialize: () => void;
}

const defaultUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@xelura.com',
  phone: '+1234567890',
  address: '123 Main Street, New York, NY',
  createdAt: new Date().toISOString(),
  gender: 'male',
  dob: '1990-01-01',
  username: 'johndoe'
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isLoggedIn: false,
      cart: [],
      cartCount: 0,
      cartTotal: 0,

      // Auth actions
      login: (user: User) => {
        console.log('🔐 Logging in user:', user.name);
        set({
          currentUser: user,
          isLoggedIn: true,
        });
      },

      logout: () => {
        console.log('🔐 Logging out');
        set({
          currentUser: null,
          isLoggedIn: false,
          cart: [],
          cartCount: 0,
          cartTotal: 0,
        });
      },

      updateProfile: (updates: Partial<User>) => {
        set((state) => ({
          currentUser: state.currentUser 
            ? { ...state.currentUser, ...updates }
            : null
        }));
      },

      // Cart actions
      addToCart: (product: any, quantity: number = 1) => {
        console.log('🛒 Adding to cart:', {
          productId: product.id,
          name: product.title || product.name,
          quantity
        });

        set((state) => {
          // Ensure we have valid product data
          if (!product || !product.id) {
            console.error('❌ Invalid product data:', product);
            return state;
          }

          const productPrice = product.price || product.discountPrice || 0;
          const productThumbnail = product.thumbnail || product.image || product.images?.[0] || '';
          const productName = product.title || product.name || 'Unnamed Product';
          
          // Check if product already exists in cart
          const existingItemIndex = state.cart.findIndex(item => 
            item.productId === product.id || item.id === product.id
          );

          let updatedCart: CartItem[];
          
          if (existingItemIndex >= 0) {
            // Update quantity if product exists
            updatedCart = [...state.cart];
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity: updatedCart[existingItemIndex].quantity + quantity,
              price: productPrice,
              originalPrice: product.price || productPrice,
              discountPercentage: product.discountPercentage || 0,
            };
            console.log(`📈 Updated quantity for product ${product.id}`);
          } else {
            // Add new product to cart
            const newItem: CartItem = {
              id: product.id || Date.now(),
              productId: product.id,
              productName: productName,
              price: productPrice,
              originalPrice: product.price || productPrice,
              discountPercentage: product.discountPercentage || 0,
              thumbnail: productThumbnail,
              quantity: quantity,
              category: product.category || 'Uncategorized',
              brand: product.brand || 'Unknown Brand',
            };
            updatedCart = [...state.cart, newItem];
            console.log(`🆕 Added new product to cart: ${productName}`);
          }

          // Calculate totals
          const cartCount = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
          const cartTotal = updatedCart.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
          );

          console.log('📊 Cart updated:', { 
            items: updatedCart.length, 
            cartCount, 
            cartTotal 
          });

          return {
            cart: updatedCart,
            cartCount,
            cartTotal,
          };
        });
      },

      updateCartItem: (itemId: number, newQuantity: number) => {
        console.log('✏️ Updating cart item:', { itemId, newQuantity });
        
        set((state) => {
          const updatedCart = state.cart
            .map(item =>
              item.id === itemId
                ? { ...item, quantity: newQuantity }
                : item
            )
            .filter(item => item.quantity > 0); // Remove items with 0 quantity

          const cartCount = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
          const cartTotal = updatedCart.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
          );

          console.log('📊 Cart item updated:', { 
            items: updatedCart.length, 
            cartCount, 
            cartTotal 
          });

          return {
            cart: updatedCart,
            cartCount,
            cartTotal,
          };
        });
      },

      removeFromCart: (itemId: number) => {
        console.log('🗑️ Removing cart item:', itemId);
        
        set((state) => {
          const updatedCart = state.cart.filter(item => item.id !== itemId);
          const cartCount = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
          const cartTotal = updatedCart.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
          );

          console.log('📊 Cart item removed:', { 
            items: updatedCart.length, 
            cartCount, 
            cartTotal 
          });

          return {
            cart: updatedCart,
            cartCount,
            cartTotal,
          };
        });
      },

      clearCart: () => {
        console.log('🧹 Clearing cart');
        set({
          cart: [],
          cartCount: 0,
          cartTotal: 0,
        });
      },

      // Initialize store with default user for demo
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
    }),
    {
      name: 'xelura-user-store', // name for localStorage key
      partialize: (state) => ({
        currentUser: state.currentUser,
        isLoggedIn: state.isLoggedIn,
        cart: state.cart,
        cartCount: state.cartCount,
        cartTotal: state.cartTotal,
      }),
    }
  )
);

// Export a function to initialize the store
export const initializeStore = () => {
  useUserStore.getState().initialize();
};
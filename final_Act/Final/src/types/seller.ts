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

export interface SellerOrder {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: 'credit_card' | 'paypal' | 'gcash' | 'paymaya' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
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

export interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  monthlyGrowth: number;
  popularCategories: Array<{ name: string; count: number }>;
}

export interface InventoryAlert {
  id: number;
  productId: number;
  productName: string;
  currentStock: number;
  threshold: number;
  alertType: 'low_stock' | 'out_of_stock';
  createdAt: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
}
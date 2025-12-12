
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  LinearProgress,
  Button,
  alpha,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as InventoryIcon,
  ShoppingBag as OrderIcon,
  TrendingUp as TrendingIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  LocalShipping as ShippingIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  BarChart as ChartIcon,
  Inventory2 as StockIcon,
  ArrowBack as ArrowBackIcon,
  SwitchAccount as SwitchAccountIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  AddPhotoAlternate as ImageIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import {
  GetSellerProducts,
  GetSellerStats,
  UpdateSellerProductStock,
  AddSellerProduct,
  DeleteSellerProduct
} from '../API/ProductsAPI';

// Mock data types
interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: 'active' | 'out_of_stock' | 'draft' | 'inactive';
  thumbnail: string;
  rating: number;
  description?: string;
  sellerId?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Order {
  id: number;
  customer: string;
  date: string;
  total: number;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
  paymentMethod: string;
  address: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactElement;
  color: string;
}

interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  monthlyGrowth: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  popularCategories: Array<{ name: string; count: number }>;
}

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SellerStats | null>(null);
  
  // Add Product Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: ''
  });
  
  // Edit Stock Dialog State
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState('');

  const { currentUser, isSeller, switchToUser, updateSellerProduct, deleteSellerProduct } = useUserStore();
  const navigate = useNavigate();

  // Check if user is a seller
  useEffect(() => {
    if (!isSeller) {
      setNotification({
        open: true,
        message: 'You need to switch to seller mode to access the dashboard.',
        type: 'warning'
      });
    }
  }, [isSeller]);

  // Fetch seller data from API
  useEffect(() => {
    const fetchSellerData = async () => {
      if (!isSeller) return;
      
      setLoading(true);
      try {
        const sellerId = currentUser?.id || 2;
        
        // Fetch seller products from API
        const sellerProducts = await GetSellerProducts(sellerId);
        const formattedProducts: Product[] = sellerProducts.map((product: any) => ({
          id: product.id,
          title: product.title,
          category: product.category || 'uncategorized',
          price: product.price,
          stock: product.stock || 0,
          sold: product.sold || 0,
          status: product.status || (product.stock > 0 ? 'active' : 'out_of_stock'),
          thumbnail: product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/300x300?text=Product',
          rating: product.rating || 4.0,
          description: product.description,
          sellerId: product.sellerId,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }));
        
        setProducts(formattedProducts);
        
        // Fetch seller stats
        const statsData = await GetSellerStats(sellerId);
        setStats(statsData);
        
        // Mock orders (in real app, this would come from API)
        const mockOrders: Order[] = [
          { id: 1001, customer: 'John Doe', date: '2024-03-15', total: 999, status: 'pending', items: 2, paymentMethod: 'Credit Card', address: '123 Main St, New York', customerEmail: 'john@example.com', customerPhone: '+1234567890' },
          { id: 1002, customer: 'Jane Smith', date: '2024-03-14', total: 2499, status: 'approved', items: 1, paymentMethod: 'PayPal', address: '456 Oak Ave, LA', customerEmail: 'jane@example.com', customerPhone: '+0987654321' },
          { id: 1003, customer: 'Robert Brown', date: '2024-03-13', total: 1898, status: 'shipped', items: 3, paymentMethod: 'GCash', address: '789 Pine Rd, Chicago', customerEmail: 'robert@example.com', customerPhone: '+1122334455' },
          { id: 1004, customer: 'Emily Davis', date: '2024-03-12', total: 299, status: 'delivered', items: 1, paymentMethod: 'Credit Card', address: '321 Elm St, Miami', customerEmail: 'emily@example.com', customerPhone: '+5566778899' },
          { id: 1005, customer: 'Michael Wilson', date: '2024-03-11', total: 159, status: 'cancelled', items: 2, paymentMethod: 'PayMaya', address: '654 Birch Ln, Seattle', customerEmail: 'michael@example.com', customerPhone: '+9988776655' },
          { id: 1006, customer: 'Sarah Johnson', date: '2024-03-10', total: 899, status: 'pending', items: 1, paymentMethod: 'Bank Transfer', address: '987 Cedar Blvd, Austin', customerEmail: 'sarah@example.com', customerPhone: '+5544332211' },
        ];
        
        setOrders(mockOrders);
        
      } catch (error) {
        console.error('Error fetching seller data:', error);
        setNotification({
          open: true,
          message: 'Failed to load seller data. Using mock data instead.',
          type: 'error'
        });
        
        // Fallback to mock data
        const mockProducts: Product[] = [
          { id: 1, title: 'Premium Smartphone X', category: 'smartphones', price: 999, stock: 45, sold: 120, status: 'active', thumbnail: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150&h=150&fit=crop', rating: 4.5 },
          { id: 2, title: 'Luxury Watch Pro', category: 'womens-watches', price: 2499, stock: 12, sold: 45, status: 'active', thumbnail: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=150&h=150&fit=crop', rating: 4.8 },
          { id: 3, title: 'Designer Handbag', category: 'womens-bags', price: 899, stock: 0, sold: 78, status: 'out_of_stock', thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&h=150&fit=crop', rating: 4.3 },
          { id: 4, title: 'Wireless Headphones', category: 'electronics', price: 299, stock: 23, sold: 210, status: 'active', thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop', rating: 4.6 },
          { id: 5, title: 'Fitness Tracker', category: 'accessories', price: 199, stock: 56, sold: 89, status: 'active', thumbnail: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=150&h=150&fit=crop', rating: 4.2 },
          { id: 6, title: 'Gaming Laptop', category: 'laptops', price: 1899, stock: 8, sold: 34, status: 'active', thumbnail: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=150&h=150&fit=crop', rating: 4.7 },
        ];
        
        setProducts(mockProducts);
        setStats({
          totalRevenue: 24580,
          totalOrders: 156,
          totalProducts: 42,
          totalCustomers: 1245,
          monthlyGrowth: 12.5,
          lowStockProducts: 3,
          outOfStockProducts: 2,
          popularCategories: [
            { name: 'smartphones', count: 120 },
            { name: 'laptops', count: 85 },
            { name: 'fragrances', count: 65 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [isSeller, currentUser]);

  const statCards: StatCard[] = [
    { title: 'Total Revenue', value: `$${stats?.totalRevenue.toLocaleString() || '24,580'}`, change: `+${stats?.monthlyGrowth || 12.5}%`, icon: <MoneyIcon />, color: '#4ECDC4' },
    { title: 'Total Orders', value: `${stats?.totalOrders || '156'}`, change: '+8.2%', icon: <OrderIcon />, color: '#FF6B95' },
    { title: 'Products', value: `${stats?.totalProducts || '42'}`, change: '+3.4%', icon: <InventoryIcon />, color: '#7877C6' },
    { title: 'Customers', value: `${stats?.totalCustomers?.toLocaleString() || '1,245'}`, change: '+5.1%', icon: <PeopleIcon />, color: '#F29F58' },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleApproveOrder = async (orderId: number) => {
    try {
      // In a real app, you'd call an API here
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'approved' } : order
      ));
      
      const order = orders.find(o => o.id === orderId);
      if (order) {
        // Simulate sending notification to customer
        simulateOrderNotification(orderId, 'approved', order.customer, order.customerEmail);
        showNotification(`Order #${orderId} has been approved. Customer has been notified.`, 'success');
      }
      
    } catch (error) {
      console.error('Error approving order:', error);
      showNotification('Failed to approve order', 'error');
    }
  };

  const handleShipOrder = async (orderId: number) => {
    try {
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'shipped' } : order
      ));
      
      const order = orders.find(o => o.id === orderId);
      if (order) {
        // Simulate sending notification to customer
        simulateOrderNotification(orderId, 'shipped', order.customer, order.customerEmail);
        showNotification(`Order #${orderId} marked as shipped. Customer has been notified.`, 'success');
      }
      
    } catch (error) {
      console.error('Error shipping order:', error);
      showNotification('Failed to ship order', 'error');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      ));
      
      const order = orders.find(o => o.id === orderId);
      if (order) {
        simulateOrderNotification(orderId, 'cancelled', order.customer, order.customerEmail);
        showNotification(`Order #${orderId} has been cancelled.`, 'warning');
      }
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      showNotification('Failed to cancel order', 'error');
    }
  };

  const simulateOrderNotification = (orderId: number, status: string, customerName: string, customerEmail?: string) => {
    console.log(`📢 SENDING NOTIFICATION TO CUSTOMER:`);
    console.log(`Order ID: #${orderId}`);
    console.log(`Status: ${status.toUpperCase()}`);
    console.log(`Customer: ${customerName}`);
    console.log(`Email: ${customerEmail}`);
    console.log(`Message: Your order #${orderId} has been ${status}.`);
    console.log('---');
    
    // In a real app, this would be an API call to:
    // 1. Send email notification
    // 2. Send in-app notification
    // 3. Update notification in database
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, order: Order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ open: true, message, type });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <PendingIcon />;
      case 'approved': return <CheckIcon />;
      case 'shipped': return <ShippingIcon />;
      case 'delivered': return <CheckIcon />;
      case 'cancelled': return <CancelIcon />;
      default: return null;
    }
  };

  const getProductStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'out_of_stock': return 'error';
      case 'draft': return 'warning';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || !newStock) return;
    
    try {
      const stockNumber = parseInt(newStock);
      if (isNaN(stockNumber) || stockNumber < 0) {
        showNotification('Please enter a valid stock number', 'error');
        return;
      }

      const sellerId = currentUser?.id;
      const result = await UpdateSellerProductStock(selectedProduct.id, stockNumber, sellerId);
      
      if (result.success) {
        showNotification(`Stock updated to ${stockNumber}`, 'success');
        
        // Update local state
        setProducts(prev => prev.map(product =>
          product.id === selectedProduct.id 
            ? { 
                ...product, 
                stock: stockNumber, 
                status: stockNumber === 0 ? 'out_of_stock' : 'active',
                updatedAt: new Date().toISOString()
              }
            : product
        ));
        
        // Update store
        updateSellerProduct(selectedProduct.id, { 
          stock: stockNumber,
          status: stockNumber === 0 ? 'out_of_stock' : 'active'
        });
        
        setStockDialogOpen(false);
        setSelectedProduct(null);
        setNewStock('');
      } else {
        showNotification(result.message || 'Failed to update stock', 'error');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      showNotification('Failed to update stock', 'error');
    }
  };

  const handleAddProduct = async () => {
    try {
      // Validate form
      if (!newProduct.title.trim() || !newProduct.price || !newProduct.category) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      const sellerId = currentUser?.id;
      const productData = {
        title: newProduct.title,
        description: newProduct.description || 'Premium product from our store',
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock) || 0,
        images: newProduct.imageUrl ? [newProduct.imageUrl] : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop']
      };
      
      const result = await AddSellerProduct(productData, sellerId);
      
      if (result.success) {
        showNotification('Product added successfully', 'success');
        
        // Add new product to local state
        if (result.product) {
          setProducts(prev => [{
            id: result.productId,
            title: result.product.title,
            category: result.product.category,
            price: result.product.price,
            stock: result.product.stock,
            sold: 0,
            status: 'active',
            thumbnail: result.product.images?.[0] || 'https://via.placeholder.com/300x300?text=New+Product',
            rating: 0,
            description: result.product.description,
            sellerId: sellerId,
            createdAt: result.product.createdAt,
            updatedAt: result.product.updatedAt
          }, ...prev]);
        }
        
        setAddDialogOpen(false);
        setNewProduct({
          title: '',
          description: '',
          price: '',
          category: '',
          stock: '',
          imageUrl: ''
        });
      } else {
        showNotification(result.message || 'Failed to add product', 'error');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showNotification('Failed to add product', 'error');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      const sellerId = currentUser?.id;
      const result = await DeleteSellerProduct(productId, sellerId);
      
      if (result.success) {
        showNotification('Product deleted successfully', 'success');
        
        // Update local state
        setProducts(prev => prev.filter(product => product.id !== productId));
        
        // Update store
        deleteSellerProduct(productId);
      } else {
        showNotification(result.message || 'Failed to delete product', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Failed to delete product', 'error');
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      const sellerId = currentUser?.id || 2;
      const sellerProducts = await GetSellerProducts(sellerId);
      const formattedProducts: Product[] = sellerProducts.map((product: any) => ({
        id: product.id,
        title: product.title,
        category: product.category || 'uncategorized',
        price: product.price,
        stock: product.stock || 0,
        sold: product.sold || 0,
        status: product.status || (product.stock > 0 ? 'active' : 'out_of_stock'),
        thumbnail: product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/300x300?text=Product',
        rating: product.rating || 4.0,
        description: product.description,
        sellerId: product.sellerId
      }));
      
      setProducts(formattedProducts);
      
      const statsData = await GetSellerStats(sellerId);
      setStats(statsData);
      
      showNotification('Data refreshed successfully', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showNotification('Failed to refresh data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSwitchToUserMode = () => {
    switchToUser();
    showNotification('Switched to user mode.', 'info');
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const categories = [
    'smartphones', 'laptops', 'fragrances', 'beauty', 'groceries',
    'home-decoration', 'furniture', 'tops', 'womens-dresses', 'womens-shoes',
    'mens-shirts', 'mens-shoes', 'mens-watches', 'womens-watches', 'womens-bags',
    'womens-jewellery', 'sunglasses', 'vehicle', 'motorcycle'
  ];

  if (!isSeller) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, #0A081F 0%, #1A173B 50%, #2A2660 100%)`,
          fontFamily: '"Inter", "Roboto", sans-serif',
          color: 'white',
          py: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="md">
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              background: alpha('#0A081F', 0.7),
              border: '1px solid rgba(120, 119, 198, 0.2)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
            }}
          >
            <StoreIcon sx={{ fontSize: 80, color: '#7877C6', mb: 3 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Seller Dashboard Access Required
            </Typography>
            <Typography variant="body1" sx={{ color: alpha('#ffffff', 0.7), mb: 4, maxWidth: 600, mx: 'auto' }}>
              You need to be in seller mode to access the Seller Dashboard. Switch to seller mode from your account menu to manage your products and orders.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={handleGoHome}
                sx={{
                  background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                }}
              >
                Back to Home
              </Button>
              <Button
                variant="outlined"
                startIcon={<SwitchAccountIcon />}
                onClick={() => navigate('/account')}
                sx={{
                  borderColor: '#4ECDC4',
                  color: '#4ECDC4',
                  '&:hover': { borderColor: '#4ECDC4' },
                }}
              >
                Go to Account
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, #0A081F 0%, #1A173B 50%, #2A2660 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#7877C6' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, #0A081F 0%, #1A173B 50%, #2A2660 100%)`,
        fontFamily: '"Inter", "Roboto", sans-serif',
        color: 'white',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton 
                onClick={handleGoHome}
                sx={{ 
                  color: '#7877C6',
                  backgroundColor: alpha('#7877C6', 0.1),
                  '&:hover': { backgroundColor: alpha('#7877C6', 0.2) }
                }}
              >
                <HomeIcon />
              </IconButton>
              <StoreIcon sx={{ fontSize: 40, color: '#7877C6' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Seller Dashboard
                </Typography>
                <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
                  Welcome back, {currentUser?.name || 'Seller'}! Manage your store efficiently.
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefreshData}
                disabled={loading}
                sx={{
                  borderColor: '#4ECDC4',
                  color: '#4ECDC4',
                  '&:hover': { borderColor: '#4ECDC4', backgroundColor: alpha('#4ECDC4', 0.1) },
                }}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<SwitchAccountIcon />}
                onClick={handleSwitchToUserMode}
                sx={{
                  borderColor: '#F29F58',
                  color: '#F29F58',
                  '&:hover': { borderColor: '#F29F58', backgroundColor: alpha('#F29F58', 0.1) },
                }}
              >
                Switch to User
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${alpha(stat.color, 0.2)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
                    border: `1px solid ${alpha(stat.color, 0.2)}`,
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 1 }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {stat.value}
                      </Typography>
                      <Chip
                        label={stat.change}
                        size="small"
                        sx={{
                          mt: 1,
                          background: alpha('#4ECDC4', 0.2),
                          color: '#4ECDC4',
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: alpha(stat.color, 0.1),
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Stock Alerts */}
        {stats && (stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) && (
          <Paper
            sx={{
              p: 3,
              mb: 4,
              background: alpha('#1A173B', 0.5),
              border: '1px solid rgba(255, 107, 149, 0.3)',
              borderRadius: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <NotificationsIcon sx={{ color: '#FF6B95' }} />
              <Typography variant="h6" fontWeight="bold">Stock Alerts</Typography>
            </Stack>
            <Stack direction="row" spacing={4}>
              {stats.lowStockProducts > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>Low Stock Products</Typography>
                  <Typography variant="h5" color="warning.main" fontWeight="bold">
                    {stats.lowStockProducts}
                  </Typography>
                </Box>
              )}
              {stats.outOfStockProducts > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>Out of Stock</Typography>
                  <Typography variant="h5" color="error.main" fontWeight="bold">
                    {stats.outOfStockProducts}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        )}

        {/* Main Content with Tabs */}
        <Paper
          sx={{
            p: 3,
            background: alpha('#0A081F', 0.7),
            border: '1px solid rgba(120, 119, 198, 0.2)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              mb: 3,
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                color: alpha('#ffffff', 0.7),
                '&.Mui-selected': { color: '#7877C6' },
              },
            }}
          >
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview" />
            <Tab icon={<InventoryIcon />} iconPosition="start" label={`Products (${products.length})`} />
            <Tab icon={<OrderIcon />} iconPosition="start" label={`Orders (${orders.length})`} />
            <Tab icon={<ChartIcon />} iconPosition="start" label="Analytics" />
          </Tabs>

          {/* Overview Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, background: alpha('#1A173B', 0.5), borderRadius: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Typography variant="h6">Recent Orders</Typography>
                    <Button
                      size="small"
                      onClick={() => setActiveTab(2)}
                      sx={{ color: '#7877C6' }}
                    >
                      View All
                    </Button>
                  </Stack>
                  <List>
                    {orders.slice(0, 5).map((order) => (
                      <ListItem
                        key={order.id}
                        sx={{
                          mb: 1,
                          background: alpha('#ffffff', 0.05),
                          borderRadius: 1,
                          '&:hover': { background: alpha('#ffffff', 0.1) },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            color={getStatusColor(order.status) as any}
                            variant="dot"
                            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                          >
                            <Avatar sx={{ bgcolor: alpha('#7877C6', 0.2) }}>
                              {getStatusIcon(order.status)}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Order #${order.id} - ${order.customer}`}
                          secondary={`${order.date} • ${order.items} items • $${order.total}`}
                          primaryTypographyProps={{ fontWeight: 'bold' }}
                        />
                        <Chip
                          label={order.status.toUpperCase()}
                          size="small"
                          color={getStatusColor(order.status) as any}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, background: alpha('#1A173B', 0.5), borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Top Selling Products</Typography>
                  {products
                    .sort((a, b) => b.sold - a.sold)
                    .slice(0, 3)
                    .map(product => (
                      <Box key={product.id} sx={{ mb: 2, p: 2, background: alpha('#7877C6', 0.1), borderRadius: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            src={product.thumbnail}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="bold" noWrap>
                              {product.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7) }}>
                              Sold: {product.sold} • Stock: {product.stock}
                            </Typography>
                          </Box>
                          <Chip
                            label={`$${product.price}`}
                            size="small"
                            sx={{ background: alpha('#4ECDC4', 0.2), color: '#4ECDC4' }}
                          />
                        </Stack>
                      </Box>
                    ))}
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Products Tab */}
          {activeTab === 1 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <TextField
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{
                    width: 300,
                    '& .MuiOutlinedInput-root': {
                      background: alpha('#ffffff', 0.05),
                      color: 'white',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: alpha('#ffffff', 0.5) }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddDialogOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                  }}
                >
                  Add Product
                </Button>
              </Stack>

              {filteredProducts.length === 0 ? (
                <Paper sx={{ p: 8, textAlign: 'center', background: alpha('#1A173B', 0.5), borderRadius: 2 }}>
                  <InventoryIcon sx={{ fontSize: 60, color: alpha('#ffffff', 0.3), mb: 2 }} />
                  <Typography variant="h6" gutterBottom>No products found</Typography>
                  <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 3 }}>
                    {searchTerm ? 'Try a different search term' : 'Add your first product to get started'}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddDialogOpen(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                    }}
                  >
                    Add Product
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {filteredProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <Paper
                        sx={{
                          p: 2,
                          background: alpha('#1A173B', 0.5),
                          borderRadius: 2,
                          transition: 'transform 0.3s ease',
                          '&:hover': { transform: 'translateY(-4px)' },
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={product.thumbnail}
                            alt={product.title}
                            sx={{
                              width: '100%',
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: 1,
                              mb: 2,
                            }}
                          />
                          <Chip
                            label={product.status === 'out_of_stock' ? 'Out of Stock' : 'In Stock'}
                            size="small"
                            color={getProductStatusColor(product.status) as any}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                          />
                          {product.sold > 0 && (
                            <Chip
                              label={`${product.sold} sold`}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                background: alpha('#4ECDC4', 0.2),
                                color: '#4ECDC4',
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
                          {product.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 2 }} noWrap>
                          {product.category} • ${product.price}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                              Stock: {product.stock}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min((product.stock / 100) * 100, 100)}
                              color={product.stock < 10 ? 'warning' : 'success'}
                              sx={{ width: 80, height: 4, borderRadius: 2, mt: 0.5 }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ color: '#4ECDC4' }}>
                            ${(product.price * product.sold).toLocaleString()} revenue
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/product/${product.id}`)}
                              sx={{
                                flex: 1,
                                background: alpha('#7877C6', 0.2),
                                color: '#7877C6',
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Stock">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedProduct(product);
                                setNewStock(product.stock.toString());
                                setStockDialogOpen(true);
                              }}
                              sx={{
                                flex: 1,
                                background: alpha('#4ECDC4', 0.2),
                                color: '#4ECDC4',
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Product">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteProduct(product.id)}
                              sx={{
                                flex: 1,
                                background: alpha('#FF6B95', 0.2),
                                color: '#FF6B95',
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Orders Tab */}
          {activeTab === 2 && (
            <Box>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Chip
                  label="All Orders"
                  onClick={() => setStatusFilter('all')}
                  color={statusFilter === 'all' ? 'primary' : 'default'}
                  sx={{ color: statusFilter === 'all' ? 'white' : 'inherit' }}
                />
                <Chip
                  label="Pending"
                  onClick={() => setStatusFilter('pending')}
                  color={statusFilter === 'pending' ? 'warning' : 'default'}
                />
                <Chip
                  label="Approved"
                  onClick={() => setStatusFilter('approved')}
                  color={statusFilter === 'approved' ? 'info' : 'default'}
                />
                <Chip
                  label="Shipped"
                  onClick={() => setStatusFilter('shipped')}
                  color={statusFilter === 'shipped' ? 'primary' : 'default'}
                />
              </Stack>

              {filteredOrders.map((order) => (
                <Paper
                  key={order.id}
                  sx={{
                    p: 3,
                    mb: 2,
                    background: alpha('#1A173B', 0.5),
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="start">
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Order #{order.id} - {order.customer}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 1 }}>
                        Date: {order.date} • Items: {order.items} • Total: ${order.total}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
                        Payment: {order.paymentMethod} • Address: {order.address}
                      </Typography>
                      {order.customerEmail && (
                        <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mt: 1 }}>
                          Email: {order.customerEmail} • Phone: {order.customerPhone}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status.toUpperCase()}
                        color={getStatusColor(order.status) as any}
                        sx={{ mb: 2 }}
                      />
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {order.status === 'pending' && (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CheckIcon />}
                              onClick={() => handleApproveOrder(order.id)}
                              sx={{
                                background: 'linear-gradient(135deg, #4ECDC4 0%, #36A398 100%)',
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => handleCancelOrder(order.id)}
                              sx={{
                                borderColor: '#FF6B95',
                                color: '#FF6B95',
                                '&:hover': { borderColor: '#FF6B95' },
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {order.status === 'approved' && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<ShippingIcon />}
                            onClick={() => handleShipOrder(order.id)}
                            sx={{
                              background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                            }}
                          >
                            Mark as Shipped
                          </Button>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, order)}
                          sx={{ color: alpha('#ffffff', 0.7) }}
                        >
                          <MoreIcon />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Sales Analytics</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, background: alpha('#1A173B', 0.5), borderRadius: 2, height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>Revenue Trend (Last 7 Days)</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 200, mt: 2, px: 2 }}>
                      {[60, 80, 45, 90, 70, 85, 95].map((height, index) => (
                        <Box
                          key={index}
                          sx={{
                            flex: 1,
                            height: `${height}%`,
                            background: 'linear-gradient(to top, #7877C6, #4ECDC4)',
                            mx: 0.5,
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), mb: 0.5 }}>
                            ${[1200, 1600, 900, 1800, 1400, 1700, 1900][index]}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, background: alpha('#1A173B', 0.5), borderRadius: 2, height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>Top Selling Categories</Typography>
                    {stats?.popularCategories?.slice(0, 5).map((category, index) => (
                      <Stack
                        key={category.name}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 2, p: 1, '&:hover': { background: alpha('#ffffff', 0.05) } }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CategoryIcon sx={{ color: '#7877C6', fontSize: 20 }} />
                          <Typography variant="body2">
                            {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                          </Typography>
                        </Stack>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ color: '#4ECDC4' }}>
                            {category.count} sold
                          </Typography>
                          <Chip 
                            label={`$${(category.count * 100).toLocaleString()}`}
                            size="small"
                            sx={{ background: alpha('#7877C6', 0.2), color: '#7877C6' }}
                          />
                        </Box>
                      </Stack>
                    ))}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {selectedOrder && (
            <>
              <MenuItem onClick={() => {
                handleApproveOrder(selectedOrder.id);
                handleMenuClose();
              }}>
                <CheckIcon fontSize="small" sx={{ mr: 1 }} />
                Approve Order
              </MenuItem>
              <MenuItem onClick={() => {
                handleShipOrder(selectedOrder.id);
                handleMenuClose();
              }}>
                <ShippingIcon fontSize="small" sx={{ mr: 1 }} />
                Mark as Shipped
              </MenuItem>
              <MenuItem onClick={() => {
                handleCancelOrder(selectedOrder.id);
                handleMenuClose();
              }}>
                <CancelIcon fontSize="small" sx={{ mr: 1 }} />
                Cancel Order
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleMenuClose}>
                <NotificationsIcon fontSize="small" sx={{ mr: 1 }} />
                Notify Customer
              </MenuItem>
            </>
          )}
        </Menu>
      </Container>

      {/* Add Product Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ background: '#0A081F', color: 'white' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AddIcon />
            <Typography variant="h6">Add New Product</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ background: '#1A173B', color: 'white', pt: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Product Title"
              fullWidth
              value={newProduct.title}
              onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
              InputLabelProps={{ sx: { color: alpha('#ffffff', 0.7) } }}
              InputProps={{ sx: { color: 'white' } }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              InputLabelProps={{ sx: { color: alpha('#ffffff', 0.7) } }}
              InputProps={{ sx: { color: 'white' } }}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Price ($)"
                fullWidth
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                InputLabelProps={{ sx: { color: alpha('#ffffff', 0.7) } }}
                InputProps={{ sx: { color: 'white' } }}
              />
              <TextField
                label="Stock"
                fullWidth
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                InputLabelProps={{ sx: { color: alpha('#ffffff', 0.7) } }}
                InputProps={{ sx: { color: 'white' } }}
              />
            </Stack>
            <FormControl fullWidth>
              <InputLabel sx={{ color: alpha('#ffffff', 0.7) }}>Category</InputLabel>
              <Select
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                input={<OutlinedInput label="Category" sx={{ color: 'white' }} />}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Image URL (Optional)"
              fullWidth
              value={newProduct.imageUrl}
              onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
              InputLabelProps={{ sx: { color: alpha('#ffffff', 0.7) } }}
              InputProps={{ 
                sx: { color: 'white' },
                startAdornment: (
                  <InputAdornment position="start">
                    <ImageIcon sx={{ color: alpha('#ffffff', 0.5) }} />
                  </InputAdornment>
                )
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ background: '#0A081F', color: 'white' }}>
          <Button onClick={() => setAddDialogOpen(false)} sx={{ color: '#FF6B95' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddProduct}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
            }}
          >
            Add Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Stock Dialog */}
      <Dialog 
        open={stockDialogOpen} 
        onClose={() => {
          setStockDialogOpen(false);
          setSelectedProduct(null);
          setNewStock('');
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ background: '#0A081F', color: 'white' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EditIcon />
            <Typography variant="h6">Update Stock</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ background: '#1A173B', color: 'white', pt: 3 }}>
          {selectedProduct && (
            <Stack spacing={3}>
              <Typography variant="body1">
                Update stock for: <strong>{selectedProduct.title}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
                Current Stock: {selectedProduct.stock} units
              </Typography>
              <TextField
                label="New Stock Quantity"
                fullWidth
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                InputLabelProps={{ sx: { color: alpha('#ffffff', 0.7) } }}
                InputProps={{ sx: { color: 'white' } }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ background: '#0A081F', color: 'white' }}>
          <Button 
            onClick={() => {
              setStockDialogOpen(false);
              setSelectedProduct(null);
              setNewStock('');
            }}
            sx={{ color: '#FF6B95' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStock}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4ECDC4 0%, #36A398 100%)',
            }}
          >
            Update Stock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type as any}
          sx={{ 
            width: '100%',
            background: notification.type === 'success' ? '#4ECDC4' : 
                       notification.type === 'error' ? '#FF6B95' : 
                       notification.type === 'warning' ? '#F29F58' : '#7877C6',
            color: 'white',
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SellerDashboard;

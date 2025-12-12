import React, { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  ArrowBack as ArrowBackIcon,
  SwitchAccount as SwitchAccountIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  AddPhotoAlternate as ImageIcon,
  Category as CategoryIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  LocationOn as LocationIcon,
  Print as PrintIcon,
  GridView as GridViewIcon,
  FormatListBulleted as ListIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  date: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment: 'paid' | 'pending' | 'refunded';
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactElement;
  color: string;
}

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  // Mock data - in real app, fetch from API/store
  const statCards: StatCard[] = [
    { title: 'Total Revenue', value: '$24,580', change: '+12.5%', icon: <MoneyIcon />, color: '#4ECDC4' },
    { title: 'Total Orders', value: '1,248', change: '+8.2%', icon: <OrderIcon />, color: '#FF6B95' },
    { title: 'Products', value: '342', change: '+3.4%', icon: <InventoryIcon />, color: '#7877C6' },
    { title: 'Customers', value: '5,432', change: '+5.1%', icon: <PeopleIcon />, color: '#F29F58' },
  ];

  const products: Product[] = [
    { id: 1, title: 'Premium Smartphone X', category: 'smartphones', price: 999, stock: 45, sold: 120, status: 'active', thumbnail: '', rating: 4.5 },
    { id: 2, title: 'Luxury Watch Pro', category: 'womens-watches', price: 2499, stock: 12, sold: 45, status: 'active', thumbnail: '', rating: 4.8 },
    { id: 3, title: 'Designer Handbag', category: 'womens-bags', price: 899, stock: 0, sold: 78, status: 'out_of_stock', thumbnail: '', rating: 4.3 },
    { id: 4, title: 'Wireless Headphones', category: 'electronics', price: 299, stock: 23, sold: 210, status: 'active', thumbnail: '', rating: 4.6 },
    { id: 5, title: 'Fitness Tracker', category: 'accessories', price: 199, stock: 56, sold: 89, status: 'active', thumbnail: '', rating: 4.2 },
    { id: 6, title: 'Gaming Laptop', category: 'laptops', price: 1899, stock: 8, sold: 34, status: 'active', thumbnail: '', rating: 4.7 },
    { id: 7, title: 'Perfume Collection', category: 'fragrances', price: 129, stock: 42, sold: 156, status: 'active', thumbnail: '', rating: 4.4 },
    { id: 8, title: 'Bluetooth Speaker', category: 'electronics', price: 89, stock: 67, sold: 231, status: 'active', thumbnail: '', rating: 4.1 },
  ];

  const orders: Order[] = [
    { id: 1001, customerName: 'John Doe', customerEmail: 'john@example.com', date: '2024-01-15', items: 3, total: 249.99, status: 'pending', payment: 'paid' },
    { id: 1002, customerName: 'Jane Smith', customerEmail: 'jane@example.com', date: '2024-01-14', items: 1, total: 89.50, status: 'processing', payment: 'pending' },
    { id: 1003, customerName: 'Robert Johnson', customerEmail: 'robert@example.com', date: '2024-01-14', items: 5, total: 1299.00, status: 'shipped', payment: 'paid' },
    { id: 1004, customerName: 'Emily Brown', customerEmail: 'emily@example.com', date: '2024-01-13', items: 2, total: 45.99, status: 'delivered', payment: 'paid' },
    { id: 1005, customerName: 'Michael Wilson', customerEmail: 'michael@example.com', date: '2024-01-12', items: 1, total: 599.00, status: 'cancelled', payment: 'refunded' },
    { id: 1006, customerName: 'Sarah Davis', customerEmail: 'sarah@example.com', date: '2024-01-11', items: 4, total: 329.99, status: 'pending', payment: 'paid' },
    { id: 1007, customerName: 'David Miller', customerEmail: 'david@example.com', date: '2024-01-10', items: 2, total: 199.99, status: 'shipped', payment: 'paid' },
    { id: 1008, customerName: 'Lisa Anderson', customerEmail: 'lisa@example.com', date: '2024-01-09', items: 1, total: 149.50, status: 'delivered', payment: 'paid' },
  ];

  const categories = ['smartphones', 'laptops', 'fragrances', 'beauty', 'groceries', 'home-decoration', 'furniture', 'womens-dresses', 'womens-shoes', 'mens-shirts'];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
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

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleGoHome = () => {
    navigate('/');
  };

  const handleSwitchToUserMode = () => {
    showNotification('Switched to user mode', 'info');
    navigate('/');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showNotification('Data refreshed successfully', 'success');
    }, 1000);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0A081F 0%, #1A173B 100%)',
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
        background: 'linear-gradient(135deg, #0A081F 0%, #1A173B 100%)',
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
                  Welcome back, Seller! Manage your store efficiently.
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
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
          </Tabs>

          {/* Overview Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Sales Chart */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ 
                  p: 3, 
                  background: alpha('#1A173B', 0.5), 
                  borderRadius: 2,
                  height: '100%'
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6">Sales Overview</Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip label="7 Days" size="small" sx={{ background: alpha('#7877C6', 0.2), color: '#7877C6' }} />
                      <Chip label="30 Days" size="small" sx={{ background: alpha('#ffffff', 0.1), color: 'white' }} />
                      <Chip label="90 Days" size="small" sx={{ background: alpha('#ffffff', 0.1), color: 'white' }} />
                    </Stack>
                  </Stack>
                  <Box sx={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: alpha('#ffffff', 0.03),
                    borderRadius: 2
                  }}>
                    <Typography sx={{ color: alpha('#ffffff', 0.3) }}>
                      Sales Chart Visualization
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Recent Activity */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ 
                  p: 3, 
                  background: alpha('#1A173B', 0.5), 
                  borderRadius: 2,
                  height: '100%'
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6">Recent Activity</Typography>
                    <IconButton size="small" sx={{ color: alpha('#ffffff', 0.7) }}>
                      <MoreIcon />
                    </IconButton>
                  </Stack>
                  
                  <List>
                    {orders.slice(0, 5).map((order) => (
                      <ListItem
                        key={order.id}
                        sx={{
                          mb: 1,
                          px: 2,
                          py: 1.5,
                          background: alpha('#ffffff', 0.05),
                          borderRadius: 1.5,
                          '&:hover': { background: alpha('#ffffff', 0.1) },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            color={getStatusColor(order.status) as any}
                            variant="dot"
                            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                          >
                            <Avatar sx={{ bgcolor: alpha('#7877C6', 0.2), width: 32, height: 32 }}>
                              <ShoppingCartIcon fontSize="small" />
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Order #${order.id}`}
                          secondary={`${order.customerName} • $${order.total.toFixed(2)}`}
                          primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'bold' }}
                          secondaryTypographyProps={{ fontSize: '0.75rem', color: alpha('#ffffff', 0.5) }}
                        />
                        <Chip
                          label={order.status}
                          size="small"
                          color={getStatusColor(order.status) as any}
                          sx={{ fontSize: '0.65rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    fullWidth
                    variant="text"
                    sx={{ 
                      mt: 2, 
                      color: '#7877C6',
                      '&:hover': { background: alpha('#7877C6', 0.1) }
                    }}
                    onClick={() => setActiveTab(2)}
                  >
                    View All Orders
                  </Button>
                </Paper>
              </Grid>

              {/* Top Products */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, background: alpha('#1A173B', 0.5), borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Top Selling Products</Typography>
                  <Grid container spacing={2}>
                    {products
                      .sort((a, b) => b.sold - a.sold)
                      .slice(0, 4)
                      .map(product => (
                        <Grid item xs={12} sm={6} md={3} key={product.id}>
                          <Paper sx={{ 
                            p: 2, 
                            background: alpha('#ffffff', 0.05),
                            borderRadius: 1.5,
                            height: '100%'
                          }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                variant="rounded"
                                sx={{ 
                                  width: 48, 
                                  height: 48, 
                                  bgcolor: alpha('#7877C6', 0.2),
                                  color: '#7877C6'
                                }}
                              >
                                <InventoryIcon />
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight="bold" noWrap>
                                  {product.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                                  Sold: {product.sold} • Stock: {product.stock}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min((product.sold / 300) * 100, 100)}
                                  color="primary"
                                  sx={{ mt: 1, height: 4, borderRadius: 2 }}
                                />
                              </Box>
                              <Chip
                                label={`$${product.price}`}
                                size="small"
                                sx={{ background: alpha('#4ECDC4', 0.2), color: '#4ECDC4' }}
                              />
                            </Stack>
                          </Paper>
                        </Grid>
                      ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Products Tab */}
          {activeTab === 1 && (
            <Box>
              {/* Filters and Actions */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
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
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel sx={{ color: alpha('#ffffff', 0.7) }}>Category</InputLabel>
                    <Select
                      value={categoryFilter}
                      label="Category"
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      sx={{
                        background: alpha('#ffffff', 0.05),
                        color: 'white',
                        '& .MuiSelect-icon': { color: alpha('#ffffff', 0.5) },
                      }}
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      {categories.map(category => (
                        <MenuItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Stack direction="row" spacing={1}>
                    <IconButton 
                      size="small" 
                      onClick={() => setViewMode('grid')}
                      sx={{ 
                        color: viewMode === 'grid' ? '#7877C6' : alpha('#ffffff', 0.5),
                        background: viewMode === 'grid' ? alpha('#7877C6', 0.1) : 'transparent'
                      }}
                    >
                      <GridViewIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => setViewMode('list')}
                      sx={{ 
                        color: viewMode === 'list' ? '#7877C6' : alpha('#ffffff', 0.5),
                        background: viewMode === 'list' ? alpha('#7877C6', 0.1) : 'transparent'
                      }}
                    >
                      <ListIcon />
                    </IconButton>
                  </Stack>
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
              </Stack>

              {/* Products Grid/List */}
              {filteredProducts.length === 0 ? (
                <Paper sx={{ 
                  p: 8, 
                  textAlign: 'center', 
                  background: alpha('#1A173B', 0.5), 
                  borderRadius: 2 
                }}>
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
              ) : viewMode === 'grid' ? (
                <Grid container spacing={3}>
                  {filteredProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <Paper
                        className="product-card"
                        sx={{
                          p: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          background: alpha('#1A173B', 0.5),
                          borderRadius: 2,
                          transition: 'transform 0.3s ease',
                          '&:hover': { transform: 'translateY(-4px)' },
                        }}
                      >
                        {/* Product Image */}
                        <Box
                          className="product-image-container"
                          sx={{
                            height: 140,
                            background: `linear-gradient(45deg, ${alpha('#7877C6', 0.3)} 0%, ${alpha('#4ECDC4', 0.3)} 100%)`,
                            borderRadius: 1.5,
                            mb: 2,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <InventoryIcon sx={{ fontSize: 48, color: alpha('#ffffff', 0.3) }} />
                          <Chip
                            label={product.status === 'out_of_stock' ? 'Out of Stock' : 'In Stock'}
                            size="small"
                            color={getProductStatusColor(product.status) as any}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                          />
                        </Box>

                        {/* Product Info */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
                            {product.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 2 }} noWrap>
                            {product.category} • ${product.price.toFixed(2)}
                          </Typography>
                          
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
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
                        </Box>

                        {/* Actions */}
                        <Stack direction="row" spacing={1} className="product-actions-stack">
                          <Tooltip title="Edit Product">
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              fullWidth
                              sx={{
                                background: alpha('#4ECDC4', 0.1),
                                color: '#4ECDC4',
                                '&:hover': { background: alpha('#4ECDC4', 0.2) }
                              }}
                            >
                              Edit
                            </Button>
                          </Tooltip>
                          <Tooltip title="Delete Product">
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              fullWidth
                              sx={{
                                background: alpha('#FF6B95', 0.1),
                                color: '#FF6B95',
                                '&:hover': { background: alpha('#FF6B95', 0.2) }
                              }}
                            >
                              Delete
                            </Button>
                          </Tooltip>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                /* Products List View */
                <TableContainer component={Paper} sx={{ 
                  background: alpha('#1A173B', 0.5),
                  border: '1px solid rgba(120, 119, 198, 0.2)',
                  borderRadius: 2,
                }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: alpha('#7877C6', 0.1) }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stock</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sold</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow 
                          key={product.id}
                          hover
                          sx={{ '&:hover': { background: alpha('#ffffff', 0.05) } }}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                variant="rounded"
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  bgcolor: alpha('#7877C6', 0.2),
                                  color: '#7877C6'
                                }}
                              >
                                <InventoryIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {product.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                                  ID: {product.id}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={product.category} 
                              size="small" 
                              sx={{ background: alpha('#7877C6', 0.2), color: '#7877C6' }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              ${product.price.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="body2">{product.stock}</Typography>
                              {product.stock < 10 && product.stock > 0 && (
                                <Chip label="Low" size="small" color="warning" />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{product.sold}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={product.status.toUpperCase()}
                              size="small"
                              color={getProductStatusColor(product.status) as any}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton size="small" sx={{ color: '#7877C6' }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" sx={{ color: '#FF6B95' }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Orders Tab */}
          {activeTab === 2 && (
            <Box>
              {/* Filters */}
              <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" gap={1}>
                <Chip
                  label="All Orders"
                  onClick={() => setStatusFilter('all')}
                  color={statusFilter === 'all' ? 'primary' : 'default'}
                  sx={{ 
                    color: statusFilter === 'all' ? 'white' : 'inherit',
                    backgroundColor: statusFilter === 'all' ? '#7877C6' : alpha('#ffffff', 0.1)
                  }}
                />
                <Chip
                  label="Pending"
                  onClick={() => setStatusFilter('pending')}
                  color={statusFilter === 'pending' ? 'warning' : 'default'}
                  sx={{ backgroundColor: statusFilter === 'pending' ? alpha('#F29F58', 0.2) : alpha('#ffffff', 0.1) }}
                />
                <Chip
                  label="Processing"
                  onClick={() => setStatusFilter('processing')}
                  color={statusFilter === 'processing' ? 'info' : 'default'}
                  sx={{ backgroundColor: statusFilter === 'processing' ? alpha('#4ECDC4', 0.2) : alpha('#ffffff', 0.1) }}
                />
                <Chip
                  label="Shipped"
                  onClick={() => setStatusFilter('shipped')}
                  color={statusFilter === 'shipped' ? 'primary' : 'default'}
                  sx={{ backgroundColor: statusFilter === 'shipped' ? alpha('#7877C6', 0.2) : alpha('#ffffff', 0.1) }}
                />
                <Chip
                  label="Delivered"
                  onClick={() => setStatusFilter('delivered')}
                  color={statusFilter === 'delivered' ? 'success' : 'default'}
                  sx={{ backgroundColor: statusFilter === 'delivered' ? alpha('#4ECDC4', 0.2) : alpha('#ffffff', 0.1) }}
                />
                <Chip
                  label="Cancelled"
                  onClick={() => setStatusFilter('cancelled')}
                  color={statusFilter === 'cancelled' ? 'error' : 'default'}
                  sx={{ backgroundColor: statusFilter === 'cancelled' ? alpha('#FF6B95', 0.2) : alpha('#ffffff', 0.1) }}
                />
              </Stack>

              {/* Orders Table */}
              <TableContainer component={Paper} sx={{ 
                background: alpha('#ffffff', 0.05),
                border: '1px solid rgba(120, 119, 198, 0.2)',
                borderRadius: 2,
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: alpha('#7877C6', 0.1) }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Items</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                      <TableRow 
                        key={order.id}
                        hover
                        sx={{ 
                          '&:hover': { background: alpha('#ffffff', 0.05) },
                          cursor: 'pointer'
                        }}
                        onClick={() => setOrderDetailsOpen(true)}
                      >
                        <TableCell sx={{ color: 'white' }}>
                          <Typography fontWeight="bold">#{order.id}</Typography>
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {order.customerName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                              {order.customerEmail}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: alpha('#ffffff', 0.8) }}>
                          {order.date}
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>
                          {order.items} items
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}>
                          <Typography fontWeight="bold">
                            ${order.total.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status.toUpperCase()}
                            size="small"
                            color={getStatusColor(order.status) as any}
                            sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.payment.toUpperCase()}
                            size="small"
                            color={getPaymentColor(order.payment) as any}
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                showNotification(`Order #${order.id} approved`, 'success');
                              }}
                              sx={{ color: '#4ECDC4' }}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                showNotification(`Order #${order.id} shipped`, 'info');
                              }}
                              sx={{ color: '#7877C6' }}
                            >
                              <ShippingIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                showNotification(`Order #${order.id} cancelled`, 'warning');
                              }}
                              sx={{ color: '#FF6B95' }}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredOrders.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{ 
                    color: 'white',
                    '& .MuiTablePagination-selectIcon': {
                      color: 'white',
                    },
                    '& .MuiTablePagination-actions button': {
                      color: 'white',
                    }
                  }}
                />
              </TableContainer>
            </Box>
          )}
        </Paper>

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
                InputLabelProps={{ sx: { color: alpha('#ffffff', 0.7) } }}
                InputProps={{ sx: { color: 'white' } }}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                InputLabelProps={{ sx: { color: alpha('#ffffff', 0.7) } }}
                InputProps={{ sx: { color: 'white' } }}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Price ($)"
                  fullWidth
                  type="number"
                  InputLabelProps={{ sx: { color: alpha('#ffffff', 0.7) } }}
                  InputProps={{ sx: { color: 'white' } }}
                />
                <TextField
                  label="Stock"
                  fullWidth
                  type="number"
                  InputLabelProps={{ sx: { color: alpha('#ffffff', 0.7) } }}
                  InputProps={{ sx: { color: 'white' } }}
                />
              </Stack>
              <FormControl fullWidth>
                <InputLabel sx={{ color: alpha('#ffffff', 0.7) }}>Category</InputLabel>
                <Select
                  label="Category"
                  input={<OutlinedInput label="Category" sx={{ color: 'white' }} />}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ background: '#0A081F', color: 'white' }}>
            <Button onClick={() => setAddDialogOpen(false)} sx={{ color: '#FF6B95' }}>
              Cancel
            </Button>
            <Button 
              variant="contained"
              onClick={() => {
                showNotification('Product added successfully', 'success');
                setAddDialogOpen(false);
              }}
              sx={{
                background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
              }}
            >
              Add Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Order Details Dialog */}
        <Dialog 
          open={orderDetailsOpen} 
          onClose={() => setOrderDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #1A173B 0%, #2A2660 100%)',
            color: 'white',
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Order #1001 Details</Typography>
              <Chip
                label="PENDING"
                color="warning"
                sx={{ fontWeight: 'bold' }}
              />
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ background: '#1A173B', color: 'white', pt: 3 }}>
            <Grid container spacing={3}>
              {/* Customer Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: '#4ECDC4' }}>Customer Information</Typography>
                <Paper sx={{ p: 2, background: alpha('#ffffff', 0.05) }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>Name</Typography>
                      <Typography>John Doe</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>Email</Typography>
                      <Typography>john@example.com</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>Phone</Typography>
                      <Typography>+1 (555) 123-4567</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>Shipping Address</Typography>
                      <Typography>123 Main St, New York, NY 10001</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {/* Order Summary */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ color: '#4ECDC4' }}>Order Summary</Typography>
                <Paper sx={{ p: 2, background: alpha('#ffffff', 0.05) }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Subtotal</Typography>
                      <Typography>$379.96</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Shipping Fee</Typography>
                      <Typography>$9.99</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Tax (9%)</Typography>
                      <Typography>$34.20</Typography>
                    </Stack>
                    <Divider sx={{ borderColor: alpha('#ffffff', 0.1), my: 1 }} />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h6">$424.15</Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            background: '#1A173B', 
            borderTop: '1px solid rgba(120, 119, 198, 0.2)',
            p: 3 
          }}>
            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <Button
                onClick={() => setOrderDetailsOpen(false)}
                sx={{ 
                  color: '#FF6B95',
                  flex: 1
                }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={() => {
                  showNotification('Order #1001 approved', 'success');
                  setOrderDetailsOpen(false);
                }}
                sx={{
                  background: 'linear-gradient(135deg, #4ECDC4 0%, #36A398 100%)',
                  color: 'white',
                  flex: 1
                }}
              >
                Approve Order
              </Button>
              <Button
                variant="contained"
                startIcon={<ShippingIcon />}
                onClick={() => {
                  showNotification('Order #1001 marked as shipped', 'info');
                  setOrderDetailsOpen(false);
                }}
                sx={{
                  background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                  color: 'white',
                  flex: 1
                }}
              >
                Mark as Shipped
              </Button>
            </Stack>
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
      </Container>
    </Box>
  );
};

export default SellerDashboard;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  alpha,
  Divider,
  InputAdornment,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ShoppingBag as ShoppingBagIcon,
  CheckCircle as CheckIcon,
  LocalShipping as ShippingIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  DoneAll as DoneIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useUserStore, type Order } from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import SellerAccountMenu from '../components/SellerAccountMenu';

// --- Theme/Style Constants for Professional Design ---

const PRIMARY_COLOR = '#4ECDC4'; // Teal/Mint
const SECONDARY_COLOR = '#7877C6'; // Indigo/Violet
const ACCENT_COLOR = '#FF6B95'; // Pink/Cancel
const BACKGROUND_GRADIENT = 'linear-gradient(135deg, #0A081F 0%, #1A173B 100%)';
const CARD_GRADIENT = 'linear-gradient(135deg, #1A173B 0%, #2A2660 100%)';
const BORDER_COLOR = 'rgba(120, 119, 198, 0.2)';
const HOVER_BACKGROUND = 'rgba(255, 255, 255, 0.05)';
const TABLE_HEADER_BACKGROUND = 'rgba(120, 119, 198, 0.15)'; // Slightly darker for contrast

// --- Component Start ---

const OrderManagement = () => {
  const { getSellerOrders, updateOrderStatus, sendOrderNotification, currentUser, deleteOrder } = useUserStore();
  const navigate = useNavigate();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [currentMenuOrder, setCurrentMenuOrder] = useState<Order | null>(null);

  // Responsive Hooks
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:960px)');

  // Listen for scroll to update header style
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to identify and filter out default/dummy orders (Functionality preserved)
  const filterOutDefaultOrders = (orders: Order[]): Order[] => {
    return orders.filter(order => {
      if (order.sellerId !== 2) return false;
      
      const isDefaultCustomer = 
        order.customerName === 'Customer' || 
        order.customerEmail === 'customer@example.com';
      if (isDefaultCustomer) return false;
      
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const isVeryOldOrder = (now.getTime() - orderDate.getTime()) > (365 * 24 * 60 * 60 * 1000); 
      if (isVeryOldOrder) return false;
      
      const hasInvalidItems = order.items.some(item => 
        !item.productName || 
        item.productName.includes('Default') || 
        item.productName.includes('Sample')
      );
      if (hasInvalidItems) return false;
      
      return true;
    });
  };

  // Real-time order updates (Functionality preserved)
  useEffect(() => {
    const fetchOrders = () => {
      const sellerOrders = getSellerOrders();
      const realOrders = filterOutDefaultOrders(sellerOrders);
      
      const filteredResult = realOrders.filter(order => {
        const matchesSearch = 
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toString().includes(searchTerm) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      });
      
      const sortedOrders = filteredResult.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setFilteredOrders(sortedOrders);
      setIsLoading(false);
    };

    setIsLoading(true);
    fetchOrders();
    
    const intervalId = setInterval(fetchOrders, 5000);
    
    return () => clearInterval(intervalId);
  }, [getSellerOrders, searchTerm, statusFilter]);

  // Handler functions (Functionality preserved)
  const handleApproveOrder = (orderId: number) => {
    updateOrderStatus(orderId, 'approved');
    const order = filteredOrders.find(o => o.id === orderId);
    if (order) {
      sendOrderNotification(orderId, 'approved', order.customerEmail);
      setFilteredOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'approved' } : o
      ));
    }
  };

  const handleShipOrder = (orderId: number) => {
    updateOrderStatus(orderId, 'shipped');
    const order = filteredOrders.find(o => o.id === orderId);
    if (order) {
      sendOrderNotification(orderId, 'shipped', order.customerEmail);
      setFilteredOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'shipped' } : o
      ));
    }
  };

  const handleCancelOrder = (orderId: number) => {
    updateOrderStatus(orderId, 'cancelled');
    const order = filteredOrders.find(o => o.id === orderId);
    if (order) {
      sendOrderNotification(orderId, 'cancelled', order.customerEmail);
      setFilteredOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ));
    }
  };

  const handleDeliverOrder = (orderId: number) => {
    updateOrderStatus(orderId, 'delivered');
    const order = filteredOrders.find(o => o.id === orderId);
    if (order) {
      sendOrderNotification(orderId, 'delivered', order.customerEmail);
      setFilteredOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'delivered' } : o
      ));
    }
  };

  // NEW: Delete order functionality
  const handleDeleteOrder = (orderId: number) => {
    if (window.confirm(`Are you sure you want to delete order #${orderId}? This action cannot be undone.`)) {
      deleteOrder(orderId);
      setFilteredOrders(prev => prev.filter(order => order.id !== orderId));
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
      
      // Close menu if open
      handleMenuClose();
    }
  };

  // NEW: Bulk delete functionality
  const handleBulkDelete = () => {
    if (selectedOrders.length === 0) return;
    
    if (window.confirm(`Delete ${selectedOrders.length} selected order(s)? This action cannot be undone.`)) {
      selectedOrders.forEach(orderId => deleteOrder(orderId));
      setFilteredOrders(prev => prev.filter(order => !selectedOrders.includes(order.id)));
      setSelectedOrders([]);
    }
  };

  // NEW: Toggle individual order selection
  const handleToggleOrderSelection = (orderId: number) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // NEW: Toggle all orders selection
  const handleToggleAllSelection = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  // NEW: Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, order: Order) => {
    setMenuAnchorEl(event.currentTarget);
    setCurrentMenuOrder(order);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setCurrentMenuOrder(null);
  };

  // Printing logic (Functionality preserved)
  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order Invoice #${order.id}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ddd; padding-bottom: 15px; }
              h1 { color: #1A173B; font-size: 24px; }
              .info { margin-bottom: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
              p { margin: 5px 0; font-size: 14px; }
              strong { color: #1A173B; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
              th, td { border: 1px solid #eee; padding: 12px; text-align: left; font-size: 14px; }
              th { background-color: #e8eaf6; color: #3f51b5; font-weight: 600; }
              .total-row td { font-size: 16px; font-weight: bold; background-color: #e8f5e9; color: #388e3c; }
              .footer { margin-top: 50px; text-align: center; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Invoice #${order.id}</h1>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="info">
              <h2>Customer Details</h2>
              <p><strong>Customer:</strong> ${order.customerName}</p>
              <p><strong>Email:</strong> ${order.customerEmail}</p>
              <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="info">
              <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
              <p>Shipping: $${order.shippingFee.toFixed(2)}</p>
              <p>Tax: $${order.tax.toFixed(2)}</p>
              <p class="total-row"><strong>Total: $${order.total.toFixed(2)}</strong></p>
            </div>
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>Xelura Seller Platform</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDialogOpen(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const sellerOrders = getSellerOrders();
      const realOrders = filterOutDefaultOrders(sellerOrders);
      const sortedOrders = realOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setFilteredOrders(sortedOrders);
      setSelectedOrders([]);
      setIsLoading(false);
    }, 500);
  };
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Status Color Logic (Functionality preserved)
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#FFB74D';
      case 'approved': return PRIMARY_COLOR; // Teal
      case 'shipped': return SECONDARY_COLOR; // Violet
      case 'delivered': return PRIMARY_COLOR; // Teal
      case 'cancelled': return ACCENT_COLOR; // Pink
      default: return alpha('#ffffff', 0.5);
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return PRIMARY_COLOR;
      case 'pending': return '#FFB74D';
      case 'failed': return ACCENT_COLOR;
      case 'refunded': return SECONDARY_COLOR;
      default: return alpha('#ffffff', 0.5);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Stats Logic (Functionality preserved)
  const getOrderStats = () => {
    const total = filteredOrders.length;
    const pending = filteredOrders.filter(o => o.status === 'pending').length;
    const approved = filteredOrders.filter(o => o.status === 'approved').length;
    const shipped = filteredOrders.filter(o => o.status === 'shipped').length;
    const delivered = filteredOrders.filter(o => o.status === 'delivered').length;
    const cancelled = filteredOrders.filter(o => o.status === 'cancelled').length;
    
    return { total, pending, approved, shipped, delivered, cancelled };
  };

  const stats = getOrderStats();

  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // --- JSX Rendering ---

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: BACKGROUND_GRADIENT,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    }}>
      {/* Sticky Seller Account Menu */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1200 }}>
        <SellerAccountMenu scrolled={scrolled} />
      </Box>

      <Container maxWidth="lg" sx={{ p: 3, pt: { xs: 3, sm: 5 } }}>
        <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight="light" 
            sx={{ color: 'white', mb: 4, letterSpacing: 1 }}
        >
            🚀 Orders Management
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Orders Card */}
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ 
              background: CARD_GRADIENT,
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: 3,
              p: 2,
              height: '100%',
              boxShadow: `0 4px 10px ${alpha(SECONDARY_COLOR, 0.2)}`,
            }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>
                  {stats.total}
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), textTransform: 'uppercase', letterSpacing: 1 }}>
                  Total Orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Pending Card */}
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ 
              background: CARD_GRADIENT,
              border: `1px solid ${alpha(ACCENT_COLOR, 0.4)}`,
              borderRadius: 3,
              p: 2,
              height: '100%',
              boxShadow: `0 4px 10px ${alpha(ACCENT_COLOR, 0.15)}`,
            }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: ACCENT_COLOR, mb: 0.5 }}>
                  {stats.pending}
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), textTransform: 'uppercase', letterSpacing: 1 }}>
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Approved Card */}
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ 
              background: CARD_GRADIENT,
              border: `1px solid ${alpha(PRIMARY_COLOR, 0.4)}`,
              borderRadius: 3,
              p: 2,
              height: '100%',
              boxShadow: `0 4px 10px ${alpha(PRIMARY_COLOR, 0.15)}`,
            }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: PRIMARY_COLOR, mb: 0.5 }}>
                  {stats.approved}
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), textTransform: 'uppercase', letterSpacing: 1 }}>
                  Approved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Shipped Card */}
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ 
              background: CARD_GRADIENT,
              border: `1px solid ${alpha(SECONDARY_COLOR, 0.4)}`,
              borderRadius: 3,
              p: 2,
              height: '100%',
              boxShadow: `0 4px 10px ${alpha(SECONDARY_COLOR, 0.15)}`,
            }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: SECONDARY_COLOR, mb: 0.5 }}>
                  {stats.shipped}
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), textTransform: 'uppercase', letterSpacing: 1 }}>
                  Shipped
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Delivered Card */}
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ 
              background: CARD_GRADIENT,
              border: `1px solid ${alpha(PRIMARY_COLOR, 0.4)}`,
              borderRadius: 3,
              p: 2,
              height: '100%',
              boxShadow: `0 4px 10px ${alpha(PRIMARY_COLOR, 0.15)}`,
            }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: PRIMARY_COLOR, mb: 0.5 }}>
                  {stats.delivered}
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), textTransform: 'uppercase', letterSpacing: 1 }}>
                  Delivered
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Cancelled Card */}
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ 
              background: CARD_GRADIENT,
              border: `1px solid ${alpha(ACCENT_COLOR, 0.4)}`,
              borderRadius: 3,
              p: 2,
              height: '100%',
              boxShadow: `0 4px 10px ${alpha(ACCENT_COLOR, 0.15)}`,
            }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: ACCENT_COLOR, mb: 0.5 }}>
                  {stats.cancelled}
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), textTransform: 'uppercase', letterSpacing: 1 }}>
                  Cancelled
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Actions */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: alpha('#ffffff', 0.05),
          border: `1px solid ${BORDER_COLOR}`,
          borderRadius: 3,
        }}>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 2, sm: 3 }} 
            justifyContent="flex-end"
          >
            {/* Bulk Delete Button */}
            {selectedOrders.length > 0 && (
              <Button
                variant="contained"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
                sx={{ 
                  backgroundColor: '#FF4757',
                  '&:hover': { backgroundColor: '#FF3333' }
                }}
              >
                Delete Selected ({selectedOrders.length})
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isLoading}
              sx={{ 
                borderColor: SECONDARY_COLOR, 
                color: SECONDARY_COLOR,
                '&:hover': { backgroundColor: alpha(SECONDARY_COLOR, 0.1) }
              }}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </Stack>
          
          <Divider sx={{ borderColor: alpha('#ffffff', 0.1), my: 3 }} />
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search orders by ID, customer name, email, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: alpha('#ffffff', 0.5) }} />
                    </InputAdornment>
                  ),
                  sx: {
                    background: alpha('#ffffff', 0.08),
                    color: 'white',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: SECONDARY_COLOR,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: SECONDARY_COLOR,
                      borderWidth: '2px',
                    },
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                {[
                  { label: "All", value: "all", color: SECONDARY_COLOR },
                  { label: "Pending", value: "pending", color: '#FFB74D' },
                  { label: "Approved", value: "approved", color: PRIMARY_COLOR },
                  { label: "Shipped", value: "shipped", color: SECONDARY_COLOR },
                  { label: "Delivered", value: "delivered", color: PRIMARY_COLOR },
                  { label: "Cancelled", value: "cancelled", color: ACCENT_COLOR },
                ].map(({ label, value, color }) => (
                  <Chip
                    key={value}
                    label={label}
                    onClick={() => setStatusFilter(value)}
                    sx={{ 
                      fontSize: isMobile ? '0.7rem' : '0.8rem',
                      fontWeight: 'bold',
                      color: statusFilter === value ? 'white' : alpha('#ffffff', 0.7),
                      backgroundColor: statusFilter === value ? color : alpha('#ffffff', 0.1),
                      border: statusFilter === value ? `1px solid ${color}` : `1px solid ${alpha('#ffffff', 0.2)}`,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        backgroundColor: alpha(color, 0.3),
                      }
                    }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Real-time Indicator & Loading */}
        <Box sx={{ mb: 3 }}>
            {isLoading && (
              <LinearProgress sx={{ 
                height: 4, 
                borderRadius: 2,
                backgroundColor: alpha(SECONDARY_COLOR, 0.2),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${SECONDARY_COLOR} 0%, ${PRIMARY_COLOR} 100%)`,
                }
              }} />
            )}
            {!isLoading && (
                <Paper sx={{ 
                    p: 2, 
                    background: alpha(PRIMARY_COLOR, 0.1),
                    border: `1px solid ${alpha(PRIMARY_COLOR, 0.3)}`,
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: 2,
                    borderRadius: 2
                }}>
                    <Box sx={{ 
                        width: 10, 
                        height: 10, 
                        borderRadius: '50%', 
                        backgroundColor: PRIMARY_COLOR,
                        animation: 'pulse 2s infinite',
                        flexShrink: 0
                    }} />
                    <Typography variant="body2" sx={{ color: PRIMARY_COLOR, flex: 1, fontWeight: 'medium' }}>
                        **Real-time Updates Active** — Data refreshes every 5 seconds.
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha(PRIMARY_COLOR, 0.7), flexShrink: 0 }}>
                        Last updated: {new Date().toLocaleTimeString()}
                    </Typography>
                </Paper>
            )}
        </Box>

        {/* Orders Table */}
        <TableContainer component={Paper} sx={{ 
          background: alpha('#ffffff', 0.05),
          border: `1px solid ${BORDER_COLOR}`,
          backdropFilter: 'blur(10px)',
          mb: 3,
          borderRadius: 3,
          overflowX: 'auto',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.4)'
        }}>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow sx={{ 
                background: TABLE_HEADER_BACKGROUND,
                '& th': { 
                  borderBottom: `2px solid ${alpha(SECONDARY_COLOR, 0.4)}`,
                  color: 'white', 
                  fontWeight: 'bolder',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontSize: isMobile ? '0.65rem' : '0.75rem',
                  py: 2
                }
              }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedOrders.length > 0 && selectedOrders.length < filteredOrders.length}
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={handleToggleAllSelection}
                    sx={{ color: 'white' }}
                  />
                </TableCell>
                <TableCell>ORDER</TableCell>
                <TableCell>CUSTOMER</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>ITEMS</TableCell>
                <TableCell>TOTAL</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow 
                  key={order.id}
                  hover
                  sx={{ 
                    '&:hover': { 
                      background: HOVER_BACKGROUND,
                      cursor: 'pointer'
                    },
                    '& td': {
                      borderBottom: '1px solid rgba(120, 119, 198, 0.1)',
                      color: 'white',
                      py: 2
                    }
                  }}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('input[type="checkbox"]') || 
                        (e.target as HTMLElement).closest('button')) {
                      return;
                    }
                    handleViewOrder(order);
                  }}
                >
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleToggleOrderSelection(order.id)}
                      sx={{ color: 'white' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography fontWeight="bold" sx={{ fontSize: isMobile ? '0.85rem' : '0.95rem' }}>
                        #{order.id}
                      </Typography>
                      <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                        {order.paymentMethod.replace(/_/g, ' ')}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography fontWeight="medium" sx={{ fontSize: isMobile ? '0.85rem' : '0.95rem' }}>
                        {order.customerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                        {order.customerEmail}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Badge
                      badgeContent={order.items.length}
                      color="secondary"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: ACCENT_COLOR,
                          fontSize: '0.7rem'
                        }
                      }}
                    >
                      <Typography fontWeight="medium">{order.items.length} items</Typography>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      fontWeight="bold" 
                      sx={{ color: PRIMARY_COLOR, fontSize: isMobile ? '0.95rem' : '1.05rem' }}
                    >
                      ${order.total.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                      {order.paymentStatus}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status.toUpperCase()}
                      size="medium"
                      sx={{
                        backgroundColor: alpha(getStatusColor(order.status), 0.2),
                        color: getStatusColor(order.status),
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        letterSpacing: 0.5
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      
                      {/* View Details */}
                      <Tooltip title="View Details">
                        <IconButton
                          size="medium"
                          onClick={() => handleViewOrder(order)}
                          sx={{
                            color: '#F29F58',
                            backgroundColor: alpha('#F29F58', 0.1),
                            '&:hover': { backgroundColor: alpha('#F29F58', 0.2) }
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {/* More Actions Menu */}
                      <Tooltip title="More Actions">
                        <IconButton
                          size="medium"
                          onClick={(e) => handleMenuOpen(e, order)}
                          sx={{
                            color: alpha('#ffffff', 0.7),
                            backgroundColor: alpha('#ffffff', 0.05),
                            '&:hover': { backgroundColor: alpha('#ffffff', 0.1) }
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* No Orders State */}
              {filteredOrders.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8, color: alpha('#ffffff', 0.5) }}>
                    <Stack spacing={3} alignItems="center">
                      <ShoppingBagIcon sx={{ fontSize: 72, color: alpha('#ffffff', 0.3) }} />
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          No Orders Found
                        </Typography>
                        <Typography variant="body1" sx={{ color: alpha('#ffffff', 0.5), mb: 3 }}>
                          {searchTerm 
                            ? 'No orders match your current search and filter criteria.' 
                            : 'This is the perfect time to optimize your inventory!'}
                        </Typography>
                        {searchTerm && (
                          <Button
                            variant="outlined"
                            onClick={() => setSearchTerm('')}
                            sx={{ borderColor: SECONDARY_COLOR, color: SECONDARY_COLOR, px: 4 }}
                          >
                            Clear Search
                          </Button>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                color: 'white',
                borderTop: `1px solid ${alpha(SECONDARY_COLOR, 0.2)}`,
                '& .MuiTablePagination-selectIcon': { color: 'white' },
                '& .MuiTablePagination-actions button': { color: 'white' },
                '& .MuiTablePagination-select': {
                  color: 'white',
                  border: `1px solid ${alpha(SECONDARY_COLOR, 0.5)}`,
                  borderRadius: 1,
                  padding: '4px 8px'
                },
                '& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': {
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                }
              }}
            />
          )}
        </TableContainer>

        {/* More Actions Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              background: CARD_GRADIENT,
              border: `1px solid ${BORDER_COLOR}`,
              color: 'white',
              minWidth: 200,
            }
          }}
        >
          {currentMenuOrder && (
            <>
              {/* Approve Option */}
              {currentMenuOrder.status === 'pending' && (
                <MenuItem onClick={() => {
                  handleApproveOrder(currentMenuOrder.id);
                  handleMenuClose();
                }}>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
                  </ListItemIcon>
                  <ListItemText>Approve Order</ListItemText>
                </MenuItem>
              )}

              {/* Ship Option */}
              {currentMenuOrder.status === 'approved' && (
                <MenuItem onClick={() => {
                  handleShipOrder(currentMenuOrder.id);
                  handleMenuClose();
                }}>
                  <ListItemIcon>
                    <ShippingIcon fontSize="small" sx={{ color: SECONDARY_COLOR }} />
                  </ListItemIcon>
                  <ListItemText>Mark as Shipped</ListItemText>
                </MenuItem>
              )}

              {/* Deliver Option */}
              {currentMenuOrder.status === 'shipped' && (
                <MenuItem onClick={() => {
                  handleDeliverOrder(currentMenuOrder.id);
                  handleMenuClose();
                }}>
                  <ListItemIcon>
                    <DoneIcon fontSize="small" sx={{ color: PRIMARY_COLOR }} />
                  </ListItemIcon>
                  <ListItemText>Mark as Delivered</ListItemText>
                </MenuItem>
              )}

              {/* Cancel Option */}
              {['pending', 'approved', 'shipped'].includes(currentMenuOrder.status) && (
                <MenuItem onClick={() => {
                  handleCancelOrder(currentMenuOrder.id);
                  handleMenuClose();
                }}>
                  <ListItemIcon>
                    <CancelIcon fontSize="small" sx={{ color: ACCENT_COLOR }} />
                  </ListItemIcon>
                  <ListItemText>Cancel Order</ListItemText>
                </MenuItem>
              )}

              <Divider sx={{ borderColor: alpha('#ffffff', 0.1), my: 1 }} />

              {/* Print Option */}
              <MenuItem onClick={() => {
                handlePrintOrder(currentMenuOrder);
                handleMenuClose();
              }}>
                <ListItemIcon>
                  <PrintIcon fontSize="small" sx={{ color: '#F29F58' }} />
                </ListItemIcon>
                <ListItemText>Print Invoice</ListItemText>
              </MenuItem>

              {/* Delete Option */}
              <MenuItem onClick={() => {
                handleDeleteOrder(currentMenuOrder.id);
              }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" sx={{ color: '#FF4757' }} />
                </ListItemIcon>
                <ListItemText sx={{ color: '#FF4757' }}>Delete Order</ListItemText>
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Order Details Dialog (existing code preserved) */}
        <Dialog
          open={orderDialogOpen}
          onClose={() => setOrderDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: BACKGROUND_GRADIENT,
              border: `1px solid ${alpha(SECONDARY_COLOR, 0.5)}`,
              borderRadius: 3,
              color: 'white',
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.5)',
            }
          }}
        >
          {selectedOrder && (
            <>
              <DialogTitle sx={{ borderBottom: `1px solid ${alpha(SECONDARY_COLOR, 0.2)}`, pb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      ORDER DETAIL <span style={{ color: PRIMARY_COLOR }}>#{selectedOrder.id}</span>
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: alpha('#ffffff', 0.7), mt: 0.5 }}>
                      Created: {formatDate(selectedOrder.createdAt)}
                    </Typography>
                  </Box>
                  <Chip
                    label={selectedOrder.status.toUpperCase()}
                    sx={{
                      backgroundColor: alpha(getStatusColor(selectedOrder.status), 0.2),
                      color: getStatusColor(selectedOrder.status),
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      py: 1.5,
                      px: 1
                    }}
                  />
                </Stack>
              </DialogTitle>
              
              <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={3}>
                  {/* Customer Information Card */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ background: alpha('#ffffff', 0.05), border: `1px solid ${BORDER_COLOR}`, borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ color: PRIMARY_COLOR, mb: 2, fontWeight: 'medium' }}>
                          Customer Information
                        </Typography>
                        
                        <Stack spacing={2}>
                          {[
                            { label: 'Customer Name', value: selectedOrder.customerName, fontWeight: 'bold' },
                            { label: 'Email Address', value: selectedOrder.customerEmail },
                            { label: 'Phone Number', value: selectedOrder.customerPhone },
                            { label: 'Shipping Address', value: selectedOrder.shippingAddress },
                          ].filter(item => item.value).map((item, index) => (
                            <Box key={index}>
                              <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5), display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {item.label}
                              </Typography>
                              <Typography fontWeight={item.fontWeight || 'regular'}>
                                {item.value}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Order Summary Card */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ background: alpha('#ffffff', 0.05), border: `1px solid ${BORDER_COLOR}`, borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ color: PRIMARY_COLOR, mb: 2, fontWeight: 'medium' }}>
                          Order Summary
                        </Typography>
                        
                        <Stack spacing={1.5}>
                          {/* Subtotal */}
                          <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{ color: alpha('#ffffff', 0.7) }}>Subtotal</Typography>
                            <Typography fontWeight="medium">${selectedOrder.subtotal.toFixed(2)}</Typography>
                          </Stack>
                          
                          {/* Shipping */}
                          <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{ color: alpha('#ffffff', 0.7) }}>Shipping Fee</Typography>
                            <Typography fontWeight="medium">${selectedOrder.shippingFee.toFixed(2)}</Typography>
                          </Stack>
                          
                          {/* Tax */}
                          <Stack direction="row" justifyContent="space-between">
                            <Typography sx={{ color: alpha('#ffffff', 0.7) }}>Tax (9%)</Typography>
                            <Typography fontWeight="medium">${selectedOrder.tax.toFixed(2)}</Typography>
                          </Stack>
                          
                          <Divider sx={{ borderColor: alpha('#ffffff', 0.1), my: 1.5 }} />
                          
                          {/* Total */}
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight="bold">Total</Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: ACCENT_COLOR, letterSpacing: 0.5 }}>
                              ${selectedOrder.total.toFixed(2)}
                            </Typography>
                          </Stack>
                          
                          <Divider sx={{ borderColor: alpha('#ffffff', 0.1), my: 1.5 }} />
                          
                          {/* Payment Method/Status */}
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                              Payment Method
                            </Typography>
                            <Typography fontWeight="medium" sx={{ color: SECONDARY_COLOR, textTransform: 'uppercase' }}>
                              {selectedOrder.paymentMethod.replace(/_/g, ' ')}
                            </Typography>
                          </Stack>
                          
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                              Payment Status
                            </Typography>
                            <Chip
                              label={selectedOrder.paymentStatus.toUpperCase()}
                              size="small"
                              sx={{
                                backgroundColor: alpha(getPaymentStatusColor(selectedOrder.paymentStatus), 0.2),
                                color: getPaymentStatusColor(selectedOrder.paymentStatus),
                                fontWeight: 'bold',
                              }}
                            />
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Order Items Table */}
                  <Grid item xs={12}>
                    <Card sx={{ background: alpha('#ffffff', 0.05), border: `1px solid ${BORDER_COLOR}`, borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ color: PRIMARY_COLOR, mb: 2, fontWeight: 'medium' }}>
                          Order Items ({selectedOrder.items.length})
                        </Typography>
                        
                        <TableContainer>
                          <Table size="medium">
                            <TableHead>
                              <TableRow sx={{ background: alpha(SECONDARY_COLOR, 0.1) }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>PRODUCT</TableCell>
                                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>QUANTITY</TableCell>
                                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>PRICE</TableCell>
                                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>TOTAL</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedOrder.items.map((item) => (
                                <TableRow key={item.id} hover>
                                  <TableCell sx={{ color: 'white', borderBottom: `1px solid ${alpha(SECONDARY_COLOR, 0.1)}` }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <Box
                                        component="img"
                                        src={item.thumbnail}
                                        alt={item.productName}
                                        sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                                      />
                                      <Typography fontWeight="medium">{item.productName}</Typography>
                                    </Stack>
                                  </TableCell>
                                  <TableCell align="right" sx={{ color: 'white', borderBottom: `1px solid ${alpha(SECONDARY_COLOR, 0.1)}` }}>
                                    {item.quantity}
                                  </TableCell>
                                  <TableCell align="right" sx={{ color: 'white', borderBottom: `1px solid ${alpha(SECONDARY_COLOR, 0.1)}` }}>
                                    ${item.price.toFixed(2)}
                                  </TableCell>
                                  <TableCell align="right" sx={{ color: PRIMARY_COLOR, fontWeight: 'bold', borderBottom: `1px solid ${alpha(SECONDARY_COLOR, 0.1)}` }}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions sx={{ borderTop: `1px solid ${alpha(SECONDARY_COLOR, 0.2)}`, p: 3 }}>
                <Grid container spacing={2}>
                  {/* Close and Print always visible */}
                  <Grid item xs={12} sm={3}>
                    <Button
                      fullWidth
                      onClick={() => setOrderDialogOpen(false)}
                      sx={{
                        color: ACCENT_COLOR,
                        border: `1px solid ${alpha(ACCENT_COLOR, 0.5)}`,
                        '&:hover': { backgroundColor: alpha(ACCENT_COLOR, 0.1) }
                      }}
                    >
                      Close
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button
                      fullWidth
                      startIcon={<PrintIcon />}
                      onClick={() => handlePrintOrder(selectedOrder)}
                      sx={{
                        color: SECONDARY_COLOR,
                        border: `1px solid ${alpha(SECONDARY_COLOR, 0.5)}`,
                        '&:hover': { backgroundColor: alpha(SECONDARY_COLOR, 0.1) }
                      }}
                    >
                      Print Invoice
                    </Button>
                  </Grid>
                  
                  {/* NEW: Delete Button in Dialog */}
                  <Grid item xs={12} sm={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        if (window.confirm(`Delete order #${selectedOrder.id}? This action cannot be undone.`)) {
                          handleDeleteOrder(selectedOrder.id);
                          setOrderDialogOpen(false);
                        }
                      }}
                      sx={{
                        background: 'linear-gradient(135deg, #FF4757 0%, #FF3333 100%)',
                        color: 'white',
                        py: 1.5,
                        '&:hover': { background: 'linear-gradient(135deg, #FF3333 0%, #FF4757 100%)' }
                      }}
                    >
                      Delete Order
                    </Button>
                  </Grid>
                  
                  {/* Dynamic Action Buttons */}
                  {selectedOrder.status === 'pending' && (
                    <Grid item xs={12} sm={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CheckIcon />}
                        onClick={() => {
                          handleApproveOrder(selectedOrder.id);
                          setOrderDialogOpen(false);
                        }}
                        sx={{
                          background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #36A398 100%)`,
                          color: 'white',
                          py: 1.5,
                          '&:hover': { background: `linear-gradient(135deg, #36A398 0%, ${PRIMARY_COLOR} 100%)` }
                        }}
                      >
                        Approve Order
                      </Button>
                    </Grid>
                  )}
                  
                  {selectedOrder.status === 'approved' && (
                    <Grid item xs={12} sm={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ShippingIcon />}
                        onClick={() => {
                          handleShipOrder(selectedOrder.id);
                          setOrderDialogOpen(false);
                        }}
                        sx={{
                          background: `linear-gradient(135deg, ${SECONDARY_COLOR} 0%, #5A59A1 100%)`,
                          color: 'white',
                          py: 1.5,
                          '&:hover': { background: `linear-gradient(135deg, #5A59A1 0%, ${SECONDARY_COLOR} 100%)` }
                        }}
                      >
                        Mark as Shipped
                      </Button>
                    </Grid>
                  )}
                  
                  {selectedOrder.status === 'shipped' && (
                    <Grid item xs={12} sm={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<DoneIcon />}
                        onClick={() => {
                          handleDeliverOrder(selectedOrder.id);
                          setOrderDialogOpen(false);
                        }}
                        sx={{
                          background: 'linear-gradient(135deg, #7ED321 0%, #5BA816 100%)',
                          color: 'white',
                          py: 1.5,
                          '&:hover': { background: 'linear-gradient(135deg, #5BA816 0%, #7ED321 100%)' }
                        }}
                      >
                        Mark as Delivered
                      </Button>
                    </Grid>
                  )}

                  {/* Cancel Button */}
                  {['pending', 'approved', 'shipped'].includes(selectedOrder.status) && (
                    <Grid item xs={12} sm={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          handleCancelOrder(selectedOrder.id);
                          setOrderDialogOpen(false);
                        }}
                        sx={{
                          background: `linear-gradient(135deg, ${ACCENT_COLOR} 0%, #E8497A 100%)`,
                          color: 'white',
                          py: 1.5,
                          '&:hover': { background: `linear-gradient(135deg, #E8497A 0%, ${ACCENT_COLOR} 100%)` }
                        }}
                      >
                        Cancel Order
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
      
      {/* Global Styles for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 ${alpha(PRIMARY_COLOR, 0.7)}; }
            70% { box-shadow: 0 0 0 10px ${alpha(PRIMARY_COLOR, 0)}; }
            100% { box-shadow: 0 0 0 0 ${alpha(PRIMARY_COLOR, 0)}; }
          }
          .MuiBox-root > div > div > div:nth-child(1) > div:nth-child(1) > div > div > div:nth-child(1) {
            animation: pulse 2s infinite;
          }
        `}
      </style>
    </Box>
  );
};

export default OrderManagement;
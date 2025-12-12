
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Menu,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckIcon,
  LocalShipping as ShippingIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useUserStore } from '../store/userStore';
import { useNavigate } from 'react-router-dom';

// Define the interfaces locally if not exported from userStore
interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  thumbnail: string;
}

interface Order {
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

const OrderManagement = () => {
  const { orders, updateOrderStatus, getSellerOrders } = useUserStore();
  const navigate = useNavigate();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const sellerOrders = getSellerOrders();
    const filtered = sellerOrders.filter(order => {
      const matchesSearch = 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    setFilteredOrders(filtered as Order[]);
  }, [orders, searchTerm, statusFilter, getSellerOrders]);

  const handleApproveOrder = (orderId: number) => {
    updateOrderStatus(orderId, 'approved');
    
    // Simulate sending notification to customer
    const order = orders.find(o => o.id === orderId);
    if (order) {
      simulateOrderNotification(orderId, 'approved', order.customerName, order.customerEmail);
    }
  };

  const handleShipOrder = (orderId: number) => {
    updateOrderStatus(orderId, 'shipped');
    
    // Simulate sending notification to customer
    const order = orders.find(o => o.id === orderId);
    if (order) {
      simulateOrderNotification(orderId, 'shipped', order.customerName, order.customerEmail);
    }
  };

  const handleCancelOrder = (orderId: number) => {
    updateOrderStatus(orderId, 'cancelled');
    
    // Simulate sending notification to customer
    const order = orders.find(o => o.id === orderId);
    if (order) {
      simulateOrderNotification(orderId, 'cancelled', order.customerName, order.customerEmail);
    }
  };

  const simulateOrderNotification = (orderId: number, status: string, customerName: string, customerEmail: string) => {
    console.log(`📢 ORDER NOTIFICATION:`);
    console.log(`Order #${orderId} has been ${status}`);
    console.log(`Customer: ${customerName} (${customerEmail})`);
    console.log(`Notification sent: Order #${orderId} has been ${status} by the seller.`);
    console.log('---');
    
    // In a real app, this would:
    // 1. Send email to customer
    // 2. Send in-app notification
    // 3. Update notification in database
    // 4. Possibly send SMS or push notification
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDialogOpen(true);
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, order: Order) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedOrder(null);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
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

  const getTotalItems = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0A081F 0%, #1A173B 100%)',
      p: 3 
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: alpha('#1A173B', 0.7),
          border: '1px solid rgba(120, 119, 198, 0.2)',
          backdropFilter: 'blur(20px)',
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
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
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
                    Order Management
                  </Typography>
                  <Breadcrumbs sx={{ color: alpha('#ffffff', 0.7) }}>
                    <Link underline="hover" color="inherit" onClick={handleGoHome} sx={{ cursor: 'pointer' }}>
                      Home
                    </Link>
                    <Typography color="#7877C6">Order Management</Typography>
                  </Breadcrumbs>
                </Box>
              </Stack>
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
                Manage and process customer orders. Customers will receive notifications when orders are approved or shipped.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              sx={{ borderColor: '#4ECDC4', color: '#4ECDC4' }}
              onClick={() => setFilteredOrders([...filteredOrders])}
            >
              Refresh
            </Button>
          </Stack>
        </Paper>

        {/* Filters */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: alpha('#ffffff', 0.05),
          border: '1px solid rgba(120, 119, 198, 0.2)',
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search orders by ID, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: alpha('#ffffff', 0.5) }} />
                    </InputAdornment>
                  ),
                  sx: {
                    background: alpha('#ffffff', 0.05),
                    color: 'white',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
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
                  label="Approved"
                  onClick={() => setStatusFilter('approved')}
                  color={statusFilter === 'approved' ? 'info' : 'default'}
                  sx={{ backgroundColor: statusFilter === 'approved' ? alpha('#4ECDC4', 0.2) : alpha('#ffffff', 0.1) }}
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
            </Grid>
          </Grid>
        </Paper>

        {/* Info Banner */}
        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          background: alpha('#4ECDC4', 0.1),
          border: '1px solid rgba(78, 205, 196, 0.3)',
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <NotificationsIcon sx={{ color: '#4ECDC4' }} />
            <Typography variant="body2" sx={{ color: '#4ECDC4', flex: 1 }}>
              <strong>Notification System Active:</strong> Customers will automatically receive notifications when their orders are approved or shipped.
            </Typography>
          </Stack>
        </Paper>

        {/* Orders Table */}
        <TableContainer component={Paper} sx={{ 
          background: alpha('#ffffff', 0.05),
          border: '1px solid rgba(120, 119, 198, 0.2)',
          backdropFilter: 'blur(10px)',
          mb: 3,
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
                  onClick={() => handleViewOrder(order)}
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
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {getTotalItems(order.items)} items
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
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.paymentStatus.toUpperCase()}
                      size="small"
                      color={getPaymentStatusColor(order.paymentStatus) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {order.status === 'pending' && (
                        <Button
                          size="small"
                          startIcon={<CheckIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveOrder(order.id);
                          }}
                          sx={{
                            background: alpha('#4ECDC4', 0.2),
                            color: '#4ECDC4',
                            '&:hover': { background: alpha('#4ECDC4', 0.3) },
                          }}
                        >
                          Approve
                        </Button>
                      )}
                      {order.status === 'approved' && (
                        <Button
                          size="small"
                          startIcon={<ShippingIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShipOrder(order.id);
                          }}
                          sx={{
                            background: alpha('#7877C6', 0.2),
                            color: '#7877C6',
                            '&:hover': { background: alpha('#7877C6', 0.3) },
                          }}
                        >
                          Ship
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionMenuOpen(e, order);
                        }}
                        sx={{ 
                          color: alpha('#ffffff', 0.7),
                          backgroundColor: alpha('#ffffff', 0.1),
                          '&:hover': { backgroundColor: alpha('#ffffff', 0.2) }
                        }}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: alpha('#ffffff', 0.5) }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <ShoppingBag sx={{ fontSize: 48, color: alpha('#ffffff', 0.3) }} />
                      <Typography>No orders found</Typography>
                      {searchTerm && (
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => setSearchTerm('')}
                          sx={{ borderColor: '#7877C6', color: '#7877C6' }}
                        >
                          Clear search
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
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

        {/* Order Details Dialog */}
        <Dialog 
          open={orderDialogOpen} 
          onClose={() => setOrderDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedOrder && (
            <>
              <DialogTitle sx={{ 
                background: 'linear-gradient(135deg, #1A173B 0%, #2A2660 100%)',
                color: 'white',
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Order #{selectedOrder.id} Details</Typography>
                  <Chip
                    label={selectedOrder.status.toUpperCase()}
                    color={getStatusColor(selectedOrder.status) as any}
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
                          <Typography>{selectedOrder.customerName}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>Email</Typography>
                          <Typography>{selectedOrder.customerEmail}</Typography>
                        </Box>
                        {selectedOrder.customerPhone && (
                          <Box>
                            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>Phone</Typography>
                            <Typography>{selectedOrder.customerPhone}</Typography>
                          </Box>
                        )}
                        <Box>
                          <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>Shipping Address</Typography>
                          <Typography>{selectedOrder.shippingAddress}</Typography>
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
                          <Typography>${selectedOrder.subtotal.toFixed(2)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>Shipping Fee</Typography>
                          <Typography>${selectedOrder.shippingFee.toFixed(2)}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography>Tax (9%)</Typography>
                          <Typography>${selectedOrder.tax.toFixed(2)}</Typography>
                        </Stack>
                        <Divider sx={{ borderColor: alpha('#ffffff', 0.1), my: 1 }} />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="h6">Total</Typography>
                          <Typography variant="h6">${selectedOrder.total.toFixed(2)}</Typography>
                        </Stack>
                        <Divider sx={{ borderColor: alpha('#ffffff', 0.1), my: 1 }} />
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>Payment Method</Typography>
                          <Chip
                            label={selectedOrder.paymentMethod.replace(/_/g, ' ').toUpperCase()}
                            size="small"
                            sx={{ backgroundColor: alpha('#7877C6', 0.2), color: '#7877C6' }}
                          />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>Payment Status</Typography>
                          <Chip
                            label={selectedOrder.paymentStatus.toUpperCase()}
                            size="small"
                            color={getPaymentStatusColor(selectedOrder.paymentStatus) as any}
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Order Items */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#4ECDC4' }}>Order Items</Typography>
                    <TableContainer component={Paper} sx={{ background: alpha('#ffffff', 0.05) }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: 'white' }}>Product</TableCell>
                            <TableCell sx={{ color: 'white' }} align="right">Qty</TableCell>
                            <TableCell sx={{ color: 'white' }} align="right">Price</TableCell>
                            <TableCell sx={{ color: 'white' }} align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell sx={{ color: 'white' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Box
                                    component="img"
                                    src={item.thumbnail}
                                    alt={item.productName}
                                    sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                                  />
                                  <Typography>{item.productName}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell sx={{ color: 'white' }} align="right">{item.quantity}</TableCell>
                              <TableCell sx={{ color: 'white' }} align="right">${item.price.toFixed(2)}</TableCell>
                              <TableCell sx={{ color: 'white' }} align="right">
                                ${(item.price * item.quantity).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ 
                background: '#1A173B', 
                borderTop: '1px solid rgba(120, 119, 198, 0.2)',
                p: 2 
              }}>
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                  <Button
                    onClick={() => setOrderDialogOpen(false)}
                    sx={{ 
                      color: '#FF6B95',
                      flex: 1
                    }}
                  >
                    Close
                  </Button>
                  {selectedOrder.status === 'pending' && (
                    <Button
                      variant="contained"
                      startIcon={<CheckIcon />}
                      onClick={() => {
                        handleApproveOrder(selectedOrder.id);
                        setOrderDialogOpen(false);
                      }}
                      sx={{
                        background: 'linear-gradient(135deg, #4ECDC4 0%, #36A398 100%)',
                        color: 'white',
                        flex: 1
                      }}
                    >
                      Approve Order
                    </Button>
                  )}
                  {selectedOrder.status === 'approved' && (
                    <Button
                      variant="contained"
                      startIcon={<ShippingIcon />}
                      onClick={() => {
                        handleShipOrder(selectedOrder.id);
                        setOrderDialogOpen(false);
                      }}
                      sx={{
                        background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                        color: 'white',
                        flex: 1
                      }}
                    >
                      Mark as Shipped
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    sx={{
                      borderColor: '#F29F58',
                      color: '#F29F58',
                      flex: 1
                    }}
                  >
                    Print Invoice
                  </Button>
                </Stack>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: '#1A173B',
              color: 'white',
              border: '1px solid rgba(120, 119, 198, 0.3)',
            }
          }}
        >
          {selectedOrder && (
            <>
              <MenuItem onClick={() => {
                handleViewOrder(selectedOrder);
                handleActionMenuClose();
              }}>
                <ViewIcon fontSize="small" sx={{ mr: 1, color: '#4ECDC4' }} />
                View Details
              </MenuItem>
              {selectedOrder.status === 'pending' && (
                <MenuItem onClick={() => {
                  handleApproveOrder(selectedOrder.id);
                  handleActionMenuClose();
                }}>
                  <CheckIcon fontSize="small" sx={{ mr: 1, color: '#4ECDC4' }} />
                  Approve Order
                </MenuItem>
              )}
              {selectedOrder.status === 'approved' && (
                <MenuItem onClick={() => {
                  handleShipOrder(selectedOrder.id);
                  handleActionMenuClose();
                }}>
                  <ShippingIcon fontSize="small" sx={{ mr: 1, color: '#7877C6' }} />
                  Mark as Shipped
                </MenuItem>
              )}
              <MenuItem onClick={() => {
                handleCancelOrder(selectedOrder.id);
                handleActionMenuClose();
              }}>
                <CancelIcon fontSize="small" sx={{ mr: 1, color: '#FF6B95' }} />
                Cancel Order
              </MenuItem>
              <Divider sx={{ borderColor: alpha('#ffffff', 0.1) }} />
              <MenuItem onClick={handleActionMenuClose}>
                <NotificationsIcon fontSize="small" sx={{ mr: 1, color: '#F29F58' }} />
                Send Custom Notification
              </MenuItem>
            </>
          )}
        </Menu>
      </Container>
    </Box>
  );
};

export default OrderManagement;

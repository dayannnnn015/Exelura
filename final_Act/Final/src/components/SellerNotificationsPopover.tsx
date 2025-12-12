import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
  IconButton,
  Stack,
  alpha,
  Button,
  Badge,
  Popover,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  ShoppingBag as OrderIcon,
  Close as CloseIcon,
  Circle as CircleIcon,
  AccountCircle as CustomerIcon,
  Cancel as CancelIcon,
  Storefront as StoreIcon,
  Delete as DeleteIcon,
  Store as LowStockIcon,
  Star as ReviewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

interface SellerNotificationsPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  unreadCount: number;
  onMarkAllRead: () => void;
}

// Notification sound setup
const notificationSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3');

const SellerNotificationsPopover = ({
  anchorEl,
  open,
  onClose,
  unreadCount,
  onMarkAllRead,
}: SellerNotificationsPopoverProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { orders, currentUser, notifications, addNotification, deleteOrder } = useUserStore();
  const [localNotifications, setLocalNotifications] = useState<any[]>([]);
  const [newOrderSoundPlayed, setNewOrderSoundPlayed] = useState<Set<number>>(new Set());

  // Generate and sort real-time notifications from orders
  useEffect(() => {
    if (!open) return;

    const currentUserId = currentUser?.id || 2;
    
    // Filter orders relevant to the current seller
    const sellerOrders = orders.filter(order => 
      order.sellerId === currentUserId
    );

    // 1. Generate notifications from recent orders
    const orderNotifications = sellerOrders.map(order => {
      const isNewOrder = new Date(order.createdAt).getTime() > Date.now() - 3600000; // Within last hour
      const status = order.status;
      
      let title = '';
      let message = '';
      let priority = 'medium';
      let type = 'order';
      let iconColor = '#4ECDC4';
      
      if (isNewOrder && status === 'pending') {
        title = `🎉 New Order #${order.id}`;
        message = `${order.customerName} placed a new order for ${order.items.length} item(s). Action required.`;
        priority = 'high';
        type = 'new_order';
        iconColor = '#FF6B95';
      } else if (status === 'pending') {
        title = `Order #${order.id} Pending`;
        message = 'Order is awaiting your approval to proceed with shipment.';
        priority = 'high';
      } else if (status === 'cancelled') {
        title = `Order #${order.id} Cancelled`;
        message = 'Customer has cancelled this order. No further action is needed.';
        priority = 'medium';
        type = 'cancelled';
        iconColor = '#FF4757';
      } else if (status === 'approved') {
        title = `Order #${order.id} Approved`;
        message = 'Order has been approved and is ready for shipping.';
        priority = 'medium';
        type = 'approved';
        iconColor = '#4A90E2';
      } else if (status === 'shipped') {
        title = `Order #${order.id} Shipped`;
        message = 'Order has been shipped to the customer.';
        priority = 'low';
        type = 'shipped';
        iconColor = '#7ED321';
      } else if (status === 'delivered') {
        title = `Order #${order.id} Delivered`;
        message = 'Order has been successfully delivered to the customer.';
        priority = 'low';
        type = 'delivered';
        iconColor = '#2ECC71';
      }

      return {
        id: `order_${order.id}`,
        type,
        title,
        message,
        status: order.status,
        orderId: order.id,
        customerName: order.customerName,
        timestamp: order.createdAt,
        read: false,
        priority,
        iconColor,
        canDelete: status === 'cancelled' || status === 'delivered',
        actionType: type,
      };
    });

    // 2. Add system notifications from store
    const systemNotifications = notifications
      .filter(notification => 
        notification.userId === currentUserId && 
        (notification.type === 'order' || notification.type === 'system')
      )
      .map(notification => ({
        id: `system_${notification.id}`,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: notification.createdAt,
        read: notification.read,
        priority: notification.data?.priority || 'medium',
        iconColor: getNotificationColor(notification.type, notification.data?.priority || 'medium'),
        canDelete: true,
        actionType: 'system',
      }));

    // 3. Sample notifications for demo (remove in production)
    const demoNotifications = [
      {
        id: `demo_low_stock_1`,
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: '"Designer Handbag" is running low on inventory (5 items left). Restock soon!',
        timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        read: false,
        priority: 'high',
        iconColor: '#FF6B95',
        canDelete: true,
        actionType: 'product',
      },
      {
        id: `demo_review_1`,
        type: 'review',
        title: 'New Product Review',
        message: 'Customer left a 5-star review for "Premium Watch". Check it out.',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read: true,
        priority: 'medium',
        iconColor: '#F29F58',
        canDelete: true,
        actionType: 'review',
      },
    ];

    const combinedNotifications = [
      ...orderNotifications, 
      ...systemNotifications, 
      ...demoNotifications
    ];
    
    // Sort notifications
    combinedNotifications.sort((a, b) => {
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Play sound for new orders
    const newOrders = orderNotifications.filter(n => 
      n.type === 'new_order' && !n.read && !newOrderSoundPlayed.has(parseInt(n.id.split('_')[1]))
    );
    
    if (newOrders.length > 0 && open) {
      notificationSound.play().catch(e => console.log('Audio play failed:', e));
      
      // Add to played sounds set
      newOrders.forEach(order => {
        const orderId = parseInt(order.id.split('_')[1]);
        setNewOrderSoundPlayed(prev => new Set(prev).add(orderId));
      });
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('🛒 New Order Received!', {
          body: `You have ${newOrders.length} new order${newOrders.length > 1 ? 's' : ''}`,
          icon: '/favicon.ico'
        });
      }
    }

    setLocalNotifications(combinedNotifications);
  }, [open, orders, currentUser, notifications, newOrderSoundPlayed]);

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If it's an order notification, also delete the order
    if (id.startsWith('order_')) {
      const orderId = parseInt(id.split('_')[1]);
      deleteOrder(orderId);
    }
    
    setLocalNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLocalNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    setLocalNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    onMarkAllRead();
  };

  const handleNotificationClick = (notification: any) => {
    handleMarkAsRead(notification.id);
    
    if (notification.actionType === 'order' || notification.actionType === 'new_order') {
      navigate(`/seller/orders?order=${notification.orderId}`);
    } else if (notification.actionType === 'product') {
      navigate('/seller/products');
    } else if (notification.actionType === 'review') {
      navigate('/seller/reviews');
    } else if (notification.actionType === 'system') {
      navigate('/seller/dashboard');
    }
    onClose();
  };

  const handleClearAll = () => {
    setLocalNotifications([]);
    // Also delete all associated orders
    localNotifications.forEach(notification => {
      if (notification.id.startsWith('order_')) {
        const orderId = parseInt(notification.id.split('_')[1]);
        deleteOrder(orderId);
      }
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
      case 'new_order':
        return <OrderIcon fontSize="small" />;
      case 'approved':
        return <CheckCircleIcon fontSize="small" />;
      case 'shipped':
        return <ShippingIcon fontSize="small" />;
      case 'cancelled':
        return <CancelIcon fontSize="small" />;
      case 'review':
        return <ReviewIcon fontSize="small" />;
      case 'low_stock':
        return <LowStockIcon fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  const getNotificationColor = (type: string, priority: string = 'medium') => {
    const colors: Record<string, Record<string, string>> = {
      order: { high: '#4ECDC4', medium: '#4A90E2', low: '#7ED321' },
      new_order: { high: '#FF6B95', medium: '#FF6B95', low: '#FF6B95' },
      approved: { high: '#4A90E2', medium: '#4A90E2', low: '#4A90E2' },
      shipped: { high: '#7ED321', medium: '#7ED321', low: '#7ED321' },
      cancelled: { high: '#FF4757', medium: '#FF4757', low: '#FF4757' },
      delivered: { high: '#2ECC71', medium: '#2ECC71', low: '#2ECC71' },
      review: { high: '#F29F58', medium: '#F29F58', low: '#FFCC80' },
      low_stock: { high: '#FF6B95', medium: '#F06292', low: '#E57373' }
    };

    const typeColors = colors[type] || colors.order;
    return typeColors[priority as keyof typeof typeColors] || typeColors.medium;
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CSS_VARS = {
    primaryDark: '#1B1833',
    primaryPurple: '#441752',
    primaryPink: '#AB4459',
    primaryOrange: '#F29F58',
  };

  const currentUnreadCount = localNotifications.filter(n => !n.read).length;

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: isMobile ? '90vw' : 420,
          maxHeight: isMobile ? '80vh' : 580,
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: CSS_VARS.primaryDark,
          border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          mt: 1,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.2)}`,
          backgroundColor: alpha(CSS_VARS.primaryDark, 0.95),
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ position: 'relative' }}>
            <Badge 
              badgeContent={currentUnreadCount} 
              color="error" 
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#FF4757',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  minWidth: 20,
                  height: 20,
                  top: -5,
                  right: -5,
                }
              }}
            >
              <NotificationsIcon sx={{ 
                color: '#FFD166',
                fontSize: 28,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }} />
            </Badge>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#FFFFFF' }}>
              Seller Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.7) }}>
              {currentUnreadCount} unread • {localNotifications.length} total
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          {localNotifications.length > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton
                size="small"
                onClick={handleMarkAllAsRead}
                disabled={currentUnreadCount === 0}
                sx={{
                  color: currentUnreadCount > 0 ? CSS_VARS.primaryOrange : alpha('#ffffff', 0.3),
                  backgroundColor: alpha(CSS_VARS.primaryOrange, 0.1),
                  border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`,
                  '&:hover': {
                    backgroundColor: alpha(CSS_VARS.primaryOrange, 0.2),
                  },
                  '&.Mui-disabled': {
                    borderColor: alpha('#ffffff', 0.1),
                    backgroundColor: alpha('#ffffff', 0.05),
                  },
                }}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Close">
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: alpha('#ffffff', 0.7),
                backgroundColor: alpha('#FF4757', 0.1),
                border: `1px solid ${alpha('#FF4757', 0.3)}`,
                '&:hover': {
                  backgroundColor: alpha('#FF4757', 0.2),
                  color: '#FFFFFF',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Notifications List */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        maxHeight: isMobile ? 'calc(80vh - 80px)' : 480,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: alpha('#000000', 0.1),
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: alpha(CSS_VARS.primaryOrange, 0.5),
          borderRadius: '4px',
          '&:hover': {
            background: alpha(CSS_VARS.primaryOrange, 0.7),
          },
        },
      }}>
        {localNotifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ 
              fontSize: 64, 
              color: alpha(CSS_VARS.primaryOrange, 0.3), 
              mb: 2,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
            }} />
            <Typography variant="h6" gutterBottom sx={{ color: '#FFFFFF', fontWeight: 600 }}>
              No Notifications Yet
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.5) }}>
              You'll see order notifications here when customers place orders
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {localNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItemButton
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 2,
                    px: 2.5,
                    backgroundColor: notification.read 
                      ? 'transparent' 
                      : alpha(notification.iconColor, 0.08),
                    '&:hover': { 
                      backgroundColor: notification.read 
                        ? alpha('#FFFFFF', 0.05) 
                        : alpha(notification.iconColor, 0.12) 
                    },
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    borderLeft: notification.read 
                      ? 'none' 
                      : `3px solid ${notification.iconColor}`,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48, mr: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${alpha(notification.iconColor, 0.2)} 0%, ${alpha(notification.iconColor, 0.1)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${alpha(notification.iconColor, 0.3)}`,
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={notification.read ? 500 : 700}
                          sx={{ 
                            color: '#FFFFFF', 
                            lineHeight: 1.3,
                            fontSize: '0.95rem',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: alpha('#FFFFFF', 0.6), 
                          whiteSpace: 'nowrap',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}>
                          {formatTimeAgo(notification.timestamp)}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          sx={{
                            color: alpha('#FFFFFF', 0.8),
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mt: 0.5,
                            fontSize: '0.875rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        {!notification.read && (
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                            <CircleIcon sx={{ 
                              fontSize: 8, 
                              color: notification.iconColor 
                            }} />
                            <Typography variant="caption" sx={{ 
                              color: notification.iconColor,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}>
                              NEW
                            </Typography>
                          </Stack>
                        )}
                      </>
                    }
                  />
                  {notification.canDelete && (
                    <Tooltip title="Delete notification">
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: alpha('#FFFFFF', 0.3),
                          backgroundColor: alpha('#000000', 0.3),
                          width: 24,
                          height: 24,
                          '&:hover': { 
                            color: '#FF4757',
                            backgroundColor: alpha('#FF4757', 0.1),
                          },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItemButton>
                {index < localNotifications.length - 1 && (
                  <Divider sx={{ borderColor: alpha('#FFFFFF', 0.05), mx: 2 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Clear All Button */}
      {localNotifications.length > 0 && (
        <Box
          sx={{
            p: 1.5,
            borderTop: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.2)}`,
            backgroundColor: alpha(CSS_VARS.primaryDark, 0.95),
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleClearAll}
            sx={{
              color: '#FF4757',
              borderColor: alpha('#FF4757', 0.3),
              backgroundColor: alpha('#FF4757', 0.05),
              fontWeight: 600,
              fontSize: '0.875rem',
              py: 0.75,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: alpha('#FF4757', 0.15),
                borderColor: '#FF4757',
              },
            }}
          >
            Clear All Notifications
          </Button>
        </Box>
      )}
    </Popover>
  );
};

export default SellerNotificationsPopover;
// NotificationsPopover.tsx - Only order-based notifications from seller actions, sorted by timestamp (newest first)
import React, { useState, useEffect, useRef } from 'react';
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
  IconButton,
  Stack,
  alpha,
  Button,
  Badge,
  Popover,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  ShoppingBag as OrderIcon,
  Close as CloseIcon,
  Circle as CircleIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

interface NotificationsPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  unreadCount: number;
  onMarkAllRead: () => void;
}

const NotificationsPopover = ({
  anchorEl,
  open,
  onClose,
  unreadCount,
  onMarkAllRead,
}: NotificationsPopoverProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { orders, currentUser } = useUserStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const previousNotificationsCount = useRef(0);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const [processedOrderIds, setProcessedOrderIds] = useState<Set<string>>(() => {
    // Load already processed order IDs from localStorage on initial render
    const saved = localStorage.getItem('processedOrderNotifications');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Initialize notification sound
  useEffect(() => {
    notificationSoundRef.current = new Audio('/notification-sound.mp3');
    notificationSoundRef.current.volume = 0.3;
  }, []);

  useEffect(() => {
    // Generate notifications only from orders where seller has taken action
    const userOrders = orders.filter(order => order.userId === currentUser?.id);
    
    // Get orders that have valid status for notifications
    const eligibleOrders = userOrders.filter(order => 
      ['approved', 'shipped', 'delivered', 'cancelled'].includes(order.status)
    );

    // Check for NEW orders that haven't been processed yet
    const newOrders = eligibleOrders.filter(order => !processedOrderIds.has(order.id));
    
    // Create notifications only for NEW orders
    const newNotifications = newOrders.map(order => ({
      id: `${order.id}-${order.status}-${order.updatedAt || order.createdAt}`,
      type: 'order',
      title: `Order #${order.id} ${order.status === 'approved' ? 'Approved' : order.status === 'shipped' ? 'Shipped' : order.status === 'delivered' ? 'Delivered' : 'Cancelled'}`,
      message: order.status === 'approved' 
        ? 'Your order has been approved by the seller and will be shipped soon.'
        : order.status === 'shipped' 
          ? 'Your order has been shipped! Track your package for delivery updates.'
          : order.status === 'delivered'
            ? 'Your order has been delivered! We hope you enjoy your purchase.'
            : 'Your order has been cancelled by the seller.',
      status: order.status,
      orderId: order.id,
      timestamp: order.updatedAt || order.createdAt,
      read: false,
      priority: order.status === 'shipped' ? 'high' : 'medium',
      isNew: true, // Flag to indicate this is a new notification
    }));

    // Add these new order IDs to processed set
    if (newOrders.length > 0) {
      const newProcessedIds = new Set([...processedOrderIds, ...newOrders.map(order => order.id)]);
      setProcessedOrderIds(newProcessedIds);
      // Save to localStorage
      localStorage.setItem('processedOrderNotifications', JSON.stringify([...newProcessedIds]));
    }

    // Only add NEW notifications to existing ones, don't recreate all notifications on refresh
    if (newNotifications.length > 0) {
      setNotifications(prev => {
        const combined = [...newNotifications, ...prev];
        // Sort by timestamp in descending order (newest first)
        combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return combined;
      });

      // Play sound for new notifications if popover is not open
      if (!open) {
        playNotificationSound();
      }
    } else {
      // If no new notifications, just ensure existing ones are sorted
      setNotifications(prev => {
        const sorted = [...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return sorted;
      });
    }

    // Update previous count
    previousNotificationsCount.current = notifications.filter(n => !n.read).length;
  }, [orders, currentUser, open, processedOrderIds]);

  const playNotificationSound = () => {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.currentTime = 0;
      notificationSoundRef.current.play().catch(error => {
        console.log('Notification sound playback failed:', error);
      });
    }
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    onMarkAllRead();
  };

  const handleNotificationClick = (notification: any) => {
    handleMarkAsRead(notification.id);
    
    if (notification.type === 'order' && notification.orderId) {
      navigate(`/my-purchases?order=${notification.orderId}`);
    }
    onClose();
  };

  const handleClearAll = () => {
    setNotifications([]);
    // Also clear processed order IDs when clearing all notifications
    setProcessedOrderIds(new Set());
    localStorage.removeItem('processedOrderNotifications');
  };

  const getNotificationIcon = (type: string, status?: string) => {
    switch (type) {
      case 'order':
        return status === 'approved' ? 
          <CheckCircleIcon fontSize="small" sx={{ color: '#4ECDC4' }} /> : 
          status === 'shipped' ? 
            <ShippingIcon fontSize="small" sx={{ color: '#4A90E2' }} /> :
            status === 'delivered' ?
              <OrderIcon fontSize="small" sx={{ color: '#7ED321' }} /> :
              <OrderIcon fontSize="small" sx={{ color: '#F5A623' }} />;
      default:
        return <NotificationsIcon fontSize="small" sx={{ color: '#9B51E0' }} />;
    }
  };

  const getNotificationColor = (type: string, priority: string = 'medium') => {
    const colors = {
      order: { high: '#4ECDC4', medium: '#4A90E2', low: '#7ED321' },
    };

    const typeColors = colors[type as keyof typeof colors] || { medium: '#7877C6' };
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

  // Colors from CSS_VARS
  const CSS_VARS = {
    primaryDark: '#1B1833',
    primaryPurple: '#441752',
    primaryPink: '#AB4459',
    primaryOrange: '#F29F58',
  };

  const currentUnreadCount = notifications.filter(n => !n.read).length;

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
      {/* Header - Sticky */}
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
              Order Updates
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.7) }}>
              {currentUnreadCount} unread • {notifications.length} total
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          {notifications.length > 0 && (
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
              title="Mark all as read"
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          )}
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
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ 
              fontSize: 64, 
              color: alpha(CSS_VARS.primaryOrange, 0.3), 
              mb: 2,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
            }} />
            <Typography variant="h6" gutterBottom sx={{ color: '#FFFFFF', fontWeight: 600 }}>
              No Order Updates
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.5) }}>
              You'll see notifications here when sellers take new actions on your orders.
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.4), mt: 1, display: 'block' }}>
              Notifications are only shown for: Approved, Shipped, Delivered, or Cancelled orders
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItemButton
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 2,
                    px: 2.5,
                    backgroundColor: notification.read 
                      ? 'transparent' 
                      : alpha(getNotificationColor(notification.type, notification.priority), 0.08),
                    '&:hover': { 
                      backgroundColor: notification.read 
                        ? alpha('#FFFFFF', 0.05) 
                        : alpha(getNotificationColor(notification.type, notification.priority), 0.12) 
                    },
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    borderLeft: notification.read 
                      ? 'none' 
                      : `3px solid ${getNotificationColor(notification.type, notification.priority)}`,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48, mr: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${alpha(getNotificationColor(notification.type, notification.priority), 0.2)} 0%, ${alpha(getNotificationColor(notification.type, notification.priority), 0.1)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${alpha(getNotificationColor(notification.type, notification.priority), 0.3)}`,
                      }}
                    >
                      {getNotificationIcon(notification.type, notification.status)}
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
                              color: getNotificationColor(notification.type, notification.priority) 
                            }} />
                            <Typography variant="caption" sx={{ 
                              color: getNotificationColor(notification.type, notification.priority),
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
                    title="Delete notification"
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </ListItemButton>
                {index < notifications.length - 1 && (
                  <Divider sx={{ borderColor: alpha('#FFFFFF', 0.05), mx: 2 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Clear All Button - Only shown when there are notifications */}
      {notifications.length > 0 && (
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

export default NotificationsPopover;
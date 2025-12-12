import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Stack,
  alpha,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  ShoppingBag as OrderIcon,
  Close as CloseIcon,
  NotificationsActive as UnreadIcon,
  NotificationsOff as ReadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { orders, currentUser } = useUserStore();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Generate notifications from orders
    const userOrders = orders.filter(order => order.userId === currentUser?.id);
    const orderNotifications = userOrders
      .filter(order => ['approved', 'shipped'].includes(order.status))
      .map(order => ({
        id: order.id,
        type: 'order',
        title: `Order #${order.id} ${order.status === 'approved' ? 'Approved' : 'Shipped'}`,
        message: order.status === 'approved' 
          ? 'Your order has been approved by the seller and will be shipped soon.'
          : 'Your order has been shipped! Track your package for delivery updates.',
        status: order.status,
        orderId: order.id,
        timestamp: order.updatedAt || order.createdAt,
        read: false,
      }));

    // Add some sample notifications
    const sampleNotifications = [
      {
        id: 1,
        type: 'system',
        title: 'Welcome to Xelura!',
        message: 'Thank you for joining our luxury marketplace. Enjoy exclusive products and premium service.',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read: true,
      },
      {
        id: 2,
        type: 'promotion',
        title: 'Exclusive Discount',
        message: 'Get 20% off on premium watches this week only!',
        timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        read: false,
      },
    ];

    setNotifications([...orderNotifications, ...sampleNotifications]);
  }, [orders, currentUser]);

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const handleGoToOrder = (orderId: number) => {
    navigate(`/my-purchases?order=${orderId}`);
  };

  const getNotificationIcon = (type: string, status?: string) => {
    switch (type) {
      case 'order':
        return status === 'approved' ? <CheckCircleIcon color="success" /> : <ShippingIcon color="primary" />;
      case 'promotion':
        return <OrderIcon color="warning" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order': return '#4ECDC4';
      case 'promotion': return '#F29F58';
      case 'system': return '#7877C6';
      default: return '#ffffff';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, #0A081F 0%, #1A173B 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: alpha('#1A173B', 0.7),
            border: '1px solid rgba(120, 119, 198, 0.2)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={2}>
              <NotificationsIcon sx={{ fontSize: 40, color: '#4ECDC4' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Notifications
                </Typography>
                <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
                  Stay updated with your orders and promotions
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="outlined"
              startIcon={<ReadIcon />}
              onClick={handleMarkAllAsRead}
              sx={{
                borderColor: '#4ECDC4',
                color: '#4ECDC4',
                '&:hover': { borderColor: '#4ECDC4', backgroundColor: alpha('#4ECDC4', 0.1) },
              }}
            >
              Mark All as Read
            </Button>
          </Stack>
        </Paper>

        {/* Notifications List */}
        <Paper
          sx={{
            p: 3,
            background: alpha('#0A081F', 0.7),
            border: '1px solid rgba(120, 119, 198, 0.2)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <NotificationsIcon sx={{ fontSize: 60, color: alpha('#ffffff', 0.3), mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No notifications yet
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
                You'll see notifications here when sellers update your orders or when we have promotions.
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      background: notification.read ? 'transparent' : alpha(getNotificationColor(notification.type), 0.1),
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': { background: alpha(getNotificationColor(notification.type), 0.15) },
                    }}
                    secondaryAction={
                      <Stack direction="row" spacing={1} alignItems="center">
                        {!notification.read && (
                          <Chip
                            label="New"
                            size="small"
                            color="error"
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                        <IconButton
                          edge="end"
                          onClick={() => handleMarkAsRead(notification.id)}
                          sx={{ color: alpha('#ffffff', 0.5) }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      {getNotificationIcon(notification.type, notification.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={notification.read ? "normal" : "bold"}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 1 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                            {new Date(notification.timestamp).toLocaleString()}
                          </Typography>
                          {notification.type === 'order' && (
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => handleGoToOrder(notification.orderId)}
                              sx={{ 
                                mt: 1, 
                                color: '#4ECDC4',
                                '&:hover': { backgroundColor: alpha('#4ECDC4', 0.1) }
                              }}
                            >
                              View Order Details
                            </Button>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && (
                    <Divider sx={{ borderColor: alpha('#ffffff', 0.1), my: 1 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default NotificationsPage;
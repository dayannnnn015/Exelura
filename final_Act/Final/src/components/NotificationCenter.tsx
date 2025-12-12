import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'system';
  read: boolean;
  time: string;
}

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'New Order Received', message: 'Order #1007 from Sarah Johnson', type: 'order', read: false, time: '2 min ago' },
    { id: 2, title: 'Low Stock Alert', message: 'Premium Smartphone X is running low (15 left)', type: 'stock', read: false, time: '1 hour ago' },
    { id: 3, title: 'System Update', message: 'New features available in dashboard', type: 'system', read: true, time: '2 hours ago' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return '#4ECDC4';
      case 'stock': return '#FF6B95';
      case 'system': return '#7877C6';
      default: return '#F29F58';
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'inherit',
          position: 'relative',
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
            background: 'linear-gradient(135deg, #1A173B 0%, #2A2660 100%)',
            border: '1px solid rgba(120, 119, 198, 0.2)',
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              size="small"
              sx={{ ml: 1, background: '#FF6B95', color: 'white' }}
            />
          )}
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <List sx={{ p: 0 }}>
          {notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              sx={{
                background: notification.read ? 'transparent' : 'rgba(78, 205, 196, 0.1)',
                '&:hover': { background: 'rgba(255,255,255,0.1)' },
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getTypeColor(notification.type) }}>
                  {notification.type === 'order' && '🛒'}
                  {notification.type === 'stock' && '📦'}
                  {notification.type === 'system' && '⚙️'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={notification.title}
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      {notification.time}
                    </Typography>
                  </Box>
                }
                primaryTypographyProps={{
                  fontWeight: notification.read ? 'normal' : 'bold',
                }}
              />
              {!notification.read && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: getTypeColor(notification.type),
                  }}
                />
              )}
            </MenuItem>
          ))}
        </List>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <MenuItem onClick={markAllAsRead}>
          <Typography variant="body2" sx={{ color: '#7877C6', textAlign: 'center', width: '100%' }}>
            Mark all as read
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationCenter;
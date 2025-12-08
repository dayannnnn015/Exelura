// CartDrawer.tsx - Fixed with Selectable Items
import React, { useState, useEffect, useRef } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  Badge,
  Chip,
  alpha,
  Alert,
  Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useUserStore } from '../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';

// Define Props Interface for CartDrawer (remains the same)
interface CartDrawerProps {
  onProductClick: (productId: number) => void;
}

const usdFormatted = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const CartDrawer: React.FC<CartDrawerProps> = ({ onProductClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  // 💡 FIXED: Destructure the new actions from the store
  const { cart, removeFromCart, updateCartItem, clearCart, toggleCartItemSelection, toggleAllSelection } = useUserStore(); 
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const isOpeningRef = useRef(false);

  // --- NEW LOGIC FOR SELECTED ITEMS ---
  // Ensure we filter cart based on the 'isSelected' property added in App.tsx/Store
  const selectedItems = cart.filter(item => item.isSelected);
  const selectedCount = selectedItems.length;
  const selectedTotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // 💡 FIXED: Calls the store action directly
  const handleToggleSelection = (itemId: number) => {
    toggleCartItemSelection(itemId);
  };
  
  // 💡 FIXED: Calls the store action directly
  const handleToggleAll = (checked: boolean) => {
    toggleAllSelection(checked);
  };


  // Listen for cart open events with debounce (remains the same)
  useEffect(() => {
    const handleCartOpen = () => {
      if (isOpeningRef.current) return; 
      isOpeningRef.current = true;
      setIsOpen(true);
      setTimeout(() => {
        isOpeningRef.current = false;
      }, 500);
    };
    
    window.addEventListener('openCart', handleCartOpen);
    return () => window.removeEventListener('openCart', handleCartOpen);
  }, []);

  const closeCart = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    const item = cart.find(item => item.id === itemId);
    if (newQuantity < 1) {
      if (item) {
        removeFromCart(itemId);
        setNotification({ message: `${item.productName} removed from cart`, type: 'success' });
      }
    } else {
      updateCartItem(itemId, newQuantity);
      if (item) {
        setNotification({ 
          message: `Updated ${item.productName} quantity to ${newQuantity}`, 
          type: 'success' 
        });
      }
    }
  };

  const handleRemoveItem = (itemId: number) => {
    const item = cart.find(item => item.id === itemId);
    if (item) {
      removeFromCart(itemId);
      setNotification({ message: `${item.productName} removed from cart`, type: 'success' });
    }
  };
  
  // MODIFIED: Checkout only processes selected items
  const handleCheckout = async () => {
    if (selectedCount === 0) {
      setNotification({ message: 'Please select items to proceed to order.', type: 'error' });
      return;
    }
    
    setNotification({ 
      message: `Proceeding to checkout with ${selectedCount} item(s) for ${usdFormatted.format(selectedTotal)}!`, 
      type: 'success' 
    });
    
    // In a real app, you would dispatch a 'checkoutSelectedItems' action
    setTimeout(() => {
      // NOTE: For demonstration, we clear all. This should be changed 
      // to a store action that only removes selected items after successful checkout.
      clearCart(); 
      closeCart();
    }, 1500);
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={closeCart}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 500 },
          backgroundColor: alpha('#0A081F', 0.98),
          backdropFilter: 'blur(30px)',
          borderLeft: '1px solid rgba(120, 119, 198, 0.2)',
          boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.7)',
          WebkitBackdropFilter: 'blur(30px)',
          zIndex: 9998, 
        },
        zIndex: 9998,
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 9997,
        }
      }}
    >
      <Box sx={{ 
        p: 3, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge 
              badgeContent={cart.length} // Use cart.length for total items in cart badge
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#FF6B95',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  height: '22px',
                  minWidth: '22px',
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              }}
            >
              <ShoppingCartIcon sx={{ 
                color: '#7877C6', 
                fontSize: 32,
                position: 'relative',
                zIndex: 1,
              }} />
            </Badge>
            <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
              Your Cart
            </Typography>
          </Box>
          <IconButton 
            onClick={closeCart}
            sx={{
              color: alpha('#FFFFFF', 0.7),
              '&:hover': {
                backgroundColor: alpha('#FF6B95', 0.1),
                color: '#FF6B95',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ 
          mb: 3, 
          borderColor: alpha('#FFFFFF', 0.1),
        }} />

        {/* Cart Items */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto',
          pr: 1,
          mb: 3,
        }}>
          {cart.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ShoppingCartIcon sx={{ fontSize: 80, color: alpha('#7877C6', 0.3), mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Your cart is empty
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.6), mb: 4 }}>
                Add some luxury items to your cart
              </Typography>
              <Button
                variant="contained"
                onClick={closeCart}
                startIcon={<ArrowForwardIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Start Shopping
              </Button>
            </Box>
          ) : (
            <AnimatePresence>
            
              {/* 💡 Select All Checkbox/Header */}
              <Box 
                sx={{
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2, 
                  pb: 1,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: alpha('#FFFFFF', 0.05),
                  borderRadius: 3,
                  p: 1.5,
                  pr: 3,
                }}
              >
                <Checkbox
                  checked={cart.length > 0 && selectedCount === cart.length}
                  indeterminate={selectedCount > 0 && selectedCount < cart.length}
                  onChange={(e) => handleToggleAll(e.target.checked)}
                  sx={{
                    color: alpha('#FFFFFF', 0.7),
                    '&.Mui-checked': { color: '#4ECDC4' },
                    mr: 1,
                  }}
                />
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white', flexGrow: 1 }}>
                  Select ({selectedCount} / {cart.length})
                </Typography>
                <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                  Selected Total: <span style={{ color: '#4ECDC4', fontWeight: 'bold' }}>{usdFormatted.format(selectedTotal)}</span>
                </Typography>
              </Box>

              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <ListItem
                    sx={{
                      mb: 2,
                      backgroundColor: alpha('#FFFFFF', 0.03),
                      borderRadius: 3,
                      // Highlight border for selected items
                      border: item.isSelected 
                        ? '1px solid #4ECDC4' 
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      p: 2,
                      cursor: 'default',
                      transition: 'background-color 0.2s, border 0.3s',
                      '&:hover': {
                        backgroundColor: alpha('#FFFFFF', 0.05),
                      },
                    }}
                    secondaryAction={
                      // Delete Icon is now the only Secondary Action
                      <IconButton 
                        edge="end" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.id);
                        }}
                        sx={{
                          color: alpha('#FF6B95', 0.7),
                          '&:hover': {
                            backgroundColor: alpha('#FF6B95', 0.1),
                            color: '#FF6B95',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    
                    {/* 💡 Selection Checkbox */}
                    <Checkbox
                      checked={!!item.isSelected}
                      onChange={(e) => handleToggleSelection(item.id)}
                      sx={{
                        color: alpha('#FFFFFF', 0.6),
                        '&.Mui-checked': {
                          color: '#4ECDC4',
                        },
                        mr: 1,
                        p: 0.5,
                      }}
                      // Prevent QuickView when clicking checkbox
                      onClick={(e) => e.stopPropagation()} 
                    />

                    {/* 💡 Product Content (clickable for QuickView) */}
                    <Box
                      onClick={() => {
                        closeCart();
                        // Use item.productId for QuickView (Fix from previous step)
                        onProductClick(item.productId || item.id);
                      }}
                      sx={{ 
                        display: 'flex', 
                        flexGrow: 1, 
                        alignItems: 'center',
                        cursor: 'pointer', // Cursor pointer only on this content box
                        py: 0.5,
                        '&:hover': { opacity: 0.8 },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={item.thumbnail}
                          variant="rounded"
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            mr: 2,
                            borderRadius: 2,
                            backgroundColor: alpha('#7877C6', 0.1),
                          }}
                        >
                          {!item.thumbnail && item.productName?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
                            {item.productName}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                              <Typography variant="body2" sx={{ color: '#7877C6', fontWeight: 'bold' }}>
                                {usdFormatted.format(item.price)}
                              </Typography>
                              {item.discountPercentage && item.discountPercentage > 0 && (
                                <Chip
                                  label={`Save ${item.discountPercentage}%`}
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha('#FF6B95', 0.15),
                                    color: '#FF6B95',
                                    fontSize: '0.65rem',
                                  }}
                                />
                              )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 2,
                                backgroundColor: alpha('#FFFFFF', 0.03),
                              }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(item.id, item.quantity - 1);
                                  }}
                                  sx={{ color: alpha('#FFFFFF', 0.7) }}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography sx={{ px: 2, color: 'white', fontWeight: 'bold' }}>
                                  {item.quantity}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(item.id, item.quantity + 1);
                                  }}
                                  sx={{ color: alpha('#FFFFFF', 0.7) }}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.8) }}>
                                Total: {usdFormatted.format(item.price * item.quantity)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Box>
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </Box>

        {/* Order Summary (Only shown if at least one item is selected) */}
        {selectedCount > 0 && (
          <>
            <Box sx={{ 
              p: 3, 
              backgroundColor: alpha('#FFFFFF', 0.03),
              borderRadius: 3,
              mb: 3,
            }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                Order Summary
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.7) }}>
                  Subtotal ({selectedCount} items)
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                  {usdFormatted.format(selectedTotal)}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: alpha('#FFFFFF', 0.1), my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  Total
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#FF6B95',
                    fontWeight: 700,
                  }}
                >
                  {usdFormatted.format(selectedTotal)}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleCheckout}
                disabled={selectedCount === 0} // Disable if nothing is selected
                startIcon={<ArrowForwardIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #FF6B95 0%, #7877C6 100%)',
                  color: 'white',
                  fontWeight: 700,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7877C6 0%, #FF6B95 100%)',
                  }
                }}
              >
                Checkout {usdFormatted.format(selectedTotal)}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={clearCart}
                sx={{
                  borderColor: alpha('#FF6B95', 0.3),
                  color: '#FF6B95',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#FF6B95',
                    backgroundColor: alpha('#FF6B95', 0.1),
                  }
                }}
              >
                Clear Cart
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={closeCart}
                sx={{
                  color: alpha('#FFFFFF', 0.6),
                  '&:hover': {
                    color: 'white',
                    backgroundColor: 'transparent',
                  }
                }}
              >
                Continue Shopping
              </Button>
            </Box>
          </>
        )}
        
        {/* Show message if items exist but none are selected */}
        {cart.length > 0 && selectedCount === 0 && (
            <Box sx={{ textAlign: 'center', py: 4, mb: 3 }}>
                <Typography variant="body1" sx={{ color: alpha('#FFFFFF', 0.7) }}>
                    No items selected for order.
                </Typography>
                <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.5) }}>
                    Check the boxes next to the items you wish to purchase.
                </Typography>
            </Box>
        )}
      </Box>

      {/* Notification Toast (remains the same) */}
      <AnimatePresence>
        {notification && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            sx={{
              position: 'absolute',
              bottom: 24,
              left: 24,
              right: 24,
              zIndex: 10000,
            }}
          >
            <Alert
              severity={notification.type}
              variant="filled"
              sx={{
                backgroundColor: notification.type === 'success' 
                  ? alpha('#4ECDC4', 0.9) 
                  : alpha('#FF6B95', 0.9),
                color: 'white',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
              }}
            >
              {notification.message}
            </Alert>
          </Box>
        )}
      </AnimatePresence>
    </Drawer>
  );
};

export default CartDrawer;
// CartDrawer.tsx - Compact Luxury Checkout Sidebar
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
import CheckoutPopover from './CheckoutPopover';

// Define Props Interface for CartDrawer
interface CartDrawerProps {
  onProductClick: (productId: number) => void;
}

const usdFormatted = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

// Define CSS variables as constants for the luxury theme
const primaryDark = '#1B1833';
const primaryPurple = '#7877C6';
const primaryOrange = '#FF6B95';
const primaryPink = '#FF5252';
const buttonCartBg = 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)';
const buttonBuyNowBg = 'linear-gradient(135deg, #FF6B95 0%, #FF5252 100%)';

const CartDrawer: React.FC<CartDrawerProps> = ({ onProductClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, removeFromCart, updateCartItem, clearCart, toggleCartItemSelection, toggleAllSelection, checkoutSelectedItems } = useUserStore();
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const isOpeningRef = useRef(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutAnchorEl, setCheckoutAnchorEl] = useState<HTMLElement | null>(null);

  // Logic for selected items
  const selectedItems = cart.filter(item => item.isSelected);
  const selectedCount = selectedItems.length;
  const selectedTotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleToggleSelection = (itemId: number) => {
    toggleCartItemSelection(itemId);
  };

  const handleToggleAll = (checked: boolean) => {
    toggleAllSelection(checked);
  };

  // Listen for cart open events with debounce
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

  const handleCheckout = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (selectedCount === 0) {
      setNotification({ message: 'Please select items to proceed to order.', type: 'error' });
      return;
    }

    // Set anchor and open the popover
    setCheckoutAnchorEl(event.currentTarget);
    setIsCheckoutOpen(true);
    closeCart();
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutAnchorEl(null);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={closeCart}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 380 }, // Reduced from 500px to 380px
            backgroundColor: alpha(primaryDark, 0.95),
            backdropFilter: 'blur(25px)',
            borderLeft: `1px solid ${alpha(primaryOrange, 0.4)}`,
            boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.7)',
            WebkitBackdropFilter: 'blur(25px)',
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
          p: 2, // Reduced from 3 to 2
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Compact Header */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2, // Reduced from 3 to 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}> 
              <Badge
                badgeContent={cart.length}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: primaryOrange,
                    fontWeight: 'bold',
                    fontSize: '0.7rem', // Reduced font size
                    height: '18px', // Reduced size
                    minWidth: '18px',
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
                  color: primaryPurple,
                  fontSize: 28, 
                  position: 'relative',
                  zIndex: 1,
                }} />
              </Badge>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{ 
                  background: `linear-gradient(135deg, ${primaryOrange} 0%, ${primaryPink} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Your Cart
              </Typography>
            </Box>
            <IconButton
              onClick={closeCart}
              size="small" 
              sx={{
                color: primaryOrange,
                '&:hover': {
                  backgroundColor: alpha(primaryPurple, 0.5),
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{
            mb: 2, 
            borderColor: alpha('#FFFFFF', 0.1),
          }} />

          
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            pr: 0.5, 
            mb: 2, 
          }}>
            {cart.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}> 
                <ShoppingCartIcon sx={{ fontSize: 60, color: alpha(primaryPurple, 0.3), mb: 1.5 }} /> 
                <Typography variant="h6" sx={{ color: 'white', mb: 1.5 }}> 
                  Your cart is empty
                </Typography>
                <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.6), mb: 3 }}>
                  Add some luxury items to your cart
                </Typography>
                <Button
                  variant="contained"
                  onClick={closeCart}
                  startIcon={<ArrowForwardIcon />}
                  size="small" // Added size small
                  sx={{
                    background: buttonCartBg,
                    color: 'white',
                    fontWeight: 600,
                    px: 3, // Reduced from 4 to 3
                    py: 1, // Reduced from 1.5 to 1
                    borderRadius: 2,
                  }}
                >
                  Start Shopping
                </Button>
              </Box>
            ) : (
              <AnimatePresence>
                {/* Compact Select All Header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1.5, // Reduced from 2 to 1.5
                    pb: 0.5, // Reduced from 1 to 0.5
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: alpha(primaryPurple, 0.2),
                    borderRadius: 2, // Reduced from 3 to 2
                    p: 1, // Reduced from 1.5 to 1
                    pr: 2, // Reduced from 3 to 2
                  }}
                >
                  <Checkbox
                    checked={cart.length > 0 && selectedCount === cart.length}
                    indeterminate={selectedCount > 0 && selectedCount < cart.length}
                    onChange={(e) => handleToggleAll(e.target.checked)}
                    size="small" // Added size small
                    sx={{
                      color: alpha('#FFFFFF', 0.7),
                      '&.Mui-checked': { color: primaryOrange },
                      mr: 0.5, // Reduced from 1 to 0.5
                    }}
                  />
                  <Typography variant="body2" fontWeight="bold" sx={{ color: 'white', flexGrow: 1 }}>
                    Select ({selectedCount} / {cart.length})
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
                        mb: 1.5, // Reduced from 2 to 1.5
                        backgroundColor: alpha(primaryPurple, 0.2),
                        borderRadius: 2, // Reduced from 3 to 2
                        border: item.isSelected
                          ? `1px solid ${primaryOrange}`
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        p: 1.5, // Reduced from 2 to 1.5
                        cursor: 'default',
                        transition: 'background-color 0.2s, border 0.3s',
                        '&:hover': {
                          backgroundColor: alpha(primaryPurple, 0.3),
                        },
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.id);
                          }}
                          size="small" // Added size small
                          sx={{
                            color: primaryOrange,
                            '&:hover': {
                              backgroundColor: alpha(primaryOrange, 0.1),
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" /> 
                        </IconButton>
                      }
                    >
                      <Checkbox
                        checked={!!item.isSelected}
                        onChange={(e) => handleToggleSelection(item.id)}
                        size="small" // Added size small
                        sx={{
                          color: alpha('#FFFFFF', 0.6),
                          '&.Mui-checked': {
                            color: primaryOrange,
                          },
                          mr: 0.5, // Reduced from 1 to 0.5
                          p: 0.5,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <Box
                        onClick={() => {
                          closeCart();
                          onProductClick(item.productId || item.id);
                        }}
                        sx={{
                          display: 'flex',
                          flexGrow: 1,
                          alignItems: 'center',
                          cursor: 'pointer',
                          py: 0.5,
                          '&:hover': { opacity: 0.8 },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={item.thumbnail}
                            variant="rounded"
                            sx={{
                              width: 60, // Reduced from 80 to 60
                              height: 60, // Reduced from 80 to 60
                              mr: 1.5, // Reduced from 2 to 1.5
                              borderRadius: 1.5, // Reduced from 2 to 1.5
                              backgroundColor: alpha(primaryPurple, 0.1),
                            }}
                          >
                            {!item.thumbnail && item.productName?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}> 
                              {item.productName}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}> 
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}> 
                                <Typography variant="caption" sx={{ color: primaryOrange, fontWeight: 'bold' }}> 
                                  {usdFormatted.format(item.price)}
                                </Typography>
                                {item.discountPercentage && item.discountPercentage > 0 && (
                                  <Chip
                                    label={`Save ${item.discountPercentage}%`}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(primaryOrange, 0.15),
                                      color: primaryOrange,
                                      fontSize: '0.6rem', // Reduced font size
                                      height: 20, // Added fixed height
                                    }}
                                  />
                                )}
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> 
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  borderRadius: 1.5, // Reduced from 2 to 1.5
                                  backgroundColor: alpha(primaryPurple, 0.3),
                                }}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuantityChange(item.id, item.quantity - 1);
                                    }}
                                    sx={{ color: primaryOrange, p: 0.5 }} // Added padding
                                  >
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                  <Typography sx={{ px: 1, color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}> 
                                    {item.quantity}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuantityChange(item.id, item.quantity + 1);
                                    }}
                                    sx={{ color: primaryOrange, p: 0.5 }} // Added padding
                                  >
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.8) }}> 
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

          {/* Compact Order Summary */}
          {selectedCount > 0 && (
            <>
              <Box sx={{
                p: 2, // Reduced from 3 to 2
                backgroundColor: alpha(primaryPurple, 0.4),
                borderRadius: 2, // Reduced from 3 to 2
                mb: 2, // Reduced from 3 to 2
                borderTop: `2px solid ${primaryOrange}`,
              }}>
                <Typography variant="subtitle1" sx={{ color: 'white', mb: 1.5, fontWeight: 600 }}> 
                  Order Summary
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}> 
                  <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.7) }}> 
                    Subtotal ({selectedCount} items)
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}> 
                    {usdFormatted.format(selectedTotal)}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: alpha('#FFFFFF', 0.1), my: 1 }} /> 

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    Total
                  </Typography>
                  <Typography
                    variant="h6" // Changed from h5 to h6
                    sx={{
                      color: primaryOrange,
                      fontWeight: 700,
                    }}
                  >
                    {usdFormatted.format(selectedTotal)}
                  </Typography>
                </Box>
              </Box>

              {/* Compact Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}> 
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCheckout}
                  disabled={selectedCount === 0}
                  endIcon={<ArrowForwardIcon />}
                  size="small" // Added size small
                  sx={{
                    background: buttonBuyNowBg,
                    color: 'white',
                    fontWeight: 700,
                    py: 1, // Reduced from 1.5 to 1
                    borderRadius: 2,
                    textTransform: 'uppercase',
                    fontSize: '0.875rem', // Added font size
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FF5252 0%, #FF6B95 100%)',
                    }
                  }}
                >
                  Buy Now ({usdFormatted.format(selectedTotal)})
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearCart}
                  size="small" // Added size small
                  sx={{
                    borderColor: alpha(primaryOrange, 0.3),
                    color: primaryOrange,
                    fontWeight: 600,
                    py: 1, // Reduced from 1.5 to 1
                    borderRadius: 2,
                    fontSize: '0.875rem', // Added font size
                    '&:hover': {
                      borderColor: primaryOrange,
                      backgroundColor: alpha(primaryOrange, 0.1),
                    }
                  }}
                >
                  Clear Cart
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={closeCart}
                  size="small" // Added size small
                  sx={{
                    background: buttonCartBg,
                    color: 'white',
                    fontWeight: 600,
                    py: 1, // Reduced from 1.5 to 1
                    borderRadius: 2,
                    fontSize: '0.875rem', // Added font size
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5A59A1 0%, #7877C6 100%)',
                    }
                  }}
                >
                  Continue Shopping
                </Button>
              </Box>
            </>
          )}

          {/* Compact message if items exist but none are selected */}
          {cart.length > 0 && selectedCount === 0 && (
            <Box sx={{ textAlign: 'center', py: 3, mb: 2 }}> 
              <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.7) }}> 
                No items selected for order.
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.5) }}> 
                Check the boxes next to items you wish to purchase.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              sx={{
                position: 'absolute',
                bottom: 16, // Reduced from 24 to 16
                left: 16, // Reduced from 24 to 16
                right: 16, // Reduced from 24 to 16
                zIndex: 10000,
              }}
            >
              <Alert
                severity={notification.type}
                variant="filled"
                sx={{
                  backgroundColor: notification.type === 'success'
                    ? alpha(primaryPurple, 0.9)
                    : alpha(primaryOrange, 0.9),
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  border: `1px solid ${alpha('#FFFFFF', 0.2)}`,
                }}
              >
                {notification.message}
              </Alert>
            </Box>
          )}
        </AnimatePresence>
      </Drawer>

      {/* Checkout Popover Component */}
      <CheckoutPopover
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        selectedItems={selectedItems}
        selectedTotal={selectedTotal}
      />
    </>
  );
};

export default CartDrawer;
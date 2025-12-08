import React, { useState, useEffect } from 'react';
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
  Tooltip,
  alpha,
  TextField,
  InputAdornment,
  Slide,
  Fade,
  Stack,
  Paper,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DiscountIcon from '@mui/icons-material/Discount';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

const usdFormatted = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const CartDrawer = () => {
  const { isCartOpen, closeCart } = useCartStore();
  const { cart, cartTotal, cartCount, removeFromCart, updateCartItem, clearCart } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const shippingCost = cartTotal > 100 ? 0 : 9.99;
  const tax = cartTotal * 0.08;
  const grandTotal = cartTotal + shippingCost + tax - discount;

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      setNotification({ message: 'Item removed from cart', type: 'success' });
    } else {
      updateCartItem(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: number, productName: string) => {
    removeFromCart(itemId);
    setNotification({ message: `${productName} removed from cart`, type: 'success' });
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'LUXURY10') {
      setDiscount(cartTotal * 0.1);
      setNotification({ message: '10% discount applied!', type: 'success' });
      setCouponCode('');
      setShowCouponInput(false);
    } else if (couponCode.toUpperCase() === 'FREESHIP') {
      setDiscount(0);
      setNotification({ message: 'Free shipping applied!', type: 'success' });
      setCouponCode('');
      setShowCouponInput(false);
    } else {
      setNotification({ message: 'Invalid coupon code', type: 'error' });
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    // Simulate checkout process
    setTimeout(() => {
      setIsProcessing(false);
      setNotification({ message: 'Order placed successfully!', type: 'success' });
      setTimeout(() => {
        clearCart();
        closeCart();
      }, 1500);
    }, 2000);
  };

  const getCartItemAnimation = (index: number) => ({
    initial: { opacity: 0, y: 20, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.3, delay: index * 0.05 },
  });

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={closeCart}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 500 },
          backgroundColor: alpha('#0A081F', 0.95),
          backdropFilter: 'blur(30px)',
          borderLeft: '1px solid rgba(120, 119, 198, 0.2)',
          boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.5)',
          WebkitBackdropFilter: 'blur(30px)',
        },
      }}
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: alpha('#0A081F', 0.9),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <CircularProgress
              size={60}
              thickness={4}
              sx={{
                color: '#7877C6',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                }
              }}
            />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                Processing Order
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                Securing your luxury items...
              </Typography>
            </Box>
            <LinearProgress 
              sx={{ 
                width: 200, 
                height: 4,
                borderRadius: 2,
                backgroundColor: alpha('#7877C6', 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#7877C6',
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        )}
      </AnimatePresence>

      <Box sx={{ 
        p: 3, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          position: 'relative',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7877C6 0%, #FF6B95 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(120, 119, 198, 0.3)',
              }}
            >
              <ShoppingCartIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                Your Cart
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                {cartCount} premium items
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge 
              badgeContent={cartCount} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#FF6B95',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  minWidth: 24,
                  height: 24,
                }
              }}
            />
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
        </Box>

        <Divider sx={{ 
          mb: 3, 
          borderColor: alpha('#FFFFFF', 0.1),
          background: 'linear-gradient(90deg, transparent, rgba(120, 119, 198, 0.5), transparent)',
          height: 1,
        }} />

        {/* Cart Items */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha('#7877C6', 0.1)} 0%, ${alpha('#FF6B95', 0.1)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 4,
                  }}
                >
                  <ShoppingBagIcon sx={{ fontSize: 48, color: alpha('#7877C6', 0.5) }} />
                </Box>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  Your cart feels lonely
                </Typography>
                <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.6), mb: 4 }}>
                  Add some luxury items to your cart and make it shine
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
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FF6B95 0%, #7877C6 100%)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  Start Shopping
                </Button>
              </Box>
            </motion.div>
          ) : (
            <>
              {/* Items List */}
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto',
                pr: 1,
                mb: 3,
                '&::-webkit-scrollbar': {
                  width: 6,
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha('#FFFFFF', 0.05),
                  borderRadius: 3,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(180deg, #FF6B95 0%, #7877C6 100%)',
                  borderRadius: 3,
                }
              }}>
                <AnimatePresence mode="popLayout">
                  {cart.map((item, index) => (
                    <motion.div
                      key={item.id}
                      {...getCartItemAnimation(index)}
                      layout
                    >
                      <ListItem
                        sx={{
                          mb: 2,
                          backgroundColor: alpha('#FFFFFF', 0.03),
                          borderRadius: 3,
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          p: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: alpha('#7877C6', 0.05),
                            borderColor: alpha('#7877C6', 0.3),
                            transform: 'translateX(4px)',
                          }
                        }}
                        secondaryAction={
                          <Tooltip title="Remove item" arrow>
                            <IconButton 
                              edge="end" 
                              onClick={() => handleRemoveItem(item.id, item.productName)}
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
                          </Tooltip>
                        }
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
                              border: '2px solid rgba(120, 119, 198, 0.3)',
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography 
                              variant="subtitle1" 
                              fontWeight="bold" 
                              sx={{ 
                                color: 'white',
                                mb: 0.5,
                                lineHeight: 1.2,
                              }}
                            >
                              {item.productName}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {/* Price */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: '#7877C6', 
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                  }}
                                >
                                  {usdFormatted.format(item.price)}
                                </Typography>
                                
                                {item.discountPercentage && item.originalPrice && (
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      textDecoration: 'line-through',
                                      color: alpha('#FFFFFF', 0.4),
                                    }}
                                  >
                                    {usdFormatted.format(item.originalPrice)}
                                  </Typography>
                                )}
                              </Box>

                              {/* Quantity Controls */}
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2,
                                mt: 1.5,
                              }}>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  backgroundColor: alpha('#FFFFFF', 0.03),
                                }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    sx={{ 
                                      color: alpha('#FFFFFF', 0.7),
                                      borderRadius: 0,
                                      '&:hover': {
                                        backgroundColor: alpha('#FF6B95', 0.1),
                                        color: '#FF6B95',
                                      }
                                    }}
                                  >
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                  
                                  <Typography 
                                    sx={{ 
                                      px: 2, 
                                      color: 'white',
                                      fontWeight: 'bold',
                                      minWidth: 40,
                                      textAlign: 'center',
                                    }}
                                  >
                                    {item.quantity}
                                  </Typography>
                                  
                                  <IconButton
                                    size="small"
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    sx={{ 
                                      color: alpha('#FFFFFF', 0.7),
                                      borderRadius: 0,
                                      '&:hover': {
                                        backgroundColor: alpha('#4ECDC4', 0.1),
                                        color: '#4ECDC4',
                                      }
                                    }}
                                  >
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Box>

                                {/* Item Total */}
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: alpha('#FFFFFF', 0.8),
                                    fontWeight: 'medium',
                                    ml: 'auto',
                                  }}
                                >
                                  Total: {usdFormatted.format(item.price * item.quantity)}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>

              {/* Coupon Section */}
              <Fade in={!showCouponInput}>
                <Box sx={{ mb: 3 }}>
                  {!showCouponInput && discount === 0 && (
                    <Button
                      fullWidth
                      startIcon={<DiscountIcon />}
                      onClick={() => setShowCouponInput(true)}
                      sx={{
                        backgroundColor: alpha('#4ECDC4', 0.1),
                        color: '#4ECDC4',
                        border: `1px solid ${alpha('#4ECDC4', 0.3)}`,
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.5,
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: alpha('#4ECDC4', 0.2),
                        }
                      }}
                    >
                      Have a coupon code?
                    </Button>
                  )}
                </Box>
              </Fade>

              <Slide direction="up" in={showCouponInput} mountOnEnter unmountOnExit>
                <Box sx={{ mb: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: alpha('#4ECDC4', 0.05),
                      border: `1px solid ${alpha('#4ECDC4', 0.2)}`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ color: '#4ECDC4', mb: 1.5 }}>
                      Apply Coupon Code
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        InputProps={{
                          sx: {
                            backgroundColor: alpha('#FFFFFF', 0.05),
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha('#4ECDC4', 0.3),
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4ECDC4',
                            }
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleApplyCoupon}
                        sx={{
                          backgroundColor: '#4ECDC4',
                          color: '#0A081F',
                          fontWeight: 600,
                          minWidth: 100,
                          '&:hover': {
                            backgroundColor: alpha('#4ECDC4', 0.8),
                          }
                        }}
                      >
                        Apply
                      </Button>
                    </Box>
                    <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                      <Chip
                        label="LUXURY10 - 10% OFF"
                        size="small"
                        onClick={() => setCouponCode('LUXURY10')}
                        sx={{
                          backgroundColor: alpha('#4ECDC4', 0.1),
                          color: '#4ECDC4',
                          cursor: 'pointer',
                        }}
                      />
                      <Chip
                        label="FREESHIP - Free Shipping"
                        size="small"
                        onClick={() => setCouponCode('FREESHIP')}
                        sx={{
                          backgroundColor: alpha('#4ECDC4', 0.1),
                          color: '#4ECDC4',
                          cursor: 'pointer',
                        }}
                      />
                    </Box>
                  </Paper>
                </Box>
              </Slide>

              {/* Order Summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: alpha('#FFFFFF', 0.03),
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 3,
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                  Order Summary
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.7) }}>
                      Subtotal
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                      {usdFormatted.format(cartTotal)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.7) }}>
                      Shipping
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: shippingCost === 0 ? '#4ECDC4' : 'white',
                        fontWeight: shippingCost === 0 ? 600 : 500,
                      }}
                    >
                      {shippingCost === 0 ? 'FREE' : usdFormatted.format(shippingCost)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.7) }}>
                      Tax (8%)
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                      {usdFormatted.format(tax)}
                    </Typography>
                  </Box>

                  {discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: alpha('#4ECDC4', 0.9) }}>
                        Discount
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4ECDC4', fontWeight: 600 }}>
                        -{usdFormatted.format(discount)}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ borderColor: alpha('#FFFFFF', 0.1), my: 1 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Total
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#FF6B95',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #FF6B95 0%, #7877C6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {usdFormatted.format(grandTotal)}
                    </Typography>
                  </Box>
                </Stack>

                {/* Free Shipping Progress */}
                {cartTotal < 100 && (
                  <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${alpha('#FFFFFF', 0.1)}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#4ECDC4' }}>
                        Free shipping on orders over $100
                      </Typography>
                      <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                        ${(100 - cartTotal).toFixed(2)} to go
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(cartTotal / 100) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha('#4ECDC4', 0.1),
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #4ECDC4 0%, #7877C6 100%)',
                          borderRadius: 3,
                        }
                      }}
                    />
                  </Box>
                )}
              </Paper>

              {/* Trust Badges */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-around',
                mb: 3,
                py: 2,
                backgroundColor: alpha('#FFFFFF', 0.02),
                borderRadius: 2,
              }}>
                <Tooltip title="Secure Payment" arrow>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <SecurityIcon sx={{ color: '#4ECDC4', fontSize: 20, mb: 0.5 }} />
                    <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                      Secure
                    </Typography>
                  </Box>
                </Tooltip>
                <Tooltip title="Free Shipping" arrow>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <LocalShippingIcon sx={{ color: '#4ECDC4', fontSize: 20, mb: 0.5 }} />
                    <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                      Shipping
                    </Typography>
                  </Box>
                </Tooltip>
                <Tooltip title="Easy Returns" arrow>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ShoppingBagIcon sx={{ color: '#4ECDC4', fontSize: 20, mb: 0.5 }} />
                    <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                      Returns
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>

              {/* Action Buttons */}
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  startIcon={isProcessing ? <CircularProgress size={20} /> : <ArrowForwardIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #FF6B95 0%, #7877C6 100%)',
                    color: 'white',
                    fontWeight: 700,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7877C6 0%, #FF6B95 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 24px rgba(120, 119, 198, 0.4)',
                    },
                    '&:disabled': {
                      background: alpha('#FFFFFF', 0.1),
                      color: alpha('#FFFFFF', 0.3),
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isProcessing ? 'Processing...' : `Checkout ${usdFormatted.format(grandTotal)}`}
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
                      transform: 'translateY(-2px)',
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
                    fontWeight: 500,
                    '&:hover': {
                      color: 'white',
                      backgroundColor: 'transparent',
                    }
                  }}
                >
                  Continue Shopping
                </Button>
              </Stack>
            </>
          )}
        </Box>
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
              bottom: 24,
              left: 24,
              right: 24,
              zIndex: 9999,
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
                border: `1px solid ${notification.type === 'success' 
                  ? alpha('#4ECDC4', 0.3) 
                  : alpha('#FF6B95', 0.3)
                }`,
                '& .MuiAlert-icon': {
                  color: 'white',
                }
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
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Chip,
  alpha,
  Snackbar,
  Alert,
  Paper,
  Fade,
  Tooltip,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { useUserStore } from '../store/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentModal from './PaymentModal';
import MyPurchaseDialog from './MyPurchaseDialog';

const usdFormatted = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

interface CheckoutPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: any[];
  selectedTotal: number;
  onCheckoutComplete?: () => void; // Add this callback
}

const CheckoutPopover: React.FC<CheckoutPopoverProps> = ({
  isOpen,
  onClose,
  selectedItems,
  selectedTotal,
  onCheckoutComplete, // Use this callback
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const { 
    currentUser, 
    removeFromCart, 
    checkoutSelectedItems, 
    createOrder,
    syncProductsWithAPI
  } = useUserStore();
  
  const [address, setAddress] = useState('123 Main St, Baguio City, Philippines');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'GCASH' | 'PAYMAYA'>('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<string | null>(null);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState<'GCASH' | 'PAYMAYA' | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Sync products from API before checkout
      syncProductsWithAPI();
      
      setIsProcessing(false);
      setReceiptImage(null);
      setGeneratedReceipt(null);
      setIsPaymentConfirmed(false);
      setConfirmedPaymentMethod(null);
    }
  }, [isOpen, syncProductsWithAPI]);

  const handleRemoveItem = (itemId: number) => {
    removeFromCart(itemId);
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  };

  const handlePaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMethod = event.target.value as 'COD' | 'GCASH' | 'PAYMAYA';
    setPaymentMethod(newMethod);
    setReceiptImage(null);
    setGeneratedReceipt(null);
    setIsPaymentConfirmed(false);
    setConfirmedPaymentMethod(null);
  };
  
  const handleGenerateReceipt = () => {
    setPaymentModalOpen(true);
  };
  
  const handlePaymentSuccess = (receiptUrl: string) => {
    setGeneratedReceipt(receiptUrl);
    setReceiptImage(receiptUrl);
    setIsPaymentConfirmed(true);
    setConfirmedPaymentMethod(paymentMethod);
  };

  // Helper function to group items by seller (always seller 2)
  const groupItemsBySeller = () => {
    // All items go to seller 2
    return { 2: selectedItems };
  };

  const handleCreateOrders = () => {
    const itemsBySeller = groupItemsBySeller();
    const taxRate = 0.09;
    
    Object.entries(itemsBySeller).forEach(([sellerIdStr, sellerItems]) => {
      const sellerId = 2; // Always seller 2
      const subtotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * taxRate;
      const shippingFee = 0;
      const total = subtotal + tax + shippingFee;
      
      const orderData = {
        userId: currentUser?.id || 1,
        customerName: currentUser?.name || 'Customer',
        customerEmail: currentUser?.email || 'customer@example.com',
        customerPhone: currentUser?.phone,
        items: sellerItems.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          thumbnail: item.thumbnail,
          sellerId: 2 // Always seller 2
        })),
        subtotal,
        shippingFee,
        tax,
        total,
        status: 'pending' as const,
        shippingAddress: address,
        paymentMethod: paymentMethod === 'COD' ? 'cash_on_delivery' : 
                      paymentMethod === 'GCASH' ? 'gcash' : 'paymaya',
        paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
        sellerId: 2, // Always seller 2
        notes: `Payment via ${paymentMethod}`
      };
      
      createOrder(orderData);
    });
  };

  const handleAutoCheckout = async () => {
    if (selectedItems.length === 0) return;

    setIsProcessing(true);

    try {
      // Create orders
      handleCreateOrders();
      
      // Clear cart
      checkoutSelectedItems();
      
      setNotification({
        open: true,
        message: `🎉 ${paymentMethod} payment confirmed! Order placed for ${usdFormatted.format(selectedTotal)}.`,
        severity: 'success'
      });
      
      setTimeout(() => {
        onClose();
        setIsProcessing(false);
        setIsPaymentConfirmed(false);
        setConfirmedPaymentMethod(null);
        setPurchaseDialogOpen(true); // Open MyPurchaseDialog after checkout
        
        // Call the callback if provided
        if (onCheckoutComplete) {
          onCheckoutComplete();
        }
      }, 2000);
    } catch (error) {
      setNotification({
        open: true,
        message: '❌ Auto checkout failed. Please try again.',
        severity: 'error'
      });
      setIsProcessing(false);
      setIsPaymentConfirmed(false);
      setConfirmedPaymentMethod(null);
    }
  };

  const handleFinalOrder = async () => {
    if (selectedItems.length === 0) return;

    // FIXED: For digital payments, require payment confirmation
    if (paymentMethod !== 'COD' && !isPaymentConfirmed) {
      setNotification({
        open: true,
        message: `Please complete ${paymentMethod} payment first.`,
        severity: 'error'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create orders
      handleCreateOrders();
      
      if (paymentMethod === 'COD') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        checkoutSelectedItems();
        
        setNotification({
          open: true,
          message: `🎉 Order placed successfully! Total: ${usdFormatted.format(selectedTotal)} via Cash On Delivery.`,
          severity: 'success'
        });
        
        setTimeout(() => {
          onClose();
          setIsProcessing(false);
          setPurchaseDialogOpen(true); // Open MyPurchaseDialog after checkout
          
          // Call the callback if provided
          if (onCheckoutComplete) {
            onCheckoutComplete();
          }
        }, 2000);

      } else {
        // For GCASH/PAYMAYA, the order was already created in handleAutoCheckout
        // Just show success and close
        setNotification({
          open: true,
          message: `🎉 ${paymentMethod} payment confirmed! Order placed for ${usdFormatted.format(selectedTotal)}.`,
          severity: 'success'
        });
        
        setTimeout(() => {
          onClose();
          setIsProcessing(false);
          setIsPaymentConfirmed(false);
          setConfirmedPaymentMethod(null);
          setPurchaseDialogOpen(true); // Open MyPurchaseDialog after checkout
          
          // Call the callback if provided
          if (onCheckoutComplete) {
            onCheckoutComplete();
          }
        }, 2000);
      }
    } catch (error) {
      setNotification({
        open: true,
        message: '❌ Order failed. Please try again.',
        severity: 'error'
      });
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <Modal
        open={isOpen}
        onClose={handleClose}
        closeAfterTransition
        className="checkout-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 1, sm: 2, md: 3, lg: 4 },
          zIndex: 9999,
        }}
      >
        <Fade in={isOpen} timeout={300}>
          <Paper
            sx={{
              width: '100%',
              maxWidth: isMobile ? '95vw' : isTablet ? '90vw' : 900,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: alpha('#0A081F', 0.98),
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(120, 119, 198, 0.3)',
              borderRadius: isMobile ? 2 : 4,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
              WebkitBackdropFilter: 'blur(30px)',
              position: 'relative',
              overflow: 'hidden',
              mx: isMobile ? 1 : 2,
            }}
          >
            {/* Header */}
            <Box sx={{ 
              p: isMobile ? 1.5 : 3, 
              borderBottom: '1px solid rgba(120, 119, 198, 0.2)',
              backgroundColor: alpha('#0A081F', 0.9),
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Box>
                <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{ 
                  color: 'white',
                  fontSize: isMobile ? '1.2rem' : isTablet ? '1.5rem' : '1.75rem'
                }}>
                  🛒 Finalize Order
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: alpha('#FFFFFF', 0.7), 
                  mt: 0.5,
                  fontSize: isMobile ? '0.75rem' : '0.9rem'
                }}>
                  Complete your purchase in just a few steps
                </Typography>
              </Box>
              <IconButton
                onClick={handleClose}
                disabled={isProcessing}
                size={isMobile ? "small" : "medium"}
                sx={{
                  backgroundColor: alpha('#FFFFFF', 0.1),
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: alpha('#FF6B95', 0.3),
                  },
                }}
              >
                <CloseIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto',
              p: isMobile ? 1.5 : 3,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: alpha('#FFFFFF', 0.05),
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha('#7877C6', 0.5),
                borderRadius: '3px',
                '&:hover': {
                  background: alpha('#7877C6', 0.7),
                }
              }
            }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', lg: 'row' }, 
                gap: isMobile ? 2 : 4 
              }}>
                
                {/* Left Column - Shipping & Payment */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  
                  {/* Shipping Address */}
                  <Box sx={{ 
                    mb: isMobile ? 2 : 4, 
                    p: isMobile ? 1.5 : 3, 
                    border: '1px solid rgba(120, 119, 198, 0.2)', 
                    borderRadius: isMobile ? 2 : 3, 
                    backgroundColor: alpha('#FFFFFF', 0.05) 
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: isMobile ? 1 : 2, 
                      color: '#7877C6' 
                    }}>
                        <LocationOnIcon sx={{ 
                          mr: 1,
                          fontSize: isMobile ? '1rem' : '1.25rem'
                        }} />
                        <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                            Shipping Address
                        </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={isMobile ? 2 : 3}
                      label="Delivery Address"
                      value={address}
                      onChange={handleAddressChange}
                      variant="outlined"
                      disabled={isProcessing}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiOutlinedInput-root': { 
                          color: 'white',
                          fontSize: isMobile ? '0.85rem' : '1rem'
                        },
                        '& .MuiInputLabel-root': { 
                          color: alpha('#FFFFFF', 0.7),
                          fontSize: isMobile ? '0.85rem' : '1rem'
                        },
                        '& .MuiOutlinedInput-notchedOutline': { 
                          borderColor: alpha('#7877C6', 0.5) 
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': { 
                          borderColor: '#7877C6' 
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                          borderColor: '#7877C6' 
                        },
                      }}
                    />
                  </Box>
                  
                  {/* Payment Method */}
                  <Box sx={{ 
                    p: isMobile ? 1.5 : 3, 
                    border: '1px solid rgba(120, 119, 198, 0.2)', 
                    borderRadius: isMobile ? 2 : 3, 
                    backgroundColor: alpha('#FFFFFF', 0.05) 
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: isMobile ? 1 : 2, 
                      color: '#FF6B95' 
                    }}>
                        <PaymentIcon sx={{ 
                          mr: 1,
                          fontSize: isMobile ? '1rem' : '1.25rem'
                        }} />
                        <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                            Payment Method
                        </Typography>
                    </Box>
                    <RadioGroup
                      aria-label="payment-method"
                      name="payment-method-group"
                      value={paymentMethod}
                      onChange={handlePaymentChange}
                      sx={{ color: alpha('#FFFFFF', 0.8) }}
                    >
                      <FormControlLabel 
                        value="COD" 
                        control={<Radio 
                          size={isMobile ? "small" : "medium"}
                          sx={{ color: '#4ECDC4' }} 
                          disabled={isProcessing} 
                        />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>Cash On Delivery</Typography>
                            <Chip 
                              label="Recommended" 
                              size="small" 
                              sx={{ 
                                backgroundColor: alpha('#4ECDC4', 0.2), 
                                color: '#4ECDC4',
                                fontSize: isMobile ? '0.6rem' : '0.7rem',
                                height: isMobile ? 18 : 24
                              }} 
                            />
                          </Box>
                        } 
                      />
                      <FormControlLabel 
                        value="GCASH" 
                        control={<Radio 
                          size={isMobile ? "small" : "medium"}
                          sx={{ color: '#4ECDC4' }} 
                          disabled={isProcessing} 
                        />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>GCASH</Typography>
                            <Chip 
                              label="Instant" 
                              size="small" 
                              sx={{ 
                                backgroundColor: alpha('#007BFF', 0.2), 
                                color: '#007BFF',
                                fontSize: isMobile ? '0.6rem' : '0.7rem',
                                height: isMobile ? 18 : 24
                              }} 
                            />
                          </Box>
                        } 
                      />
                      <FormControlLabel 
                        value="PAYMAYA" 
                        control={<Radio 
                          size={isMobile ? "small" : "medium"}
                          sx={{ color: '#4ECDC4' }} 
                          disabled={isProcessing} 
                        />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: isMobile ? '0.85rem' : '1rem' }}>PAYMAYA</Typography>
                            <Chip 
                              label="Instant" 
                              size="small" 
                              sx={{ 
                                backgroundColor: alpha('#F44336', 0.2), 
                                color: '#F44336',
                                fontSize: isMobile ? '0.6rem' : '0.7rem',
                                height: isMobile ? 18 : 24
                              }} 
                            />
                          </Box>
                        } 
                      />
                    </RadioGroup>
                  </Box>
                  
                  {/* Digital Payment Section */}
                  {(paymentMethod === 'GCASH' || paymentMethod === 'PAYMAYA') && (
                    <Box sx={{ 
                      mt: isMobile ? 2 : 3, 
                      textAlign: 'center',
                      position: 'relative',
                      className: isPaymentConfirmed 
                        ? `${paymentMethod.toLowerCase()}-confirmed payment-confirmed` 
                        : '' 
                    }}>
                      {isPaymentConfirmed ? (
                        <Box>
                          <Typography variant="body2" sx={{ 
                            color: '#4ECDC4', 
                            mb: isMobile ? 1 : 2, 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            fontSize: isMobile ? '0.8rem' : '0.9rem'
                          }}>
                            ✓ Payment Confirmed! Auto-checkout in progress...
                          </Typography>
                          
                          <Box className={`payment-status-badge ${paymentMethod.toLowerCase()}-badge`}>
                            <CheckCircle sx={{ fontSize: isMobile ? 14 : 16 }} />
                            <span style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                              {paymentMethod} Payment Verified
                            </span>
                          </Box>
                          
                          <Box className="confirmed-payment-summary">
                            <Typography variant="body2" sx={{ 
                              color: alpha('#FFFFFF', 0.8),
                              fontSize: isMobile ? '0.75rem' : '0.85rem'
                            }}>
                              Amount: <strong>{usdFormatted.format(selectedTotal)}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: alpha('#FFFFFF', 0.6), 
                              display: 'block', 
                              mt: 0.5,
                              fontSize: isMobile ? '0.65rem' : '0.75rem'
                            }}>
                              Transaction ID: {paymentMethod === 'GCASH' ? 'GC' : 'PM'}{Date.now().toString().slice(-8)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ 
                            mt: isMobile ? 1.5 : 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: 1 
                          }}>
                            <CircularProgress size={isMobile ? 16 : 20} sx={{ color: '#4ECDC4' }} />
                            <Typography variant="caption" sx={{ 
                              color: alpha('#FFFFFF', 0.7),
                              fontSize: isMobile ? '0.7rem' : '0.8rem'
                            }}>
                              Completing order...
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <>
                          <Typography variant="body2" sx={{ 
                            color: alpha('#FFFFFF', 0.7), 
                            mb: isMobile ? 1.5 : 2,
                            fontSize: isMobile ? '0.8rem' : '0.9rem'
                          }}>
                            {generatedReceipt 
                              ? '✅ Payment completed! Proceed to place your order.'
                              : `Click below to complete your ${paymentMethod} payment`
                            }
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={handleGenerateReceipt}
                            disabled={isProcessing}
                            className={generatedReceipt ? "generate-receipt-button" : ""}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                              background: paymentMethod === 'GCASH'
                                ? 'linear-gradient(135deg, #007BFF 0%, #0056B3 100%)'
                                : 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                              color: 'white',
                              fontWeight: 600,
                              mb: isMobile ? 1.5 : 2,
                              fontSize: isMobile ? '0.8rem' : '0.9rem',
                              py: isMobile ? 0.75 : 1,
                              px: isMobile ? 2 : 3,
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: paymentMethod === 'GCASH'
                                  ? '0 10px 20px rgba(0, 123, 255, 0.3)'
                                  : '0 10px 20px rgba(244, 67, 54, 0.3)',
                              },
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            {generatedReceipt ? '✅ Payment Complete' : `Pay with ${paymentMethod}`}
                          </Button>
                        </>
                      )}
                      
                      {generatedReceipt && !isPaymentConfirmed && (
                        <Box sx={{ mt: isMobile ? 1.5 : 2 }}>
                          <Typography variant="body2" sx={{ 
                            color: alpha('#FFFFFF', 0.7), 
                            mb: 1,
                            fontSize: isMobile ? '0.75rem' : '0.85rem'
                          }}>
                            ✅ Payment receipt ready! Click to view:
                          </Typography>
                          <Box
                            sx={{
                              maxWidth: isMobile ? 250 : 300,
                              margin: '0 auto',
                              border: '2px solid #4ECDC4',
                              borderRadius: isMobile ? 1 : 2,
                              overflow: 'hidden',
                              boxShadow: '0 10px 30px rgba(78, 205, 196, 0.3)',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                transition: 'transform 0.2s',
                              }
                            }}
                            onClick={() => {
                              const win = window.open('', '_blank');
                              if (win) {
                                win.document.write(`
                                  <html>
                                    <head>
                                      <title>${paymentMethod} Receipt</title>
                                      <style>
                                        body { 
                                          margin: 0; 
                                          padding: 20px; 
                                          background: #f5f5f5; 
                                          display: flex; 
                                          justify-content: center; 
                                          align-items: center; 
                                          min-height: 100vh;
                                        }
                                        .receipt-container {
                                          transform: scale(1.1);
                                          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                                          border-radius: 20px;
                                          overflow: hidden;
                                        }
                                      </style>
                                    </head>
                                    <body>
                                      <div class="receipt-container">
                                        ${generatedReceipt}
                                      </div>
                                      <script>
                                        window.onload = function() {
                                          setTimeout(() => window.print(), 500);
                                        }
                                      </script>
                                    </body>
                                  </html>
                                `);
                                win.document.close();
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: '100%',
                                height: isMobile ? 80 : 100,
                                background: paymentMethod === 'GCASH'
                                  ? 'linear-gradient(135deg, #007BFF 0%, #0056B3 100%)'
                                  : 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                              }}
                            >
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                                  ${paymentMethod} RECEIPT
                                </Typography>
                                <Typography variant="caption" sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                                  Click to view & print
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}

                </Box>

                {/* Right Column - Order Summary & Items */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  
                  {/* Order Summary */}
                  <Box sx={{ 
                      p: isMobile ? 1.5 : 3, 
                      backgroundColor: alpha('#FFFFFF', 0.03),
                      borderRadius: isMobile ? 2 : 3,
                      mb: isMobile ? 2 : 3,
                      border: '1px solid rgba(120, 119, 198, 0.2)',
                  }}>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ 
                        color: 'white', 
                        mb: isMobile ? 1 : 2, 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        fontSize: isMobile ? '0.9rem' : '1rem'
                      }}>
                        📦 Order Summary
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: alpha('#FFFFFF', 0.7),
                            fontSize: isMobile ? '0.75rem' : '0.85rem'
                          }}>
                              Subtotal ({selectedItems.length} items)
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: 'white', 
                            fontWeight: 500,
                            fontSize: isMobile ? '0.75rem' : '0.85rem'
                          }}>
                              {usdFormatted.format(selectedTotal)}
                          </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: alpha('#FFFFFF', 0.7),
                            fontSize: isMobile ? '0.75rem' : '0.85rem'
                          }}>
                              Shipping
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#4ECDC4', 
                            fontWeight: 500,
                            fontSize: isMobile ? '0.75rem' : '0.85rem'
                          }}>
                              FREE 🚚
                          </Typography>
                      </Box>

                      <Divider sx={{ 
                        borderColor: alpha('#FFFFFF', 0.1), 
                        my: isMobile ? 1 : 2 
                      }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ 
                            color: 'white', 
                            fontWeight: 600,
                            fontSize: isMobile ? '0.9rem' : '1rem'
                          }}>
                              Total Amount Due
                          </Typography>
                          <Typography 
                              variant={isMobile ? "subtitle1" : "h6"} 
                              sx={{ 
                                  color: '#FF6B95',
                                  fontWeight: 700,
                                  fontSize: isMobile ? '0.9rem' : '1rem'
                              }}
                          >
                              {usdFormatted.format(selectedTotal)}
                          </Typography>
                      </Box>
                  </Box>

                  <Typography variant="subtitle1" fontWeight="bold" sx={{ 
                    color: alpha('#FFFFFF', 0.8), 
                    mb: isMobile ? 1 : 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    fontSize: isMobile ? '0.85rem' : '1rem'
                  }}>
                    🛍️ Items to Purchase:
                  </Typography>
                  <Box sx={{ 
                    maxHeight: isMobile ? 150 : 200, 
                    overflowY: 'auto',
                    mb: isMobile ? 2 : 3,
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: alpha('#FFFFFF', 0.03),
                      borderRadius: '2px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: alpha('#7877C6', 0.4),
                      borderRadius: '2px',
                    }
                  }}>
                    <List sx={{ p: 0 }}>
                      {selectedItems.map((item) => (
                        <ListItem
                          key={item.id}
                          disableGutters
                          sx={{
                            backgroundColor: alpha('#FFFFFF', 0.03),
                            borderRadius: isMobile ? 1 : 2,
                            mb: isMobile ? 0.75 : 1,
                            p: isMobile ? 1 : 1.5,
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                          }}
                          secondaryAction={
                            <Tooltip title="Remove item">
                              <IconButton 
                                edge="end" 
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={isProcessing}
                                size={isMobile ? "small" : "medium"}
                                sx={{ 
                                  color: alpha('#FF6B95', 0.7), 
                                  ml: isMobile ? 1 : 2 
                                }}
                              >
                                <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                              </IconButton>
                            </Tooltip>
                          }
                        >
                          <ListItemAvatar sx={{ 
                            minWidth: 'unset', 
                            mr: isMobile ? 1 : 1.5 
                          }}>
                            <Avatar
                              src={item.thumbnail}
                              variant="rounded"
                              sx={{ 
                                width: isMobile ? 50 : 60, 
                                height: isMobile ? 50 : 60 
                              }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ 
                                color: 'white', 
                                fontWeight: 500,
                                fontSize: isMobile ? '0.75rem' : '0.85rem'
                              }}>
                                {item.productName}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: isMobile ? 0.5 : 1, 
                                mt: isMobile ? 0.25 : 0.5 
                              }}>
                                <Chip 
                                  label={`Qty: ${item.quantity}`} 
                                  size="small" 
                                  sx={{ 
                                      backgroundColor: alpha('#7877C6', 0.15), 
                                      color: '#7877C6', 
                                      height: isMobile ? 18 : 20,
                                      fontWeight: 'bold',
                                      fontSize: isMobile ? '0.6rem' : '0.7rem'
                                  }} 
                                />
                                <Typography variant="caption" sx={{ 
                                  color: '#4ECDC4', 
                                  fontWeight: 'bold',
                                  fontSize: isMobile ? '0.65rem' : '0.75rem'
                                }}>
                                  {usdFormatted.format(item.price * item.quantity)}
                                </Typography>
                                {item.discountPercentage > 0 && (
                                  <Chip 
                                    label={`-${item.discountPercentage}%`} 
                                    size="small" 
                                    sx={{ 
                                        backgroundColor: alpha('#FF6B95', 0.15), 
                                        color: '#FF6B95', 
                                        height: isMobile ? 16 : 18,
                                        fontSize: isMobile ? '0.55rem' : '0.65rem'
                                    }} 
                                  />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Place Order Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleFinalOrder}
                    disabled={selectedItems.length === 0 || isProcessing || (paymentMethod !== 'COD' && !isPaymentConfirmed)}
                    startIcon={<PaymentIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      background: 'linear-gradient(135deg, #4ECDC4 0%, #36A398 100%)',
                      color: 'white',
                      fontWeight: 700,
                      py: isMobile ? 1.25 : 2,
                      borderRadius: isMobile ? 1 : 2,
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #36A398 0%, #4ECDC4 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 20px rgba(78, 205, 196, 0.3)',
                      },
                      '&.Mui-disabled': {
                        background: alpha('#FFFFFF', 0.1),
                        color: alpha('#FFFFFF', 0.3),
                      }
                    }}
                  >
                    {isProcessing ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={isMobile ? 16 : 20} sx={{ color: 'white' }} />
                        <span style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                          {isPaymentConfirmed ? 'Completing...' : 'Processing...'}
                        </span>
                      </Box>
                    ) : (
                      `Place Order - ${usdFormatted.format(selectedTotal)}`
                    )}
                  </Button>
                  
                  {paymentMethod !== 'COD' && !isPaymentConfirmed && (
                    <Typography variant="caption" sx={{ 
                      color: alpha('#FFFFFF', 0.5), 
                      mt: isMobile ? 1.5 : 2, 
                      display: 'block', 
                      textAlign: 'center',
                      fontSize: isMobile ? '0.65rem' : '0.75rem'
                    }}>
                      * Complete {paymentMethod} payment before placing order
                    </Typography>
                  )}

                  {/* Features */}
                  <Box sx={{ 
                    mt: isMobile ? 2 : 3, 
                    p: isMobile ? 1 : 2, 
                    backgroundColor: alpha('#7877C6', 0.05), 
                    borderRadius: isMobile ? 1 : 2 
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: alpha('#FFFFFF', 0.7), 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontSize: isMobile ? '0.7rem' : '0.85rem'
                    }}>
                      ⚡ <strong>Fast Delivery:</strong> 2-3 business days
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: alpha('#FFFFFF', 0.7), 
                      mt: isMobile ? 0.5 : 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontSize: isMobile ? '0.7rem' : '0.85rem'
                    }}>
                      🔒 <strong>Secure Payment:</strong> 100% protected
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: alpha('#FFFFFF', 0.7), 
                      mt: isMobile ? 0.5 : 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontSize: isMobile ? '0.7rem' : '0.85rem'
                    }}>
                      ↩️ <strong>Easy Returns:</strong> 30-day money back guarantee
                    </Typography>
                  </Box>

                </Box>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        paymentMethod={paymentMethod}
        amount={selectedTotal}
        onAutoCheckout={handleAutoCheckout}
      />

      {/* MyPurchaseDialog */}
      <MyPurchaseDialog
        open={purchaseDialogOpen}
        onClose={() => setPurchaseDialogOpen(false)}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            fontSize: isMobile ? '0.85rem' : '1rem'
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CheckoutPopover;
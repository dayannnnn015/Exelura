import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  alpha,
  Paper,
  Fade,
  LinearProgress,
  Avatar,
  Chip,
  Divider,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle,
  CreditCard,
  QrCode,
  PhoneAndroid,
  Security,
  Bolt,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onPaymentSuccess: (receiptUrl: string) => void;
  paymentMethod: 'GCASH' | 'PAYMAYA';
  amount: number;
  onAutoCheckout?: () => void;
}

const usdFormatted = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  onPaymentSuccess,
  paymentMethod,
  amount,
  onAutoCheckout,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('09171234567');
  const [mpin, setMpin] = useState('••••');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoCheckoutTriggered, setAutoCheckoutTriggered] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setError(null);
      setIsProcessing(false);
      setAutoCheckoutTriggered(false);
    }
  }, [open]);

  const generateGCashReceipt = () => {
    const receiptId = `GC${Date.now().toString().slice(-8)}`;
    const timestamp = new Date().toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #007BFF 0%, #0056B3 100%); padding: 20px; border-radius: 20px; color: white; max-width: 400px; margin: auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <span style="background: white; color: #007BFF; padding: 8px 16px; border-radius: 50px; font-weight: bold;">GCash</span>
          </h2>
          <p style="opacity: 0.9; margin: 5px 0;">Payment Successful</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="opacity: 0.8;">Amount</span>
            <span style="font-size: 24px; font-weight: bold; color: #4ECDC4;">${usdFormatted.format(amount)}</span>
          </div>
          
          <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="opacity: 0.8;">Transaction ID</span>
              <span style="font-family: monospace; font-weight: bold;">${receiptId}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="opacity: 0.8;">Date & Time</span>
              <span>${timestamp}</span>
            </div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="opacity: 0.8;">Merchant</span>
              <span style="font-weight: bold;">Xelura Store</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="opacity: 0.8;">Reference No.</span>
              <span>XEL-${Date.now().toString().slice(-6)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="opacity: 0.8;">Status</span>
              <span style="color: #4ECDC4; font-weight: bold;">✓ Completed</span>
            </div>
          </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 15px; text-align: center;">
          <p style="margin: 0; opacity: 0.8; font-size: 12px;">
            This is a computer-generated receipt. No signature required.
          </p>
          <p style="margin: 5px 0 0 0; opacity: 0.6; font-size: 11px;">
            Thank you for using GCash!
          </p>
        </div>
      </div>
    `;
  };

  const generatePayMayaReceipt = () => {
    const receiptId = `PM${Date.now().toString().slice(-8)}`;
    const timestamp = new Date().toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%); padding: 20px; border-radius: 20px; color: white; max-width: 400px; margin: auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <span style="background: white; color: #F44336; padding: 8px 16px; border-radius: 50px; font-weight: bold;">PayMaya</span>
          </h2>
          <p style="opacity: 0.9; margin: 5px 0;">Payment Confirmed</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="opacity: 0.8;">Amount Paid</span>
            <span style="font-size: 24px; font-weight: bold; color: #FFD700;">${usdFormatted.format(amount)}</span>
          </div>
          
          <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="opacity: 0.8;">Transaction ID</span>
              <span style="font-family: monospace; font-weight: bold;">${receiptId}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="opacity: 0.8;">Timestamp</span>
              <span>${timestamp}</span>
            </div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="opacity: 0.8;">Merchant</span>
              <span style="font-weight: bold;">Xelura Premium</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="opacity: 0.8;">Order ID</span>
              <span>XM-${Date.now().toString().slice(-6)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="opacity: 0.8;">Payment Method</span>
              <span>Virtual Payment</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="opacity: 0.8;">Status</span>
              <span style="color: #FFD700; font-weight: bold;">✓ SUCCESS</span>
            </div>
          </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 15px; text-align: center;">
          <p style="margin: 0; opacity: 0.8; font-size: 12px;">
            Keep this receipt for your records
          </p>
          <p style="margin: 5px 0 0 0; opacity: 0.6; font-size: 11px;">
            Security verified by PayMaya
          </p>
        </div>
      </div>
    `;
  };

  const handlePayment = () => {
    if (phoneNumber.length !== 11 || !phoneNumber.startsWith('09')) {
      setError('Please enter a valid Philippine mobile number (09xxxxxxxxx)');
      return;
    }

    if (mpin.length !== 4 || mpin.includes('•')) {
      setError('Please enter your 4-digit MPIN');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setStep(2);

    // Simulate payment processing
    setTimeout(() => {
      setStep(3);
      setIsProcessing(false);
      
      const receiptHtml = paymentMethod === 'GCASH' 
        ? generateGCashReceipt()
        : generatePayMayaReceipt();
      
      const receiptBlob = new Blob([receiptHtml], { type: 'text/html' });
      const receiptUrl = URL.createObjectURL(receiptBlob);
      
      // Trigger payment success callback
      onPaymentSuccess(receiptUrl);
      
      // Trigger auto-checkout after a delay
      setTimeout(() => {
        if (onAutoCheckout && !autoCheckoutTriggered) {
          setAutoCheckoutTriggered(true);
          onAutoCheckout();
        }
      }, 2000);
    }, 2500);
  };

  const handleClose = () => {
    if (!isProcessing && step !== 2) {
      onClose();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Box sx={{ textAlign: 'center', mb: isMobile ? 2 : 4 }}>
              <Avatar
                sx={{
                  width: isMobile ? 60 : 80,
                  height: isMobile ? 60 : 80,
                  mx: 'auto',
                  mb: isMobile ? 1 : 2,
                  background: paymentMethod === 'GCASH' 
                    ? 'linear-gradient(135deg, #007BFF 0%, #0056B3 100%)'
                    : 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                }}
              >
                {paymentMethod === 'GCASH' ? (
                  <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">G</Typography>
                ) : (
                  <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">P</Typography>
                )}
              </Avatar>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color="white" gutterBottom>
                {paymentMethod} Payment
              </Typography>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" sx={{ 
                color: paymentMethod === 'GCASH' ? '#007BFF' : '#F44336',
                mb: 1,
                fontSize: isMobile ? '1.3rem' : '1.75rem'
              }}>
                {usdFormatted.format(amount)}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: alpha('#FFFFFF', 0.7),
                fontSize: isMobile ? '0.8rem' : '0.9rem'
              }}>
                Pay securely to Xelura Store
              </Typography>
            </Box>

            <Box sx={{ mb: isMobile ? 2 : 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: isMobile ? 1 : 2 }}>
                <PhoneAndroid sx={{ 
                  color: '#4ECDC4',
                  fontSize: isMobile ? '1rem' : '1.25rem'
                }} />
                <Typography variant="subtitle2" fontWeight="bold" color="white" sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                  Mobile Number
                </Typography>
              </Box>
              <TextField
                fullWidth
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0917 123 4567"
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: alpha('#FFFFFF', 0.05),
                    borderRadius: isMobile ? 1 : 2,
                    fontSize: isMobile ? '0.85rem' : '1rem',
                    '& fieldset': {
                      borderColor: alpha('#FFFFFF', 0.1),
                    },
                    '&:hover fieldset': {
                      borderColor: paymentMethod === 'GCASH' ? '#007BFF' : '#F44336',
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: isMobile ? 3 : 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: isMobile ? 1 : 2 }}>
                <Security sx={{ 
                  color: '#4ECDC4',
                  fontSize: isMobile ? '1rem' : '1.25rem'
                }} />
                <Typography variant="subtitle2" fontWeight="bold" color="white" sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                  {paymentMethod} MPIN
                </Typography>
              </Box>
              <TextField
                fullWidth
                type="password"
                value={mpin}
                onChange={(e) => {
                  if (e.target.value.length <= 4) {
                    setMpin(e.target.value.replace(/[^0-9]/g, ''));
                  }
                }}
                placeholder="Enter 4-digit MPIN"
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: alpha('#FFFFFF', 0.05),
                    borderRadius: isMobile ? 1 : 2,
                    fontSize: isMobile ? '0.85rem' : '1rem',
                    '& fieldset': {
                      borderColor: alpha('#FFFFFF', 0.1),
                    },
                    '&:hover fieldset': {
                      borderColor: paymentMethod === 'GCASH' ? '#007BFF' : '#F44336',
                    },
                  },
                }}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ 
                mb: isMobile ? 2 : 3, 
                borderRadius: isMobile ? 1 : 2,
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                py: isMobile ? 0.5 : 1
              }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handlePayment}
              startIcon={<Bolt sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />}
              sx={{
                py: isMobile ? 1 : 1.5,
                background: paymentMethod === 'GCASH'
                  ? 'linear-gradient(135deg, #007BFF 0%, #0056B3 100%)'
                  : 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                color: 'white',
                fontWeight: 700,
                borderRadius: isMobile ? 1 : 2,
                fontSize: isMobile ? '0.85rem' : '1rem',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: paymentMethod === 'GCASH'
                    ? '0 10px 20px rgba(0, 123, 255, 0.3)'
                    : '0 10px 20px rgba(244, 67, 54, 0.3)',
                }
              }}
            >
              Pay with {paymentMethod}
            </Button>
          </>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: isMobile ? 3 : 4 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Avatar
                sx={{
                  width: isMobile ? 80 : 100,
                  height: isMobile ? 80 : 100,
                  mx: 'auto',
                  mb: isMobile ? 2 : 3,
                  background: paymentMethod === 'GCASH'
                    ? 'linear-gradient(135deg, #007BFF 0%, #0056B3 100%)'
                    : 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                }}
              >
                {paymentMethod === 'GCASH' ? (
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold">G</Typography>
                ) : (
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold">P</Typography>
                )}
              </Avatar>
            </motion.div>
            
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color="white" gutterBottom sx={{ fontSize: isMobile ? '1.1rem' : '1.5rem' }}>
              Processing Payment...
            </Typography>
            <Typography variant="body1" sx={{ 
              color: alpha('#FFFFFF', 0.7), 
              mb: isMobile ? 2 : 3,
              fontSize: isMobile ? '0.85rem' : '1rem'
            }}>
              Please wait while we confirm your payment
            </Typography>
            
            <LinearProgress 
              sx={{ 
                height: isMobile ? 6 : 8, 
                borderRadius: isMobile ? 3 : 4,
                backgroundColor: alpha('#FFFFFF', 0.1),
                '& .MuiLinearProgress-bar': {
                  background: paymentMethod === 'GCASH'
                    ? 'linear-gradient(90deg, #007BFF 0%, #4ECDC4 100%)'
                    : 'linear-gradient(90deg, #F44336 0%, #FFD700 100%)',
                }
              }} 
            />
            
            <Box sx={{ 
              mt: isMobile ? 2 : 3, 
              p: isMobile ? 1.5 : 2, 
              backgroundColor: alpha('#FFFFFF', 0.05), 
              borderRadius: isMobile ? 1 : 2 
            }}>
              <Typography variant="caption" sx={{ 
                color: alpha('#FFFFFF', 0.6),
                fontSize: isMobile ? '0.7rem' : '0.8rem'
              }}>
                Do not close this window while processing
              </Typography>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: isMobile ? 3 : 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle sx={{ 
                fontSize: isMobile ? 80 : 100, 
                color: '#4ECDC4', 
                mb: isMobile ? 2 : 3 
              }} />
            </motion.div>
            
            <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" color="white" gutterBottom sx={{ fontSize: isMobile ? '1.3rem' : '1.75rem' }}>
              Payment Successful! 🎉
            </Typography>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ 
              color: paymentMethod === 'GCASH' ? '#007BFF' : '#F44336',
              mb: isMobile ? 1.5 : 2,
              fontSize: isMobile ? '1.1rem' : '1.5rem'
            }}>
              {usdFormatted.format(amount)}
            </Typography>
            
            <Box sx={{ 
              backgroundColor: alpha('#4ECDC4', 0.1),
              borderRadius: isMobile ? 1 : 2,
              p: isMobile ? 1.5 : 2,
              mb: isMobile ? 2 : 3,
              border: '1px solid rgba(78, 205, 196, 0.3)',
            }}>
              <Typography variant="body2" sx={{ 
                color: alpha('#FFFFFF', 0.8),
                fontSize: isMobile ? '0.8rem' : '0.9rem'
              }}>
                Your {paymentMethod} payment has been confirmed
              </Typography>
              <Typography variant="caption" sx={{ 
                color: alpha('#FFFFFF', 0.6),
                fontSize: isMobile ? '0.7rem' : '0.8rem'
              }}>
                Transaction ID: {paymentMethod === 'GCASH' ? 'GC' : 'PM'}{Date.now().toString().slice(-8)}
              </Typography>
            </Box>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Typography variant="body2" sx={{ 
                color: alpha('#FFFFFF', 0.7),
                fontSize: isMobile ? '0.8rem' : '0.9rem'
              }}>
                Auto-checkout in progress...
              </Typography>
            </motion.div>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      className="payment-modal"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, sm: 2, md: 3 },
        zIndex: 10000,
      }}
    >
      <Fade in={open} timeout={300}>
        <Paper
          sx={{
            width: '100%',
            maxWidth: isMobile ? 320 : 450,
            backgroundColor: alpha('#0A081F', 0.98),
            backdropFilter: 'blur(30px)',
            border: `2px solid ${paymentMethod === 'GCASH' ? 'rgba(0, 123, 255, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
            borderRadius: isMobile ? 2 : 4,
            boxShadow: paymentMethod === 'GCASH'
              ? '0 20px 60px rgba(0, 123, 255, 0.4)'
              : '0 20px 60px rgba(244, 67, 54, 0.4)',
            WebkitBackdropFilter: 'blur(30px)',
            position: 'relative',
            overflow: 'hidden',
            mx: isMobile ? 1 : 2,
          }}
        >
          <Box sx={{ 
            p: isMobile ? 2 : 3, 
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: alpha('#0A081F', 0.9),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2 }}>
              <CreditCard sx={{ 
                color: paymentMethod === 'GCASH' ? '#007BFF' : '#F44336',
                fontSize: isMobile ? 24 : 32 
              }} />
              <Box>
                <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold" color="white" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  Secure Payment
                </Typography>
                <Chip
                  label={paymentMethod}
                  size="small"
                  sx={{
                    backgroundColor: paymentMethod === 'GCASH' 
                      ? alpha('#007BFF', 0.2)
                      : alpha('#F44336', 0.2),
                    color: paymentMethod === 'GCASH' ? '#007BFF' : '#F44336',
                    fontWeight: 'bold',
                    mt: 0.5,
                    fontSize: isMobile ? '0.65rem' : '0.75rem',
                    height: isMobile ? 20 : 24,
                  }}
                />
              </Box>
            </Box>
            {step !== 2 && (
              <IconButton
                onClick={handleClose}
                size={isMobile ? "small" : "medium"}
                sx={{
                  color: alpha('#FFFFFF', 0.7),
                  '&:hover': {
                    backgroundColor: alpha('#FF6B95', 0.1),
                    color: '#FF6B95',
                  }
                }}
              >
                <CloseIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            )}
          </Box>

          <Box sx={{ p: isMobile ? 2 : 3 }}>
            {renderStep()}
          </Box>

          <Box sx={{ 
            p: isMobile ? 1.5 : 2, 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: alpha('#FFFFFF', 0.03),
            textAlign: 'center',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Security sx={{ fontSize: isMobile ? 14 : 16, color: '#4ECDC4' }} />
              <Typography variant="caption" sx={{ 
                color: alpha('#FFFFFF', 0.6),
                fontSize: isMobile ? '0.65rem' : '0.75rem'
              }}>
                Protected by {paymentMethod === 'GCASH' ? 'GCash' : 'PayMaya'} Security
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Modal>
  );
};

export default PaymentModal;
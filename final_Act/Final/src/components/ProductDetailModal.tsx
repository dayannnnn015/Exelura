import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Grid,
  Typography,
  Rating,
  Button,
  Chip,
  Divider,
  Badge,
  Tooltip,
  useMediaQuery,
  useTheme,
  Avatar,
  Stack,
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  alpha,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Close,
  ShoppingCart,
  Inventory,
  ArrowBack,
  ArrowForward,
  Reviews,
  LocalShipping,
  Verified,
  Star,
  Comment,
  Class,
  Style,
  FavoriteBorder,
  Share,
  ZoomIn,
  ShoppingBag,
  Discount,
  Category,
  Tag,
  // FIX: Moved these two imports here from the bottom of the file
  Remove, 
  Add,
} from "@mui/icons-material";
import { GetProductDetails } from "../API/ProductsAPI";
import { useUserStore } from "../store/userStore";
import { motion, AnimatePresence } from 'framer-motion';

const usdFormatted = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

interface ProductDetailModalProps {
  open: boolean;
  product: any | null;
  onClose: () => void;
  onAddToCart: (product: any) => void;
  isLoggedIn: boolean;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  open, 
  product, 
  onClose, 
  onAddToCart, 
  isLoggedIn 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [productDetails, setProductDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Debug log props
  console.log('🔵 ProductDetailModal Props:', {
    open,
    hasProduct: !!product,
    productId: product?.id,
    productTitle: product?.title
  });

  useEffect(() => {
    console.log('🔄 useEffect triggered:', { open, hasProduct: !!product });
    
    if (open && product) {
      console.log('✅ Opening modal for product:', product.id, product.title);
      loadProductDetails();
    } else if (open && !product) {
      console.warn('⚠️ Modal opened but no product provided');
      setError('No product data available');
    } else {
      console.log('🔴 Modal closed or no product');
      setProductDetails(null);
      setError(null);
      setSelectedImageIndex(0);
      setActiveTab(0);
      setQuantity(1);
    }
  }, [open, product]);

  const loadProductDetails = async () => {
    if (!product) {
      console.error('❌ No product provided to modal');
      setError('No product data available');
      return;
    }
    
    console.log('🔄 Loading details for product ID:', product.id);
    setLoading(true);
    setError(null);
    
    try {
      const details = await GetProductDetails(product.id);
      console.log('✅ Product details loaded:', details);
      setProductDetails(details);
    } catch (err) {
      console.error('❌ Error loading product details:', err);
      setError('Failed to load product details. Please try again.');
      // Use the basic product data if detailed fetch fails
      console.log('🔄 Using basic product data');
      setProductDetails(product);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousImage = () => {
    if (!productDetails) return;
    const images = productDetails.images || [productDetails.thumbnail];
    setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  const handleNextImage = () => {
    if (!productDetails) return;
    const images = productDetails.images || [productDetails.thumbnail];
    setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  const handleAddToCartClick = () => {
    if (!isLoggedIn) {
      setSnackbarMessage('Please login to add items to your cart');
      setSnackbarOpen(true);
      return;
    }
    
    if (productDetails) {
      // Add with selected quantity
      const productToAdd = {
        ...productDetails,
        quantity: quantity
      };
      console.log('🛒 Adding to cart:', productToAdd.title);
      onAddToCart(productToAdd);
      setSnackbarMessage(`Added ${productDetails.title} to cart!`);
      setSnackbarOpen(true);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (productDetails && newQuantity > productDetails.stock) {
      setSnackbarMessage(`Only ${productDetails.stock} items available`);
      setSnackbarOpen(true);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleBuyNow = () => {
    handleAddToCartClick();
    // In a real app, this would redirect to checkout
    setTimeout(() => {
      setSnackbarMessage('Redirecting to checkout...');
    }, 500);
  };

  const handleShare = () => {
    if (navigator.share && productDetails) {
      navigator.share({
        title: productDetails.title,
        text: `Check out ${productDetails.title} on Luxury Store`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSnackbarMessage('Link copied to clipboard!');
      setSnackbarOpen(true);
    }
  };

  // Early return if modal is not open
  if (!open) {
    console.log('🔴 Modal not open, returning null');
    return null;
  }

  // If no product and no productDetails, show error
  if (!product && !productDetails) {
    console.warn('⚠️ No product data available');
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Alert severity="error">
            Error: No product data available
          </Alert>
          <Button onClick={onClose} sx={{ mt: 2 }}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const displayProduct = productDetails || product;
  console.log('📊 Display product:', displayProduct?.title);
  
  const images = displayProduct?.images || [displayProduct?.thumbnail || 'https://via.placeholder.com/600x400?text=No+Image'];
  const discountPrice = displayProduct?.price * (1 - (displayProduct?.discountPercentage || 0) / 100);
  const savings = displayProduct?.price - discountPrice;
  const totalPrice = discountPrice * quantity;

  const renderSpecifications = () => (
    <Stack spacing={2}>
      <Paper elevation={0} sx={{ p: 3, bgcolor: alpha('#7877C6', 0.05), borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" color="white" gutterBottom>
          Product Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Brand
              </Typography>
              <Typography variant="body2" fontWeight="medium" color="white">
                {displayProduct?.brand || "Premium Brand"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                SKU
              </Typography>
              <Typography variant="body2" fontWeight="medium" color="white">
                {displayProduct?.id ? `LUX-${displayProduct.id}` : "N/A"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Availability
              </Typography>
              <Typography variant="body2" fontWeight="medium" color={displayProduct?.stock > 0 ? "#4ECDC4" : "#FF6B95"}>
                {displayProduct?.stock > 0 ? `${displayProduct.stock} in stock` : "Out of stock"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Category
              </Typography>
              <Chip
                label={displayProduct?.category || "Luxury"}
                size="small"
                icon={<Category fontSize="small" />}
                sx={{ 
                  backgroundColor: alpha('#7877C6', 0.1),
                  color: '#7877C6',
                  fontWeight: 600,
                  mt: 0.5
                }}
              />
            </Box>
          </Grid>
          {displayProduct?.dimensions && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Dimensions
                </Typography>
                <Typography variant="body2" fontWeight="medium" color="white">
                  {displayProduct.dimensions}
                </Typography>
              </Box>
            </Grid>
          )}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {displayProduct?.tags?.map((tag: string, index: number) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    icon={<Tag fontSize="small" />}
                    sx={{ 
                      backgroundColor: alpha('#FF6B95', 0.1),
                      color: '#FF6B95',
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );

  const renderReviews = () => (
    <Stack spacing={2}>
      {/* Rating Summary */}
      <Paper elevation={0} sx={{ p: 3, bgcolor: alpha('#4ECDC4', 0.05), borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" fontWeight="bold" color="#4ECDC4">
              {displayProduct?.rating?.toFixed(1) || '0.0'}
            </Typography>
            <Rating 
              value={displayProduct?.rating || 0} 
              precision={0.1} 
              readOnly 
              size="large"
              sx={{ color: '#FFD700' }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {displayProduct?.reviews?.length || 0} verified reviews
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Based on customer feedback from verified purchases
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Reviews List */}
      {displayProduct?.reviews?.map((review: any, index: number) => (
        <Paper key={index} elevation={0} sx={{ p: 2.5, bgcolor: alpha('#FFFFFF', 0.03), borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
            <Avatar 
              src={review.avatar}
              sx={{ 
                width: 44, 
                height: 44,
                backgroundColor: alpha('#7877C6', 0.2),
              }}
            >
              {review.user?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="white">
                {review.user || "Anonymous Customer"}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Rating value={review.rating} size="small" readOnly sx={{ color: '#FFD700' }} />
                <Typography variant="caption" color="text.secondary">
                  {review.date || "Recently"}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            "{review.comment || "No review text provided."}"
          </Typography>
        </Paper>
      ))}

      {(!displayProduct?.reviews || displayProduct.reviews.length === 0) && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: alpha('#FFFFFF', 0.03), borderRadius: 2 }}>
          <Comment sx={{ fontSize: 48, color: alpha('#FFFFFF', 0.2), mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No reviews yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Be the first to review this premium product!
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Reviews />}
            sx={{ mt: 2, borderColor: '#7877C6', color: '#7877C6' }}
          >
            Write a Review
          </Button>
        </Paper>
      )}
    </Stack>
  );

  const renderShipping = () => (
    <Stack spacing={2}>
      <Paper elevation={0} sx={{ p: 3, bgcolor: alpha('#FF6B95', 0.05), borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <LocalShipping sx={{ color: '#FF6B95', fontSize: 28 }} />
          <Typography variant="subtitle1" fontWeight="bold" color="white">
            Shipping Information
          </Typography>
        </Box>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Verified sx={{ color: '#4ECDC4', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" fontWeight="medium" color="white">
                Free Standard Shipping
              </Typography>
              <Typography variant="caption" color="text.secondary">
                On orders over $100 • 3-5 business days
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocalShipping sx={{ color: '#7877C6', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" fontWeight="medium" color="white">
                Express Shipping
              </Typography>
              <Typography variant="caption" color="text.secondary">
                $9.99 • 1-2 business days
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Verified sx={{ color: '#4ECDC4', fontSize: 20 }} />
            <Box>
              <Typography variant="body2" fontWeight="medium" color="white">
                International Shipping
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Available to select countries • 7-14 business days
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, bgcolor: alpha('#4ECDC4', 0.05), borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Verified sx={{ color: '#4ECDC4', fontSize: 28 }} />
          <Typography variant="subtitle1" fontWeight="bold" color="white">
            Return Policy
          </Typography>
        </Box>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            • 30-day return policy from delivery date
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Free returns on all items
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Full refund or exchange available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Items must be in original condition with tags attached
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          backgroundColor: alpha('#0A081F', 0.95),
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(120, 119, 198, 0.2)',
          boxShadow: '0 40px 80px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          WebkitBackdropFilter: 'blur(40px)',
        }
      }}
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
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
                Loading Luxury Details
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                Fetching premium product information...
              </Typography>
            </Box>
          </Box>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && !loading && (
        <Alert 
          severity="error" 
          sx={{ 
            m: 2,
            backgroundColor: alpha('#FF6B95', 0.1),
            color: '#FF6B95',
            border: `1px solid ${alpha('#FF6B95', 0.3)}`,
          }}
        >
          {error}
        </Alert>
      )}

      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
      }}>
        <Typography variant="h5" fontWeight="bold" color="white" sx={{ pr: 4 }}>
          {displayProduct?.title || "Product Details"}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Share" arrow>
            <IconButton 
              onClick={handleShare}
              sx={{
                color: alpha('#FFFFFF', 0.7),
                '&:hover': {
                  backgroundColor: alpha('#7877C6', 0.2),
                  color: '#7877C6',
                }
              }}
            >
              <Share />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close" arrow>
            <IconButton 
              onClick={onClose}
              sx={{
                color: alpha('#FFFFFF', 0.7),
                '&:hover': {
                  backgroundColor: alpha('#FF6B95', 0.2),
                  color: '#FF6B95',
                }
              }}
            >
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#7877C6' }} />
          </Box>
        ) : error && !displayProduct ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <Grid container>
            {/* Images Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: { xs: 2, md: 4 }, position: 'relative' }}>
                {/* Main Image */}
                <Box sx={{ 
                  position: 'relative', 
                  mb: 2,
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: alpha('#FFFFFF', 0.03),
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    src={images[selectedImageIndex]}
                    alt={displayProduct?.title || "Product Image"}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                  
                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePreviousImage}
                        sx={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: alpha('#FFFFFF', 0.15),
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: alpha('#7877C6', 0.3),
                            transform: 'translateY(-50%) scale(1.1)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <ArrowBack />
                      </IconButton>
                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: alpha('#FFFFFF', 0.15),
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: alpha('#7877C6', 0.3),
                            transform: 'translateY(-50%) scale(1.1)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <ArrowForward />
                      </IconButton>
                    </>
                  )}

                  {/* Discount Badge */}
                  {displayProduct?.discountPercentage > 0 && (
                    <Chip
                      label={`${displayProduct.discountPercentage}% OFF`}
                      color="error"
                      icon={<Discount />}
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        fontWeight: 'bold',
                        backgroundColor: '#FF6B95',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(255, 107, 149, 0.4)',
                      }}
                    />
                  )}
                </Box>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    overflowX: 'auto',
                    py: 1,
                    px: 0.5,
                  }}>
                    {images.map((img: string, index: number) => (
                      <Box
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        sx={{
                          flex: '0 0 auto',
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: 2,
                          borderColor: selectedImageIndex === index ? '#7877C6' : 'transparent',
                          opacity: selectedImageIndex === index ? 1 : 0.7,
                          backgroundColor: alpha('#FFFFFF', 0.03),
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            opacity: 1,
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Details Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: { xs: 2, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack spacing={3} sx={{ height: '100%' }}>
                  {/* Category and Rating */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={displayProduct?.category || "Luxury"} 
                      icon={<Class fontSize="small" />}
                      sx={{ 
                        backgroundColor: alpha('#7877C6', 0.1),
                        color: '#7877C6',
                        fontWeight: 600,
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating 
                        value={displayProduct?.rating || 0} 
                        precision={0.1} 
                        readOnly 
                        sx={{ color: '#FFD700' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        ({displayProduct?.rating?.toFixed(1) || '0.0'})
                      </Typography>
                      <Badge 
                        badgeContent={displayProduct?.reviews?.length || 0} 
                        color="info"
                        showZero
                        sx={{ ml: 1 }}
                      >
                        <Reviews fontSize="small" color="action" />
                      </Badge>
                    </Box>
                  </Box>
                  
                  {/* Title */}
                  <Typography variant="h4" fontWeight="bold" color="white">
                    {displayProduct?.title || "Product Title"}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {displayProduct?.description || "No description available"}
                  </Typography>

                  {/* Price Section */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                      <Typography variant="h3" fontWeight="bold" color="#FF6B95">
                        {usdFormatted.format(discountPrice || 0)}
                      </Typography>
                      {displayProduct?.discountPercentage > 0 && (
                        <>
                          <Typography
                            variant="h5"
                            color="text.disabled"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            {usdFormatted.format(displayProduct?.price || 0)}
                          </Typography>
                          <Chip
                            label={`Save ${usdFormatted.format(savings || 0)}`}
                            color="success"
                            size="medium"
                            variant="outlined"
                            sx={{ 
                              fontWeight: 700,
                              borderColor: '#4ECDC4',
                              color: '#4ECDC4',
                            }}
                          />
                        </>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {displayProduct?.discountPercentage > 0 ? `${displayProduct.discountPercentage}% OFF • ` : ''}
                      Price includes all applicable taxes
                    </Typography>
                  </Box>
                  
                  {/* Stock Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={(displayProduct?.stock || 0) > 0 ? "In Stock" : "Out of Stock"}
                      color={(displayProduct?.stock || 0) > 0 ? "success" : "error"}
                      icon={<Inventory />}
                      sx={{ 
                        fontWeight: 'bold',
                        backgroundColor: (displayProduct?.stock || 0) > 0 
                          ? alpha('#4ECDC4', 0.2) 
                          : alpha('#FF6B95', 0.2),
                        color: (displayProduct?.stock || 0) > 0 ? '#4ECDC4' : '#FF6B95',
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      <Inventory fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {displayProduct?.stock || 0} units available
                    </Typography>
                  </Box>
                  
                  {/* Quantity Selector */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="white" gutterBottom>
                      Quantity
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        overflow: 'hidden',
                        backgroundColor: alpha('#FFFFFF', 0.03),
                      }}>
                        <IconButton
                          onClick={() => handleQuantityChange(quantity - 1)}
                          sx={{ 
                            color: alpha('#FFFFFF', 0.7),
                            borderRadius: 0,
                            '&:hover': {
                              backgroundColor: alpha('#FF6B95', 0.1),
                              color: '#FF6B95',
                            }
                          }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        
                        <Typography 
                          sx={{ 
                            px: 3, 
                            color: 'white',
                            fontWeight: 'bold',
                            minWidth: 60,
                            textAlign: 'center',
                          }}
                        >
                          {quantity}
                        </Typography>
                        
                        <IconButton
                          onClick={() => handleQuantityChange(quantity + 1)}
                          sx={{ 
                            color: alpha('#FFFFFF', 0.7),
                            borderRadius: 0,
                            '&:hover': {
                              backgroundColor: alpha('#4ECDC4', 0.1),
                              color: '#4ECDC4',
                            }
                          }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body1" color="text.secondary">
                        Total: 
                        <Box component="span" sx={{ color: '#FF6B95', fontWeight: 'bold', ml: 1 }}>
                          {usdFormatted.format(totalPrice || 0)}
                        </Box>
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 'auto' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ShoppingCart />}
                      onClick={handleAddToCartClick}
                      disabled={!isLoggedIn || (displayProduct?.stock || 0) === 0}
                      sx={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                        color: 'white',
                        fontWeight: 700,
                        py: 2,
                        borderRadius: 2,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5A59A1 0%, #7877C6 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 24px rgba(120, 119, 198, 0.4)',
                        },
                        '&:disabled': {
                          background: alpha('#FFFFFF', 0.1),
                          color: alpha('#FFFFFF', 0.3),
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isLoggedIn 
                        ? (displayProduct?.stock || 0) === 0 
                          ? 'Out of Stock' 
                          : 'Add to Cart'
                        : 'Login to Purchase'
                      }
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<ShoppingBag />}
                      onClick={handleBuyNow}
                      disabled={!isLoggedIn || (displayProduct?.stock || 0) === 0}
                      sx={{
                        flex: 1,
                        borderColor: '#FF6B95',
                        color: '#FF6B95',
                        fontWeight: 700,
                        py: 2,
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: alpha('#FF6B95', 0.1),
                          borderColor: '#FF6B95',
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          borderColor: alpha('#FFFFFF', 0.1),
                          color: alpha('#FFFFFF', 0.3),
                        },
                      }}
                    >
                      Buy Now
                    </Button>
                  </Stack>

                  {/* Tabs */}
                  <Box sx={{ mt: 3 }}>
                    <Tabs 
                      value={activeTab} 
                      onChange={(_, value) => setActiveTab(value)}
                      variant="fullWidth"
                      sx={{
                        '& .MuiTabs-indicator': {
                          backgroundColor: '#7877C6',
                          height: 3,
                          borderRadius: 3,
                        },
                        '& .MuiTab-root': {
                          color: alpha('#FFFFFF', 0.6),
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          '&.Mui-selected': {
                            color: '#7877C6',
                          },
                          '&:hover': {
                            color: '#7877C6',
                          }
                        }
                      }}
                    >
                      <Tab label="Specifications" />
                      <Tab label="Reviews" />
                      <Tab label="Shipping & Returns" />
                    </Tabs>
                    <Box sx={{ pt: 3, minHeight: 200 }}>
                      {activeTab === 0 && renderSpecifications()}
                      {activeTab === 1 && renderReviews()}
                      {activeTab === 2 && renderShipping()}
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Removed the incorrect imports from here

export default ProductDetailModal;
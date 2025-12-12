// components/QuickViewModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  IconButton,
  Typography,
  Rating,
  Chip,
  Button,
  Stack,
  Divider,
  alpha,
  CircularProgress,
  Fade,
  Paper,
  Dialog,
  DialogContent,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  ShoppingCart,
  Bolt,
  LocalShipping,
  Shield,
  Inventory,
  ZoomIn,
  ArrowBackIos,
  ArrowForwardIos,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickViewModalProps {
  open: boolean;
  product: any;
  onClose: () => void;
  onAddToCart: (product: any) => void;
  onBuyNow: (product: any) => void;
  isLoggedIn: boolean;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  open,
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isLoggedIn,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  
  const discountPrice = product?.price * (1 - (product?.discountPercentage || 0) / 100);
  
  const usdFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const totalImages = product?.images?.length || 0;
  const hasMultipleImages = totalImages > 1;

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      setImageLoaded(false);
    }
  }, [product]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      alert('Please login to add items to cart');
      return;
    }
    onAddToCart({ ...product, quantity });
    onClose();
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      alert('Please login to proceed with purchase');
      return;
    }
    onBuyNow({ ...product, quantity });
    onClose();
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleZoomClick = () => {
    setZoomOpen(true);
  };

  const handlePrevImage = () => {
    if (hasMultipleImages) {
      setSelectedImage((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
    }
  };

  const handleNextImage = () => {
    if (hasMultipleImages) {
      setSelectedImage((prevIndex) => (prevIndex + 1) % totalImages);
    }
  };

  if (!product) return null;

  return (
    <>
      {/* Main Modal */}
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Fade in={open} timeout={300}>
          <Paper
            sx={{
              width: '100%',
              maxWidth: { xs: '95%', sm: 800, md: 900 },
              maxHeight: '90vh',
              overflow: 'auto',
              backgroundColor: alpha('#0A081F', 0.98),
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(120, 119, 198, 0.3)',
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              WebkitBackdropFilter: 'blur(20px)',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                backgroundColor: alpha('#FFFFFF', 0.1),
                backdropFilter: 'blur(10px)',
                color: 'white',
                '&:hover': {
                  backgroundColor: alpha('#FF6B95', 0.3),
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Loading Overlay */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: alpha('#0A081F', 0.8),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 5,
                    borderRadius: 3,
                  }}
                >
                  <CircularProgress sx={{ color: '#7877C6' }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <Box
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 4,
              }}
            >
              {/* Left Column - Images */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: { md: '50%' },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  {/* Main Image Container */}
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 320, sm: 380, md: 420 },
                      borderRadius: 2,
                      overflow: 'hidden',
                      backgroundColor: alpha('#FFFFFF', 0.05),
                      mb: 2,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      cursor: 'zoom-in',
                    }}
                    onClick={handleZoomClick}
                  >
                    {/* Image Loading Placeholder */}
                    {!imageLoaded && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: alpha('#0A081F', 0.7),
                        }}
                      >
                        <CircularProgress size={40} sx={{ color: '#7877C6' }} />
                      </Box>
                    )}

                    {/* Main Product Image */}
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                      }}
                    >
                      <img
                        src={product.images?.[selectedImage] || product.thumbnail}
                        alt={product.title}
                        onLoad={handleImageLoad}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          transition: 'opacity 0.3s ease',
                          opacity: imageLoaded ? 1 : 0,
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.parentElement!.style.backgroundColor = alpha('#7877C6', 0.1);
                          target.parentElement!.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(255,255,255,0.5); cursor: default; flex-direction: column;">
                              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                              <p style="margin-top: 16px; font-size: 0.875rem;">Image not available</p>
                              <p style="margin-top: 8px; font-size: 0.75rem; color: rgba(255,255,255,0.3);">Click to zoom out</p>
                            </div>
                          `;
                        }}
                      />
                    </Box>
                    
                    {/* Discount Badge */}
                    {product.discountPercentage > 0 && (
                      <Chip
                        label={`-${product.discountPercentage}% OFF`}
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          background: 'linear-gradient(135deg, #FF6B95 0%, #FF5252 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          height: 28,
                          zIndex: 2,
                        }}
                      />
                    )}

                    {/* Zoom Hint Overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        right: 12,
                        display: 'flex',
                        gap: 1,
                        zIndex: 2,
                      }}
                    >
                      <Tooltip title="View Larger" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleZoomClick();
                          }}
                          sx={{
                            backgroundColor: alpha('#FFFFFF', 0.15),
                            backdropFilter: 'blur(10px)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: alpha('#7877C6', 0.3),
                            },
                          }}
                        >
                          <ZoomIn fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Zoom Hint Text */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        zIndex: 2,
                        backgroundColor: alpha('#0A081F', 0.7),
                        backdropFilter: 'blur(5px)',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.8), fontSize: '0.7rem' }}>
                        Click to zoom
                      </Typography>
                    </Box>
                  </Box>

                  {/* Thumbnail Gallery */}
                  {product.images && product.images.length > 1 && (
                    <Box sx={{ position: 'relative' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        overflowX: 'auto',
                        py: 1,
                        px: 0.5,
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': {
                          display: 'none',
                        }
                      }}>
                        {product.images.slice(0, 6).map((img: string, index: number) => (
                          <Box
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            sx={{
                              width: 70,
                              height: 70,
                              minWidth: 70,
                              borderRadius: 1,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: selectedImage === index 
                                ? '2px solid #7877C6' 
                                : '1px solid rgba(255, 255, 255, 0.1)',
                              opacity: selectedImage === index ? 1 : 0.7,
                              transition: 'all 0.2s ease',
                              backgroundColor: alpha('#FFFFFF', 0.03),
                              position: 'relative',
                              flexShrink: 0,
                              '&:hover': {
                                opacity: 1,
                                borderColor: '#7877C6',
                                transform: 'scale(1.05)',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <img
                                src={img}
                                alt={`Product view ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.style.backgroundColor = alpha('#7877C6', 0.05);
                                  target.parentElement!.innerHTML = `
                                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(255,255,255,0.3);">
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                      </svg>
                                    </div>
                                  `;
                                }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Right Column - Details */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: { md: '50%' },
                  display: 'flex', 
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Category */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Chip
                      label={product.category}
                      size="small"
                      sx={{
                        backgroundColor: alpha('#7877C6', 0.1),
                        color: '#7877C6',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>

                  {/* Title */}
                  <Typography variant="h5" fontWeight={700} color="white" gutterBottom>
                    {product.title}
                  </Typography>

                  {/* Rating & Reviews */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={product.rating} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.7) }}>
                        {product.rating?.toFixed(1)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.5) }}>
                      {product.reviews?.length || 0} reviews
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: alpha('#FFFFFF', 0.8),
                      mb: 3,
                      lineHeight: 1.6,
                      flex: 1,
                    }}
                  >
                    {product.description}
                  </Typography>

                  {/* Price Section */}
                  <Box sx={{ mb: 3 }}>
                    {product.discountPercentage > 0 ? (
                      <>
                        <Typography
                          variant="h4"
                          fontWeight={800}
                          sx={{
                            color: '#FF6B95',
                            mb: 0.5,
                          }}
                        >
                          {usdFormatted.format(discountPrice)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              textDecoration: 'line-through',
                              color: alpha('#FFFFFF', 0.4),
                            }}
                          >
                            {usdFormatted.format(product.price)}
                          </Typography>
                          <Chip
                            label={`Save ${usdFormatted.format(product.price - discountPrice)}`}
                            size="small"
                            sx={{
                              backgroundColor: alpha('#4ECDC4', 0.2),
                              color: '#4ECDC4',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                        </Box>
                      </>
                    ) : (
                      <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{
                          color: 'white',
                        }}
                      >
                        {usdFormatted.format(product.price)}
                      </Typography>
                    )}
                  </Box>

                  {/* Stock Status */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 2,
                      backgroundColor: product.stock > 10 
                        ? alpha('#4ECDC4', 0.1) 
                        : product.stock > 0 
                          ? alpha('#F29F58', 0.1)
                          : alpha('#FF6B95', 0.1),
                      border: product.stock > 10 
                        ? '1px solid rgba(78, 205, 196, 0.3)' 
                        : product.stock > 0 
                          ? '1px solid rgba(242, 159, 88, 0.3)'
                          : '1px solid rgba(255, 107, 149, 0.3)',
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Inventory sx={{ 
                        color: product.stock > 10 
                          ? '#4ECDC4' 
                          : product.stock > 0 
                            ? '#F29F58'
                            : '#FF6B95' 
                      }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="white">
                          {product.stock > 10 
                            ? 'In Stock' 
                            : product.stock > 0 
                              ? 'Limited Stock'
                              : 'Out of Stock'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.7) }}>
                          {product.stock} items available
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Quantity Selector */}
                  <Box sx={{ mb: 2 }}> 
                    <Typography variant="subtitle2" fontWeight={600} color="white" gutterBottom>
                      Quantity
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          sx={{
                            backgroundColor: alpha('#FFFFFF', 0.1),
                            color: 'white',
                            '&:hover': {
                              backgroundColor: alpha('#7877C6', 0.3),
                            },
                            '&.Mui-disabled': {
                              backgroundColor: alpha('#FFFFFF', 0.05),
                              color: alpha('#FFFFFF', 0.3),
                            },
                          }}
                        >
                          -
                        </IconButton>
                        <Typography
                          variant="h6"
                          color="white"
                          sx={{
                            minWidth: 40,
                            textAlign: 'center',
                          }}
                        >
                          {quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= product.stock}
                          sx={{
                            backgroundColor: alpha('#FFFFFF', 0.1),
                            color: 'white',
                            '&:hover': {
                              backgroundColor: alpha('#7877C6', 0.3),
                            },
                            '&.Mui-disabled': {
                              backgroundColor: alpha('#FFFFFF', 0.05),
                              color: alpha('#FFFFFF', 0.3),
                            },
                          }}
                        >
                          +
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 'auto' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0 || !isLoggedIn}
                      sx={{
                        py: 1.5,
                        background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        borderRadius: 2,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5A59A1 0%, #7877C6 100%)',
                        },
                        '&.Mui-disabled': {
                          background: alpha('#FFFFFF', 0.1),
                          color: alpha('#FFFFFF', 0.3),
                        },
                      }}
                    >
                      {isLoggedIn ? 'Add to Cart' : 'Login to Add'}
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Bolt />}
                      onClick={handleBuyNow}
                      disabled={product.stock <= 0 || !isLoggedIn}
                      sx={{
                        py: 1.5,
                        background: 'linear-gradient(135deg, #FF6B95 0%, #FF5252 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        borderRadius: 2,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #FF5252 0%, #FF6B95 100%)',
                        },
                        '&.Mui-disabled': {
                          background: alpha('#FFFFFF', 0.1),
                          color: alpha('#FFFFFF', 0.3),
                        },
                      }}
                    >
                      Buy Now
                    </Button>
                  </Stack>

                  {/* Shipping Info */}
                  <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShipping sx={{ fontSize: 20, color: '#4ECDC4' }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                          Delivery
                        </Typography>
                        <Typography variant="body2" color="white" fontWeight={500}>
                          2-3 Days
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Shield sx={{ fontSize: 20, color: '#F29F58' }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                          Warranty
                        </Typography>
                        <Typography variant="body2" color="white" fontWeight={500}>
                          1 Year
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Modal>

      {/* Image Zoom Modal */}
      <Dialog
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(10, 8, 31, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(120, 119, 198, 0.3)',
            borderRadius: 2,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            overflow: 'hidden',
            m: 0,
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', width: '100%', height: '100%' }}>
          {/* Close Button */}
          <IconButton
            onClick={() => setZoomOpen(false)}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 10,
              backgroundColor: alpha('#FFFFFF', 0.1),
              backdropFilter: 'blur(10px)',
              color: 'white',
              '&:hover': {
                backgroundColor: alpha('#FF6B95', 0.3),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {/* Left Navigation Arrow */}
          {hasMultipleImages && (
            <IconButton
              size="large"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              sx={{
                position: 'absolute',
                top: '50%',
                left: 20,
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: alpha('#FFFFFF', 0.1),
                backdropFilter: 'blur(10px)',
                color: 'white',
                '&:hover': {
                  backgroundColor: alpha('#7877C6', 0.5),
                },
                display: { xs: 'flex', sm: 'flex' },
                p: 1.5,
              }}
            >
              <ArrowBackIos />
            </IconButton>
          )}

          {/* Right Navigation Arrow */}
          {hasMultipleImages && (
            <IconButton
              size="large"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              sx={{
                position: 'absolute',
                top: '50%',
                right: 20,
                transform: 'translateY(-50%)',
                zIndex: 10,
                backgroundColor: alpha('#FFFFFF', 0.1),
                backdropFilter: 'blur(10px)',
                color: 'white',
                '&:hover': {
                  backgroundColor: alpha('#7877C6', 0.5),
                },
                display: { xs: 'flex', sm: 'flex' },
                p: 1.5,
              }}
            >
              <ArrowForwardIos />
            </IconButton>
          )}

          {/* Centered Zoomed Image */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <img
              src={product?.images?.[selectedImage] || product?.thumbnail}
              alt={`${product?.title} - Full view`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: 8,
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickViewModal;
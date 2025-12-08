import { Container, Box, Grid, alpha } from "@mui/material";
import ProductSearch from './components/ProductSearch';
import AccountMenu from "./components/AccountMenu";
import PictureSlide from "./components/PictureSlide";
import CategoriesGrid from "./components/CategoriesGrid";
import Footer from "./components/Footer";
import QuickStatsPanel from "./components/QuickStatPanel";
import FloatingActionButton from "./components/FloatingActionButton";
import { initializeStore } from "./store/userStore";
import { useEffect, useState, useRef, useCallback } from "react";
import QuickViewModal from "./components/QuickViewModal"; // Replaced ProductDetailModal with QuickViewModal
import { useUserStore } from "./store/userStore";
import { GetProductDetails } from "./API/ProductsAPI";
import Typography from "@mui/material/Typography";
import { motion, AnimatePresence } from 'framer-motion';
import CartDrawerSimple from './components/SimpleCartDrawer';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'new'>('all');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  // State to track scroll position
  const [isScrolled, setIsScrolled] = useState(false); 

  const productsSectionRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const { addToCart, isLoggedIn, cartCount } = useUserStore();

  // Initialize store and log state
  useEffect(() => {
    console.log('🚀 Initializing store...');
    initializeStore();
    
    // Log initial store state
    const state = useUserStore.getState();
    console.log('📦 Initial store state:', {
      isLoggedIn: state.isLoggedIn,
      cartCount: state.cartCount,
      cartTotal: state.cartTotal
    });
  }, []);

  const handleSearch = useCallback((term: string) => {
    console.log('🔍 Search triggered:', term);
    setSearchTerm(term);
    setSelectedCategory('');

    if (term.trim() && productsSectionRef.current) {
      setTimeout(() => {
        productsSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, []);

  const handleCategorySelect = useCallback((categorySlug: string) => {
    console.log('🏷️ Category selected:', categorySlug);
    setSelectedCategory(categorySlug);
    setSearchTerm('');

    setTimeout(() => {
      if (productsSectionRef.current) {
        productsSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  }, []);

  // Product detail modal is now replaced by quick view
  const handleProductClick = useCallback(async (productId: number) => {
    console.log('🟢 Product clicked, ID:', productId);
    setIsLoadingProduct(true);
    
    try {
      const productDetails = await GetProductDetails(productId);
      console.log('✅ Product details loaded:', productDetails.title);
      
      // Ensure QR code is present
      if (!productDetails.qrCode) {
        productDetails.qrCode = `QR-${productId}`;
      }
      
      setQuickViewProduct(productDetails);
      setQuickViewOpen(true);
    } catch (error) {
      console.error('❌ Error loading product details:', error);
      showSnackbar('Failed to load product details. Please try again.', 'error');
    } finally {
      setIsLoadingProduct(false);
    }
  }, []);

  // Quick view handler
  const handleQuickView = useCallback(async (productId: number) => {
    console.log('🔍 Quick view for product ID:', productId);
    setIsLoadingProduct(true);
    
    try {
      const productDetails = await GetProductDetails(productId);
      console.log('✅ Quick view product loaded:', productDetails.title);
      
      // Ensure QR code is present
      if (!productDetails.qrCode) {
        productDetails.qrCode = `QR-${productId}`;
      }
      
      setQuickViewProduct(productDetails);
      setQuickViewOpen(true);
    } catch (error) {
      console.error('❌ Error loading quick view:', error);
      showSnackbar('Failed to load product details. Please try again.', 'error');
    } finally {
      setIsLoadingProduct(false);
    }
  }, []);

  // Close quick view
  const handleCloseQuickView = useCallback(() => {
    setQuickViewOpen(false);
    setQuickViewProduct(null);
  }, []);

  // Handle add to cart (used by both main add to cart and quick view)
  const handleAddToCart = useCallback((product: any) => {
    console.log('🛒 Adding to cart:', {
      id: product.id,
      title: product.title || product.name,
      price: product.price
    });
    
    if (!isLoggedIn) {
      showSnackbar('Please login to add items to cart', 'warning');
      return;
    }

    // Convert product to match store interface
    const productToAdd = {
      id: product.id || product._id,
      title: product.title || product.name || 'Unnamed Product',
      price: product.price || product.currentPrice || 0,
      discountPercentage: product.discountPercentage || 0,
      thumbnail: product.thumbnail || product.image || product.images?.[0] || '',
      category: product.category || '',
      qrCode: product.qrCode || `QR-${product.id || '0000'}`,
      description: product.description || '',
      rating: product.rating || 0,
      stock: product.stock || 10,
      tags: product.tags || [],
      reviews: product.reviews || [],
      quantity: product.quantity || 1,
      // 💡 FIX 1: Add productId and productName for cart drawer display and logic
      productId: product.id || product._id, 
      productName: product.title || product.name || 'Unnamed Product', 
      // 💡 NEW: Initialize item as selected for checkout
      isSelected: true,
    };
    
    // Call the store function
    addToCart(productToAdd, product.quantity || 1);
    
    // Show success notification
    const productName = product.title || product.name || 'Product';
    showSnackbar(`🎉 Added "${productName.substring(0, 20)}..." to cart!`, 'success');
    
    // Log updated cart state
    setTimeout(() => {
      const state = useUserStore.getState();
      console.log('🛒 Cart updated:', {
        cartCount: state.cartCount,
        cartTotal: state.cartTotal,
        items: state.cart
      });
    }, 100);
  }, [addToCart, isLoggedIn]);

  // Handle buy now from quick view
  const handleBuyNow = useCallback((product: any) => {
    if (!isLoggedIn) {
      showSnackbar('Please login to proceed with purchase', 'warning');
      return;
    }

    // Add to cart first
    const productToAdd = {
      id: product.id || product._id,
      title: product.title || product.name || 'Unnamed Product',
      price: product.price || product.currentPrice || 0,
      discountPercentage: product.discountPercentage || 0,
      thumbnail: product.thumbnail || product.image || product.images?.[0] || '',
      category: product.category || '',
      qrCode: product.qrCode || `QR-${product.id || '0000'}`,
      description: product.description || '',
      rating: product.rating || 0,
      stock: product.stock || 10,
      tags: product.tags || [],
      reviews: product.reviews || [],
      quantity: product.quantity || 1,
      // 💡 FIX 1: Add productId and productName for cart drawer display and logic
      productId: product.id || product._id,
      productName: product.title || product.name || 'Unnamed Product',
      // 💡 NEW: Initialize item as selected for checkout
      isSelected: true,
    };
    
    addToCart(productToAdd, product.quantity || 1);
    showSnackbar(`🚀 Redirecting to checkout with "${product.title || product.name}"`, 'info');
    
    // In a real app, navigate to checkout here
    console.log('Redirecting to checkout for product:', product.id);
    setQuickViewOpen(false);
  }, [addToCart, isLoggedIn]);

  const handleFilterChange = useCallback((filter: 'all' | 'popular' | 'new') => {
    console.log('🔘 Filter changed:', filter);
    setActiveFilter(filter);
  }, []);

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  // Handle header scroll effect to also update state
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50; // Check scroll threshold
      const header = document.querySelector('.sticky-header');
      const categories = document.querySelector('.sticky-categories');
      
      if (scrolled) {
        header?.classList.add('header-scrolled');
        categories?.classList.add('header-scrolled');
      } else {
        header?.classList.remove('header-scrolled');
        categories?.classList.remove('header-scrolled');
      }
      
      // Update state for AccountMenu component
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Log component state changes
  useEffect(() => {
    console.log('🔄 App state updated:', {
      searchTerm,
      selectedCategory,
      quickViewOpen,
      isLoadingProduct,
      cartCount,
      isScrolled
    });
  }, [searchTerm, selectedCategory, quickViewOpen, isLoadingProduct, cartCount, isScrolled]);


  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, #0A081F 0%, #1A173B 30%, #2A2660 70%, #3A3485 100%)`,
        backgroundAttachment: 'fixed',
        fontFamily: '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        // overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, ${alpha('#FF6B95', 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha('#7877C6', 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${alpha('#4ECDC4', 0.1)} 0%, transparent 50%)
          `,
          zIndex: 0,
        }
      }}
    >
      {/* Sticky Header */}
      <Box
        className="sticky-header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1300,
          width: '100%',
          backdropFilter: 'blur(20px)',
          backgroundColor: alpha('#0A081F', 0.95),
          borderBottom: '1px solid rgba(120, 119, 198, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
          '&.header-scrolled': {
            py: 1,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          }
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: 2,
            width: '100%',
            maxWidth: 1800,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            transition: 'padding 0.3s ease',
          }}
        >
          {/* Pass scroll state to AccountMenu */}
          <AccountMenu onSearch={handleSearch} scrolled={isScrolled} /> 
        </Container>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // TIGHTER LAYOUT - Reduced padding top/bottom
          py: { xs: 2, md: 3 }, 
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          zIndex: 1,
          minHeight: 'calc(100vh - 200px)',
          width: '100%',
          // REMOVED: overflow: 'hidden'
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            maxWidth: 1800,
            mx: 'auto',
            px: 0,
            width: '100%',
            // REMOVED: overflow: 'hidden'
          }}
        >
          <Grid container spacing={3} sx={{ 
            flexWrap: { xs: 'wrap', lg: 'nowrap' },
            width: '100%',
            alignItems: 'flex-start',
            position: 'relative',
          }}>
            {/* Left Sidebar - Categories - STICKY (Further Lower) */}
            <Grid 
              item 
              xs={12} 
              lg={2.5} 
              ref={categoriesRef}
              className="sticky-categories"
              sx={{ 
                flexShrink: 0,
                minWidth: { lg: 280 },
                maxWidth: { lg: 320 },
                width: { xs: '100%', lg: 'auto' },
                position: { lg: 'sticky' },
                // 🚀 MODIFIED: Increased base top position: 140 -> 160
                top: { lg: 160 }, 
                alignSelf: 'flex-start',
                height: 'fit-content',
                // 🚀 MODIFIED: Dynamic maxHeight: 100vh - 180px (160px top + 20px bottom margin)
                maxHeight: { lg: 'calc(100vh - 180px)' }, 
                overflowY: { lg: 'auto' },
                zIndex: 100,
                '&::-webkit-scrollbar': {
                  width: 6,
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 3,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(180deg, #F29F58 0%, #AB4459 100%)',
                  borderRadius: 3,
                },
                // 🚀 MODIFIED: Increased scrolled top position: 120 -> 140
                '&.header-scrolled': {
                  top: { lg: 140 },
                  // 🚀 MODIFIED: Dynamic maxHeight: 100vh - 160px (140px top + 20px bottom margin)
                  maxHeight: { lg: 'calc(100vh - 160px)' },
                },
                '&::-webkit-scrollbar': {
                  display: { xs: 'none', lg: 'block' },
                },
              }}
            >
              <CategoriesGrid onSelectCategory={handleCategorySelect} />
            </Grid>

            {/* RIGHT COLUMN - MAIN CONTENT */}
            <Grid item xs={12} lg={9.5} sx={{ 
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              width: '100%',
              pl: { lg: 1 },
            }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minWidth: 0,
                  width: '100%',
                  overflow: 'hidden',
                }}
              >
                {/* Picture Slide */}
                <Box sx={{
                  p: { xs: 2, md: 3 },
                  pb: 0,
                  height: 300,
                  flexShrink: 0, 
                  flex: '0 0 auto',
                  width: '100%',
                  minWidth: 0,
                }}>
                  <PictureSlide />
                </Box>

                {/* Stats */}
                <Box sx={{
                  mt: 4,
                  p: { xs: 2, md: 6 },
                  pt: 2,
                  flexShrink: 0,
                  width: '100%',
                  minWidth: 5,
                }}>
                  <QuickStatsPanel />
                </Box>

                {/* Products Container */}
                <Box
                  ref={productsSectionRef}
                  id="products-section"
                  sx={{
                    p: { xs: 2, md: 3 },
                    pt: 0,
                    flex: 1,
                    minHeight: '750px',
                    width: '100%',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    // 🚀 MODIFIED: Increased scroll-margin-top: 140px -> 160px
                    scrollMarginTop: '160px', 
                  }}
                >
                  <ProductSearch
                    searchTerm={searchTerm}
                    category={selectedCategory}
                    onProductClick={handleProductClick}
                    onQuickView={handleQuickView}
                    activeFilter={activeFilter}
                    onFilterChange={handleFilterChange}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 'auto', width: '100%' }}>
        <Footer />
      </Box>
      
      {/* Floating Buttons */}
      <FloatingActionButton />

      {/* 💡 FIXED: Cart Drawer - Now passes the quick view handler (onProductClick) */}
      <CartDrawerSimple onProductClick={handleQuickView} />

      {/* Quick View Modal - Replaced ProductDetailModal */}
      <QuickViewModal
        open={quickViewOpen}
        product={quickViewProduct}
        onClose={handleCloseQuickView}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isLoggedIn={isLoggedIn}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoadingProduct && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: alpha('#0A081F', 0.9),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  border: `3px solid ${alpha('#7877C6', 0.2)}`,
                  borderTopColor: '#7877C6',
                  margin: '0 auto 20px',
                }}
              />
              <Typography sx={{ 
                color: 'white', 
                fontSize: '0.875rem', 
                letterSpacing: '0.1em',
                fontWeight: 500 
              }}>
                Loading Luxury Details
              </Typography>
            </Box>
          </Box>
        )}
      </AnimatePresence>

      {/* MUI Snackbar for notifications - CENTERED BOTTOM */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ 
          // Center it at the bottom, above floating button
          bottom: { xs: 100, sm: 120 }, 
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'auto',
          minWidth: '300px',
          maxWidth: '90%',
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ 
            width: '100%',
            backgroundColor: snackbarSeverity === 'success' ? alpha('#4ECDC4', 0.95) :
                           snackbarSeverity === 'error' ? alpha('#FF6B95', 0.95) :
                           snackbarSeverity === 'warning' ? alpha('#F29F58', 0.95) :
                           alpha('#7877C6', 0.95),
            color: 'white',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${snackbarSeverity === 'success' ? alpha('#4ECDC4', 0.3) :
                     snackbarSeverity === 'error' ? alpha('#FF6B95', 0.3) :
                     snackbarSeverity === 'warning' ? alpha('#F29F58', 0.3) :
                     alpha('#7877C6', 0.3)}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            '& .MuiAlert-icon': {
              color: 'white',
            }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {snackbarMessage}
          </Typography>
        </Alert>
      </Snackbar>

    </Box>
  );
}

export default App;
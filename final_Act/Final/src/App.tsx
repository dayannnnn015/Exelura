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
import QuickViewModal from "./components/QuickViewModal"; 
import { useUserStore } from "./store/userStore";
import { GetProductDetails } from "./API/ProductsAPI";
import Typography from "@mui/material/Typography";
import { motion, AnimatePresence } from 'framer-motion';
import CartDrawerSimple from './components/SimpleCartDrawer';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// ✅ Added imports for routing
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MyProfilePage from './pages/MyProfilePage';
import ProfileSettingPage from './pages/ProfileSettingPage';



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
  const [isScrolled, setIsScrolled] = useState(false); 

  const productsSectionRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const { addToCart, isLoggedIn, cartCount } = useUserStore();

  useEffect(() => {
    console.log('🚀 Initializing store...');
    initializeStore();
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

  const handleProductClick = useCallback(async (productId: number) => {
    console.log('🟢 Product clicked, ID:', productId);
    setIsLoadingProduct(true);
    try {
      const productDetails = await GetProductDetails(productId);
      if (!productDetails.qrCode) productDetails.qrCode = `QR-${productId}`;
      setQuickViewProduct(productDetails);
      setQuickViewOpen(true);
    } catch (error) {
      console.error('❌ Error loading product details:', error);
      showSnackbar('Failed to load product details. Please try again.', 'error');
    } finally {
      setIsLoadingProduct(false);
    }
  }, []);

  const handleQuickView = useCallback(async (productId: number) => {
    console.log('🔍 Quick view for product ID:', productId);
    setIsLoadingProduct(true);
    try {
      const productDetails = await GetProductDetails(productId);
      if (!productDetails.qrCode) productDetails.qrCode = `QR-${productId}`;
      setQuickViewProduct(productDetails);
      setQuickViewOpen(true);
    } catch (error) {
      console.error('❌ Error loading quick view:', error);
      showSnackbar('Failed to load product details. Please try again.', 'error');
    } finally {
      setIsLoadingProduct(false);
    }
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setQuickViewOpen(false);
    setQuickViewProduct(null);
  }, []);

  const handleAddToCart = useCallback((product: any) => {
    if (!isLoggedIn) {
      showSnackbar('Please login to add items to cart', 'warning');
      return;
    }
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
      productId: product.id || product._id, 
      productName: product.title || product.name || 'Unnamed Product', 
      isSelected: true,
    };
    addToCart(productToAdd, product.quantity || 1);
    showSnackbar(`🎉 Added "${product.title || product.name}" to cart!`, 'success');
  }, [addToCart, isLoggedIn]);

  const handleBuyNow = useCallback((product: any) => {
    if (!isLoggedIn) {
      showSnackbar('Please login to proceed with purchase', 'warning');
      return;
    }
    handleAddToCart(product);
    showSnackbar(`🚀 Redirecting to checkout with "${product.title || product.name}"`, 'info');
    setQuickViewOpen(false);
  }, [handleAddToCart, isLoggedIn]);

  const handleFilterChange = useCallback((filter: 'all' | 'popular' | 'new') => {
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

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/my-profile" element={<MyProfilePage />} />
        <Route path="/profile-setting" element={<ProfileSettingPage />} />
        <Route path="/*" element={
          <Box
            sx={{
              minHeight: '100vh',
              background: `linear-gradient(180deg, #0A081F 0%, #1A173B 30%, #2A2660 70%, #3A3485 100%)`,
              backgroundAttachment: 'fixed',
              fontFamily: '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* --- KEEP ALL EXISTING CONTENT INSIDE THIS BOX --- */}

            

            {/* Sticky Header */}
            <Box className="sticky-header" sx={{/* existing header styles */}}>
              <Container maxWidth="xl" sx={{ py: 2, width: '100%', maxWidth: 1800, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
                <AccountMenu onSearch={(term) => handleSearch(term)} scrolled={isScrolled} />
              </Container>
            </Box>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, md: 3 }, px: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 200px)', width: '100%' }}>
              <Container maxWidth={false} sx={{ maxWidth: 1800, mx: 'auto', px: 0, width: '100%' }}>
                <Grid container spacing={3} sx={{ flexWrap: { xs: 'wrap', lg: 'nowrap' }, width: '100%', alignItems: 'flex-start', position: 'relative' }}>
                  <Grid item xs={12} lg={2.5} ref={categoriesRef} className="sticky-categories" sx={{/* existing categories styles */}}>
                    <CategoriesGrid onSelectCategory={handleCategorySelect} />
                  </Grid>

                  <Grid item xs={12} lg={9.5} sx={{ flex: 1, minWidth: 0, overflow: 'hidden', width: '100%', pl: { lg: 1 } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, width: '100%', overflow: 'hidden' }}>
                      <Box sx={{ p: { xs: 2, md: 3 }, pb: 0, height: 300, flexShrink: 0, flex: '0 0 auto', width: '100%', minWidth: 0 }}>
                        <PictureSlide />
                      </Box>

                      <Box sx={{ mt: 4, p: { xs: 2, md: 6 }, pt: 2, flexShrink: 0, width: '100%', minWidth: 5 }}>
                        <QuickStatsPanel />
                      </Box>

                      <Box ref={productsSectionRef} id="products-section" sx={{ p: { xs: 2, md: 3 }, pt: 0, flex: 1, minHeight: '750px', width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', scrollMarginTop: '160px' }}>
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
            <CartDrawerSimple onProductClick={handleQuickView} />
            <QuickViewModal
              open={quickViewOpen}
              product={quickViewProduct}
              onClose={handleCloseQuickView}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              isLoggedIn={isLoggedIn}
            />

            <AnimatePresence>
              {isLoadingProduct && (
                <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: alpha('#0A081F', 0.9), display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ width: 60, height: 60, borderRadius: '50%', border: `3px solid ${alpha('#7877C6', 0.2)}`, borderTopColor: '#7877C6', margin: '0 auto 20px' }}/>
                    <Typography sx={{ color: 'white', fontSize: '0.875rem', letterSpacing: '0.1em', fontWeight: 500 }}>Loading Luxury Details</Typography>
                  </Box>
                </Box>
              )}
            </AnimatePresence>

            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ bottom: { xs: 100, sm: 120 }, left: '50%', transform: 'translateX(-50%)', width: 'auto', minWidth: '300px', maxWidth: '90%' }}>
              <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%', backgroundColor: snackbarSeverity === 'success' ? alpha('#4ECDC4', 0.95) : snackbarSeverity === 'error' ? alpha('#FF6B95', 0.95) : snackbarSeverity === 'warning' ? alpha('#F29F58', 0.95) : alpha('#7877C6', 0.95), color: 'white', backdropFilter: 'blur(10px)', border: `1px solid ${snackbarSeverity === 'success' ? alpha('#4ECDC4', 0.3) : snackbarSeverity === 'error' ? alpha('#FF6B95', 0.3) : snackbarSeverity === 'warning' ? alpha('#F29F58', 0.3) : alpha('#7877C6', 0.3)}`, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', '& .MuiAlert-icon': { color: 'white' }}}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{snackbarMessage}</Typography>
              </Alert>
            </Snackbar>

          </Box>
        }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

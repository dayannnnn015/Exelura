import { Container, Box, Grid, alpha } from "@mui/material";
import ProductSearch from './components/ProductSearch';
import AccountMenu from "./components/AccountMenu";
import PictureSlide from "./components/PictureSlide"; 
import CategoriesGrid from "./components/CategoriesGrid";
import Footer from "./components/Footer";
import QuickStatsPanel from "./components/QuickStatPanel";
import FloatingActionButton from "./components/FloatingActionButton";
import { initializeStore } from "./store/userStore";
import { useEffect, useState, useRef } from "react";
import CartDrawer from "./components/cartDrawer";
import ProductDetailModal from "./components/ProductDetailModal";
import { useUserStore } from "./store/userStore";
import { GetProductDetails } from "./API/ProductsAPI";
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'new'>('all');
  
  const productsSectionRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  
  const { addToCart, isLoggedIn } = useUserStore();

  useEffect(() => {
    initializeStore();
  }, []);

  const handleSearch = (term: string) => {
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
  };

  const handleCategorySelect = (categorySlug: string) => {
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
  };

  const handleProductClick = async (productId: number) => {
    setIsLoadingProduct(true);
    try {
      const productDetails = await GetProductDetails(productId);
      setSelectedProduct(productDetails);
      setProductModalOpen(true);
    } catch (error) {
      console.error('Error loading product details:', error);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
  };

  const handleFilterChange = (filter: 'all' | 'popular' | 'new') => {
    setActiveFilter(filter);
  };

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
        overflow: 'hidden',
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
          }}
        >
          <AccountMenu onSearch={handleSearch} />
        </Container>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 0,
          py: { xs: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Container 
          maxWidth={false}
          sx={{
            maxWidth: 1800,
            mx: 'auto',
            px: 0,
          }}
        >
          <Grid container spacing={3}>
            
            {/* Left Sidebar */}
            <Grid item xs={12} lg={2.5}>
              <CategoriesGrid onSelectCategory={handleCategorySelect} />
            </Grid>

            {/* MAIN CONTENT BOX — FIXED STABLE HEIGHT */}
            {/* MAIN CONTENT BOX — FIXED STABLE HEIGHT */}
<Grid item xs={12} lg={9.5}>
  <Box
    sx={{
      backgroundColor: alpha('#FFFFFF', 0.03),
      backdropFilter: 'blur(40px)',
      borderRadius: { xs: 3, md: 4 },
      boxShadow: `
        0 4px 6px rgba(0, 0, 0, 0.1),
        0 1px 3px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.05)
      `,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      mb: 4,
      WebkitBackdropFilter: 'blur(40px)',
      
      /** 🔥 FIX: Use minHeight instead of height to prevent shrinking */
      minHeight: '900px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {/* Picture Slide */}
    <Box sx={{ 
      p: { xs: 2, md: 3 }, 
      pb: 0,
      flexShrink: 0, // Prevent shrinking
      height: 350,
    }}>
      <PictureSlide />
    </Box>

    {/* Stats */}
    <Box sx={{ 
      p: { xs: 2, md: 3 }, 
      pt: 2,
      flexShrink: 0, // Prevent shrinking
    }}>
      <QuickStatsPanel />
    </Box>

    {/* Products */}
    <Box 
      ref={productsSectionRef}
      sx={{ 
        p: { xs: 2, md: 3 },
        pt: 0,
        flex: 1, // Take remaining space
        minHeight: '400px', // Ensure minimum height
      }}
    >
      <ProductSearch 
        searchTerm={searchTerm} 
        category={selectedCategory}
        onProductClick={handleProductClick}
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
      <Footer />

      {/* Floating Buttons */}
      <FloatingActionButton />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Product Modal */}
      <ProductDetailModal
        open={productModalOpen}
        product={selectedProduct}
        onClose={() => setProductModalOpen(false)}
        onAddToCart={handleAddToCart}
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
              <Box sx={{ color: 'white', fontSize: '0.875rem', letterSpacing: '0.1em' }}>
                Loading Luxury Details
              </Box>
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
}

export default App;

import { Container, Box } from "@mui/material";
import ProductSearch from './components/ProductSearch';
import AccountMenu from "./components/AccountMenu";
import PictureSlide from "./components/PictureSlide"; 
import { initializeStore } from "./store/userStore";
import { useEffect, useState } from "react";
import CartDrawer from "./components/cartDrawer";

function App() {
  useEffect(() => {
    initializeStore();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1B1833 0%, #441752 25%, #AB4459 75%, #F29F58 100%)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* EXACT Sticky AccountMenu from first design */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          width: '100%',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(27, 24, 51, 0.1)',
          borderBottom: '1px solid rgba(27, 24, 51, 0.2)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Container maxWidth="xl" sx={{ 
          py: 1, // Minimal padding
          width: '100%',
          maxWidth: 1400, // Same max width as content
          mx: 'auto', // Center it
        }}>
          <AccountMenu 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </Container>
      </Box>
      
      {/* Main content with reduced top padding */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexGrow: 1,
          py: 2,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Content box */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 1400,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(171, 68, 89, 0.3)',
            p: { xs: 3, md: 6 },
            mb: 2,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          {/* PictureSlide */}
          <Box sx={{ mb: 4 }}>
            <PictureSlide />
          </Box>
          
          {/* ProductSearch */}
          <ProductSearch searchTerm={searchTerm} />

          {/* CartDrawer inside the main content box */}
          <CartDrawer />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
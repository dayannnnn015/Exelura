import { Container, Box } from "@mui/material";
import ProductSearch from './components/ProductSearch';
import AccountMenu from "./components/AccountMenu";
import { initializeStore } from "./store/userStore";
import { useEffect } from "react";

// ✅ Add the import
import CartDrawer from "./components/cartDrawer";

function App() {
  // Initialize store
  useEffect(() => {
    initializeStore();
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #f9d423 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container 
        maxWidth="xl"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1400,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            p: 4,
            mb: 4
          }}
        >
          <AccountMenu />
          <ProductSearch />
        </Box>
        
        {/* Cart Drawer Component (to be implemented) */}
        {/* <CartDrawer /> */}

        {/* ✅ ENABLED Cart Drawer */}
        <CartDrawer />
      </Container>
    </Box>
  );
}

export default App;

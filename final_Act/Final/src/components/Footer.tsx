// New Footer.tsx Component
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  TextField,
  Button,
  IconButton,
  Divider
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  Pinterest,
  YouTube,
  Email,
  Phone,
  LocationOn,
  Security,
  LocalShipping,
  VerifiedUser,
  SupportAgent
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1B1833',
        color: 'white',
        py: 8,
        borderTop: '1px solid rgba(242, 159, 88, 0.3)',
        mt: 'auto'
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={6}>
          {/* Brand Column (Kept) */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" fontWeight={800} sx={{ 
                background: 'linear-gradient(135deg, #F29F58 0%, #AB4459 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}>
                XELURA
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                Curating luxury experiences since 2010. We bring you the finest collections from around the world.
              </Typography>
            </Box>

            {/* Trust Badges (Kept) */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security sx={{ color: '#F29F58', fontSize: 20 }} />
                <Typography variant="caption">SSL Secure</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUser sx={{ color: '#F29F58', fontSize: 20 }} />
                <Typography variant="caption">Authentic</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShipping sx={{ color: '#F29F58', fontSize: 20 }} />
                <Typography variant="caption">Global Shipping</Typography>
              </Box>
            </Box>
          </Grid>

          {/* QUICK LINKS, HELP, and STAY CONNECTED columns have been removed */}
          
        </Grid>

        <Divider sx={{ my: 6, borderColor: 'rgba(242, 159, 88, 0.2)' }} />

        {/* Bottom Bar (Kept, includes Contact Details) */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            © 2024 XELURA Luxury E-commerce. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
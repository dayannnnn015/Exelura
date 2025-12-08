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
          {/* Brand Column */}
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

            {/* Trust Badges */}
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

          {/* Quick Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#F29F58' }}>
              SHOP
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['New Arrivals', 'Best Sellers', 'Luxury Brands', 'Clearance', 'Gift Cards'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#F29F58',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Help */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#F29F58' }}>
              HELP
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {['Contact Us', 'FAQ', 'Shipping Info', 'Returns', 'Privacy Policy'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#F29F58',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#F29F58' }}>
              STAY CONNECTED
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
              Subscribe to receive exclusive offers and luxury insights.
            </Typography>
            
            <Box component="form" sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField
                placeholder="Your email address"
                size="small"
                fullWidth
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(242, 159, 88, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#F29F58',
                    },
                  }
                }}
              />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#AB4459',
                  '&:hover': {
                    backgroundColor: '#F29F58',
                  },
                  minWidth: '120px'
                }}
              >
                Subscribe
              </Button>
            </Box>

            {/* Social Media */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {[Facebook, Twitter, Instagram, Pinterest, YouTube].map((Icon, index) => (
                <IconButton
                  key={index}
                  sx={{
                    backgroundColor: 'rgba(242, 159, 88, 0.1)',
                    color: '#F29F58',
                    '&:hover': {
                      backgroundColor: '#F29F58',
                      color: '#1B1833',
                    }
                  }}
                >
                  <Icon />
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, borderColor: 'rgba(242, 159, 88, 0.2)' }} />

        {/* Bottom Bar */}
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
              <SupportAgent sx={{ color: '#F29F58', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  24/7 Support
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  +1 (800) LUXURY
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email sx={{ color: '#F29F58', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Email Us
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  support@xelura.com
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
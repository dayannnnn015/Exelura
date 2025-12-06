import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ChevronLeft, ChevronRight, LocalShipping, Star, ShoppingBag, Discount } from '@mui/icons-material';

// --- STYLED COMPONENTS ---

const SlideContainer = styled(Box)(({ theme }) => ({
  // *** MODIFICATION START ***
  width: '100%',
  // Set a fixed maximum width for the entire component for your 1920x1200 screen
  maxWidth: 1200, // You can adjust this value (e.g., 1000, 1200, 1400)
  margin: '0 auto', // Center the fixed-width container
  // *** MODIFICATION END ***
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
  marginBottom: theme.spacing(4),
  border: '1px solid rgba(212, 175, 55, 0.2)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  overflow: 'hidden',
}));

const SideColumn = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const SideItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  border: '1px solid rgba(212, 175, 55, 0.1)',
  backgroundColor: '#FFFEF9',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(212, 175, 55, 0.15)',
    borderColor: '#D4AF37',
  },
}));

const MainSlide = styled(Box)(({ theme }) => ({
  height: 300,
  width:'360',
  background: 'linear-gradient(135deg, #D4AF37 0%, #F0EEB3 100%)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(4),
//   overflow: 'hidden',
}));

// --- SLIDE DATA (No changes needed here) ---

const slides = [
  {
    id: 1,
    title: '12.12 SALE',
    subtitle: 'MEGA DISCOUNT',
    description: 'Biggest sale of the year! Limited time offer',
    badge: '90% OFF',
    buttonText: 'SHOP NOW',
    color: '#D4AF37',
  },
  {
    id: 2,
    title: 'NEW ARRIVALS',
    subtitle: 'FRESH COLLECTION',
    description: 'Latest trends just arrived',
    badge: 'NEW',
    buttonText: 'EXPLORE',
    color: '#4CAF50',
  },
  {
    id: 3,
    title: 'CLEARANCE SALE',
    subtitle: 'LAST CHANCE',
    description: 'Final clearance on selected items',
    badge: '70% OFF',
    buttonText: 'GRAB DEALS',
    color: '#F44336',
  },
];

const leftSideItems = [
  {
    id: 1,
    title: 'Item Picking',
    subtitle: 'Smart Selection',
    description: 'Approved recommendation',
    icon: '識',
    color: '#D4AF37',
  },
  {
    id: 2,
    title: 'STATE BOOSTERS',
    subtitle: 'Performance Gear',
    description: 'Enhance your gaming experience',
    icon: '笞｡',
    color: '#2196F3',
  },
  {
    id: 3,
    title: 'SHEIN Brands',
    subtitle: 'Fashion Partner',
    description: 'Exclusive brand collaboration',
    icon: '送',
    color: '#9C27B0',
  },
  {
    id: 4,
    title: 'Albruth',
    subtitle: 'Premium Collection',
    description: 'Luxury home essentials',
    icon: '匠',
    color: '#795548',
  },
];

const rightSideItems = [
  {
    id: 1,
    title: 'Elenga',
    subtitle: 'Artisanal Crafts',
    description: 'Handmade unique items',
    icon: '耳',
    color: '#FF9800',
  },
  {
    id: 2,
    title: 'UP TO 90%',
    subtitle: 'Super Savings',
    description: 'Massive discounts live now',
    icon: '櫨',
    color: '#F44336',
  },
  {
    id: 3,
    title: 'Free Shipping',
    subtitle: 'Over $50',
    description: 'Limited Time',
    icon: <LocalShipping />,
    color: '#4CAF50',
  },
  {
    id: 4,
    title: 'Top Rated',
    subtitle: 'Customer Choice',
    description: '4.8/5 Stars',
    icon: <Star />,
    color: '#FFC107',
  },
];

// --- MAIN COMPONENT ---

const PictureSlide = () => { // Renamed to use PascalCase locally for convention
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto slide every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const currentSlideData = slides[currentSlide];

  return (
    <SlideContainer sx={{ }}>
      <Grid container>
        {/* Left Column - 3 columns on desktop, full width on mobile */}
        {/* *** MODIFICATION START: Adjusted md size to better fit fixed width *** */}
        <Grid item xs={12} md={3}> 
        {/* *** MODIFICATION END *** */}
          <SideColumn>
            {leftSideItems.map((item) => (
              <SideItem key={item.id}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      fontSize: 32,
                      lineHeight: 1,
                      color: item.color,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      minWidth: 40,
                      textAlign: 'center',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: '#333',
                        lineHeight: 1.2,
                        mb: 0.5,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: item.color,
                        fontSize: '0.9rem',
                        mb: 0.5,
                      }}
                    >
                      {item.subtitle}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        fontStyle: 'italic',
                        display: 'block',
                      }}
                    >
                      ({item.description})
                    </Typography>
                  </Box>
                </Box>
              </SideItem>
            ))}
          </SideColumn>
        </Grid>

        {/* Main Slideshow - 6 columns on desktop, full width on mobile */}
        {/* *** MODIFICATION START: Kept md size at 6 for the main content *** */}
        <Grid item xs={12} md={6}>
        {/* *** MODIFICATION END *** */}
          <MainSlide>
            {/* Navigation Buttons */}
            <IconButton
              onClick={prevSlide}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#D4AF37',
                '&:hover': {
                  backgroundColor: 'white',
                },
                zIndex: 2,
              }}
            >
              <ChevronLeft />
            </IconButton>

            <IconButton
              onClick={nextSlide}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#D4AF37',
                '&:hover': {
                  backgroundColor: 'white',
                },
                zIndex: 2,
              }}
            >
              <ChevronRight />
            </IconButton>

            {/* Slide Indicators */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1,
                zIndex: 2,
              }}
            >
              {slides.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: index === currentSlide ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'white',
                      transform: 'scale(1.2)',
                    },
                  }}
                />
              ))}
            </Box>

            {/* Slide Content */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {/* Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: 0,
                  backgroundColor: 'white',
                  color: currentSlideData.color,
                  padding: '8px 16px',
                  borderRadius: '20px 4px 20px 4px',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: `2px solid ${currentSlideData.color}`,
                }}
              >
                {currentSlideData.badge}
              </Box>

              {/* Title and Subtitle */}
              <Chip
                label={currentSlideData.title}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  mb: 2,
                  fontWeight: 700,
                  fontSize: '1rem',
                  height: 32,
                }}
              />
              
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: 'white',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {currentSlideData.subtitle}
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 4,
                  fontSize: '1.1rem',
                  maxWidth: '80%',
                }}
              >
                {currentSlideData.description}
              </Typography>

              {/* Action Button */}
              <Button
                variant="contained"
                startIcon={<ShoppingBag />}
                sx={{
                  backgroundColor: 'white',
                  color: currentSlideData.color,
                  fontWeight: 700,
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: 8,
                  '&:hover': {
                    backgroundColor: '#F8F8F8',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                  },
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                }}
              >
                {currentSlideData.buttonText}
              </Button>
            </Box>

            {/* Background Pattern */}
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '40%',
                background: `linear-gradient(45deg, ${currentSlideData.color}20, transparent)`,
                clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)',
                opacity: 0.3,
              }}
            />
          </MainSlide>
        </Grid>

        {/* Right Column - 3 columns on desktop, full width on mobile */}
        {/* *** MODIFICATION START: Adjusted md size to better fit fixed width *** */}
        <Grid item xs={12} md={3}>
        {/* *** MODIFICATION END *** */}
          <SideColumn>
            {rightSideItems.map((item) => (
              <SideItem key={item.id}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      color: item.color,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      minWidth: 40,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {typeof item.icon === 'string' ? (
                      <Box sx={{ fontSize: 32, lineHeight: 1 }}>{item.icon}</Box>
                    ) : (
                      React.cloneElement(item.icon, { sx: { fontSize: 32 } })
                    )}
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: '#333',
                        lineHeight: 1.2,
                        mb: 0.5,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: item.color,
                        fontSize: '0.9rem',
                        mb: 0.5,
                      }}
                    >
                      {item.subtitle}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        display: 'block',
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </Box>
              </SideItem>
            ))}
          </SideColumn>
        </Grid>
      </Grid>
    </SlideContainer>
  );
};

export default PictureSlide; // Changed to match component function name
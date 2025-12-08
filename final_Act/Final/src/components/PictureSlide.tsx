import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  alpha
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  FlashOn,
  LocalFireDepartment
} from '@mui/icons-material';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// MAIN CONTAINER - Fixed width and no shrink
const MainContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minWidth: '100%',
  maxWidth: '100%',
  flex: '0 0 auto',
  position: 'relative',
  height: 300,
  flexShrink: 0,
}));

const SlideContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  minWidth: '100%',
  maxWidth: '100%',
  height: 300,
  borderRadius: 24,
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(120, 119, 198, 0.3)',
  animation: `${fadeIn} 0.8s ease-out`,
  flexShrink: 0,
}));

const SlideContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(5),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  maxWidth: '60%',
  minWidth: '60%',
  [theme.breakpoints.down('md')]: {
    maxWidth: '80%',
    minWidth: '80%',
    padding: theme.spacing(3),
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '90%',
    minWidth: '90%',
    padding: theme.spacing(2),
  },
}));

const BackgroundPattern = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  width: '50%',
  minWidth: '50%',
  background: 'linear-gradient(45deg, rgba(120, 119, 198, 0.1) 0%, transparent 100%)',
  clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)',
  zIndex: 1,
}));

const slides = [
  {
    id: 1,
    title: 'PREMIUM COLLECTION',
    subtitle: 'Limited Edition',
    description: 'Exclusive luxury items curated for the discerning customer',
    badge: '70% OFF',
    buttonText: 'SHOP NOW',
    color: '#FF6B95',
    bgPattern: 'linear-gradient(135deg, rgba(255, 107, 149, 0.1) 0%, rgba(120, 119, 198, 0.1) 100%)',
    icon: <FlashOn />
  },
  {
    id: 2,
    title: 'NEW ARRIVALS',
    subtitle: 'Spring Collection',
    description: 'Fresh styles just arrived from top luxury brands',
    badge: 'NEW',
    buttonText: 'EXPLORE',
    color: '#4ECDC4',
    bgPattern: 'linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(69, 183, 209, 0.1) 100%)',
    icon: <LocalFireDepartment />
  },
  {
    id: 3,
    title: 'CLEARANCE SALE',
    subtitle: 'Final Reductions',
    description: 'Last chance to grab luxury items at unbelievable prices',
    badge: 'UP TO 90%',
    buttonText: 'GRAB DEALS',
    color: '#7877C6',
    bgPattern: 'linear-gradient(135deg, rgba(120, 119, 198, 0.1) 0%, rgba(69, 183, 209, 0.1) 100%)',
    icon: <LocalFireDepartment />
  },
];

const PictureSlide = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const currentSlideData = slides[currentSlide];

  return (
    <MainContainer>
      <SlideContainer>
        {/* Background Pattern */}
        <BackgroundPattern sx={{
          background: currentSlideData.bgPattern
        }} />

        {/* Floating Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            animation: `${float} 3s ease-in-out infinite`,
            zIndex: 1,
            opacity: 0.3,
            width: 100,
            minWidth: 100,
            height: 100,
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(currentSlideData.color, 0.3)} 0%, transparent 70%)`,
            }}
          />
        </Box>

        <SlideContent>
          {/* Badge */}
          <Chip
            label={currentSlideData.badge}
            icon={currentSlideData.icon}
            sx={{
              backgroundColor: alpha(currentSlideData.color, 0.2),
              color: currentSlideData.color,
              border: `1px solid ${alpha(currentSlideData.color, 0.3)}`,
              mb: 3,
              fontWeight: 700,
              fontSize: '0.75rem',
              height: 32,
              minHeight: 32,
              animation: `${fadeIn} 0.6s ease-out`,
              alignSelf: 'flex-start',
              backdropFilter: 'blur(10px)',
              flexShrink: 0,
            }}
          />

          {/* Title */}
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: 'white',
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 1,
              animation: `${fadeIn} 1s ease-out`,
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
              lineHeight: 1,
              flexShrink: 0,
              minWidth: '100%',
            }}
          >
            {currentSlideData.title}
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: alpha('#ffffff', 0.9),
              mb: 2,
              fontSize: { xs: '1.5rem', md: '2rem' },
              animation: `${fadeIn} 1.1s ease-out`,
              textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              lineHeight: 1.2,
              flexShrink: 0,
              minWidth: '100%',
            }}
          >
            {currentSlideData.subtitle}
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              color: alpha('#ffffff', 0.8),
              mb: 4,
              fontSize: '1.1rem',
              maxWidth: '80%',
              minWidth: '80%',
              animation: `${fadeIn} 1.2s ease-out`,
              fontWeight: 400,
              flexShrink: 0,
            }}
          >
            {currentSlideData.description}
          </Typography>

          {/* Action Button */}
          <Button
            variant="contained"
            startIcon={<ShoppingBag />}
            onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
            sx={{
              background: `linear-gradient(135deg, ${currentSlideData.color} 0%, ${alpha(currentSlideData.color, 0.8)} 100%)`,
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              px: 4,
              py: 1.5,
              borderRadius: 12,
              maxWidth: 200,
              minWidth: 200,
              width: 200,
              animation: `${fadeIn} 1.4s ease-out`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 24px ${alpha(currentSlideData.color, 0.4)}`,
                background: `linear-gradient(135deg, ${alpha(currentSlideData.color, 0.9)} 0%, ${alpha(currentSlideData.color, 0.7)} 100%)`,
              },
              boxShadow: `0 8px 20px ${alpha(currentSlideData.color, 0.3)}`,
              transition: 'all 0.3s ease',
              flexShrink: 0,
            }}
          >
            {currentSlideData.buttonText}
          </Button>
        </SlideContent>

        {/* Navigation Buttons */}
        <IconButton
          onClick={prevSlide}
          disabled={isAnimating}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: alpha('#ffffff', 0.15),
            backdropFilter: 'blur(10px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: 48,
            height: 48,
            minWidth: 48,
            minHeight: 48,
            '&:hover': {
              backgroundColor: alpha('#ffffff', 0.25),
              transform: 'translateY(-50%) scale(1.1)',
            },
            zIndex: 2,
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
        >
          <ChevronLeft />
        </IconButton>

        <IconButton
          onClick={nextSlide}
          disabled={isAnimating}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: alpha('#ffffff', 0.15),
            backdropFilter: 'blur(10px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: 48,
            height: 48,
            minWidth: 48,
            minHeight: 48,
            '&:hover': {
              backgroundColor: alpha('#ffffff', 0.25),
              transform: 'translateY(-50%) scale(1.1)',
            },
            zIndex: 2,
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
        >
          <ChevronRight />
        </IconButton>

        {/* Slide Indicators */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 2,
            flexShrink: 0,
            minWidth: 'auto',
          }}
        >
          {slides.map((_, index) => (
            <Box
              key={index}
              onClick={() => !isAnimating && setCurrentSlide(index)}
              sx={{
                width: index === currentSlide ? 24 : 8,
                minWidth: index === currentSlide ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index === currentSlide
                  ? currentSlideData.color
                  : alpha('#ffffff', 0.3),
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: index === currentSlide
                    ? alpha(currentSlideData.color, 0.8)
                    : alpha('#ffffff', 0.5),
                  transform: 'scale(1.2)',
                },
                flexShrink: 0,
              }}
            />
          ))}
        </Box>

        {/* Timer Progress */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            minWidth: '100%',
            height: 3,
            backgroundColor: alpha('#ffffff', 0.1),
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: '100%',
              minWidth: '100%',
              backgroundColor: currentSlideData.color,
              animation: 'timer 7s linear infinite',
              '@keyframes timer': {
                from: { transform: 'translateX(-100%)' },
                to: { transform: 'translateX(0%)' },
              },
            }}
          />
        </Box>
      </SlideContainer>
    </MainContainer>
  );
};

export default PictureSlide;
import React, { useState } from 'react';
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
import { ChevronLeft, ChevronRight } from '@mui/icons-material'; 

// --- STYLED COMPONENTS ---

const SlideContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '0 auto', 
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
  marginBottom: theme.spacing(0), 
  border: '1px solid rgba(212, 175, 55, 0.2)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  overflow: 'hidden',
}));

const MainSlide = styled(Box)(({ theme }) => ({
  height: 300,
  background: 'linear-gradient(135deg, #D4AF37 0%, #F0EEB3 100%)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(4),
}));

// ... (slides data - assume this is here)
const slides = [
  // ... (Your slides data)
  {
    title: "Seasonal Sale: 30% Off",
    subtitle: "Spring Collection",
    image: "...",
    color: "#D4AF37",
    buttonText: "Shop Now",
    chipText: "LIMITED TIME",
    description: "Discover new arrivals for the spring season."
  },
  {
    title: "New Tech Gadgets",
    subtitle: "Smart Devices",
    image: "...",
    color: "#4CAF50",
    buttonText: "Explore",
    chipText: "HOT",
    description: "The latest innovations in smart technology."
  }
];

// --- MAIN COMPONENT ---
const PictureSlide = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = slides.length;
  const slide = slides[currentSlide];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <SlideContainer elevation={0} >
      <Grid container>
        {/* Main Slide: now takes full width of its parent Grid item (lg=8) */}
        <Grid item xs={12}> 
          <MainSlide>
            {/* Chip */}
            <Chip 
              label={slide.chipText}
              size="small"
              sx={{ 
                bgcolor: slide.color, 
                color: '#fff', 
                fontWeight: 'bold', 
                mb: 1, 
                alignSelf: 'flex-start',
              }}
            />

            {/* Title & Subtitle */}
            <Typography 
              variant={isMobile ? "h4" : "h2"} 
              component="div"
              sx={{ 
                fontWeight: 800, 
                color: '#333',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                mb: 1,
              }}
            >
              {slide.title}
            </Typography>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              component="div"
              sx={{ 
                fontWeight: 600, 
                color: '#555',
                mb: 3,
              }}
            >
              {slide.subtitle}
            </Typography>

            {/* Button */}
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: slide.color,
                color: '#fff',
                fontWeight: 'bold',
                maxWidth: 200,
                transition: 'transform 0.2s',
                '&:hover': {
                  bgcolor: slide.color,
                  opacity: 0.9,
                  transform: 'scale(1.05)',
                },
              }}
            >
              {slide.buttonText}
            </Button>
            
            {/* Slide Navigation Buttons */}
            <IconButton 
              onClick={handlePrev}
              sx={{ 
                position: 'absolute', 
                left: 10, 
                top: '50%', 
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton 
              onClick={handleNext}
              sx={{ 
                position: 'absolute', 
                right: 10, 
                top: '50%', 
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
              }}
            >
              <ChevronRight />
            </IconButton>
            
            {/* Dots */}
            <Box sx={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
              {slides.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: index === currentSlide ? slide.color : 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: index === currentSlide ? '2px solid #fff' : 'none'
                  }}
                />
              ))}
            </Box>
            
          </MainSlide>
        </Grid>
        
        {/* The SideColumn Grid item was removed here */}

      </Grid>
    </SlideContainer>
  );
};

export default PictureSlide;
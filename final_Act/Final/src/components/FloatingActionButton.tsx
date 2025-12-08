// FloatingActionButton.tsx - Fixed with single trigger
import React from 'react';
import { Fab, Box, Tooltip, Badge, Snackbar, Alert } from '@mui/material';
import {
    ShoppingCart,

    ArrowUpward
} from '@mui/icons-material';
import { useUserStore } from '../store/userStore';

const FloatingActionButton = () => {
    const { cartCount, isLoggedIn } = useUserStore();
    const [showScrollTop, setShowScrollTop] = React.useState(false);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState("");
    const isOpeningCartRef = React.useRef(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCartClick = () => {
        if (isOpeningCartRef.current) return; // Prevent multiple clicks
        
        isOpeningCartRef.current = true;
        
        if (!isLoggedIn) {
            setSnackbarMessage('Please login to view your cart');
            setSnackbarOpen(true);
            isOpeningCartRef.current = false;
        } else {
            // Open the cart drawer
            const event = new Event('openCart');
            window.dispatchEvent(event);
            
            // Reset after 500ms
            setTimeout(() => {
                isOpeningCartRef.current = false;
            }, 500);
        }
    };

    return (
        <>
            <Box
                sx={{
                    position: 'fixed',
                    right: 32,
                    bottom: 32,
                    zIndex: 1100, // HIGHER THAN CART DRAWER
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    alignItems: 'flex-end'
                }}
            >
                {/* Scroll to Top */}
                {showScrollTop && (
                    <Tooltip title="Scroll to top" arrow>
                        <Fab
                            size="medium"
                            onClick={scrollToTop}
                            sx={{
                                background: 'linear-gradient(135deg, #FF6B95 0%, #7877C6 100%)',
                                color: 'white',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #7877C6 0%, #FF6B95 100%)',
                                }
                            }}
                        >
                            <ArrowUpward />
                        </Fab>
                    </Tooltip>
                )}

                {/* Cart Button */}
                <Tooltip title="View Cart" arrow>
                    <Badge
                        badgeContent={cartCount}
                        color="error"
                        overlap="circular"
                        sx={{
                            '& .MuiBadge-badge': {
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                minWidth: 20,
                                height: 20,
                                zIndex: 9998,
                            }
                        }}
                    >
                        <Fab
                            size="large"
                            onClick={handleCartClick}
                            sx={{
                                background: 'linear-gradient(135deg, #7877C6 0%, #302B63 100%)',
                                color: 'white',
                                width: 56,
                                height: 56,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #302B63 0%, #7877C6 100%)',
                                    transform: 'scale(1.05)',
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <ShoppingCart />
                        </Fab>
                    </Badge>
                </Tooltip>
            </Box>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{
                    zIndex: 1200, // HIGHEST Z-INDEX
                }}
            >
                <Alert 
                    onClose={() => setSnackbarOpen(false)} 
                    severity="info"
                    variant="filled"
                    sx={{
                        backgroundColor: '#1B1833',
                        color: 'white',
                        border: '1px solid rgba(120, 119, 198, 0.3)',
                        backdropFilter: 'blur(10px)',
                        fontWeight: 500,
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                            color: '#7877C6',
                        }
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default FloatingActionButton;
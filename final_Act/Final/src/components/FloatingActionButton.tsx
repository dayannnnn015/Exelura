// File: FloatingActionButton.tsx (New Component)
import React from 'react';
import { Fab, Box, Tooltip, Badge } from '@mui/material';
import {
    ShoppingCart,
    SupportAgent,
    Chat,
    ArrowUpward
} from '@mui/icons-material';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';

const FloatingActionButton = () => {
    const { openCart } = useCartStore();
    const { cartCount } = useUserStore();
    const [showScrollTop, setShowScrollTop] = React.useState(false);

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

    const handleSupportClick = () => {
        window.open('https://wa.me/1234567890', '_blank');
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                right: 32,
                bottom: 32,
                zIndex: 1000,
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

            {/* Support Chat */}
            <Tooltip title="Live Support" arrow>
                <Fab
                    size="medium"
                    onClick={handleSupportClick}
                    sx={{
                        background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                        color: 'white',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #44A08D 0%, #4ECDC4 100%)',
                        }
                    }}
                >
                    <Chat />
                </Fab>
            </Tooltip>

            {/* Support Agent */}
            <Tooltip title="Customer Support" arrow>
                <Fab
                    size="medium"
                    onClick={handleSupportClick}
                    sx={{
                        background: 'linear-gradient(135deg, #45B7D1 0%, #3498DB 100%)',
                        color: 'white',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #3498DB 0%, #45B7D1 100%)',
                        }
                    }}
                >
                    <SupportAgent />
                </Fab>
            </Tooltip>

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
                        }
                    }}
                >
                    <Fab
                        size="large"
                        onClick={openCart}
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
    );
};

export default FloatingActionButton;
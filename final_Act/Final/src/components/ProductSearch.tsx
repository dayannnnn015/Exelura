import { useCallback, useEffect, useState, useRef } from "react";
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "../configs/constants";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Grid,
    Pagination,
    Typography,
    Button,
    Alert,
    Snackbar,
    Skeleton,
    Rating,
    Stack,
    alpha,
    IconButton,
    Tooltip,
    Paper,
    Fade,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import {
    ShoppingCart,
    Visibility,
    TrendingUp,
    Inventory,
    FlashOn,
    GridView,
    ViewList,
    ArrowForward,
    Diamond,
    Bolt,
} from "@mui/icons-material";
import { SearchProducts } from "../API/ProductsAPI";
import { useUserStore } from "../store/userStore";
import { motion, AnimatePresence } from 'framer-motion';

const usdFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

interface ProductSearchProps {
    searchTerm: string;
    category?: string;
    onProductClick: (productId: number) => void;
    onQuickView: (productId: number) => void; // Add this prop
    activeFilter: 'all' | 'popular' | 'new';
    onFilterChange: (filter: 'all' | 'popular' | 'new') => void;
}

const ProductSearch = ({ 
    searchTerm, 
    category = '', 
    onProductClick, 
    onQuickView, // Add this prop
    activeFilter, 
    onFilterChange 
}: ProductSearchProps) => {
    const [products, setProducts] = useState<any[]>([]);
    const [page, setPage] = useState(DEFAULT_PAGE);
    const [perPage] = useState(DEFAULT_PER_PAGE);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
    const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

    const { isLoggedIn, addToCart } = useUserStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleSearchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const { page: updatedPage, perPage: updatePerPage, products, total, lastPage } =
                await SearchProducts({
                    searchKey: searchTerm,
                    category,
                    page,
                    perPage
                });

            // Apply filters and sorting
            let filteredProducts = [...products];

            // Apply active filter
            if (activeFilter === 'popular') {
                filteredProducts = filteredProducts.filter(p => p.rating >= 4);
            } else if (activeFilter === 'new') {
                filteredProducts = filteredProducts.filter(p => 
                    p.tags?.includes('new') || p.tags?.includes('new-arrival') || 
                    p.category?.toLowerCase().includes('new') || 
                    p.id > 90 // Simulate new products
                );
            }

            // Apply sorting
            filteredProducts.sort((a, b) => {
                switch (sortBy) {
                    case 'price-low':
                        return a.price - b.price;
                    case 'price-high':
                        return b.price - a.price;
                    case 'rating':
                        return b.rating - a.rating;
                    default:
                        return 0;
                }
            });

            setProducts(filteredProducts);
            setPage(updatedPage);
            setTotal(total);
            setPages(lastPage);
        } catch (error) {
            console.error('Error searching products:', error);
            setProducts([]);
            setTotal(0);
            setPages(0);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, category, page, perPage, activeFilter, sortBy]);

    useEffect(() => {
        handleSearchProducts();
    }, [handleSearchProducts]);

    useEffect(() => {
        // Reset to first page when search term or category changes
        setPage(DEFAULT_PAGE);
    }, [searchTerm, category]);

    const handleProductClick = useCallback((productId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onProductClick(productId);
    }, [onProductClick]);

    const handleQuickView = useCallback((productId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onQuickView(productId);
    }, [onQuickView]);

    const handleAddToCart = (product: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) {
            setSnackbarMessage('Please login to add items to your cart');
            setSnackbarOpen(true);
            return;
        }

        const productToAdd = {
            id: product.id,
            title: product.title,
            description: product.description || '',
            price: product.price || 0,
            discountPercentage: product.discountPercentage || 0,
            rating: product.rating || 0,
            stock: product.stock || 0,
            tags: product.tags || [],
            thumbnail: product.thumbnail || '',
            category: product.category || '',
            qrCode: product.qrCode || '',
            reviews: product.reviews || []
        };

        addToCart(productToAdd, 1);
        setSnackbarMessage(`🎉 Added "${product.title.substring(0, 30)}..." to cart!`);
        setSnackbarOpen(true);
    };

    const handleBuyNow = (product: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) {
            setSnackbarMessage('Please login to proceed with purchase');
            setSnackbarOpen(true);
            return;
        }

        // First add to cart
        const productToAdd = {
            id: product.id,
            title: product.title,
            description: product.description || '',
            price: product.price || 0,
            discountPercentage: product.discountPercentage || 0,
            rating: product.rating || 0,
            stock: product.stock || 0,
            tags: product.tags || [],
            thumbnail: product.thumbnail || '',
            category: product.category || '',
            qrCode: product.qrCode || '',
            reviews: product.reviews || []
        };

        addToCart(productToAdd, 1);

        // Show success message
        setSnackbarMessage(`🚀 Ready to checkout with "${product.title.substring(0, 30)}..."!`);
        setSnackbarOpen(true);

        // In a real app, you would navigate to checkout page here
        setTimeout(() => {
            console.log('Redirecting to checkout for product:', product.id);
        }, 1000);
    };

    const getCardHeight = () => {
        if (viewMode === 'grid') {
            if (isMobile) return 380;
            if (isTablet) return 400;
            return 420;
        } else {
            return 160;
        }
    };

    const renderProductCard = (product: any) => {
        const cardHeight = getCardHeight();
        const discountPrice = product.price * (1 - product.discountPercentage / 100);

        return (
            <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: cardHeight,
                }}
            >
                <Card
                    className="product-card"
                    elevation={0}
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    onClick={(e) => handleProductClick(product.id, e)}
                    sx={{
                        width: '100%',
                        height: '100%',
                        minHeight: cardHeight,
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: alpha('#FFFFFF', 0.05),
                        backdropFilter: 'blur(20px)',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        flex: 1,
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            borderColor: alpha('#7877C6', 0.6),
                            boxShadow: '0 8px 32px rgba(120, 119, 198, 0.2)',
                        },
                        WebkitBackdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Discount Badge */}
                    {product.discountPercentage > 0 && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                zIndex: 2,
                                px: 1,
                                py: 0.5,
                                background: 'linear-gradient(135deg, #FF6B95 0%, #7877C6 100%)',
                                color: 'white',
                                borderRadius: 1,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                            }}
                        >
                            -{product.discountPercentage}%
                        </Box>
                    )}

                    {/* Quick View Button */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            zIndex: 2,
                            opacity: hoveredProduct === product.id ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                        }}
                    >
                        <Tooltip title="Quick View" arrow>
                            <IconButton
                                size="small"
                                onClick={(e) => handleQuickView(product.id, e)}
                                sx={{
                                    backgroundColor: alpha('#FFFFFF', 0.15),
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: alpha('#7877C6', 0.3),
                                    }
                                }}
                            >
                                <Visibility fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Product Image - Fixed Aspect Ratio */}
                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: '75%', // 4:3 aspect ratio
                            flexShrink: 0,
                            backgroundColor: alpha('#FFFFFF', 0.03),
                        }}
                    >
                        <CardMedia
                            component="img"
                            image={product.thumbnail}
                            alt={product.title}
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                        
                        {/* New Product Badge */}
                        {(product.tags?.includes('new') || product.tags?.includes('new-arrival')) && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 12,
                                    left: product.discountPercentage > 0 ? 50 : 12,
                                    zIndex: 2,
                                    px: 1,
                                    py: 0.5,
                                    background: 'linear-gradient(135deg, #4ECDC4 0%, #2BBBAD 100%)',
                                    color: 'white',
                                    borderRadius: 1,
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                }}
                            >
                                NEW
                            </Box>
                        )}
                    </Box>

                    {/* Card Content */}
                    <CardContent
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            p: 1.5,
                            gap: 1,
                            '&:last-child': {
                                pb: 1.5,
                            }
                        }}
                    >
                        {/* Category */}
                        <Chip
                            label={product.category}
                            size="small"
                            sx={{
                                alignSelf: 'flex-start',
                                fontSize: '0.65rem',
                                height: 20,
                                backgroundColor: alpha('#7877C6', 0.1),
                                color: '#7877C6',
                                fontWeight: 600,
                            }}
                        />

                        {/* Title */}
                        <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            sx={{
                                color: 'white',
                                height: 40,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                fontSize: isMobile ? '0.8rem' : '0.875rem',
                                lineHeight: 1.3,
                            }}
                        >
                            {product.title}
                        </Typography>

                        {/* Rating & Stock */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Rating value={product.rating} size="small" readOnly sx={{ fontSize: '1rem' }} />
                                <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                                    ({product.rating?.toFixed(1)})
                                </Typography>
                            </Box>
                            <Chip
                                icon={<Inventory fontSize="small" />}
                                label={`${product.stock}`}
                                size="small"
                                sx={{
                                    fontSize: '0.6rem',
                                    height: 18,
                                    backgroundColor: product.stock > 10 ? alpha('#4CAF50', 0.2) : alpha('#FF9800', 0.2),
                                    color: product.stock > 10 ? '#4CAF50' : '#FF9800',
                                }}
                            />
                        </Box>

                        {/* Price */}
                        <Box sx={{ mt: 'auto' }}>
                            {product.discountPercentage > 0 ? (
                                <>
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                        sx={{ color: '#FF6B95', fontSize: isMobile ? '1rem' : '1.1rem' }}
                                    >
                                        {usdFormatted.format(discountPrice)}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ textDecoration: 'line-through', color: alpha('#FFFFFF', 0.4) }}
                                    >
                                        {usdFormatted.format(product.price)}
                                    </Typography>
                                </>
                            ) : (
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{ color: 'white', fontSize: isMobile ? '1rem' : '1.1rem' }}
                                >
                                    {usdFormatted.format(product.price)}
                                </Typography>
                            )}
                        </Box>

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<ShoppingCart sx={{ fontSize: 16 }} />}
                                onClick={(e) => handleAddToCart(product, e)}
                                sx={{
                                    flex: 1,
                                    fontSize: isMobile ? '0.65rem' : '0.7rem',
                                    py: 0.5,
                                    background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                                    textTransform: 'none',
                                    minWidth: 0,
                                    whiteSpace: 'nowrap',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5A59A1 0%, #7877C6 100%)',
                                    }
                                }}
                            >
                                {isMobile ? 'Cart' : 'Add to Cart'}
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<Bolt sx={{ fontSize: 16 }} />}
                                onClick={(e) => handleBuyNow(product, e)}
                                sx={{
                                    flex: 1,
                                    fontSize: isMobile ? '0.65rem' : '0.7rem',
                                    py: 0.5,
                                    background: 'linear-gradient(135deg, #FF6B95 0%, #FF5252 100%)',
                                    textTransform: 'none',
                                    minWidth: 0,
                                    whiteSpace: 'nowrap',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #FF5252 0%, #FF6B95 100%)',
                                    }
                                }}
                            >
                                {isMobile ? 'Buy' : 'Buy Now'}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    const renderListProduct = (product: any) => {
        const discountPrice = product.price * (1 - product.discountPercentage / 100);

        return (
            <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
            >
                <Paper
                    elevation={0}
                    onClick={(e) => handleProductClick(product.id, e)}
                    sx={{
                        mb: 2,
                        p: 2,
                        backgroundColor: alpha('#FFFFFF', 0.05),
                        backdropFilter: 'blur(20px)',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        gap: 2,
                        '&:hover': {
                            borderColor: alpha('#7877C6', 0.6),
                            backgroundColor: alpha('#7877C6', 0.05),
                            transform: 'translateX(4px)',
                        },
                        WebkitBackdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Image */}
                    <Box
                        sx={{
                            width: isMobile ? '100%' : 120,
                            height: isMobile ? 120 : 120,
                            flexShrink: 0,
                            borderRadius: 1,
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <CardMedia
                            component="img"
                            image={product.thumbnail}
                            alt={product.title}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                        
                        {/* Quick View Button for List View */}
                        <Tooltip title="Quick View" arrow>
                            <IconButton
                                size="small"
                                onClick={(e) => handleQuickView(product.id, e)}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    backgroundColor: alpha('#FFFFFF', 0.15),
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: alpha('#7877C6', 0.3),
                                    }
                                }}
                            >
                                <Visibility fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ mb: 1 }}>
                            <Chip
                                label={product.category}
                                size="small"
                                sx={{
                                    mb: 0.5,
                                    fontSize: '0.65rem',
                                    height: 20,
                                    backgroundColor: alpha('#7877C6', 0.1),
                                    color: '#7877C6',
                                }}
                            />
                            <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                sx={{
                                    color: 'white',
                                    mb: 0.5,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {product.title}
                            </Typography>
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{
                                color: alpha('#FFFFFF', 0.7),
                                mb: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            {product.description}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            <Rating value={product.rating} size="small" readOnly />
                            <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                                {product.rating?.toFixed(1)}
                            </Typography>
                            <Chip
                                icon={<Inventory fontSize="small" />}
                                label={`${product.stock} in stock`}
                                size="small"
                                sx={{
                                    fontSize: '0.65rem',
                                    backgroundColor: product.stock > 10 ? alpha('#4CAF50', 0.2) : alpha('#FF9800', 0.2),
                                    color: product.stock > 10 ? '#4CAF50' : '#FF9800',
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Price and Actions */}
                    <Box
                        sx={{
                            width: isMobile ? '100%' : 150,
                            flexShrink: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMobile ? 'flex-start' : 'flex-end',
                        }}
                    >
                        <Box sx={{ mb: 1, width: '100%' }}>
                            {product.discountPercentage > 0 ? (
                                <>
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                        sx={{ color: '#FF6B95', textAlign: isMobile ? 'left' : 'right' }}
                                    >
                                        {usdFormatted.format(discountPrice)}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            textDecoration: 'line-through',
                                            color: alpha('#FFFFFF', 0.4),
                                            textAlign: isMobile ? 'left' : 'right',
                                        }}
                                    >
                                        {usdFormatted.format(product.price)}
                                    </Typography>
                                </>
                            ) : (
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{ color: 'white', textAlign: isMobile ? 'left' : 'right' }}
                                >
                                    {usdFormatted.format(product.price)}
                                </Typography>
                            )}
                        </Box>

                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ width: '100%', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}
                        >
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<ShoppingCart sx={{ fontSize: 14 }} />}
                                onClick={(e) => handleAddToCart(product, e)}
                                sx={{
                                    fontSize: '0.7rem',
                                    py: 0.5,
                                    px: 1,
                                    background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                                    textTransform: 'none',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Add
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<Bolt sx={{ fontSize: 14 }} />}
                                onClick={(e) => handleBuyNow(product, e)}
                                sx={{
                                    fontSize: '0.7rem',
                                    py: 0.5,
                                    px: 1,
                                    background: 'linear-gradient(135deg, #FF6B95 0%, #FF5252 100%)',
                                    textTransform: 'none',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Buy
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </motion.div>
        );
    };

    return (
        <Box
            ref={containerRef}
            sx={{
                minHeight: 600,
                width: "100%",
            }}
        >
            {/* Results Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ mb: 3 }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                        mb: 2,
                    }}>
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="white" gutterBottom>
                                {searchTerm
                                    ? `Search: "${searchTerm}"`
                                    : category
                                        ? `${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}`
                                        : 'Premium Collection'
                                }
                            </Typography>
                            <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.7) }}>
                                <Box component="span" sx={{ color: '#FF6B95', fontWeight: 600 }}>{total}</Box> items found
                            </Typography>
                        </Box>

                        {/* Controls */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flexWrap: 'wrap',
                        }}>
                            {/* View Mode Toggle */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 0.5,
                                    backgroundColor: alpha('#FFFFFF', 0.05),
                                    borderRadius: 1.5,
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    display: 'flex',
                                }}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => setViewMode('grid')}
                                    sx={{
                                        color: viewMode === 'grid' ? '#7877C6' : alpha('#FFFFFF', 0.5),
                                        backgroundColor: viewMode === 'grid' ? alpha('#7877C6', 0.1) : 'transparent',
                                        borderRadius: 1,
                                        '&:hover': {
                                            backgroundColor: alpha('#7877C6', 0.2),
                                        }
                                    }}
                                >
                                    <GridView fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => setViewMode('list')}
                                    sx={{
                                        color: viewMode === 'list' ? '#7877C6' : alpha('#FFFFFF', 0.5),
                                        backgroundColor: viewMode === 'list' ? alpha('#7877C6', 0.1) : 'transparent',
                                        borderRadius: 1,
                                        '&:hover': {
                                            backgroundColor: alpha('#7877C6', 0.2),
                                        }
                                    }}
                                >
                                    <ViewList fontSize="small" />
                                </IconButton>
                            </Paper>

                            {/* Sort Dropdown */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 0.5,
                                    backgroundColor: alpha('#FFFFFF', 0.05),
                                    borderRadius: 1.5,
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    minWidth: 120,
                                }}
                            >
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    style={{
                                        width: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'white',
                                        padding: '6px 8px',
                                        outline: 'none',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option value="featured" style={{ backgroundColor: '#1A173B' }}>Featured</option>
                                    <option value="price-low" style={{ backgroundColor: '#1A173B' }}>Price: Low to High</option>
                                    <option value="price-high" style={{ backgroundColor: '#1A173B' }}>Price: High to Low</option>
                                    <option value="rating" style={{ backgroundColor: '#1A173B' }}>Top Rated</option>
                                </select>
                            </Paper>
                        </Box>
                    </Box>

                    {/* Filter Chips */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {['all', 'popular', 'new'].map((filter) => (
                            <Chip
                                key={filter}
                                label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                                onClick={() => onFilterChange(filter as any)}
                                icon={filter === 'popular' ? <TrendingUp /> : filter === 'new' ? <FlashOn /> : undefined}
                                size="small"
                                sx={{
                                    backgroundColor: activeFilter === filter
                                        ? alpha(
                                            filter === 'all' ? '#7877C6' : 
                                            filter === 'popular' ? '#FF6B95' : 
                                            '#4ECDC4', 0.2)
                                        : alpha('#FFFFFF', 0.05),
                                    color: activeFilter === filter
                                        ? filter === 'all' ? '#7877C6' : 
                                          filter === 'popular' ? '#FF6B95' : 
                                          '#4ECDC4'
                                        : alpha('#FFFFFF', 0.6),
                                    border: `1px solid ${activeFilter === filter
                                        ? alpha(
                                            filter === 'all' ? '#7877C6' : 
                                            filter === 'popular' ? '#FF6B95' : 
                                            '#4ECDC4', 0.3)
                                        : 'rgba(255, 255, 255, 0.08)'
                                        }`,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </motion.div>

            {/* Products Grid/List */}
            <Box>
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Grid container spacing={2}>
                                {Array.from(new Array(isMobile ? 4 : 8)).map((_, index) => (
                                    <Grid
                                        item
                                        xs={6}
                                        sm={4}
                                        md={4}
                                        lg={3}
                                        key={index}
                                        sx={{ minHeight: getCardHeight() }}
                                    >
                                        <Skeleton
                                            variant="rectangular"
                                            height={getCardHeight()}
                                            sx={{ borderRadius: 2 }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    ) : products.length > 0 ? (
                        <motion.div
                            key="products"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {viewMode === 'grid' ? (
                                <Grid container spacing={2}>
                                    {products.map((product) => (
                                        <Grid
                                            item
                                            xs={6}
                                            sm={4}
                                            md={4}
                                            lg={3}
                                            key={product.id}
                                            sx={{
                                                display: 'flex',
                                                minHeight: getCardHeight(),
                                            }}
                                        >
                                            {renderProductCard(product)}
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box>
                                    {products.map((product) => renderListProduct(product))}
                                </Box>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${alpha('#7877C6', 0.1)} 0%, ${alpha('#FF6B95', 0.1)} 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 3,
                                    }}
                                >
                                    <Diamond sx={{ fontSize: 36, color: alpha('#7877C6', 0.5) }} />
                                </Box>
                                <Typography variant="h6" fontWeight={600} color="white" gutterBottom>
                                    No products found
                                </Typography>
                                <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.6), mb: 3, maxWidth: 400, mx: 'auto' }}>
                                    {searchTerm
                                        ? `We couldn't find any products matching "${searchTerm}"`
                                        : 'Try adjusting your filters or browse our categories'
                                    }
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<ArrowForward />}
                                    onClick={() => {
                                        onFilterChange('all');
                                        setSortBy('featured');
                                    }}
                                    sx={{
                                        background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                                        color: 'white',
                                        fontWeight: 600,
                                        px: 3,
                                        py: 1,
                                        borderRadius: 1.5,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    Browse All Products
                                </Button>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>

            {/* Pagination */}
            {pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 3 }}>
                    <Pagination
                        page={page}
                        count={pages}
                        onChange={(_event, newPage) => setPage(newPage)}
                        shape="rounded"
                        size={isMobile ? "small" : "medium"}
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: alpha('#FFFFFF', 0.7),
                                backgroundColor: alpha('#FFFFFF', 0.05),
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                '&:hover': {
                                    backgroundColor: alpha('#7877C6', 0.2),
                                },
                                '&.Mui-selected': {
                                    background: 'linear-gradient(135deg, #7877C6 0%, #FF6B95 100%)',
                                    color: 'white',
                                    border: 'none',
                                }
                            }
                        }}
                    />
                </Box>
            )}

            {/* Snackbar Notification */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                TransitionComponent={Fade}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity="success"
                    variant="filled"
                    sx={{
                        backgroundColor: '#1A173B',
                        color: 'white',
                        border: '1px solid rgba(120, 119, 198, 0.3)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 1.5,
                        '& .MuiAlert-icon': {
                            color: '#4ECDC4',
                        }
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Loading Indicator */}
            {isLoading && (
                <Box sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    pointerEvents: 'none',
                }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <CircularProgress
                            size={48}
                            thickness={4}
                            sx={{
                                color: '#7877C6',
                            }}
                        />
                    </motion.div>
                </Box>
            )}
        </Box>
    );
};

export default ProductSearch;
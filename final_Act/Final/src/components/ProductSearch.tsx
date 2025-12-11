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
    Select,
    MenuItem,
    FormControl,
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
    Sort,
} from "@mui/icons-material";
import { SearchProducts } from "../API/ProductsAPI";
import { useUserStore } from "../store/userStore";
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutPopover from "./CheckoutPopover";

const usdFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

interface ProductSearchProps {
    searchTerm: string;
    category?: string;
    onProductClick: (productId: number) => void;
    onQuickView: (productId: number) => void;
    activeFilter: 'all' | 'popular' | 'new';
    onFilterChange: (filter: 'all' | 'popular' | 'new') => void;
}

const ProductSearch = ({
    searchTerm,
    category = '',
    onProductClick,
    onQuickView,
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
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [checkoutAnchorEl, setCheckoutAnchorEl] = useState<HTMLElement | null>(null);
    const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
    const [checkoutTotal, setCheckoutTotal] = useState(0);

    const { isLoggedIn, addToCart } = useUserStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    
    // Responsive breakpoints
    const isExtraLarge = useMediaQuery(theme.breakpoints.up('xl')); // ≥1536px
    const isLarge = useMediaQuery(theme.breakpoints.between('lg', 'xl')); // 1200-1535px
    const isMedium = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900-1199px
    const isSmall = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600-899px
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // ≤599px
    const isSmallMobile = useMediaQuery('(max-width: 480px)');
    
    // Define categories that should NOT show pagination (single page categories)
    const categoriesWithoutPagination = [
        'laptop', 'laptops', 'furniture', 'electronics', 'smartphones', 
        'watches', 'jewelry', 'sunglasses', 'bags', 'shoes'
    ];
    
    // Check if current category should hide pagination
    const shouldShowPagination = () => {
        // If we're in a category view and it's in our no-pagination list, hide pagination
        if (category && categoriesWithoutPagination.includes(category.toLowerCase())) {
            return false;
        }
        // Show pagination for overall search or other categories
        return pages > 1;
    };

    // Consistent grid columns for ALL categories
    const getGridColumns = () => {
        if (isExtraLarge) return 5;    // ≥1536px
        if (isLarge) return 4;         // 1200-1535px
        if (isMedium) return 3;        // 900-1199px
        if (isSmall) return 2;         // 600-899px
        if (isMobile) return 2;        // ≤599px
        return 2;
    };

    const getGridSpacing = () => {
        if (isMobile) return 1.5;
        if (isSmall) return 2;
        if (isMedium) return 2.5;
        if (isLarge) return 3;
        return 3.5;
    };

    const getCardPadding = () => {
        if (isMobile) return 1;
        if (isSmall) return 1.25;
        if (isMedium) return 1.5;
        return 1.75;
    };

    // Consistent card height for ALL categories
    const getCardHeight = () => {
        if (viewMode === 'grid') {
            if (isMobile) return 320;
            if (isSmall) return 360;
            if (isMedium) return 380;
            return 400;
        } else {
            return 160;
        }
    };

    // Consistent aspect ratio for ALL categories (4:3)
    const getAspectRatio = () => {
        return isMobile ? (isSmallMobile ? '100%' : '75%') : '75%';
    };

    const handleSearchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            // For categories without pagination, always show all products (page 1 with large perPage)
            const currentPage = category && categoriesWithoutPagination.includes(category.toLowerCase()) 
                ? 1 
                : page;
            const currentPerPage = category && categoriesWithoutPagination.includes(category.toLowerCase()) 
                ? 50 // Show more items for single-page categories
                : perPage;

            const { page: updatedPage, perPage: updatePerPage, products, total, lastPage } =
                await SearchProducts({
                    searchKey: searchTerm,
                    category,
                    page: currentPage,
                    perPage: currentPerPage
                });

            let filteredProducts = [...products];

            // Apply active filter
            if (activeFilter === 'popular') {
                filteredProducts = filteredProducts.filter(p => p.rating >= 4);
            } else if (activeFilter === 'new') {
                filteredProducts = filteredProducts.filter(p =>
                    p.tags?.includes('new') || p.tags?.includes('new-arrival') ||
                    p.category?.toLowerCase().includes('new') ||
                    p.id > 90
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
        setSnackbarMessage(`Added "${product.title.substring(0, 30)}..." to cart!`);
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

        const cartItem = {
            id: Date.now(),
            productId: product.id,
            productName: product.title,
            quantity: 1,
            price: product.discountPercentage ?
                product.price * (1 - product.discountPercentage / 100) :
                product.price,
            thumbnail: product.thumbnail,
            discountPercentage: product.discountPercentage || 0,
            category: product.category || '',
            isSelected: true
        };

        setCheckoutItems([cartItem]);
        setCheckoutTotal(cartItem.price * cartItem.quantity);
        setCheckoutAnchorEl(e.currentTarget as HTMLElement);
        setCheckoutOpen(true);
        setSnackbarMessage(`Opening checkout for "${product.title.substring(0, 30)}..."!`);
        setSnackbarOpen(true);
    };

    const handleCheckoutClose = () => {
        setCheckoutOpen(false);
        setCheckoutAnchorEl(null);
        setCheckoutItems([]);
        setCheckoutTotal(0);
    };

    const renderProductCard = (product: any) => {
        const discountPrice = product.price * (1 - product.discountPercentage / 100);
        const cardHeight = getCardHeight();
        const cardPadding = getCardPadding();
        const aspectRatio = getAspectRatio();

        return (
            <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -4 }}
                style={{ width: '100%', height: '100%' }}
            >
                <Card
                    elevation={0}
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    onClick={(e) => handleProductClick(product.id, e)}
                    sx={{
                        width: '100%',
                        // Removed height: '100%' here to resolve grid size inconsistency due to flex/height conflict
                        minHeight: cardHeight,
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: alpha('#FFFFFF', 0.08),
                        backdropFilter: 'blur(20px)',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            borderColor: alpha('#7877C6', 0.8),
                            boxShadow: '0 12px 32px rgba(120, 119, 198, 0.25)',
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
                                px: 1.25,
                                py: 0.4,
                                background: 'linear-gradient(135deg, #FF6B95 0%, #7877C6 100%)',
                                color: 'white',
                                borderRadius: 0.75,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                            }}
                        >
                            -{product.discountPercentage}%
                        </Box>
                    )}

                    {/* Quick View Button - Mobile optimized */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: hoveredProduct === product.id || isMobile ? 1 : 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            zIndex: 2,
                        }}
                    >
                        <Tooltip title="Quick View" arrow disableHoverListener={isMobile}>
                            <IconButton
                                size={isMobile ? "small" : "small"}
                                onClick={(e) => handleQuickView(product.id, e)}
                                sx={{
                                    backgroundColor: alpha('#FFFFFF', isMobile ? 0.3 : 0.2),
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                    width: isMobile ? 28 : 32,
                                    height: isMobile ? 28 : 32,
                                    '&:hover': {
                                        backgroundColor: alpha('#7877C6', isMobile ? 0.5 : 0.4),
                                        transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <Visibility fontSize={isMobile ? "small" : "small"} />
                            </IconButton>
                        </Tooltip>
                    </motion.div>

                    {/* Product Image - Consistent 4:3 Aspect Ratio for ALL */}
                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: aspectRatio,
                            flexShrink: 0,
                            backgroundColor: alpha('#000000', 0.05),
                            overflow: 'hidden',
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
                                transition: 'transform 0.5s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                },
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
                                    px: 1.25,
                                    py: 0.4,
                                    background: 'linear-gradient(135deg, #4ECDC4 0%, #2BBBAD 100%)',
                                    color: 'white',
                                    borderRadius: 0.75,
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
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
                            p: cardPadding,
                            gap: 0.75,
                            '&:last-child': { pb: cardPadding }
                        }}
                    >
                        {/* Category */}
                        <Chip
                            label={product.category}
                            size="small"
                            sx={{
                                alignSelf: 'flex-start',
                                fontSize: '0.6rem',
                                height: 20,
                                backgroundColor: alpha('#7877C6', 0.15),
                                color: '#7877C6',
                                fontWeight: 600,
                                mb: 0.25,
                            }}
                        />

                        {/* Title - Clamped to 2 lines with consistent height */}
                        <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            sx={{
                                color: 'white',
                                height: 40, // Consistent height for ALL products
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                fontSize: isMobile ? '0.75rem' : '0.8rem',
                                lineHeight: 1.3,
                                mb: 0.25,
                            }}
                        >
                            {product.title}
                        </Typography>

                        {/* Rating & Stock - Mobile optimized */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            mb: 0.75,
                            gap: 0.5,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                <Rating 
                                    value={product.rating} 
                                    size={isMobile ? "small" : "small"}
                                    readOnly 
                                    precision={0.5}
                                    sx={{ 
                                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                                        '& .MuiRating-iconFilled': {
                                            color: '#FFD700',
                                        }
                                    }} 
                                />
                                <Typography variant="caption" sx={{ 
                                    color: alpha('#FFFFFF', 0.7), 
                                    fontSize: isMobile ? '0.6rem' : '0.7rem' 
                                }}>
                                    ({product.rating?.toFixed(1)})
                                </Typography>
                            </Box>
                            <Chip
                                icon={<Inventory fontSize={isMobile ? "small" : "small"} />}
                                label={`${product.stock}`}
                                size="small"
                                sx={{
                                    fontSize: isMobile ? '0.55rem' : '0.6rem',
                                    height: 18,
                                    backgroundColor: product.stock > 10 
                                        ? alpha('#4CAF50', 0.2) 
                                        : product.stock > 0 
                                        ? alpha('#FF9800', 0.2) 
                                        : alpha('#F44336', 0.2),
                                    color: product.stock > 10 
                                        ? '#4CAF50' 
                                        : product.stock > 0 
                                        ? '#FF9800' 
                                        : '#F44336',
                                    '& .MuiChip-icon': {
                                        fontSize: isMobile ? 12 : 14,
                                        ml: 0.25,
                                    }
                                }}
                            />
                        </Box>

                        {/* Price */}
                        <Box sx={{ mt: 'auto', pt: 0.75 }}>
                            {product.discountPercentage > 0 ? (
                                <>
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                        sx={{ 
                                            color: '#FF6B95', 
                                            fontSize: isMobile ? '0.85rem' : '0.95rem',
                                            mb: 0.1,
                                        }}
                                    >
                                        {usdFormatted.format(discountPrice)}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ 
                                            textDecoration: 'line-through', 
                                            color: alpha('#FFFFFF', 0.5),
                                            fontSize: isMobile ? '0.65rem' : '0.7rem',
                                        }}
                                    >
                                        {usdFormatted.format(product.price)}
                                    </Typography>
                                </>
                            ) : (
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{ 
                                        color: 'white', 
                                        fontSize: isMobile ? '0.85rem' : '0.95rem',
                                    }}
                                >
                                    {usdFormatted.format(product.price)}
                                </Typography>
                            )}
                        </Box>

                        {/* Action Buttons - Mobile optimized */}
                        <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
                            <Button
                                variant="contained"
                                size={isMobile ? "small" : "small"}
                                startIcon={<ShoppingCart sx={{ fontSize: isMobile ? 10 : 11 }} />}
                                onClick={(e) => handleAddToCart(product, e)}
                                sx={{
                                    flex: 1,
                                    fontSize: isMobile ? '0.6rem' : '0.65rem',
                                    py: isMobile ? 0.3 : 0.35,
                                    px: isMobile ? 0.25 : 0.5,
                                    background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                                    textTransform: 'none',
                                    borderRadius: 0.75,
                                    fontWeight: 600,
                                    boxShadow: '0 1px 4px rgba(120, 119, 198, 0.3)',
                                    minWidth: 0,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5A59A1 0%, #7877C6 100%)',
                                        boxShadow: '0 2px 8px rgba(120, 119, 198, 0.4)',
                                    }
                                }}
                            >
                                {isMobile ? 'Add' : 'Add to Cart'}
                            </Button>
                            <Button
                                variant="contained"
                                size={isMobile ? "small" : "small"}
                                startIcon={<Bolt sx={{ fontSize: isMobile ? 10 : 11 }} />}
                                onClick={(e) => handleBuyNow(product, e)}
                                sx={{
                                    flex: 1,
                                    fontSize: isMobile ? '0.6rem' : '0.65rem',
                                    py: isMobile ? 0.3 : 0.35,
                                    px: isMobile ? 0.25 : 0.5,
                                    background: 'linear-gradient(135deg, #FF6B95 0%, #FF5252 100%)',
                                    textTransform: 'none',
                                    borderRadius: 0.75,
                                    fontWeight: 600,
                                    boxShadow: '0 1px 4px rgba(255, 107, 149, 0.3)',
                                    minWidth: 0,
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #FF5252 0%, #FF6B95 100%)',
                                        boxShadow: '0 2px 8px rgba(255, 107, 149, 0.4)',
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

    const renderMobileProductCard = (product: any) => {
        const discountPrice = product.price * (1 - product.discountPercentage / 100);
        const isSquareCard = isSmallMobile;
        const aspectRatio = isSquareCard ? '100%' : '75%';

        return (
            <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{ 
                    width: isSquareCard ? 'calc(50% - 6px)' : '100%',
                    flexShrink: 0,
                }}
            >
                <Card
                    elevation={0}
                    onClick={(e) => handleProductClick(product.id, e)}
                    sx={{
                        backgroundColor: alpha('#FFFFFF', 0.08),
                        backdropFilter: 'blur(20px)',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        '&:hover': {
                            transform: 'scale(1.02)',
                            borderColor: alpha('#7877C6', 0.6),
                        },
                        WebkitBackdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Quick View Button for Mobile - Always visible on mobile */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 2,
                        }}
                    >
                        <IconButton
                            size="small"
                            onClick={(e) => handleQuickView(product.id, e)}
                            sx={{
                                backgroundColor: alpha('#FFFFFF', 0.3),
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                                width: 26,
                                height: 26,
                                minWidth: 26,
                                minHeight: 26,
                                '&:hover': {
                                    backgroundColor: alpha('#7877C6', 0.5),
                                },
                            }}
                        >
                            <Visibility sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>

                    {/* Product Image - Consistent 4:3 Aspect Ratio */}
                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: aspectRatio,
                            backgroundColor: alpha('#000000', 0.05),
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

                        {/* Discount Badge */}
                        {product.discountPercentage > 0 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    zIndex: 2,
                                    px: 0.75,
                                    py: 0.2,
                                    background: 'linear-gradient(135deg, #FF6B95 0%, #7877C6 100%)',
                                    color: 'white',
                                    borderRadius: 0.5,
                                    fontSize: '0.55rem',
                                    fontWeight: 700,
                                }}
                            >
                                -{product.discountPercentage}%
                            </Box>
                        )}

                        {/* New Product Badge */}
                        {(product.tags?.includes('new') || product.tags?.includes('new-arrival')) && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: product.discountPercentage > 0 ? 40 : 8,
                                    zIndex: 2,
                                    px: 0.75,
                                    py: 0.2,
                                    background: 'linear-gradient(135deg, #4ECDC4 0%, #2BBBAD 100%)',
                                    color: 'white',
                                    borderRadius: 0.5,
                                    fontSize: '0.55rem',
                                    fontWeight: 700,
                                }}
                            >
                                NEW
                            </Box>
                        )}
                    </Box>

                    {/* Card Content */}
                    <CardContent
                        sx={{
                            p: 1,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#7877C6',
                                fontWeight: 600,
                                mb: 0.25,
                                fontSize: '0.55rem',
                            }}
                        >
                            {product.category}
                        </Typography>

                        <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                                color: 'white',
                                mb: 0.25,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                fontSize: '0.7rem',
                                lineHeight: 1.3,
                            }}
                        >
                            {product.title}
                        </Typography>

                        {/* Quick Stats for Mobile */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            gap: 0.5,
                            mb: 0.5,
                            flexWrap: 'wrap',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                <Rating 
                                    value={product.rating} 
                                    size="small" 
                                    readOnly 
                                    sx={{ fontSize: '0.75rem' }} 
                                />
                                <Typography variant="caption" sx={{ 
                                    color: alpha('#FFFFFF', 0.7), 
                                    fontSize: '0.55rem' 
                                }}>
                                    ({product.rating?.toFixed(1)})
                                </Typography>
                            </Box>
                            <Chip
                                label={`${product.stock} left`}
                                size="small"
                                sx={{
                                    fontSize: '0.55rem',
                                    height: 16,
                                    backgroundColor: product.stock > 10 
                                        ? alpha('#4CAF50', 0.2) 
                                        : product.stock > 0 
                                        ? alpha('#FF9800', 0.2) 
                                        : alpha('#F44336', 0.2),
                                    color: product.stock > 10 
                                        ? '#4CAF50' 
                                        : product.stock > 0 
                                        ? '#FF9800' 
                                        : '#F44336',
                                }}
                            />
                        </Box>

                        <Box sx={{ mt: 'auto' }}>
                            {product.discountPercentage > 0 ? (
                                <>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight={700}
                                        sx={{ color: '#FF6B95', fontSize: '0.8rem' }}
                                    >
                                        {usdFormatted.format(discountPrice)}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ 
                                            textDecoration: 'line-through', 
                                            color: alpha('#FFFFFF', 0.5),
                                            fontSize: '0.6rem',
                                        }}
                                    >
                                        {usdFormatted.format(product.price)}
                                    </Typography>
                                </>
                            ) : (
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={700}
                                    sx={{ color: 'white', fontSize: '0.8rem' }}
                                >
                                    {usdFormatted.format(product.price)}
                                </Typography>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <Box
            ref={containerRef}
            sx={{
                width: "100%",
                px: { xs: 1.5, sm: 2, md: 3, lg: 4, xl: 5 },
                py: 3,
                minHeight: 'calc(100vh - 200px)',
            }}
        >
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Box sx={{ mb: 4 }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        mb: 3,
                    }}>
                        <Box>
                            <Typography 
                                variant="h4" 
                                fontWeight={700} 
                                color="white" 
                                gutterBottom
                                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' } }}
                            >
                                {searchTerm
                                    ? `Search: "${searchTerm}"`
                                    : category
                                        ? `${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}`
                                        : 'All Products'
                                }
                            </Typography>
                            <Typography variant="body1" sx={{ color: alpha('#FFFFFF', 0.7), fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                <Box component="span" sx={{ color: '#FF6B95', fontWeight: 600 }}>{total}</Box> products found
                                {category && categoriesWithoutPagination.includes(category.toLowerCase()) && (
                                    <Typography component="span" variant="caption" sx={{ 
                                        ml: 1, 
                                        color: alpha('#4ECDC4', 0.8),
                                        fontSize: '0.75rem',
                                        fontStyle: 'italic'
                                    }}>
                                        (All items on one page)
                                    </Typography>
                                )}
                            </Typography>
                        </Box>

                        {/* Controls */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flexWrap: 'wrap',
                            width: { xs: '100%', sm: 'auto' },
                        }}>
                            {/* View Mode Toggle */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 0.5,
                                    backgroundColor: alpha('#FFFFFF', 0.08),
                                    borderRadius: 1.5,
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                }}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => setViewMode('grid')}
                                    sx={{
                                        color: viewMode === 'grid' ? '#7877C6' : alpha('#FFFFFF', 0.5),
                                        backgroundColor: viewMode === 'grid' ? alpha('#7877C6', 0.15) : 'transparent',
                                        borderRadius: 1,
                                        p: 0.5,
                                        '&:hover': {
                                            backgroundColor: alpha('#7877C6', 0.25),
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
                                        backgroundColor: viewMode === 'list' ? alpha('#7877C6', 0.15) : 'transparent',
                                        borderRadius: 1,
                                        p: 0.5,
                                        '&:hover': {
                                            backgroundColor: alpha('#7877C6', 0.25),
                                        }
                                    }}
                                >
                                    <ViewList fontSize="small" />
                                </IconButton>
                            </Paper>

                            {/* Sort Dropdown */}
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    displayEmpty
                                    inputProps={{ 'aria-label': 'Sort products' }}
                                    sx={{
                                        backgroundColor: alpha('#FFFFFF', 0.08),
                                        color: 'white',
                                        borderRadius: 1.5,
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        fontSize: '0.875rem',
                                        '& .MuiSelect-select': {
                                            py: 0.75,
                                            px: 1.5,
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '& .MuiSvgIcon-root': {
                                            color: alpha('#FFFFFF', 0.7),
                                            fontSize: '1rem',
                                        }
                                    }}
                                    startAdornment={<Sort sx={{ mr: 1, color: alpha('#FFFFFF', 0.5), fontSize: '1rem' }} />}
                                >
                                    <MenuItem value="featured" sx={{ backgroundColor: '#1A173B', fontSize: '0.875rem' }}>Featured</MenuItem>
                                    <MenuItem value="price-low" sx={{ backgroundColor: '#1A173B', fontSize: '0.875rem' }}>Price: Low to High</MenuItem>
                                    <MenuItem value="price-high" sx={{ backgroundColor: '#1A173B', fontSize: '0.875rem' }}>Price: High to Low</MenuItem>
                                    <MenuItem value="rating" sx={{ backgroundColor: '#1A173B', fontSize: '0.875rem' }}>Top Rated</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {/* Filter Chips */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                        {['all', 'popular', 'new'].map((filter) => (
                            <motion.div
                                key={filter}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Chip
                                    label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    onClick={() => onFilterChange(filter as any)}
                                    icon={filter === 'popular' ? <TrendingUp sx={{ fontSize: 16 }} /> : filter === 'new' ? <FlashOn sx={{ fontSize: 16 }} /> : undefined}
                                    size="small"
                                    sx={{
                                        backgroundColor: activeFilter === filter
                                            ? alpha(
                                                filter === 'all' ? '#7877C6' :
                                                    filter === 'popular' ? '#FF6B95' :
                                                        '#4ECDC4', 0.2)
                                            : alpha('#FFFFFF', 0.08),
                                        color: activeFilter === filter
                                            ? filter === 'all' ? '#7877C6' :
                                                filter === 'popular' ? '#FF6B95' :
                                                    '#4ECDC4'
                                            : alpha('#FFFFFF', 0.7),
                                        border: `1px solid ${activeFilter === filter
                                            ? alpha(
                                                filter === 'all' ? '#7877C6' :
                                                    filter === 'popular' ? '#FF6B95' :
                                                        '#4ECDC4', 0.4)
                                            : 'rgba(255, 255, 255, 0.1)'}`,
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        px: 1,
                                        height: 28,
                                        '& .MuiChip-icon': {
                                            fontSize: 14,
                                            ml: 0.5,
                                        },
                                        '&:hover': {
                                            backgroundColor: alpha('#7877C6', 0.15),
                                        }
                                    }}
                                />
                            </motion.div>
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
                            <Grid container spacing={getGridSpacing()}>
                                {Array.from(new Array(getGridColumns() * 2)).map((_, index) => (
                                    <Grid
                                        item
                                        xs={6}
                                        sm={4}
                                        md={4}
                                        lg={3}
                                        xl={2.4}
                                        key={index}
                                    >
                                        <Skeleton
                                            variant="rectangular"
                                            height={getCardHeight()}
                                            sx={{ 
                                                borderRadius: 2,
                                                background: `linear-gradient(90deg, 
                                                    ${alpha('#FFFFFF', 0.05)} 25%, 
                                                    ${alpha('#FFFFFF', 0.1)} 50%, 
                                                    ${alpha('#FFFFFF', 0.05)} 75%)`,
                                                backgroundSize: '400% 100%',
                                                animation: 'pulse 1.5s ease-in-out infinite',
                                            }}
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
                                // Grid View
                                isMobile ? (
                                    // Mobile Grid
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexWrap: 'wrap', 
                                        gap: 1.5,
                                        justifyContent: isSmallMobile ? 'space-between' : 'flex-start',
                                    }}>
                                        {products.map((product) => renderMobileProductCard(product))}
                                    </Box>
                                ) : (
                                    // Desktop Grid with consistent columns for ALL categories
                                    <Grid container spacing={getGridSpacing()}>
                                        {products.map((product) => (
                                            <Grid
                                                item
                                                xs={6}
                                                sm={4}
                                                md={4}
                                                lg={3}
                                                xl={2.4}
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
                                )
                            ) : (
                                // List View
                                <Box>
                                    {products.map((product) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Paper
                                                elevation={0}
                                                onClick={(e) => handleProductClick(product.id, e)}
                                                sx={{
                                                    mb: 2,
                                                    p: 2,
                                                    backgroundColor: alpha('#FFFFFF', 0.08),
                                                    backdropFilter: 'blur(20px)',
                                                    borderRadius: 2,
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    transition: 'all 0.3s ease',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
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
                                                        width: 100,
                                                        height: 100,
                                                        flexShrink: 0,
                                                        borderRadius: 1.5,
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
                                                    {/* Quick View for List */}
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleQuickView(product.id, e)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 4,
                                                            right: 4,
                                                            backgroundColor: alpha('#FFFFFF', 0.3),
                                                            backdropFilter: 'blur(10px)',
                                                            color: 'white',
                                                            width: 24,
                                                            height: 24,
                                                            minWidth: 24,
                                                            minHeight: 24,
                                                            '&:hover': {
                                                                backgroundColor: alpha('#7877C6', 0.5),
                                                            },
                                                        }}
                                                    >
                                                        <Visibility sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </Box>

                                                {/* Content */}
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Box sx={{ mb: 1 }}>
                                                        <Chip
                                                            label={product.category}
                                                            size="small"
                                                            sx={{
                                                                mb: 0.5,
                                                                fontSize: '0.7rem',
                                                                backgroundColor: alpha('#7877C6', 0.15),
                                                                color: '#7877C6',
                                                                fontWeight: 600,
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight={600}
                                                            sx={{
                                                                color: 'white',
                                                                mb: 0.5,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                fontSize: '0.9rem',
                                                            }}
                                                        >
                                                            {product.title}
                                                        </Typography>
                                                    </Box>

                                                    {/* Quick Stats for List View */}
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: 1.5, 
                                                        flexWrap: 'wrap',
                                                        mb: 1,
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Rating value={product.rating} size="small" readOnly sx={{ fontSize: '1rem' }} />
                                                            <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.7), fontSize: '0.8rem' }}>
                                                                {product.rating?.toFixed(1)}
                                                            </Typography>
                                                        </Box>
                                                        <Chip
                                                            icon={<Inventory fontSize="small" />}
                                                            label={`${product.stock} in stock`}
                                                            size="small"
                                                            sx={{
                                                                fontSize: '0.7rem',
                                                                backgroundColor: product.stock > 10 ? alpha('#4CAF50', 0.2) : alpha('#FF9800', 0.2),
                                                                color: product.stock > 10 ? '#4CAF50' : '#FF9800',
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>

                                                {/* Price and Actions */}
                                                <Box
                                                    sx={{
                                                        width: 180,
                                                        flexShrink: 0,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-end',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Box sx={{ textAlign: 'right' }}>
                                                        {product.discountPercentage > 0 ? (
                                                            <>
                                                                <Typography
                                                                    variant="h6"
                                                                    fontWeight={700}
                                                                    sx={{ color: '#FF6B95', fontSize: '1rem' }}
                                                                >
                                                                    {usdFormatted.format(product.price * (1 - product.discountPercentage / 100))}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        textDecoration: 'line-through',
                                                                        color: alpha('#FFFFFF', 0.5),
                                                                        fontSize: '0.75rem',
                                                                    }}
                                                                >
                                                                    {usdFormatted.format(product.price)}
                                                                </Typography>
                                                            </>
                                                        ) : (
                                                            <Typography
                                                                variant="h6"
                                                                fontWeight={700}
                                                                sx={{ color: 'white', fontSize: '1rem' }}
                                                            >
                                                                {usdFormatted.format(product.price)}
                                                            </Typography>
                                                        )}
                                                    </Box>

                                                    <Stack direction="row" spacing={0.75}>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            startIcon={<ShoppingCart sx={{ fontSize: 12 }} />}
                                                            onClick={(e) => handleAddToCart(product, e)}
                                                            sx={{
                                                                fontSize: '0.65rem',
                                                                py: 0.4,
                                                                px: 1,
                                                                background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                                                                textTransform: 'none',
                                                                whiteSpace: 'nowrap',
                                                                minWidth: 0,
                                                            }}
                                                        >
                                                            Add
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            startIcon={<Bolt sx={{ fontSize: 12 }} />}
                                                            onClick={(e) => handleBuyNow(product, e)}
                                                            sx={{
                                                                fontSize: '0.65rem',
                                                                py: 0.4,
                                                                px: 1,
                                                                background: 'linear-gradient(135deg, #FF6B95 0%, #FF5252 100%)',
                                                                textTransform: 'none',
                                                                whiteSpace: 'nowrap',
                                                                minWidth: 0,
                                                            }}
                                                        >
                                                            Buy
                                                        </Button>
                                                    </Stack>
                                                </Box>
                                            </Paper>
                                        </motion.div>
                                    ))}
                                </Box>
                            )}
                        </motion.div>
                    ) : (
                        // Empty State
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Box sx={{ 
                                textAlign: 'center', 
                                py: 8, 
                                px: 3,
                                maxWidth: 500,
                                mx: 'auto',
                            }}>
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
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
                                        <Diamond sx={{ fontSize: 36, color: alpha('#7877C6', 0.7) }} />
                                    </Box>
                                </motion.div>
                                <Typography variant="h5" fontWeight={700} color="white" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                                    No products found
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    color: alpha('#FFFFFF', 0.7), 
                                    mb: 3, 
                                    lineHeight: 1.5,
                                    fontSize: { xs: '0.875rem', sm: '1rem' }
                                }}>
                                    {searchTerm
                                        ? `We couldn't find any products matching "${searchTerm}"`
                                        : 'Try adjusting your filters or browse our categories'
                                    }
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="medium"
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
                                        boxShadow: '0 4px 20px rgba(120, 119, 198, 0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5A59A1 0%, #7877C6 100%)',
                                            boxShadow: '0 6px 24px rgba(120, 119, 198, 0.4)',
                                        }
                                    }}
                                >
                                    Browse All Products
                                </Button>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>

            {/* Pagination - Conditional Rendering */}
            {shouldShowPagination() && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 3 }}>
                        <Pagination
                            page={page}
                            count={pages}
                            onChange={(_event, newPage) => setPage(newPage)}
                            shape="rounded"
                            size={isMobile ? "small" : "medium"}
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    color: alpha('#FFFFFF', 0.7),
                                    backgroundColor: alpha('#FFFFFF', 0.08),
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontSize: '0.875rem',
                                    '&:hover': {
                                        backgroundColor: alpha('#7877C6', 0.2),
                                    },
                                    '&.Mui-selected': {
                                        background: 'linear-gradient(135deg, #7877C6 0%, #FF6B95 100%)',
                                        color: 'white',
                                        border: 'none',
                                        boxShadow: '0 2px 8px rgba(120, 119, 198, 0.3)',
                                    },
                                    '&.MuiPaginationItem-ellipsis': {
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                    }
                                }
                            }}
                        />
                    </Box>
                </motion.div>
            )}

            {/* "Load More" button for categories without pagination (optional) */}
            {category && !shouldShowPagination() && pages > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setPage(prev => prev + 1)}
                            sx={{
                                color: '#7877C6',
                                borderColor: alpha('#7877C6', 0.3),
                                '&:hover': {
                                    borderColor: '#7877C6',
                                    backgroundColor: alpha('#7877C6', 0.1),
                                }
                            }}
                        >
                            Load More Products
                        </Button>
                    </Box>
                </motion.div>
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
                        backgroundColor: alpha('#1A173B', 0.95),
                        color: 'white',
                        border: '1px solid rgba(120, 119, 198, 0.3)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 1.5,
                        fontSize: '0.875rem',
                        '& .MuiAlert-icon': {
                            color: '#4ECDC4',
                        }
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Checkout Popover */}
            <CheckoutPopover
                isOpen={checkoutOpen}
                onClose={handleCheckoutClose}
                selectedItems={checkoutItems}
                selectedTotal={checkoutTotal}
            />
        </Box>
    );
};

export default ProductSearch;
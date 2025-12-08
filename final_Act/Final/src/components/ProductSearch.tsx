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
    Badge,
    Container,
    Fade,
} from "@mui/material";
import {
    ShoppingCart,
    FavoriteBorder,
    Share,
    Visibility,
    TrendingUp,
    LocalShipping,
    Verified,
    Star,
    FlashOn,
    FilterList,
    Sort,
    GridView,
    ViewList,
    ArrowForward,
    Diamond,
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
    activeFilter: 'all' | 'popular' | 'new';
    onFilterChange: (filter: 'all' | 'popular' | 'new') => void;
}

const ProductSearch = ({ searchTerm, category = '', onProductClick, activeFilter, onFilterChange }: ProductSearchProps) => {
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
                filteredProducts = filteredProducts.filter(p => p.discountPercentage > 20);
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

    const handleAddToCart = (product: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            setSnackbarMessage('Please login to add items to your cart');
            setSnackbarOpen(true);
            return;
        }
        addToCart(product, 1);
        setSnackbarMessage(`🎉 Added "${product.title.substring(0, 30)}..." to cart!`);
        setSnackbarOpen(true);
    };

    const handleShare = (product: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: product.title,
                text: `Check out this amazing product: ${product.title}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            setSnackbarMessage('Link copied to clipboard!');
            setSnackbarOpen(true);
        }
    };

    const handleQuickView = (productId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('🔵 ProductSearch: Quick View clicked for product ID:', productId);
        onProductClick(productId);
    };

    const handleCardClick = (productId: number) => {
        console.log('🔵 ProductSearch: Card clicked for product ID:', productId);
        onProductClick(productId);
    };

    const renderProductCard = (product: any) => (
        <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -8 }}
            style={{ height: '100%' }}
        >
            <Card
                elevation={0}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => handleCardClick(product.id)}
                sx={{
                    height: '100%',
                    minHeight: 450, // Fixed minimum height
                    maxHeight: 500, // Fixed maximum height
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: alpha('#FFFFFF', 0.05),
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        borderColor: alpha('#7877C6', 0.6),
                        boxShadow: `
                            0 20px 40px rgba(120, 119, 198, 0.25),
                            0 8px 16px rgba(120, 119, 198, 0.15),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1)
                        `,
                        '& .product-image': {
                            transform: 'scale(1.08)',
                        },
                        '& .quick-actions': {
                            opacity: 1,
                            transform: 'translateY(0)',
                        }
                    },
                    WebkitBackdropFilter: 'blur(20px)',
                }}
            >
                {/* Premium Badge */}
                {product.discountPercentage > 20 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            zIndex: 2,
                            px: 1.5,
                            py: 0.75,
                            background: 'linear-gradient(135deg, #FF6B95 0%, #7877C6 100%)',
                            color: 'white',
                            borderRadius: 2,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            boxShadow: '0 4px 12px rgba(120, 119, 198, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        <FlashOn fontSize="inherit" />
                        PREMIUM
                    </Box>
                )}

                {/* Quick Actions */}
                <Box
                    className="quick-actions"
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        opacity: 0,
                        transform: 'translateY(-10px)',
                        transition: 'all 0.3s ease',
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
                                    transform: 'scale(1.1)',
                                }
                            }}
                        >
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Add to Wishlist" arrow>
                        <IconButton
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                                backgroundColor: alpha('#FFFFFF', 0.15),
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: alpha('#FF6B95', 0.3),
                                    transform: 'scale(1.1)',
                                }
                            }}
                        >
                            <FavoriteBorder fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Product Image - Fixed Height */}
                <Box sx={{ 
                    position: 'relative', 
                    overflow: 'hidden', 
                    height: 240, // Fixed height
                    minHeight: 240,
                    maxHeight: 240,
                    flexShrink: 0,
                }}>
                    <CardMedia
                        className="product-image"
                        component="img"
                        image={product.thumbnail}
                        alt={product.title}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    />

                    {/* Image Overlay Gradient */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '40%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                            opacity: hoveredProduct === product.id ? 0.8 : 0,
                            transition: 'opacity 0.3s ease',
                        }}
                    />
                </Box>

                <CardContent sx={{
                    flexGrow: 1,
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 210, // Minimum content height
                }}>
                    {/* Category */}
                    <Chip
                        label={product.category}
                        size="small"
                        sx={{
                            mb: 1.5,
                            backgroundColor: alpha('#7877C6', 0.1),
                            color: '#7877C6',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            border: `1px solid ${alpha('#7877C6', 0.2)}`,
                            alignSelf: 'flex-start',
                        }}
                    />

                    {/* Title */}
                    <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{
                            color: 'white',
                            mb: 1,
                            lineHeight: 1.3,
                            height: 44,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            flexGrow: 0,
                        }}
                    >
                        {product.title}
                    </Typography>

                    {/* Rating & Reviews */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                        <Rating
                            value={product.rating}
                            precision={0.1}
                            size="small"
                            readOnly
                            sx={{
                                color: '#FFD700',
                                '& .MuiRating-iconFilled': {
                                    textShadow: '0 0 8px rgba(255, 215, 0, 0.5)',
                                }
                            }}
                        />
                        <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                            ({product.rating?.toFixed(1)})
                        </Typography>
                        <Box sx={{ ml: 'auto' }}>
                            <Chip
                                label={`${product.stock} in stock`}
                                size="small"
                                sx={{
                                    backgroundColor: product.stock > 10
                                        ? alpha('#4CAF50', 0.2)
                                        : alpha('#FF9800', 0.2),
                                    color: product.stock > 10 ? '#4CAF50' : '#FF9800',
                                    fontSize: '0.65rem',
                                    height: 20,
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Price */}
                    <Box sx={{ mb: 2.5, flexGrow: 0 }}>
                        {product.discountPercentage > 0 ? (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                                    <Typography
                                        variant="h5"
                                        fontWeight={800}
                                        sx={{
                                            color: '#FF6B95',
                                            background: 'linear-gradient(135deg, #FF6B95 0%, #7877C6 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            letterSpacing: '-0.5px',
                                        }}
                                    >
                                        {usdFormatted.format(product.price * (1 - product.discountPercentage / 100))}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            textDecoration: 'line-through',
                                            color: alpha('#FFFFFF', 0.4)
                                        }}
                                    >
                                        {usdFormatted.format(product.price)}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={`${product.discountPercentage}% OFF`}
                                    size="small"
                                    icon={<FlashOn fontSize="small" />}
                                    sx={{
                                        mt: 1,
                                        backgroundColor: alpha('#FF6B95', 0.15),
                                        color: '#FF6B95',
                                        fontWeight: 700,
                                        border: `1px solid ${alpha('#FF6B95', 0.3)}`,
                                        fontSize: '0.75rem',
                                    }}
                                />
                            </>
                        ) : (
                            <Typography
                                variant="h5"
                                fontWeight={800}
                                sx={{
                                    color: 'white',
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                {usdFormatted.format(product.price)}
                            </Typography>
                        )}
                    </Box>

                    {/* Action Button */}
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={(e) => handleAddToCart(product, e)}
                        sx={{
                            background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                            color: 'white',
                            fontWeight: 700,
                            py: 1.25,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease',
                            mt: 'auto', // Pushes button to bottom
                            '&:hover': {
                                background: 'linear-gradient(135deg, #FF6B95 0%, #7877C6 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px rgba(120, 119, 198, 0.4)',
                            },
                            boxShadow: '0 4px 12px rgba(120, 119, 198, 0.3)',
                        }}
                    >
                        Add to Cart
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );

    const renderListProduct = (product: any) => (
        <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
        >
            <Paper
                elevation={0}
                onClick={() => handleCardClick(product.id)}
                sx={{
                    mb: 2,
                    p: 3,
                    backgroundColor: alpha('#FFFFFF', 0.05),
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    minHeight: 200,
                    '&:hover': {
                        borderColor: alpha('#7877C6', 0.6),
                        backgroundColor: alpha('#7877C6', 0.05),
                        transform: 'translateX(8px)',
                    },
                    WebkitBackdropFilter: 'blur(20px)',
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <Box sx={{ 
                            position: 'relative', 
                            borderRadius: 2, 
                            overflow: 'hidden',
                            height: 160,
                            minHeight: 160,
                        }}>
                            <CardMedia
                                component="img"
                                height="160"
                                image={product.thumbnail}
                                alt={product.title}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                    }
                                }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box>
                            <Chip
                                label={product.category}
                                size="small"
                                sx={{
                                    mb: 1.5,
                                    backgroundColor: alpha('#7877C6', 0.1),
                                    color: '#7877C6',
                                    fontWeight: 600,
                                }}
                            />
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{
                                    color: 'white',
                                    mb: 1,
                                }}
                            >
                                {product.title}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: alpha('#FFFFFF', 0.7),
                                    mb: 2,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {product.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Rating value={product.rating} size="small" readOnly sx={{ color: '#FFD700' }} />
                                <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.6) }}>
                                    {product.rating?.toFixed(1)} ({product.stock} in stock)
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'right' }}>
                            {product.discountPercentage > 0 ? (
                                <>
                                    <Typography
                                        variant="h5"
                                        fontWeight={800}
                                        sx={{
                                            color: '#FF6B95',
                                            mb: 0.5,
                                        }}
                                    >
                                        {usdFormatted.format(product.price * (1 - product.discountPercentage / 100))}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            textDecoration: 'line-through',
                                            color: alpha('#FFFFFF', 0.4),
                                            mb: 2,
                                        }}
                                    >
                                        {usdFormatted.format(product.price)}
                                    </Typography>
                                    <Chip
                                        label={`Save ${product.discountPercentage}%`}
                                        size="small"
                                        sx={{
                                            backgroundColor: alpha('#FF6B95', 0.15),
                                            color: '#FF6B95',
                                            fontWeight: 600,
                                        }}
                                    />
                                </>
                            ) : (
                                <Typography
                                    variant="h5"
                                    fontWeight={800}
                                    sx={{
                                        color: 'white',
                                        mb: 3,
                                    }}
                                >
                                    {usdFormatted.format(product.price)}
                                </Typography>
                            )}
                            <Button
                                variant="contained"
                                startIcon={<ShoppingCart />}
                                onClick={(e) => handleAddToCart(product, e)}
                                sx={{
                                    background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                                    color: 'white',
                                    fontWeight: 600,
                                    mt: 2,
                                }}
                            >
                                Add to Cart
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </motion.div>
    );

    return (
        <Box ref={containerRef}>
            {/* Results Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ mb: 4 }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                        mb: 3,
                    }}>
                        <Box>
                            <Typography variant="h4" fontWeight={800} color="white" gutterBottom>
                                {searchTerm
                                    ? `Search: "${searchTerm}"`
                                    : category
                                        ? `${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}`
                                        : 'Premium Collection'
                                }
                            </Typography>
                            <Typography variant="body1" sx={{ color: alpha('#FFFFFF', 0.7) }}>
                                <Box component="span" sx={{ color: '#FF6B95', fontWeight: 600 }}>{total}</Box> luxury items found
                            </Typography>
                        </Box>

                        {/* Controls */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            flexWrap: 'wrap',
                        }}>
                            {/* View Mode Toggle */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 0.5,
                                    backgroundColor: alpha('#FFFFFF', 0.05),
                                    borderRadius: 2,
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
                                        borderRadius: 1.5,
                                        '&:hover': {
                                            backgroundColor: alpha('#7877C6', 0.2),
                                        }
                                    }}
                                >
                                    <GridView />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => setViewMode('list')}
                                    sx={{
                                        color: viewMode === 'list' ? '#7877C6' : alpha('#FFFFFF', 0.5),
                                        backgroundColor: viewMode === 'list' ? alpha('#7877C6', 0.1) : 'transparent',
                                        borderRadius: 1.5,
                                        '&:hover': {
                                            backgroundColor: alpha('#7877C6', 0.2),
                                        }
                                    }}
                                >
                                    <ViewList />
                                </IconButton>
                            </Paper>

                            {/* Sort Dropdown */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 0.5,
                                    backgroundColor: alpha('#FFFFFF', 0.05),
                                    borderRadius: 2,
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    minWidth: 140,
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
                                        padding: '8px 12px',
                                        outline: 'none',
                                        fontSize: '0.9rem',
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
                    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                        {['all', 'popular', 'new'].map((filter) => (
                            <Chip
                                key={filter}
                                label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                                onClick={() => onFilterChange(filter as any)}
                                icon={filter === 'popular' ? <TrendingUp /> : filter === 'new' ? <FlashOn /> : undefined}
                                sx={{
                                    backgroundColor: activeFilter === filter
                                        ? alpha(filter === 'all' ? '#7877C6' : filter === 'popular' ? '#FF6B95' : '#4ECDC4', 0.2)
                                        : alpha('#FFFFFF', 0.05),
                                    color: activeFilter === filter
                                        ? filter === 'all' ? '#7877C6' : filter === 'popular' ? '#FF6B95' : '#4ECDC4'
                                        : alpha('#FFFFFF', 0.6),
                                    border: `1px solid ${activeFilter === filter
                                        ? alpha(filter === 'all' ? '#7877C6' : filter === 'popular' ? '#FF6B95' : '#4ECDC4', 0.3)
                                        : 'rgba(255, 255, 255, 0.08)'
                                        }`,
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: alpha(filter === 'all' ? '#7877C6' : filter === 'popular' ? '#FF6B95' : '#4ECDC4', 0.3),
                                        transform: 'translateY(-2px)',
                                    }
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </motion.div>

            {/* Products Grid/List - Fixed Height Containers */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Grid container spacing={3}>
                            {Array.from(new Array(8)).map((_, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ height: 500 }}>
                                    <Skeleton
                                        variant="rectangular"
                                        height={500}
                                        sx={{
                                            borderRadius: 3,
                                            background: `linear-gradient(90deg, 
                                                ${alpha('#FFFFFF', 0.05)} 25%, 
                                                ${alpha('#FFFFFF', 0.1)} 50%, 
                                                ${alpha('#FFFFFF', 0.05)} 75%
                                            )`,
                                            backgroundSize: '400% 100%',
                                            animation: 'shimmer 1.5s infinite',
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
                        transition={{ duration: 0.5, staggerChildren: 0.1 }}
                    >
                        {viewMode === 'grid' ? (
                            <Grid container spacing={3}>
                                {products.map((product) => (
                                    <Grid 
                                        item 
                                        xs={12} 
                                        sm={6} 
                                        md={4} 
                                        lg={3} 
                                        key={product.id}
                                        sx={{ 
                                            height: 500, // Fixed height for grid items
                                            display: 'flex',
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
                        <Box sx={{
                            textAlign: 'center',
                            py: 10,
                            px: 3,
                        }}>
                            <Box
                                sx={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${alpha('#7877C6', 0.1)} 0%, ${alpha('#FF6B95', 0.1)} 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 4,
                                }}
                            >
                                <Diamond sx={{ fontSize: 48, color: alpha('#7877C6', 0.5) }} />
                            </Box>
                            <Typography variant="h5" fontWeight={600} color="white" gutterBottom>
                                No products found
                            </Typography>
                            <Typography variant="body1" sx={{ color: alpha('#FFFFFF', 0.6), mb: 4, maxWidth: 400, mx: 'auto' }}>
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
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                }}
                            >
                                Browse All Products
                            </Button>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pagination */}
            {pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
                    <Pagination
                        page={page}
                        count={pages}
                        onChange={(_event, newPage) => setPage(newPage)}
                        color="primary"
                        shape="rounded"
                        size="large"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: alpha('#FFFFFF', 0.7),
                                fontSize: '1rem',
                                fontWeight: 500,
                                backgroundColor: alpha('#FFFFFF', 0.05),
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                '&:hover': {
                                    backgroundColor: alpha('#7877C6', 0.2),
                                },
                                '&.Mui-selected': {
                                    background: 'linear-gradient(135deg, #7877C6 0%, #FF6B95 100%)',
                                    color: 'white',
                                    fontWeight: 700,
                                    border: 'none',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #FF6B95 0%, #7877C6 100%)',
                                    }
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
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
                        fontWeight: 500,
                        borderRadius: 2,
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
                            size={60}
                            thickness={4}
                            sx={{
                                color: '#7877C6',
                                '& .MuiCircularProgress-circle': {
                                    strokeLinecap: 'round',
                                }
                            }}
                        />
                    </motion.div>
                </Box>
            )}
        </Box>
    );
};

export default ProductSearch;
import { useCallback, useEffect, useState, useRef } from "react";
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "../configs/constants";
import {
    Badge,
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    InputAdornment,
    Pagination,
    Paper,
    Rating,
    Tooltip,
    Typography,
    Button,
    Alert,
    Snackbar,
    Skeleton,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Avatar,
    Tabs,
    Tab,
    Fade
} from "@mui/material";
import { 
    Class, 
    Discount, 
    Inventory, 
    Reviews, 
    Search, 
    Style, 
    ShoppingCart,
    Close,
    Visibility,
    LocalShipping,
    Verified,
    Comment,
    ArrowBack,
    ArrowForward,
    Star,
    Favorite,
    Share
} from "@mui/icons-material";
import { SeachProducts, GetProductDetails } from "../API/ProductsAPI";
import { useUserStore } from "../store/userStore";

const usdFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

// --- PRODUCT DETAIL MODAL ---
interface ProductDetailModalProps {
    open: boolean;
    product: any;
    onClose: () => void;
    onAddToCart: (product: any) => void;
    isLoggedIn: boolean;
}

const ProductDetailModal = ({ open, product, onClose, onAddToCart, isLoggedIn }: ProductDetailModalProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const discountPrice = product.price * (1 - product.discountPercentage / 100);
    const savings = product.price - discountPrice;
    const productImages = product.images || [product.thumbnail];

    const handlePreviousImage = () => {
        setSelectedImageIndex(prev => prev === 0 ? productImages.length - 1 : prev - 1);
    };

    const handleNextImage = () => {
        setSelectedImageIndex(prev => prev === productImages.length - 1 ? 0 : prev + 1);
    };

    const handleAddToCartClick = () => {
        onAddToCart(product);
        onClose();
    };

    const renderSpecifications = () => (
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Brand</Typography>
                <Typography variant="body2" fontWeight="medium">{product.brand || "Unknown"}</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Weight</Typography>
                <Typography variant="body2" fontWeight="medium">{product.weight || "N/A"}</Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Warranty</Typography>
                <Typography variant="body2" fontWeight="medium">{product.warranty || "1 Year"}</Typography>
            </Grid>
        </Grid>
    );

    const renderReviews = () => (
        <Stack spacing={2}>
            {product.reviews?.map((review: any) => (
                <Paper key={review.id} elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <Avatar>{review.user?.charAt(0) || 'U'}</Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">{review.user || "Anonymous"}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Rating value={review.rating} size="small" readOnly />
                                <Typography variant="caption" color="text.secondary">{review.date}</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Typography variant="body2">{review.comment}</Typography>
                </Paper>
            ))}
        </Stack>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            TransitionComponent={Fade}
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">{product.title}</Typography>
                <IconButton onClick={onClose}><Close /></IconButton>
            </DialogTitle>
            
            <DialogContent>
                <Grid container spacing={4}>
                    {/* Images Section */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ position: 'relative', mb: 2 }}>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 400,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    bgcolor: 'grey.100',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <img
                                    src={productImages[selectedImageIndex]}
                                    alt={product.title}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                                
                                <IconButton
                                    onClick={handlePreviousImage}
                                    sx={{
                                        position: 'absolute',
                                        left: 8,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'white' }
                                    }}
                                >
                                    <ArrowBack />
                                </IconButton>
                                <IconButton
                                    onClick={handleNextImage}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'white' }
                                    }}
                                >
                                    <ArrowForward />
                                </IconButton>
                            </Box>
                            
                            {/* Thumbnails */}
                            {productImages.length > 1 && (
                                <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
                                    {productImages.map((img: string, index: number) => (
                                        <Box
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: selectedImageIndex === index ? 3 : 1,
                                                borderColor: selectedImageIndex === index ? 'primary.main' : 'divider',
                                                opacity: selectedImageIndex === index ? 1 : 0.7,
                                                '&:hover': { opacity: 1 }
                                            }}
                                        >
                                            <img
                                                src={img}
                                                alt={`Thumbnail ${index + 1}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Grid>
                    
                    {/* Details Section */}
                    <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                            {/* Category and Rating */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip label={product.category} color="secondary" />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Rating value={product.rating} readOnly precision={0.1} />
                                    <Typography variant="body2" color="text.secondary">
                                        ({product.rating?.toFixed(1)})
                                    </Typography>
                                </Box>
                            </Box>
                            
                            {/* Price */}
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                                    <Typography variant="h3" fontWeight="bold" color="primary">
                                        {usdFormatted.format(discountPrice)}
                                    </Typography>
                                    {product.discountPercentage > 0 && (
                                        <>
                                            <Typography
                                                variant="h6"
                                                color="text.disabled"
                                                sx={{ textDecoration: 'line-through' }}
                                            >
                                                {usdFormatted.format(product.price)}
                                            </Typography>
                                            <Chip
                                                label={`Save ${usdFormatted.format(savings)}`}
                                                color="success"
                                                size="small"
                                                variant="outlined"
                                            />
                                        </>
                                    )}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    {product.discountPercentage > 0 ? `${product.discountPercentage}% OFF` : 'Regular price'}
                                </Typography>
                            </Box>
                            
                            {/* Stock */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Badge
                                    badgeContent={product.stock > 0 ? "In Stock" : "Out of Stock"}
                                    color={product.stock > 0 ? "success" : "error"}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    {product.stock} units available
                                </Typography>
                            </Box>
                            
                            {/* Tags */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {product.tags?.map((tag: string) => (
                                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                                ))}
                            </Box>
                            
                            {/* Full Description */}
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Description
                                </Typography>
                                <Typography variant="body1">
                                    {product.description}
                                </Typography>
                            </Box>
                            
                            {/* Quantity */}
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Quantity
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </Button>
                                    <Typography sx={{ minWidth: 40, textAlign: 'center' }}>
                                        {quantity}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setQuantity(quantity + 1)}
                                        disabled={quantity >= product.stock}
                                    >
                                        +
                                    </Button>
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                        Total: {usdFormatted.format(discountPrice * quantity)}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            {/* Action Buttons */}
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<ShoppingCart />}
                                    onClick={handleAddToCartClick}
                                    disabled={!isLoggedIn || product.stock === 0}
                                    sx={{
                                        flex: 1,
                                        bgcolor: '#D4AF37',
                                        '&:hover': { bgcolor: '#C19B2E' },
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {isLoggedIn ? 'Add to Cart' : 'Login to Purchase'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    sx={{ flex: 1, fontWeight: 'bold' }}
                                >
                                    Buy Now
                                </Button>
                            </Stack>
                            
                            {/* Tabs */}
                            <Box>
                                <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
                                    <Tab label="Specifications" />
                                    <Tab label="Reviews" />
                                    <Tab label="Shipping" />
                                </Tabs>
                                <Box sx={{ pt: 2 }}>
                                    {activeTab === 0 && renderSpecifications()}
                                    {activeTab === 1 && renderReviews()}
                                    {activeTab === 2 && (
                                        <Stack spacing={2}>
                                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                    <LocalShipping color="primary" />
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        Free Shipping
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2">
                                                    Free shipping on orders over $50
                                                </Typography>
                                            </Paper>
                                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                    <Verified color="primary" />
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        30-Day Returns
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2">
                                                    Easy returns within 30 days
                                                </Typography>
                                            </Paper>
                                        </Stack>
                                    )}
                                </Box>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

// --- SKELETON COMPONENTS ---

const ProductCardSkeleton = () => (
    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="rectangular" height={300} animation="wave" />
        <CardContent sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} width="80%" animation="wave" />
            
            <Grid container spacing={2} sx={{ my: 1 }}>
                <Grid item xs={7}>
                    <Skeleton variant="text" sx={{ fontSize: '1.2rem' }} width="60%" animation="wave" />
                    <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="40%" animation="wave" />
                </Grid>
                <Grid item xs={5}>
                    <Skeleton variant="rectangular" height={50} animation="wave" />
                </Grid>
            </Grid>
            
            <Skeleton variant="rectangular" height={40} sx={{ mt: 2, mb: 1, borderRadius: 1 }} animation="wave" /> 

            <Divider sx={{ my: 2 }}>
                <Skeleton variant="circular" width={20} height={20} animation="wave" />
            </Divider>
            <Box display="flex" gap={1} mb={2}>
                 <Skeleton variant="rounded" width={80} height={32} animation="wave" />
                 <Skeleton variant="circular" width={24} height={24} animation="wave" />
                 <Skeleton variant="circular" width={24} height={24} animation="wave" />
            </Box>

            <Skeleton variant="text" width="100%" animation="wave" />
            <Skeleton variant="text" width="90%" animation="wave" />
            
            <Divider sx={{ my: 2 }}>
                <Skeleton variant="circular" width={20} height={20} animation="wave" />
            </Divider>
            <Skeleton variant="rounded" width={120} height={24} animation="wave" />
        </CardContent>
    </Card>
);

const ProductSearchSkeleton = () => {
    return (
        <Box sx={{ my: 2 }}>
            <Grid container spacing={2} sx={{ my: 2 }}>
                {[...Array(8)].map((_, index) => (
                    <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
                        <ProductCardSkeleton />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

// --- MAIN COMPONENT ---


const ProductSearch = () => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(DEFAULT_PAGE);
    const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [productDetails, setProductDetails] = useState<any>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { isLoggedIn, addToCart } = useUserStore();

    const handleSearchProducts = useCallback(async (searchKey: string) => {
        const { page: updatedPage, perPage: updatePerPage, products, total, lastPage } = await SeachProducts({ searchKey, page, perPage });

        setProducts(products);
        setPage(updatedPage);
        setTotal(total);
        setPerPage(updatePerPage);
        setPages(lastPage);
        setIsLoading(false);
    }, [page, perPage]);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            await handleSearchProducts(searchTerm);
        };
        fetchProducts();
    }, [searchTerm, page, handleSearchProducts]);

    const handleAddToCart = (product: any) => {
        if (!isLoggedIn) {
            setSnackbarMessage('Please login to add items to your cart');
            setSnackbarOpen(true);
            return;
        }
        
        addToCart(product, 1);
        setSnackbarMessage(`Added "${product.title}" to cart!`);
        setSnackbarOpen(true);
    };

    const handleAddToCartFromModal = (product: any) => {
        if (!isLoggedIn) {
            setSnackbarMessage('Please login to add items to your cart');
            setSnackbarOpen(true);
            return;
        }
        
        addToCart(product, 1);
        setSnackbarMessage(`Added "${product.title}" to cart!`);
        setSnackbarOpen(true);
    };

    const handleProductClick = async (product: any) => {
        setSelectedProduct(product);
        try {
            setIsLoading(true);
            
            // Fetch additional product details
            const details = await GetProductDetails(product.id);
            
            // Merge the basic product data with additional details
            const enhancedProduct = {
                ...product,
                images: details.images || [product.thumbnail],
                brand: details.brand,
                sku: details.sku,
                weight: details.weight,
                dimensions: details.dimensions,
                warranty: details.warranty,
                reviews: details.reviews || product.reviews || []
            };
            
            setProductDetails(enhancedProduct);
            setModalOpen(true);
        } catch (error) {
            console.error('Error fetching product details:', error);
            // Fallback to basic product info with just the thumbnail as image
            setProductDetails({
                ...product,
                images: [product.thumbnail],
                reviews: product.reviews || []
            });
            setModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setProductDetails(null);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // Search functionality is now handled by the AccountMenu search bar
    // The searchTerm is passed from AccountMenu or you can keep local state
    // if you want separate search behavior

    return (
        <>
            {/* CONDITIONAL RENDERING */}
            {isLoading
                ? <ProductSearchSkeleton />
                : <>
                    {pages > 1 && <Box alignContent="center" alignItems="center" display="flex" justifyContent="center" sx={{ my: 2 }}>
                        <Pagination page={page} count={pages} onChange={(_event, newPage) => setPage(newPage)} />
                        <Typography variant="caption">({total} items found.)</Typography>
                    </Box>}
                    
                    <Grid container spacing={2} sx={{ my: 2 }}>
                        {products.map(({
                            id: productId,
                            category,
                            description,
                            discountPercentage,
                            price,
                            rating,
                            reviews,
                            stock,
                            tags,
                            thumbnail,
                            title,
                            meta: { qrCode }
                        }: any) => (
                            <Grid key={`product-${productId}`} size={{
                                xs: 12,
                                sm: 6,
                                md: 4,
                                lg: 3,
                            }}>
                                <Card 
                                    elevation={3} 
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'background-color 0.3s ease-in-out',
                                        '&:hover': {
                                            backgroundColor: 'secondary.light',
                                            boxShadow: 6,
                                            transform: 'scale(1.02)',
                                            cursor: 'pointer',
                                        },
                                    }}
                                    onClick={() => handleProductClick({
                                        id: productId,
                                        category,
                                        description,
                                        discountPercentage,
                                        price,
                                        rating,
                                        reviews,
                                        stock,
                                        tags,
                                        thumbnail,
                                        title,
                                        meta: { qrCode }
                                    })}
                                >
                                    <Box sx={{ position: 'relative' }}>
                                        <CardMedia
                                            image={thumbnail}
                                            title={title}
                                            sx={{ height: 300 }}
                                        />
                                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                            <IconButton
                                                size="small"
                                                sx={{ 
                                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                                    '&:hover': { backgroundColor: 'white' }
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProductClick({
                                                        id: productId,
                                                        category,
                                                        description,
                                                        discountPercentage,
                                                        price,
                                                        rating,
                                                        reviews,
                                                        stock,
                                                        tags,
                                                        thumbnail,
                                                        title,
                                                        meta: { qrCode }
                                                    });
                                                }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    
                                    <CardContent sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                        <Tooltip title={title}>
                                            <Typography gutterBottom variant="h6" component="div" noWrap sx={{ fontWeight: 'bold' }}>
                                                {title}
                                            </Typography>
                                        </Tooltip>

                                        <Grid container spacing={2}>
                                            <Grid sx={{ flex: 0.6 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                    {usdFormatted.format(price - (discountPercentage > 0 ? price * (discountPercentage / 100) : 0))}
                                                </Typography>

                                                {discountPercentage > 0 && <>
                                                    <Typography color="text.disabled" sx={{ fontWeight: 'bold', textDecoration: 'line-through' }}>
                                                        {usdFormatted.format(price)}
                                                    </Typography>
                                                    <Chip
                                                        label={`-${discountPercentage}%`}
                                                        color="error"
                                                        size="small"
                                                        icon={<Discount />}
                                                    />
                                                </>}
                                            </Grid>
                                            <Grid sx={{ flex: 0.4 }}>
                                                <Paper elevation={1}>
                                                    <img src={qrCode} alt="QR Code" style={{ width: '100%' }} />
                                                </Paper>
                                            </Grid>
                                        </Grid>

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<ShoppingCart />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart({
                                                    id: productId,
                                                    title,
                                                    price,
                                                    discountPercentage,
                                                    thumbnail,
                                                    category,
                                                    description,
                                                    rating,
                                                    stock,
                                                    tags,
                                                    meta: { qrCode }
                                                });
                                            }}
                                            sx={{
                                                mt: 2,
                                                mb: 1,
                                                backgroundColor: '#D4AF37',
                                                '&:hover': {
                                                    backgroundColor: '#C19B2E',
                                                },
                                                fontWeight: 'bold'
                                            }}
                                            disabled={!isLoggedIn}
                                        >
                                            {isLoggedIn ? 'Add to Cart' : 'Login to Add'}
                                        </Button>

                                        <Divider sx={{ my: 2 }} />
                                        <Grid container alignItems="center" spacing={2} sx={{ my: 1 }}>
                                            <Grid>
                                                <Chip icon={<Class />} label={category} color="secondary" />
                                            </Grid>
                                            <Grid>
                                                <Badge badgeContent={stock || '0'} color={(stock || 0) > 0 ? 'success' : 'error'}>
                                                    <Inventory color="action" />
                                                </Badge>
                                            </Grid>
                                            <Grid>
                                                <Tooltip title={(tags || []).join(', ')} arrow>
                                                    <Badge badgeContent={(tags || []).length} color="secondary">
                                                        <Style color="action" />
                                                    </Badge>
                                                </Tooltip>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 2 }} />
                                        <Tooltip title={description}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'text.secondary',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {description}
                                            </Typography>
                                        </Tooltip>
                                        <Divider sx={{ my: 2 }} />
                                        <Tooltip title={`Rating: ${rating || 0}`}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Rating value={rating || 0} readOnly precision={0.01} />
                                                <Badge badgeContent={(reviews || []).length} color="info">
                                                    <Reviews color="action" />
                                                </Badge>
                                            </Box>
                                        </Tooltip>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    
                    {pages > 1 && <Box alignContent="center" alignItems="center" display="flex" justifyContent="center" sx={{ my: 2 }}>
                        <Pagination page={page} count={pages} onChange={(_event, newPage) => setPage(newPage)} />
                        <Typography variant="caption">({total} items found.)</Typography>
                    </Box>}
                </>
            }

            {/* Product Detail Modal */}
            <ProductDetailModal
                open={modalOpen}
                product={productDetails}
                onClose={handleCloseModal}
                onAddToCart={handleAddToCartFromModal}
                isLoggedIn={isLoggedIn}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={isLoggedIn ? "success" : "warning"}
                    sx={{ 
                        width: '100%',
                        backgroundColor: isLoggedIn ? '#D4AF37' : '#FF9800',
                        color: 'white',
                        fontWeight: 'bold'
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ProductSearch;
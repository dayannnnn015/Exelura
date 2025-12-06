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
    TextField,
    Tooltip,
    Typography,
    Button,
    Alert,
    Snackbar
} from "@mui/material";
import { Class, Discount, Inventory, Reviews, Search, Style, ShoppingCart } from "@mui/icons-material";
import { SeachProducts } from "../API/ProductsAPI";
import { useUserStore } from "../store/userStore";

const usdFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

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
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Zustand store
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

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <>
            <TextField
                fullWidth
                onChange={(e) => {
                    const value = e.target.value;
                    if (debounceTimer.current) {
                        clearTimeout(debounceTimer.current);
                    }
                    debounceTimer.current = setTimeout(() => {
                        setSearchTerm(value);
                        setPage(1);
                    }, 500);
                }}
                placeholder="Search products..."
                slotProps={{
                    input: {
                        sx: {
                            backgroundColor: 'white',
                            borderRadius: 1,
                        },
                        endAdornment: (
                            <InputAdornment position="end">
                                <Search color="primary" />
                            </InputAdornment>
                        ),
                    },
                }}
            />

            {!isLoading
                ? <>
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
                                <Card elevation={3} sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'background-color 0.3s ease-in-out',
                                    '&:hover': {
                                        backgroundColor: 'secondary.light',
                                        backShadow: 6,
                                        transform: 'scale(1.02)',
                                    },
                                }}>
                                    <CardMedia
                                        image={thumbnail}
                                        title={title}
                                        sx={{ height: 300 }}
                                    />
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
                                                    <Typography color="textDisabled" sx={{ fontWeight: 'bold', textDecoration: 'line-through' }}>
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
                                                    <img src={qrCode} width="100%" />
                                                </Paper>
                                            </Grid>
                                        </Grid>

                                        {/* Add to Cart Button */}
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<ShoppingCart />}
                                            onClick={() => handleAddToCart({
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
                                            })}
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
                : <CircularProgress sx={{ display: 'block', margin: '30vh auto' }} />
            }

            {/* Snackbar for notifications */}
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
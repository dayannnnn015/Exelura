import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
  InputAdornment,
  alpha,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MonetizationOnIcon,
  Inventory as InventoryIcon,
  LocalOffer as LocalOfferIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
  ShoppingBag as ShoppingBagIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { GetSellerProducts } from '../API/ProductsAPI';
import SellerAccountMenu from '../components/SellerAccountMenu';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  sold?: number;
  views?: number;
}

// Professional Color Palette matching OrderManagement
const PRIMARY_COLOR = '#4ECDC4'; // Teal/Mint
const SECONDARY_COLOR = '#7877C6'; // Indigo/Violet
const ACCENT_COLOR = '#FF6B95'; // Pink/Cancel
const ACCENT_ORANGE = '#F29F58'; // Orange
const ACCENT_GOLD = '#FFD166'; // Gold
const ACCENT_GREEN = '#06D6A0'; // Green
const BACKGROUND_GRADIENT = 'linear-gradient(135deg, #0A081F 0%, #1A173B 100%)';
const CARD_GRADIENT = 'linear-gradient(135deg, #1A173B 0%, #2A2660 100%)';
const BORDER_COLOR = 'rgba(120, 119, 198, 0.2)';
const HOVER_BACKGROUND = 'rgba(255, 255, 255, 0.05)';
const TABLE_HEADER_BACKGROUND = 'rgba(120, 119, 198, 0.15)';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    topRated: 0,
    outOfStock: 0,
    activeProducts: 0,
  });
  const [scrolled, setScrolled] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTablet = useMediaQuery('(max-width:960px)');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      setError(null);
      const sellerProducts = await GetSellerProducts(2);
      
      const formattedProducts: Product[] = sellerProducts.map((product: any) => ({
        id: product.id,
        title: product.title || 'Untitled Product',
        description: product.description || 'No description',
        price: product.price || 0,
        discountPercentage: product.discountPercentage || 0,
        rating: product.rating || 0,
        stock: product.stock || 0,
        brand: product.brand || 'No brand',
        category: product.category || 'uncategorized',
        thumbnail: product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/300',
        images: product.images || [product.thumbnail] || ['https://via.placeholder.com/300'],
        status: product.stock === 0 ? 'out_of_stock' : (product.status || 'active'),
        sold: product.sold || Math.floor(Math.random() * 100),
        views: product.views || Math.floor(Math.random() * 1000),
      }));
      
      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
      
      const uniqueCategories = Array.from(
        new Set(formattedProducts.map(p => p.category).filter(Boolean))
      ).sort();
      setCategories(uniqueCategories);
      
      calculateStats(formattedProducts);
      
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const calculateStats = (products: Product[]) => {
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStock = products.filter(p => p.stock < 10 && p.stock > 0).length;
    const topRated = products.filter(p => (p.rating || 0) >= 4).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const activeProducts = products.filter(p => p.status === 'active' && p.stock > 0).length;
    
    setStats({
      totalProducts: products.length,
      totalValue,
      lowStock,
      topRated,
      outOfStock,
      activeProducts,
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }
    
    setFilteredProducts(filtered);
    setPage(0);
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const handleExportData = () => {
    console.log('Exporting product data...');
  };

  const handleAddProduct = () => {
    console.log('Adding new product...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return PRIMARY_COLOR;
      case 'inactive': return alpha('#ffffff', 0.5);
      case 'out_of_stock': return ACCENT_COLOR;
      default: return alpha('#ffffff', 0.5);
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getPaginatedProducts = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: BACKGROUND_GRADIENT,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    }}>
      {/* Sticky Seller Account Menu */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1200 }}>
        <SellerAccountMenu onSearch={handleSearch} scrolled={scrolled} />
      </Box>

      {/* Changed maxWidth from "xl" to "lg" for constrained laptop view */}
      <Container maxWidth="lg" sx={{ p: 3, pt: { xs: 3, sm: 5 } }}>
        {/* Header */}
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          fontWeight="light" 
          sx={{ color: 'white', mb: 4, letterSpacing: 1 }}
        >
          📦 Product Management
        </Typography>

        {/* Stats Cards - Compact Design */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ 
              background: CARD_GRADIENT,
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: 2,
              p: 2,
              height: '100%',
              boxShadow: `0 4px 10px ${alpha(SECONDARY_COLOR, 0.2)}`,
            }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(SECONDARY_COLOR, 0.2)} 0%, ${alpha(SECONDARY_COLOR, 0.1)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${alpha(SECONDARY_COLOR, 0.3)}`,
                  }}>
                    <InventoryIcon sx={{ fontSize: 20, color: SECONDARY_COLOR }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                      {stats.totalProducts}
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), textTransform: 'uppercase' }}>
                      Total
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ 
              background: CARD_GRADIENT,
              border: `1px solid ${alpha(ACCENT_GOLD, 0.4)}`,
              borderRadius: 2,
              p: 2,
              height: '100%',
              boxShadow: `0 4px 10px ${alpha(ACCENT_GOLD, 0.15)}`,
            }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(ACCENT_GOLD, 0.2)} 0%, ${alpha(ACCENT_GOLD, 0.1)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${alpha(ACCENT_GOLD, 0.3)}`,
                  }}>
                    <AttachMoneyIcon sx={{ fontSize: 20, color: ACCENT_GOLD }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: ACCENT_GOLD }}>
                      {formatCurrency(stats.totalValue)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), textTransform: 'uppercase' }}>
                      Value
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ 
              background: CARD_GRADIENT,
              border: `1px solid ${alpha(ACCENT_ORANGE, 0.4)}`,
              borderRadius: 2,
              p: 2,
              height: '100%',
              boxShadow: `0 4px 10px ${alpha(ACCENT_ORANGE, 0.15)}`,
            }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(ACCENT_ORANGE, 0.2)} 0%, ${alpha(ACCENT_ORANGE, 0.1)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${alpha(ACCENT_ORANGE, 0.3)}`,
                  }}>
                    <TrendingUpIcon sx={{ fontSize: 20, color: ACCENT_ORANGE }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: ACCENT_ORANGE }}>
                      {stats.lowStock}
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), textTransform: 'uppercase' }}>
                      Low Stock
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ 
              background: CARD_GRADIENT,
              border: `1px solid ${alpha(ACCENT_COLOR, 0.4)}`,
              borderRadius: 2,
              p: 2,
              height: '100%',
              boxShadow: `0 4px 10px ${alpha(ACCENT_COLOR, 0.15)}`,
            }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(ACCENT_COLOR, 0.2)} 0%, ${alpha(ACCENT_COLOR, 0.1)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${alpha(ACCENT_COLOR, 0.3)}`,
                  }}>
                    <ShoppingBagIcon sx={{ fontSize: 20, color: ACCENT_COLOR }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: ACCENT_COLOR }}>
                      {stats.outOfStock}
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), textTransform: 'uppercase' }}>
                      Out of Stock
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ 
              background: CARD_GRADIENT,
              border: `1px solid ${alpha(ACCENT_GREEN, 0.4)}`,
              borderRadius: 2,
              p: 2,
              height: '100%',
              boxShadow: `0 4px 10px ${alpha(ACCENT_GREEN, 0.15)}`,
            }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(ACCENT_GREEN, 0.2)} 0%, ${alpha(ACCENT_GREEN, 0.1)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${alpha(ACCENT_GREEN, 0.3)}`,
                  }}>
                    <StarIcon sx={{ fontSize: 20, color: ACCENT_GREEN }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: ACCENT_GREEN }}>
                      {stats.topRated}
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), textTransform: 'uppercase' }}>
                      Top Rated
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ 
              background: CARD_GRADIENT,
              border: `1px solid ${alpha(PRIMARY_COLOR, 0.4)}`,
              borderRadius: 2,
              p: 2,
              height: '100%',
              boxShadow: `0 4px 10px ${alpha(PRIMARY_COLOR, 0.15)}`,
            }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(PRIMARY_COLOR, 0.2)} 0%, ${alpha(PRIMARY_COLOR, 0.1)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${alpha(PRIMARY_COLOR, 0.3)}`,
                  }}>
                    <CategoryIcon sx={{ fontSize: 20, color: PRIMARY_COLOR }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: PRIMARY_COLOR }}>
                      {stats.activeProducts}
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), textTransform: 'uppercase' }}>
                      Active
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filter Section */}
        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          background: alpha('#ffffff', 0.05),
          border: `1px solid ${BORDER_COLOR}`,
          borderRadius: 2,
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: alpha('#ffffff', 0.5) }} />
                    </InputAdornment>
                  ),
                  sx: {
                    background: alpha('#ffffff', 0.08),
                    color: 'white',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: SECONDARY_COLOR,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: SECONDARY_COLOR,
                      borderWidth: '2px',
                    },
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="medium">
                <InputLabel sx={{ color: alpha('#ffffff', 0.7), fontSize: '0.875rem' }}>Category</InputLabel>
                <Select
                  label="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{
                    background: alpha('#ffffff', 0.08),
                    color: 'white',
                    borderRadius: 1,
                    '& .MuiSelect-icon': { color: alpha('#ffffff', 0.7) },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: SECONDARY_COLOR,
                    },
                  }}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem 
                      key={category} 
                      value={category}
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {category.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="medium">
                <InputLabel sx={{ color: alpha('#ffffff', 0.7), fontSize: '0.875rem' }}>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    background: alpha('#ffffff', 0.08),
                    color: 'white',
                    borderRadius: 1,
                    '& .MuiSelect-icon': { color: alpha('#ffffff', 0.7) },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: SECONDARY_COLOR,
                    },
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={1}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ 
                  borderColor: SECONDARY_COLOR, 
                  color: SECONDARY_COLOR,
                  height: '56px',
                  borderRadius: 1,
                  minWidth: 'auto',
                  '&:hover': {
                    borderColor: PRIMARY_COLOR,
                    color: PRIMARY_COLOR,
                    backgroundColor: alpha(SECONDARY_COLOR, 0.1),
                  },
                }}
              >
                Clear
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={fetchProducts}
                disabled={isRefreshing}
                sx={{
                  background: `linear-gradient(135deg, ${SECONDARY_COLOR} 0%, #5A59A1 100%)`,
                  color: 'white',
                  height: '56px',
                  borderRadius: 1,
                  minWidth: 'auto',
                  boxShadow: `0 4px 15px ${alpha(SECONDARY_COLOR, 0.3)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, #5A59A1 0%, ${SECONDARY_COLOR} 100%)`,
                    boxShadow: `0 6px 20px ${alpha(SECONDARY_COLOR, 0.4)}`,
                  },
                }}
              >
                <RefreshIcon />
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Results and Actions */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
            Showing {filteredProducts.length} of {products.length} products
          </Typography>
        </Box>

        {/* Loading Indicator */}
        {isRefreshing && (
          <LinearProgress sx={{ 
            height: 4, 
            borderRadius: 2,
            backgroundColor: alpha(SECONDARY_COLOR, 0.2),
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(90deg, ${SECONDARY_COLOR} 0%, ${PRIMARY_COLOR} 100%)`,
            },
            mb: 2
          }} />
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 300,
            flexDirection: 'column',
            gap: 2,
          }}>
            <CircularProgress sx={{ 
              color: PRIMARY_COLOR,
              width: 40,
              height: 40,
            }} />
            <Typography sx={{ color: alpha('#ffffff', 0.7) }}>
              Loading product catalog...
            </Typography>
          </Box>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 1 }}>
                No products found. {searchTerm && 'Try a different search term or clear filters.'}
              </Alert>
            ) : (
              <Paper sx={{ 
                background: alpha('#ffffff', 0.05), 
                border: `1px solid ${BORDER_COLOR}`,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.4)'
              }}>
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ 
                        background: TABLE_HEADER_BACKGROUND,
                        '& th': { 
                          borderBottom: `2px solid ${alpha(SECONDARY_COLOR, 0.4)}`,
                          color: 'white', 
                          fontWeight: 'bolder',
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          fontSize: '0.75rem',
                          py: 2
                        }
                      }}>
                        <TableCell>PRODUCT</TableCell>
                        <TableCell>CATEGORY</TableCell>
                        <TableCell>PRICE</TableCell>
                        <TableCell>STOCK</TableCell>
                        <TableCell>RATING</TableCell>
                        <TableCell>STATUS</TableCell>
                        <TableCell align="right">ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getPaginatedProducts().map((product) => (
                        <TableRow 
                          key={product.id} 
                          hover 
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: HOVER_BACKGROUND,
                              cursor: 'pointer'
                            },
                            '& td': {
                              borderBottom: '1px solid rgba(120, 119, 198, 0.1)',
                              color: 'white',
                              py: 2
                            }
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Box
                                component="img"
                                src={product.thumbnail}
                                alt={product.title}
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  borderRadius: 1, 
                                  objectFit: 'cover',
                                  border: `1px solid ${alpha('#ffffff', 0.1)}`,
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/40';
                                }}
                              />
                              <Box sx={{ maxWidth: 200 }}>
                                <Typography variant="body2" fontWeight="medium" sx={{ color: 'white' }}>
                                  {product.title.length > 30 ? product.title.substring(0, 30) + '...' : product.title}
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                                    ID: {product.id}
                                  </Typography>
                                </Stack>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={product.category.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')} 
                              size="small" 
                              sx={{ 
                                backgroundColor: alpha(SECONDARY_COLOR, 0.2), 
                                color: SECONDARY_COLOR,
                                textTransform: 'capitalize',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>
                                ${product.price.toFixed(2)}
                              </Typography>
                              {product.discountPercentage && product.discountPercentage > 0 && (
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <LocalOfferIcon sx={{ fontSize: 12, color: ACCENT_GREEN }} />
                                  <Typography variant="caption" sx={{ color: ACCENT_GREEN }}>
                                    {product.discountPercentage}% off
                                  </Typography>
                                </Stack>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: product.stock === 0 ? ACCENT_COLOR :
                                      product.stock < 10 ? ACCENT_ORANGE : 
                                      product.stock < 50 ? ACCENT_GOLD : 'white',
                                fontWeight: product.stock < 10 ? 'bold' : 'normal',
                              }}
                            >
                              {product.stock} units
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <StarIcon sx={{ fontSize: 14, color: ACCENT_GOLD }} />
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                {product.rating?.toFixed(1) || 'N/A'}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(product.status)}
                              size="small"
                              sx={{ 
                                backgroundColor: alpha(getStatusColor(product.status), 0.2),
                                color: getStatusColor(product.status),
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                                letterSpacing: 0.5
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title="View Product" arrow>
                                <IconButton
                                  size="small"
                                  sx={{ 
                                    color: ACCENT_ORANGE,
                                    backgroundColor: alpha(ACCENT_ORANGE, 0.1),
                                    '&:hover': { 
                                      backgroundColor: alpha(ACCENT_ORANGE, 0.2),
                                    },
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Product" arrow>
                                <IconButton
                                  size="small"
                                  sx={{ 
                                    color: PRIMARY_COLOR,
                                    backgroundColor: alpha(PRIMARY_COLOR, 0.1),
                                    '&:hover': { 
                                      backgroundColor: alpha(PRIMARY_COLOR, 0.2),
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredProducts.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{ 
                    backgroundColor: alpha('#ffffff', 0.05),
                    color: 'white',
                    borderTop: `1px solid ${alpha('#ffffff', 0.1)}`,
                    '& .MuiTablePagination-selectIcon': { color: 'white' },
                    '& .MuiTablePagination-select': { 
                      color: 'white',
                      border: `1px solid ${alpha(SECONDARY_COLOR, 0.5)}`,
                      borderRadius: 1,
                      padding: '4px 8px'
                    },
                    '& .MuiTablePagination-displayedRows': { color: alpha('#ffffff', 0.7) },
                    '& .MuiTablePagination-actions button': { color: 'white' },
                  }}
                />
              </Paper>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ProductManagement;
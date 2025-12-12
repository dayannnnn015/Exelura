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
} from '@mui/icons-material';
import { GetSellerProducts } from '../API/ProductsAPI';
import SellerAccountMenu from '../components/SellerAccountMenu'; // Add this import

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

// Luxury Color Palette - Converted to use with alpha function properly
const LUXURY_COLORS = {
  primaryDark: '#0A081F',
  primaryPurple: '#7877C6',
  accentCyan: '#4ECDC4',
  accentOrange: '#F29F58',
  accentPink: '#FF6B95',
  accentGold: '#FFD166',
  accentGreen: '#06D6A0',
  darkBg: '#1A173B',
  lightBg: '#2A2660',
  white: '#FFFFFF',
  gray: 'rgba(255, 255, 255, 0.7)',
};

// Helper function to apply alpha to colors
const getColorWithAlpha = (color: string, opacity: number) => {
  // If color is in rgba format, extract the rgb values
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (match) {
      const [_, r, g, b] = match;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }
  
  // If color is in hex format, convert to rgba
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return color;
};

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
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const fetchProducts = async () => {
    try {
      setLoading(true);
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
      
      // Calculate stats
      calculateStats(formattedProducts);
      
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (products: Product[]) => {
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStock = products.filter(p => p.stock < 10).length;
    const topRated = products.filter(p => (p.rating || 0) >= 4).length;
    
    setStats({
      totalProducts: products.length,
      totalValue,
      lowStock,
      topRated,
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
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
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
    // Export functionality
    console.log('Exporting product data...');
  };

  const handleAddProduct = () => {
    // Add product functionality
    console.log('Adding new product...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'out_of_stock': return 'error';
      default: return 'default';
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

  const StatCard = ({ icon: Icon, title, value, color, subtitle }: any) => {
    const gradientColor1 = getColorWithAlpha(color, 0.1);
    const gradientColor2 = getColorWithAlpha(color, 0.05);
    const borderColor = getColorWithAlpha(color, 0.2);
    const iconBgColor1 = getColorWithAlpha(color, 0.2);
    const iconBgColor2 = getColorWithAlpha(color, 0.1);
    const iconBorderColor = getColorWithAlpha(color, 0.3);

    return (
      <Card sx={{
        background: `linear-gradient(135deg, ${gradientColor1} 0%, ${gradientColor2} 100%)`,
        border: `1px solid ${borderColor}`,
        borderRadius: 3,
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 30px ${getColorWithAlpha(color, 0.2)}`,
        },
      }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="caption" sx={{ 
                color: LUXURY_COLORS.gray, 
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.75rem',
              }}>
                {title}
              </Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 800,
                mt: 1,
                mb: 0.5,
                background: `linear-gradient(135deg, ${color} 0%, ${getColorWithAlpha(color, 0.8)} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              }}>
                {title.includes('Value') ? formatCurrency(value) : value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ color: getColorWithAlpha(color, 0.8) }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${iconBgColor1} 0%, ${iconBgColor2} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${iconBorderColor}`,
              boxShadow: `0 4px 12px ${getColorWithAlpha(color, 0.2)}`,
            }}>
              <Icon sx={{ fontSize: 28, color: color }} />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // Handle search from SellerAccountMenu
  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${LUXURY_COLORS.primaryDark} 0%, ${LUXURY_COLORS.darkBg} 100%)`,
      pt: 0, // Remove top padding since SellerAccountMenu is sticky
      pb: 4,
    }}>
      {/* Sticky Seller Account Menu */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1300 }}>
        <SellerAccountMenu onSearch={handleSearch} scrolled={true} />
      </Box>

      <Container maxWidth={isTablet ? 'lg' : 'xl'} sx={{ px: { xs: 2, sm: 3 }, mt: 3 }}>
        {/* Header Section */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{ 
              color: 'white',
              fontSize: { xs: '2rem', md: '2.5rem' },
              background: `linear-gradient(135deg, ${LUXURY_COLORS.accentCyan} 0%, ${LUXURY_COLORS.primaryPurple} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Product Management
            </Typography>
            <Typography variant="body1" sx={{ 
              color: LUXURY_COLORS.gray,
              maxWidth: 600,
            }}>
              Manage your product portfolio, inventory, and pricing with precision and elegance.
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportData}
              sx={{
                borderColor: LUXURY_COLORS.accentCyan,
                color: LUXURY_COLORS.accentCyan,
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  borderColor: LUXURY_COLORS.accentCyan,
                  backgroundColor: getColorWithAlpha(LUXURY_COLORS.accentCyan, 0.1),
                },
              }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddProduct}
              sx={{
                background: `linear-gradient(135deg, ${LUXURY_COLORS.accentCyan} 0%, #36A398 100%)`,
                color: 'white',
                borderRadius: 2,
                px: 3,
                boxShadow: `0 4px 15px ${getColorWithAlpha(LUXURY_COLORS.accentCyan, 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, #36A398 0%, ${LUXURY_COLORS.accentCyan} 100%)`,
                  boxShadow: `0 6px 20px ${getColorWithAlpha(LUXURY_COLORS.accentCyan, 0.4)}`,
                },
              }}
            >
              Add Product
            </Button>
          </Stack>
        </Stack>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={InventoryIcon}
              title="Total Products"
              value={stats.totalProducts}
              color={LUXURY_COLORS.primaryPurple}
              subtitle="Active in catalog"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={MonetizationOnIcon}
              title="Inventory Value"
              value={stats.totalValue}
              color={LUXURY_COLORS.accentGold}
              subtitle="Total stock value"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={TrendingUpIcon}
              title="Low Stock"
              value={stats.lowStock}
              color={LUXURY_COLORS.accentOrange}
              subtitle="Need replenishment"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={StarIcon}
              title="Top Rated"
              value={stats.topRated}
              color={LUXURY_COLORS.accentGreen}
              subtitle="4+ star products"
            />
          </Grid>
        </Grid>

        {/* Search and Filter Section */}
        <Paper sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: 3, 
          backgroundColor: getColorWithAlpha(LUXURY_COLORS.white, 0.05),
          border: `1px solid ${getColorWithAlpha(LUXURY_COLORS.primaryPurple, 0.2)}`,
          borderRadius: 3,
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search products by name, brand, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: getColorWithAlpha(LUXURY_COLORS.white, 0.5) }} />
                    </InputAdornment>
                  ),
                  sx: {
                    backgroundColor: getColorWithAlpha(LUXURY_COLORS.white, 0.05),
                    color: 'white',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: getColorWithAlpha(LUXURY_COLORS.white, 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: LUXURY_COLORS.primaryPurple,
                    },
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="medium">
                <InputLabel sx={{ color: LUXURY_COLORS.gray }}>Category</InputLabel>
                <Select
                  label="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{
                    backgroundColor: getColorWithAlpha(LUXURY_COLORS.white, 0.05),
                    color: 'white',
                    borderRadius: 2,
                    '& .MuiSelect-icon': { color: LUXURY_COLORS.gray },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: getColorWithAlpha(LUXURY_COLORS.white, 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: LUXURY_COLORS.primaryPurple,
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
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="medium">
                <InputLabel sx={{ color: LUXURY_COLORS.gray }}>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    backgroundColor: getColorWithAlpha(LUXURY_COLORS.white, 0.05),
                    color: 'white',
                    borderRadius: 2,
                    '& .MuiSelect-icon': { color: LUXURY_COLORS.gray },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: getColorWithAlpha(LUXURY_COLORS.white, 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: LUXURY_COLORS.primaryPurple,
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
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={handleClearFilters}
                sx={{ 
                  borderColor: LUXURY_COLORS.primaryPurple, 
                  color: LUXURY_COLORS.primaryPurple,
                  height: '56px',
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: LUXURY_COLORS.accentCyan,
                    color: LUXURY_COLORS.accentCyan,
                    backgroundColor: getColorWithAlpha(LUXURY_COLORS.primaryPurple, 0.1),
                  },
                }}
              >
                Clear Filters
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={fetchProducts}
                sx={{
                  background: `linear-gradient(135deg, ${LUXURY_COLORS.primaryPurple} 0%, #5A59A1 100%)`,
                  color: 'white',
                  height: '56px',
                  borderRadius: 2,
                  boxShadow: `0 4px 15px ${getColorWithAlpha(LUXURY_COLORS.primaryPurple, 0.3)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, #5A59A1 0%, ${LUXURY_COLORS.primaryPurple} 100%)`,
                    boxShadow: `0 6px 20px ${getColorWithAlpha(LUXURY_COLORS.primaryPurple, 0.4)}`,
                  },
                }}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Results Count */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: LUXURY_COLORS.gray }}>
            Showing {filteredProducts.length} of {products.length} products
          </Typography>
          <Badge 
            badgeContent={stats.lowStock} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                background: `linear-gradient(135deg, ${LUXURY_COLORS.accentOrange} 0%, #FF8E53 100%)`,
                boxShadow: `0 2px 8px ${getColorWithAlpha(LUXURY_COLORS.accentOrange, 0.4)}`,
              }
            }}
          >
            <Typography variant="caption" sx={{ color: LUXURY_COLORS.accentOrange }}>
              {stats.lowStock} items low in stock
            </Typography>
          </Badge>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 400,
            flexDirection: 'column',
            gap: 3,
          }}>
            <CircularProgress sx={{ 
              color: LUXURY_COLORS.primaryPurple,
              width: 60,
              height: 60,
            }} />
            <Typography sx={{ color: LUXURY_COLORS.gray }}>
              Loading your luxury product catalog...
            </Typography>
          </Box>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                No products found. {searchTerm && 'Try a different search term or clear filters.'}
              </Alert>
            ) : (
              <Paper sx={{ 
                backgroundColor: getColorWithAlpha(LUXURY_COLORS.white, 0.05), 
                border: `1px solid ${getColorWithAlpha(LUXURY_COLORS.primaryPurple, 0.2)}`,
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <TableContainer sx={{ maxHeight: { xs: 500, md: 600 } }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ 
                        background: `linear-gradient(135deg, ${getColorWithAlpha(LUXURY_COLORS.primaryPurple, 0.2)} 0%, ${getColorWithAlpha(LUXURY_COLORS.accentCyan, 0.1)} 100%)`,
                      }}>
                        <TableCell sx={{ color: 'white', fontWeight: 700, minWidth: 300 }}>Product</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Category</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Price</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Stock</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Sold</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Rating</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getPaginatedProducts().map((product) => (
                        <TableRow 
                          key={product.id} 
                          hover 
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: getColorWithAlpha(LUXURY_COLORS.primaryPurple, 0.1) 
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Box
                                component="img"
                                src={product.thumbnail}
                                alt={product.title}
                                sx={{ 
                                  width: 60, 
                                  height: 60, 
                                  borderRadius: 2, 
                                  objectFit: 'cover',
                                  border: `1px solid ${getColorWithAlpha(LUXURY_COLORS.white, 0.1)}`,
                                  boxShadow: `0 4px 12px ${getColorWithAlpha(LUXURY_COLORS.primaryDark, 0.5)}`,
                                  transition: 'transform 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                  }
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/60';
                                }}
                              />
                              <Box sx={{ maxWidth: 250 }}>
                                <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>
                                  {product.title}
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: LUXURY_COLORS.gray }}>
                                    ID: {product.id}
                                  </Typography>
                                  <Typography variant="caption" sx={{ 
                                    color: getColorWithAlpha(LUXURY_COLORS.accentGold, 0.8),
                                    fontWeight: 500,
                                  }}>
                                    • {product.brand || 'Generic'}
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
                                backgroundColor: getColorWithAlpha(LUXURY_COLORS.primaryPurple, 0.2), 
                                color: LUXURY_COLORS.primaryPurple,
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
                                  <LocalOfferIcon sx={{ fontSize: 14, color: LUXURY_COLORS.accentGreen }} />
                                  <Typography variant="caption" sx={{ color: LUXURY_COLORS.accentGreen }}>
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
                                color: product.stock < 10 ? LUXURY_COLORS.accentOrange : 
                                      product.stock < 50 ? LUXURY_COLORS.accentGold : 'white',
                                fontWeight: product.stock < 10 ? 'bold' : 'normal',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              {product.stock}
                              <Typography variant="caption" sx={{ color: LUXURY_COLORS.gray }}>
                                units
                              </Typography>
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              {product.sold || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <StarIcon sx={{ fontSize: 16, color: LUXURY_COLORS.accentGold }} />
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                {product.rating?.toFixed(1) || 'N/A'}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(product.status)}
                              size="small"
                              color={getStatusColor(product.status) as any}
                              sx={{ 
                                fontWeight: 'bold',
                                fontSize: '0.7rem',
                                height: 24,
                                minWidth: 90,
                                boxShadow: `0 2px 8px ${
                                  getStatusColor(product.status) === 'success' ? getColorWithAlpha(LUXURY_COLORS.accentGreen, 0.3) : 
                                  getStatusColor(product.status) === 'error' ? getColorWithAlpha(LUXURY_COLORS.accentPink, 0.3) : 
                                  getColorWithAlpha(LUXURY_COLORS.accentOrange, 0.3)
                                }`,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View Product" arrow>
                                <IconButton
                                  size="small"
                                  sx={{ 
                                    color: LUXURY_COLORS.accentCyan,
                                    backgroundColor: getColorWithAlpha(LUXURY_COLORS.accentCyan, 0.1),
                                    '&:hover': { 
                                      backgroundColor: getColorWithAlpha(LUXURY_COLORS.accentCyan, 0.2),
                                      transform: 'scale(1.1)',
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
                                    color: LUXURY_COLORS.accentOrange,
                                    backgroundColor: getColorWithAlpha(LUXURY_COLORS.accentOrange, 0.1),
                                    '&:hover': { 
                                      backgroundColor: getColorWithAlpha(LUXURY_COLORS.accentOrange, 0.2),
                                      transform: 'scale(1.1)',
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
                    backgroundColor: getColorWithAlpha(LUXURY_COLORS.white, 0.05),
                    color: 'white',
                    borderTop: `1px solid ${getColorWithAlpha(LUXURY_COLORS.white, 0.1)}`,
                    '& .MuiTablePagination-selectIcon': { color: 'white' },
                    '& .MuiTablePagination-select': { color: 'white' },
                    '& .MuiTablePagination-displayedRows': { color: LUXURY_COLORS.gray },
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
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  alpha,
  CircularProgress,
  Alert,
  // SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { GetSellerProducts, AddSellerProduct, DeleteSellerProduct, UpdateSellerProductStock } from '../API/ProductsAPI';

// Define product interface matching API response
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
  sellerId?: number;
  sellerInfo?: any;
  status: 'active' | 'inactive' | 'out_of_stock';
  sold?: number;
  createdAt?: string;
  updatedAt?: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const sellerProducts = await GetSellerProducts(2); // Always seller 2
      console.log('Fetched products:', sellerProducts.length);
      
      // Convert to Product format and ensure status field
      const formattedProducts: Product[] = sellerProducts.map((product: any) => ({
        id: product.id,
        title: product.title || 'Untitled Product',
        description: product.description || 'No description',
        price: product.price || 0,
        discountPercentage: product.discountPercentage,
        rating: product.rating,
        stock: product.stock || 0,
        brand: product.brand,
        category: product.category || 'uncategorized',
        thumbnail: product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/300',
        images: product.images || [product.thumbnail] || ['https://via.placeholder.com/300'],
        sellerId: product.sellerId || 2,
        sellerInfo: product.sellerInfo,
        status: product.stock === 0 ? 'out_of_stock' : (product.status || 'active'),
        sold: product.sold || 0,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));
      
      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(formattedProducts.map(p => p.category).filter(Boolean))
      ).sort();
      setCategories(uniqueCategories);
      
      // Calculate statistics
      calculateStats(formattedProducts);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productsList: Product[]) => {
    const totalProducts = productsList.length;
    const totalRevenue = productsList.reduce((sum, product) => 
      sum + (product.price * (product.sold || 0)), 0);
    const lowStockCount = productsList.filter(p => p.stock < 10 && p.stock > 0).length;
    const outOfStockCount = productsList.filter(p => p.stock === 0).length;
    
    setStats({
      totalProducts,
      totalRevenue,
      lowStockCount,
      outOfStockCount,
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search, category, and status
  useEffect(() => {
    let filtered = [...products];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }
    
    setFilteredProducts(filtered);
    // Reset to first page when filters change
    setPage(0);
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
    } else {
      setEditingProduct(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        // Update product
        const response = await UpdateSellerProductStock(editingProduct.id, productData.stock || 0);
        if (response.success) {
          await fetchProducts(); // Refresh the list
        }
      } else {
        // Add new product
        const response = await AddSellerProduct(productData);
        if (response.success) {
          await fetchProducts(); // Refresh the list
        }
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product. Please try again.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await DeleteSellerProduct(id);
        if (response.success) {
          await fetchProducts(); // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product. Please try again.');
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategoryFilter(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
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

  // Function to get paginated products
  const getPaginatedProducts = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #0A081F 0%, #1A173B 100%)', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
              Product Management
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
              Manage your products, inventory, and pricing • {stats.totalProducts} products
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchProducts}
              sx={{
                color: '#7877C6',
                borderColor: '#7877C6',
                '&:hover': {
                  borderColor: '#5A59A1',
                  backgroundColor: alpha('#7877C6', 0.1),
                },
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #5A59A1 0%, #7877C6 100%)' },
              }}
            >
              Add Product
            </Button>
          </Stack>
        </Stack>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 2.5, 
              background: alpha('#ffffff', 0.05),
              border: '1px solid rgba(120, 119, 198, 0.2)',
              borderRadius: 2,
            }}>
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 1 }}>
                Total Products
              </Typography>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {stats.totalProducts}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 2.5, 
              background: alpha('#ffffff', 0.05),
              border: '1px solid rgba(120, 119, 198, 0.2)',
              borderRadius: 2,
            }}>
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 1 }}>
                Total Revenue
              </Typography>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                ${stats.totalRevenue.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 2.5, 
              background: alpha('#ffffff', 0.05),
              border: '1px solid rgba(120, 119, 198, 0.2)',
              borderRadius: 2,
            }}>
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 1 }}>
                Low Stock
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFD166', fontWeight: 'bold' }}>
                {stats.lowStockCount}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 2.5, 
              background: alpha('#ffffff', 0.05),
              border: '1px solid rgba(120, 119, 198, 0.2)',
              borderRadius: 2,
            }}>
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 1 }}>
                Out of Stock
              </Typography>
              <Typography variant="h4" sx={{ color: '#EF476F', fontWeight: 'bold' }}>
                {stats.outOfStockCount}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ 
          p: 2.5, 
          mb: 3, 
          background: alpha('#ffffff', 0.05), 
          border: '1px solid rgba(120, 119, 198, 0.2)',
          borderRadius: 2,
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search products by title, description, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: alpha('#ffffff', 0.5) }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: alpha('#ffffff', 0.08),
                    color: 'white',
                    borderRadius: 1,
                    '& fieldset': {
                      borderColor: alpha('#ffffff', 0.2),
                    },
                    '&:hover fieldset': {
                      borderColor: alpha('#ffffff', 0.4),
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#7877C6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: alpha('#ffffff', 0.7),
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: alpha('#ffffff', 0.7) }}>Category</InputLabel>
                <Select
                  label="Category"
                  value={categoryFilter}
                  onChange={handleCategoryChange}
                  sx={{
                    background: alpha('#ffffff', 0.08),
                    color: 'white',
                    borderRadius: 1,
                    '& .MuiSelect-icon': { color: alpha('#ffffff', 0.5) },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha('#ffffff', 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha('#ffffff', 0.4),
                    },
                  }}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem 
                      key={category} 
                      value={category}
                      sx={{
                        textTransform: 'capitalize',
                      }}
                    >
                      {category.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: alpha('#ffffff', 0.7) }}>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={handleStatusChange}
                  sx={{
                    background: alpha('#ffffff', 0.08),
                    color: 'white',
                    borderRadius: 1,
                    '& .MuiSelect-icon': { color: alpha('#ffffff', 0.5) },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha('#ffffff', 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha('#ffffff', 0.4),
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
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={handleClearFilters}
                sx={{ 
                  borderColor: '#7877C6', 
                  color: '#7877C6',
                  height: '40px',
                  borderRadius: 1,
                  '&:hover': {
                    borderColor: '#5A59A1',
                    backgroundColor: alpha('#7877C6', 0.1),
                  },
                }}
              >
                Clear Filters
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), textAlign: 'center' }}>
                Showing {filteredProducts.length} of {products.length} products
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Products Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress sx={{ color: '#7877C6' }} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ 
            background: alpha('#ffffff', 0.05), 
            border: '1px solid rgba(120, 119, 198, 0.2)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: alpha('#7877C6', 0.1) }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Product</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Category</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Price</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Stock</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Sold</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getPaginatedProducts().map((product) => (
                  <TableRow 
                    key={product.id} 
                    hover 
                    sx={{ 
                      '&:hover': { background: alpha('#ffffff', 0.05) },
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          component="img"
                          src={product.thumbnail}
                          alt={product.title}
                          sx={{ 
                            width: 50, 
                            height: 50, 
                            borderRadius: 1, 
                            objectFit: 'cover',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/50';
                          }}
                        />
                        <Box sx={{ maxWidth: 250 }}>
                          <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>
                            {product.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5), display: 'block' }}>
                            ID: {product.id} • {product.brand || 'No brand'}
                          </Typography>
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
                          background: alpha('#7877C6', 0.2), 
                          color: '#7877C6',
                          textTransform: 'capitalize',
                          fontWeight: 500,
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: 'white' }}>
                          ${product.price.toFixed(2)}
                        </Typography>
                        {product.discountPercentage && product.discountPercentage > 0 && (
                          <Typography variant="caption" sx={{ color: '#06D6A0' }}>
                            {product.discountPercentage}% off
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: product.stock < 10 ? '#FFD166' : 'white',
                            fontWeight: product.stock < 10 ? 'bold' : 'normal',
                          }}
                        >
                          {product.stock}
                        </Typography>
                        {product.stock < 10 && product.stock > 0 && (
                          <Chip 
                            label="Low" 
                            size="small" 
                            sx={{ 
                              background: alpha('#FFD166', 0.2), 
                              color: '#FFD166',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              height: 20,
                            }} 
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {product.sold || 0}
                      </Typography>
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
                          minWidth: 80,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(product);
                          }}
                          sx={{ 
                            color: '#7877C6',
                            background: alpha('#7877C6', 0.1),
                            '&:hover': {
                              background: alpha('#7877C6', 0.2),
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(product.id);
                          }}
                          sx={{ 
                            color: '#EF476F',
                            background: alpha('#EF476F', 0.1),
                            '&:hover': {
                              background: alpha('#EF476F', 0.2),
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredProducts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ 
                color: 'white',
                background: alpha('#ffffff', 0.05),
                '& .MuiTablePagination-selectIcon': {
                  color: 'white',
                },
                '& .MuiTablePagination-select': {
                  color: 'white',
                },
                '& .MuiTablePagination-displayedRows': {
                  color: 'white',
                },
              }}
            />
          </TableContainer>
        )}

        {/* Product Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #1A173B 0%, #2A2660 100%)', 
            color: 'white',
            borderBottom: '1px solid rgba(120, 119, 198, 0.3)',
          }}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent sx={{ 
            background: '#1A173B', 
            color: 'white',
            py: 3,
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Title"
                  defaultValue={editingProduct?.title || ''}
                  sx={{ 
                    '& .MuiInputLabel-root': { color: alpha('#ffffff', 0.7) },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: alpha('#ffffff', 0.2) },
                      '&:hover fieldset': { borderColor: alpha('#ffffff', 0.4) },
                      '&.Mui-focused fieldset': { borderColor: '#7877C6' },
                    },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  defaultValue={editingProduct?.description || ''}
                  sx={{ 
                    '& .MuiInputLabel-root': { color: alpha('#ffffff', 0.7) },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: alpha('#ffffff', 0.2) },
                      '&:hover fieldset': { borderColor: alpha('#ffffff', 0.4) },
                      '&.Mui-focused fieldset': { borderColor: '#7877C6' },
                    },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price ($)"
                  defaultValue={editingProduct?.price || 0}
                  InputProps={{ 
                    inputProps: { min: 0, step: 0.01 },
                    startAdornment: <Typography sx={{ color: alpha('#ffffff', 0.7), mr: 1 }}>$</Typography>,
                  }}
                  sx={{ 
                    '& .MuiInputLabel-root': { color: alpha('#ffffff', 0.7) },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: alpha('#ffffff', 0.2) },
                      '&:hover fieldset': { borderColor: alpha('#ffffff', 0.4) },
                      '&.Mui-focused fieldset': { borderColor: '#7877C6' },
                    },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stock Quantity"
                  defaultValue={editingProduct?.stock || 0}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ 
                    '& .MuiInputLabel-root': { color: alpha('#ffffff', 0.7) },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: alpha('#ffffff', 0.2) },
                      '&:hover fieldset': { borderColor: alpha('#ffffff', 0.4) },
                      '&.Mui-focused fieldset': { borderColor: '#7877C6' },
                    },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: alpha('#ffffff', 0.7) }}>Category</InputLabel>
                  <Select
                    label="Category"
                    defaultValue={editingProduct?.category || ''}
                    sx={{ 
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#ffffff', 0.2),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#ffffff', 0.4),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#7877C6',
                      },
                      '& .MuiSelect-icon': { color: alpha('#ffffff', 0.7) },
                    }}
                  >
                    <MenuItem value="smartphones">Smartphones</MenuItem>
                    <MenuItem value="laptops">Laptops</MenuItem>
                    <MenuItem value="fragrances">Fragrances</MenuItem>
                    <MenuItem value="beauty">Beauty</MenuItem>
                    <MenuItem value="groceries">Groceries</MenuItem>
                    <MenuItem value="home-decoration">Home Decoration</MenuItem>
                    <MenuItem value="furniture">Furniture</MenuItem>
                    <MenuItem value="womens-dresses">Women's Dresses</MenuItem>
                    <MenuItem value="womens-shoes">Women's Shoes</MenuItem>
                    <MenuItem value="mens-shirts">Men's Shirts</MenuItem>
                    <MenuItem value="mens-shoes">Men's Shoes</MenuItem>
                    <MenuItem value="mens-watches">Men's Watches</MenuItem>
                    <MenuItem value="womens-watches">Women's Watches</MenuItem>
                    <MenuItem value="womens-bags">Women's Bags</MenuItem>
                    <MenuItem value="womens-jewellery">Women's Jewellery</MenuItem>
                    <MenuItem value="sunglasses">Sunglasses</MenuItem>
                    <MenuItem value="vehicle">Vehicle</MenuItem>
                    <MenuItem value="motorcycle">Motorcycle</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: alpha('#ffffff', 0.7) }}>Status</InputLabel>
                  <Select
                    label="Status"
                    defaultValue={editingProduct?.status || 'active'}
                    sx={{ 
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#ffffff', 0.2),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha('#ffffff', 0.4),
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#7877C6',
                      },
                      '& .MuiSelect-icon': { color: alpha('#ffffff', 0.7) },
                    }}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URLs (one per line or comma separated)"
                  defaultValue={editingProduct?.images?.join('\n') || ''}
                  multiline
                  rows={3}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  sx={{ 
                    '& .MuiInputLabel-root': { color: alpha('#ffffff', 0.7) },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: alpha('#ffffff', 0.2) },
                      '&:hover fieldset': { borderColor: alpha('#ffffff', 0.4) },
                      '&.Mui-focused fieldset': { borderColor: '#7877C6' },
                    },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            background: '#1A173B', 
            borderTop: '1px solid rgba(120, 119, 198, 0.2)',
            py: 2,
            px: 3,
          }}>
            <Button 
              onClick={handleCloseDialog} 
              sx={{ 
                color: alpha('#ffffff', 0.7),
                '&:hover': {
                  color: 'white',
                  backgroundColor: alpha('#ffffff', 0.1),
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                // In a real app, you would get form data here
                handleSaveProduct({
                  title: 'New Product',
                  description: 'Premium product description',
                  price: 99.99,
                  stock: 50,
                  category: 'smartphones',
                  status: 'active',
                  images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=400&fit=crop']
                });
              }}
              sx={{
                background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                color: 'white',
                fontWeight: 'bold',
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5A59A1 0%, #7877C6 100%)',
                },
              }}
            >
              {editingProduct ? 'Update' : 'Create'} Product
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ProductManagement;
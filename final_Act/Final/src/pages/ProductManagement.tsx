import React, { useState } from 'react';
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
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { useUserStore, type SellerProduct } from '../store/userStore';

const ProductManagement = () => {
  const { sellerProducts, addSellerProduct, updateSellerProduct, deleteSellerProduct } = useUserStore();
  const [products, setProducts] = useState<SellerProduct[]>(sellerProducts);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleOpenDialog = (product?: SellerProduct) => {
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

  const handleSaveProduct = (productData: Partial<SellerProduct>) => {
    if (editingProduct) {
      updateSellerProduct(editingProduct.id, productData);
      setProducts(prev =>
        prev.map(p => (p.id === editingProduct.id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p))
      );
    } else {
      const newProduct = {
        ...productData,
        id: Date.now(),
        sold: 0,
        rating: 0,
        images: productData.images || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as SellerProduct;
      
      addSellerProduct(newProduct);
      setProducts(prev => [...prev, newProduct]);
    }
    handleCloseDialog();
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteSellerProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #0A081F 0%, #1A173B 100%)', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Product Management
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7) }}>
              Manage your products, inventory, and pricing
            </Typography>
          </Box>
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

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, background: alpha('#ffffff', 0.05), border: '1px solid rgba(120, 119, 198, 0.2)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: alpha('#ffffff', 0.5) }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: alpha('#ffffff', 0.05),
                    color: 'white',
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
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{
                    background: alpha('#ffffff', 0.05),
                    color: 'white',
                    '& .MuiSelect-icon': { color: alpha('#ffffff', 0.5) },
                  }}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
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
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    background: alpha('#ffffff', 0.05),
                    color: 'white',
                    '& .MuiSelect-icon': { color: alpha('#ffffff', 0.5) },
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
                onClick={() => {
                  // Reset filters
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
                sx={{ borderColor: '#7877C6', color: '#7877C6' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Products Table */}
        <TableContainer component={Paper} sx={{ background: alpha('#ffffff', 0.05), border: '1px solid rgba(120, 119, 198, 0.2)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: alpha('#7877C6', 0.1) }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stock</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sold</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                <TableRow key={product.id} hover sx={{ '&:hover': { background: alpha('#ffffff', 0.05) } }}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        component="img"
                        src={product.images[0] || 'https://via.placeholder.com/50'}
                        alt={product.title}
                        sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {product.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>
                          ID: {product.id}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={product.category} size="small" sx={{ background: alpha('#7877C6', 0.2), color: '#7877C6' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      ${product.price.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2">{product.stock}</Typography>
                      {product.stock < 10 && (
                        <Chip label="Low" size="small" color="warning" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.sold}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.status.toUpperCase()}
                      size="small"
                      color={
                        product.status === 'active' ? 'success' :
                        product.status === 'inactive' ? 'default' : 'error'
                      }
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
                      >
                        <EditIcon fontSize="small" sx={{ color: '#7877C6' }} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" sx={{ color: '#FF6B95' }} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ 
              color: 'white',
              '& .MuiTablePagination-selectIcon': {
                color: 'white',
              }
            }}
          />
        </TableContainer>

        {/* Product Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ background: 'linear-gradient(135deg, #1A173B 0%, #2A2660 100%)', color: 'white' }}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent sx={{ background: '#1A173B', color: 'white' }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
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
                    },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  defaultValue={editingProduct?.description || ''}
                  sx={{ 
                    '& .MuiInputLabel-root': { color: alpha('#ffffff', 0.7) },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: alpha('#ffffff', 0.2) },
                      '&:hover fieldset': { borderColor: alpha('#ffffff', 0.4) },
                    },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price"
                  defaultValue={editingProduct?.price || 0}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  sx={{ 
                    '& .MuiInputLabel-root': { color: alpha('#ffffff', 0.7) },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: alpha('#ffffff', 0.2) },
                      '&:hover fieldset': { borderColor: alpha('#ffffff', 0.4) },
                    },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stock"
                  defaultValue={editingProduct?.stock || 0}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ 
                    '& .MuiInputLabel-root': { color: alpha('#ffffff', 0.7) },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: alpha('#ffffff', 0.2) },
                      '&:hover fieldset': { borderColor: alpha('#ffffff', 0.4) },
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
                  label="Image URLs (comma separated)"
                  defaultValue={editingProduct?.images?.join(', ') || ''}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  sx={{ 
                    '& .MuiInputLabel-root': { color: alpha('#ffffff', 0.7) },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: alpha('#ffffff', 0.2) },
                      '&:hover fieldset': { borderColor: alpha('#ffffff', 0.4) },
                    },
                    '& .MuiInputBase-input': { color: 'white' }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ background: '#1A173B', borderTop: '1px solid rgba(120, 119, 198, 0.2)' }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#FF6B95' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                // In a real app, you would get form data here
                handleSaveProduct({
                  title: 'New Product',
                  description: 'Product description',
                  price: 99.99,
                  stock: 10,
                  category: 'smartphones',
                  status: 'active',
                  images: ['https://via.placeholder.com/300']
                });
              }}
              sx={{
                background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
                color: 'white',
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
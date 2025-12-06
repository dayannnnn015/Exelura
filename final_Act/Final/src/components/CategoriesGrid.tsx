import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    IconButton,
    Chip,
    Tooltip,
    useTheme,
    useMediaQuery,
    Button,
    Stack,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ChevronRight,
    TrendingUp,
    LocalOffer,
    NewReleases,
    Category,
    FilterList
} from '@mui/icons-material';
import { GetCategories } from '../API/ProductsAPI';

// --- STYLED COMPONENTS ---

const CategoriesContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    maxWidth: 1200,
    margin: '0 auto',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: theme.spacing(4),
    border: '1px solid rgba(212, 175, 55, 0.2)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    overflow: 'hidden',
}));

const CategoryCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: 8,
    border: '1px solid rgba(212, 175, 55, 0.1)',
    backgroundColor: '#FFFEF9',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(212, 175, 55, 0.2)',
        borderColor: '#D4AF37',
        backgroundColor: '#FFFDF5',
    },
}));

const CategoryIcon = styled(Box)(({ theme }) => ({
    fontSize: '2.5rem',
    lineHeight: 1,
    marginBottom: theme.spacing(1),
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
}));

// --- MAIN COMPONENT ---

const CategoriesGrid = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'trending' | 'popular'>('all');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await GetCategories();
            // Add trending and popular flags for filtering
            const enhancedData = data.map((cat: any, index: number) => ({
                ...cat,
                isTrending: index < 6, // First 6 are trending
                isPopular: index % 3 === 0, // Every 3rd is popular
                productCount: Math.floor(Math.random() * 500) + 50 // Mock product count
            }));
            setCategories(enhancedData);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (category: any) => {
        setSelectedCategory(category.name);
        // You can add navigation logic here
        console.log('Category selected:', category);
        // Example: router.push(`/products?category=${category.name}`);
    };

    const filteredCategories = categories.filter(cat => {
        if (filter === 'trending') return cat.isTrending;
        if (filter === 'popular') return cat.isPopular;
        return true;
    });

    const renderCategoryCard = (category: any) => (
        <Grid key={category.id} item xs={6} sm={4} md={3} lg={2.4}>
            <Tooltip title={`Browse ${category.productCount} products`} arrow>
                <CategoryCard onClick={() => handleCategoryClick(category)}>
                    <CategoryIcon sx={{ color: category.color }}>
                        {category.icon}
                    </CategoryIcon>
                    
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: '#333',
                            textAlign: 'center',
                            mb: 0.5,
                            lineHeight: 1.2,
                        }}
                    >
                        {category.displayName}
                    </Typography>
                    
                    <Chip
                        label={`${category.productCount}+`}
                        size="small"
                        sx={{
                            fontSize: '0.7rem',
                            height: 20,
                            backgroundColor: 'rgba(212, 175, 55, 0.1)',
                            color: '#D4AF37',
                            fontWeight: 600,
                            mt: 1,
                        }}
                    />
                    
                    {category.isTrending && (
                        <Chip
                            icon={<TrendingUp fontSize="small" />}
                            label="Trending"
                            size="small"
                            color="success"
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                fontSize: '0.6rem',
                                height: 20,
                            }}
                        />
                    )}
                    
                    {category.isPopular && (
                        <Chip
                            icon={<LocalOffer fontSize="small" />}
                            label="Popular"
                            size="small"
                            color="primary"
                            sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                fontSize: '0.6rem',
                                height: 20,
                            }}
                        />
                    )}
                </CategoryCard>
            </Tooltip>
        </Grid>
    );

    if (loading) {
        return (
            <CategoriesContainer sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress sx={{ color: '#D4AF37' }} />
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Loading categories...
                </Typography>
            </CategoriesContainer>
        );
    }

    return (
        <CategoriesContainer>
            {/* Header */}
            <Box sx={{
                p: 3,
                borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
                backgroundColor: '#FFFDF5',
            }}>
                <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Category sx={{ fontSize: 32, color: '#D4AF37' }} />
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="#333">
                                Shop by Category
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Browse {categories.length} categories with {categories.reduce((sum, cat) => sum + cat.productCount, 0).toLocaleString()}+ products
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant={filter === 'all' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => setFilter('all')}
                            startIcon={<FilterList />}
                            sx={{
                                backgroundColor: filter === 'all' ? '#D4AF37' : 'transparent',
                                color: filter === 'all' ? 'white' : '#D4AF37',
                                borderColor: '#D4AF37',
                                '&:hover': {
                                    backgroundColor: filter === 'all' ? '#C19B2E' : 'rgba(212, 175, 55, 0.1)',
                                },
                            }}
                        >
                            All
                        </Button>
                        <Button
                            variant={filter === 'trending' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => setFilter('trending')}
                            startIcon={<TrendingUp />}
                            sx={{
                                backgroundColor: filter === 'trending' ? '#4CAF50' : 'transparent',
                                color: filter === 'trending' ? 'white' : '#4CAF50',
                                borderColor: '#4CAF50',
                                '&:hover': {
                                    backgroundColor: filter === 'trending' ? '#388E3C' : 'rgba(76, 175, 80, 0.1)',
                                },
                            }}
                        >
                            Trending
                        </Button>
                        <Button
                            variant={filter === 'popular' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => setFilter('popular')}
                            startIcon={<LocalOffer />}
                            sx={{
                                backgroundColor: filter === 'popular' ? '#2196F3' : 'transparent',
                                color: filter === 'popular' ? 'white' : '#2196F3',
                                borderColor: '#2196F3',
                                '&:hover': {
                                    backgroundColor: filter === 'popular' ? '#1976D2' : 'rgba(33, 150, 243, 0.1)',
                                },
                            }}
                        >
                            Popular
                        </Button>
                    </Stack>
                </Stack>
            </Box>
            
            {/* Categories Grid */}
            <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                    {filteredCategories.map(renderCategoryCard)}
                </Grid>
                
                {filteredCategories.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <NewReleases sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No categories found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try a different filter or check back later
                        </Typography>
                    </Paper>
                )}
                
                {/* View All Button */}
                {filter !== 'all' && (
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Button
                            variant="text"
                            endIcon={<ChevronRight />}
                            onClick={() => setFilter('all')}
                            sx={{
                                color: '#D4AF37',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                },
                            }}
                        >
                            View All {categories.length} Categories
                        </Button>
                    </Box>
                )}
            </Box>
        </CategoriesContainer>
    );
};

export default CategoriesGrid;
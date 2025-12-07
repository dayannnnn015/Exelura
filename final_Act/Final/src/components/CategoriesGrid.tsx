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
    CircularProgress,
    Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ChevronRight,
    TrendingUp,
    NewReleases,
    Category,
} from '@mui/icons-material';
import { GetCategories } from '../API/ProductsAPI';

// Define props interface
interface CategoriesGridProps {
    onSelectCategory: (categorySlug: string) => void; 
}

// --- STYLED COMPONENTS ---

const CategoriesContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    height: 300,
    borderRadius: 12, 
    backgroundColor: '#FFFFFF',
    marginBottom: theme.spacing(0), 
    border: '1px solid rgba(212, 175, 55, 0.2)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
    overflow: 'hidden',
}));

const CategoryCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1.5), 
    borderRadius: 8,
    border: '1px solid rgba(212, 175, 55, 0.1)',
    backgroundColor: '#FFFEF9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: '#F5F5F0',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    },
}));

// Define category type
interface CategoryType {
    id: number;
    name: string;
    slug: string;
    displayName: string;
    icon: string;
    color: string;
    isPopular: boolean;
    isNew: boolean;
}

// --- MAIN COMPONENT ---
const CategoriesGrid: React.FC<CategoriesGridProps> = ({ onSelectCategory }) => { 
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'new' | 'popular'>('all');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const data = await GetCategories();
                // Cast the data to CategoryType[]
                setCategories(data as CategoryType[]);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = (category: CategoryType) => {
        // Pass the category slug to filter products
        onSelectCategory(category.slug || category.name);
    };

    const filteredCategories = categories.filter(category => {
        if (filter === 'all') return true;
        if (filter === 'new' && category.isNew) return true;
        if (filter === 'popular' && category.isPopular) return true;
        return false;
    });

    // Add "All" chip to the filter options
    const FilterChip = ({ value, label, icon }: { value: 'all' | 'new' | 'popular', label: string, icon: React.ReactElement }) => (
        <Chip 
            label={label} 
            onClick={() => setFilter(value)} 
            icon={icon} 
            color={filter === value ? 'warning' : 'default'}
            variant={filter === value ? 'filled' : 'outlined'}
            size="small"
            sx={{ cursor: 'pointer', borderColor: '#D4AF37' }}
        />
    );

    return (
        <CategoriesContainer> 
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography 
                        variant="h6" 
                        fontWeight={700}
                        sx={{ color: '#333' }}
                    >
                        <Category sx={{ verticalAlign: 'middle', mr: 1, color: '#D4AF37' }} />
                        Product Categories
                    </Typography>
                </Box>

                {/* Filter Chips */}
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <FilterChip value="all" label="All" icon={<Category />} />
                    <FilterChip value="popular" label="Popular" icon={<TrendingUp />} />
                    <FilterChip value="new" label="New" icon={<NewReleases />} />
                </Stack>

                {/* Categories Grid */}
                <Box sx={{ height: 200, overflowY: 'auto', pr: 1 }}>
                    <Grid container spacing={1}>
                        {isLoading ? (
                            // Loading skeletons
                            Array.from(new Array(8)).map((_, index) => (
                                <Grid item xs={12} key={index}>
                                    <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
                                </Grid>
                            ))
                        ) : filteredCategories.length > 0 ? (
                            filteredCategories.slice(0, 8).map((category) => ( 
                                <Grid item xs={12} key={category.id}> 
                                    <CategoryCard 
                                        elevation={0} 
                                        onClick={() => handleCategoryClick(category)}
                                        sx={{
                                            borderLeft: `3px solid ${category.color}`
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography sx={{ fontSize: '1.2rem' }}>
                                                {category.icon}
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                fontWeight={600}
                                                sx={{ color: '#555' }}
                                            >
                                                {category.displayName}
                                            </Typography>
                                            {category.isNew && (
                                                <Chip 
                                                    label="New" 
                                                    size="small" 
                                                    color="success"
                                                    sx={{ height: 18, fontSize: '0.6rem' }}
                                                />
                                            )}
                                            {category.isPopular && (
                                                <Chip 
                                                    label="Popular" 
                                                    size="small" 
                                                    color="warning"
                                                    sx={{ height: 18, fontSize: '0.6rem' }}
                                                />
                                            )}
                                        </Box>
                                        <ChevronRight fontSize="small" sx={{ color: '#D4AF37' }} />
                                    </CategoryCard>
                                </Grid>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                No categories found.
                            </Typography>
                        )}
                    </Grid>
                </Box>
            </Box>
        </CategoriesContainer>
    );
};

export default CategoriesGrid;
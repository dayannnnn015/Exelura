import React from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Chip,
    Button,
    Stack,
    Skeleton,
    alpha,
    IconButton,
    Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ChevronRight,
    TrendingUp,
    NewReleases,
    Category,
    Clear,
    ExpandMore,
} from '@mui/icons-material';
import { GetCategories } from '../API/ProductsAPI';

const CategoriesContainer = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(180deg, rgba(15, 12, 41, 0.9) 0%, rgba(48, 43, 99, 0.8) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    border: '1px solid rgba(120, 119, 198, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    height: 'fit-content',
    transition: 'all 0.3s ease',
    WebkitBackdropFilter: 'blur(10px)',
}));

const CategoryCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1.25),
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
        background: 'rgba(120, 119, 198, 0.2)',
        transform: 'translateX(4px)',
        borderColor: 'rgba(120, 119, 198, 0.4)',
    }
}));

const CompactChip = styled(Chip)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '0.65rem',
    height: 20,
    '& .MuiChip-label': {
        paddingLeft: 6,
        paddingRight: 6,
    }
}));

interface CategoriesGridProps {
    onSelectCategory: (categorySlug: string) => void;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({ onSelectCategory }) => {
    const [categories, setCategories] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<'all' | 'new' | 'popular'>('all');
    const [selectedCategory, setSelectedCategory] = React.useState<string>('');
    const [visibleCount, setVisibleCount] = React.useState(8); // Start with 8 items

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const data = await GetCategories();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const filteredCategories = categories.filter(category => {
        if (filter === 'all') return true;
        if (filter === 'new' && category.isNew) return true;
        if (filter === 'popular' && category.isPopular) return true;
        return false;
    });

    const handleCategoryClick = (category: any) => {
        setSelectedCategory(category.slug);
        onSelectCategory(category.slug);
    };

    const handleClearFilter = () => {
        setSelectedCategory('');
        setFilter('all');
        onSelectCategory('');
    };

    const handleViewMore = () => {
        setVisibleCount(prev => prev + 8); // Load 8 more categories
    };

    const handleViewLess = () => {
        setVisibleCount(8); // Reset to initial 8
    };

    return (
        <CategoriesContainer elevation={0}>
            <Box sx={{ p: 2 }}>
                {/* Header */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2 
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Category sx={{ 
                            color: '#7877C6', 
                            fontSize: 20 
                        }} />
                        <Typography 
                            variant="subtitle1" 
                            fontWeight={600}
                            sx={{ 
                                color: 'white',
                                fontSize: '0.95rem',
                            }}
                        >
                            Categories
                        </Typography>
                    </Box>
                    
                    {selectedCategory && (
                        <Tooltip title="Clear filter" arrow>
                            <IconButton
                                size="small"
                                onClick={handleClearFilter}
                                sx={{
                                    color: '#FF6B95',
                                    '&:hover': {
                                        backgroundColor: alpha('#FF6B95', 0.1),
                                    }
                                }}
                            >
                                <Clear fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* Filter Chips */}
                <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
                    <CompactChip
                        label="All"
                        onClick={() => setFilter('all')}
                        color={filter === 'all' ? 'primary' : 'default'}
                        variant={filter === 'all' ? 'filled' : 'outlined'}
                        size="small"
                        sx={{
                            backgroundColor: filter === 'all' 
                                ? alpha('#7877C6', 0.2) 
                                : 'transparent',
                            color: filter === 'all' ? '#7877C6' : alpha('#FFFFFF', 0.6),
                            borderColor: filter === 'all' 
                                ? alpha('#7877C6', 0.3) 
                                : 'rgba(255, 255, 255, 0.1)',
                        }}
                    />
                    <CompactChip
                        label="Trending"
                        onClick={() => setFilter('popular')}
                        color={filter === 'popular' ? 'primary' : 'default'}
                        variant={filter === 'popular' ? 'filled' : 'outlined'}
                        size="small"
                        sx={{
                            backgroundColor: filter === 'popular' 
                                ? alpha('#FF6B95', 0.2) 
                                : 'transparent',
                            color: filter === 'popular' ? '#FF6B95' : alpha('#FFFFFF', 0.6),
                            borderColor: filter === 'popular' 
                                ? alpha('#FF6B95', 0.3) 
                                : 'rgba(255, 255, 255, 0.1)',
                        }}
                    />
                    <CompactChip
                        label="New"
                        onClick={() => setFilter('new')}
                        color={filter === 'new' ? 'primary' : 'default'}
                        variant={filter === 'new' ? 'filled' : 'outlined'}
                        size="small"
                        sx={{
                            backgroundColor: filter === 'new' 
                                ? alpha('#4ECDC4', 0.2) 
                                : 'transparent',
                            color: filter === 'new' ? '#4ECDC4' : alpha('#FFFFFF', 0.6),
                            borderColor: filter === 'new' 
                                ? alpha('#4ECDC4', 0.3) 
                                : 'rgba(255, 255, 255, 0.1)',
                        }}
                    />
                </Stack>

                {/* Categories List */}
                <Box sx={{ 
                    maxHeight: 350,
                    overflowY: 'auto',
                    pr: 0.5,
                    '&::-webkit-scrollbar': {
                        width: 4,
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'linear-gradient(180deg, #FF6B95 0%, #7877C6 100%)',
                        borderRadius: 2,
                    }
                }}>
                    <Grid container spacing={1}>
                        {isLoading ? (
                            Array.from(new Array(6)).map((_, index) => (
                                <Grid item xs={12} key={index}>
                                    <Skeleton 
                                        variant="rectangular" 
                                        height={40} 
                                        sx={{ 
                                            borderRadius: 2,
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
                            ))
                        ) : filteredCategories.length > 0 ? (
                            filteredCategories.slice(0, visibleCount).map((category) => (
                                <Grid item xs={12} key={category.id}>
                                    <CategoryCard 
                                        elevation={0}
                                        onClick={() => handleCategoryClick(category)}
                                        sx={{
                                            backgroundColor: selectedCategory === category.slug 
                                                ? alpha('#7877C6', 0.2)
                                                : 'rgba(255, 255, 255, 0.05)',
                                            borderColor: selectedCategory === category.slug 
                                                ? alpha('#7877C6', 0.4)
                                                : 'rgba(255, 255, 255, 0.1)',
                                            borderLeft: `3px solid ${category.color}`,
                                        }}
                                    >
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            gap: 1,
                                        }}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 1,
                                                flex: 1,
                                                minWidth: 0,
                                            }}>
                                                <Box sx={{ 
                                                    fontSize: '1.2rem',
                                                    color: category.color,
                                                    flexShrink: 0,
                                                }}>
                                                    {category.icon}
                                                </Box>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        color: selectedCategory === category.slug 
                                                            ? 'white' 
                                                            : alpha('#FFFFFF', 0.8),
                                                        fontWeight: selectedCategory === category.slug ? 600 : 500,
                                                        fontSize: '0.85rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        flex: 1,
                                                    }}
                                                >
                                                    {category.displayName}
                                                </Typography>
                                            </Box>
                                            
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 0.5,
                                                flexShrink: 0,
                                            }}>
                                                {category.isNew && (
                                                    <Box
                                                        sx={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: '50%',
                                                            backgroundColor: '#4ECDC4',
                                                        }}
                                                    />
                                                )}
                                                {category.isPopular && (
                                                    <Box
                                                        sx={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: '50%',
                                                            backgroundColor: '#FF6B95',
                                                        }}
                                                    />
                                                )}
                                                <ChevronRight 
                                                    fontSize="small" 
                                                    sx={{ 
                                                        color: selectedCategory === category.slug 
                                                            ? '#7877C6' 
                                                            : alpha('#FFFFFF', 0.5),
                                                        fontSize: 16,
                                                    }} 
                                                />
                                            </Box>
                                        </Box>
                                    </CategoryCard>
                                </Grid>
                            ))
                        ) : (
                            <Box sx={{ 
                                textAlign: 'center', 
                                py: 3,
                                color: alpha('#FFFFFF', 0.5),
                            }}>
                                <Typography variant="caption">
                                    No categories found
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                </Box>

                {/* View More/Less Button */}
                {filteredCategories.length > 8 && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        {visibleCount < filteredCategories.length ? (
                            <Button
                                variant="text"
                                size="small"
                                startIcon={<ExpandMore />}
                                onClick={handleViewMore}
                                sx={{
                                    color: '#7877C6',
                                    fontSize: '0.75rem',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: alpha('#7877C6', 0.1),
                                    }
                                }}
                            >
                                View More ({filteredCategories.length - visibleCount} more)
                            </Button>
                        ) : (
                            <Button
                                variant="text"
                                size="small"
                                onClick={handleViewLess}
                                sx={{
                                    color: '#FF6B95',
                                    fontSize: '0.75rem',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: alpha('#FF6B95', 0.1),
                                    }
                                }}
                            >
                                Show Less
                            </Button>
                        )}
                    </Box>
                )}

                {/* Stats Footer */}
                {!isLoading && (
                    <Box sx={{ 
                        mt: 2, 
                        pt: 1.5, 
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.4) }}>
                            {filteredCategories.length} categories
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: alpha('#7877C6', 0.8),
                                fontWeight: 500,
                            }}
                        >
                            Premium
                        </Typography>
                    </Box>
                )}
            </Box>
        </CategoriesContainer>
    );
};

export default CategoriesGrid;
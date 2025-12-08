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
    List, // Added for mobile list view
    ListItemButton, // Added for mobile list view
    ListItemText, // Added for mobile list view
    ListItemIcon, // Added for mobile list view
    Collapse, // Added for mobile list view
    useMediaQuery, // Added for responsiveness
    useTheme, // Added for responsiveness
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ChevronRight,
    TrendingUp,
    NewReleases,
    Category,
    Clear,
    ExpandMore,
    ExpandLess, // Added for mobile collapse
    Inventory,
} from '@mui/icons-material';
import { GetCategoriesWithCounts } from '../API/ProductsAPI'; // Updated import

// --- Styled Components ---

// Main Container: Now uses conditional width/styling based on screen size
const CategoriesContainer = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'isMobile',
})<{ isMobile: boolean }>(({ theme, isMobile }) => ({
    background: 'linear-gradient(180deg, rgba(15, 12, 41, 0.9) 0%, rgba(48, 43, 99, 0.8) 100%)',
    backdropFilter: 'blur(10px)',
    // 🚀 FIX: Increased borderRadius from 16 to 24
    borderRadius: 24, 
    border: '1px solid rgba(120, 119, 198, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    WebkitBackdropFilter: 'blur(10px)',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    
    // Conditional styles based on isMobile prop
    ...(isMobile ? {
        width: '100%',
        maxWidth: '100%', // Full width on mobile
        height: 'auto', // Auto height on mobile
        minWidth: 'auto',
    } : {
        width: '100%',
        minWidth: 280,
        maxWidth: 320,
        height: '100%', // Sidebar height on desktop
    })
}));

const CategoryCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1.5), // Increased padding for better spacing
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        background: 'rgba(120, 119, 198, 0.15)',
        transform: 'translateY(-2px)',
        borderColor: 'rgba(120, 119, 198, 0.3)',
        boxShadow: '0 4px 12px rgba(120, 119, 198, 0.2)',
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(120, 119, 198, 0.3), transparent)',
    }
}));

const CompactChip = styled(Chip)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '0.65rem',
    height: 22,
    borderRadius: 8,
    '& .MuiChip-label': {
        paddingLeft: 8,
        paddingRight: 8,
    }
}));

// --- Main Component ---

interface CategoriesGridProps {
    onSelectCategory: (categorySlug: string) => void;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({ onSelectCategory }) => {
    const theme = useTheme();
    // Check if screen width is less than the 'md' breakpoint (e.g., < 900px)
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); 

    const [categories, setCategories] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<'all' | 'new' | 'popular'>('all');
    const [selectedCategory, setSelectedCategory] = React.useState<string>('');
    
    // New state for mobile: controls the visibility of the category list
    const [isListOpen, setIsListOpen] = React.useState(!isMobile); 

    // Sync isListOpen with isMobile on first load or resize
    React.useEffect(() => {
        setIsListOpen(!isMobile);
    }, [isMobile]);

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const data = await GetCategoriesWithCounts();
                setCategories(data);
                
                console.log('✅ Categories with products:', data.length);
                console.log('📊 Categories data:', data.map(cat => ({
                    name: cat.name,
                    productCount: cat.productCount,
                    hasProducts: cat.hasProducts
                })));
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
        
        // On mobile, close the list after selection
        if (isMobile) {
            setIsListOpen(false);
        }

        // Scroll to products section
        setTimeout(() => {
            const productsSection = document.querySelector('#products-section');
            if (productsSection) {
                // The scroll-margin-top style in App.tsx now handles the offset
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
            }
        }, 100);
    };

    const handleClearFilter = () => {
        setSelectedCategory('');
        setFilter('all');
        onSelectCategory('');
    };
    
    // New handler for mobile list toggle
    const handleListToggle = () => {
        setIsListOpen(prev => !prev);
    };

    // --- RENDER LOGIC ---

    const categoryListContent = (
        <Grid container spacing={1.5} sx={{ my: 0 }}> {/* Increased spacing */}
            {isLoading ? (
                Array.from(new Array(6)).map((_, index) => (
                    <Grid item xs={12} key={index}>
                        <Skeleton 
                            variant="rectangular" 
                            height={isMobile ? 48 : 44} // Slightly taller skeleton
                            sx={{ 
                                borderRadius: 12, // Match category card border radius
                                background: `linear-gradient(90deg, 
                                    ${alpha('#FFFFFF', 0.03)} 25%, 
                                    ${alpha('#FFFFFF', 0.06)} 50%, 
                                    ${alpha('#FFFFFF', 0.03)} 75%
                                )`,
                                backgroundSize: '400% 100%',
                                animation: 'shimmer 1.5s infinite',
                            }}
                        />
                    </Grid>
                ))
            ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                    <Grid item xs={12} key={category.id}>
                        {/* Use CategoryCard (which is a Paper) for desktop, ListItemButton for mobile */}
                        {isMobile ? (
                            <ListItemButton
                                onClick={() => handleCategoryClick(category)}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 12,
                                    mb: 1,
                                    backgroundColor: selectedCategory === category.slug 
                                        ? alpha('#7877C6', 0.15)
                                        : 'rgba(255, 255, 255, 0.03)', // Match CategoryCard background
                                    border: `1px solid ${selectedCategory === category.slug 
                                        ? alpha('#7877C6', 0.3)
                                        : 'rgba(255, 255, 255, 0.08)'}`, // Match CategoryCard border
                                    borderLeft: `3px solid ${category.color}`,
                                    '&:hover': {
                                        backgroundColor: alpha('#7877C6', 0.15),
                                        transform: 'translateY(-2px)', // Match CategoryCard hover effect
                                        boxShadow: '0 4px 12px rgba(120, 119, 198, 0.2)', // Match CategoryCard hover effect
                                        borderColor: 'rgba(120, 119, 198, 0.3)', // Match CategoryCard hover effect
                                    },
                                    transition: 'all 0.25s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: 1,
                                        background: 'linear-gradient(90deg, transparent, rgba(120, 119, 198, 0.3), transparent)', // Match CategoryCard before element opacity
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36, mr: 1 }}>
                                    <Box sx={{ 
                                        fontSize: '1.4rem', // Slightly larger icon
                                        color: category.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 30,
                                        height: 30,
                                        borderRadius: '50%',
                                        backgroundColor: alpha(category.color, 0.1),
                                    }}>
                                        {category.icon}
                                    </Box>
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: selectedCategory === category.slug ? 'white' : alpha('#FFFFFF', 0.9),
                                                fontWeight: selectedCategory === category.slug ? 600 : 500,
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            {category.displayName}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            mt: 0.5,
                                        }}>
                                            {category.isNew && (
                                                <Chip
                                                    label="New"
                                                    size="small"
                                                    sx={{
                                                        height: 16,
                                                        fontSize: '0.6rem',
                                                        backgroundColor: alpha('#4ECDC4', 0.15),
                                                        color: '#4ECDC4',
                                                        fontWeight: 600,
                                                        borderRadius: 4,
                                                    }}
                                                />
                                            )}
                                            {category.isPopular && (
                                                <Chip
                                                    label="Popular"
                                                    size="small"
                                                    sx={{
                                                        height: 16,
                                                        fontSize: '0.6rem',
                                                        backgroundColor: alpha('#FF6B95', 0.15),
                                                        color: '#FF6B95',
                                                        fontWeight: 600,
                                                        borderRadius: 4,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    }
                                    primaryTypographyProps={{ 
                                        style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } 
                                    }}
                                />
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.5,
                                    flexShrink: 0,
                                }}>
                                    <ChevronRight 
                                        fontSize="small" 
                                        sx={{ 
                                            color: selectedCategory === category.slug 
                                                ? '#7877C6' 
                                                : alpha('#FFFFFF', 0.6),
                                            fontSize: 20,
                                        }} 
                                    />
                                </Box>
                            </ListItemButton>
                        ) : (
                            // Original CategoryCard for desktop/sidebar view - IMPROVED
                            <CategoryCard 
                                elevation={0}
                                onClick={() => handleCategoryClick(category)}
                                sx={{
                                    backgroundColor: selectedCategory === category.slug 
                                        ? alpha('#7877C6', 0.15)
                                        : 'rgba(255, 255, 255, 0.03)',
                                    borderColor: selectedCategory === category.slug 
                                        ? alpha('#7877C6', 0.3)
                                        : 'rgba(255, 255, 255, 0.08)',
                                    borderLeft: `4px solid ${category.color}`,
                                    position: 'relative',
                                }}
                            >
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    gap: 1.5,
                                }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1.5,
                                        flex: 1,
                                        minWidth: 0,
                                    }}>
                                        <Box sx={{ 
                                            fontSize: '1.4rem',
                                            color: category.color,
                                            flexShrink: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            backgroundColor: alpha(category.color, 0.1),
                                            border: `1px solid ${alpha(category.color, 0.2)}`,
                                        }}>
                                            {category.icon}
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        color: selectedCategory === category.slug 
                                                            ? 'white' 
                                                            : alpha('#FFFFFF', 0.9),
                                                        fontWeight: selectedCategory === category.slug ? 600 : 500,
                                                        fontSize: '0.9rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                    {category.displayName}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                                                    {category.isNew && (
                                                        <Chip
                                                            label="New"
                                                            size="small"
                                                            sx={{
                                                                height: 16,
                                                                fontSize: '0.6rem',
                                                                backgroundColor: alpha('#4ECDC4', 0.15),
                                                                color: '#4ECDC4',
                                                                fontWeight: 600,
                                                                borderRadius: 4,
                                                            }}
                                                        />
                                                    )}
                                                    {category.isPopular && (
                                                        <Chip
                                                            label="Popular"
                                                            size="small"
                                                            sx={{
                                                                height: 16,
                                                                fontSize: '0.6rem',
                                                                backgroundColor: alpha('#FF6B95', 0.15),
                                                                color: '#FF6B95',
                                                                fontWeight: 600,
                                                                borderRadius: 4,
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: alpha('#FFFFFF', 0.6),
                                                    fontSize: '0.75rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    mt: 0.25,
                                                }}
                                            >
                                                <Inventory fontSize="inherit" sx={{ fontSize: '0.8rem' }} />
                                                {category.productCount} products
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    <ChevronRight 
                                        fontSize="small" 
                                        sx={{ 
                                            color: selectedCategory === category.slug 
                                                ? '#7877C6' 
                                                : alpha('#FFFFFF', 0.6),
                                            fontSize: 20,
                                            flexShrink: 0,
                                        }} 
                                    />
                                </Box>
                            </CategoryCard>
                        )}
                    </Grid>
                ))
            ) : (
                <Box sx={{ 
                    textAlign: 'center', 
                    py: 3,
                    color: alpha('#FFFFFF', 0.5),
                    width: '100%',
                }}>
                    <Typography variant="caption">
                        No categories with products found
                    </Typography>
                </Box>
            )}
        </Grid>
    );

    return (
        <CategoriesContainer elevation={0} isMobile={isMobile}>
            <Box sx={{ 
                p: 2,
                width: '100%',
                minWidth: isMobile ? 'auto' : 280,
                maxWidth: isMobile ? '100%' : 320,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                height: isMobile ? 'auto' : '100%',
            }}>
                {/* Header */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: isMobile ? 1.5 : 2,
                    flexShrink: 0,
                    pb: 1,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                    {/* Title and Mobile Toggle */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            cursor: isMobile ? 'pointer' : 'default', // Enable click on mobile
                        }} 
                        onClick={isMobile ? handleListToggle : undefined} // Toggle list on mobile click
                    >
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: alpha('#7877C6', 0.15),
                            border: `1px solid ${alpha('#7877C6', 0.3)}`,
                        }}>
                            <Category sx={{ 
                                color: '#7877C6', 
                                fontSize: 18 
                            }} />
                        </Box>
                        <Typography 
                            variant="subtitle1" 
                            fontWeight={600}
                            sx={{ 
                                color: 'white',
                                fontSize: '0.95rem',
                            }}
                        >
                            {selectedCategory && isMobile ? `Category: ${selectedCategory}` : 'Categories'}
                        </Typography>
                        {isMobile && (
                            isListOpen ? (
                                <ExpandLess sx={{ color: alpha('#FFFFFF', 0.8), fontSize: 20 }} />
                            ) : (
                                <ExpandMore sx={{ color: alpha('#FFFFFF', 0.8), fontSize: 20 }} />
                            )
                        )}
                    </Box>
                    
                    {selectedCategory && (
                        <Tooltip title="Clear filter" arrow>
                            <IconButton
                                size="small"
                                onClick={handleClearFilter}
                                sx={{
                                    color: '#FF6B95',
                                    backgroundColor: alpha('#FF6B95', 0.1),
                                    '&:hover': {
                                        backgroundColor: alpha('#FF6B95', 0.2),
                                    }
                                }}
                            >
                                <Clear fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* Filter Chips */}
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexShrink: 0, pb: 1.5 }}>
                    <CompactChip
                        label={`All (${filteredCategories.length})`}
                        onClick={() => setFilter('all')}
                        color={filter === 'all' ? 'primary' : 'default'}
                        variant={filter === 'all' ? 'filled' : 'outlined'}
                        size="small"
                        sx={{
                            backgroundColor: filter === 'all' 
                                ? alpha('#7877C6', 0.15) 
                                : 'transparent',
                            color: filter === 'all' ? '#7877C6' : alpha('#FFFFFF', 0.7),
                            borderColor: filter === 'all' 
                                ? alpha('#7877C6', 0.3) 
                                : 'rgba(255, 255, 255, 0.1)',
                        }}
                    />
                    <CompactChip
                        label={`Trending (${categories.filter(cat => cat.isPopular).length})`}
                        onClick={() => setFilter('popular')}
                        color={filter === 'popular' ? 'primary' : 'default'}
                        variant={filter === 'popular' ? 'filled' : 'outlined'}
                        size="small"
                        sx={{
                            backgroundColor: filter === 'popular' 
                                ? alpha('#FF6B95', 0.15) 
                                : 'transparent',
                            color: filter === 'popular' ? '#FF6B95' : alpha('#FFFFFF', 0.7),
                            borderColor: filter === 'popular' 
                                ? alpha('#FF6B95', 0.3) 
                                : 'rgba(255, 255, 255, 0.1)',
                        }}
                    />
                    <CompactChip
                        label={`New (${categories.filter(cat => cat.isNew).length})`}
                        onClick={() => setFilter('new')}
                        color={filter === 'new' ? 'primary' : 'default'}
                        variant={filter === 'new' ? 'filled' : 'outlined'}
                        size="small"
                        sx={{
                            backgroundColor: filter === 'new' 
                                ? alpha('#4ECDC4', 0.15) 
                                : 'transparent',
                            color: filter === 'new' ? '#4ECDC4' : alpha('#FFFFFF', 0.7),
                            borderColor: filter === 'new' 
                                ? alpha('#4ECDC4', 0.3) 
                                : 'rgba(255, 255, 255, 0.1)',
                        }}
                    />
                </Stack>

                {/* Categories List/Grid */}
                {isMobile ? (
                    // Mobile List View with Collapse
                    <Collapse in={isListOpen} timeout="auto" unmountOnExit>
                        <Box sx={{ 
                            maxHeight: 400, // Increased height
                            overflowY: 'auto',
                            pr: 0.5,
                            '&::-webkit-scrollbar': { width: 4 },
                            '&::-webkit-scrollbar-track': { 
                                background: 'rgba(255, 255, 255, 0.03)', 
                                borderRadius: 2 
                            },
                            '&::-webkit-scrollbar-thumb': { 
                                background: 'linear-gradient(180deg, #FF6B95 0%, #7877C6 100%)', 
                                borderRadius: 2 
                            }
                        }}>
                            {categoryListContent}
                        </Box>
                    </Collapse>
                ) : (
                    // Desktop/Sidebar View
                    <Box sx={{ 
                        flex: 1,
                        overflowY: 'auto',
                        pr: 0.5,
                        '&::-webkit-scrollbar': { width: 4 },
                        '&::-webkit-scrollbar-track': { 
                            background: 'rgba(255, 255, 255, 0.03)', 
                            borderRadius: 2 
                        },
                        '&::-webkit-scrollbar-thumb': { 
                            background: 'linear-gradient(180deg, #FF6B95 0%, #7877C6 100%)', 
                            borderRadius: 2 
                        }
                    }}>
                        {categoryListContent}
                    </Box>
                )}

                {/* Stats Footer - Always visible, but adjusted for mobile */}
                {!isLoading && (
                    <Box sx={{ 
                        mt: 2, 
                        pt: 2, 
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexShrink: 0,
                    }}>
                        <Box>
                            <Typography variant="caption" sx={{ 
                                color: alpha('#FFFFFF', 0.5),
                                fontWeight: 500,
                                fontSize: '0.8rem',
                            }}>
                                {filteredCategories.length} categories
                            </Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: alpha('#FFFFFF', 0.5),
                                    display: 'block',
                                    fontSize: '0.7rem',
                                    mt: 0.25,
                                }}
                            >
                                {filteredCategories.reduce((sum, cat) => sum + cat.productCount, 0)} total products
                            </Typography>
                        </Box>
                        <Chip
                            label="Available"
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                backgroundColor: alpha('#7877C6', 0.15),
                                color: '#7877C6',
                                fontWeight: 600,
                                borderRadius: 8,
                            }}
                        />
                    </Box>
                )}
            </Box>
        </CategoriesContainer>
    );
};

export default CategoriesGrid;
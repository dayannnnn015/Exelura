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
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Collapse,
    useMediaQuery,
    useTheme,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ChevronRight,
    TrendingUp,
    NewReleases,
    Category,
    Clear,
    ExpandMore,
    ExpandLess,
    Inventory,
    ArrowDropDown,
    Star,
    Diamond,
    FlashOn,
} from '@mui/icons-material';
import { GetCategoriesWithCounts } from '../API/ProductsAPI';

// --- Styled Components ---

const CategoriesContainer = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'isMobile',
})<{ isMobile: boolean }>(({ theme, isMobile }) => ({
    background: 'linear-gradient(180deg, rgba(10, 8, 32, 0.95) 0%, rgba(28, 25, 68, 0.92) 100%)',
    backdropFilter: 'blur(20px) saturate(180%)',
    borderRadius: 28,
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: `
        0 0 0 1px rgba(120, 119, 198, 0.1),
        0 12px 48px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.05)
    `,
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(242, 159, 88, 0.4), transparent)',
        zIndex: 1,
    },
    
    ...(isMobile ? {
        width: '100%',
        maxWidth: '100%',
        height: 'auto',
        minWidth: 'auto',
    } : {
        width: '100%',
        minWidth: 300,
        maxWidth: 340,
        height: '100%',
    })
}));

const CategoryCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1.5),
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
    borderRadius: 16,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        background: 'linear-gradient(135deg, rgba(120, 119, 198, 0.15) 0%, rgba(242, 159, 88, 0.08) 100%)',
        transform: 'translateY(-3px)',
        borderColor: 'rgba(120, 119, 198, 0.4)',
        boxShadow: '0 8px 24px rgba(120, 119, 198, 0.15), 0 2px 6px rgba(242, 159, 88, 0.1)',
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)',
    }
}));

const CompactChip = styled(Chip)(({ theme }) => ({
    fontWeight: 700,
    fontSize: '0.7rem',
    height: 24,
    borderRadius: 10,
    letterSpacing: '0.3px',
    transition: 'all 0.2s ease',
    '& .MuiChip-label': {
        paddingLeft: 10,
        paddingRight: 10,
    }
}));

// Styled Select component for mobile
const MobileCategorySelect = styled(Select)(({ theme }) => ({
    '& .MuiSelect-select': {
        backgroundColor: 'rgba(15, 12, 41, 0.6)',
        color: 'white',
        borderRadius: '16px',
        padding: '14px 20px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        fontSize: '0.95rem',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:focus': {
            borderColor: '#F29F58',
            boxShadow: '0 0 0 2px rgba(242, 159, 88, 0.2)',
        }
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
    '&:hover .MuiSelect-select': {
        borderColor: '#F29F58',
        backgroundColor: 'rgba(15, 12, 41, 0.8)',
    },
    '&.Mui-focused .MuiSelect-select': {
        borderColor: '#F29F58',
        backgroundColor: 'rgba(15, 12, 41, 0.9)',
    },
    '& .MuiSvgIcon-root': {
        color: '#F29F58',
        fontSize: '1.5rem',
    },
}));

// Styled MenuItem for mobile select
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    backgroundColor: '#1A1738',
    color: 'white',
    padding: '12px 20px',
    margin: '4px 8px',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(242, 159, 88, 0.2)',
        transform: 'translateX(4px)',
    },
    '&.Mui-selected': {
        background: 'linear-gradient(135deg, rgba(120, 119, 198, 0.25) 0%, rgba(242, 159, 88, 0.15) 100%)',
        borderLeft: '3px solid #F29F58',
        '&:hover': {
            backgroundColor: 'rgba(120, 119, 198, 0.3)',
        },
    },
}));

// --- Main Component ---

interface CategoriesGridProps {
    onSelectCategory: (categorySlug: string) => void;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({ onSelectCategory }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); 
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [categories, setCategories] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<'all' | 'new' | 'popular'>('all');
    const [selectedCategory, setSelectedCategory] = React.useState<string>('');
    
    // For mobile select component
    const [selectValue, setSelectValue] = React.useState<string>('');

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const data = await GetCategoriesWithCounts();
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

    React.useEffect(() => {
        if (selectedCategory) {
            setSelectValue(selectedCategory);
        }
    }, [selectedCategory]);

    const filteredCategories = categories.filter(category => {
        if (filter === 'all') return true;
        if (filter === 'new' && category.isNew) return true;
        if (filter === 'popular' && category.isPopular) return true;
        return false;
    });

    const handleCategoryClick = (category: any) => {
        setSelectedCategory(category.slug);
        onSelectCategory(category.slug);

        setTimeout(() => {
            const productsSection = document.querySelector('#products-section');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const handleSelectChange = (event: any) => {
        const value = event.target.value;
        setSelectValue(value);
        
        if (value === '') {
            handleClearFilter();
            return;
        }
        
        const category = categories.find(cat => cat.slug === value);
        if (category) {
            handleCategoryClick(category);
        }
    };

    const handleClearFilter = () => {
        setSelectedCategory('');
        setSelectValue('');
        setFilter('all');
        onSelectCategory('');
    };

    // Render desktop category card
    const renderCategoryCard = (category: any) => (
        <CategoryCard 
            elevation={0}
            onClick={() => handleCategoryClick(category)}
            sx={{
                background: selectedCategory === category.slug 
                    ? 'linear-gradient(135deg, rgba(120, 119, 198, 0.2) 0%, rgba(242, 159, 88, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: selectedCategory === category.slug 
                    ? '1px solid rgba(120, 119, 198, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                borderLeft: `4px solid ${category.color}`,
                position: 'relative',
                boxShadow: selectedCategory === category.slug 
                    ? '0 8px 32px rgba(120, 119, 198, 0.25), 0 2px 8px rgba(242, 159, 88, 0.15)'
                    : 'none',
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
                        fontSize: '1.5rem',
                        color: category.color,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${alpha(category.color, 0.2)} 0%, ${alpha(category.color, 0.1)} 100%)`,
                        border: `1px solid ${alpha(category.color, 0.3)}`,
                        boxShadow: `0 4px 12px ${alpha(category.color, 0.2)}`,
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
                                        : alpha('#FFFFFF', 0.95),
                                    fontWeight: selectedCategory === category.slug ? 700 : 600,
                                    fontSize: '0.95rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    lineHeight: 1.2,
                                    letterSpacing: '0.2px',
                                }}
                            >
                                {category.displayName}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                                {category.isNew && (
                                    <Chip
                                        label="New"
                                        size="small"
                                        icon={<FlashOn sx={{ fontSize: '0.7rem' }} />}
                                        sx={{
                                            height: 18,
                                            fontSize: '0.65rem',
                                            backgroundColor: alpha('#4ECDC4', 0.2),
                                            color: '#4ECDC4',
                                            fontWeight: 700,
                                            borderRadius: 6,
                                            border: `1px solid ${alpha('#4ECDC4', 0.3)}`,
                                        }}
                                    />
                                )}
                                {category.isPopular && (
                                    <Chip
                                        label="Popular"
                                        size="small"
                                        icon={<TrendingUp sx={{ fontSize: '0.7rem' }} />}
                                        sx={{
                                            height: 18,
                                            fontSize: '0.65rem',
                                            backgroundColor: alpha('#FF6B95', 0.2),
                                            color: '#FF6B95',
                                            fontWeight: 700,
                                            borderRadius: 6,
                                            border: `1px solid ${alpha('#FF6B95', 0.3)}`,
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: alpha('#FFFFFF', 0.7),
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mt: 0.25,
                                fontWeight: 500,
                            }}
                        >
                            <Inventory fontSize="inherit" sx={{ fontSize: '0.85rem', opacity: 0.8 }} />
                            {category.productCount} products
                        </Typography>
                    </Box>
                </Box>
                
                <ChevronRight 
                    fontSize="small" 
                    sx={{ 
                        color: selectedCategory === category.slug 
                            ? '#F29F58' 
                            : alpha('#FFFFFF', 0.6),
                        fontSize: 22,
                        flexShrink: 0,
                        transition: 'transform 0.3s ease',
                        '.MuiPaper-root:hover &': {
                            transform: 'translateX(2px)',
                        }
                    }} 
                />
            </Box>
        </CategoryCard>
    );

    // Render mobile select component
    const renderMobileSelect = () => (
        <FormControl fullWidth size="medium">
            <MobileCategorySelect
                value={selectValue}
                onChange={handleSelectChange}
                displayEmpty
                IconComponent={ArrowDropDown}
                MenuProps={{
                    PaperProps: {
                        sx: {
                            backgroundColor: '#1A1738',
                            color: 'white',
                            border: '1px solid rgba(242, 159, 88, 0.3)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            maxHeight: 400,
                            backdropFilter: 'blur(20px)',
                            borderRadius: '16px',
                            marginTop: '8px',
                            '& .MuiList-root': {
                                padding: '8px',
                            }
                        }
                    }
                }}
            >
                <StyledMenuItem value="">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                            fontSize: '1.3rem',
                            color: '#7877C6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            backgroundColor: alpha('#7877C6', 0.15),
                            flexShrink: 0,
                        }}>
                            <Diamond sx={{ fontSize: '1.2rem' }} />
                        </Box>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: alpha('#FFFFFF', 0.9),
                                fontWeight: 600,
                                fontStyle: 'italic',
                            }}
                        >
                            All Categories
                        </Typography>
                    </Box>
                </StyledMenuItem>
                {filteredCategories.map((category) => (
                    <StyledMenuItem 
                        key={category.id} 
                        value={category.slug}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Box sx={{ 
                            fontSize: '1.5rem',
                            color: category.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            background: `linear-gradient(135deg, ${alpha(category.color, 0.2)} 0%, ${alpha(category.color, 0.1)} 100%)`,
                            flexShrink: 0,
                        }}>
                            {category.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    letterSpacing: '0.2px',
                                }}
                            >
                                {category.displayName}
                            </Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: alpha('#FFFFFF', 0.7),
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontWeight: 500,
                                }}
                            >
                                {category.productCount} products
                            </Typography>
                        </Box>
                    </StyledMenuItem>
                ))}
            </MobileCategorySelect>
        </FormControl>
    );

    const categoryListContent = (
        <Grid container spacing={1.5} sx={{ my: 0 }}>
            {isLoading ? (
                Array.from(new Array(6)).map((_, index) => (
                    <Grid item xs={12} key={index}>
                        <Skeleton 
                            variant="rectangular" 
                            height={isMobile ? 48 : 44}
                            sx={{ 
                                borderRadius: 16,
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
                        {renderCategoryCard(category)}
                    </Grid>
                ))
            ) : (
                <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    px: 2,
                    color: alpha('#FFFFFF', 0.5),
                    width: '100%',
                }}>
                    <Star sx={{ fontSize: '2rem', opacity: 0.5, mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        No categories found
                    </Typography>
                </Box>
            )}
        </Grid>
    );

    return (
        <CategoriesContainer elevation={0} isMobile={isMobile}>
            <Box sx={{ 
                p: isMobile ? 2 : 2.5,
                width: '100%',
                minWidth: isMobile ? 'auto' : 300,
                maxWidth: isMobile ? '100%' : 340,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                height: isMobile ? 'auto' : '100%',
            }}>
                {/* Sticky Header Container */}
                <Box sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: 'rgba(10, 8, 32, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: isMobile ? 2 : 2.5,
                    pb: 1.5,
                    pt: 0.5,
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -1,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(242, 159, 88, 0.3), transparent)',
                    }
                }}>
                    {/* Header */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 1,
                    }}>
                        {/* Title */}
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1.5,
                            }} 
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: isMobile ? 36 : 40,
                                height: isMobile ? 36 : 40,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(120, 119, 198, 0.2) 0%, rgba(242, 159, 88, 0.15) 100%)',
                                border: '1px solid rgba(120, 119, 198, 0.3)',
                                boxShadow: '0 4px 16px rgba(120, 119, 198, 0.2)',
                                flexShrink: 0,
                            }}>
                                <Category sx={{ 
                                    color: '#F29F58', 
                                    fontSize: isMobile ? 20 : 22,
                                }} />
                            </Box>
                            <Box>
                                <Typography 
                                    variant="subtitle1" 
                                    fontWeight={800}
                                    sx={{ 
                                        color: 'white',
                                        fontSize: isMobile ? '1rem' : '1.1rem',
                                        letterSpacing: '0.5px',
                                        background: 'linear-gradient(135deg, #FFFFFF 0%, #F29F58 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {selectedCategory && isMobile ? 'Selected' : 'Categories'}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: alpha('#FFFFFF', 0.6),
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        letterSpacing: '0.3px',
                                    }}
                                >
                                    Premium collection
                                </Typography>
                            </Box>
                        </Box>
                        
                        {selectedCategory && (
                            <Tooltip title="Clear selection" arrow placement="left">
                                <IconButton
                                    size="small"
                                    onClick={handleClearFilter}
                                    sx={{
                                        color: '#F29F58',
                                        background: 'linear-gradient(135deg, rgba(242, 159, 88, 0.15) 0%, rgba(255, 107, 149, 0.1) 100%)',
                                        border: '1px solid rgba(242, 159, 88, 0.3)',
                                        width: isMobile ? 36 : 40,
                                        height: isMobile ? 36 : 40,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, rgba(242, 159, 88, 0.25) 0%, rgba(255, 107, 149, 0.2) 100%)',
                                            transform: 'scale(1.05)',
                                            boxShadow: '0 0 20px rgba(242, 159, 88, 0.3)',
                                        },
                                    }}
                                >
                                    <Clear fontSize={isMobile ? "medium" : "medium"} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>

                    {/* MOBILE: Show Select Component, DESKTOP: Show Filter Chips */}
                    {isMobile ? (
                        // On mobile, always show the select component
                        renderMobileSelect()
                    ) : (
                        // On desktop, show filter chips
                        <Stack direction="row" spacing={1.5} sx={{ mb: 0.5 }}>
                            <CompactChip
                                label={`All (${filteredCategories.length})`}
                                onClick={() => setFilter('all')}
                                icon={filter === 'all' ? <Diamond sx={{ fontSize: '0.9rem' }} /> : undefined}
                                color={filter === 'all' ? 'primary' : 'default'}
                                variant={filter === 'all' ? 'filled' : 'outlined'}
                                size="small"
                                sx={{
                                    background: filter === 'all' 
                                        ? 'linear-gradient(135deg, rgba(120, 119, 198, 0.25) 0%, rgba(120, 119, 198, 0.15) 100%)' 
                                        : 'transparent',
                                    color: filter === 'all' ? 'white' : alpha('#FFFFFF', 0.8),
                                    border: filter === 'all' 
                                        ? '1px solid rgba(120, 119, 198, 0.4)' 
                                        : '1px solid rgba(255, 255, 255, 0.15)',
                                    fontWeight: filter === 'all' ? 800 : 600,
                                    '&:hover': {
                                        background: filter === 'all' 
                                            ? 'linear-gradient(135deg, rgba(120, 119, 198, 0.3) 0%, rgba(120, 119, 198, 0.2) 100%)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                    }
                                }}
                            />
                            <CompactChip
                                label={`Trending (${categories.filter(cat => cat.isPopular).length})`}
                                onClick={() => setFilter('popular')}
                                icon={filter === 'popular' ? <TrendingUp sx={{ fontSize: '0.9rem' }} /> : undefined}
                                color={filter === 'popular' ? 'primary' : 'default'}
                                variant={filter === 'popular' ? 'filled' : 'outlined'}
                                size="small"
                                sx={{
                                    background: filter === 'popular' 
                                        ? 'linear-gradient(135deg, rgba(255, 107, 149, 0.25) 0%, rgba(255, 107, 149, 0.15) 100%)' 
                                        : 'transparent',
                                    color: filter === 'popular' ? 'white' : alpha('#FFFFFF', 0.8),
                                    border: filter === 'popular' 
                                        ? '1px solid rgba(255, 107, 149, 0.4)' 
                                        : '1px solid rgba(255, 255, 255, 0.15)',
                                    fontWeight: filter === 'popular' ? 800 : 600,
                                    '&:hover': {
                                        background: filter === 'popular' 
                                            ? 'linear-gradient(135deg, rgba(255, 107, 149, 0.3) 0%, rgba(255, 107, 149, 0.2) 100%)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                    }
                                }}
                            />
                            <CompactChip
                                label={`New (${categories.filter(cat => cat.isNew).length})`}
                                onClick={() => setFilter('new')}
                                icon={filter === 'new' ? <FlashOn sx={{ fontSize: '0.9rem' }} /> : undefined}
                                color={filter === 'new' ? 'primary' : 'default'}
                                variant={filter === 'new' ? 'filled' : 'outlined'}
                                size="small"
                                sx={{
                                    background: filter === 'new' 
                                        ? 'linear-gradient(135deg, rgba(78, 205, 196, 0.25) 0%, rgba(78, 205, 196, 0.15) 100%)' 
                                        : 'transparent',
                                    color: filter === 'new' ? 'white' : alpha('#FFFFFF', 0.8),
                                    border: filter === 'new' 
                                        ? '1px solid rgba(78, 205, 196, 0.4)' 
                                        : '1px solid rgba(255, 255, 255, 0.15)',
                                    fontWeight: filter === 'new' ? 800 : 600,
                                    '&:hover': {
                                        background: filter === 'new' 
                                            ? 'linear-gradient(135deg, rgba(78, 205, 196, 0.3) 0%, rgba(78, 205, 196, 0.2) 100%)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                    }
                                }}
                            />
                        </Stack>
                    )}
                </Box>

                {/* Scrollable Content Area - Only on Desktop */}
                {!isMobile && (
                    <Box sx={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}>
                        {/* Scrollable Categories List */}
                        <Box sx={{ 
                            flex: 1,
                            overflowY: 'auto',
                            pr: 1,
                            py: 0.5,
                            '&::-webkit-scrollbar': { 
                                width: 6,
                                background: 'transparent',
                            },
                            '&::-webkit-scrollbar-track': { 
                                background: 'rgba(255, 255, 255, 0.03)', 
                                borderRadius: 3,
                                marginY: 4,
                            },
                            '&::-webkit-scrollbar-thumb': { 
                                background: 'linear-gradient(180deg, #F29F58 0%, #7877C6 100%)', 
                                borderRadius: 3,
                                '&:hover': {
                                    background: 'linear-gradient(180deg, #FFB347 0%, #8A7CFF 100%)',
                                }
                            }
                        }}>
                            {categoryListContent}
                        </Box>

                        {/* Stats Footer */}
                        {!isLoading && (
                            <Box sx={{ 
                                mt: 'auto',
                                pt: 2, 
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexShrink: 0,
                                position: 'relative',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '1px',
                                    background: 'linear-gradient(90deg, transparent, rgba(242, 159, 88, 0.3), transparent)',
                                }
                            }}>
                                <Box>
                                    <Typography variant="body2" sx={{ 
                                        color: alpha('#FFFFFF', 0.9),
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        letterSpacing: '0.3px',
                                    }}>
                                        {filteredCategories.length} premium categories
                                    </Typography>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: alpha('#FFFFFF', 0.6),
                                            display: 'block',
                                            fontSize: '0.8rem',
                                            mt: 0.5,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {filteredCategories.reduce((sum, cat) => sum + cat.productCount, 0)} exclusive products
                                    </Typography>
                                </Box>
                                <Chip
                                    label="Premium"
                                    size="small"
                                    icon={<Star sx={{ fontSize: '0.8rem' }} />}
                                    sx={{
                                        height: 24,
                                        fontSize: '0.75rem',
                                        background: 'linear-gradient(135deg, rgba(242, 159, 88, 0.2) 0%, rgba(120, 119, 198, 0.2) 100%)',
                                        color: '#F29F58',
                                        fontWeight: 700,
                                        borderRadius: 10,
                                        border: '1px solid rgba(242, 159, 88, 0.3)',
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </CategoriesContainer>
    );
};

export default CategoriesGrid;
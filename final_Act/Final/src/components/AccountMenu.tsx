
import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LoginIcon from '@mui/icons-material/Login';
import Badge from '@mui/material/Badge';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/cartStore';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Zustand stores
  const { 
    currentUser, 
    isLoggedIn, 
    cartCount,
    login, 
    logout,
    addToCart 
  } = useUserStore();
  
  const { openCart } = useCartStore();
  
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogin = () => {
    // Simulate login with dummy user
    login({
      id: 1,
      name: 'John Doe',
      email: 'john@xelura.com',
      phone: '+1234567890',
      address: '123 Main Street, New York, NY',
      createdAt: new Date().toISOString()
    });
    handleClose();
  };
  
  const handleRegister = () => {
    // Simulate registration
    const newUser = {
      id: Date.now(),
      name: 'New User',
      email: 'new@xelura.com',
      phone: '+1111111111',
      address: '789 Pine Road, Chicago, IL',
      createdAt: new Date().toISOString()
    };
    
    // In a real app, you'd call register() from store
    login(newUser);
    handleClose();
  };
  
  const handleLogout = () => {
    logout();
    handleClose();
  };
  
  const handleCartClick = () => {
    if (!isLoggedIn) {
      alert('Please login to view your cart');
      // You could open login dialog instead
    } else {
      openCart();
      // Navigate to cart or open cart drawer
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // You can add search functionality here
    // Example: debounced API call or state update for parent component
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log('Searching for:', searchTerm);
      // Implement search logic here
      // Example: navigate to search page or update global state
    }
  };

  return (
    <React.Fragment>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 5,
        px: 2,
        py: 2,
        gap: 2
      }}>
        {/* Logo Section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0,
          cursor: 'pointer',
          flexShrink: 0,
          '&:hover': {
            '& .logo-text': {
              textShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
            }
          }
        }}>
          <Box
            component="img"
            src="/shopLogo.svg"
            alt="Xelura Logo"
            sx={{
              width: 70,
              height: 55,
              filter: 'drop-shadow(0px 2px 8px rgba(212, 175, 55, 0.3))',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
          <Typography 
            variant={isMobile ? "h6" : "h4"}
            className="logo-text"
            sx={{
              mt: 1.5,
              fontWeight: '900',
              letterSpacing: '1px',
              background: 'linear-gradient(45deg, #D4AF37 30%, #FFD700 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              display: isMobile ? 'none' : 'block'
            }}
          >
            XELURA
          </Typography>
        </Box>
        
        {/* Search Bar - Center */}
        <Box 
          component="form" 
          onSubmit={handleSearchSubmit}
          sx={{ 
            flex: 1,
            maxWidth: isMobile ? '100%' : isTablet ? '400px' : '600px',
            mx: isMobile ? 0 : 4,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search products, brands, and categories..."
            value={searchTerm}
            onChange={handleSearch}
            slotProps={{
              input: {
                sx: {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  borderColor: 'rgba(212, 175, 55, 0.3)',
                  '&:hover': {
                    borderColor: '#D4AF37',
                  },
                  '&.Mui-focused': {
                    borderColor: '#D4AF37',
                    boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.2)',
                  },
                  height: 45,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: 500,
                  color: '#333',
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#D4AF37' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                      sx={{ color: '#D4AF37', mr: -1 }}
                    >
                      ✕
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(212, 175, 55, 0.3)',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#D4AF37',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#D4AF37',
                },
              },
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(212, 175, 55, 0.2)',
              },
            }}
          />
        </Box>
        
        {/* Right Side Menu */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? 1 : 2,
          flexShrink: 0
        }}>
          {/* Cart Icon with Badge */}
          <Tooltip title={isLoggedIn ? "Your Cart" : "Please login to view cart"}>
            <IconButton
              onClick={handleCartClick}
              sx={{
                color: isLoggedIn ? '#D4AF37' : 'text.disabled',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease',
                width: { xs: 40, md: 48 },
                height: { xs: 40, md: 48 },
                position: 'relative'
              }}
            >
              <Badge 
                badgeContent={cartCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#D4AF37',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                    minWidth: isMobile ? 18 : 20,
                    height: isMobile ? 18 : 20,
                  }
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: { xs: 22, md: 26 } }} />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Account Menu */}
          <Tooltip title={isLoggedIn ? `Welcome, ${currentUser?.name}` : "Login / Register"}>
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ 
                border: '2px solid',
                borderColor: isLoggedIn ? '#D4AF37' : 'text.disabled',
                backgroundColor: isLoggedIn ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.3s ease',
                width: { xs: 40, md: 48 },
                height: { xs: 40, md: 48 }
              }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              {isLoggedIn ? (
                <Avatar sx={{ 
                  width: { xs: 28, md: 36 }, 
                  height: { xs: 28, md: 36 },
                  backgroundColor: '#D4AF37',
                  fontWeight: 'bold',
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}>
                  {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              ) : (
                <Avatar sx={{ 
                  width: { xs: 28, md: 36 }, 
                  height: { xs: 28, md: 36 },
                  backgroundColor: 'rgba(212, 175, 55, 0.3)'
                }}>
                  <LoginIcon sx={{ 
                    color: '#D4AF37',
                    fontSize: { xs: 18, md: 24 }
                  }} />
                </Avatar>
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Mobile Search Bar (if needed for better mobile experience) */}
      {isMobile && (
        <Box sx={{ mb: 3, px: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            slotProps={{
              input: {
                sx: {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  height: 45,
                  fontSize: '0.9rem',
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#D4AF37' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(212, 175, 55, 0.3)',
                  borderWidth: 2,
                },
              },
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.1)',
            }}
          />
        </Box>
      )}
      
      {/* Account Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 4px 16px rgba(212, 175, 55, 0.2))',
              mt: 1.5,
              minWidth: 220,
              backgroundColor: '#FDFBF5',
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '& .MuiMenuItem-root': {
                '&:hover': {
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                }
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: '#FDFBF5',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {isLoggedIn ? (
          <>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#D4AF37' }}>
                  {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </ListItemIcon>
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {currentUser?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentUser?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ my: 1, backgroundColor: 'rgba(212, 175, 55, 0.2)' }} />
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" sx={{ color: '#D4AF37' }} />
              </ListItemIcon>
              <Typography>Profile Settings</Typography>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" sx={{ color: '#D4AF37' }} />
              </ListItemIcon>
              <Typography>Address & Contact</Typography>
              <Typography variant="caption" sx={{ ml: 1, color: '#D4AF37' }}>
                Edit
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: '#D4AF37' }} />
              </ListItemIcon>
              <Typography>Logout</Typography>
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={handleLogin}>
              <ListItemIcon>
                <LoginIcon fontSize="small" sx={{ color: '#D4AF37' }} />
              </ListItemIcon>
              <Typography fontWeight="bold">Login</Typography>
              <Typography variant="caption" sx={{ ml: 1, color: '#D4AF37' }}>
                (Demo: john@xelura.com)
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleRegister}>
              <ListItemIcon>
                <PersonAdd fontSize="small" sx={{ color: '#D4AF37' }} />
              </ListItemIcon>
              <Typography>Register</Typography>
            </MenuItem>
            <Divider sx={{ my: 1, backgroundColor: 'rgba(212, 175, 55, 0.2)' }} />
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" sx={{ color: '#D4AF37' }} />
              </ListItemIcon>
              <Typography>About Xelura</Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </React.Fragment>
  );
}

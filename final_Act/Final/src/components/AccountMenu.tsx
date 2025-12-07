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

// ⬅️ ADDED IMPORTS FOR RESPONSIVENESS + SEARCH
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/cartStore';
import ProfileSettingsDialog from '../components/ProfileSettingDialog';

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // ➤ Added search state
  const [searchTerm, setSearchTerm] = React.useState("");

  // ➤ Added responsive breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // ➤ Added search handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm); // replace with your search logic
  };

  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);

  const { 
    currentUser, 
    isLoggedIn, 
    cartCount,
    login, 
    logout
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
    const newUser = {
      id: Date.now(),
      name: 'New User',
      email: 'new@xelura.com',
      phone: '+1111111111',
      address: '789 Pine Road, Chicago, IL',
      createdAt: new Date().toISOString()
    };
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
    } else {
      openCart();
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
        backgroundColor: 'rgba(240, 238, 179, 0.3)',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(212, 175, 55, 0.1)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        flexDirection: { xs: 'column', sm: 'row' }, // ➤ responsive layout
        gap: { xs: 2, sm: 0 }
      }}>

        {/* LOGO */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Box component="img" src="/shopLogo.svg" alt="Xelura Logo"
            sx={{ width: 70, height: 55 }}
          />
          <Typography 
            variant={isMobile ? "h6" : "h4"}
            sx={{ display: isMobile ? 'none' : 'block' }}
          >
            XELURA
          </Typography>
        </Box>

        {/* SEARCH BAR */}
        <Box 
          component="form" 
          onSubmit={handleSearchSubmit}
          sx={{ 
            flex: 1,
            maxWidth: isMobile ? '100%' : isTablet ? '400px' : '600px',
            mx: isMobile ? 0 : 4
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#D4AF37' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    ✕
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* RIGHT SIDE BUTTONS */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleCartClick}>
            <Badge badgeContent={cartCount}>
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={handleClick}>
            {isLoggedIn ? (
              <Avatar>{currentUser?.name?.charAt(0).toUpperCase()}</Avatar>
            ) : (
              <Avatar><LoginIcon /></Avatar>
            )}
          </IconButton>
        </Box>
      </Box>

      {/* ACCOUNT MENU */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {isLoggedIn ? (
          <>
            <MenuItem>
              <ListItemIcon><Avatar /></ListItemIcon>
              {currentUser?.name}
            </MenuItem>

            <MenuItem onClick={() => { setProfileDialogOpen(true); handleClose(); }}>
              <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
              Profile Settings
            </MenuItem>

            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={handleLogin}>
              <ListItemIcon><LoginIcon fontSize="small" /></ListItemIcon>
              Login
            </MenuItem>

            <MenuItem onClick={handleRegister}>
              <ListItemIcon><PersonAdd fontSize="small" /></ListItemIcon>
              Register
            </MenuItem>
          </>
        )}
      </Menu>

      <ProfileSettingsDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
      />
    </React.Fragment>
  );
}

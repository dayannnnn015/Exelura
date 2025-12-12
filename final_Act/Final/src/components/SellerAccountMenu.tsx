import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Logout from '@mui/icons-material/Logout';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useUserStore } from '../store/userStore';
import DiamondIcon from '@mui/icons-material/Diamond';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import { alpha } from '@mui/material/styles';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import Badge from '@mui/material/Badge';
import { useNavigate } from 'react-router-dom';

// Import Seller Popover Components
import SellerNotificationsPopover from '../components/SellerNotificationsPopover';
import SellerMessagesPopover from '../components/SellerMessagesPopover';

interface SellerAccountMenuProps {
  onSearch?: (searchTerm: string) => void;
  scrolled?: boolean;
}

const CSS_VARS = {
  primaryDark: '#1B1833',
  primaryPurple: '#441752',
  primaryPink: '#AB4459',
  primaryOrange: '#F29F58',
};

export default function SellerAccountMenu({ onSearch, scrolled = false }: SellerAccountMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);
  const [unreadMessages, setUnreadMessages] = React.useState(0);
  
  // State for popovers
  const [notificationsAnchorEl, setNotificationsAnchorEl] = React.useState<HTMLElement | null>(null);
  const [messagesAnchorEl, setMessagesAnchorEl] = React.useState<HTMLElement | null>(null);
  
  const notificationsOpen = Boolean(notificationsAnchorEl);
  const messagesOpen = Boolean(messagesAnchorEl);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { currentUser, logout, switchToUser } = useUserStore();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
    if (isMobile && isSearchExpanded) setTimeout(() => setIsSearchExpanded(false), 200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchTerm);
      if (isMobile && isSearchExpanded) setTimeout(() => setIsSearchExpanded(false), 200);
    }
  };

  const handleMobileSearchClick = () => setIsSearchExpanded(true);
  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
    setSearchTerm('');
    if (onSearch) onSearch('');
  };

  const handleSimulatedAction = (message: string, action: () => void) => {
    action();
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleLogout = () => handleSimulatedAction('Logged out successfully', () => {
    logout();
    navigate('/');
  });

  const handleSwitchToUser = () => {
    handleSimulatedAction('Switched to user account!', switchToUser);
    handleClose();
    navigate('/');
  };

  // Handle notifications click
  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
    setUnreadNotifications(0);
    handleClose();
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleMarkAllNotificationsRead = () => {
    setUnreadNotifications(0);
  };

  // Handle messages click
  const handleMessagesClick = (event: React.MouseEvent<HTMLElement>) => {
    setMessagesAnchorEl(event.currentTarget);
    setUnreadMessages(0);
    handleClose();
  };

  const handleMessagesClose = () => {
    setMessagesAnchorEl(null);
  };

  // Navigation handlers
  const handleGoToDashboard = () => {
    navigate('/seller-dashboard');
    if (isMobile && isSearchExpanded) {
      setTimeout(() => setIsSearchExpanded(false), 200);
    }
  };

  const handleGoToProducts = () => {
    navigate('/seller/products');
    handleClose();
  };

  const handleGoToOrders = () => {
    navigate('/seller/orders');
    handleClose();
  };

  const showBrandSection = !isMobile || !isSearchExpanded;
  const showRightButtons = !isMobile || !isSearchExpanded;
  const showSearchBar = !isMobile || isSearchExpanded;

  return (
    <Box>
      {/* Main Header */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3 },
        py: 2,
        backgroundColor: scrolled
          ? alpha(CSS_VARS.primaryDark, 0.95)
          : alpha(CSS_VARS.primaryDark, 0.85),
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled
          ? `1px solid ${alpha(CSS_VARS.primaryOrange, 0.4)}`
          : `1px solid ${alpha(CSS_VARS.primaryOrange, 0.2)}`,
        transition: 'all 0.3s ease',
        flexDirection: 'row',
        gap: { xs: 1, sm: 3 },
        width: '100%',
        flexWrap: 'nowrap',
        minHeight: '72px',
      }}>
        {/* LOGO & BRAND */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexShrink: 0, minWidth: 0, transition: 'opacity 0.3s ease, width 0.3s ease', opacity: showBrandSection ? 1 : 0, width: showBrandSection ? 'auto' : 0, overflow: 'hidden' }}>
          <Box sx={{ width: { xs: 40, sm: 50 }, height: { xs: 40, sm: 50 }, borderRadius: '50%', background: `linear-gradient(135deg, ${CSS_VARS.primaryOrange} 0%, ${CSS_VARS.primaryPink} 50%, ${CSS_VARS.primaryPurple} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 20px ${alpha(CSS_VARS.primaryOrange, 0.3)}`, flexShrink: 0 }}>
            <DiamondIcon sx={{ color: '#FFFFFF', fontSize: { xs: 20, sm: 28 } }} />
          </Box>
          <Box sx={{ minWidth: 0, flexShrink: 1 }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 800, background: `linear-gradient(135deg, ${CSS_VARS.primaryOrange} 0%, ${CSS_VARS.primaryPink} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.05em', fontSize: { xs: '1rem', sm: '1.25rem' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>XELURA SELLER</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: { xs: 'none', sm: 'block' } }}>Seller Dashboard</Typography>
          </Box>
        </Box>

        {/* SEARCH BAR - Only show if onSearch prop is provided */}
        {onSearch && (
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: 1, maxWidth: isMobile ? '100%' : 500, mx: isMobile ? 0 : 3, display: 'flex', alignItems: 'center', transition: 'all 0.3s ease', opacity: showSearchBar ? 1 : 0, width: showSearchBar ? '100%' : 0, overflow: 'hidden' }}>
            {showSearchBar && (
              <TextField
                autoFocus={isMobile && isSearchExpanded}
                fullWidth
                variant={isMobile ? "standard" : "outlined"}
                placeholder="Search products or orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: CSS_VARS.primaryOrange, fontSize: 24, mr: isMobile ? 1 : 0 }} /></InputAdornment>,
                  endAdornment: isMobile && isSearchExpanded && (<InputAdornment position="end"><IconButton onClick={handleCloseSearch} sx={{ color: CSS_VARS.primaryOrange, ml: 1, width: 40, height: 40 }}><CloseIcon /></IconButton></InputAdornment>),
                  sx: { 
                    backgroundColor: isMobile ? 'transparent' : alpha(CSS_VARS.primaryDark, 0.8), 
                    color: '#FFFFFF', 
                    borderRadius: 2, 
                    fontSize: '1rem', 
                    border: isMobile ? 'none' : '1px solid transparent',
                    '& .MuiInputBase-input::placeholder': { color: 'rgba(255, 255, 255, 0.7)', opacity: 1 },
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderColor: 'rgba(255, 255, 255, 0.2)', 
                      display: isMobile ? 'none' : 'block' 
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: CSS_VARS.primaryOrange },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: CSS_VARS.primaryOrange, borderWidth: 2 }
                  }
                }}
                sx={isMobile ? {
                  '& .MuiInput-underline:before': { borderBottom: 'none' },
                  '& .MuiInput-underline:after': { borderBottom: 'none' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' }
                } : {}}
              />
            )}
          </Box>
        )}

        {/* RIGHT BUTTONS */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 }, flexShrink: 0, transition: 'opacity 0.3s ease, width 0.3s ease', opacity: showRightButtons ? 1 : 0, width: showRightButtons ? 'auto' : 0, overflow: 'hidden' }}>
          {onSearch && isMobile && !isSearchExpanded && (
            <Tooltip title="Search">
              <IconButton onClick={handleMobileSearchClick} sx={{ color: CSS_VARS.primaryOrange, backgroundColor: alpha(CSS_VARS.primaryOrange, 0.1), border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`, '&:hover': { backgroundColor: alpha(CSS_VARS.primaryOrange, 0.2) } }}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {/* Quick Action Buttons - Only visible on larger screens */}
          {!isMobile && (
            <>
              <Tooltip title="Product Management">
                <Button
                  variant="contained"
                  startIcon={<InventoryIcon />}
                  onClick={handleGoToProducts}
                  sx={{
                    background: `linear-gradient(135deg, ${CSS_VARS.primaryPurple} 0%, ${CSS_VARS.primaryPink} 100%)`,
                    color: '#FFFFFF',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${CSS_VARS.primaryPink} 0%, ${CSS_VARS.primaryPurple} 100%)`,
                    },
                  }}
                >
                  Products
                </Button>
              </Tooltip>

              <Tooltip title="Order Management">
                <Button
                  variant="contained"
                  startIcon={<ShoppingBagIcon />}
                  onClick={handleGoToOrders}
                  sx={{
                    background: `linear-gradient(135deg, ${CSS_VARS.primaryOrange} 0%, #FF8E53 100%)`,
                    color: '#FFFFFF',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 2,
                    '&:hover': {
                      background: `linear-gradient(135deg, #FF8E53 0%, ${CSS_VARS.primaryOrange} 100%)`,
                    },
                  }}
                >
                  Orders
                </Button>
              </Tooltip>
            </>
          )}
          
          {/* Home Button - Now redirects to Seller Dashboard */}
          <Tooltip title="Seller Dashboard">
            <IconButton 
              onClick={handleGoToDashboard}
              sx={{ 
                color: CSS_VARS.primaryOrange, 
                backgroundColor: alpha(CSS_VARS.primaryOrange, 0.1),
                border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`,
                '&:hover': { backgroundColor: alpha(CSS_VARS.primaryOrange, 0.2) }
              }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
          
          {/* Messages Button */}
          <Tooltip title="Customer Messages">
            <IconButton 
              onClick={handleMessagesClick}
              sx={{ 
                color: CSS_VARS.primaryPink, 
                backgroundColor: alpha(CSS_VARS.primaryPink, 0.1),
                border: `1px solid ${alpha(CSS_VARS.primaryPink, 0.3)}`,
                '&:hover': { backgroundColor: alpha(CSS_VARS.primaryPink, 0.2) }
              }}
            >
              <Badge badgeContent={unreadMessages} color="error" max={9}>
                <ChatIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Notifications Button */}
          <Tooltip title="Notifications">
            <IconButton 
              onClick={handleNotificationsClick}
              sx={{ 
                color: CSS_VARS.primaryPurple, 
                backgroundColor: alpha(CSS_VARS.primaryPurple, 0.1),
                border: `1px solid ${alpha(CSS_VARS.primaryPurple, 0.3)}`,
                '&:hover': { backgroundColor: alpha(CSS_VARS.primaryPurple, 0.2) }
              }}
            >
              <Badge badgeContent={unreadNotifications} color="error" max={9}>
                <NotificationsActiveIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Seller Account">
            <IconButton onClick={handleClick} sx={{ backgroundColor: alpha(CSS_VARS.primaryPurple, 0.4), border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`, '&:hover': { backgroundColor: alpha(CSS_VARS.primaryPurple, 0.6) }, width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
              <Avatar sx={{ 
                bgcolor: CSS_VARS.primaryOrange, 
                width: { xs: 28, sm: 32 }, 
                height: { xs: 28, sm: 32 } 
              }}>
                <StorefrontIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ACCOUNT MENU */}
      <Menu 
        anchorEl={anchorEl} 
        open={open} 
        onClose={handleClose} 
        PaperProps={{ 
          sx: { 
            backgroundColor: CSS_VARS.primaryDark, 
            color: '#FFFFFF', 
            border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`, 
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)', 
            mt: 1, 
            minWidth: 250 
          } 
        }} 
        transformOrigin={{ vertical: 'top', horizontal: 'right' }} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple }, py: 1.5 }} onClick={(e) => e.stopPropagation()}>
          <ListItemIcon>
            <Avatar sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: CSS_VARS.primaryOrange, 
              mr: 1 
            }}>
              <StorefrontIcon sx={{ fontSize: 16 }} />
            </Avatar>
          </ListItemIcon>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body1" fontWeight={600}>{currentUser?.name || 'Seller'}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StorefrontIcon sx={{ fontSize: 14, color: CSS_VARS.primaryOrange }} />
              Seller Account
            </Typography>
          </Box>
        </MenuItem>

        <Box sx={{ borderTop: `1px solid rgba(255, 255, 255, 0.1)`, my: 0.5 }} />

        {/* Seller Dashboard */}
        <MenuItem onClick={handleGoToDashboard} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
          <ListItemIcon><StorefrontIcon fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>
          Seller Dashboard
        </MenuItem>

        {/* Product Management */}
        <MenuItem onClick={handleGoToProducts} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
          <ListItemIcon><InventoryIcon fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>
          Product Management
        </MenuItem>

        {/* Order Management */}
        <MenuItem onClick={handleGoToOrders} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
          <ListItemIcon><ShoppingBagIcon fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>
          Order Management
        </MenuItem>

        <Box sx={{ borderTop: `1px solid rgba(255, 255, 255, 0.1)`, my: 0.5 }} />

        {/* Switch to User Account */}
        <MenuItem onClick={handleSwitchToUser} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
          <ListItemIcon><SwitchAccountIcon fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>
          Switch to User Account
        </MenuItem>

        {/* Logout */}
        <MenuItem onClick={handleLogout} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
          <ListItemIcon><Logout fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* SELLER NOTIFICATIONS POPOVER */}
      <SellerNotificationsPopover
        anchorEl={notificationsAnchorEl}
        open={notificationsOpen}
        onClose={handleNotificationsClose}
        unreadCount={unreadNotifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />

      {/* SELLER MESSAGES POPOVER */}
      <SellerMessagesPopover
        anchorEl={messagesAnchorEl}
        open={messagesOpen}
        onClose={handleMessagesClose}
        unreadCount={unreadMessages}
      />

      {/* SNACKBAR */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="info" variant="filled" sx={{ backgroundColor: CSS_VARS.primaryDark, color: '#FFFFFF', border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`, backdropFilter: 'blur(10px)', fontWeight: 500, borderRadius: 2, '& .MuiAlert-icon': { color: CSS_VARS.primaryOrange } }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
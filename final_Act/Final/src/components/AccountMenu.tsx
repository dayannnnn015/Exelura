// AccountMenu.tsx - Fixed navigation for Profile Settings & My Profile
import { useNavigate } from "react-router-dom";
import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useUserStore } from '../store/userStore';
import DiamondIcon from '@mui/icons-material/Diamond';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import { alpha } from '@mui/material/styles';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import MyPurchaseDialog from "../components/MyPurchaseDialog";
import StorefrontIcon from '@mui/icons-material/Storefront';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import Button from '@mui/material/Button'; // Add this import

interface AccountMenuProps {
  onSearch: (searchTerm: string) => void;
  scrolled: boolean;
}

// Define CSS Variables from App.css
const CSS_VARS = {
  primaryDark: '#1B1833',
  primaryPurple: '#441752',
  primaryPink: '#AB4459',
  primaryOrange: '#F29F58',
};

export default function AccountMenu({ onSearch, scrolled }: AccountMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = React.useState(false);
  const [sellerModePromptOpen, setSellerModePromptOpen] = React.useState(false); // Add state for seller prompt

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { currentUser, isLoggedIn, login, logout, isSeller, switchToSeller, switchToUser } = useUserStore();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
    if (isMobile && isSearchExpanded) setTimeout(() => setIsSearchExpanded(false), 200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm);
      if (isMobile && isSearchExpanded) setTimeout(() => setIsSearchExpanded(false), 200);
    }
  };

  const handleMobileSearchClick = () => setIsSearchExpanded(true);
  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
    setSearchTerm('');
    onSearch('');
  };

  const handleSimulatedAction = (message: string, action: () => void) => {
    action();
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleLogin = () => handleSimulatedAction('Logged in successfully!', () => 
    login({
      id: 1,
      name: 'John Doe',
      email: 'john@xelura.com',
      phone: '+1234567890',
      address: '123 Main Street, New York, NY',
      createdAt: new Date().toISOString()
    })
  );

  const handleRegister = () => handleSimulatedAction('Registered successfully!', () => 
    login({
      id: Date.now(),
      name: 'New User',
      email: 'new@xelura.com',
      phone: '+1111111111',
      address: '789 Pine Road, Chicago, IL',
      createdAt: new Date().toISOString()
    })
  );

  const handleLogout = () => handleSimulatedAction('Logged out successfully', logout);

  const handleLoginAsSeller = () => {
    handleSimulatedAction('Logged in as seller successfully!', () => {
      // Simulate seller login
      login({
        id: 2,
        name: 'Seller User',
        email: 'seller@xelura.com',
        phone: '+1234567890',
        address: '456 Seller Street, Los Angeles, CA',
        createdAt: new Date().toISOString(),
        isSeller: true
      });
      switchToSeller();
    });
  };

  const handleSwitchToSeller = () => {
    handleSimulatedAction('Switched to seller account!', switchToSeller);
    handleClose();
  };

  const handleSwitchToUser = () => {
    handleSimulatedAction('Switched to user account!', switchToUser);
    handleClose();
  };

  const handleGoToSellerDashboard = () => {
    if (!isSeller) {
      setSellerModePromptOpen(true);
    } else {
      navigate("/seller-dashboard");
      handleClose();
    }
  };

  const showBrandSection = !isMobile || !isSearchExpanded;
  const showRightButtons = !isMobile || !isSearchExpanded;
  const showSearchBar = !isMobile || isSearchExpanded;

  return (
    <React.Fragment>
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
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 800, background: `linear-gradient(135deg, ${CSS_VARS.primaryOrange} 0%, ${CSS_VARS.primaryPink} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.05em', fontSize: { xs: '1rem', sm: '1.25rem' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>XELURA</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: { xs: 'none', sm: 'block' } }}>Luxury Redefined</Typography>
          </Box>
        </Box>

        {/* SEARCH BAR */}
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: 1, maxWidth: isMobile ? '100%' : 500, mx: isMobile ? 0 : 3, display: 'flex', alignItems: 'center', transition: 'all 0.3s ease', opacity: showSearchBar ? 1 : 0, width: showSearchBar ? '100%' : 0, overflow: 'hidden' }}>
          {showSearchBar && (
            <TextField
              autoFocus={isMobile && isSearchExpanded}
              fullWidth
              variant={isMobile ? "standard" : "outlined"}
              placeholder="Search luxury products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                disableUnderline: isMobile,
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: CSS_VARS.primaryOrange, fontSize: 24, mr: isMobile ? 1 : 0 }} /></InputAdornment>,
                endAdornment: isMobile && isSearchExpanded && (<InputAdornment position="end"><IconButton onClick={handleCloseSearch} sx={{ color: CSS_VARS.primaryOrange, ml: 1, width: 40, height: 40 }}><CloseIcon /></IconButton></InputAdornment>),
                sx: { backgroundColor: isMobile ? 'transparent' : alpha(CSS_VARS.primaryDark, 0.8), color: '#FFFFFF', borderRadius: 2, fontSize: '1rem', border: isMobile ? 'none' : '1px solid transparent', '& .MuiInputBase-input::placeholder': { color: 'rgba(255, 255, 255, 0.7)', opacity: 1 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)', display: isMobile ? 'none' : 'block' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: CSS_VARS.primaryOrange }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: CSS_VARS.primaryOrange, borderWidth: 2 } }
              }}
            />
          )}
        </Box>

        {/* RIGHT BUTTONS */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 }, flexShrink: 0, transition: 'opacity 0.3s ease, width 0.3s ease', opacity: showRightButtons ? 1 : 0, width: showRightButtons ? 'auto' : 0, overflow: 'hidden' }}>
          {isMobile && !isSearchExpanded && (
            <Tooltip title="Search">
              <IconButton onClick={handleMobileSearchClick} sx={{ color: CSS_VARS.primaryOrange, backgroundColor: alpha(CSS_VARS.primaryOrange, 0.1), border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`, '&:hover': { backgroundColor: alpha(CSS_VARS.primaryOrange, 0.2) } }}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}
          {isLoggedIn && !isMobile && <Tooltip title="Premium Member"><WorkspacePremiumIcon sx={{ color: CSS_VARS.primaryOrange, fontSize: 28 }} /></Tooltip>}
          <Tooltip title={isLoggedIn ? (isSeller ? "Seller Account" : "User Account") : "Login"}>
            <IconButton onClick={handleClick} sx={{ backgroundColor: alpha(CSS_VARS.primaryPurple, 0.4), border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`, '&:hover': { backgroundColor: alpha(CSS_VARS.primaryPurple, 0.6) }, width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
              {isLoggedIn ? (
                <Avatar sx={{ 
                  bgcolor: isSeller ? CSS_VARS.primaryOrange : CSS_VARS.primaryPink, 
                  width: { xs: 28, sm: 32 }, 
                  height: { xs: 28, sm: 32 } 
                }}>
                  {isSeller ? <StorefrontIcon sx={{ fontSize: { xs: 16, sm: 18 } }} /> : currentUser?.name?.charAt(0).toUpperCase()}
                </Avatar>
              ) : (
                <Avatar sx={{ bgcolor: CSS_VARS.primaryPurple, width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
                  <LoginIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </Avatar>
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ACCOUNT MENU */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} PaperProps={{ sx: { backgroundColor: CSS_VARS.primaryDark, color: '#FFFFFF', border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', mt: 1, minWidth: 220 } }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {isLoggedIn ? (
          <>
            <MenuItem sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple }, py: 1.5 }} onClick={(e) => e.stopPropagation()}>
              <ListItemIcon>
                <Avatar sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: isSeller ? CSS_VARS.primaryOrange : CSS_VARS.primaryPink, 
                  mr: 1 
                }}>
                  {isSeller ? <StorefrontIcon sx={{ fontSize: 16 }} /> : currentUser?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemIcon>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body1" fontWeight={600}>{currentUser?.name}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isSeller ? (
                    <>
                      <StorefrontIcon sx={{ fontSize: 14, color: CSS_VARS.primaryOrange }} />
                      Seller Account
                    </>
                  ) : (
                    <>
                      <WorkspacePremiumIcon sx={{ fontSize: 14, color: CSS_VARS.primaryOrange }} />
                      Premium Member
                    </>
                  )}
                </Typography>
              </Box>
            </MenuItem>

            <Box sx={{ borderTop: `1px solid rgba(255, 255, 255, 0.1)`, my: 0.5 }} />

            {!isSeller ? (
              <>
                <MenuItem onClick={() => { navigate("/profile-setting"); handleClose(); }}>
                  <ListItemIcon><Settings fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>
                  Profile Setting
                </MenuItem>

                <MenuItem onClick={() => { setPurchaseDialogOpen(true); handleClose(); }} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
                  <ListItemIcon><ShoppingBagIcon fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>My Purchases
                </MenuItem>

                <MenuItem onClick={() => { navigate("/my-profile"); handleClose(); }} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
                  <ListItemIcon><Settings fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>My Profile
                </MenuItem>

                <MenuItem onClick={handleGoToSellerDashboard} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
                  <ListItemIcon><StorefrontIcon fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>
                  Seller Dashboard
                </MenuItem>

                <MenuItem onClick={handleSwitchToSeller} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
                  <ListItemIcon><SwitchAccountIcon fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>
                  Switch to Seller
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem onClick={() => { navigate("/seller-dashboard"); handleClose(); }} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
                  <ListItemIcon><StorefrontIcon fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>
                  Seller Dashboard
                </MenuItem>

                <MenuItem onClick={handleSwitchToUser} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
                  <ListItemIcon><SwitchAccountIcon fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>
                  Switch to User
                </MenuItem>
              </>
            )}

            <MenuItem onClick={handleLogout} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
              <ListItemIcon><Logout fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>Logout
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={handleLogin} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
              <ListItemIcon><LoginIcon fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>Login as User
            </MenuItem>
            <MenuItem onClick={handleLoginAsSeller} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
              <ListItemIcon><StorefrontIcon fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>Login as Seller
            </MenuItem>
            <MenuItem onClick={handleRegister} sx={{ '&:hover': { backgroundColor: CSS_VARS.primaryPurple } }}>
              <ListItemIcon><PersonAdd fontSize="small" sx={{ color: CSS_VARS.primaryOrange }} /></ListItemIcon>Register
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Seller Mode Prompt Dialog */}
      {sellerModePromptOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            px: 2,
          }}
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 500,
              width: '100%',
              background: `linear-gradient(135deg, ${CSS_VARS.primaryDark} 0%, ${alpha(CSS_VARS.primaryPurple, 0.8)} 100%)`,
              border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`,
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <StorefrontIcon sx={{ fontSize: 60, color: CSS_VARS.primaryOrange, mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Switch to Seller Mode
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 3 }}>
                You need to switch to seller mode to access the Seller Dashboard. This will change your account view to seller mode.
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={() => setSellerModePromptOpen(false)}
                sx={{
                  borderColor: CSS_VARS.primaryPink,
                  color: CSS_VARS.primaryPink,
                  '&:hover': { borderColor: CSS_VARS.primaryPink },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  handleSwitchToSeller();
                  setSellerModePromptOpen(false);
                  navigate("/seller-dashboard");
                }}
                sx={{
                  background: `linear-gradient(135deg, ${CSS_VARS.primaryOrange} 0%, ${CSS_VARS.primaryPink} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${CSS_VARS.primaryPink} 0%, ${CSS_VARS.primaryPurple} 100%)`,
                  },
                }}
              >
                Switch to Seller Mode
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}

      {/* PURCHASE DIALOG */}
      <MyPurchaseDialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)} />

      {/* SNACKBAR */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="info" variant="filled" sx={{ backgroundColor: CSS_VARS.primaryDark, color: '#FFFFFF', border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`, backdropFilter: 'blur(10px)', fontWeight: 500, borderRadius: 2, '& .MuiAlert-icon': { color: CSS_VARS.primaryOrange } }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}
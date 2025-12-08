// AccountMenu.tsx - Fixed imports
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
import ProfileSettingsDialog from '../components/ProfileSettingDialog';
import DiamondIcon from '@mui/icons-material/Diamond';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface AccountMenuProps {
  onSearch: (searchTerm: string) => void;
  // 🆕 NEW: Prop to control conditional styling on scroll
  scrolled: boolean; 
}

// 🔄 MODIFIED: Accept the 'scrolled' prop
export default function AccountMenu({ onSearch, scrolled }: AccountMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const { 
    currentUser, 
    isLoggedIn, 
    login, 
    logout
  } = useUserStore();

  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm);
    }
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
    setSnackbarMessage('Logged in successfully!');
    setSnackbarOpen(true);
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
    setSnackbarMessage('Registered successfully!');
    setSnackbarOpen(true);
  };
  
  const handleLogout = () => {
    logout();
    handleClose();
    setSnackbarMessage('Logged out successfully');
    setSnackbarOpen(true);
  };
  

  return (
    <React.Fragment>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: { xs: 1, sm: 2 },
        py: 2,
        // 🔄 MODIFIED: Apply conditional glassy style based on the 'scrolled' prop
        backgroundColor: scrolled
          ? 'rgba(255, 255, 255, 0.1)' // More transparent when scrolled
          : 'rgba(255, 255, 255, 0.2)', // Slightly less transparent when at the top
        backdropFilter: scrolled 
          ? 'blur(20px)' // Sharper blur when scrolled (more 'glassy')
          : 'blur(10px)', // Lighter blur when at the top
        border: scrolled
          ? '1px solid rgba(242, 159, 88, 0.4)' // More defined border when scrolled
          : '1px solid rgba(242, 159, 88, 0.2)', // Subtler border when at the top
        transition: 'all 0.3s ease-in-out', // Smooth transition for the effect
        
        borderRadius: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>

        {/* LOGO & BRAND */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexShrink: 0 
        }}>
          <Box 
            sx={{ 
              width: 60, 
              height: 60, 
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F29F58 0%, #AB4459 50%, #441752 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(242, 159, 88, 0.3)'
            }}
          >
            <DiamondIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Box>
            <Typography 
              variant={isMobile ? "h5" : "h4"}
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #F29F58 0%, #AB4459 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.1em'
              }}
            >
              XELURA
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Luxury Redefined
            </Typography>
          </Box>
        </Box>

        {/* 🔄 MODIFIED: SEARCH BAR DESIGN FIX */}
        <Box 
          component="form" 
          onSubmit={handleSearchSubmit}
          sx={{ 
            flex: 1,
            maxWidth: isMobile ? '100%' : isTablet ? '500px' : '700px',
            mx: isMobile ? 0 : 4
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search luxury products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#F29F58' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setSearchTerm('');
                      onSearch('');
                    }}
                    sx={{ color: '#F29F58' }}
                  >
                    ×
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                // FIXED: Use a darker translucent background for better contrast on a dark theme
                backgroundColor: 'rgba(27, 24, 51, 0.4)', 
                color: 'white', // Fixed: Input text is white
                borderRadius: 2,
                // Fixed: Style the placeholder text
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1, // Needed for some browsers
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.2)', // Subtle light border
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#F29F58', // Highlight on hover
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#F29F58',
                  borderWidth: 2,
                },
              }
            }}
          />
        </Box>

        {/* RIGHT SIDE BUTTONS */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          {isLoggedIn && (
            <Tooltip title="Premium Member">
              <WorkspacePremiumIcon sx={{ color: '#F29F58', fontSize: 28 }} />
            </Tooltip>
          )}
          

          <Tooltip title={isLoggedIn ? "Account" : "Login"}>
            <IconButton 
              onClick={handleClick}
              sx={{
                backgroundColor: 'rgba(27, 24, 51, 0.2)',
                border: '1px solid rgba(242, 159, 88, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(242, 159, 88, 0.1)',
                }
              }}
            >
              {isLoggedIn ? (
                <Avatar sx={{ 
                  bgcolor: '#AB4459',
                  width: 36,
                  height: 36
                }}>
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </Avatar>
              ) : (
                <Avatar sx={{ bgcolor: '#441752', width: 36, height: 36 }}>
                  <LoginIcon />
                </Avatar>
              )}
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
            backgroundColor: '#1B1833',
            color: 'white',
            border: '1px solid rgba(242, 159, 88, 0.3)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            mt: 1,
            minWidth: 200,
          }
        }}
      >
        {isLoggedIn ? (
          <>
            <MenuItem sx={{ '&:hover': { backgroundColor: '#441752' } }}>
              <ListItemIcon>
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#AB4459' }}>
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemIcon>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {currentUser?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Premium Member
                </Typography>
              </Box>
            </MenuItem>

            <MenuItem 
              onClick={() => { setProfileDialogOpen(true); handleClose(); }}
              sx={{ '&:hover': { backgroundColor: '#441752' } }}
            >
              <ListItemIcon><Settings fontSize="small" sx={{ color: '#F29F58' }} /></ListItemIcon>
              Profile Settings
            </MenuItem>

            <MenuItem 
              onClick={handleLogout}
              sx={{ '&:hover': { backgroundColor: '#441752' } }}
            >
              <ListItemIcon><Logout fontSize="small" sx={{ color: '#F29F58' }} /></ListItemIcon>
              Logout
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem 
              onClick={handleLogin}
              sx={{ '&:hover': { backgroundColor: '#441752' } }}
            >
              <ListItemIcon><LoginIcon fontSize="small" sx={{ color: '#F29F58' }} /></ListItemIcon>
              Login
            </MenuItem>

            <MenuItem 
              onClick={handleRegister}
              sx={{ '&:hover': { backgroundColor: '#441752' } }}
            >
              <ListItemIcon><PersonAdd fontSize="small" sx={{ color: '#F29F58' }} /></ListItemIcon>
              Register
            </MenuItem>
          </>
        )}
      </Menu>

      <ProfileSettingsDialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="info"
          variant="filled"
          sx={{
            backgroundColor: '#1B1833',
            color: 'white',
            border: '1px solid rgba(242, 159, 88, 0.3)',
            backdropFilter: 'blur(10px)',
            fontWeight: 500,
            borderRadius: 2,
            '& .MuiAlert-icon': {
              color: '#F29F58',
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Grid,
  Chip,
  Paper,
  alpha,
  Alert,
  Switch,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Close,
  Edit,
  PhotoCamera,
  Verified,
  Email,
  Phone,
  Person,
  Cake,
  LocationOn,
  Security,
  CreditCard,
  Notifications,
  Lock,
  Logout,
} from "@mui/icons-material";
import { useUserStore } from "../store/userStore";

interface ProfileSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const ProfileSettingsDialog: React.FC<ProfileSettingsDialogProps> = ({ open, onClose }) => {
  const { currentUser, logout } = useUserStore();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "Alexandra Chen",
    email: currentUser?.email || "alexandra@luxury.com",
    phone: currentUser?.phone || "+1 (555) 123-4567",
    gender: currentUser?.gender || "female",
    dob: currentUser?.dob || "1990-05-15",
    address: "123 Luxury Avenue, Beverly Hills, CA 90210",
    preferences: {
      newsletter: true,
      promotions: true,
      orderUpdates: true,
      securityAlerts: true,
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: !prev.preferences[preference as keyof typeof prev.preferences]
      }
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you would save to API here
    console.log('Saved profile:', formData);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const renderProfileTab = () => (
    <Box sx={{ p: 3 }}>
      {/* Profile Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src="https://images.unsplash.com/photo-1494790108755-2616b786d4d9?w=400&h=400&fit=crop"
            sx={{ width: 100, height: 100, border: '3px solid #7877C6' }}
          />
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#7877C6',
              color: 'white',
              '&:hover': { backgroundColor: '#5A59A1' }
            }}
          >
            <PhotoCamera />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h5" fontWeight={700} color="white">
              {formData.name}
            </Typography>
            <Chip
              label="Premium Member"
              icon={<Verified />}
              size="small"
              sx={{
                backgroundColor: alpha('#FF6B95', 0.2),
                color: '#FF6B95',
                fontWeight: 600,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.7), mb: 2 }}>
            Member since January 2023
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setIsEditing(!isEditing)}
            sx={{ borderColor: '#7877C6', color: '#7877C6' }}
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: alpha('#FFFFFF', 0.05), borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person /> Personal Information
            </Typography>
            
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
              InputProps={{
                sx: { color: 'white' }
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: alpha('#FFFFFF', 0.5) }} />,
                sx: { color: 'white' }
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <Phone sx={{ mr: 1, color: alpha('#FFFFFF', 0.5) }} />,
                sx: { color: 'white' }
              }}
              sx={{ mb: 2 }}
            />

            <Typography variant="body2" sx={{ color: alpha('#FFFFFF', 0.7), mb: 1, mt: 2 }}>
              Gender
            </Typography>
            <RadioGroup
              row
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              sx={{ mb: 2 }}
            >
              <FormControlLabel
                value="female"
                control={<Radio sx={{ color: alpha('#FFFFFF', 0.7) }} />}
                label={<Typography sx={{ color: alpha('#FFFFFF', 0.7) }}>Female</Typography>}
                disabled={!isEditing}
              />
              <FormControlLabel
                value="male"
                control={<Radio sx={{ color: alpha('#FFFFFF', 0.7) }} />}
                label={<Typography sx={{ color: alpha('#FFFFFF', 0.7) }}>Male</Typography>}
                disabled={!isEditing}
              />
              <FormControlLabel
                value="other"
                control={<Radio sx={{ color: alpha('#FFFFFF', 0.7) }} />}
                label={<Typography sx={{ color: alpha('#FFFFFF', 0.7) }}>Other</Typography>}
                disabled={!isEditing}
              />
            </RadioGroup>

            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={(e) => handleInputChange('dob', e.target.value)}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <Cake sx={{ mr: 1, color: alpha('#FFFFFF', 0.5) }} />,
                sx: { color: 'white' }
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: alpha('#FFFFFF', 0.05), borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn /> Address
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={!isEditing}
              InputProps={{
                sx: { color: 'white' }
              }}
              sx={{ mb: 3 }}
            />

            <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Notifications /> Preferences
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(formData.preferences).map(([key, value]) => (
                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: alpha('#FFFFFF', 0.8) }}>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Typography>
                  <Switch
                    checked={value}
                    onChange={() => handlePreferenceChange(key)}
                    disabled={!isEditing}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4ECDC4',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4ECDC4',
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderSecurityTab = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Security /> Security Settings
      </Typography>
      
      <Paper elevation={0} sx={{ p: 3, bgcolor: alpha('#FFFFFF', 0.05), borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
          Change Password
        </Typography>
        <TextField
          fullWidth
          type="password"
          label="Current Password"
          sx={{ mb: 2 }}
          InputProps={{ sx: { color: 'white' } }}
        />
        <TextField
          fullWidth
          type="password"
          label="New Password"
          sx={{ mb: 2 }}
          InputProps={{ sx: { color: 'white' } }}
        />
        <TextField
          fullWidth
          type="password"
          label="Confirm New Password"
          InputProps={{ sx: { color: 'white' } }}
        />
        <Button
          variant="contained"
          sx={{
            mt: 3,
            background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
            color: 'white',
          }}
        >
          Update Password
        </Button>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, bgcolor: alpha('#FFFFFF', 0.05), borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
          Two-Factor Authentication
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ color: alpha('#FFFFFF', 0.8) }}>Enable 2FA</Typography>
            <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.5) }}>
              Add an extra layer of security to your account
            </Typography>
          </Box>
          <Switch />
        </Box>
      </Paper>
    </Box>
  );

  const renderPaymentTab = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CreditCard /> Payment Methods
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3, backgroundColor: alpha('#45B7D1', 0.1), color: '#45B7D1' }}>
        Your payment information is securely encrypted and stored.
      </Alert>

      <Paper elevation={0} sx={{ p: 3, bgcolor: alpha('#FFFFFF', 0.05), borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#1B1833' }}>VISA</Avatar>
            <Box>
              <Typography sx={{ color: 'white' }}>Visa •••• 4321</Typography>
              <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.5) }}>
                Expires 12/2025
              </Typography>
            </Box>
          </Box>
          <Chip label="Primary" size="small" sx={{ bgcolor: alpha('#4ECDC4', 0.2), color: '#4ECDC4' }} />
        </Box>
        <Button size="small" sx={{ color: '#FF6B95' }}>Edit</Button>
      </Paper>

      <Button
        variant="outlined"
        startIcon={<CreditCard />}
        sx={{ borderColor: '#7877C6', color: '#7877C6' }}
      >
        Add New Payment Method
      </Button>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#0A081F',
          backgroundImage: `linear-gradient(180deg, #0A081F 0%, #1A173B 100%)`,
          borderRadius: 3,
          border: '1px solid rgba(120, 119, 198, 0.2)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        pb: 2,
      }}>
        <Typography variant="h5" fontWeight={700} color="white">
          Account Settings
        </Typography>
        <IconButton onClick={onClose} sx={{ color: alpha('#FFFFFF', 0.7) }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{
          px: 3,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            color: alpha('#FFFFFF', 0.7),
            '&.Mui-selected': {
              color: '#7877C6',
            },
          },
        }}
      >
        <Tab label="Profile" />
        <Tab label="Security" />
        <Tab label="Payment" />
      </Tabs>

      <DialogContent sx={{ p: 0 }}>
        {activeTab === 0 && renderProfileTab()}
        {activeTab === 1 && renderSecurityTab()}
        {activeTab === 2 && renderPaymentTab()}
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        justifyContent: 'space-between' 
      }}>
        <Button
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{ 
            borderColor: alpha('#FF6B95', 0.3), 
            color: '#FF6B95',
            '&:hover': {
              borderColor: '#FF6B95',
              backgroundColor: alpha('#FF6B95', 0.1),
            }
          }}
        >
          Logout
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={onClose} sx={{ color: alpha('#FFFFFF', 0.7) }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #5A59A1 0%, #7877C6 100%)',
              }
            }}
          >
            Save Changes
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileSettingsDialog;
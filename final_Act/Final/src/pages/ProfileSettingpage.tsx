import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Chip,
  Tabs,
  Tab,
  IconButton,
  alpha,
} from "@mui/material";
import { Close, Edit, PhotoCamera, Verified, Logout } from "@mui/icons-material";
import { useUserStore } from "../store/userStore";
import ExeluraLogo from '../assets/exelura-logo.png';
import { useNavigate } from 'react-router-dom';

const ProfileSettingPage: React.FC = () => {
  const { currentUser, logout } = useUserStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: currentUser?.name || "Alexandra Chen",
    email: currentUser?.email || "alexandra@luxury.com",
    phone: currentUser?.phone || "+1 (555) 123-4567",
    gender: currentUser?.gender || "female",
    dob: currentUser?.dob || "1990-05-15",
    address: "123 Luxury Avenue, Beverly Hills, CA 90210",
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Saved profile:", formData);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#0A081F", color: "#fff", pb: 4, position: 'relative' }}>

      {/* Exelura Logo */}
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <img src={ExeluraLogo} alt="Exelura Logo" style={{ height: 60 }} />
      </Box>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Typography variant="h5" fontWeight={700}>Profile Settings</Typography>
        <Button
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            color: "#FF6B95",
            borderColor: alpha('#FF6B95', 0.3),
            border: "1px solid",
            "&:hover": { backgroundColor: alpha('#FF6B95', 0.1), borderColor: '#FF6B95' },
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{
          px: 3,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { color: alpha('#FFFFFF', 0.7), '&.Mui-selected': { color: '#7877C6' } },
        }}
      >
        <Tab label="Profile" />
        <Tab label="Security" />
      </Tabs>

      <Box sx={{ px: 3, pt: 3, pb: 8 }}>
        {/* PROFILE TAB */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: alpha('#FFFFFF', 0.05), borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src="https://images.unsplash.com/photo-1494790108755-2616b786d4d9?w=400&h=400&fit=crop"
                      sx={{ width: 100, height: 100, border: '3px solid #7877C6' }}
                    />
                    <IconButton sx={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#7877C6', color: 'white', '&:hover': { backgroundColor: '#5A59A1' } }}>
                      <PhotoCamera />
                    </IconButton>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="h5" fontWeight={700}>{formData.name}</Typography>
                      <Chip label="Premium Member" icon={<Verified />} size="small" sx={{ backgroundColor: alpha('#FF6B95', 0.2), color: '#FF6B95', fontWeight: 600 }} />
                    </Box>
                    <Button variant="outlined" startIcon={<Edit />} onClick={() => setIsEditing(!isEditing)} sx={{ borderColor: '#7877C6', color: '#7877C6' }}>
                      {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                    </Button>
                  </Box>
                </Box>

                <TextField fullWidth label="Full Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} disabled={!isEditing} sx={{ mb: 2, input: { color: 'white' } }} />
                <TextField fullWidth label="Email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} disabled={!isEditing} sx={{ mb: 2, input: { color: 'white' } }} />
                <TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} disabled={!isEditing} sx={{ mb: 2, input: { color: 'white' } }} />
                <TextField fullWidth multiline rows={4} label="Address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} disabled={!isEditing} sx={{ mb: 3, input: { color: 'white' } }} />
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* SECURITY TAB */}
        {activeTab === 1 && (
          <Paper elevation={0} sx={{ p: 3, bgcolor: alpha('#FFFFFF', 0.05), borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Security Settings</Typography>

            <TextField fullWidth type="password" label="Current Password" value={formData.currentPassword} onChange={(e) => handleInputChange('currentPassword', e.target.value)} disabled={!isEditing} sx={{ mb: 2, input: { color: 'white' } }} />
            <TextField fullWidth type="password" label="New Password" value={formData.newPassword} onChange={(e) => handleInputChange('newPassword', e.target.value)} disabled={!isEditing} sx={{ mb: 2, input: { color: 'white' } }} />
            <TextField fullWidth type="password" label="Confirm New Password" value={formData.confirmNewPassword} onChange={(e) => handleInputChange('confirmNewPassword', e.target.value)} disabled={!isEditing} sx={{ mb: 2, input: { color: 'white' } }} />

            <Button variant="contained" onClick={() => console.log("Change Password clicked")} sx={{ mt: 2, background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)' }}>
              Change Password
            </Button>
          </Paper>
        )}

        {/* Save Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={handleSave} variant="contained" sx={{ background: 'linear-gradient(135deg, #7877C6 0%, #5A59A1 100%)' }}>
            Save Changes
          </Button>
        </Box>

      </Box>

      {/* Close Button */}
      <IconButton
        onClick={() => navigate('/')}
        sx={{ position: 'fixed', bottom: 20, right: 20, backgroundColor: '#FF6B95', color: 'white', '&:hover': { backgroundColor: '#FF4B7D' } }}
      >
        <Close />
      </IconButton>

    </Box>
  );
};

export default ProfileSettingPage;

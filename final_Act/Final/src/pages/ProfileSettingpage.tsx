import React, { useState } from "react";
import {
  Typography,
  Box,
  Avatar,
  Stack,
  Button,
  Container,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { alpha } from "@mui/material/styles";
import { useUserStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";
import AccountMenu from "../components/AccountMenu";

const CSS_VARS = {
  primaryDark: "#1B1833",
  primaryPurple: "#441752",
  primaryPink: "#AB4459",
  primaryOrange: "#F29F58",
};

const sidebarItems = [
  { label: "Account Info", icon: <AccountCircleIcon /> },
  { label: "Security", icon: <LockIcon /> },
  { label: "Notifications", icon: <NotificationsIcon /> },
];

const ProfileSettingPage: React.FC = () => {
  const { currentUser, logout } = useUserStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const handleSelect = (index: number) => setSelectedIndex(index);
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "transparent", color: "#fff" }}>
      {/* Sticky Header with AccountMenu */}
      <Box
        className="sticky-header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1300,
          width: "100%",
          backdropFilter: "blur(20px)",
          backgroundColor: alpha("#0A081F", 0.95),
          borderBottom: "1px solid rgba(120, 119, 198, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          WebkitBackdropFilter: "blur(20px)",
          transition: "all 0.3s ease",
        }}
      >
        <AccountMenu onSearch={() => {}} scrolled={false} onNavigateToSellerDashboard={() => {}} />
      </Box>

      {/* Main Layout */}
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* SIDEBAR */}
        <Box
          sx={{
            width: 260,
            borderRight: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`,
            px: 2,
            py: 3,
            bgcolor: alpha(CSS_VARS.primaryDark, 0.9),
            flexShrink: 0,
            position: "sticky",
            top: `64px`,
            height: `calc(100vh - 64px)`,
            overflowY: "auto",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
            <Avatar
              src={currentUser?.avatarUrl}
              alt={currentUser?.username}
              sx={{
                width: 56,
                height: 56,
                bgcolor: CSS_VARS.primaryOrange,
                border: `2px solid ${CSS_VARS.primaryPink}`,
              }}
            />
            <Box>
              <Typography variant="h6" fontWeight={700} noWrap sx={{ color: "#fff" }}>
                {currentUser?.username || "Guest User"}
              </Typography>
              <Typography variant="body2" sx={{ color: alpha("#fff", 0.6) }}>
                Settings
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 2, borderColor: alpha(CSS_VARS.primaryOrange, 0.3) }} />

          <List>
            {sidebarItems.map((item, index) => (
              <ListItemButton
                key={item.label}
                selected={selectedIndex === index}
                onClick={() => handleSelect(index)}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  color: "#fff",
                  "&.Mui-selected": {
                    bgcolor: alpha(CSS_VARS.primaryOrange, 0.2),
                    fontWeight: 600,
                    borderLeft: `3px solid ${CSS_VARS.primaryOrange}`,
                    pl: 1.7,
                  },
                  "&:not(.Mui-selected)": {
                    "&:hover": {
                      bgcolor: alpha(CSS_VARS.primaryPurple, 0.5),
                      borderLeft: `3px solid ${alpha(CSS_VARS.primaryOrange, 0.1)}`,
                      pl: 1.7,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: selectedIndex === index ? CSS_VARS.primaryOrange : alpha("#fff", 0.7) }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selectedIndex === index ? 600 : 400 }} />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* CONTENT AREA */}
        <Container maxWidth="lg" sx={{ flex: 1, py: 3, bgcolor: alpha(CSS_VARS.primaryDark, 0.4), borderLeft: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.1)}` }}>
          <Stack spacing={3}>
            <Typography variant="h4" fontWeight={700} color={CSS_VARS.primaryOrange} mb={2}>
              {sidebarItems[selectedIndex].label}
            </Typography>

            {/* Content for Account Info */}
            {selectedIndex === 0 && (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Full Name"
                  defaultValue={currentUser?.name || ""}
                  sx={{
                    input: { color: "white" },
                    label: { color: "#aaa" },
                  }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  defaultValue={currentUser?.email || ""}
                  sx={{
                    input: { color: "white" },
                    label: { color: "#aaa" },
                  }}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  defaultValue={currentUser?.phone || ""}
                  sx={{
                    input: { color: "white" },
                    label: { color: "#aaa" },
                  }}
                />
              </Stack>
            )}

            {/* Content for Security */}
            {selectedIndex === 1 && (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  type="password"
                  label="Current Password"
                  sx={{
                    input: { color: "white" },
                    label: { color: "#aaa" },
                  }}
                />
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  sx={{
                    input: { color: "white" },
                    label: { color: "#aaa" },
                  }}
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  sx={{
                    input: { color: "white" },
                    label: { color: "#aaa" },
                  }}
                />
              </Stack>
            )}

            {/* Content for Notifications */}
            {selectedIndex === 2 && (
              <Typography sx={{ color: alpha("#fff", 0.7) }}>
                Notification settings will be displayed here.
              </Typography>
            )}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default ProfileSettingPage;

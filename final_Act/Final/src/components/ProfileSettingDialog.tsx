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
  Link,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useState } from "react";
import { useUserStore } from "../store/userStore";

export default function ProfileSettingsDialog({ open, onClose }) {
  const { currentUser } = useUserStore();

  const [username, setUsername] = useState(currentUser?.username || "");
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [gender, setGender] = useState(currentUser?.gender || "other");
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dob || "");

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.3rem" }}>
        My Profile
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", gap: 4 }}>
          {/* LEFT SIDEBAR */}
          <Box
            sx={{
              width: 250,
              pr: 2,
              borderRight: "1px solid #D4AF37",
              fontFamily: "Arial",
              backgroundColor: "#FDFBF5",
              borderRadius: "8px",
            }}
          >
            {/* Sidebar content remains the same */}
            <Box sx={{ mb: 3, display: "flex", flexDirection: "column" }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  color: "#1B1833",
                  fontSize: "1rem",
                }}
              >
                {currentUser?.username || "User"}
              </Typography>

              <Link
                component="button"
                underline="hover"
                sx={{
                  fontSize: "0.85rem",
                  color: "#AB4459",
                  cursor: "pointer",
                }}
              >
                Edit Profile
              </Link>
            </Box>

            <Typography
              sx={{
                fontSize: "0.80rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                color: "#441752",
                mb: 1,
              }}
            >
              My Account
            </Typography>

            <List dense>
              <ListItem disablePadding>
                <ListItemButton
                  selected
                  sx={{
                    borderRadius: "4px",
                    "&.Mui-selected": {
                      backgroundColor: "#1B1833",
                      color: "#F29F58",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "#441752",
                    },
                  }}
                >
                  <ListItemText primary="Profile" />
                </ListItemButton>
              </ListItem>

              {[
                "Banks & Cards",
                "Addresses",
                "Change Password",
                "Privacy Settings",
                "Notification Settings",
              ].map((text) => (
                <ListItem disablePadding key={text}>
                  <ListItemButton
                    sx={{
                      borderRadius: "4px",
                      "&:hover": {
                        backgroundColor: "#441752",
                        color: "#F29F58",
                        pl: 1,
                        transition: "0.2s",
                      },
                    }}
                  >
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography
              sx={{
                fontSize: "0.80rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                color: "#441752",
                mb: 1,
              }}
            >
              Others
            </Typography>

            <List dense>
              {["My Purchase", "Notifications", "My Vouchers", "My Exelura Coins"].map(
                (text) => (
                  <ListItem disablePadding key={text}>
                    <ListItemButton
                      sx={{
                        borderRadius: "4px",
                        "&:hover": {
                          backgroundColor: "#D4AF37",
                          color: "#F29F58",
                          pl: 1,
                          transition: "0.2s",
                        },
                      }}
                    >
                      <ListItemText
                        primary={text}
                        primaryTypographyProps={{
                          sx: { fontWeight: "bold", color: "#441752" },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              )}
            </List>
          </Box>

          {/* RIGHT SIDE — PROFILE EDIT FORM */}
          <Box sx={{ flex: 1, backgroundColor: "#f5f5f5", p: 3, borderRadius: 2 }}>
            <TextField
              label="Username"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              helperText="Username can only be changed once."
              sx={{ mb: 2 }}
            />

            <TextField
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* Email */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: "0.9rem", color: "gray" }}>Email</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditingEmail}
                />
                <Link
                  component="button"
                  underline="hover"
                  onClick={() => setIsEditingEmail((prev) => !prev)}
                >
                  {isEditingEmail ? "Cancel" : "Change"}
                </Link>
              </Box>
            </Box>

            {/* Phone Number */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: "0.9rem", color: "gray" }}>Phone Number</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditingPhone}
                />
                <Link
                  component="button"
                  underline="hover"
                  onClick={() => setIsEditingPhone((prev) => !prev)}
                >
                  {isEditingPhone ? "Cancel" : "Change"}
                </Link>
              </Box>
            </Box>

            <Typography sx={{ fontSize: "0.9rem", mb: 1 }}>Gender</Typography>
            <RadioGroup row value={gender} onChange={(e) => setGender(e.target.value)}>
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel value="female" control={<Radio />} label="Female" />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>

            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: "0.9rem", color: "gray" }}>Date of Birth</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  type="date"
                  fullWidth
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
                <Link component="button" underline="hover">
                  Change
                </Link>
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Avatar
                src=""
                sx={{ width: 120, height: 120, border: "2px solid #ccc" }}
              />
              <Button variant="outlined" component="label" sx={{ mt: 1, textTransform: "none" }}>
                Select Image
                <input type="file" accept="image/*" hidden />
              </Button>
              <Typography sx={{ fontSize: "0.75rem", color: "gray", mt: 1 }}>
                Maximum size: 1 MB • JPG, PNG
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" sx={{ backgroundColor: "#EF4C29" }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// MyPurchaseDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Divider,
  Button,
  Avatar,
  Stack,
  Chip,
  Card,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import { alpha } from "@mui/material/styles";
import { useUserStore } from "../store/userStore";

const CSS_VARS = {
  primaryDark: "#1B1833",
  primaryPurple: "#441752",
  primaryPink: "#AB4459",
  primaryOrange: "#F29F58",
};

interface MyPurchaseDialogProps {
  open: boolean;
  onClose: () => void;
}

const MyPurchaseDialog: React.FC<MyPurchaseDialogProps> = ({ open, onClose }) => {
  const { purchases } = useUserStore();
  const [tab, setTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const filteredPurchases = purchases?.filter((item: any) => {
    switch (tab) {
      case 1: return item.status === "To Pay";
      case 2: return item.status === "Processing" || item.status === "Shipping";
      case 3: return item.status === "Delivered";
      case 4: return item.status === "Return/Refund";
      case 5: return item.status === "Cancelled";
      case 6: return item.status === "Payment"; // New Payment tab filter
      default: return true; // All
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: alpha(CSS_VARS.primaryDark, 0.95),
          color: "#FFFFFF",
          border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`,
          backdropFilter: "blur(20px)",
          borderRadius: 3,
          boxShadow: `0 0 30px ${alpha(CSS_VARS.primaryOrange, 0.4)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2.5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <ShoppingBagIcon sx={{ color: CSS_VARS.primaryOrange }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(90deg, ${CSS_VARS.primaryOrange}, ${CSS_VARS.primaryPink})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            My Purchases
          </Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: CSS_VARS.primaryOrange }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ px: 3, mt: 1, "& .MuiTabs-indicator": { backgroundColor: CSS_VARS.primaryOrange } }}
      >
        <Tab label="All" />
        <Tab label="To Pay" />
        <Tab label="Processing" />
        <Tab label="Delivered" />
        <Tab label="Return/Refund" />
        <Tab label="Cancelled" />
        <Tab label="Payment" />
      </Tabs>

      <DialogContent sx={{ px: 3, py: 3 }}>
        {(!filteredPurchases || filteredPurchases.length === 0) && (
          <Typography
            textAlign="center"
            sx={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}
          >
            No purchases found for this category.
          </Typography>
        )}

        <Stack spacing={2}>
          {filteredPurchases?.map((item: any) => (
            <Card
              key={item.id}
              sx={{
                backgroundColor: alpha(CSS_VARS.primaryPurple, 0.3),
                border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`,
                borderRadius: 2,
                p: 2,
                cursor: "pointer",
              }}
            >
              <Stack direction="row" spacing={2}>
                <Avatar
                  variant="rounded"
                  src={item.image}
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: 2,
                    border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.4)}`,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {item.productName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mt: 0.5 }}>
                    ₱{item.price?.toLocaleString()}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      icon={<LocalShippingIcon />}
                      label={item.status}
                      size="small"
                      sx={{
                        backgroundColor: alpha(CSS_VARS.primaryOrange, 0.15),
                        color: CSS_VARS.primaryOrange,
                        "& .MuiChip-icon": { color: CSS_VARS.primaryOrange },
                      }}
                    />
                    <Chip
                      icon={<ReceiptIcon />}
                      label={`Order #${item.orderId}`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(CSS_VARS.primaryPink, 0.2),
                        color: CSS_VARS.primaryPink,
                      }}
                    />
                  </Stack>
                  {item.status === "Payment" && (
                    <Button
                      sx={{
                        mt: 1,
                        color: "#fff",
                        bgcolor: CSS_VARS.primaryOrange,
                        "&:hover": { bgcolor: alpha(CSS_VARS.primaryOrange, 0.8) },
                        borderRadius: 1,
                        fontSize: "0.75rem",
                        py: 0.5,
                      }}
                      onClick={() => alert(`Pay for Order #${item.orderId}`)}
                    >
                      Pay Now
                    </Button>
                  )}
                </Box>
              </Stack>
            </Card>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          fullWidth
          sx={{
            bgcolor: alpha(CSS_VARS.primaryOrange, 0.2),
            color: CSS_VARS.primaryOrange,
            borderRadius: 2,
            py: 1.2,
            "&:hover": { bgcolor: alpha(CSS_VARS.primaryOrange, 0.35) },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MyPurchaseDialog;

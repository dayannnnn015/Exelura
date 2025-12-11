import React, { useState } from "react";
import {
  Typography,
  Box,
  Avatar,
  Stack,
  Card,
  Button,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import CancelIcon from "@mui/icons-material/Cancel";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import { alpha } from "@mui/material/styles";
import { useUserStore } from "../store/userStore";

const CSS_VARS = {
  primaryDark: "#1B1833",
  primaryPurple: "#441752",
  primaryPink: "#AB4459",
  primaryOrange: "#F29F58",
};

const sidebarItems = [
  { label: "To Pay", icon: <PaymentIcon /> },
  { label: "Processing", icon: <LocalShippingIcon /> },
  { label: "Delivered", icon: <HistoryIcon /> },
  { label: "Return/Refund", icon: <CancelIcon /> },
  { label: "Cancelled", icon: <CancelIcon /> },
  { label: "Payment", icon: <ShoppingBagIcon /> },
  { label: "Payment Info", icon: <PaymentIcon /> },
  { label: "Communication", icon: <LocalShippingIcon /> },
  { label: "User Content", icon: <ReceiptIcon /> },
  { label: "Promotions", icon: <HistoryIcon /> },
];

const MyProfilePage: React.FC = () => {
  const { currentUser, purchases } = useUserStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (index: number) => setSelectedIndex(index);

  const filteredPurchases = purchases
    ?.filter((item: any) => {
      switch (selectedIndex) {
        case 0:
          return item.status === "To Pay";
        case 1:
          return item.status === "Processing" || item.status === "Shipping";
        case 2:
          return item.status === "Delivered";
        case 3:
          return item.status === "Return/Refund";
        case 4:
          return item.status === "Cancelled";
        case 5:
          return item.status === "Payment";
        default:
          return true;
      }
    })
    ?.filter((item: any) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.productName?.toLowerCase().includes(q) ||
        item.orderId?.toString().includes(q)
      );
    });

  const ACCORDION_STYLE = {
    backgroundColor: alpha(CSS_VARS.primaryPurple, 0.3),
    color: "#fff",
    border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.4)}`,
    borderRadius: 2,
    mb: 1,
    "& .MuiAccordionSummary-content": { alignItems: "center" },
    "&:hover": { backgroundColor: alpha(CSS_VARS.primaryOrange, 0.1) },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(180deg, #0A081F 0%, #1A173B 30%, #2A2660 70%, #3A3485 100%)`,
        position: "relative",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1300,
          width: "100%",
          backdropFilter: "blur(20px)",
          backgroundColor: alpha("#0A081F", 0.95),
          borderBottom: "1px solid rgba(120, 119, 198, 0.2)",
          display: "flex",
          alignItems: "center",
          px: { xs: 2, sm: 3, md: 4 },
          py: 1.5,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ color: "#fff" }}>
          EXELURA
        </Typography>

        {/* SEARCH */}
        <input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            marginLeft: 24,
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.3)",
            backgroundColor: "rgba(255,255,255,0.05)",
            color: "#fff",
            outline: "none",
          }}
        />

        {/* USER AVATAR */}
        <Avatar sx={{ bgcolor: CSS_VARS.primaryPink, ml: "auto" }}>
          {currentUser?.name?.charAt(0).toUpperCase()}
        </Avatar>
      </Box>

      {/* MAIN LAYOUT */}
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* SIDEBAR */}
        <Box
          sx={{
            width: 240,
            borderRight: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`,
            px: 2,
            py: 3,
            bgcolor: alpha(CSS_VARS.primaryDark, 0.95),
          }}
        >
          <List>
            {sidebarItems.map((item, index) => (
              <ListItemButton
                key={item.label}
                selected={selectedIndex === index}
                onClick={() => handleSelect(index)}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  "&.Mui-selected": {
                    bgcolor: alpha(CSS_VARS.primaryOrange, 0.2),
                  },
                }}
              >
                <ListItemIcon sx={{ color: CSS_VARS.primaryOrange }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} sx={{ color: "#fff" }} />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* CONTENT AREA */}
        <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
          <Stack spacing={2}>
            {/* PURCHASE LIST */}
            {selectedIndex <= 5 && (
              <>
                {(!filteredPurchases || filteredPurchases.length === 0) && (
                  <Typography
                    textAlign="center"
                    sx={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}
                  >
                    No purchases found for this category.
                  </Typography>
                )}

                {filteredPurchases?.map((item: any) => (
                  <Card
                    key={item.id}
                    sx={{
                      backgroundColor: alpha(CSS_VARS.primaryPurple, 0.3),
                      border: `1px solid ${alpha(
                        CSS_VARS.primaryOrange,
                        0.3
                      )}`,
                      borderRadius: 2,
                      p: 2,
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
                          border: `1px solid ${alpha(
                            CSS_VARS.primaryOrange,
                            0.4
                          )}`,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                          {item.productName}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255,255,255,0.6)", mt: 0.5 }}
                        >
                          ₱{item.price?.toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </>
            )}

            {/* PAYMENT INFO */}
            {selectedIndex === 6 && (
              <>
                <Accordion sx={ACCORDION_STYLE}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Stored Payment Cards</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      Your saved credit/debit cards and billing details.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion sx={ACCORDION_STYLE}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Billing Addresses</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>Saved billing addresses for orders.</Typography>
                  </AccordionDetails>
                </Accordion>
              </>
            )}

            {/* COMMUNICATION */}
            {selectedIndex === 7 && (
              <Accordion sx={ACCORDION_STYLE}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Communication & Support</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Your customer service chats and communication history.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {/* USER CONTENT */}
            {selectedIndex === 8 && (
              <Accordion sx={ACCORDION_STYLE}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>User-Generated Content</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Your reviews and ratings.</Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {/* PROMOTIONS */}
            {selectedIndex === 9 && (
              <Accordion sx={ACCORDION_STYLE}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Promotions</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Contest participation, giveaways, and rewards.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}
          </Stack>
        </Container>
      </Box>

      {/* FIXED BOTTOM-RIGHT CLOSE BUTTON */}
      <Button
        onClick={() => window.history.back()}
        startIcon={<CloseIcon />}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 3000,
          backgroundColor: CSS_VARS.primaryPink,
          color: "#fff",
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "30px",
          px: 3,
          py: 1,
          boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
          "&:hover": {
            backgroundColor: alpha(CSS_VARS.primaryPink, 0.8),
          },
        }}
      >
        Close
      </Button>

      {/* FOOTER */}
      <Box sx={{ py: 2, textAlign: "center", bgcolor: CSS_VARS.primaryDark }}>
        <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
          © 2025 Exelura
        </Typography>
      </Box>
    </Box>
  );
};

export default MyProfilePage;

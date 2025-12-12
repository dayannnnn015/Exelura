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
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import CancelIcon from "@mui/icons-material/Cancel";
import HistoryIcon from "@mui/icons-material/History";
// Removed CloseIcon import as the component is now a page, not a dismissible overlay
import { alpha } from "@mui/material/styles";
import { useUserStore } from "../store/userStore";
import { useNavigate } from "react-router-dom"; // Import useNavigate for internal navigation
import AccountMenu from "../components/AccountMenu";
import DeleteIcon from "@mui/icons-material/Delete";

// NOTE: HEADER_HEIGHT is now only for reference/padding, the fixed positioning is gone
const HEADER_HEIGHT = 64; 

const CSS_VARS = {
  primaryDark: "#1B1833",
  primaryPurple: "#441752",
  primaryPink: "#AB4459",
  primaryOrange: "#F29F58",
};

// SIDEBAR
// SIDEBAR
const sidebarItems = [
  { label: "To Pay", icon: <PaymentIcon /> },
  { label: "Processing", icon: <LocalShippingIcon /> },
  { label: "Delivered", icon: <HistoryIcon /> },
  { label: "Return/Refund", icon: <CancelIcon /> },
  { label: "Cancelled", icon: <CancelIcon /> },
  { label: "All Purchases", icon: <ShoppingBagIcon /> },
];

const MyProfilePage: React.FC = () => {
  const { currentUser, orders, logout, cancelOrder, updateOrderStatus } = useUserStore(); // add updateOrderStatus
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSelect = (index: number) => setSelectedIndex(index);
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Add a dummy handler for search and seller dashboard navigation for AccountMenu
  const handleSearch = (term: string) => {};
  const handleNavigateToSellerDashboard = () => {};

  // Flatten all items from all orders for the current user
  const allItems = (orders || [])
    .filter(order => !currentUser || order.userId === currentUser.id)
    .flatMap(order =>
      order.items.map(item => ({
        ...item,
        orderId: order.id,
        status: order.status,
        createdAt: order.createdAt,
      }))
    );

  const filteredPurchases = allItems
    ?.filter((item: any) => {
      switch (selectedIndex) {
        case 0: return item.status === "pending" || item.status === "to pay" || item.status === "To Pay";
        case 1: return item.status === "approved" || item.status === "processing" || item.status === "Processing" || item.status === "Shipping";
        case 2: return item.status === "delivered" || item.status === "Delivered";
        case 3: return item.status === "return/refund" || item.status === "Return/Refund";
        case 4: return item.status === "cancelled" || item.status === "Cancelled";
        case 5: return true; // All Purchases
        default: return false;
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

  // Handler for cancel and delete
  const handleCancel = (orderId: number) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      cancelOrder(orderId);
    }
  };
  const handleDelete = (orderId: number) => {
    // Remove the order from the store (hard delete)
    if (window.confirm("Are you sure you want to permanently delete this order?")) {
      // Remove order from orders array
      const ordersCopy = [...orders];
      const updatedOrders = ordersCopy.filter(order => order.id !== orderId);
      useUserStore.setState({ orders: updatedOrders });
    }
  };

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
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "transparent", color: "#fff" }}>
      {/* Sticky Header with AccountMenu */}
      <Box
        className="sticky-header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1300,
          width: '100%',
          backdropFilter: 'blur(20px)',
          backgroundColor: alpha('#0A081F', 0.95),
          borderBottom: '1px solid rgba(120, 119, 198, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
        }}
      >
        <AccountMenu
          onSearch={handleSearch}
          scrolled={false}
          onNavigateToSellerDashboard={handleNavigateToSellerDashboard}
        />
      </Box>

      {/* Main Layout */}
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* SIDEBAR */}
        <Box
        sx={{
          width: 260, // Slightly wider sidebar
          borderRight: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`,
          px: 2,
          py: 3,
          bgcolor: alpha(CSS_VARS.primaryDark, 0.9),
          flexShrink: 0,
          position: "sticky", // Sticky sidebar
          top: `64px`,
          height: `calc(100vh - 64px)`,
          overflowY: "auto",
        }}
      >
        {/* User Profile Summary (Enhanced for Page View) */}
        <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
            <Avatar 
                src={currentUser?.avatarUrl} 
                alt={currentUser?.username}
                sx={{ 
                    width: 56, 
                    height: 56, 
                    bgcolor: CSS_VARS.primaryOrange, 
                    border: `2px solid ${CSS_VARS.primaryPink}`
                }}
            />
            <Box>
                <Typography variant="h6" fontWeight={700} noWrap sx={{ color: "#fff" }}>
                    {currentUser?.username || "Guest User"}
                </Typography>
                <Typography variant="body2" sx={{ color: alpha("#fff", 0.6) }}>
                    My Account
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
                  pl: 1.7, // Adjust padding after border
                },
                "&:not(.Mui-selected)": {
                    "&:hover": { 
                        bgcolor: alpha(CSS_VARS.primaryPurple, 0.5),
                        borderLeft: `3px solid ${alpha(CSS_VARS.primaryOrange, 0.1)}`,
                        pl: 1.7
                    }
                }
              }}
            >
              <ListItemIcon sx={{ color: selectedIndex === index ? CSS_VARS.primaryOrange : alpha("#fff", 0.7) }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selectedIndex === index ? 600 : 400 }} />
            </ListItemButton>
          ))}
          
          <Divider sx={{ my: 2, borderColor: alpha(CSS_VARS.primaryOrange, 0.3) }} />

        </List>
      </Box>

        {/* CONTENT AREA */}
        <Container maxWidth="lg" sx={{ flex: 1, py: 3, bgcolor: alpha(CSS_VARS.primaryDark, 0.4), borderLeft: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.1)}` }}>
        <Stack spacing={3}>
          <Typography variant="h4" fontWeight={700} color={CSS_VARS.primaryOrange} mb={2}>
              {sidebarItems[selectedIndex].label}
          </Typography>

          {/* PURCHASE LIST (for indices 0 through 5) */}
          {selectedIndex <= 5 && (
            <>
              {/* Add a search/filter input here for Purchase list */}
              <Box sx={{ p: 2, border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`, borderRadius: 2, bgcolor: alpha(CSS_VARS.primaryDark, 0.6) }}>
                <Typography variant="body2" sx={{ color: alpha("#fff", 0.7), mb: 1 }}>Filter by Product/Order ID:</Typography>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid ' + alpha(CSS_VARS.primaryOrange, 0.5),
                    backgroundColor: CSS_VARS.primaryDark,
                    color: '#fff',
                  }}
                />
              </Box>

              {(!filteredPurchases || filteredPurchases.length === 0) && (
                <Typography
                  textAlign="center"
                  sx={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic", mt: 4 }}
                >
                  No orders found for this category or search query.
                </Typography>
              )}

              {filteredPurchases?.map((item: any) => (
                <Card
                  key={item.id + "-" + item.orderId}
                  sx={{
                    backgroundColor: alpha(CSS_VARS.primaryPurple, 0.3),
                    border: `1px solid ${alpha(CSS_VARS.primaryOrange, 0.3)}`,
                    borderRadius: 2,
                    p: 2,
                    color: "#fff",
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 20px ${alpha(CSS_VARS.primaryOrange, 0.1)}` }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      variant="rounded"
                      src={item.thumbnail}
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
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.6)", mt: 0.5 }}
                      >
                        ₱{item.price?.toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ color: CSS_VARS.primaryOrange, textAlign: 'right', mr: 2 }}>
                      Status: {item.status}
                    </Typography>
                    {/* Cancel and Delete buttons */}
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      sx={{ minWidth: 90, mr: 1 }}
                      onClick={() => handleCancel(item.orderId)}
                      disabled={item.status === "cancelled" || item.status === "Cancelled"}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      sx={{ minWidth: 90 }}
                      onClick={() => handleDelete(item.orderId)}
                    >
                      <DeleteIcon fontSize="small" />
                      Delete
                    </Button>
                  </Stack>
                </Card>
              ))}
            </>
          )}

          
          {/* Default Content for other categories (e.g. Communication, User Content, Promotions) */}
          {selectedIndex >= 7 && (
            <Typography 
                textAlign="center" 
                sx={{ color: alpha("#fff", 0.6), fontStyle: "italic", mt: 5 }}>
                Content for {sidebarItems[selectedIndex].label} will be displayed here.
            </Typography>
          )}

        </Stack>
      </Container>
      </Box>
    </Box>
  );
};

export default MyProfilePage;
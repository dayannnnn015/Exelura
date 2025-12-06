import React from "react";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { useUserStore } from "../store/userStore";
import { useCartStore } from "../store/cartStore";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const Cart = () => {
  const { cart, cartTotal, removeFromCart, updateCartItem } = useUserStore();
  const { closeCart } = useCartStore();

  return (
    <Box
      sx={{
        maxWidth: "900px",
        mx: "auto",
        mt: 6,
        p: 3,
        backgroundColor: "#FDFBF5",
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <ShoppingCartIcon sx={{ color: "#D4AF37", fontSize: 33 }} />
        <Typography variant="h4" fontWeight="bold">
          Shopping Cart
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* IF CART IS EMPTY */}
      {cart.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <ShoppingCartIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Your cart is empty
          </Typography>
        </Box>
      ) : (
        <>
          {/* LIST ITEMS */}
          <List>
            {cart.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  mb: 2,
                  backgroundColor: "white",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
                secondaryAction={
                  <IconButton onClick={() => removeFromCart(item.id)}>
                    <DeleteIcon sx={{ color: "#ff4444" }} />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    src={item.thumbnail}
                    variant="rounded"
                    sx={{ width: 64, height: 64, mr: 2 }}
                  />
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Typography fontWeight="bold" fontSize="1.1rem" noWrap>
                      {item.productName}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="#D4AF37" fontWeight="bold">
                        {usd.format(item.price)}
                      </Typography>

                      {/* Quantity Controls */}
                      <Box sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1 }}>
                        <IconButton
                          onClick={() =>
                            updateCartItem(item.id, Math.max(item.quantity - 1, 1))
                          }
                          size="small"
                          sx={{
                            border: "1px solid #D4AF37",
                            color: "#D4AF37",
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>

                        <Typography fontWeight="bold">{item.quantity}</Typography>

                        <IconButton
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          size="small"
                          sx={{
                            border: "1px solid #D4AF37",
                            color: "#D4AF37",
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Total: {usd.format(item.price * item.quantity)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 4 }} />

          {/* TOTAL */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h5">Subtotal</Typography>
            <Typography variant="h5" fontWeight="bold" color="#D4AF37">
              {usd.format(cartTotal)}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" mt={1}>
            Shipping calculated at checkout
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                borderColor: "#ff4444",
                color: "#ff4444",
                fontWeight: "bold",
              }}
              onClick={() => {
                closeCart();
                window.location.href = "/";
              }}
            >
              Continue Shopping
            </Button>

            <Button
              fullWidth
              variant="contained"
              sx={{ backgroundColor: "#D4AF37", color: "#fff", fontWeight: "bold" }}
            >
              Checkout
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Cart;

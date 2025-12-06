import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  Badge
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/cartStore';

const usdFormatted = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const CartDrawer = () => {
  const { isCartOpen, closeCart } = useCartStore();
  const { cart, cartTotal, cartCount, removeFromCart, updateCartItem, clearCart } = useUserStore();

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={closeCart}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          backgroundColor: '#FDFBF5',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCartIcon sx={{ color: '#D4AF37' }} />
            <Typography variant="h5" fontWeight="bold">
              Your Cart
            </Typography>
            <Badge 
              badgeContent={cartCount} 
              color="error"
              sx={{ ml: 1 }}
            />
          </Box>
          <IconButton onClick={closeCart}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {cart.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Your cart is empty
            </Typography>
            <Button
              variant="contained"
              onClick={closeCart}
              sx={{ mt: 3, backgroundColor: '#D4AF37' }}
            >
              Continue Shopping
            </Button>
          </Box>
        ) : (
          <>
            <List>
              {cart.map((item) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => removeFromCart(item.id)}>
                      <DeleteIcon sx={{ color: '#ff4444' }} />
                    </IconButton>
                  }
                  sx={{
                    mb: 2,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={item.thumbnail}
                      variant="rounded"
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight="bold" noWrap>
                        {item.productName}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="#D4AF37" fontWeight="bold">
                          {usdFormatted.format(item.price)} × {item.quantity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total: {usdFormatted.format(item.price * item.quantity)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Subtotal</Typography>
                <Typography variant="h6" fontWeight="bold" color="#D4AF37">
                  {usdFormatted.format(cartTotal)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Shipping calculated at checkout
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearCart}
                sx={{ borderColor: '#ff4444', color: '#ff4444' }}
              >
                Clear Cart
              </Button>
              <Button
                fullWidth
                variant="contained"
                sx={{ backgroundColor: '#D4AF37' }}
              >
                Checkout
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
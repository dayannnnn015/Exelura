import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Grid,
  Typography,
  Rating,
  Button,
  Chip,
  Badge,
  Avatar,
  Stack,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Close,
  ShoppingCart,
  Inventory,
  ArrowBack,
  ArrowForward,
  Reviews,
  LocalShipping,
  Verified,
  Comment,
  Class,
  Style,
} from "@mui/icons-material";

// -------------------- Types --------------------
interface Review {
  id: number;
  user?: string;
  rating: number;
  comment: string;
  date?: string;
  avatar?: string;
}

interface Product {
  id: number;
  title: string;
  images?: string[];
  thumbnail?: string;
  price: number;
  discountPercentage?: number;
  stock: number;
  brand?: string;
  sku?: string;
  weight?: string;
  dimensions?: string;
  warranty?: string;
  category?: string;
  tags?: string[];
  description: string;
  rating?: number;
  reviews?: Review[];
}

interface ProductDetailModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isLoggedIn: boolean;
}

// -------------------- Currency Formatter --------------------
const usdFormatted = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// -------------------- Component --------------------
const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  open,
  product,
  onClose,
  onAddToCart,
  isLoggedIn,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  if (!product) return null;

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail || "https://via.placeholder.com/600x400?text=No+Image"];

  const discountPrice = product.price * (1 - (product.discountPercentage || 0) / 100);
  const savings = product.price - discountPrice;

  const handlePreviousImage = () => {
    setSelectedImageIndex(prev => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex(prev => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCartClick = () => {
    onAddToCart(product);
  };

  // -------------------- Render Tabs --------------------
  const renderSpecifications = () => (
    <Stack spacing={2}>
      <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Product Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Brand
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {product.brand || "Not Specified"}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              SKU
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {product.sku || `PROD-${product.id}`}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Weight
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {product.weight || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Dimensions
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {product.dimensions || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Warranty
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {product.warranty || "1 Year Limited"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );

  const renderReviews = () => (
    <Stack spacing={2}>
      <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" fontWeight="bold" color="primary">
              {product.rating?.toFixed(1) || "0.0"}
            </Typography>
            <Rating value={product.rating || 0} readOnly precision={0.5} />
            <Typography variant="caption" color="text.secondary">
              {product.reviews?.length || 0} reviews
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Based on customer feedback
            </Typography>
          </Box>
        </Box>
      </Paper>

      {product.reviews?.map(review => (
        <Paper key={review.id} elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
          <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
            <Avatar src={review.avatar}>{review.user?.charAt(0) || "U"}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {review.user || "Anonymous"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Rating value={review.rating} size="small" readOnly />
                <Typography variant="caption" color="text.secondary">
                  {review.date}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Typography variant="body2">{review.comment}</Typography>
        </Paper>
      ))}

      {(!product.reviews || product.reviews.length === 0) && (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
          <Comment sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No reviews yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Be the first to review this product!
          </Typography>
        </Paper>
      )}
    </Stack>
  );

  const renderShipping = () => (
    <Stack spacing={2}>
      <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <LocalShipping color="primary" />
          <Typography variant="subtitle1" fontWeight="bold">
            Free Shipping
          </Typography>
        </Box>
        <Typography variant="body2">
          • Free standard shipping on orders over $50
          <br />
          • Express shipping available
          <br />
          • Estimated delivery: 3-5 business days
        </Typography>
      </Paper>
      <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Verified color="primary" />
          <Typography variant="subtitle1" fontWeight="bold">
            Easy Returns
          </Typography>
        </Box>
        <Typography variant="body2">
          • 30-day return policy
          <br />
          • Free returns on all items
          <br />
          • No questions asked
        </Typography>
      </Paper>
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2, maxHeight: "90vh" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {product.title}
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={4}>
          {/* Images Column */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: "relative", mb: 2, width: "100%", height: isMobile ? 250 : 400 }}>
              <img
                src={productImages[selectedImageIndex]}
                alt={product.title}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />

              {productImages.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePreviousImage}
                    sx={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "rgba(255,255,255,0.8)",
                      "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "rgba(255,255,255,0.8)",
                      "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                    }}
                  >
                    <ArrowForward />
                  </IconButton>
                </>
              )}

              {product.discountPercentage && product.discountPercentage > 0 && (
                <Chip
                  label={`${product.discountPercentage}% OFF`}
                  color="error"
                  sx={{ position: "absolute", top: 16, left: 16, fontWeight: "bold" }}
                />
              )}
            </Box>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <Box sx={{ display: "flex", gap: 1, overflowX: "auto", py: 1 }}>
                {productImages.map((img, index) => (
                  <Box
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    sx={{
                      flex: "0 0 auto",
                      width: 80,
                      height: 80,
                      borderRadius: 1,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: 3,
                      borderColor: selectedImageIndex === index ? "primary.main" : "transparent",
                      opacity: selectedImageIndex === index ? 1 : 0.7,
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Box>
                ))}
              </Box>
            )}
          </Grid>

          {/* Details Column */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* Category and Rating */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Chip label={product.category} color="secondary" size="medium" icon={<Class fontSize="small" />} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Rating value={product.rating || 0} readOnly precision={0.1} />
                  <Typography variant="body2" color="text.secondary">
                    ({product.rating?.toFixed(1) || "0.0"})
                  </Typography>
                  <Badge badgeContent={product.reviews?.length || 0} color="info" showZero>
                    <Reviews fontSize="small" />
                  </Badge>
                </Box>
              </Box>

              {/* Price Section */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 1 }}>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {usdFormatted.format(discountPrice)}
                  </Typography>
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <>
                      <Typography variant="h5" color="text.disabled" sx={{ textDecoration: "line-through" }}>
                        {usdFormatted.format(product.price)}
                      </Typography>
                      <Chip label={`Save ${usdFormatted.format(savings)}`} color="success" size="small" variant="outlined" />
                    </>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {product.discountPercentage && product.discountPercentage > 0 ? `${product.discountPercentage}% OFF • ` : ""}Price includes all taxes
                </Typography>
              </Box>

              {/* Stock Status */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Badge badgeContent={product.stock > 0 ? "In Stock" : "Out of Stock"} color={product.stock > 0 ? "success" : "error"} sx={{ "& .MuiBadge-badge": { fontSize: 12 } }} />
                <Typography variant="body2" color="text.secondary">
                  <Inventory fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
                  {product.stock} units available
                </Typography>
              </Box>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Style fontSize="small" sx={{ color: "text.secondary" }} />
                  {product.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                  ))}
                </Box>
              )}

              {/* Full Description */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Product Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {product.description}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCartClick}
                  disabled={!isLoggedIn}
                  sx={{ flex: 1, bgcolor: "#D4AF37", "&:hover": { bgcolor: "#C19B2E" }, fontWeight: "bold", py: 1.5 }}
                >
                  {isLoggedIn ? "Add to Cart" : "Login to Purchase"}
                </Button>
                <Button variant="outlined" size="large" color="primary" sx={{ flex: 1, fontWeight: "bold", py: 1.5 }}>
                  Buy Now
                </Button>
              </Stack>

              {/* Tabs */}
              <Box>
                <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant="fullWidth">
                  <Tab label="Specifications" />
                  <Tab label="Reviews" />
                  <Tab label="Shipping & Returns" />
                </Tabs>
                <Box sx={{ pt: 3 }}>
                  {activeTab === 0 && renderSpecifications()}
                  {activeTab === 1 && renderReviews()}
                  {activeTab === 2 && renderShipping()}
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Stack,
  alpha,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as InventoryIcon,
  ShoppingBag as OrderIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Visibility as VisibilityIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  MoreVert as MoreVertIcon,
  ShoppingCart as CartIcon,
  Category as CategoryIcon,
  PieChart as PieChartIcon,
  Insights as InsightsIcon,
  Star as StarIcon,
  TrendingFlat as TrendingFlatIcon,
  Notifications as NotificationsIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  AccountCircle as AccountIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ShoppingBasket as BasketIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  Storefront as StorefrontIcon,
  LocalOffer as LocalOfferIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GetSellerProducts } from '../API/ProductsAPI';
import SellerAccountMenu from '../components/SellerAccountMenu';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Scatter,
  ZAxis,
} from 'recharts';

// Enhanced Palette
const PALETTE = {
  bgA: '#0A081F',
  bgB: '#1A173B',
  purple: '#7877C6',
  teal: '#4ECDC4',
  pink: '#FF6B95',
  gold: '#F29F58',
  green: '#4CAF50',
  blue: '#2196F3',
  orange: '#FF9800',
  deepPurple: '#673AB7',
  cyan: '#00BCD4',
  lime: '#CDDC39',
};

// Mock data optimized for 1920x1200
const salesData = [
  { month: 'Jan', sales: 4200, revenue: 2540, orders: 124, profit: 1820 },
  { month: 'Feb', sales: 3200, revenue: 1458, orders: 98, profit: 1045 },
  { month: 'Mar', sales: 2400, revenue: 10500, orders: 156, profit: 8900 },
  { month: 'Apr', sales: 2980, revenue: 4208, orders: 112, profit: 3050 },
  { month: 'May', sales: 2190, revenue: 5200, orders: 134, profit: 3950 },
  { month: 'Jun', sales: 2690, revenue: 4100, orders: 108, profit: 2950 },
  { month: 'Jul', sales: 3790, revenue: 4600, orders: 142, profit: 3350 },
  { month: 'Aug', sales: 4500, revenue: 6400, orders: 165, profit: 4900 },
  { month: 'Sep', sales: 4100, revenue: 5600, orders: 152, profit: 4200 },
  { month: 'Oct', sales: 5400, revenue: 7800, orders: 198, profit: 6100 },
  { month: 'Nov', sales: 5100, revenue: 7200, orders: 184, profit: 5600 },
  { month: 'Dec', sales: 6200, revenue: 8900, orders: 210, profit: 7100 },
];

const categoryData = [
  { name: 'Electronics', value: 42, revenue: 125000, growth: 12, items: 45 },
  { name: 'Fashion', value: 28, revenue: 85000, growth: 8, items: 89 },
  { name: 'Home & Garden', value: 18, revenue: 62000, growth: 15, items: 67 },
  { name: 'Books', value: 22, revenue: 48000, growth: 5, items: 124 },
  { name: 'Sports', value: 10, revenue: 32000, growth: 22, items: 56 },
  { name: 'Beauty', value: 15, revenue: 45000, growth: 18, items: 78 },
];

const inventoryData = [
  { name: 'In Stock', value: 65, color: PALETTE.teal, items: 423, valueGrowth: 8 },
  { name: 'Low Stock', value: 18, color: PALETTE.gold, items: 117, valueGrowth: -2 },
  { name: 'Out of Stock', value: 12, color: PALETTE.pink, items: 78, valueGrowth: -5 },
  { name: 'Pre-order', value: 5, color: PALETTE.purple, items: 32, valueGrowth: 12 },
];

const customerInsightData = [
  { subject: 'New Customers', current: 145, previous: 120, fullMark: 200 },
  { subject: 'Repeat Orders', current: 112, previous: 98, fullMark: 200 },
  { subject: 'Avg. Spend', current: 156, previous: 130, fullMark: 200 },
  { subject: 'Satisfaction', current: 98, previous: 92, fullMark: 100 },
  { subject: 'Referrals', current: 92, previous: 85, fullMark: 100 },
  { subject: 'Engagement', current: 165, previous: 140, fullMark: 200 },
];

const topProductsData = [
  { id: 1, name: 'Wireless Headphones Pro', category: 'Electronics', price: 199.99, sold: 1243, revenue: 248757.57, rating: 4.8, stock: 45, growth: 12 },
  { id: 2, name: 'Organic Cotton T-Shirt', category: 'Fashion', price: 29.99, sold: 856, revenue: 25677.44, rating: 4.6, stock: 89, growth: 8 },
  { id: 3, name: 'Smart Watch Series 5', category: 'Electronics', price: 349.99, sold: 567, revenue: 198444.33, rating: 4.9, stock: 23, growth: 25 },
  { id: 4, name: 'Yoga Mat Premium', category: 'Sports', price: 49.99, sold: 432, revenue: 21599.68, rating: 4.7, stock: 156, growth: 15 },
  { id: 5, name: 'Cookware Set 12pc', category: 'Home & Garden', price: 299.99, sold: 289, revenue: 86997.11, rating: 4.5, stock: 34, growth: 5 },
  { id: 6, name: 'Skincare Bundle', category: 'Beauty', price: 89.99, sold: 398, revenue: 35816.02, rating: 4.8, stock: 67, growth: 32 },
];

const recentOrders = [
  { id: '#ORD-7821', customer: 'John Smith', amount: 249.99, status: 'pending', date: '15 Jan 2024', items: 3, time: '14:30' },
  { id: '#ORD-7820', customer: 'Jane Doe', amount: 89.50, status: 'approved', date: '14 Jan 2024', items: 1, time: '11:15' },
  { id: '#ORD-7819', customer: 'Robert Johnson', amount: 1499.00, status: 'shipped', date: '13 Jan 2024', items: 5, time: '09:45' },
  { id: '#ORD-7818', customer: 'Emily Davis', amount: 45.99, status: 'delivered', date: '12 Jan 2024', items: 2, time: '16:20' },
  { id: '#ORD-7817', customer: 'Michael Brown', amount: 329.99, status: 'delivered', date: '11 Jan 2024', items: 4, time: '13:10' },
];

const performanceMetrics = [
  { label: 'Conversion Rate', value: '3.2%', change: 2.1, icon: <TrendingIcon />, color: PALETTE.green },
  { label: 'Avg. Order Value', value: '$156.80', change: 8.5, icon: <MoneyIcon />, color: PALETTE.teal },
  { label: 'Customer Rating', value: '4.8/5', change: 0.3, icon: <StarIcon />, color: PALETTE.gold },
  { label: 'Return Rate', value: '2.4%', change: -0.8, icon: <BasketIcon />, color: PALETTE.pink },
];

const quickStats = [
  { label: 'Today\'s Revenue', value: '$2,450', change: 12.5, color: PALETTE.teal },
  { label: 'Today\'s Orders', value: '42', change: 8.2, color: PALETTE.pink },
  { label: 'Pending Orders', value: '18', change: -3, color: PALETTE.gold },
  { label: 'New Customers', value: '24', change: 15.3, color: PALETTE.purple },
];

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    totalOrders: 0, 
    totalProducts: 0, 
    totalCustomers: 0, 
    avgOrderValue: 0,
    conversionRate: 0,
    growthRate: 12.5,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const sellerProducts = await GetSellerProducts(2);

      const formattedProducts = sellerProducts.map((p) => ({ 
        id: p.id, 
        title: p.title, 
        price: p.price, 
        stock: p.stock, 
        sold: p.sold 
      }));
      setProducts(formattedProducts);

      const totalRevenue = formattedProducts.reduce((sum, item) => sum + item.price * (item.sold || 0), 0) + 89250;
      const uniqueCustomers = new Set(recentOrders.map((o) => o.customer)).size;

      setStats({ 
        totalRevenue, 
        totalOrders: recentOrders.length, 
        totalProducts: formattedProducts.length + 6, 
        totalCustomers: uniqueCustomers, 
        avgOrderValue: totalRevenue / recentOrders.length,
        conversionRate: 3.2,
        growthRate: 12.5,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return PALETTE.gold;
      case 'approved': return PALETTE.teal;
      case 'shipped': return PALETTE.purple;
      case 'delivered': return PALETTE.green;
      case 'cancelled': return PALETTE.pink;
      default: return '#fff';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <WarningIcon fontSize="small" />;
      case 'approved': return <CheckIcon fontSize="small" />;
      case 'shipped': return <ShippingIcon fontSize="small" />;
      case 'delivered': return <CheckIcon fontSize="small" />;
      default: return <WarningIcon fontSize="small" />;
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend, prefix = '', suffix = '', compact = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <Paper sx={{ 
        p: compact ? 2 : 2.5, 
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(color, 0.15)}, ${alpha(color, 0.05)})`,
        border: `1px solid ${alpha(color, 0.2)}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(8px)',
        height: compact ? '100%' : '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: color,
        }
      }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ 
              color: alpha('#fff', 0.7), 
              mb: 0.5, 
              fontWeight: 500, 
              fontSize: compact ? '0.8rem' : '0.85rem',
              lineHeight: 1.2
            }}>
              {title}
            </Typography>
            <Stack direction="row" alignItems="baseline" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Typography variant={compact ? "h5" : "h4"} sx={{ 
                fontWeight: 800, 
                color: '#fff', 
                fontSize: compact ? '1.25rem' : '1.75rem',
                lineHeight: 1
              }}>
                {prefix}{value}{suffix}
              </Typography>
              {trend !== undefined && (
                <Chip 
                  label={`${trend > 0 ? '+' : ''}${trend}%`}
                  size="small"
                  icon={trend > 0 ? <ArrowUpIcon sx={{ fontSize: 14 }} /> : <ArrowDownIcon sx={{ fontSize: 14 }} />}
                  sx={{ 
                    background: trend > 0 ? alpha(PALETTE.teal, 0.2) : alpha(PALETTE.pink, 0.2),
                    color: trend > 0 ? PALETTE.teal : PALETTE.pink,
                    fontWeight: 600,
                    height: 20,
                    fontSize: '0.7rem',
                    '& .MuiChip-icon': { fontSize: 14 }
                  }}
                />
              )}
            </Stack>
          </Box>
          <Box sx={{
            p: compact ? 1 : 1.5,
            borderRadius: 1.5,
            background: alpha(color, 0.1),
            border: `1px solid ${alpha(color, 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {React.cloneElement(icon, { sx: { 
              fontSize: compact ? 20 : 24, 
              color,
              display: 'block'
            } })}
          </Box>
        </Stack>
        {subtitle && (
          <Typography variant="caption" sx={{ 
            color: alpha('#fff', 0.6), 
            mt: compact ? 0.5 : 1, 
            display: 'block',
            fontSize: '0.75rem'
          }}>
            {subtitle}
          </Typography>
        )}
      </Paper>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: `linear-gradient(135deg, ${PALETTE.bgA}, ${PALETTE.bgB})`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress sx={{ color: PALETTE.purple, width: '60px !important', height: '60px !important' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(145deg, ${PALETTE.bgA}, ${PALETTE.bgB})`, 
      color: 'white',
      pb: 4,
      overflowX: 'hidden'
    }}>
      <SellerAccountMenu />

      {/* MAIN DASHBOARD CONTENT - FULL WIDTH */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '1920px',
        mx: 'auto',
        px: 6,
        pt: 4
      }}>
        {/* HEADER - COMPACT */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '-0.5px' }}>
              Dashboard Overview
            </Typography>
            <Typography sx={{ color: alpha('#fff', 0.7), fontSize: '0.95rem' }}>
              Real-time insights for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CalendarIcon />}
              sx={{
                borderColor: alpha('#fff', 0.2),
                color: '#fff',
                fontSize: '0.85rem',
                py: 0.75,
                px: 2
              }}
            >
              Last 30 Days
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              sx={{
                background: `linear-gradient(135deg, ${PALETTE.purple}, ${PALETTE.deepPurple})`,
                fontSize: '0.85rem',
                py: 0.75,
                px: 2,
                '&:hover': { 
                  background: `linear-gradient(135deg, ${PALETTE.deepPurple}, ${PALETTE.purple})`,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Export
            </Button>
          </Stack>
        </Stack>

        {/* TOP ROW: KEY METRICS - COMPACT LAYOUT */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={3}>
            <StatCard
              title="Total Revenue"
              value={stats.totalRevenue.toLocaleString()}
              prefix="$"
              icon={<MoneyIcon />}
              color={PALETTE.teal}
              subtitle="All time revenue"
              trend={12.5}
            />
          </Grid>
          <Grid item xs={12} lg={3}>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={<OrderIcon />}
              color={PALETTE.pink}
              subtitle="Completed orders"
              trend={8.2}
            />
          </Grid>
          <Grid item xs={12} lg={3}>
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={<InventoryIcon />}
              color={PALETTE.purple}
              subtitle="Active listings"
              trend={5.7}
            />
          </Grid>
          <Grid item xs={12} lg={3}>
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers}
              icon={<PeopleIcon />}
              color={PALETTE.gold}
              subtitle="Active customers"
              trend={15.3}
            />
          </Grid>
        </Grid>

        {/* QUICK STATS ROW */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {quickStats.map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Paper sx={{ 
                p: 1.5, 
                borderRadius: 2,
                background: alpha('#000', 0.2),
                border: `1px solid ${alpha('#fff', 0.08)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '100%'
              }}>
                <Box>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.6), display: 'block', mb: 0.5 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Chip 
                  label={`${stat.change > 0 ? '+' : ''}${stat.change}%`}
                  size="small"
                  sx={{ 
                    background: stat.change > 0 ? alpha(PALETTE.teal, 0.2) : alpha(PALETTE.pink, 0.2),
                    color: stat.change > 0 ? PALETTE.teal : PALETTE.pink,
                    fontWeight: 600,
                    height: 20,
                    fontSize: '0.7rem'
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* MAIN CONTENT AREA - DENSE LAYOUT */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* LEFT COLUMN - CHARTS (2/3 width) */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3} direction="column">
              {/* REVENUE TREND CHART */}
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  background: alpha('#000', 0.2),
                  border: `1px solid ${alpha('#fff', 0.08)}`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                  height: '100%'
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Revenue & Sales Trend
                      </Typography>
                      <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
                        Last 12 months performance
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip label="Revenue" size="small" sx={{ background: alpha(PALETTE.teal, 0.2), color: PALETTE.teal }} />
                      <Chip label="Sales" size="small" sx={{ background: alpha(PALETTE.purple, 0.2), color: PALETTE.purple }} />
                      <Chip label="Profit" size="small" sx={{ background: alpha(PALETTE.blue, 0.2), color: PALETTE.blue }} />
                    </Stack>
                  </Stack>
                  
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={PALETTE.teal} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={PALETTE.teal} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={PALETTE.purple} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={PALETTE.purple} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha('#fff', 0.1)} vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          stroke={alpha('#fff', 0.6)}
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                        />
                        <YAxis 
                          stroke={alpha('#fff', 0.6)}
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                          tickFormatter={(value) => `$${value/1000}k`}
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            background: PALETTE.bgB,
                            border: `1px solid ${alpha('#fff', 0.2)}`,
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: '12px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={PALETTE.teal}
                          strokeWidth={2}
                          fill="url(#colorRevenue)" 
                          name="Revenue"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="profit" 
                          stroke={PALETTE.blue}
                          strokeWidth={2}
                          fill={alpha(PALETTE.blue, 0.1)}
                          name="Profit"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              {/* CATEGORY & INVENTORY ROW */}
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  {/* CATEGORY PERFORMANCE */}
                  <Grid item xs={12} md={7}>
                    <Paper sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      background: alpha('#000', 0.2),
                      border: `1px solid ${alpha('#fff', 0.08)}`,
                      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                      height: '100%'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                        Category Performance
                      </Typography>
                      
                      <Box sx={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={alpha('#fff', 0.1)} horizontal={false} />
                            <XAxis 
                              dataKey="name" 
                              stroke={alpha('#fff', 0.6)}
                              tickLine={false}
                              axisLine={false}
                              fontSize={11}
                            />
                            <YAxis 
                              stroke={alpha('#fff', 0.6)}
                              tickLine={false}
                              axisLine={false}
                              fontSize={11}
                              tickFormatter={(value) => `${value}%`}
                            />
                            <RechartsTooltip 
                              contentStyle={{ 
                                background: PALETTE.bgB,
                                border: `1px solid ${alpha('#fff', 0.2)}`,
                                borderRadius: 8,
                                color: '#fff',
                                fontSize: '12px'
                              }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* INVENTORY HEALTH */}
                  <Grid item xs={12} md={5}>
                    <Paper sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      background: alpha('#000', 0.2),
                      border: `1px solid ${alpha('#fff', 0.08)}`,
                      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                      height: '100%'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                        Inventory Health
                      </Typography>
                      
                      <Box sx={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={inventoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={1}
                              dataKey="value"
                            >
                              {inventoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ 
                                background: PALETTE.bgB,
                                border: `1px solid ${alpha('#fff', 0.2)}`,
                                borderRadius: 8,
                                color: '#fff',
                                fontSize: '12px'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* RIGHT COLUMN - STATS & INSIGHTS (1/3 width) */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3} direction="column">
              {/* PERFORMANCE METRICS */}
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  background: alpha('#000', 0.2),
                  border: `1px solid ${alpha('#fff', 0.08)}`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                  height: '100%'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Performance Metrics
                  </Typography>
                  <Stack spacing={2.5}>
                    {performanceMetrics.map((metric, index) => (
                      <Box key={index}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box sx={{ 
                              p: 0.75, 
                              borderRadius: 1,
                              background: alpha(metric.color, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {React.cloneElement(metric.icon, { sx: { fontSize: 16, color: metric.color } })}
                            </Box>
                            <Typography variant="body2" sx={{ color: alpha('#fff', 0.8), fontSize: '0.85rem' }}>
                              {metric.label}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              {metric.value}
                            </Typography>
                            <Chip 
                              label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                              size="small"
                              sx={{ 
                                background: metric.change > 0 ? alpha(PALETTE.teal, 0.2) : alpha(PALETTE.pink, 0.2),
                                color: metric.change > 0 ? PALETTE.teal : PALETTE.pink,
                                fontWeight: 600,
                                height: 20,
                                fontSize: '0.7rem'
                              }}
                            />
                          </Stack>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.abs(metric.change) * 10} 
                          sx={{ 
                            height: 3,
                            borderRadius: 1.5,
                            background: alpha('#fff', 0.1),
                            '& .MuiLinearProgress-bar': {
                              background: metric.change > 0 ? PALETTE.teal : PALETTE.pink,
                              borderRadius: 1.5,
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              {/* CUSTOMER INSIGHTS */}
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  background: alpha('#000', 0.2),
                  border: `1px solid ${alpha('#fff', 0.08)}`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                  height: '100%'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Customer Insights
                  </Typography>
                  
                  <Box sx={{ height: 240, mb: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={customerInsightData}>
                        <PolarGrid stroke={alpha('#fff', 0.2)} />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          stroke={alpha('#fff', 0.6)}
                          tick={{ fontSize: 10 }}
                        />
                        <PolarRadiusAxis 
                          stroke={alpha('#fff', 0.6)}
                          angle={30}
                          domain={[0, 200]}
                        />
                        <Radar
                          name="Current"
                          dataKey="current"
                          stroke={PALETTE.teal}
                          fill={PALETTE.teal}
                          fillOpacity={0.3}
                          strokeWidth={1.5}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* BOTTOM SECTION - TABLES */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* TOP PRODUCTS TABLE */}
          <Grid item xs={12} lg={7}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2,
              background: alpha('#000', 0.2),
              border: `1px solid ${alpha('#fff', 0.08)}`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              height: '100%'
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Top Selling Products
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  endIcon={<TrendingFlatIcon sx={{ fontSize: 16 }} />}
                  sx={{ color: PALETTE.teal, fontSize: '0.85rem' }}
                >
                  View All
                </Button>
              </Stack>
              
              <TableContainer sx={{ 
                maxHeight: 320,
                borderRadius: 1,
                background: alpha('#fff', 0.03),
                '& .MuiTableCell-root': {
                  borderColor: alpha('#fff', 0.08),
                  color: '#fff',
                  py: 1.25,
                  fontSize: '0.85rem'
                },
                '& .MuiTableHead-root .MuiTableCell-root': {
                  fontWeight: 700,
                  color: alpha('#fff', 0.7),
                  background: alpha('#fff', 0.05),
                  fontSize: '0.85rem'
                }
              }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '30%' }}>Product</TableCell>
                      <TableCell align="center">Price</TableCell>
                      <TableCell align="center">Sold</TableCell>
                      <TableCell align="center">Revenue</TableCell>
                      <TableCell align="center">Stock</TableCell>
                      <TableCell align="center">Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProductsData.map((product) => (
                      <TableRow 
                        key={product.id}
                        hover
                        sx={{ 
                          '&:hover': { background: alpha('#fff', 0.05) },
                          cursor: 'pointer',
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              background: alpha(PALETTE.purple, 0.2),
                              color: PALETTE.purple,
                              fontSize: 12,
                              fontWeight: 600
                            }}>
                              {product.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }}>
                                {product.name.length > 25 ? `${product.name.substring(0, 25)}...` : product.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: alpha('#fff', 0.5) }}>
                                {product.category}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: PALETTE.teal }}>
                          ${product.price}
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {product.sold.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: PALETTE.gold }}>
                          ${product.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                            <CircularProgress 
                              variant="determinate" 
                              value={(product.stock / 200) * 100}
                              size={28}
                              thickness={4}
                              sx={{ 
                                color: product.stock > 50 ? PALETTE.teal : 
                                       product.stock > 20 ? PALETTE.gold : PALETTE.pink 
                              }}
                            />
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem' }}>
                                {product.stock}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                            <StarIcon sx={{ color: PALETTE.gold, fontSize: 14 }} />
                            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                              {product.rating}
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* RECENT ORDERS TABLE */}
          <Grid item xs={12} lg={5}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2,
              background: alpha('#000', 0.2),
              border: `1px solid ${alpha('#fff', 0.08)}`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              height: '100%'
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Recent Orders
                </Typography>
                <Badge badgeContent={recentOrders.length} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<NotificationsIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      borderColor: alpha('#fff', 0.2),
                      color: '#fff',
                      fontSize: '0.85rem',
                      py: 0.5,
                      px: 1.5
                    }}
                  >
                    View All
                  </Button>
                </Badge>
              </Stack>
              
              <Stack spacing={2}>
                {recentOrders.map((order) => (
                  <Paper 
                    key={order.id}
                    sx={{ 
                      p: 1.5, 
                      background: alpha('#fff', 0.03),
                      border: `1px solid ${alpha('#fff', 0.06)}`,
                      borderRadius: 1.5,
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: alpha('#fff', 0.05),
                        transform: 'translateX(2px)'
                      }
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: PALETTE.teal, mb: 0.5 }}>
                          {order.id}
                        </Typography>
                        <Typography variant="caption" sx={{ color: alpha('#fff', 0.7), display: 'block' }}>
                          {order.customer} • {order.items} items
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                          ${order.amount}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="caption" sx={{ color: alpha('#fff', 0.5) }}>
                            {order.date} {order.time}
                          </Typography>
                          <Chip 
                            label={order.status}
                            size="small"
                            sx={{ 
                              background: alpha(getStatusColor(order.status), 0.2),
                              color: getStatusColor(order.status),
                              fontWeight: 600,
                              height: 18,
                              fontSize: '0.65rem',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* FOOTER - COMPACT */}
        <Box sx={{ 
          pt: 3,
          borderTop: `1px solid ${alpha('#fff', 0.08)}`,
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.4) }}>
              © 2024 E-Commerce Dashboard • v2.1.4 • Last refresh: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.4) }}>
                <Box component="span" sx={{ color: PALETTE.teal, fontWeight: 600 }}>89,250</Box> total revenue
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.4) }}>
                <Box component="span" sx={{ color: PALETTE.green, fontWeight: 600 }}>●</Box> System online
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default SellerDashboard;
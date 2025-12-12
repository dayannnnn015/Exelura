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
  Chip,
  IconButton,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as InventoryIcon,
  ShoppingBag as OrderIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Category as CategoryIcon,
  PieChart as PieChartIcon,
  Insights as InsightsIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ShoppingBasket as BasketIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
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
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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

// Simplified data optimized for focused dashboard
const salesData = [
  { month: 'Jan', sales: 4200, revenue: 2540 },
  { month: 'Feb', sales: 3200, revenue: 1458 },
  { month: 'Mar', sales: 2400, revenue: 10500 },
  { month: 'Apr', sales: 2980, revenue: 4208 },
  { month: 'May', sales: 2190, revenue: 5200 },
  { month: 'Jun', sales: 2690, revenue: 4100 },
  { month: 'Jul', sales: 3790, revenue: 4600 },
  { month: 'Aug', sales: 4500, revenue: 6400 },
  { month: 'Sep', sales: 4100, revenue: 5600 },
  { month: 'Oct', sales: 5400, revenue: 7800 },
  { month: 'Nov', sales: 5100, revenue: 7200 },
  { month: 'Dec', sales: 6200, revenue: 8900 },
];

const categoryData = [
  { name: 'Electronics', value: 42, color: PALETTE.purple, growth: 12 },
  { name: 'Fashion', value: 28, color: PALETTE.teal, growth: 8 },
  { name: 'Home & Garden', value: 18, color: PALETTE.pink, growth: 15 },
  { name: 'Books', value: 22, color: PALETTE.gold, growth: 5 },
];

const inventoryData = [
  { name: 'In Stock', value: 65, color: PALETTE.teal, items: 423 },
  { name: 'Low Stock', value: 18, color: PALETTE.gold, items: 117 },
  { name: 'Out of Stock', value: 12, color: PALETTE.pink, items: 78 },
  { name: 'Pre-order', value: 5, color: PALETTE.purple, items: 32 },
];

const performanceMetrics = [
  { label: 'Conversion Rate', value: '3.2%', change: 2.1, icon: <TrendingIcon />, color: PALETTE.green },
  { label: 'Avg. Order Value', value: '$156.80', change: 12.5, icon: <MoneyIcon />, color: PALETTE.teal },
  { label: 'Customer Satisfaction', value: '98.4%', change: 4.2, icon: <StoreIcon />, color: PALETTE.purple },
  { label: 'Return Rate', value: '2.4%', change: -1.2, icon: <BasketIcon />, color: PALETTE.pink },
];

const SellerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    totalOrders: 0, 
    totalProducts: 0, 
    totalCustomers: 0, 
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
      const totalCustomers = Math.floor(totalRevenue / 156); // Estimated from avg order value

      setStats({ 
        totalRevenue, 
        totalOrders: 156, // Mock data
        totalProducts: formattedProducts.length + 6, 
        totalCustomers,
        growthRate: 12.5,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const StatCard = ({ title, value, icon, color, subtitle, trend, prefix = '', suffix = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Paper sx={{ 
        p: 3, 
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(color, 0.15)}, ${alpha(color, 0.05)})`,
        border: `1px solid ${alpha(color, 0.2)}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(12px)',
        height: '100%',
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.7), mb: 1, fontWeight: 500, fontSize: '0.9rem' }}>
              {title}
            </Typography>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.75rem' }}>
                {prefix}{value}{suffix}
              </Typography>
              {trend && (
                <Chip 
                  label={`${trend > 0 ? '+' : ''}${trend}%`}
                  size="small"
                  icon={trend > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  sx={{ 
                    background: trend > 0 ? alpha(PALETTE.teal, 0.2) : alpha(PALETTE.pink, 0.2),
                    color: trend > 0 ? PALETTE.teal : PALETTE.pink,
                    fontWeight: 600,
                    height: 22
                  }}
                />
              )}
            </Stack>
            {subtitle && (
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.6), mt: 1, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            background: alpha(color, 0.1),
            border: `1px solid ${alpha(color, 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {React.cloneElement(icon, { sx: { fontSize: 24, color } })}
          </Box>
        </Stack>
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
      background: `linear-gradient(135deg, ${PALETTE.bgA}, ${PALETTE.bgB})`, 
      color: 'white',
      pb: 4 
    }}>
      <SellerAccountMenu />

      {/* HEADER */}
      <Container maxWidth="lg" sx={{ 
        px: { xs: 2, sm: 3 },
        pt: 5,
        pb: 3
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'white' }}>
              Seller Dashboard
            </Typography>
            <Typography sx={{ color: alpha('#fff', 0.7), fontSize: '1rem' }}>
              Welcome back! Here's your business overview.
            </Typography>
          </Box>
        </Stack>
      </Container>

      {/* MAIN DASHBOARD CONTENT */}
      <Container maxWidth="lg" sx={{ 
        px: { xs: 2, sm: 3 },
        mt: 2
      }}>
        {/* TOP ROW: KEY METRICS */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Revenue"
              value={stats.totalRevenue.toLocaleString()}
              prefix="$"
              icon={<MoneyIcon />}
              color={PALETTE.teal}
              subtitle="+12.5% from last month"
              trend={12.5}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={<OrderIcon />}
              color={PALETTE.pink}
              subtitle="+8.2% from last month"
              trend={8.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={<InventoryIcon />}
              color={PALETTE.purple}
              subtitle="Active listings"
              trend={5.7}
            />
          </Grid>
          <Grid item xs={10} sm={4} lg={1}>
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers.toLocaleString()}
              icon={<PeopleIcon />}
              color={PALETTE.gold}
              subtitle="+15.3% new customers"
              trend={15.3}
            />
          </Grid>
        </Grid>

        {/* SECOND ROW: PERFORMANCE METRICS */}
        <Paper sx={{ 
          p: 3, 
          mt: 3, 
          borderRadius: 2,
          background: alpha('#fff', 0.05),
          border: `1px solid ${alpha('#fff', 0.08)}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
            Performance Metrics
          </Typography>
          <Grid container spacing={2}>
            {performanceMetrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  background: alpha('#fff', 0.03),
                  border: `1px solid ${alpha('#fff', 0.06)}`,
                  borderRadius: 2,
                  p: 2,
                }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1.5,
                      background: alpha(metric.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {React.cloneElement(metric.icon, { sx: { fontSize: 18, color: metric.color } })}
                    </Box>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.8) }}>
                      {metric.label}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="baseline" justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                      {metric.value}
                    </Typography>
                    <Chip 
                      label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                      size="small"
                      sx={{ 
                        background: metric.change > 0 ? alpha(PALETTE.teal, 0.2) : alpha(PALETTE.pink, 0.2),
                        color: metric.change > 0 ? PALETTE.teal : PALETTE.pink,
                        fontWeight: 600,
                        height: 22,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.abs(metric.change) * 10} 
                    sx={{ 
                      height: 4,
                      borderRadius: 2,
                      mt: 1,
                      background: alpha('#fff', 0.1),
                      '& .MuiLinearProgress-bar': {
                        background: metric.change > 0 ? PALETTE.teal : PALETTE.pink,
                        borderRadius: 2,
                      }
                    }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* THIRD ROW: REVENUE TREND CHART */}
        <Paper sx={{ 
          p: 3, 
          mt: 3, 
          borderRadius: 2,
          background: alpha('#fff', 0.05),
          border: `1px solid ${alpha('#fff', 0.08)}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'white' }}>
                Revenue Trend
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.6) }}>
                Monthly revenue performance
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip label="Revenue" sx={{ background: alpha(PALETTE.teal, 0.2), color: PALETTE.teal }} />
              <Chip label="Sales" sx={{ background: alpha(PALETTE.purple, 0.2), color: PALETTE.purple }} />
            </Stack>
          </Stack>
          
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.teal} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={PALETTE.teal} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#fff', 0.1)} vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke={alpha('#fff', 0.6)}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke={alpha('#fff', 0.6)}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: PALETTE.bgB,
                    border: `1px solid ${alpha('#fff', 0.2)}`,
                    borderRadius: 8,
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                  formatter={(value, name) => {
                    if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
                    return [value, name];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={PALETTE.teal}
                  strokeWidth={3}
                  fill="url(#colorRevenue)" 
                  name="Revenue ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* FOURTH ROW: CATEGORY & INVENTORY */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {/* CATEGORY DISTRIBUTION */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2,
              background: alpha('#fff', 0.05),
              border: `1px solid ${alpha('#fff', 0.08)}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              height: '100%'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
                Category Distribution
              </Typography>
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            background: PALETTE.bgB,
                            border: `1px solid ${alpha('#fff', 0.2)}`,
                            borderRadius: 8,
                            color: '#fff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    {categoryData.map((category, index) => (
                      <Card key={index} sx={{ 
                        background: alpha('#fff', 0.03),
                        border: `1px solid ${alpha('#fff', 0.06)}`,
                        borderRadius: 1.5,
                        p: 2,
                      }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              background: category.color 
                            }} />
                            <Typography sx={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>
                              {category.name}
                            </Typography>
                          </Stack>
                          <Stack alignItems="flex-end">
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }}>
                              {category.value}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: PALETTE.teal }}>
                              +{category.growth}% growth
                            </Typography>
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* INVENTORY HEALTH */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: 2,
              background: alpha('#fff', 0.05),
              border: `1px solid ${alpha('#fff', 0.08)}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              height: '100%'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
                Inventory Health
              </Typography>
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inventoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha('#fff', 0.1)} horizontal={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke={alpha('#fff', 0.6)}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke={alpha('#fff', 0.6)}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            background: PALETTE.bgB,
                            border: `1px solid ${alpha('#fff', 0.2)}`,
                            borderRadius: 8,
                            color: '#fff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                          }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {inventoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    {inventoryData.map((item, index) => (
                      <Box key={index}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box sx={{ 
                              width: 10, 
                              height: 10, 
                              borderRadius: '50%', 
                              background: item.color 
                            }} />
                            <Typography sx={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>
                              {item.name}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }}>
                            {item.value}%
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={item.value} 
                          sx={{ 
                            height: 6,
                            borderRadius: 3,
                            background: alpha('#fff', 0.1),
                            '& .MuiLinearProgress-bar': {
                              background: item.color,
                              borderRadius: 3,
                            }
                          }}
                        />
                        <Typography variant="caption" sx={{ color: alpha('#fff', 0.5), mt: 0.5, display: 'block' }}>
                          {item.items} items
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* BOTTOM SECTION: QUICK INSIGHTS */}
        <Paper sx={{ 
          p: 3, 
          mt: 3, 
          borderRadius: 2,
          background: alpha('#fff', 0.05),
          border: `1px solid ${alpha('#fff', 0.08)}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
            Business Insights
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                background: alpha(PALETTE.teal, 0.1),
                border: `1px solid ${alpha(PALETTE.teal, 0.2)}`,
                borderRadius: 2,
                p: 3,
              }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: alpha(PALETTE.teal, 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <TrendingIcon sx={{ fontSize: 28, color: PALETTE.teal }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.7), mb: 0.5 }}>
                      Monthly Growth
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: PALETTE.teal }}>
                      +{stats.growthRate}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#fff', 0.5) }}>
                      Compared to last month
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                background: alpha(PALETTE.purple, 0.1),
                border: `1px solid ${alpha(PALETTE.purple, 0.2)}`,
                borderRadius: 2,
                p: 3,
              }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: alpha(PALETTE.purple, 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <InsightsIcon sx={{ fontSize: 28, color: PALETTE.purple }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.7), mb: 0.5 }}>
                      Avg. Revenue Per Customer
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: PALETTE.purple }}>
                      $156.80
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#fff', 0.5) }}>
                      Based on last 30 days
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* FOOTER */}
      <Box sx={{ 
        px: { xs: 2, sm: 3 },
        py: 2, 
        mt: 4,
        borderTop: `1px solid ${alpha('#fff', 0.08)}`,
        background: alpha('#000', 0.2)
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.5) }}>
            © 2024 Seller Dashboard • Data updates in real-time
          </Typography>
          <Stack direction="row" spacing={2}>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.4) }}>
              Last updated: Today, 2:45 PM
            </Typography>
            <Typography variant="caption" sx={{ color: PALETTE.teal }}>
              System Status: <Box component="span" sx={{ color: PALETTE.green }}>●</Box> Operational
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default SellerDashboard;
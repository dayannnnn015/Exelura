// File: QuickStatsPanel.tsx (New Component)
import React from 'react';
import { Box, Typography, Paper, Grid, LinearProgress, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    LocalShipping,
    Shield,
    TrendingUp,
    Star,
    People,
    AttachMoney
} from '@mui/icons-material';

const StatsCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2.5),
    background: 'linear-gradient(135deg, rgba(15, 12, 41, 0.8) 0%, rgba(48, 43, 99, 0.6) 100%)',
    borderRadius: 12,
    border: '1px solid rgba(120, 119, 198, 0.2)',
    height: '100%',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        borderColor: 'rgba(120, 119, 198, 0.4)',
        boxShadow: '0 12px 24px rgba(120, 119, 198, 0.3)',
    }
}));

const QuickStatsPanel = () => {
    const stats = [
        {
            icon: <LocalShipping />,
            title: 'Free Shipping',
            value: 'On orders $50+',
            color: '#7877C6',
            progress: 85
        },
        {
            icon: <Shield />,
            title: 'Secure Payment',
            value: '100% Protected',
            color: '#FF6B95',
            progress: 100
        },
        {
            icon: <TrendingUp />,
            title: 'Top Rated',
            value: '4.8/5 Stars',
            color: '#4ECDC4',
            progress: 96
        },
        {
            icon: <People />,
            title: 'Active Users',
            value: '10K+ Monthly',
            color: '#45B7D1',
            progress: 78
        }
    ];

    return (
        <Box sx={{ mb: 4 }}>
            <Typography 
                variant="h6" 
                sx={{ 
                    color: 'white',
                    mb: 3,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <AttachMoney sx={{ color: '#FF6B95' }} />
                Quick Stats
            </Typography>
            
            <Grid container spacing={2}>
                {stats.map((stat, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                        <StatsCard elevation={0}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 2,
                                gap: 1.5
                            }}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${stat.color}40 0%, ${alpha(stat.color, 0.1)} 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: stat.color,
                                    }}
                                >
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontWeight: 500
                                        }}
                                    >
                                        {stat.title}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: 'white',
                                            fontWeight: 700
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <LinearProgress 
                                variant="determinate" 
                                value={stat.progress}
                                sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: alpha(stat.color, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                        background: `linear-gradient(90deg, ${stat.color} 0%, ${alpha(stat.color, 0.8)} 100%)`,
                                        borderRadius: 2,
                                    }
                                }}
                            />
                            
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: alpha(stat.color, 0.9),
                                    mt: 1,
                                    display: 'block',
                                    textAlign: 'right',
                                    fontWeight: 600
                                }}
                            >
                                {stat.progress}%
                            </Typography>
                        </StatsCard>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default QuickStatsPanel;
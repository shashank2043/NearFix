import React from 'react';
import {
  ResponsiveContainer,
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
} from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';

/**
 * Reusable Analytics Chart component integrating with Recharts.
 * Supports line, bar, and pie charts.
 * 
 * @param {Object} props
 * @param {string} props.title - Title of the chart card
 * @param {'line' | 'bar' | 'pie'} props.type - Chart representation type
 * @param {Array<Object>} props.data - Dataset array
 * @param {string} [props.xAxisKey] - X-axis data property name (for line & bar)
 * @param {string} props.dataKey - Value data property name
 * @param {Array<string>} [props.colors] - Override colors for charts
 * @param {number} [props.height=300] - Render height of chart container
 */
const AnalyticsChart = ({
  title,
  type,
  data,
  xAxisKey,
  dataKey,
  colors,
  height = 300,
}) => {
  const theme = useTheme();
  
  // Resolve theme colors
  const defaultColors = theme.palette.mode === 'light'
    ? ['#0B192C', '#00B4D8', '#48CAE4', '#0077B6', '#94A3B8'] // Light mode palette
    : ['#00F5D4', '#00B4D8', '#48CAE4', '#0077B6', '#1E293B']; // Dark mode palette

  const activeColors = colors || defaultColors;

  // Custom tooltips for premium visual card look
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box 
          sx={{ 
            bgcolor: theme.palette.background.paper, 
            p: 1.5, 
            borderRadius: 2, 
            boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
            border: `1px solid ${theme.palette.divider}` 
          }}
        >
          {label && (
            <Typography variant="caption" fontWeight="700" color="text.secondary" display="block" sx={{ mb: 0.5, textTransform: 'uppercase' }}>
              {label}
            </Typography>
          )}
          {payload.map((entry, idx) => (
            <Typography key={idx} variant="body2" fontWeight="800" sx={{ color: entry.color || theme.palette.text.primary }}>
              {entry.name}: {typeof entry.value === 'number' && entry.name.toLowerCase().includes('revenue') ? `₹${entry.value.toLocaleString('en-IN')}` : entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={height}>
          <Typography variant="body2" color="text.secondary">
            No chart data available.
          </Typography>
        </Box>
      );
    }

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
              <XAxis 
                dataKey={xAxisKey} 
                stroke={theme.palette.text.secondary} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke={theme.palette.text.secondary} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={activeColors[0]} 
                strokeWidth={3} 
                activeDot={{ r: 8, strokeWidth: 0, fill: theme.palette.mode === 'light' ? '#0B192C' : '#00F5D4' }} 
                dot={{ r: 4, strokeWidth: 2, fill: theme.palette.background.paper }}
                name={title}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
              <XAxis 
                dataKey={xAxisKey} 
                stroke={theme.palette.text.secondary} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke={theme.palette.text.secondary} 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={dataKey} 
                fill={activeColors[0]} 
                radius={[4, 4, 0, 0]}
                barSize={28}
                name={title}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey={dataKey}
                nameKey={xAxisKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={activeColors[index % activeColors.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: theme.palette.text.primary, fontSize: 12, fontWeight: 500 }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        {title && (
          <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 3 }}>
            {title}
          </Typography>
        )}
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;

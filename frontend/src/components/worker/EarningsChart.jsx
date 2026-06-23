import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

/**
 * Custom Tooltip component for the Recharts BarChart.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2.5,
          p: 1.5,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
          {label}
        </Typography>
        <Typography variant="body2" color="primary.main" fontWeight="800" sx={{ mt: 0.5 }}>
          ₹{payload[0].value.toLocaleString('en-IN')}
        </Typography>
      </Box>
    );
  }
  return null;
};

/**
 * EarningsChart Component
 * Renders a stylized bar chart representing daily earnings.
 * 
 * @param {Array} data - Array of objects matching { name: string, amount: number }.
 */
const EarningsChart = ({ data }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const containerRef = React.useRef(null);
  const [dimensions, setDimensions] = React.useState(null);

  React.useEffect(() => {
    const observeTarget = containerRef.current;
    if (!observeTarget) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(observeTarget);
    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Typography variant="body2" color="text.secondary">
          No earnings record to display.
        </Typography>
      </Box>
    );
  }

  // Accent colors for the bars
  const fillGradient = isDark ? '#00F5D4' : '#00B4D8';
  const gridColor = isDark ? '#1E293B' : '#E2E8F0';

  const chartWidth = dimensions ? dimensions.width : 0;
  const chartHeight = 300;

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: 320, pt: 2 }}>
      {dimensions && chartWidth > 0 && (
        <BarChart
          width={chartWidth}
          height={chartHeight}
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="name"
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }} />
          <Bar
            dataKey="amount"
            radius={[4, 4, 0, 0]}
            maxBarSize={45}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.amount > 0 ? fillGradient : isDark ? '#162235' : '#E2E8F0'}
              />
            ))}
          </Bar>
        </BarChart>
      )}
    </Box>
  );
};

export default EarningsChart;

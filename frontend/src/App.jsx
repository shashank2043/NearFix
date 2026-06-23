import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Box from '@mui/material/Box';
import { AuthContextProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/common/Navbar';

/**
 * Root Entrypoint Component.
 * Orchestrates contexts for routing, global session state, and Material UI styling themes.
 */
function App() {
  return (
    <Router>
      <AuthContextProvider>
        <ThemeContextProvider>
          <Box 
            display="flex" 
            flexDirection="column" 
            minHeight="100vh"
            sx={{
              bgcolor: 'background.default',
              color: 'text.primary',
              transition: 'background-color 0.3s ease, color 0.3s ease',
            }}
          >
            {/* Header Navigation */}
            <Navbar />

            {/* Core Application Page Routes */}
            <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
              <AppRoutes />
            </Box>
          </Box>
        </ThemeContextProvider>
      </AuthContextProvider>
    </Router>
  );
}

export default App;
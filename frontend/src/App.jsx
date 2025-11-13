import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider2 } from './context/ThemeContext';
import { CssBaseline } from '@mui/material';
import AppRoutes from './AppRoutes';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider2>
          <CssBaseline />
          <Navbar />
          <AppRoutes />
        </ThemeProvider2>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
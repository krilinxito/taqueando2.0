import { Box, Typography, Button, Container, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#e5f1ea',
        display: 'flex',
        alignItems: 'center',
        py: 6
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            p: 4,
            border: '1px solid #1a5c46',
            backgroundColor: '#0f3d2e'
          }}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: '#f8f8f8',
                mb: 2
              }}
            >
              Gestión simple para Taqueando
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                mb: 4
              }}
            >
              Administra pedidos, caja y reportes diarios desde un único panel.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/login"
                sx={{
                  backgroundColor: '#24a869',
                  px: 4,
                  py: 1.1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#1c8251'
                  }
                }}
              >
                Iniciar sesión
              </Button>

              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/registro"
                sx={{
                  px: 4,
                  py: 1.1,
                  borderRadius: 2,
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: '#f8f8f8',
                  '&:hover': {
                    borderColor: '#f8f8f8',
                    backgroundColor: 'rgba(255,255,255,0.08)'
                  }
                }}
              >
                Crear cuenta
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.6)'
              }}
            >
              Sistema interno para el equipo de Taqueando.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Home;

import { Box, Typography, Button, Container, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        py: 6
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: 4,
            border: 1,
            borderColor: 'primary.light',
            bgcolor: 'primary.main',
          }}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                color: 'primary.contrastText',
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
                color="secondary"
                size="large"
                component={Link}
                to="/login"
                sx={{ px: 4, py: 1.1 }}
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
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'primary.contrastText',
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
              sx={{ color: 'rgba(255,255,255,0.6)' }}
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

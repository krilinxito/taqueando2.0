import { Box, Typography, Paper } from '@mui/material';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';

const AdminIdle = () => (
  <Box
    sx={{
      height: '100%',
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: (theme) =>
        `radial-gradient(circle at top, ${theme.palette.mode === 'dark' ? 'rgba(36,168,105,0.06)' : 'rgba(36,168,105,0.08)'}, transparent 65%)`,
      p: 3
    }}
  >
    <Paper
      sx={{
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        p: 5,
        borderRadius: 4,
      }}
    >
      <Box
        sx={{
          width: 68,
          height: 68,
          borderRadius: '18px',
          mx: 'auto',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(36,168,105,0.15)' : 'rgba(36,168,105,0.12)',
          color: 'secondary.dark',
        }}
      >
        <DashboardCustomizeRoundedIcon fontSize="large" />
      </Box>

      <Typography variant="h4" color="primary.main" gutterBottom>
        Bienvenido
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Usa el menú lateral para navegar por los módulos de Taqueando.
      </Typography>

      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          px: 3,
          py: 1.2,
          borderRadius: 999,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(36,168,105,0.1)' : 'rgba(15,61,46,0.06)',
          color: 'secondary.dark',
          fontSize: 14,
          fontWeight: 500
        }}
      >
        Tip: puedes volver aquí seleccionando "Inicio" en el menú.
      </Box>
    </Paper>
  </Box>
);

export default AdminIdle;

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
      background:
        'radial-gradient(circle at top, rgba(36,168,105,0.08), transparent 65%)',
      p: 3
    }}
  >
    <Paper
      elevation={0}
      sx={{
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        p: 5,
        borderRadius: 4,
        border: '1px solid rgba(15,61,46,0.15)',
        backgroundColor: '#ffffff'
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
          backgroundColor: 'rgba(36,168,105,0.12)',
          color: '#1f7c55'
        }}
      >
        <DashboardCustomizeRoundedIcon fontSize="large" />
      </Box>

      <Typography variant="h4" fontWeight={600} color="#0f3d2e" gutterBottom>
        Bienvenido
      </Typography>
      <Typography variant="body1" sx={{ color: '#345c4d', mb: 3 }}>
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
          backgroundColor: 'rgba(15,61,46,0.06)',
          color: '#1f7c55',
          fontSize: 14,
          fontWeight: 500
        }}
      >
        Tip: puedes volver aquí seleccionando “Inicio” en el menú.
      </Box>
    </Paper>
  </Box>
);

export default AdminIdle;

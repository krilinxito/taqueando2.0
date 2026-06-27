import React, { useEffect, useRef, useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { checkPrinterStatus } from '../utils/printService';

// Cada cuanto consultamos al agente. Es barato: /status responde desde cache al
// instante y el agente limita por su cuenta cada cuanto re-escanea los puertos.
const POLL_INTERVAL_MS = 10000;
// Cuantas lecturas malas seguidas hacen falta para mostrar "desconectado".
// Evita que un fallo transitorio (suspension de red, blip) haga parpadear el chip.
const FAILURE_THRESHOLD = 2;

const PrinterStatusIndicator = () => {
  const [status, setStatus] = useState({ agent: false, printer: false });
  const failuresRef = useRef(0);

  useEffect(() => {
    const check = async () => {
      const res = await checkPrinterStatus();
      const ok = res.success && (res.printerConnected ?? false);

      if (ok) {
        // Lectura buena: actualizamos al instante y reseteamos el contador.
        failuresRef.current = 0;
        setStatus({ agent: res.success, printer: res.printerConnected ?? false });
        return;
      }

      // Lectura mala: solo reflejamos "desconectado" tras varios fallos seguidos.
      failuresRef.current += 1;
      if (failuresRef.current >= FAILURE_THRESHOLD) {
        setStatus({ agent: res.success, printer: res.printerConnected ?? false });
      }
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const connected = status.agent && status.printer;
  const label = !status.agent
    ? 'Agente no detectado'
    : !status.printer
      ? 'Impresora desconectada'
      : 'Impresora conectada';

  const color = connected ? 'success' : 'error';

  return (
    <Tooltip title={label}>
      <Chip
        icon={<PrintIcon />}
        label={label}
        color={color}
        size="small"
        variant="outlined"
      />
    </Tooltip>
  );
};

export default PrinterStatusIndicator;

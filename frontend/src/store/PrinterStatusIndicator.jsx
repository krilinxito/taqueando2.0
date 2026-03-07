import React, { useEffect, useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { checkPrinterStatus } from '../utils/printService';

const PrinterStatusIndicator = () => {
  const [status, setStatus] = useState({ agent: false, printer: false });

  useEffect(() => {
    const check = async () => {
      const res = await checkPrinterStatus();
      setStatus({
        agent: res.success,
        printer: res.printerConnected ?? false,
      });
    };

    check();
    const interval = setInterval(check, 30000);
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

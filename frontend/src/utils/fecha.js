const TZ = 'America/La_Paz';
const LOCALE = 'es-BO';

export const formatearFechaHora = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleString(LOCALE, {
    timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString(LOCALE, {
    timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

export const fechaHoyLaPaz = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
};

export const fechaEnLaPaz = (fecha) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(fecha));
};

export const esHoyEnLaPaz = (fecha) => {
  return fechaEnLaPaz(fecha) === fechaHoyLaPaz();
};

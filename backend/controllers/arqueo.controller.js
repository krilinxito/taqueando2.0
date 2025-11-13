const arqueoModel = require('../models/arqueo.model');

const crearArqueoController = async (req, res) => {
  try {
    const arqueoData = {
      ...req.body,
      idUsuario: req.user.id // Asumiendo que tienes el usuario en el request
    };

    // Validar que los datos necesarios estén presentes
    if (!arqueoData.conteo || !arqueoData.totalContado) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const id = await arqueoModel.crearArqueo(arqueoData);
    res.status(201).json({ 
      message: 'Arqueo creado exitosamente',
      id 
    });
  } catch (error) {
    console.error('Error al crear arqueo:', error);
    res.status(500).json({ error: 'Error al crear el arqueo' });
  }
};

const obtenerArqueosPorFechaController = async (req, res) => {
  try {
    const { fecha } = req.query; // Formato esperado: YYYY-MM-DD
    if (!fecha) {
      return res.status(400).json({ error: 'Fecha requerida' });
    }

    const arqueos = await arqueoModel.obtenerArqueosPorFecha(fecha);
    res.status(200).json(arqueos);
  } catch (error) {
    console.error('Error al obtener arqueos:', error);
    res.status(500).json({ error: 'Error al obtener los arqueos' });
  }
};

const obtenerUltimoArqueoController = async (req, res) => {
  try {
    const arqueo = await arqueoModel.obtenerUltimoArqueo();
    if (!arqueo) {
      return res.status(404).json({ error: 'No hay arqueos registrados' });
    }
    res.status(200).json(arqueo);
  } catch (error) {
    console.error('Error al obtener último arqueo:', error);
    res.status(500).json({ error: 'Error al obtener el último arqueo' });
  }
};

module.exports = {
  crearArqueoController,
  obtenerArqueosPorFechaController,
  obtenerUltimoArqueoController
};
import React, { useState } from 'react';
import {
  Container, Typography, TextField, Button, Paper,
  Grid, Box, Divider, MenuItem, Alert
} from '@mui/material';
import clientService from '../services/services.management';

const ClientRegister = () => {
  const [clientRUT, setClientRut] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [visitsPerMonth, setVisitsPerMonth] = useState(0);
  
  // Estados para manejo de mensajes
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estados para errores específicos de cada campo
  const [rutError, setRutError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [birthdayError, setBirthdayError] = useState('');

  // Función para limpiar todos los errores
  const clearErrors = () => {
    setErrorMessage('');
    setRutError('');
    setNameError('');
    setEmailError('');
    setBirthdayError('');
  };

  // Función para manejar errores específicos del backend
  const handleValidationError = (errorMsg) => {
    clearErrors();
    
    if (errorMsg.includes('RUT')) {
      setRutError(errorMsg);
    } else if (errorMsg.includes('nombre')) {
      setNameError(errorMsg);
    } else if (errorMsg.includes('email')) {
      setEmailError(errorMsg);
    } else if (errorMsg.includes('fecha') || errorMsg.includes('edad')) {
      setBirthdayError(errorMsg);
    } else {
      setErrorMessage(errorMsg);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    clearErrors();
    
    // Construir la fecha en formato YYYY-MM-DD
    const clientBirthday = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const newClient = {
      clientRUT,
      clientName,
      clientEmail,
      clientBirthday,
      visitsPerMonth
    };
  
    try {
      const response = await clientService.saveClient(newClient);
      
      // Limpiar los campos del formulario después de enviar
      setClientRut('');
      setClientName('');
      setClientEmail('');
      setDay('');
      setMonth('');
      setYear('');
      setVisitsPerMonth(0);
      
      setSuccessMessage('Cliente creado con éxito!');
      console.log('Cliente creado:', response.data);

    } catch (error) {
      console.error('Error al crear el cliente:', error);
      
      // Mostrar el mensaje de error del backend
      if (error.response && error.response.data) {
        // Si el backend devuelve un mensaje de error específico
        const errorMsg = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || 'Error en la validación';
        handleValidationError(errorMsg);
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error de conexión. Por favor, intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Generar arrays para los selectores
  const days = Array.from({length: 31}, (_, i) => i + 1);
  const months = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 100}, (_, i) => currentYear - i);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={6} 
        sx={{ 
          p: { xs: 3, sm: 4, md: 5 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Registro de Cliente
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" sx={{ mb: 2 }}>
          Complete todos los campos para crear su cuenta en el sistema de karting
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {/* Mensajes de estado con mejor visibilidad */}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              },
              fontWeight: 'medium'
            }}
          >
            ✅ {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              },
              fontWeight: 'medium'
            }}
          >
            ❌ {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Sección 1: Información Personal (flujo lógico de identificación) */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              1. Información Personal
            </Typography>
            <Divider sx={{ mb: 3, backgroundColor: 'primary.light' }} />
            
            <Grid container spacing={3}>
              {/* RUT - Campo principal de identificación (primer lugar) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="RUT"
                  placeholder="Ej: 12345678-9"
                  value={clientRUT}
                  onChange={(e) => setClientRut(e.target.value)}
                  required
                  error={!!rutError}
                  helperText={rutError || "Ingrese el RUT sin puntos y con guión"}
                  InputProps={{
                    inputProps: { maxLength: 10 }
                  }}
                  sx={{ '& .MuiFormLabel-root.Mui-focused': { color: 'primary.main' } }}
                />
              </Grid>
              
              {/* Nombre completo - Información personal básica */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth 
                  label="Nombre y Apellido"
                  placeholder="Ej: Juan Pérez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  error={!!nameError}
                  helperText={nameError || "Ingrese nombre y apellido"}
                  sx={{ '& .MuiFormLabel-root.Mui-focused': { color: 'primary.main' } }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Sección 2: Información de Contacto */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              2. Información de Contacto
            </Typography>
            <Divider sx={{ mb: 3, backgroundColor: 'primary.light' }} />
            
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                  error={!!emailError}
                  helperText={emailError || "Será usado para enviar su comprobante de compra"}
                  sx={{ '& .MuiFormLabel-root.Mui-focused': { color: 'primary.main' } }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Sección 3: Fecha de Nacimiento - Agrupada lógicamente */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              3. Fecha de Nacimiento
            </Typography>
            <Divider sx={{ mb: 3, backgroundColor: 'primary.light' }} />
            
            {birthdayError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {birthdayError}
              </Alert>
            )}
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Seleccione su fecha de nacimiento
            </Typography>
            
            <Grid container spacing={10} justifyContent="center">
              {/* Orden lógico: Día, Mes, Año */}
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Día"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  required
                  error={!!birthdayError}
                  sx={{ '& .MuiFormLabel-root.Mui-focused': { color: 'primary.main' } }}
                >
                  <MenuItem value="">Día</MenuItem>
                  {days.map((d) => (
                    <MenuItem key={d} value={d}>
                      {String(d).padStart(2, '0')}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Mes"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                  error={!!birthdayError}
                  sx={{ '& .MuiFormLabel-root.Mui-focused': { color: 'primary.main' } }}
                >
                  <MenuItem value="">Mes</MenuItem>
                  {months.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Año"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  error={!!birthdayError}
                  sx={{ '& .MuiFormLabel-root.Mui-focused': { color: 'primary.main' } }}
                >
                  <MenuItem value="">Año</MenuItem>
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* Sección de Envío con indicadores claros */}
          <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
              * Campos obligatorios
            </Typography>
            
            {/* Indicador de progreso visual */}
            <Box sx={{ textAlign: 'center' }}>
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                disabled={loading}
                sx={{ 
                  backgroundColor: "#FFA500",
                  '&:hover': {
                    backgroundColor: "#FF8C00"
                  },
                  '&:disabled': {
                    backgroundColor: "#FFE4B5"
                  },
                  minWidth: 200,
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? (
                  <>
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'inline-block',
                        width: 20,
                        height: 20,
                        border: '2px solid #ffffff40',
                        borderTop: '2px solid #ffffff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        mr: 2,
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }}
                    />
                    Registrando Cliente...
                  </>
                ) : (
                  'Registrar Cliente'
                )}
              </Button>
            </Box>
            
            {/* Información adicional para el usuario */}
            <Typography variant="caption" display="block" color="textSecondary" align="center" sx={{ mt: 2 }}>
              Al registrarse, acepta nuestros términos y condiciones de uso del karting
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ClientRegister;

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Alert,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Paper,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import bookingService from '../services/services.management';

const StatusKartBooking = () => {
  const [rut, setRut] = useState('');
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  
  // Estados para mejorar UX (Nielsen: Visibilidad del estado del sistema)
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, booking: null, action: null });
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Función para validar RUT (Nielsen: Prevención de errores)
  const validateRut = (rut) => {
    const rutRegex = /^\d{7,8}-[\dkK]$/; // Formato: 12345678-9 o 1234567-K
    return rutRegex.test(rut.trim());
  };

  // Función para obtener el color del estado (Nielsen: Reconocimiento antes que recuerdo)
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmada':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  // Función para obtener el ícono del estado (Nielsen: Reconocimiento antes que recuerdo)
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmada':
        return <CheckCircleIcon />;
      case 'pendiente':
        return <ScheduleIcon />;
      case 'cancelada':
        return <CancelIcon />;
      default:
        return <InfoIcon />;
    }
  };

  // Función para extraer mensaje de error del backend
  const extractErrorMessage = (error) => {
    if (error.response && error.response.data) {
      // Si el backend retorna un string directamente
      if (typeof error.response.data === 'string') {
        return error.response.data;
      }
      // Si el backend retorna un objeto con mensaje
      if (error.response.data.message) {
        return error.response.data.message;
      }
      // Si el backend retorna un objeto con error
      if (error.response.data.error) {
        return error.response.data.error;
      }
      // Si hay otros campos comunes de error
      if (error.response.data.details) {
        return error.response.data.details;
      }
    }
    
    // Si es un error de red
    if (error.message) {
      if (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK')) {
        return 'Error de conexión. Verifique su conexión a internet e intente nuevamente.';
      }
      return error.message;
    }
    
    // Mensaje genérico como último recurso
    return 'Ha ocurrido un error inesperado. Por favor, intente nuevamente.';
  };

  // Función para cargar las reservas (Nielsen: Visibilidad del estado del sistema)
  const fetchBookings = async () => {
    if (!rut.trim()) {
      setError('Debes ingresar un RUT válido.');
      return;
    }

    if (!validateRut(rut)) {
      setError('El formato del RUT no es válido. Debe ser: 12345678-9');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await bookingService.getBookingByUserRut(rut);
      setBookings(response.data);
      
      if (response.data.length === 0) {
        // Mensaje cuando no hay resultados (puede venir del backend o ser local)
        setError('No se encontraron reservas para este RUT.');
      }
    } catch (err) {
      console.error('Error al obtener las reservas:', err);
      // Usar el mensaje del backend
      setError(extractErrorMessage(err));
    } finally {
      setIsSearching(false);
    }
  };

  // Función para confirmar la reserva (Nielsen: Control y libertad del usuario)
  const handleConfirmBooking = async (bookingId) => {
    setIsLoading(true);
    try {
      await bookingService.confirmBooking(bookingId);
      await bookingService.sendVoucherByEmail(bookingId);
      
      setSuccessMessage('Reserva confirmada con éxito. Voucher enviado al correo electrónico.');
      setSnackbarOpen(true);
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error('Error al confirmar la reserva:', err);
      // Usar el mensaje del backend
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
      setConfirmDialog({ open: false, booking: null, action: null });
    }
  };

  // Función para mostrar diálogo de confirmación (Nielsen: Prevención de errores)
  const showConfirmDialog = (booking, action) => {
    setConfirmDialog({ open: true, booking, action });
  };

  // Función para cerrar diálogo
  const handleCloseDialog = () => {
    setConfirmDialog({ open: false, booking: null, action: null });
  };

  // useEffect para manejar la cancelación de reservas (Nielsen: Visibilidad del estado del sistema)
  useEffect(() => {
    const cancelBooking = async () => {
      if (!cancelBookingId) return;

      setIsLoading(true);
      try {
        await bookingService.cancelBooking(cancelBookingId);
        setSuccessMessage('Reserva cancelada con éxito.');
        setSnackbarOpen(true);
        setCancelBookingId(null);
        setRefresh((prev) => !prev);
      } catch (err) {
        console.error('Error al cancelar la reserva:', err);
        // Usar el mensaje del backend
        setError(extractErrorMessage(err));
        setCancelBookingId(null);
      } finally {
        setIsLoading(false);
      }
    };

    cancelBooking();
  }, [cancelBookingId]);

  // useEffect para recargar las reservas cuando cambie el estado `refresh`
  useEffect(() => {
    if (rut.trim() && validateRut(rut)) {
      fetchBookings();
    }
  }, [refresh]);

  // Función para establecer el bookingId a cancelar (Nielsen: Control y libertad del usuario)
  const handleCancelBooking = (bookingId) => {
    setCancelBookingId(bookingId);
  };

  // Función para manejar el Enter en el campo de búsqueda (Nielsen: Flexibilidad y eficiencia de uso)
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      fetchBookings();
    }
  };

  // Función para limpiar errores (Nielsen: Control y libertad del usuario)
  const clearError = () => {
    setError(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header con información clara (Nielsen: Estándares y consistencia) */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Estado de Reservas
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Consulte, confirme o cancele sus reservas de karting
        </Typography>
        <Divider />
      </Paper>

      {/* Formulario de búsqueda (Nielsen: Prevención de errores) */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon color="primary" />
          Buscar Reservas
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mt: 2 }}>
          <TextField
            fullWidth
            label="RUT del cliente"
            value={rut}
            onChange={(e) => {
              setRut(e.target.value);
              if (error) clearError(); // Limpiar error al escribir
            }}
            onKeyUp={handleKeyPress}
            placeholder="Ej: 12345678-9"
            error={!!error}
            helperText={error || "Ingrese su RUT para buscar sus reservas"}
            disabled={isSearching}
            sx={{ maxWidth: 300 }}
          />
          
          <Button
            variant="contained"
            onClick={fetchBookings}
            disabled={isSearching || !rut.trim()}
            startIcon={isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
            sx={{ minWidth: 140, height: 56 }}
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
        </Box>

        {/* Ayuda contextual (Nielsen: Ayuda y documentación) */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Información:</strong> Ingrese su RUT completo con guión y dígito verificador (Ej: 12345678-9)
          </Typography>
        </Alert>
      </Paper>

      {/* Mensajes de error mejorados (Nielsen: Visibilidad del estado del sistema) */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={clearError}
          action={
            <Button color="inherit" size="small" onClick={clearError}>
              Cerrar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Grid de reservas (Nielsen: Reconocimiento antes que recuerdo) */}
      {bookings.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            Sus Reservas ({bookings.length})
          </Typography>
          
          <Grid container spacing={3}>
            {bookings.map((booking) => (
              <Grid item xs={12} sm={6} md={4} key={booking.id}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 5, right: 16 }}>
                    <Chip
                      icon={getStatusIcon(booking.bookingStatus)}
                      label={booking.bookingStatus?.toUpperCase()}
                      color={getStatusColor(booking.bookingStatus)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  {/* Tarjeta con información resumen de la reserva */}
                  <CardContent sx={{ flexGrow: 1, pt: 5 }}>
                    {/* Información principal con iconos (Nielsen: Reconocimiento antes que recuerdo) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon color="primary" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Fecha:</strong> {booking.bookingDate}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon color="primary" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Hora:</strong> {booking.bookingTime}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon color="primary" fontSize="small" />
                        <Typography variant="body2">
                          <strong>Personas:</strong> {booking.numOfPeople}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2">
                        <strong>Vueltas/Tiempo:</strong> {booking.lapsOrMaxTimeAllowed}
                      </Typography>
                      
                      <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                        <strong>Total: ${booking.totalAmount?.toLocaleString()}</strong>
                      </Typography>
                    </Box>
                  </CardContent>

                  {/* Acciones contextuales (Nielsen: Control y libertad del usuario) */}
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {booking.bookingStatus !== 'confirmada' && booking.bookingStatus !== 'cancelada' && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<PaymentIcon />}
                        onClick={() => showConfirmDialog(booking, 'confirm')}
                        disabled={isLoading}
                        fullWidth
                      >
                        Pagar Reserva
                      </Button>
                    )}

                    {booking.bookingStatus === 'confirmada' && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => showConfirmDialog(booking, 'cancel')}
                        disabled={isLoading}
                        fullWidth
                      >
                        Cancelar Reserva
                      </Button>
                    )}

                    {booking.bookingStatus === 'cancelada' && (
                      <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center' }}>
                        Reserva cancelada
                      </Typography>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Estado vacío (Nielsen: Ayuda y documentación) */}
      {bookings.length === 0 && !error && !isSearching && (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay reservas para mostrar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingrese su RUT para buscar sus reservas de karting
          </Typography>
        </Paper>
      )}

      {/* Diálogo de confirmación (Nielsen: Prevención de errores) */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {confirmDialog.action === 'confirm' ? 'Confirmar Pago' : 'Cancelar Reserva'}
        </DialogTitle>
        
        <DialogContent>
          {confirmDialog.booking && (
            <Box>
              <Alert severity={confirmDialog.action === 'confirm' ? 'info' : 'warning'} sx={{ mb: 2 }}>
                {confirmDialog.action === 'confirm' 
                  ? 'Al confirmar el pago, se procesará su reserva y se enviará a cada integrante, un comprobante por email. Este debe ser presentado al momento de la visita.'
                  : 'Esta acción no se puede deshacer. ¿Está seguro de que desea cancelar esta reserva?'
                }
              </Alert>
              
              <Typography variant="body1" gutterBottom>
                <strong>Detalles de la reserva:</strong>
              </Typography>
              
              <Box sx={{ ml: 2 }}>
                <Typography variant="body2">• Fecha: {confirmDialog.booking.bookingDate}</Typography>
                <Typography variant="body2">• Hora: {confirmDialog.booking.bookingTime}</Typography>
                <Typography variant="body2">• Personas: {confirmDialog.booking.numOfPeople}</Typography>
                <Typography variant="body2">• Total: ${confirmDialog.booking.totalAmount?.toLocaleString()}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (confirmDialog.action === 'confirm') {
                handleConfirmBooking(confirmDialog.booking.id);
              } else {
                handleCancelBooking(confirmDialog.booking.id);
              }
            }}
            variant="contained"
            color={confirmDialog.action === 'confirm' ? 'success' : 'error'}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
          >
            {isLoading ? 'Procesando...' : (confirmDialog.action === 'confirm' ? 'Confirmar Pago' : 'Cancelar Reserva')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes de éxito (Nielsen: Visibilidad del estado del sistema) */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StatusKartBooking;

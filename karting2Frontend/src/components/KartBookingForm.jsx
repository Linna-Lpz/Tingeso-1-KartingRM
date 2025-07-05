import { useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Divider, 
  Box, 
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Info as InfoIcon,
  Warning as WarningIcon 
} from '@mui/icons-material';
import bookingService from '../services/services.management';
import { useNavigate } from 'react-router-dom';

// Importar los componentes modulares
import ActivityDetailsSection from './booking/ActivityDetailsSection';
import DateTimeSection from './booking/DateTimeSection';
import ParticipantsSection from './booking/ParticipantsSection';

// Inicialización del formulario
const KartBookingForm = () => {
  // Variables para manejar la fecha y hora
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingTime, setBookingTime] = useState(null);
  const [bookingTimeNoFree, setBookingTimeNoFree] = useState([]);
  const [lapsOrMaxTime, setLapsOrMaxTime] = useState(10);
  // Variables para manejar datos del cliente
  const [numOfPeople, setNumOfPeople] = useState(1);
  const [person, setPerson] = useState({ rut: '', name: '', email: '' });
  const [people, setPeople] = useState([]);
  
  // Estados para errores específicos
  const [lapsError, setLapsError] = useState('');
  const [peopleError, setPeopleError] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [rutError, setRutError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estados para mejorar UX (Nielsen: Visibilidad del estado del sistema)
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loadingTimes, setLoadingTimes] = useState(false);
  
  const navigate = useNavigate();

  // Pasos del proceso (Nielsen: Visibilidad del estado del sistema)
  const steps = [
    'Detalles de la actividad',
    'Fecha y hora',
    'Participantes',
    'Confirmar reserva'
  ];

  // Definición de días feriados MM-DD
  const holidays = [
    '01-01', // Año Nuevo
    '05-01', // Día del Trabajador
    '09-18', // Fiestas Patrias
    '09-19', // Fiestas Patrias
    '12-25', // Navidad
  ];

  let blockDuration;
  if(lapsOrMaxTime === 10) blockDuration = 30;
  else if(lapsOrMaxTime === 15) blockDuration = 35;
  else if(lapsOrMaxTime === 20) blockDuration = 40;

  // Funciones para navegación entre pasos
  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Función para validar si se puede avanzar al siguiente paso
  const canProceedToNextStep = () => {
    switch (activeStep) {
      case 0: // Detalles de la actividad
        return lapsOrMaxTime && numOfPeople >= 1 && numOfPeople <= 15;
      case 1: // Fecha y hora
        return bookingDate && bookingTime;
      case 2: // Participantes
        return people.length === numOfPeople;
      case 3: // Confirmar reserva
        return true;
      default:
        return false;
    }
  };

  // Función para limpiar todos los errores
  const clearErrors = () => {
    setLapsError('');
    setPeopleError('');
    setDateError('');
    setTimeError('');
    setRutError('');
    setNameError('');
    setEmailError('');
    setGeneralError('');
    setSuccessMessage('');
  };

  // Función mejorada para mostrar feedback específico (Nielsen: Prevención de errores)
  const handleValidationError = (errorMsg) => {
    clearErrors();
    
    // Errores específicos de vueltas/tiempo máximo
    if (errorMsg.includes('vueltas') || errorMsg.includes('tiempo máximo') || errorMsg.includes('10, 15 o 20')) {
      setLapsError(errorMsg);
      setActiveStep(0);
    } 
    // Errores específicos de número de personas
    else if (errorMsg.includes('número de personas') || errorMsg.includes('mayor a 0') || errorMsg.includes('menor o igual a 15')) {
      setPeopleError(errorMsg);
      setActiveStep(0);
    } 
    // Errores específicos de fecha
    else if (errorMsg.includes('fecha de reserva') || errorMsg.includes('fecha') || errorMsg.includes('nula')) {
      setDateError(errorMsg);
      setActiveStep(1);
    } 
    // Errores específicos de hora
    else if (errorMsg.includes('hora de reserva') || errorMsg.includes('hora')) {
      setTimeError(errorMsg);
      setActiveStep(1);
    } 
    // Errores específicos de RUT
    else if (errorMsg.includes('RUT') || errorMsg.includes('formato correcto') || errorMsg.includes('12345678-9')) {
      setRutError(errorMsg);
      setActiveStep(2);
    } 
    // Errores específicos de nombre
    else if (errorMsg.includes('nombre') || errorMsg.includes('nulo o vacío')) {
      setNameError(errorMsg);
      setActiveStep(2);
    } 
    // Errores específicos de email
    else if (errorMsg.includes('email') || errorMsg.includes('correo')) {
      setEmailError(errorMsg);
      setActiveStep(2);
    } 
    // Errores generales de validación
    else {
      setGeneralError(errorMsg);
    }
  };

  // Función mejorada con indicador de carga (Nielsen: Visibilidad del estado del sistema)
  const fetchReservedTimes = async (date) => {
    if (!date) return;
    
    setLoadingTimes(true);
    const formattedDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    try {
      const [startResponse, endResponse] = await Promise.all([
        bookingService.getTimesByDate(formattedDate),
        bookingService.getTimesEndByDate(formattedDate)
      ]);
  
      console.log('Horarios de inicio:', startResponse.data);
      console.log('Horarios de fin:', endResponse.data);
  
      // Crear pares de horarios inicio-fin
      const blockedTimes = startResponse.data.map((time, index) => {
        const [startHour, startMinute] = time.split(':');
        const startTime = new Date(date);
        startTime.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);
        
        // Si hay un tiempo de finalización, se usa
        if (endResponse.data[index]) {
          const [endHour, endMinute] = endResponse.data[index].split(':');
          const endTime = new Date(date);
          endTime.setHours(parseInt(endHour, 10), parseInt(endMinute, 10), 0, 0);
          return { start: startTime, end: endTime };
        }
        
        // Se calcula tiempo de finalización basado en blockDuration
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + blockDuration);
        return { start: startTime, end: endTime };
      });
  
      setBookingTimeNoFree(blockedTimes);
      console.log('Horarios bloqueados:', blockedTimes);
  
    } catch (error) {
      console.error('Error al obtener los horarios reservados:', error);
      setGeneralError('Error al cargar horarios disponibles. Por favor, intente nuevamente.');
    } finally {
      setLoadingTimes(false);
    }
  };
  
  // Función para manejar el cambio de hora seleccionada
  const handleTimeChange = (newTime) => {
    setBookingTime(newTime);
    setTimeError(''); // Limpiar error cuando se selecciona una hora
  };

  const handleLapsOrMaxTimeChange = (value) => {
    setLapsOrMaxTime(value);
    if (value !== 10 && value !== 15 && value !== 20) {
      setLapsError('El número de vueltas o tiempo máximo permitido debe ser 10, 15 ó 20');
    } else {
      setLapsError('');
    }
  };

  const handleNumOfPeopleChange = (value) => {
    setNumOfPeople(value);
    if (value < 1 || value > 15) {
      setPeopleError('El número de personas debe ser entre 1 y 15');
    } else {
      setPeopleError('');
      // Resetear lista de participantes si el número cambia
      if (people.length > value) {
        setPeople(people.slice(0, value));
      }
    }
  };
  
  // Función para verificar si la fecha es un feriado
  const isHoliday = (date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mes en formato MM
    const day = date.getDate().toString().padStart(2, '0'); // Día en formato DD
    const formattedDate = `${month}-${day}`; // Formato MM-DD
    return holidays.includes(formattedDate);
  };

  // Función para calcular la hora de término de la reserva
  const calculateEndTime = (startTime, duration) => {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration); // Suma la duración en minutos
    return endTime;
  };

  // Función para deshabilitar horarios
  const shouldDisableTime = (timeValue) => {
    if (!bookingDate) return true;
  
    const date = new Date(bookingDate);
    const hour = timeValue.getHours();
    const minute = timeValue.getMinutes();
  
    const isWeekendOrHoliday = [0, 6].includes(date.getDay()) || isHoliday(date);
    const openingHour = isWeekendOrHoliday ? 10 : 14;
    const closingHour = 22;
  
    // Bloquear horas fuera de horario
    if (hour < openingHour || hour >= closingHour) return true;
  
    // Crear un objeto de tiempo para comparar
    const selectedTime = new Date(date);
    selectedTime.setHours(hour, minute, 0, 0);
    
    // Tiempo de finalización de la posible reserva
    const potentialEndTime = new Date(selectedTime);
    potentialEndTime.setMinutes(potentialEndTime.getMinutes() + blockDuration);
  
    // Comprobar si esta posible reserva se solapa con alguna reserva existente
    for (const blockTime of bookingTimeNoFree) {
      // Si el tiempo seleccionado está entre el inicio y fin de una reserva existente
      if ((selectedTime >= blockTime.start && selectedTime < blockTime.end) ||
          // O si el tiempo de finalización de la posible reserva se solapa con una reserva existente
          (potentialEndTime > blockTime.start && selectedTime < blockTime.start)) {
        return true;
      }
    }
  
    return false;
  };
  
  // Función para manejar el cambio de fecha y obtener los horarios reservados
  const handleDateChange = (newDate) => {
    setBookingDate(newDate);
    setDateError(''); // Limpiar error cuando se selecciona una fecha
    if (newDate) {
      fetchReservedTimes(newDate); // Llama a la función unificada para obtener los horarios reservados
    }
  };

  // Función para validar de los datos del cliente que reserva
  const validatePerson = () => {
    let hasErrors = false;
    
    if (!person.rut) {
      setRutError('RUT es requerido');
      hasErrors = true;
    } else {
      setRutError('');
    }
    
    if (!person.name) {
      setNameError('Nombre es requerido');
      hasErrors = true;
    } else {
      setNameError('');
    }
    
    if (!person.email) {
      setEmailError('Email es requerido');
      hasErrors = true;
    } else {
      setEmailError('');
    }
    
    return hasErrors;
  };

  // Función para añadir una persona a la lista de participantes
  const addPerson = async () => {
    const hasErrors = validatePerson();
    if (hasErrors) {
      return;
    }
    
    setPeople([...people, person]);
    setPerson({ rut: '', name: '', email: '' });
    clearErrors();
  };

  // Función para eliminar una persona de la lista de participantes
  const removePerson = (index) => {
    const updatedPeople = [...people];
    updatedPeople.splice(index, 1);
    setPeople(updatedPeople);
  };

  // Función mejorada con mejor feedback (Nielsen: Visibilidad del estado del sistema)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearErrors();

    if (!bookingDate || !bookingTime || people.length < numOfPeople || !lapsOrMaxTime) {
      setGeneralError('Por favor complete todos los campos requeridos y agregue el número correcto de participantes');
      setIsLoading(false);
      return;
    }

    const duration = blockDuration;
    const endTime = calculateEndTime(bookingTime, duration);

    // Desglosar los datos de los participantes
    const clientsRUT = people.map(p => p.rut).join(',');
    const clientsNames = people.map(p => p.name).join(',');
    const clientsEmails = people.map(p => p.email).join(',');

    const reservationData = {
      bookingDate: bookingDate.toISOString().split('T')[0], // YYYY-MM-DD
      bookingTime: bookingTime.toTimeString().slice(0,5),   // HH:MM
      bookingTimeEnd: endTime.toTimeString().slice(0,5),    // HH:MM
      lapsOrMaxTimeAllowed: lapsOrMaxTime,
      numOfPeople,
      clientsRUT,
      clientsNames,
      clientsEmails
    };

    try {
      const response = await bookingService.saveBooking(reservationData);

      if (response.status === 200) {
        setBookingDate(null);
        setBookingTime(null);
        setPeople([]);
        clearErrors();
        setSuccessMessage('¡Reserva guardada exitosamente! Será redirigido para validar su reserva en 3 segundos...');
        setTimeout(() => {
          navigate("/statusKartBooking");
        }, 3000);
      }
    } catch (error) {
      console.error('Error al guardar la reserva:', error);
      
      // Manejo mejorado de errores del backend
      if (error.response && error.response.data) {
        // Extraer el mensaje de error del backend
        let errorMessage;
        
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = 'Error de validación en el servidor';
        }
        
        handleValidationError(errorMessage);
      } else if (error.message) {
        // Error de conexión o red
        if (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK')) {
          setGeneralError('Error de conexión. Por favor, verifique su conexión a internet e intente nuevamente.');
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError('Error inesperado. Por favor intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };
   
  // Función para renderizar el resumen de la reserva completo
  const renderBookingSummary = () => {
    return (
      <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <InfoIcon color="primary" />
            Resumen de la reserva
          </Typography>
          
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Typography variant="body1" align="left">
              <strong>N° de vueltas o tiempo máximo:</strong> {lapsOrMaxTime}
            </Typography>
            
            <Typography variant="body1" align="left">
              <strong>Cantidad de integrantes:</strong> {numOfPeople}
            </Typography>
            
            <Typography variant="body1" align="left">
              <strong>Fecha:</strong> {bookingDate ? bookingDate.toLocaleDateString('es-CL') : ''}
            </Typography>

            <Typography variant="body1" align="left">
              <strong>Hora:</strong> {bookingTime ? bookingTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : ''}
            </Typography>
              <Box>
              <Typography variant="body1" sx={{ mb: 1 }}  align="left">
                <strong>Datos de los integrantes:</strong>
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>RUT</strong></TableCell>
                      <TableCell><strong>Nombre</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {people.map((person, index) => (
                      <TableRow key={index}>
                        <TableCell>{person.rut}</TableCell>
                        <TableCell>{person.name}</TableCell>
                        <TableCell>{person.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Función para renderizar el contenido de cada paso
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <ActivityDetailsSection
            lapsOrMaxTime={lapsOrMaxTime}
            numOfPeople={numOfPeople}
            onLapsChange={handleLapsOrMaxTimeChange}
            onPeopleChange={handleNumOfPeopleChange}
            lapsError={lapsError}
            peopleError={peopleError}
          />
        );
      case 1:
        return (
          <DateTimeSection
            bookingDate={bookingDate}
            bookingTime={bookingTime}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            shouldDisableTime={shouldDisableTime}
            dateError={dateError}
            timeError={timeError}
            loadingTimes={loadingTimes}
            isHoliday={isHoliday}
          />
        );
      case 2:
        return (
          <ParticipantsSection
            person={person}
            people={people}
            numOfPeople={numOfPeople}
            onPersonChange={setPerson}
            onAddPerson={addPerson}
            onRemovePerson={removePerson}
            rutError={rutError}
            nameError={nameError}
            emailError={emailError}
          />
        );
      case 3:
        return renderBookingSummary();
      default:
        return null;
    }
  };

  // Función para renderizar los botones de navegación
  const renderNavigationButtons = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={prevStep}
          disabled={activeStep === 0}
          sx={{ minWidth: 120 }}
        >
          Anterior
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep < 3 && (
            <Button
              variant="contained"
              onClick={nextStep}
              disabled={!canProceedToNextStep()}
              sx={{ minWidth: 120 }}
            >
              Siguiente
            </Button>
          )}
          
          {activeStep === 3 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isLoading}
              sx={{ minWidth: 160 }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Procesando...
                </Box>
              ) : (
                'Realizar reserva'
              )}
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {/* Header con información clara */}
          <Typography variant="h5" align="center" color="text.secondary" sx={{ mb: 2 }}>
            Reserva tu kart
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Indicador de progreso */}
          <Box sx={{ mb: 4 }}>
            <Stepper 
              activeStep={activeStep} 
              sx={{ 
                '& .MuiStepLabel-root': {
                  cursor: 'default'
                }
              }}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel 
                    icon={activeStep > index ? <CheckCircleIcon color="success" /> : undefined}
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        fontWeight: activeStep === index ? 600 : 400,
                        color: activeStep === index ? 'primary.main' : 'text.secondary'
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {/* Indicador de progreso visual */}
            <Box sx={{ mt: 2, px: 2 }}>
              <Box 
                sx={{ 
                  width: '100%', 
                  height: 4, 
                  backgroundColor: 'grey.200', 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Box 
                  sx={{ 
                    width: `${(activeStep / (steps.length - 1)) * 100}%`, 
                    height: '100%', 
                    backgroundColor: 'primary.main',
                    transition: 'width 0.3s ease-in-out'
                  }}
                />
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  mt: 1, 
                  color: 'text.secondary',
                  fontWeight: 500
                }}
              >
                Paso {activeStep + 1} de {steps.length}
              </Typography>
            </Box>
          </Box>

          {/* Mensajes de estado */}
          {successMessage && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              icon={<CheckCircleIcon />}
            >
              {successMessage}
            </Alert>
          )}

          {generalError && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              icon={<WarningIcon />}
            >
              {generalError}
            </Alert>
          )}

          {/* Información de horarios */}
          {activeStep === 1 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Horarios de atención:</strong><br />
                • Lunes a Viernes: 14:00 - 22:00<br />
                • Fines de semana y feriados: 10:00 - 22:00
              </Typography>
            </Alert>
          )}

          {/* Indicador de carga para horarios */}
          {loadingTimes && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                Cargando horarios disponibles...
              </Box>
            </Alert>
          )}

          {/* Contenido del paso actual */}
          <Box sx={{ minHeight: 400 }}>
            {renderStepContent()}
          </Box>

          {/* Botones de navegación */}
          {renderNavigationButtons()}
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default KartBookingForm;
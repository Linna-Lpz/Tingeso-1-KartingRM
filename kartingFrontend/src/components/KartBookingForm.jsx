import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DigitalClock, DateCalendar } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { 
  Container, Typography, TextField, Button, Paper, Grid, 
  IconButton, List, ListItem, ListItemText, Divider, Box, Snackbar, Alert 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import bookingService from '../services/services.management';
import clientService from '../services/services.management';
import { useNavigate } from 'react-router-dom';

// Constantes
const HOLIDAYS = [
  '01-01', // Año Nuevo
  '05-01', // Día del Trabajador
  '09-18', // Fiestas Patrias
  '09-19', // Fiestas Patrias
  '12-25', // Navidad
];

const initialPersonState = { rut: '', name: '', email: '' };

// Componente principal
const KartBookingForm = () => {
  // Estados: fecha y hora
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingTime, setBookingTime] = useState(null);
  const [bookingTimeNoFree, setBookingTimeNoFree] = useState([]);
  // Estados: detalles de la reserva
  const [lapsOrMaxTime, setLapsOrMaxTime] = useState(10);
  const [numOfPeople, setNumOfPeople] = useState(1);
  const [person, setPerson] = useState(initialPersonState);
  const [people, setPeople] = useState([]);
  // Estados: validación y carga
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Calcular la duración del bloque
  const blockDuration = useMemo(() => {
    switch (lapsOrMaxTime) {
      case 10: return 30;
      case 15: return 35;
      case 20: return 40;
      default: return 30;
    }
  }, [lapsOrMaxTime]);

  // Memoizar la función para validar la entrada de vueltas/tiempo máximo
  const isLapsOrMaxTimeValid = useMemo(() => {
    return lapsOrMaxTime === 10 || lapsOrMaxTime === 15 || lapsOrMaxTime === 20;
  }, [lapsOrMaxTime]);

  // Función para verificar si la fecha es un feriado
  const isHoliday = useCallback((date) => {
    if (!date) return false;
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${month}-${day}`;
    return HOLIDAYS.includes(formattedDate);
  }, []);

  // Función para obtener los horarios reservados
  const fetchReservedTimes = useCallback(async (date) => {
    if (!date) return;
  
    const formattedDate = date.toISOString().split('T')[0];
    try {
      // Desactivar el indicador de carga solo cuando sea necesario
      const [startResponse, endResponse] = await Promise.all([
        bookingService.getBookingTimesByDate(formattedDate),
        bookingService.getBookingTimesEndByDate(formattedDate)
      ]);
  
      // Crear pares de horarios inicio-fin
      const blockedTimes = startResponse.data.map((time, index) => {
        const [startHour, startMinute] = time.split(':');
        const startTime = new Date(date);
        startTime.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);
        
        let endTime;
        if (endResponse.data[index]) {
          const [endHour, endMinute] = endResponse.data[index].split(':');
          endTime = new Date(date);
          endTime.setHours(parseInt(endHour, 10), parseInt(endMinute, 10), 0, 0);
        } else {
          endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + blockDuration);
        }
        
        return { start: startTime, end: endTime };
      });
  
      setBookingTimeNoFree(blockedTimes);
    } catch (error) {
      console.error('Error al obtener los horarios reservados:', error);
    }
  }, [blockDuration]);

  // Usar useEffect para cargar los tiempos reservados cuando cambia la fecha
  useEffect(() => {
    if (bookingDate) {
      fetchReservedTimes(bookingDate);
    }
  }, [bookingDate, fetchReservedTimes]);

  // Función memoizada para deshabilitar horarios
  const shouldDisableTime = useCallback((timeValue) => {
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
  
    // Comprobar solapamiento más eficientemente
    return bookingTimeNoFree.some(blockTime => 
      (selectedTime >= blockTime.start && selectedTime < blockTime.end) ||
      (potentialEndTime > blockTime.start && selectedTime < blockTime.start)
    );
  }, [bookingDate, bookingTimeNoFree, blockDuration, isHoliday]);

  // -----Funciones de manejo de cambios--------------
  // Función para manejar cambios en la fecha y hora
  const handleDateChange = useCallback((newDate) => {
    setBookingDate(newDate);
    setBookingTime(null);
  }, []);

  // Función para manejar cambios en la hora
  const handleTimeChange = useCallback((newTime) => {
    setBookingTime(newTime);
  }, []);

  // Función para manejar cambios en el número de vueltas o tiempo máximo
  const handleLapsOrMaxTimeChange = useCallback((e) => {
    const value = parseInt(e.target.value);
    // Solo actualizar si es un valor válido (10, 15, 20)
    if ([10, 15, 20].includes(value)) {
      setLapsOrMaxTime(value);
    }
  }, []);

  // Función para manejar cambios en el número de personas
  const handleNumOfPeopleChange = useCallback((e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 15) {
      setNumOfPeople(value);
    }
  }, []);

  // Función para manejar cambios en los datos de la persona
  const handlePersonChange = useCallback((field, value) => {
    setPerson(prev => ({ ...prev, [field]: value }));
  }, []);

  // ------Funciones de validación y gestión de personas--------------
  // Función para validar la persona ingresada
  const validatePerson = useCallback(() => {
    const newErrors = {};
    if (!person.rut) newErrors.rut = 'RUT es requerido';
    if (!person.name) newErrors.name = 'Nombre es requerido';
    if (!person.email) newErrors.email = 'Email es requerido';
    return newErrors;
  }, [person]);

  // Función para agregar una persona
  const addPerson = useCallback(async () => {
    const newErrors = validatePerson();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    // Si es la primera persona, verificar registro
    if (people.length === 0) {
      try {
        const response = await clientService.getClientByRut(person.rut);
        
        if (!response.data.clientRUT) {
          setErrors({ rut: 'El cliente no está registrado en el sistema' });
          return;
        }
      } catch (error) {
        console.error('Error al verificar el cliente:', error);
        setErrors({ rut: 'Error al verificar el cliente en el sistema' });
        return;
      }
    }
    
    setPeople(prev => [...prev, person]);
    setPerson(initialPersonState);
    setErrors({});
  }, [people, person, validatePerson]);

  // Función para eliminar una persona
  const removePerson = useCallback((index) => {
    setPeople(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  // Calcular la hora de término de la reserva
  const calculateEndTime = useCallback((startTime, duration) => {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    return endTime;
  }, []);

  // Función para manejar el envío del formulario
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const endTime = calculateEndTime(bookingTime, blockDuration);

    // Desglosar los datos de los participantes
    const clientsRUT = people.map(p => p.rut).join(',');
    const clientsNames = people.map(p => p.name).join(',');
    const clientsEmails = people.map(p => p.email).join(',');

    const reservationData = {
      bookingDate: bookingDate.toISOString().split('T')[0],
      bookingTime: bookingTime.toTimeString().slice(0,5),
      bookingTimeEnd: endTime.toTimeString().slice(0,5),
      lapsOrMaxTimeAllowed: lapsOrMaxTime,
      numOfPeople,
      clientsRUT,
      clientsNames,
      clientsEmails
    };

    try {
      const response = await bookingService.saveBooking(reservationData);
      
      if (response.status == 200) {
        // Resetear el formulario y navegar
      setBookingDate(null);
      setBookingTime(null);
      setPeople([]);
      alert('Reserva realizada con éxito', 'success');
      navigate("/statusKartBooking");
      }
    } catch (error) {
      console.error('Error al guardar la reserva:', error);
    }
  }, [
    bookingDate, bookingTime, people, numOfPeople, isLapsOrMaxTimeValid,
    blockDuration, calculateEndTime, lapsOrMaxTime, navigate
  ]);

  // Validar el formulario
  const isFormValid = useMemo(() => {
    return people.length >= numOfPeople && bookingDate && bookingTime && isLapsOrMaxTimeValid;
  }, [people.length, numOfPeople, bookingDate, bookingTime, isLapsOrMaxTimeValid]);


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Reserva de Karts
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            {/* Sección de detalles */}
            <Typography variant="h6" gutterBottom>Detalles de la Actividad</Typography>
            <Grid container spacing={2} sx={{ mb: 5 }} justifyContent="center">
              <Grid>
                <TextField
                  select
                  label="Vueltas o tiempo máximo"
                  value={lapsOrMaxTime}
                  onChange={handleLapsOrMaxTimeChange}
                  SelectProps={{
                    native: true,
                  }}
                  sx={{ minWidth: 200 }}
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </TextField>
              </Grid>
              <Grid>
                <TextField
                  label="Número de personas"
                  type="number"
                  value={numOfPeople}
                  onChange={handleNumOfPeopleChange}
                  slotProps={{ min: 1, max: 15 }}
                  error={numOfPeople < 1 || numOfPeople > 15}
                  helperText={numOfPeople < 1 || numOfPeople > 15 ? 'Entre 1 y 15 personas' : ''}
                  sx={{ minWidth: 200 }}
                />
              </Grid>
            </Grid>

            {/* Sección de fecha y hora */}
            <Typography variant="h6" gutterBottom>Fecha y hora</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }} justifyContent="center">
              <Grid>
                <DateCalendar
                  value={bookingDate}
                  onChange={handleDateChange}
                  disablePast
                />
              </Grid>
              <Grid> 
                <Paper sx={{ p: 2, minWidth: 280 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Horarios disponibles
                  </Typography>
                  <DigitalClock
                    value={bookingTime}
                    onChange={handleTimeChange}
                    disabled={!bookingDate}
                    shouldDisableTime={shouldDisableTime}
                    skipDisabled
                    ampm={false}
                    timeStep={1}
                  />
                </Paper>
              </Grid>
            </Grid>

            {/* Sección de participantes */}
            <Typography variant="h6" gutterBottom>Datos de los Participantes</Typography>
            <Typography variant="subtitle1" gutterBottom color="textSecondary">
              Ingresa primero a quien realiza la reserva
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid>
                <TextField
                  fullWidth
                  label="RUT"
                  placeholder="Formato 12345678-9"
                  value={person.rut}
                  onChange={(e) => handlePersonChange('rut', e.target.value)}
                  error={!!errors.rut}
                  helperText={errors.rut}
                />
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={person.name}
                  onChange={(e) => handlePersonChange('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={person.email}
                  onChange={(e) => handlePersonChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid sx={{ display: 'flex', alignItems: 'center'}}>
                <IconButton 
                  color="primary" 
                  onClick={addPerson}
                  disabled={people.length >= numOfPeople}
                >
                  <AddIcon />
                </IconButton>
              </Grid>
            </Grid>

            {/* Lista de participantes */}
            <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', mb: 3 }}>
              <List dense>
                {people.length === 0 ? (
                  <ListItem>
                    <ListItemText secondary="No hay personas agregadas" />
                  </ListItem>
                ) : (
                  people.map((p, index) => (
                    <ListItem 
                      key={`person-${index}`}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => removePerson(index)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary={`${p.name} (${p.rut})`} 
                        secondary={p.email} 
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>

            {/* Botón de envío */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={!isFormValid}
              >
                Realizar reserva
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default React.memo(KartBookingForm);
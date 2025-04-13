import React, { useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, StaticTimePicker, DateCalendar } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import { Container, Typography, TextField, Button, Paper, Grid, 
        IconButton, List, ListItem, ListItemText, Divider, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import bookingService from '../services/services.management';

// Inicialización del formulario
const KartBookingForm = () => {
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingTime, setBookingTime] = useState(null);
  const [bookingTimeNoFree, setBookingTimeNoFree] = useState([]);
  const [lapsOrMaxTime, setLapsOrMaxTime] = useState(10);
  const [numOfPeople, setNumOfPeople] = useState(1);
  const [person, setPerson] = useState({ rut: '', name: '', email: '' });
  const [people, setPeople] = useState([]);
  const [errors, setErrors] = useState({});

  // Función para obtener los horarios reservados (inicio y fin) y bloquear los horarios intermedios
  const fetchReservedTimes = async (date) => {
    if (!date) return;

    const formattedDate = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    try {
      const [startResponse] = await Promise.all([
        bookingService.getBookingTimesByDate(formattedDate)
      ]);
      const [endResponse] = await Promise.all([
        bookingService.getBookingTimesEndByDate(formattedDate)
      ]);

      console.log('Horarios de inicio:', startResponse.data);
      console.log('Horarios de fin:', endResponse.data);

      const reservedStartTimes = startResponse.data.map((time) => {
        const [hour, minute] = time.split(':');
        const reservedTime = new Date(date);
        reservedTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0, 0);
        return reservedTime;
      });

      const reservedEndTimes = endResponse.data.map((time) => {
        const [hour, minute] = time.split(':');
        const reservedTime = new Date(date);
        reservedTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0, 0);
        return reservedTime;
      });

      const blockedTimes = [];
      reservedStartTimes.forEach((startTime, index) => {
        const endTime = reservedEndTimes[index];
        let currentTime = new Date(startTime);
        while (currentTime < endTime) {
          blockedTimes.push(new Date(currentTime));
          currentTime.setMinutes(currentTime.getMinutes() + 1);
          console.log('Horarios reservados:', currentTime);
        }
      });

      setBookingTimeNoFree(blockedTimes);

    } catch (error) {
      console.error('Error al obtener los horarios reservados:', error);
    }
  };
  
  // Función para manejar el cambio de hora seleccionada
  const handleTimeChange = (newTime) => {
    setBookingTime(newTime);
  };

    // Definición de días feriados MM-DD
    const holidays = [
      '01-01', // Año Nuevo
      '05-01', // Día del Trabajador
      '09-18', // Fiestas Patrias
      '09-19', // Fiestas Patrias
      '12-25', // Navidad
    ];
  
    // Función para verificar si la fecha es un feriado
    const isHoliday = (date) => {
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mes en formato MM
      const day = date.getDate().toString().padStart(2, '0'); // Día en formato DD
      const formattedDate = `${month}-${day}`; // Formato MM-DD
      return holidays.includes(formattedDate);
    };
  
    let blockDuration;
    if(lapsOrMaxTime === 10) blockDuration = 30;
    else if(lapsOrMaxTime === 15) blockDuration = 35;
    else if(lapsOrMaxTime === 20) blockDuration = 40;
  
    // Función para calcular la hora de término de la reserva
    const calculateEndTime = (startTime, duration) => {
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration); // Suma la duración en minutos
      return endTime;
    };

  // Función para deshabilitar horarios reservados
  const shouldDisableTime = (timeValue, view) => {
    if (!bookingDate) return true;
  
    const date = new Date(bookingDate);
    const hour = timeValue.getHours();
    const minute = timeValue.getMinutes();
  
    const isWeekendOrHoliday = [0, 6].includes(date.getDay()) || isHoliday(date);
    const openingHour = isWeekendOrHoliday ? 10 : 14;
    const closingHour = 22;
  
    // Bloquear horas fuera de horario
    if (view === 'hours') {
      return hour < openingHour || hour >= closingHour;
    }
  
    // Bloquear minutos fuera de horario
    if (view === 'minutes') {
      if (hour < openingHour || hour >= closingHour) return true;
  
      // Compara con los tiempos reservados
      for (const reserved of bookingTimeNoFree) {
        if (
          reserved.getHours() === hour &&
          reserved.getMinutes() === minute
        ) {
          return true;
        }
      }
    }
  
    return false;
  };
  
  // Función para manejar el cambio de fecha y obtener los horarios reservados
  const handleDateChange = (newDate) => {
    setBookingDate(newDate);
    if (newDate) {
      fetchReservedTimes(newDate); // Llama a la función unificada para obtener los horarios reservados
    }
  };

  // Función para validar de los datos del cliente que reserva
  const validatePerson = () => {
    const newErrors = {};
    if (!person.rut) newErrors.rut = 'RUT es requerido';
    if (!person.name) newErrors.name = 'Nombre es requerido';
    if (!person.email) newErrors.email = 'Email es requerido';
    return newErrors;
  };

  // Función para añadir una persona a la lista de participantes
  const addPerson = () => {
    const newErrors = validatePerson();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setPeople([...people, person]);
    setPerson({ rut: '', name: '', email: '' });
    setErrors({});
  };

  // Función para eliminar una persona de la lista de participantes
  const removePerson = (index) => {
    const updatedPeople = [...people];
    updatedPeople.splice(index, 1);
    setPeople(updatedPeople);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bookingDate || !bookingTime || people.length < numOfPeople || !lapsOrMaxTime) {
      alert('Por favor, completa todos los campos requeridos antes de realizar la reserva.');
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
      console.log('Reserva guardada con éxito:', response.data);
      alert('Reserva realizada con éxito.');

      setBookingDate(null);
      setBookingTime(null);
      setPeople([]);
    } catch (error) {
      console.error('Error al guardar la reserva:', error);
      alert('Ocurrió un error al guardar la reserva. Por favor, inténtalo de nuevo.');
    }
  };

    
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Reserva de Karts
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            {/* Sección de detalles */}
            <Typography variant="h6" gutterBottom>Detalles de la Actividad</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }} justifyContent={'center'}>
              <Grid>
                <TextField
                  fullWidth
                  label="Vueltas o tiempo máximo"
                  type="number"
                  value={lapsOrMaxTime}
                  onChange={(e) => setLapsOrMaxTime(parseInt(e.target.value) || 10)}
                  slotProps={{ min: 10, max: 20, step: 5 }}
                  sx={{ minWidth: 200 }}
                />
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  label="Número de personas"
                  type="number"
                  value={numOfPeople}
                  onChange={(e) => setNumOfPeople(parseInt(e.target.value) || 1)}
                  slotProps={{ min: 1, max: 15 }}
                  sx={{ minWidth: 200 }}
                />
              </Grid>
            </Grid>

            {/* Sección de fecha y hora */}
            <Typography variant="h6" gutterBottom>Información de la Reserva</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }} justifyContent={'center'}>
              <Grid>
                <DateCalendar
                  label="Fecha de Reserva"
                  value={bookingDate}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </Grid>
              <Grid>
                <StaticTimePicker
                  label="Hora de Reserva"
                  value={bookingTime}
                  disabled={!bookingDate}
                  onChange={handleTimeChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  views={['hours', 'minutes']}
                  shouldDisableTime={shouldDisableTime}
                />
              </Grid>
            </Grid>

            {/* Sección de participantes */}
            <Typography variant="h6" gutterBottom>Datos de los Participantes</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="RUT"
                  placeholder="Formato 1111111111-1"
                  value={person.rut}
                  onChange={(e) => setPerson({ ...person, rut: e.target.value })}
                  error={!!errors.rut}
                  helperText={errors.rut}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={person.name}
                  onChange={(e) => setPerson({ ...person, name: e.target.value })}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={person.email}
                  onChange={(e) => setPerson({ ...person, email: e.target.value })}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
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
                      key={index}
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
                disabled={people.length < numOfPeople || !bookingDate || !bookingTime || !lapsOrMaxTime}
              >
                Realizar Reserva
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default KartBookingForm;
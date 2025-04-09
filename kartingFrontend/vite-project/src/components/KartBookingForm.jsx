import React, { useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, StaticTimePicker, DateCalendar } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import bookingService from '../services/services.management';

// Inicialización del formulario
const KartBookingForm = () => {
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingTime, setBookingTime] = useState(null);
  const [bookingTimeFree, setBookingTimeFree] = useState([]);
  const [lapsOrMaxTime, setLapsOrMaxTime] = useState(10);
  const [numOfPeople, setNumOfPeople] = useState(1);
  const [person, setPerson] = useState({ rut: '', name: '', email: '' });
  const [people, setPeople] = useState([]);
  const [errors, setErrors] = useState({});

  // Función para obtener las horas reservadas
  const reservedTimes = async () => {
    setBookingTimeFree([]); // Limpia las horas reservadas previas
    if (!bookingDate) return;

    const date = bookingDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    try {
      const response = await bookingService.getBookingTimesByDate(date); // Llamada a la API
      console.log(response.data); // Verifica los datos recibidos
      const times = response.data.map((time) => {
        const [hour, minute] = time.split(':'); // Divide la hora en horas y minutos
        const reservedTime = new Date(bookingDate); // Usa la fecha seleccionada
        reservedTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0); // Establece la hora
        return reservedTime;
      });
      setBookingTimeFree(times); // Guarda las horas reservadas en el estado
    } catch (error) {
      console.error('Error al obtener las horas reservadas:', error);
    }
  };

  // Función para manejar el cambio de fecha y llama a la función para obtener las horas reservadas
  const handleDateChange = (newDate) => {
    setBookingDate(newDate);
    if (newDate) {
      reservedTimes(); // Llama a la función para obtener las horas reservadas
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

  // Función para calcular la hora mínima
  const getMinTime = () => {
    if (!bookingDate) return new Date(); // Si no hay fecha seleccionada, devuelve la hora actual

    const dayOfWeek = bookingDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday(bookingDate)) {
      // Sábado, domingo o feriado
      return new Date(bookingDate.setHours(10, 0)); // 10:00
    } else {
      // Días de semana
      return new Date(bookingDate.setHours(14, 0)); // 14:00
    }
  };

  let blockDuration;
  if(lapsOrMaxTime === 10) blockDuration = 30;
  else if(lapsOrMaxTime === 15) blockDuration = 35;
  else if(lapsOrMaxTime === 20) blockDuration = 40;

  // Función para calcular el tiempo basado en vueltas o tiempo máximo
  const calculateTime = () => {
    
  };

  // Función para calcular la hora de término de la reserva
  const calculateEndTime = (startTime, duration) => {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration); // Suma la duración en minutos
    return endTime;
  };

  // Función para manejar el cambio de hora seleccionada
  const handleTimeChange = (newTime) => {
    setBookingTime(newTime); // Establece la hora de inicio seleccionada

    // Calcula la hora de término basada en lapsOrMaxTime
    const duration = blockDuration; // Duración en minutos basada en lapsOrMaxTime
    const endTime = calculateEndTime(newTime, duration);

    console.log(`Hora de inicio: ${newTime}`);
    console.log(`Hora de término: ${endTime}`);
  };

    // Función para manejar el envío del formulario
    const handleSubmit = (e) => {
      e.preventDefault();
      alert(`Reserva para el día ${bookingDate.AdapterDateFns()} y la hora ${bookingTime.toISOString()} realizada con éxito!`);
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <DateCalendar
                  label="Fecha de Reserva"
                  value={bookingDate}
                  onChange={handleDateChange} // Usa el manejador para actualizar la fecha y llamar a reservedTimes
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </Grid>
              // BookingTime
              <Grid item xs={12} sm={6}>
              <StaticTimePicker
                label="Hora de Reserva"
                value={bookingTime}
                onChange={(newValue) => handleTimeChange(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                views={['hours', 'minutes']}
                minTime={getMinTime()} // Hora mínima dinámica
                maxTime={new Date(bookingDate?.setHours(22, 0, 0, 0))} // Hora máxima fija: 22:00
                shouldDisableTime={(timeValue, clockType) => {
                  if (clockType === 'hours') {
                    return bookingTimeFree.some((reservedTime) => {
                      const reservedHour = reservedTime.getHours();
                      return timeValue === reservedHour;
                    });
                  }
                }}
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
                  placeholder="12345678-9"
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
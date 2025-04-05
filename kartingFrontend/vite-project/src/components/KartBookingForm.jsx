import React, { useState } from 'react';
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
import {
  CalendarToday,
  AccessTime,
  Person,
  Add,
  Remove,
  DirectionsCar,
  Email,
  Badge,
  Delete
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const KartBookingForm = () => {
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingTime, setBookingTime] = useState(null);
  const [lapsOrMaxTimeAllowed, setLapsOrMaxTimeAllowed] = useState(1);
  const [numOfPeople, setNumOfPeople] = useState(1);
  
  // Estado para manejar la lista de personas
  const [person, setPerson] = useState({ rut: '', name: '', email: '' });
  const [people, setPeople] = useState([]);
  
  // Estados para errores de validación
  const [errors, setErrors] = useState({});

  // Función para validar el RUT
  const validateRUT = (rut) => {
    if (!rut) return false;
    
    // Eliminar puntos y guión
    rut = rut.replace(/\./g, '').replace('-', '');
    
    // Obtener dígito verificador
    const dv = rut.slice(-1);
    const rutBody = rut.slice(0, -1);
    
    // Verificar que solo contenga números
    if (!/^\d+$/.test(rutBody)) return false;
    
    // Algoritmo de validación de RUT
    let sum = 0;
    let multiplier = 2;
    
    for (let i = rutBody.length - 1; i >= 0; i--) {
      sum += parseInt(rutBody.charAt(i)) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const expectedDV = 11 - (sum % 11);
    const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
    
    return calculatedDV === dv.toUpperCase();
  };

  // Función para añadir una persona a la lista
  const addPerson = () => {
    // Validar campos
    const newErrors = {};
    
    if (!person.rut) {
      newErrors.rut = 'RUT es requerido';
    } else if (!validateRUT(person.rut)) {
      newErrors.rut = 'RUT inválido';
    }
    
    if (!person.name) newErrors.name = 'Nombre es requerido';
    if (!person.email) {
      newErrors.email = 'Email es requerido';
    } else if (!/^\S+@\S+\.\S+$/.test(person.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Si pasa validación, añadir a la lista
    if (people.length < numOfPeople) {
      setPeople([...people, person]);
      setPerson({ rut: '', name: '', email: '' });
      setErrors({});
    }
  };

  // Función para eliminar una persona de la lista
  const removePerson = (index) => {
    const updatedPeople = [...people];
    updatedPeople.splice(index, 1);
    setPeople(updatedPeople);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que todos los datos requeridos estén completos
    const formErrors = {};
    
    if (!bookingDate) formErrors.bookingDate = 'Fecha es requerida';
    if (!bookingTime) formErrors.bookingTime = 'Hora es requerida';
    if (lapsOrMaxTimeAllowed < 1) formErrors.lapsOrMaxTimeAllowed = 'Debe ser mayor a 0';
    if (numOfPeople < 1) formErrors.numOfPeople = 'Debe ser mayor a 0';
    if (people.length !== numOfPeople) formErrors.people = `Debe agregar ${numOfPeople} personas`;
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Formatear datos para envío
    const formattedDate = bookingDate ? format(bookingDate, 'dd-MM-yyyy') : '';
    const formattedTime = bookingTime ? format(bookingTime, 'HH:mm') : '';
    
    const bookingData = {
      bookingDate: formattedDate,
      bookingTime: formattedTime,
      lapsOrMaxTimeAllowed,
      numOfPeople,
      clientsRUT: people.map(p => p.rut).join(','),
      clientsNames: people.map(p => p.name).join(','),
      clientsEmails: people.map(p => p.email).join(',')
    };
    
    console.log('Datos del formulario:', bookingData);
    // Aquí podrías enviar los datos a tu API
    alert('Reserva realizada con éxito!');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Reserva de Karts
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Fecha y hora de reserva */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Fecha de Reserva"
                  value={bookingDate}
                  onChange={(newDate) => setBookingDate(newDate)}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.bookingDate,
                      helperText: errors.bookingDate,
                      InputProps: {
                        startAdornment: <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TimePicker
                  label="Hora de Reserva"
                  value={bookingTime}
                  onChange={(newTime) => setBookingTime(newTime)}
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.bookingTime,
                      helperText: errors.bookingTime,
                      InputProps: {
                        startAdornment: <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      }
                    }
                  }}
                />
              </Grid>
              
              {/* Número de vueltas o tiempo máximo */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vueltas o tiempo máximo"
                  type="number"
                  value={lapsOrMaxTimeAllowed}
                  onChange={(e) => setLapsOrMaxTimeAllowed(parseInt(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <DirectionsCar fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                    inputProps: { min:10, max: 20, step:5}
                  }}
                  error={!!errors.lapsOrMaxTimeAllowed}
                  helperText={errors.lapsOrMaxTimeAllowed}
                />
              </Grid>
              
              {/* Número de personas */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número de personas"
                  type="number"
                  value={numOfPeople}
                  onChange={(e) => setNumOfPeople(parseInt(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                    inputProps: { min: 1, max:15 }
                  }}
                  error={!!errors.numOfPeople}
                  helperText={errors.numOfPeople}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Datos de las personas ({people.length} de {numOfPeople})
                </Typography>
                {errors.people && (
                  <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                    {errors.people}
                  </Typography>
                )}
              </Grid>
              
              {/* Formulario para agregar personas */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="RUT"
                  placeholder="12345678-9"
                  value={person.rut}
                  onChange={(e) => setPerson({ ...person, rut: e.target.value })}
                  error={!!errors.rut}
                  helperText={errors.rut}
                  InputProps={{
                    startAdornment: <Badge fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={person.name}
                  onChange={(e) => setPerson({ ...person, name: e.target.value })}
                  error={!!errors.name}
                  helperText={errors.name}
                  InputProps={{
                    startAdornment: <Person fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={person.email}
                    onChange={(e) => setPerson({ ...person, email: e.target.value })}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                  <IconButton 
                    color="primary"
                    onClick={addPerson}
                    disabled={people.length >= numOfPeople}
                    sx={{ ml: 1, mt: 1 }}
                  >
                    <Add />
                  </IconButton>
                </Box>
              </Grid>
              
              {/* Lista de personas agregadas */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 0 }}>
                  <List dense>
                    {people.map((p, index) => (
                      <React.Fragment key={index}>
                        <ListItem
                          secondaryAction={
                            <IconButton edge="end" onClick={() => removePerson(index)}>
                              <Delete />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={`${p.name} (${p.rut})`}
                            secondary={p.email}
                          />
                        </ListItem>
                        {index < people.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                    {people.length === 0 && (
                      <ListItem>
                        <ListItemText secondary="No hay personas agregadas" />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>
              
              {/* Botón de envío */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                >
                  Realizar Reserva
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default KartBookingForm;
import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Box,
  Alert,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { 
  format, 
  startOfWeek, 
  addDays, 
  addWeeks, 
  subWeeks, 
  startOfMonth,
  getMonth,
  getYear,
  setMonth,
  setYear
} from 'date-fns';
import { es } from 'date-fns/locale';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import bookingService from '../services/services.management';

const RackWeekly = () => {
  // Estados para las fechas y selecciones
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(currentDate, { weekStartsOn: 1 }));
  const [selectedMonth, setSelectedMonth] = useState(getMonth(currentDate));
  const [selectedYear, setSelectedYear] = useState(getYear(currentDate));
  
  // Estados para los datos
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  // Constantes para la interfaz
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const timeBlocks = Array.from({ length: 13 }, (_, i) => `${i + 10}:00`);
  const months = Array.from({ length: 12 }, (_, i) => i);
  const years = Array.from({ length: 5 }, (_, i) => getYear(currentDate) - 2 + i);

  // Cargar reservas cuando cambia la semana
  useEffect(() => {
    fetchBookings();
  }, [weekStart]);

  // Actualizar la semana cuando cambia el mes o año
  useEffect(() => {
    const newDate = setYear(setMonth(currentDate, selectedMonth), selectedYear);
    setCurrentDate(newDate);
    
    // Ir a la primera semana del mes seleccionado
    const firstWeekOfMonth = startOfWeek(startOfMonth(newDate), { weekStartsOn: 1 });
    setWeekStart(firstWeekOfMonth);
  }, [selectedMonth, selectedYear]);

  // Obtener reservas del servicio
  const fetchBookings = async () => {
    try {
      const response = await bookingService.getBooking();
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener las reservas:", err);
      setError("No se pudieron cargar las reservas. Por favor, intente de nuevo más tarde.");
    }
  };

  // Función para ir a la semana anterior
  const goToPreviousWeek = () => {
    const newWeekStart = subWeeks(weekStart, 1);
    setWeekStart(newWeekStart);
    
    // Actualizar mes y año si cambian
    setSelectedMonth(getMonth(newWeekStart));
    setSelectedYear(getYear(newWeekStart));
  };

  // Función para ir a la semana siguiente
  const goToNextWeek = () => {
    const newWeekStart = addWeeks(weekStart, 1);
    setWeekStart(newWeekStart);
    
    // Actualizar mes y año si cambian
    setSelectedMonth(getMonth(newWeekStart));
    setSelectedYear(getYear(newWeekStart));
  };

  // Filtrar reservas por día y hora
  const getBookingsForTimeSlot = (day, timeBlock) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const hour = parseInt(timeBlock.split(':')[0]);
    
    return bookings.filter(booking => {
      if (booking.bookingDate !== dateStr) return false;
      
      const bookingTimeStr = booking.bookingTime;
      if (!bookingTimeStr) return false;
      
      const bookingHour = parseInt(bookingTimeStr.split(':')[0]);
      return bookingHour === hour;
    });
  };

  // Extraer el nombre del cliente
  const getClientName = (booking) => {
    if (booking.clientsNames && booking.clientsNames.length > 0) {
      return booking.clientsNames.split(',')[0];
    }
    return 'Sin nombre';
  };

  // Manejo de cambios en mes y año
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Mostrar si hay error
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden'}}>
      {/* Cabecera con controles de navegación */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <Typography variant="h6">Rack semanal de ocupación de la pista</Typography>
          </Grid>
          
          {/* Selector de mes y año */}
          <Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  displayEmpty
                >
                  {months.map((month) => (
                    <MenuItem key={month} value={month}>
                      {format(new Date(2000, month, 1), 'MMMM', { locale: es })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={selectedYear}
                  onChange={handleYearChange}
                  displayEmpty
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Información de la semana actual con controles de navegación */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
        <IconButton onClick={goToPreviousWeek}>
          <ArrowBackIosNewIcon />
        </IconButton>
        
        <Typography variant="h6" color="text.primary">
          Semana del {format(weekDays[0], 'dd/MM')} al {format(weekDays[6], 'dd/MM')}
        </Typography>
        
        <IconButton onClick={goToNextWeek}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
      
      {/* Tabla con las reservas */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="rack de reservas">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '80px', backgroundColor: '#f5f5f5' }}>
                <Typography variant="subtitle2" fontWeight="bold">Hora</Typography>
              </TableCell>
              
              {weekDays.map((day) => (
                <TableCell key={day.toString()} align="center" sx={{ width: '100px', backgroundColor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {format(day, 'EEEE', { locale: es })}
                  </Typography>
                  <Typography variant="body2">
                    {format(day, 'dd/MM')}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {timeBlocks.map((timeBlock) => (
              <TableRow key={timeBlock}>
                <TableCell 
                  sx={{ 
                    backgroundColor: '#f5f5f5', 
                    fontWeight: 'bold',
                    position: 'sticky',
                    left: 0,
                    borderRight: '1px solid rgba(224, 224, 224, 1)',
                    zIndex: 1
                  }}
                >
                  {timeBlock}
                </TableCell>
                
                {weekDays.map((day) => {
                  const slotBookings = getBookingsForTimeSlot(day, timeBlock);
                  return (
                    <TableCell 
                      key={`${day.toString()}-${timeBlock}`} 
                      align="left" 
                      sx={{ 
                        verticalAlign: 'top',
                        height: '80px',
                        padding: 1,
                        border: '1px solid rgba(224, 224, 224, 1)'
                      }}
                    >
                      {slotBookings.length === 0 ? (
                        <Box sx={{ height: '100%', minHeight: '60px' }} />
                      ) : (
                        slotBookings.map((booking) => (
                          <Box 
                            key={booking.id} 
                            sx={{ 
                              p: 1, 
                              borderRadius: 1, 
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                              mb: 0.5,
                              boxShadow: 1,
                              fontSize: '0.8rem'
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.8rem' }}>
                              {getClientName(booking)}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {booking.bookingTime} - {booking.bookingTimeEnd}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RackWeekly;
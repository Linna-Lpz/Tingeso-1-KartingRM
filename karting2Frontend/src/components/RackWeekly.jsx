import React, { useState, useEffect } from 'react';
import { 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Typography, Box, Alert, IconButton, FormControl,
  Select, MenuItem, Grid
} from '@mui/material';
import { 
  format, startOfWeek, addDays, addWeeks, subWeeks, 
  startOfMonth, getMonth, getYear, setMonth, setYear
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

  // Obtener reservas del servicio
  const fetchBookings = async () => {
    try {
      // Llama a la función pasando mes y año seleccionados
      const response = await bookingService.getBookingsForRack(selectedMonth + 1, selectedYear);
      console.log("Response from bookingService:", response);
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener las reservas:", err);
      setError("No se pudieron cargar las reservas. Por favor, intente de nuevo más tarde.");
    }
  };

  // Cargar reservas cuando cambia la semana, mes o año
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, [weekStart, selectedMonth, selectedYear]);

  // Actualizar la semana cuando cambia el mes o año
  useEffect(() => {
    const newDate = setYear(setMonth(currentDate, selectedMonth), selectedYear);
    setCurrentDate(newDate);
    
    // Ir a la primera semana del mes seleccionado
    const firstWeekOfMonth = startOfWeek(startOfMonth(newDate), { weekStartsOn: 1 });
    setWeekStart(firstWeekOfMonth);
  }, [selectedMonth, selectedYear]);

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
    if (booking.clientName && booking.clientName.length > 0) {
      return booking.clientName;
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
    return (
      <Paper elevation={3} sx={{ p: 3, m: 2, borderRadius: 2 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            ⚠️ Error de Conexión
          </Typography>
          <Typography variant="body1">
            {error}
          </Typography>
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={3}
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200'
      }}
    >
      {/* Cabecera con controles de navegación */}
      <Box 
        sx={{ 
          p: 3, 
          backgroundColor: 'primary.main',
          color: 'white',
          borderBottom: '2px solid',
          borderBottomColor: 'primary.dark'
        }}
      >
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h5" 
              fontWeight="bold"
              sx={{ 
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                letterSpacing: 0.5
              }}
            >
              🏁 Rack Semanal de Ocupación
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9,
                mt: 0.5,
                fontStyle: 'italic'
              }}
            >
              Gestiona y visualiza las reservas de la pista
            </Typography>
          </Grid>
          
          {/* Selector de mes y año */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, gap: 2 }}>
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 140,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover': {
                      backgroundColor: 'grey.50'
                    }
                  }
                }}
              >
                <Select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  displayEmpty
                  sx={{
                    borderRadius: 2,
                    fontWeight: 'medium'
                  }}
                >
                  {months.map((month) => (
                    <MenuItem key={month} value={month}>
                      {format(new Date(2000, month, 1), 'MMMM', { locale: es })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 100,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    '&:hover': {
                      backgroundColor: 'grey.50'
                    }
                  }
                }}
              >
                <Select
                  value={selectedYear}
                  onChange={handleYearChange}
                  displayEmpty
                  sx={{
                    borderRadius: 2,
                    fontWeight: 'medium'
                  }}
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
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          px: 3, 
          py: 2,
          backgroundColor: 'grey.50',
          borderBottom: '1px solid',
          borderBottomColor: 'grey.200'
        }}
      >
        <IconButton 
          onClick={goToPreviousWeek}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease-in-out',
            boxShadow: 2
          }}
          size="large"
        >
          <ArrowBackIosNewIcon />
        </IconButton>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h6" 
            color="text.primary"
            fontWeight="bold"
            sx={{ 
              mb: 0.5,
              color: 'primary.main'
            }}
          >
            📅 Semana del {format(weekDays[0], 'dd MMMM', { locale: es })} al {format(weekDays[6], 'dd MMMM', { locale: es })}
          </Typography>
        </Box>
        
        <IconButton 
          onClick={goToNextWeek}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease-in-out',
            boxShadow: 2
          }}
          size="large"
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
      
      {/* Tabla con las reservas */}
      <TableContainer sx={{ maxHeight: 650, backgroundColor: 'white' }}>
        <Table stickyHeader aria-label="rack de reservas">
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  width: '100px', 
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderRight: '2px solid',
                  borderRightColor: 'primary.dark'
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" sx={{ textAlign: 'center' }}>
                  ⏰ Hora
                </Typography>
              </TableCell>
              
              {weekDays.map((day, index) => (
                <TableCell 
                  key={day.toString()} 
                  align="center" 
                  sx={{ 
                    width: '130px', 
                    backgroundColor: index % 2 === 0 ? 'primary.main' : 'primary.dark',
                    color: 'white',
                    borderRight: index < weekDays.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                    {format(day, 'EEEE', { locale: es })}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
                    {format(day, 'dd/MM')}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {timeBlocks.map((timeBlock, rowIndex) => (
              <TableRow 
                key={timeBlock}
              >
                <TableCell 
                  sx={{ 
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    position: 'sticky',
                    left: 0,
                    borderRight: '2px solid',
                    borderRightColor: 'primary.dark',
                    zIndex: 1,
                    textAlign: 'center'
                  }}
                >
                  {timeBlock}
                </TableCell>
                
                {weekDays.map((day, colIndex) => {
                  const slotBookings = getBookingsForTimeSlot(day, timeBlock);
                  return (
                    <TableCell 
                      key={`${day.toString()}-${timeBlock}`} 
                      align="left" 
                      sx={{ 
                        verticalAlign: 'top',
                        height: '90px',
                        padding: 1.5,
                        border: '1px solid',
                        borderColor: 'grey.300',
                      }}
                    >
                      {slotBookings.length === 0 ? (
                        <Box 
                          sx={{ 
                            height: '100%', 
                            minHeight: '70px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'grey.400',
                            fontStyle: 'italic'
                          }}
                        >
                          <Typography variant="body2" sx={{ opacity: 0.6 }}>
                            Disponible
                          </Typography>
                        </Box>
                      ) : (
                        slotBookings.map((booking, bookingIndex) => (
                          <Box 
                            key={booking.id} 
                            sx={{ 
                              p: 1.5, 
                              borderRadius: 2, 
                              background: 'rgb(0, 170, 108)',
                              color: 'white',
                              mb: bookingIndex < slotBookings.length - 1 ? 1 : 0,
                              fontSize: '0.85rem',
                              border: '2px solid',
                              position: 'relative',
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              fontWeight="bold" 
                              sx={{ 
                                fontSize: '0.85rem',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                                mb: 0.5
                              }}
                            >
                              👤 {getClientName(booking)}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.8rem',
                                opacity: 0.95,
                                fontWeight: 'medium'
                              }}
                            >
                              🕒 {booking.bookingTime} - {booking.bookingTimeEnd}
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
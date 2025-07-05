import { Typography, Grid, Paper, Alert, Box, Button } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers';
import { useState } from 'react';

const DateTimeSection = ({ 
  bookingDate, 
  bookingTime, 
  onDateChange, 
  onTimeChange, 
  shouldDisableTime, 
  dateError, 
  timeError,
  isHoliday
}) => {
  const [expandedHour, setExpandedHour] = useState(null);

  // Función para generar las horas disponibles en un bloque (minuto a minuto)
  const getAvailableTimesInHour = (hour) => {
    const times = [];
    for (let minute = 0; minute < 60; minute += 1) {
      const time = new Date(bookingDate);
      time.setHours(hour, minute, 0, 0);
      if (!shouldDisableTime(time)) {
        times.push(time);
      }
    }
    return times;
  };

  // Función para obtener las horas de inicio según el tipo de día
  const getStartHour = () => {
    if (!bookingDate) return 10;
    
    const dayOfWeek = bookingDate.getDay();
    const isWeekendOrHoliday = dayOfWeek === 0 || dayOfWeek === 6 || isHoliday(bookingDate);
    
    return isWeekendOrHoliday ? 10 : 14;
  };

  // Generar bloques horarios
  const generateHourBlocks = () => {
    const startHour = getStartHour();
    const blocks = [];
    
    for (let hour = startHour; hour <= 21; hour++) {
      const availableTimes = getAvailableTimesInHour(hour);
      const hasAvailableTimes = availableTimes.length > 0;
      
      blocks.push({
        hour,
        hasAvailableTimes,
        availableTimes
      });
    }
    
    return blocks;
  };

  const handleHourBlockClick = (hour) => {
    if (expandedHour === hour) {
      setExpandedHour(null);
    } else {
      setExpandedHour(hour);
    }
  };

  const handleTimeSelection = (time) => {
    onTimeChange(time);
    setExpandedHour(null);
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const hourBlocks = generateHourBlocks();
  return (
    <>
      <Typography variant="h6" gutterBottom>Fecha y hora</Typography>
      
      {dateError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {dateError}
        </Alert>
      )}
      
      {timeError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {timeError}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }} justifyContent={'center'}>
        <Grid item>
          <DateCalendar
            value={bookingDate}
            onChange={onDateChange}
            disablePast
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                error: !!dateError
              }
            }}
          />
        </Grid>
        <Grid item>
          <Paper sx={{ p: 2, minWidth: 280, height: 'fit-content' }}>
            <Typography variant="subtitle1" gutterBottom>
              Horarios disponibles
            </Typography>
            
            {!bookingDate ? (
              <Typography variant="body2" color="text.secondary">
                Selecciona una fecha para ver los horarios disponibles
              </Typography>
            ) : (
              <Box sx={{ width: '100%', maxWidth: 300 }}>
                {/* Mostrar los bloques de horas disponibles */}
                <Grid container spacing={1}>
                  {hourBlocks.map((block) => (
                    <Grid item xs={4} key={block.hour}>
                      <Button
                        fullWidth
                        variant={expandedHour === block.hour ? "contained" : "outlined"}
                        disabled={!block.hasAvailableTimes}
                        onClick={() => handleHourBlockClick(block.hour)}
                        sx={{
                          minHeight: 40,
                          backgroundColor: !block.hasAvailableTimes ? '#f5f5f5' : 
                                         expandedHour === block.hour ? 'primary.main' : 'transparent',
                          color: !block.hasAvailableTimes ? '#9e9e9e' : 
                                expandedHour === block.hour ? 'white' : 'primary.main',
                          '&:hover': {
                            backgroundColor: !block.hasAvailableTimes ? '#f5f5f5' : 
                                           expandedHour === block.hour ? 'primary.dark' : 'primary.light',
                          },
                          '&.Mui-disabled': {
                            backgroundColor: '#f5f5f5',
                            color: '#9e9e9e',
                          }
                        }}
                      >
                        {`${block.hour.toString().padStart(2, '0')}:00`}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
                {/* Mostrar los horarios disponibles al expandir una hora */}
                {expandedHour !== null && (
                  <Box sx={{ mt: 2, p: 1, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Horarios disponibles para las {expandedHour.toString().padStart(2, '0')}:00
                    </Typography>
                    <Grid container spacing={1} sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {hourBlocks.find(b => b.hour === expandedHour)?.availableTimes.map((time, index) => (
                        <Grid item xs={4} key={index}>
                          <Button
                            fullWidth
                            variant={bookingTime && formatTime(bookingTime) === formatTime(time) ? "contained" : "outlined"}
                            size="small"
                            onClick={() => handleTimeSelection(time)}
                            sx={{
                              minHeight: 32,
                              fontSize: '0.75rem',
                              padding: '4px 8px'
                            }}
                          >
                            {formatTime(time)}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default DateTimeSection;
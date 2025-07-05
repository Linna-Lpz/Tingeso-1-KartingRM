import { 
  Typography, 
  Grid, 
  TextField, 
  Alert, 
  Box, 
  FormControl, 
  FormControlLabel, 
  Radio, 
  RadioGroup, 
  Paper,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ActivityDetailsSection = ({ 
  lapsOrMaxTime, 
  numOfPeople, 
  onLapsChange, 
  onPeopleChange, 
  lapsError, 
  peopleError 
}) => {
  const navigate = useNavigate();

  // Función para redirigir al registro de cliente
  const handleRegisterClick = () => {
    navigate('/clientRegister');
  };

  // Definir opciones con precios
  const lapsOptions = [
    { value: 10, label: '10 vueltas o minutos', price: '$15.000' },
    { value: 15, label: '15 vueltas o minutos', price: '$20.000' },
    { value: 20, label: '20 vueltas o minutos', price: '$25.000' }
  ];

  return (
    <Box>
      {lapsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {lapsError}
        </Alert>
      )}
      
      {peopleError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {peopleError}
        </Alert>
      )}

        {/* Selector de cantidad de integrantes */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Cantidad de integrantes
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={numOfPeople}
              onChange={(e) => onPeopleChange(parseInt(e.target.value) || 1)}
              slotProps={{ min: 1, max: 15 }}
              error={!!peopleError}
              sx={{ 
                maxWidth: 100,
                '& .MuiOutlinedInput-root': {
                  height: 56
                }
              }}
              placeholder="Seleccione cantidad"
            />
          </Box>
        </Grid>

        {/* Selector de vueltas con precios */}
        <Grid item xs={12}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            Vueltas o minutos a reservar
          </Typography>
          <FormControl component="fieldset" error={!!lapsError} sx={{ width: '100%' }}>
            <RadioGroup
              value={lapsOrMaxTime}
              onChange={(e) => onLapsChange(parseInt(e.target.value))}
              sx={{ gap: 2 }}
            >
              {lapsOptions.map((option) => (
                <Paper
                  key={option.value}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'grey.400',
                      boxShadow: 1
                    }
                  }}
                  onClick={() => onLapsChange(option.value)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <FormControlLabel
                      value={option.value}
                      control={<Radio />}
                      label={
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {option.label}
                        </Typography>
                      }
                      sx={{ margin: 0, flexGrow: 1 }}
                    />
                    <Chip
                      label={option.price}
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        minWidth: 80
                      }}
                    />
                  </Box>
                </Paper>
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Texto promocional */}
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 500,
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
              onClick={handleRegisterClick}
            >
              ¡Regístrate aquí y obtén hasta un 30% de descuento!
            </Typography>
          </Box>
        </Grid>
    </Box>
  );
};

export default ActivityDetailsSection;
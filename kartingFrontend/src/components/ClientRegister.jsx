import React, { useState } from 'react';
import {
  Container, Typography, TextField, Button, Paper,
  Grid, Box, Divider
} from '@mui/material';
import clientService from '../services/services.management';

const ClientRegister = () => {
  const [clientRUT, setClientRut] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientBirthday, setClientBirthday] = useState('');
  const [visitsPerMonth, setVisitsPerMonth] = useState(0);

  // Función para manejar el envío del formulario
  const handleSubmit = async(e) => {
    e.preventDefault();
    
    const newClient = {
      clientRUT,
      clientName,
      clientEmail,
      clientBirthday,
      visitsPerMonth
    };
  
    try {
      const response = await clientService.saveClient(newClient);
      setClientRut('');
      setClientName('');
      setClientEmail('');
      setClientBirthday('');
      setVisitsPerMonth(0);
      console.log('Cliente creado:', response.data);
      alert('Cliente creado con éxito!');

    } catch (error) {
      console.error('Error al crear el cliente:', error);
      alert('Error al crear el cliente. Por favor, intente nuevamente.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Registrar Cliente
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom align="center">
              Información del Cliente
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              <Grid>
                <TextField
                  fullWidth
                  label="RUT"
                  placeholder="Ej: 12345678-9"
                  value={clientRUT}
                  onChange={(e) => setClientRut(e.target.value)}
                  required
                  InputProps={{
                    inputProps: { maxLength: 10 }
                  }}
                />
              </Grid>
              <Grid>
                <TextField
                  fullWidth 
                  label="Nombre y Apellido"
                  placeholder='Ej: Juan Pérez'
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  label="Fecha de Nacimiento"
                  type="date"
                  value={clientBirthday}
                  onChange={(e) => setClientBirthday(e.target.value)}
                  InputLabelProps={{
                    shrink: true
                  }}
                  required
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 4, backgroundColor: "#FFA500"}}>
            <Button 
              type="submit" 
              variant="conteined" 
              color="primary" 
              size="small"
            >
              Registrar Usuario
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ClientRegister;

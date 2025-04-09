import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Box,
  Divider
} from '@mui/material';

const ClientRegister = () => {
  const [clientRUT, setClientRut] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientBirthday, setClientBirthday] = useState('');
  const [visitsPerMonth, setVisitsPerMonth] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Cliente registrado con éxito!');
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="RUT"
                  placeholder="12345678-9"
                  value={clientRUT}
                  onChange={(e) => setClientRut(e.target.value)}
                  required
                  InputProps={{
                    inputProps: { maxLength: 12 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
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

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button type="submit" variant="contained" color="primary" size="large">
              Registrar Cliente
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ClientRegister;

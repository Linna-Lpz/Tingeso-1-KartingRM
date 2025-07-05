import { Typography, Grid, TextField, IconButton, Paper, List, ListItem, ListItemText, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const ParticipantsSection = ({ 
  person, 
  people, 
  numOfPeople, 
  onPersonChange, 
  onAddPerson, 
  onRemovePerson,
  rutError,
  nameError,
  emailError
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>Datos de las personas</Typography>
      <Typography variant="subtitle1" gutterBottom color='textSecondary'>
        Ingresa primero a quien realiza la reserva
      </Typography>
      
      {rutError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {rutError}
        </Alert>
      )}
      
      {nameError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {nameError}
        </Alert>
      )}
      
      {emailError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {emailError}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid>
          <TextField
            fullWidth
            label="RUT"
            placeholder="Formato 12345678-9"
            value={person.rut}
            onChange={(e) => onPersonChange({ ...person, rut: e.target.value })}
            error={!!rutError}
          />
        </Grid>
        <Grid>
          <TextField
            fullWidth
            label="Nombre y Apellido"
            placeholder="Ej: Juan Pérez"
            value={person.name}
            onChange={(e) => onPersonChange({ ...person, name: e.target.value })}
            error={!!nameError}
          />
        </Grid>
        <Grid>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={person.email}
            onChange={(e) => onPersonChange({ ...person, email: e.target.value })}
            error={!!emailError}
          />
        </Grid>
        <Grid sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="primary" 
            onClick={onAddPerson}
            disabled={people.length >= numOfPeople}
          >
            <AddIcon />
          </IconButton>
        </Grid>
      </Grid>

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
                  <IconButton edge="end" onClick={() => onRemovePerson(index)}>
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
    </>
  );
};

export default ParticipantsSection;
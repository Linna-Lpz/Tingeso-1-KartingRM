import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  LocalOffer as LocalOfferIcon,
  Groups as GroupsIcon,
  Star as StarIcon,
  AttachMoney as AttachMoneyIcon,
  Cake as CakeIcon,
  Weekend as WeekendIcon
} from '@mui/icons-material';

const Information = () => {
  // Datos de tarifas
  const tarifas = [
    { vueltas: '10 vueltas o máx 10 min', precio: 15000, duracion: '30 min' },
    { vueltas: '15 vueltas o máx 15 min', precio: 20000, duracion: '35 min' },
    { vueltas: '20 vueltas o máx 20 min', precio: 25000, duracion: '40 min' }
  ];

  // Datos de descuentos por número de personas
  const descuentosPersonas = [
    { personas: '1-2 personas', descuento: '0%' },
    { personas: '3-5 personas', descuento: '10%' },
    { personas: '6-10 personas', descuento: '20%' },
    { personas: '11-15 personas', descuento: '30%' }
  ];

  // Datos de descuentos por frecuencia
  const descuentosFrecuencia = [
    { categoria: 'Muy frecuente', visitas: '7 a MAS veces', descuento: '30%' },
    { categoria: 'Frecuente', visitas: '5 a 6 veces', descuento: '20%' },
    { categoria: 'Regular', visitas: '2 a 4 veces', descuento: '10%' },
    { categoria: 'No frecuente', visitas: '0 a 1 vez', descuento: '0%' }
  ];

  // Datos de descuentos de cumpleaños
  const descuentosCumpleanos = [
    { 
      grupoSize: '3-5 personas', 
      personasDescuento: '1 persona', 
      descuento: '50%',
      descripcion: 'Una persona cumpleañera con 50% de descuento'
    },
    { 
      grupoSize: '6-10 personas', 
      personasDescuento: 'Hasta 2 personas', 
      descuento: '50%',
      descripcion: 'Hasta dos personas cumpleañeras con 50% de descuento'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Principal */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Tarifas y Horarios
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Información completa sobre precios y beneficios
        </Typography>
      </Box>

      {/* Sección de Horarios */}
      <Card sx={{ mb: 4, elevation: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ScheduleIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Horarios de Atención
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Alert severity="info" sx={{ height: '100%' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Lunes a Viernes
                </Typography>
                <Typography variant="h6" color="primary.main">
                  14:00 - 22:00 horas
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <Alert severity="success" sx={{ height: '100%' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Sábados, Domingos y Feriados
                </Typography>
                <Typography variant="h6" color="primary.main">
                  10:00 - 22:00 horas
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sección de Tarifas */}
      <Card sx={{ mb: 4, elevation: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Tarifas
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
            * No incluye el IVA
          </Typography>
          
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                    Número de vueltas o tiempo máximo permitido
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                    Precios regulares
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                    Duración total de la reserva
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tarifas.map((tarifa, index) => (
                  <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                    <TableCell sx={{ fontWeight: 'medium' }}>{tarifa.vueltas}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.1rem' }}>
                      {formatPrice(tarifa.precio)}
                    </TableCell>
                    <TableCell>{tarifa.duracion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Sección de Beneficios */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ 
        textAlign: 'center', 
        fontWeight: 'bold', 
        color: 'primary.main',
        mb: 3
      }}>
        Beneficios para Clientes Registrados
      </Typography>

      <Grid container spacing={3}>
        {/* Descuentos por Número de Personas */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%', elevation: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupsIcon sx={{ mr: 1, color: 'success.main', fontSize: 28 }} />
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                  Descuentos por Número de Personas
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Descuentos especiales para grupos. Mientras más personas, mayor descuento.
              </Typography>

              <TableContainer component={Paper} elevation={1}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'success.light' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                        Número de personas
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                        Descuento aplicado
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {descuentosPersonas.map((descuento, index) => (
                      <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                        <TableCell>{descuento.personas}</TableCell>
                        <TableCell>
                          <Chip 
                            label={descuento.descuento} 
                            color={descuento.descuento === '0%' ? 'default' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Descuentos por Frecuencia */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%', elevation: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon sx={{ mr: 1, color: 'warning.main', fontSize: 28 }} />
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                  Descuentos para Clientes Frecuentes
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Premiamos tu fidelidad con descuentos basados en tu frecuencia de visita mensual.
              </Typography>

              <TableContainer component={Paper} elevation={1}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'warning.light' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                        Categoría
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                        Visitas al mes
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                        Descuento
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {descuentosFrecuencia.map((descuento, index) => (
                      <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                        <TableCell sx={{ fontWeight: 'medium' }}>{descuento.categoria}</TableCell>
                        <TableCell>{descuento.visitas}</TableCell>
                        <TableCell>
                          <Chip 
                            label={descuento.descuento} 
                            color={descuento.descuento === '0%' ? 'default' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sección de Descuentos de Cumpleaños */}
      <Card sx={{ mb: 4, elevation: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CakeIcon sx={{ mr: 1, color: 'error.main', fontSize: 28 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              ¡Promoción Especial de Cumpleaños!
            </Typography>
          </Box>
          
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              🎉 ¡Celebra tu cumpleaños con nosotros!
            </Typography>
            <Typography variant="body2">
              Si cumples años el día que visitas nuestro kartódromo, ¡tienes un 50% de descuento especial!
            </Typography>
          </Alert>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            El descuento se aplica según el tamaño del grupo:
          </Typography>

          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'error.light' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                    Tamaño del Grupo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                    Personas con Descuento
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                    Descuento
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                    Descripción
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {descuentosCumpleanos.map((descuento, index) => (
                  <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                    <TableCell sx={{ fontWeight: 'medium' }}>{descuento.grupoSize}</TableCell>
                    <TableCell>{descuento.personasDescuento}</TableCell>
                    <TableCell>
                      <Chip 
                        label={descuento.descuento} 
                        color="error"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{descuento.descripcion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              📝 Condiciones para el descuento de cumpleaños:
            </Typography>
            <Typography variant="body2" component="div">
              • Debes presentar tu cédula de identidad el día de la visita<br/>
              • El descuento aplica solo para grupos de 3 o más personas<br/>
              • Solo válido el día exacto de tu cumpleaños<br/>
              • No acumulable con otros descuentos
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Nota importante actualizada */}
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            ⚠️ Importante - Política de Descuentos
          </Typography>
          <Typography variant="body2">
            Los descuentos por número de personas, por frecuencia y por cumpleaños NO son acumulables. 
            Se aplicará automáticamente el descuento más beneficioso para ti. El descuento de cumpleaños 
            siempre tiene prioridad cuando aplica.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default Information;
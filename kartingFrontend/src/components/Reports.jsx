import React, { useState, useEffect } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import bookingServiceImport from '../services/services.management';

// Función auxiliar para obtener el mes
const getMonth = (date) => date.getMonth();

// Función auxiliar para obtener el año 
const getYear = (date) => date.getFullYear();

const Reports = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(getMonth(currentDate));
    const [selectedYear, setSelectedYear] = useState(getYear(currentDate));
    const [reportData, setReportData] = useState({});

    useEffect(() => {
        fetchConfirmedBookings();
    }, []);

    // Función para obtener las reservas confirmadas
    const fetchConfirmedBookings = async () => {
        try {
            const response = await bookingServiceImport.getConfirmedBookings();
            console.log("Reservas confirmadas:", response.data);
            setBookings(response.data);
            processBookingsData(response.data);
            setError(null);
        } catch (err) {
            console.error("Error al obtener las reservas confirmadas:", err);
            setError("No se pudieron cargar las reservas. Por favor, intente de nuevo más tarde.");
        }
    };

    // Procesar los datos de reservas para el reporte
    const processBookingsData = (bookingsData) => {
        // Objeto para almacenar los datos procesados
        // Estructura: { lapsOrTime: { month: totalAmount } }
        const processedData = {};
    
        bookingsData.forEach(booking => {
            // Asegurarse de que los campos necesarios existan
            const lapsOrTime = booking.lapsOrMaxTimeAllowed || 0;
            console.log("Vueltas o tiempo máximo:", lapsOrTime);
    
            const month = new Date(booking.bookingDate).getMonth(); // Obtener el mes (0-11)
            console.log("Mes de la reserva:", month);
    
            const amount = booking.totalAmount || 0;
    
            // Inicializar la estructura si no existe
            if (!processedData[lapsOrTime]) {
                processedData[lapsOrTime] = Array(12).fill(0);
            }
    
            // Sumar el monto al mes correspondiente
            processedData[lapsOrTime][month] += amount;
            console.log("Monto total por mes:", processedData[lapsOrTime][month]);
        });
    
        setReportData(processedData);
    };

    // Nombres de los meses
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return (
        <div>
            <h1>Reporte de ventas</h1>
    
            {/* Reporte de ingresos por número de vueltas o tiempo máximo. */}
            <Typography variant="h6" gutterBottom align="center">
                Ingresos por número de vueltas o tiempo máximo
            </Typography>
            
            {error && (
                <Typography color="error" align="center" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Vueltas/Tiempo</TableCell>
                            {monthNames.map(month => (
                                <TableCell key={month} align="center" sx={{ fontWeight: 'bold' }}>
                                    {month}
                                </TableCell>
                            ))}
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Reporte de ingresos por número de personas */}
            <Typography variant="h6" gutterBottom align="center">
                Ingresos por número de personas
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Número de personas</TableCell>
                            {monthNames.map(month => (
                                <TableCell key={month} align="center" sx={{ fontWeight: 'bold' }}>
                                    {month}
                                </TableCell>
                            ))}
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        
                    </TableBody>
                </Table>
            </TableContainer>

        </div> 
    );
};

export default Reports;
import React, { useState, useEffect, use } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import bookingService from '../services/services.management';

// Función auxiliar para obtener el mes
const getMonth = (date) => date.getMonth();

// Función auxiliar para obtener el año 
const getYear = (date) => date.getFullYear();

const Reports = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(getMonth(currentDate));
    const [selectedYear, setSelectedYear] = useState(getYear(currentDate));
    const [reportData, setReportData] = useState({});
    const [totalIncomes, setTotalIncomes] = useState({});
    const [error, setError] = useState(null);
    const lapsOrMaxTime = [10, 15 ,20]

    useEffect(() => {
        lapsOrMaxTime.forEach(laps => {
          fetchConfirmedBookings(laps);
        });
      }, []);

    // Función para obtener las reservas por mes y número de vueltas
    const fetchConfirmedBookings = async (lapsOrTimeMax) => {
        try {
            const response = await bookingService.getBookingsForReport1(lapsOrTimeMax);
            const responseTotalIncomes = await bookingService.getIncomesForLapsOfMonth(lapsOrTimeMax);
            setReportData(prev => ({...prev, [lapsOrTimeMax]: response.data})); // Actualiza el estado con los datos obtenidos
            setTotalIncomes(responseTotalIncomes.data);
            setError(null);
        } catch (err) {
            setError("No se pudieron cargar las reservas. Por favor, intente de nuevo más tarde.");
        }
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
                        {lapsOrMaxTime.map((laps) => {
                            const data = reportData[laps] || [];
                            return (
                            <TableRow key={laps}>
                                <TableCell align="center">
                                {`${laps} vueltas o ${laps} mins`}
                                </TableCell>
                                {monthNames.map((_, index) => (
                                <TableCell key={index} align="center">
                                    {data[index + 1] || 0}
                                </TableCell>
                                ))}
                                <TableCell align="center">
                                {data[13] || 0}
                                </TableCell>
                            </TableRow>
                            );
                        })}
                        <TableRow>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                            {/* Recorremos los valores de totalIncomes para mostrar el total de cada mes */}
                            {Array.isArray(totalIncomes) ? 
                                totalIncomes.map((total, index) => (
                                    // Si el índice es 0, es el primer elemento, que no se muestra
                                    
                                        <TableCell key={index} align="center" sx={{ fontWeight: 'bold' }}>
                                            {total || 0}
                                        </TableCell>
                                    
                                )).filter(Boolean) : 
                                // Si todavía no hay datos, mostramos celdas vacías
                                Array(13).fill(0).map((_, index) => (
                                    <TableCell key={index} align="center" sx={{ fontWeight: 'bold' }}>
                                        0
                                    </TableCell>
                                ))
                            }
                        </TableRow>
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
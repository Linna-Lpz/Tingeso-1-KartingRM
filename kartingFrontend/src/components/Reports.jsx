import React, { useState, useEffect } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import bookingService from '../services/services.management';

const Reports = () => {
    const [reportData1, setreportData1] = useState({});
    const [reportData2, setreportData2] = useState({});
    const [totalIncomes1, setTotalIncomes1] = useState({});
    const [totalIncomes2, setTotalIncomes2] = useState({});
    const [error, setError] = useState(null);
    const lapsOrMaxTime = [10, 15 ,20]
    const people = [2, 5, 10, 15];

    useEffect(() => {
        lapsOrMaxTime.forEach(laps => {
          fetchConfirmedBookings(laps);
        });
      }, []);

      useEffect(() => {
        people.forEach(people => {
            fetchConfirmedBookingsByPeople(people);
        });
      }, []);

    // Función para obtener las reservas por mes y número de vueltas
    const fetchConfirmedBookings = async (lapsOrTimeMax) => {
        try {
            const response = await bookingService.getBookingsForReport1(lapsOrTimeMax);
            const responseTotalIncomes1 = await bookingService.getIncomesForLapsOfMonth(lapsOrTimeMax);
            setreportData1(prev => ({...prev, [lapsOrTimeMax]: response.data})); // Actualiza el estado con los datos obtenidos
            setTotalIncomes1(responseTotalIncomes1.data);
            setError(null);
        } catch (err) {
            setError("No se pudieron cargar las reservas del reporte 1. Por favor, intente de nuevo más tarde.");
        }
    };

    // función para obtener las reservas por cantidad de integrantes
    const fetchConfirmedBookingsByPeople = async (people) => {
        try{
            const response2 = await bookingService.getBookingsForReport2(people);
            const responseTotalIncomes2 = await bookingService.getIncomesForNumOfPeopleOfMonth(people);
            setreportData2(prev => ({...prev, [people]: response2.data})); // Actualiza el estado con los datos obtenidos
            setTotalIncomes2(responseTotalIncomes2.data);
            setError(null);
        } catch (err) {
            setError("No se pudieron cargar las reservas del reporte 2. Por favor, intente de nuevo más tarde.");
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
                            const data = reportData1[laps] || [];
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
                            {Array.isArray(totalIncomes1) ? 
                                totalIncomes1.map((total, index) => (
                                    // Si el índice es 0, es el primer elemento, que no se muestra
                                    
                                        <TableCell key={index} align="center" sx={{ fontWeight: 'bold' }}>
                                            {total || 0}
                                        </TableCell>
                                    
                                )).filter(Boolean) : 
                                // Si todavía no hay datos, se muestran celdas con 0
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
            <Typography variant="h6" gutterBottom align="center" sx={{ mt: 6 }}>
                Ingresos por número de personas
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
                        {people.map((people) => {
                            const data = reportData2[people] || [];
                            return (
                            <TableRow key={people}>
                                <TableCell align="center">
                                {people === 2 ? `1 a ${people} personas` : people === 5 ? `3 a ${people} personas` : `${people-4} a ${people} personas`}
                                </TableCell>
                                {monthNames.map((_, index) => (
                                <TableCell key={index} align="center">
                                    {data[index] || 0}
                                </TableCell>
                                ))}
                                <TableCell align="center">
                                {data[12] || 0}
                                </TableCell>
                            </TableRow>
                            );
                        })}
                        <TableRow>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                            {/* Recorremos los valores de totalIncomes para mostrar el total de cada mes */}
                            {Array.isArray(totalIncomes2) ? 
                                totalIncomes2.map((total, index) => (
                                    <TableCell key={index} align="center" sx={{ fontWeight: 'bold' }}>
                                        {total || 0}
                                    </TableCell> 
                                )).filter(Boolean) : 
                                // Si todavía no hay datos, se muestran celdas con 0
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
        </div> 
    );
};

export default Reports;
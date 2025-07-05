import React, { useState, useEffect } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, Box, Button } from '@mui/material';
import bookingService from '../services/services.management';

const Reports = () => {
    const [reportData1, setreportData1] = useState({});
    const [reportData2, setreportData2] = useState({});
    const [totalIncomes1, setTotalIncomes1] = useState({});
    const [totalIncomes2, setTotalIncomes2] = useState({});
    const [error, setError] = useState(null);
    const [startMonth, setStartMonth] = useState(1);
    const [endMonth, setEndMonth] = useState(12);
    const [showTables, setShowTables] = useState(false);
    const lapsOrMaxTime = [10, 15 ,20]
    const people = [2, 5, 10, 15];

    // Nueva función para cargar ambos reportes según los meses seleccionados
    const fetchAllReports = () => {
        lapsOrMaxTime.forEach(laps => {
            fetchConfirmedBookings(laps, startMonth, endMonth);
        });
        people.forEach(p => {
            fetchConfirmedBookingsByPeople(p, startMonth, endMonth);
        });
        setShowTables(true);
    };

    // Función para obtener las reservas por mes y número de vueltas
    const fetchConfirmedBookings = async (lapsOrTimeMax, startMonth, endMonth) => {
        try {
            const response = await bookingService.getBookingsForReport1(lapsOrTimeMax, startMonth, endMonth);
            const responseTotalIncomes1 = await bookingService.getIncomesForLapsOfMonth(startMonth, endMonth);
            setreportData1(prev => ({...prev, [lapsOrTimeMax]: response.data})); // Actualiza el estado con los datos obtenidos
            setTotalIncomes1(responseTotalIncomes1.data);
            setError(null);
        } catch (err) {
            setError("No se pudieron cargar las reservas del reporte 1. Por favor, intente de nuevo más tarde.");
        }
    };

    // función para obtener las reservas por cantidad de integrantes
    const fetchConfirmedBookingsByPeople = async (people, startMonth, endMonth) => {
        try{
            const response2 = await bookingService.getBookingsForReport2(people, startMonth, endMonth);
            const responseTotalIncomes2 = await bookingService.getIncomesForNumOfPeopleOfMonth(startMonth, endMonth);
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

    // Calcula el rango de meses a mostrar según selección
    const selectedMonths = monthNames.slice(startMonth - 1, endMonth);

    return (
        <div>
            <h1>Reporte de ventas</h1>
            {/* Selectores de mes */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
                <FormControl>
                    <InputLabel>Mes inicio</InputLabel>
                    <Select
                        value={startMonth}
                        label="Mes inicio"
                        onChange={e => setStartMonth(e.target.value)}
                    >
                        {monthNames.map((name, idx) => (
                            <MenuItem key={idx+1} value={idx+1}>{name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl>
                    <InputLabel>Mes fin</InputLabel>
                    <Select
                        value={endMonth}
                        label="Mes fin"
                        onChange={e => setEndMonth(e.target.value)}
                    >
                        {monthNames.map((name, idx) => (
                            <MenuItem key={idx+1} value={idx+1}>{name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={fetchAllReports}>Buscar</Button>
            </Box>
            {showTables && (
                <>
                {/* Reporte de ingresos por número de vueltas o tiempo máximo. */}
                <Typography variant="h6" gutterBottom align="center">
                    Ingresos por número de vueltas o tiempo máximo
                </Typography>
                {error && (
                    <Typography color="error" align="center" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, width: '100%', overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Vueltas/Tiempo</TableCell>
                                {selectedMonths.map((month, idx) => (
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
                                // Suma total del rango seleccionado
                                const total = selectedMonths.reduce(
                                    (acc, _, i) => acc + (data[startMonth + i] || 0), 0
                                );
                                return (
                                <TableRow key={laps}>
                                    <TableCell align="center">
                                    {`${laps} vueltas o ${laps} mins`}
                                    </TableCell>
                                    {selectedMonths.map((_, idx) => (
                                        <TableCell key={idx} align="center">
                                            {data[startMonth + idx] || 0}
                                        </TableCell>
                                    ))}
                                    <TableCell align="center">
                                        {total}
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                            <TableRow>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                {selectedMonths.map((_, idx) => (
                                    <TableCell key={idx} align="center" sx={{ fontWeight: 'bold' }}>
                                        {Array.isArray(totalIncomes1) ? (totalIncomes1[startMonth + idx - 1] || 0) : 0}
                                    </TableCell>
                                ))}
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                    {Array.isArray(totalIncomes1)
                                        ? selectedMonths.reduce(
                                            (acc, _, idx) => acc + (totalIncomes1[startMonth + idx - 1] || 0), 0
                                        )
                                        : 0}
                                </TableCell>
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
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, width: '100%', overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Número de personas</TableCell>
                                {selectedMonths.map((month, idx) => (
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
                                const total = selectedMonths.reduce(
                                    (acc, _, i) => acc + (data[startMonth + i - 1] || 0), 0
                                );
                                return (
                                <TableRow key={people}>
                                    <TableCell align="center">
                                    {people === 2 ? `1 a ${people} personas` : people === 5 ? `3 a ${people} personas` : `${people-4} a ${people} personas`}
                                    </TableCell>
                                    {selectedMonths.map((_, idx) => (
                                        <TableCell key={idx} align="center">
                                            {data[startMonth + idx - 1] || 0}
                                        </TableCell>
                                    ))}
                                    <TableCell align="center">
                                        {total}
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                            <TableRow>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                {selectedMonths.map((_, idx) => (
                                    <TableCell key={idx} align="center" sx={{ fontWeight: 'bold' }}>
                                        {Array.isArray(totalIncomes2) ? (totalIncomes2[startMonth + idx - 1] || 0) : 0}
                                    </TableCell>
                                ))}
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                    {Array.isArray(totalIncomes2)
                                        ? selectedMonths.reduce(
                                            (acc, _, idx) => acc + (totalIncomes2[startMonth + idx - 1] || 0), 0
                                        )
                                        : 0}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                </>
            )}
        </div> 
    );
};

export default Reports;
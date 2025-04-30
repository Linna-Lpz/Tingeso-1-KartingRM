import React, { useState, useEffect } from 'react';
import bookingService from '../services/services.management';

const StatusKartBooking = () => {
  const [rut, setRut] = useState('');
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [refresh, setRefresh] = useState(false); // Estado para forzar la actualización

  // Función para cargar las reservas
  const fetchBookings = async () => {
    if (!rut.trim()) {
      setError('Debes ingresar un RUT válido.');
      return;
    }

    try {
      const response = await bookingService.getBookingByUserRut(rut);
      setBookings(response.data);
      setError(null);
    } catch (err) {
      setError('Error al obtener las reservas. Inténtalo de nuevo más tarde.');
    }
  };

  // Función para confirmar la reserva
  const handleConfirmBooking = async (bookingId) => {
    try {
      await bookingService.confirmBooking(bookingId);
      alert('Reserva confirmada con éxito.');
      await bookingService.sendVoucherByEmail(bookingId);
      alert('Voucher enviado al correo electrónico.');
      setRefresh((prev) => !prev); // Forzar actualización
    } catch (err) {
      setError('Error al confirmar la reserva.');
    }
  };

  // useEffect para manejar la cancelación de reservas
  useEffect(() => {
    const cancelBooking = async () => {
      if (!cancelBookingId) return;

      try {
        await bookingService.cancelBooking(cancelBookingId);
        alert('Reserva cancelada con éxito.');
        setCancelBookingId(null); // Reiniciar el estado después de cancelar
        setRefresh((prev) => !prev); // Forzar actualización
      } catch (err) {
        setError('Error al cancelar la reserva.');
        setCancelBookingId(null); // Reiniciar el estado incluso si ocurre un error
      }
    };

    cancelBooking();
  }, [cancelBookingId]);

  // useEffect para recargar las reservas cuando cambie el estado `refresh`
  useEffect(() => {
    if (rut.trim()) {
      fetchBookings();
    }
  }, [refresh]);

  // Función para establecer el bookingId a cancelar
  const handleCancelBooking = (bookingId) => {
    setCancelBookingId(bookingId);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Consulta tus reservas</h3>
      <div>
        <input
          type="text"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          placeholder="Ingresa tu RUT"
        />
        <button onClick={fetchBookings}>Buscar reservas</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Mostrar reservas si existen */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                border: '2px solid black',
                padding: '10px',
                width: '200px',
                borderRadius: '10px',
              }}
            >
              <p>
                <strong>Fecha:</strong> {booking.bookingDate}
              </p>
              <p>
                <strong>Hora:</strong> {booking.bookingTime}
              </p>
              <p>
                <strong>Vueltas o tiempo máx:</strong> {booking.lapsOrMaxTimeAllowed}
              </p>
              <p>
                <strong>Cantidad de personas:</strong> {booking.numOfPeople}
              </p>
              <p>
                <strong>Estado:</strong> {booking.bookingStatus}
              </p>
              <p>
                <strong>Valor total:</strong> {booking.totalAmount}
              </p>

              {booking.bookingStatus !== 'confirmada' && booking.bookingStatus !== 'cancelada' && (
                <button
                  onClick={() => handleConfirmBooking(booking.id)}
                  style={{
                    marginTop: '10px',
                    backgroundColor: '#fff',
                    border: '2px solid rgb(0, 128, 19)',
                    color: 'black',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Pagar reserva
                </button>
              )}

              {booking.bookingStatus === 'confirmada' && (
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  style={{
                    marginTop: '10px',
                    backgroundColor: '#fff',
                    border: '2px solid rgb(169, 0, 0)',
                    color: 'black',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar reserva
                </button>
              )}
            </div>
          ))
        ) : (
          <p>Ingrese su rut para pagar o cancelar una reserva.</p>
        )}
      </div>
    </div>
  );
};

export default StatusKartBooking;

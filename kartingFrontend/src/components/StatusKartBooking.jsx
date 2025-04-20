import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../services/services.management';

const StatusKartBooking = () => {
  const [rut, setRut] = useState('');
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleShowBooking = async () => {
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

  const handleConfirmBooking = async (bookingId) => {
    try {
      await bookingService.confirmBooking(bookingId);
      bookings.map(booking => booking.id === bookingId ? { ...booking, status: 'confirmada' } : booking);
      alert('Reserva confirmada con éxito.');
      
    } catch (err) {
      setError('Error al confirmar la reserva.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingService.cancelBooking(bookingId);
      bookings.map(booking => booking.id === bookingId ? { ...booking, status: 'cancelada' } : booking);
      alert('Reserva cancelada con éxito.');
    } catch (err) {
      setError('Error al cancelar la reserva.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Reservas de Cliente</h3>

      <div>
        <input
          type="text"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          placeholder="Ingresa tu RUT"
        />
        <button onClick={handleShowBooking}>Buscar reservas</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                border: '2px solid black',
                padding: '10px',
                width: '200px',
                borderRadius: '10px'
              }}
            >
              <p><strong>Fecha:</strong> {booking.bookingDate}</p>
              <p><strong>Hora:</strong> {booking.bookingTime}</p>
              <p><strong>Vueltas o tiempo máx:</strong> {booking.lapsOrMaxTimeAllowed}</p>
              <p><strong>Cantidad de personas:</strong> {booking.numOfPeople}</p>
              <p><strong>Estado:</strong> {booking.bookingStatus}</p>
              <p><strong>Valor total:</strong> {booking.totalAmount}</p>

              {booking.bookingStatus !== 'confirmed' && (
                <button
                onClick={async () => {
                    await handleConfirmBooking(booking.id);
                    navigate("/");
                  }}
                  style={{
                    marginTop: '10px',
                    backgroundColor: '#fff',
                    border: '2px solid rgb(0, 128, 19)',
                    color: 'black',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Confirmar reserva
                </button>
              )}

              {booking.status !== 'cancelled' && (
                <button
                  onClick={async () => {
                        await handleCancelBooking(booking.id);
                        navigate("/");
                        }}
                  style={{
                    marginTop: '10px',
                    backgroundColor: '#fff',
                    border: '2px solid rgb(169, 0, 0)',
                    color: 'black',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar reserva
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No hay reservas registradas para este cliente.</p>
        )}
      </div>
    </div>
  );
};

export default StatusKartBooking;

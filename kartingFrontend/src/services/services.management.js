import axios from "axios";

const BOOKING_API_URL = "http://4.201.120.74/api/booking";
const CLIENT_API_URL = "http://4.201.120.74/api/client";

// ------------------ Booking ------------------
function saveBooking(data) {
    return axios.post(`${BOOKING_API_URL}/save`, data);
}

function getBooking(){
    return axios.get(`${BOOKING_API_URL}/getBookings`);
}

function getBookingByUserRut(userRut){
    return axios.get(`${BOOKING_API_URL}/getBookings/${userRut}`);
}

function getBookingTimesByDate(date){
    return axios.get(`${BOOKING_API_URL}/getBookingTimesByDate/${date}`);
}

function getBookingTimesEndByDate(date){
    return axios.get(`${BOOKING_API_URL}/getBookingTimesEndByDate/${date}`)
}

function confirmBooking(bookingId){
    return axios.post(`${BOOKING_API_URL}/confirm/${bookingId}`);
}

function cancelBooking(bookingId){
    return axios.post(`${BOOKING_API_URL}/cancel/${bookingId}`);
}

// ------------------ Client ------------------
function saveClient(client){
    return axios.post(`${CLIENT_API_URL}/save`, client);
}


// ------------------ Export -------------------

export default {
    saveBooking,
    getBooking,
    getBookingByUserRut,
    getBookingTimesByDate,
    getBookingTimesEndByDate,
    confirmBooking,
    cancelBooking,
    saveClient
};
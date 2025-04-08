import axios from "axios";

const BOOKING_API_URL = "http://localhost:8090/booking";
const CLIENT_API_URL = "http://localhost:8090/client";

// ------------------ Booking ------------------
function saveBooking(data) {
    return axios.post(`${BOOKING_API_URL}/save`, data);
}

function getBooking(){
    return axios.get(`${BOOKING_API_URL}/getBookings`);
}

function getBookingTimesByDate(date){
    return axios.get(`${BOOKING_API_URL}/getBookingTimesByDate/${date}`);
}

// ------------------ Client ------------------


export default {
    saveBooking,
    getBooking,
    getBookingTimesByDate
};
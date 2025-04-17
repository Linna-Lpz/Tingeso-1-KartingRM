import axios from "axios";
import { isSameQuarter } from "date-fns";

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

function getBookingTimesEndByDate(date){
    return axios.get(`${BOOKING_API_URL}/getBookingTimesEndByDate/${date}`)
}

// ------------------ Client ------------------
function saveClient(client){
    return axios.post(`${CLIENT_API_URL}/save`, client);
}


// ------------------ Export -------------------

export default {
    saveBooking,
    getBooking,
    getBookingTimesByDate,
    getBookingTimesEndByDate,
    saveClient
};
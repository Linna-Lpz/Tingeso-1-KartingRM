import axios from "axios";

const BOOKING_API_URL = `http://localhost:8761/booking`;
const CLIENT_API_URL = `http://localhost:8761/client`; 
const VOUCHER_API_URL = `http://localhost:8761`;
const RACK_API_URL = `http://localhost:8761/rack`;
const REPORT_API_URL = `http://localhost:8761/reports`;

// ------------------ Booking ------------------
function saveBooking(data) {
    return axios.post(`${BOOKING_API_URL}/save`, data);
}

function getBooking(){
    return axios.get(`${BOOKING_API_URL}/getBookings`);
}

function getBookingByUserRut(rut){
    return axios.get(`${BOOKING_API_URL}/getBookingsByUser/${rut}`);
}

function getTimesByDate(date){
    return axios.get(`${BOOKING_API_URL}/getTimesByDate/${date}`);
}

function getTimesEndByDate(date){
    return axios.get(`${BOOKING_API_URL}/getTimesEndByDate/${date}`)
}

function confirmBooking(bookingId){
    return axios.post(`${BOOKING_API_URL}/confirm/${bookingId}`);
}

function cancelBooking(bookingId){
    return axios.post(`${BOOKING_API_URL}/cancel/${bookingId}`);
}

function getConfirmedBookings(){
    return axios.get(`${BOOKING_API_URL}/getConfirmedBookings`);
}

// ------------------ Voucher ------------------
function sendVoucherByEmail (bookingId){
    return axios.post(`${VOUCHER_API_URL}/voucher/send/${bookingId}`);
}

// ------------------ Rack ------------------
function getBookingsForRack(month, year){
    return axios.get(`${RACK_API_URL}/getBookingsForRack/${month}/${year}`);
}

// ------------------ Report ------------------
function getBookingsForReport1(lapsOrTimeMax, startMonth, endMonth){
    return axios.get(`${REPORT_API_URL}/getBookingsForReport1/${lapsOrTimeMax}/${startMonth}/${endMonth}`);
}

function getIncomesForLapsOfMonth(startMonth, endMonth){
    return axios.get(`${REPORT_API_URL}/getTotalForReport1/${startMonth}/${endMonth}`);
}

function getBookingsForReport2(people, startMonth, endMonth){
    return axios.get(`${REPORT_API_URL}/getBookingsForReport2/${people}/${startMonth}/${endMonth}`);
}

function getIncomesForNumOfPeopleOfMonth(startMonth, endMonth){
    return axios.get(`${REPORT_API_URL}/getTotalForReport2/${startMonth}/${endMonth}`);
}

// ------------------ Client ------------------
function saveClient(client){
    return axios.post(`${CLIENT_API_URL}/save`, client);
}

function getClientByRut(rut){
    return axios.get(`${CLIENT_API_URL}/get/${rut}`);
}

// ------------------ Export -------------------
export default {
    saveBooking,
    getBooking,
    getBookingByUserRut,
    getTimesByDate,
    getTimesEndByDate,
    getConfirmedBookings,
    confirmBooking,
    cancelBooking,
    saveClient,
    sendVoucherByEmail,
    getBookingsForRack,
    getBookingsForReport1,
    getIncomesForLapsOfMonth,
    getBookingsForReport2,
    getIncomesForNumOfPeopleOfMonth,
    getClientByRut
};
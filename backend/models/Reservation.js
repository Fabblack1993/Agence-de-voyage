const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: String,
    reservationDate: Date,
    reservationTime: String,
    numberOfPeople: Number,
    price: Number,
    voyage:String,
});

module.exports = mongoose.model('Reservation', reservationSchema);

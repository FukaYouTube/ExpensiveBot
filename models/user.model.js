const { Schema, model } = require('mongoose')

let user = new Schema({
    _id:        { type: String, required: true },   // id: 123456

    username:   String,                             // @username
    first_name: String,                             // First name

    name:       String,                             // user name
    last_name:  String,                             // last name
    iin_number: String,                             // 000101123456
    quiz:       [{}],                               // [{ questions, answer }]
    faq:        [{}],                               // [{ questions, answer }]

    is_admin:   { type: Boolean, default: false },  // false
    is_banned:  { type: Boolean, default: false },  // false
    date:       { type: Date, default: Date.now }   // 01.01.00 [dd, mm, yy]
})

module.exports = model('User', user)
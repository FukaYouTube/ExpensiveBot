const { Schema, model } = require('mongoose')

let account = new Schema({
    _owner:         { type: String, required: true },   // id: 123456

    text:           String,                             // post text
    author:         String,                             // @username or first name
    
    publication:    { type: Boolean, default: false },  // true or false
    date:           { type: Date, default: Date.now }   // 01.01.00 [dd, mm, yy]
})

module.exports = model('Account', account)
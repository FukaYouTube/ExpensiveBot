const { Schema, model } = require('mongoose')

let course = new Schema({
    name:           String,
    description:    String,
    payment:        String
})

module.exports = model('Course', course)
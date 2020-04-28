const Stage = require('telegraf/stage')
const stage = new Stage()

stage.register(require('./quiz.stage'))
stage.register(require('./aboutme.stage'))
stage.register(require('./account.stage'))
stage.register(require('./course.stage'))
stage.register(require('./faq.stage'))

module.exports = stage
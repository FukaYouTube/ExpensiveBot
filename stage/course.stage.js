const fs = require('fs')
const WizardScene = require('telegraf/scenes/wizard')

const Course = require('../models/course.model')

const { keyboard } = require('telegraf/markup')

const wizard = new WizardScene('new-course', ctx => {

    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))
    ctx.session.course = []

    let q = 'q1'
    ctx.reply(message.course.question[q], keyboard([message.course.cancel]).oneTime().resize().extra())

    return ctx.wizard.next()

}, ctx => {

    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))
    
    if(message.course.cancel === ctx.message.text){
        ctx.reply('Scene exit..', keyboard(message.menu).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    ctx.session.course.push(ctx.message.text)

    let q = 'q2'
    ctx.reply(message.course.question[q], keyboard([message.course.cancel]).oneTime().resize().extra())

    return ctx.wizard.next()
    
}, ctx => {

    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))

    if(message.course.cancel === ctx.message.text){
        ctx.reply('Scene exit..', keyboard(message.menu).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    ctx.session.course.push(ctx.message.text)

    let q = 'q3'
    ctx.reply(message.course.question[q], keyboard([message.course.cancel]).oneTime().resize().extra())

    return ctx.wizard.next()

}, async ctx => {

    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))

    if(message.course.cancel === ctx.message.text){
        ctx.reply('Scene exit..', keyboard(message.menu).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    let course = new Course({
        name: ctx.session.course[0],
        description: ctx.session.course[1],
        payment: ctx.message.text
    })
    course.save()

    ctx.reply(message.course.done, keyboard(message.menu).oneTime().resize().extra())

    return ctx.scene.leave()

})

module.exports = wizard
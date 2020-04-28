const fs = require('fs')
const WizardScene = require('telegraf/scenes/wizard')

const User = require('../models/user.model')

const { keyboard } = require('telegraf/markup')

const wizard = new WizardScene('about-me', ctx => {

    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))
    ctx.session.aboutme = []

    let q = 'q1'
    ctx.reply(message['about-me'].question[q], keyboard([message['about-me'].cancel]).oneTime().resize().extra())

    return ctx.wizard.next()

}, ctx => {
    
    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))

    if(message['about-me'].cancel === ctx.message.text){
        ctx.reply('Scene exit..', keyboard(message.menu).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    let q = 'q2'
    ctx.session.aboutme.push(ctx.message.text)
    ctx.reply(message['about-me'].question[q], keyboard([message['about-me'].cancel]).oneTime().resize().extra())

    return ctx.wizard.next()

}, ctx => {
    
    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))

    if(message['about-me'].cancel === ctx.message.text){
        ctx.reply('Scene exit..', keyboard(message.menu).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    let q = 'q3'
    ctx.session.aboutme.push(ctx.message.text)
    ctx.reply(message['about-me'].question[q], keyboard([message['about-me'].cancel]).oneTime().resize().extra())

    return ctx.wizard.next()

}, async ctx => {
    
    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))
    let user = await User.findById(ctx.from.id)

    if(message['about-me'].cancel === ctx.message.text){
        ctx.reply('Scene exit..', keyboard(message.menu).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    user.name = ctx.session.aboutme[0],
    user.last_name = ctx.session.aboutme[1],
    user.iin_number = ctx.message.text
    user.save()

    ctx.session.aboutme = ''
    ctx.reply(message['about-me'].done, keyboard(message.menu).oneTime().resize().extra())

    return ctx.scene.leave()

})

module.exports = wizard
const fs = require('fs')
const WizardScene = require('telegraf/scenes/wizard')

const User = require('../models/user.model')

const { keyboard } = require('telegraf/markup')

const wizard = new WizardScene('faq-scene', ctx => {

    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))
    ctx.session.faq = []

    let q = 'q1'
    ctx.reply(message['push-faq'].question[q], keyboard([message['about-me'].cancel]).oneTime().resize().extra())

    return ctx.wizard.next()

}, ctx => {
    
    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))

    if(message['push-faq'].cancel === ctx.message.text){
        ctx.reply('Scene exit..', keyboard(message.menu).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    let q = 'q2'
    ctx.session.faq.push(ctx.message.text)
    ctx.reply(message['push-faq'].question[q], keyboard([message['about-me'].cancel]).oneTime().resize().extra())

    return ctx.wizard.next()

}, async ctx => {
    
    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))
    let user = await User.findById(471556440)

    if(message['push-faq'].cancel === ctx.message.text){
        ctx.reply('Scene exit..', keyboard(message.menu).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    user.faq.push({
        question: ctx.session.faq[0],
        answer: ctx.message.text
    })
    user.save()

    ctx.session.faq = ''
    ctx.reply(message['push-faq'].done, keyboard(message.menu).oneTime().resize().extra())

    return ctx.scene.leave()

})

module.exports = wizard
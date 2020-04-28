const fs = require('fs')
const WizardScene = require('telegraf/scenes/wizard')

const User = require('../models/user.model')

const { keyboard } = require('telegraf/markup')

const wizard = new WizardScene('quiz-scene', ctx => {

    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))
    ctx.session.quiz = []

    let q = 'q1'
    ctx.reply(message.quiz.question[q], keyboard([message.quiz.cancel]).oneTime().resize().extra())

    return ctx.wizard.next()

}, ctx => {

    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))

    if(message.quiz.cancel === ctx.message.text){
        ctx.reply('Scene exit..', keyboard(message.menu).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    let q = 'q2'
    ctx.session.quiz.push({ question: message.quiz.question.q1, answer: ctx.message.text })
    ctx.reply(message.quiz.question[q], keyboard([message.quiz.cancel]).oneTime().resize().extra())

    return ctx.wizard.next()

}, ctx => {

    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))

    if(message.quiz.cancel === ctx.message.text){
        ctx.reply('Scene exit..', keyboard(message.menu).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    let q = 'q3'
    ctx.session.quiz.push({ question: message.quiz.question.q2, answer: ctx.message.text })
    ctx.reply(message.quiz.question[q], keyboard([message.quiz.cancel]).oneTime().resize().extra())

    return ctx.wizard.next()

}, ctx => {

    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))

    if(message.quiz.cancel === ctx.message.text){
        ctx.reply('Scene exit..', keyboard(message.menu).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    let q = 'q4'
    ctx.session.quiz.push({ question: message.quiz.question.q3, answer: ctx.message.text })
    ctx.reply(message.quiz.question[q], keyboard([message.quiz.cancel]).oneTime().resize().extra())

    return ctx.wizard.next()

}, async ctx => {

    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))
    let user = await User.findById(ctx.from.id)

    if(message.quiz.cancel === ctx.message.text){
        ctx.reply('Scene exit..', keyboard(message.menu).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    user.quiz.push({
        question1: ctx.session.quiz[0].question,
        answer: ctx.session.quiz[0].answer
    },{
        question2: ctx.session.quiz[1].question,
        answer: ctx.session.quiz[1].answer
    },{
        question3: ctx.session.quiz[2].question,
        answer: ctx.session.quiz[2].answer
    },{
        question4: message.quiz.question.q4,
        answer: ctx.message.text
    })
    user.save()

    ctx.reply(message.quiz.done, keyboard(message.menu).oneTime().resize().extra())

    return ctx.scene.leave()

})

module.exports = wizard
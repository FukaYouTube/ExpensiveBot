const fs = require('fs')
const WizardScene = require('telegraf/scenes/wizard')

const User = require('../models/user.model')
const Account = require('../models/account.model')

const { keyboard, inlineKeyboard, callbackButton } = require('telegraf/markup')

const wizard = new WizardScene('new-account', ctx => {

    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))
    ctx.session.account = []

    let q = 'q1'
    ctx.reply(message.account.question[q], keyboard([message.account.cancel]).oneTime().resize().extra())

    return ctx.wizard.next()

}, async ctx => {

    let message = JSON.parse(fs.readFileSync(`messages/quiz.${ctx.session.lang || 'ru'}.json`))
    let user = await User.find({})

    if(message.account.cancel === ctx.message.text){
        ctx.reply('Scene exit..', keyboard(message.menu).oneTime().resize().extra())
        return ctx.scene.leave()
    }

    let acc = new Account({
        _owner: ctx.from.id,
        text: ctx.message.text,
        author: ctx.from.username || ctx.from.first_name
    })
    acc.save()
    
    user.forEach(u => {
        if(u.is_admin) ctx.telegram.sendMessage(u._id, `[New account] Author: ${ctx.from.username || ctx.from.first_name} \n\nText: ${ctx.message.text}`, inlineKeyboard([
            [callbackButton('Опуликовать', `a_${acc._id}`)],
            [callbackButton('Удалить', `r_${acc._id}`)]
        ]).extra())
    })

    ctx.reply(message.account.done, keyboard(message.menu).oneTime().resize().extra())

    return ctx.scene.leave()

})

module.exports = wizard
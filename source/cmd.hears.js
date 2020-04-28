const User = require('../models/user.model')
const Account = require('../models/account.model')
const Course = require('../models/course.model')

const { keyboard, inlineKeyboard, callbackButton } = require('telegraf/markup')
const Extra = require('telegraf/extra')

module.exports = {
    'use-hears-commands': (ctx, next) => {
        if(!ctx.message) return next()
        if(!ctx.message.text) return next()

        const match = ctx.message.text.slice('').trim().split(/ +/g)
        const command = match.shift().toLowerCase()

        ctx['hears-match'] = match
        ctx['hears-command'] = command

        next()
    },
    "get-menu": async (ctx, yaml, next) => {
        let user = await User.findById(ctx.from.id)
        let account = await Account.find({})
        let course = await Course.find({})

        switch(ctx.message.text){
            // menu
            case yaml.getContext('menu')[0][0]:
                ctx.reply(yaml.getContext('about-me', { user }), keyboard(yaml.getContext('about-me-menu')).oneTime().resize().extra())
            break
            case yaml.getContext('menu')[0][1]:
                ctx.replyWithMarkdown(yaml.getContext('about'), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
            break
            case yaml.getContext('menu')[0][2]:
                let message = ''
                account.forEach(ac => {
                    if(ac.publication) message += yaml.getContext('account-text', { ac })
                })

                ctx.reply(message || yaml.getContext('account-error')[0], keyboard(yaml.getContext('account-menu')).oneTime().resize().extra())
            break
            case yaml.getContext('menu')[1][0]:
                ctx.replyWithMarkdown(yaml.getContext('course-text'), keyboard(course.map(c => c.name)).oneTime().resize().extra())
            break
            case yaml.getContext('menu')[1][1]:
                ctx.scene.enter('quiz-scene')
            break
            case yaml.getContext('menu')[2][0]:
                ctx.replyWithMarkdown(yaml.getContext('contact'), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
            break
            case yaml.getContext('menu')[2][1]:
                ctx.replyWithMarkdown(yaml.getContext('location'), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
                setTimeout(() => ctx.telegram.sendLocation(ctx.chat.id, 43.231863, 76.832276), 500)
            break
            case yaml.getContext('menu')[3][0]:
                let ff = await User.findById(471556440)
                let messages = 'FAQ: \n\n'

                ff.faq.forEach(f => {
                    messages += yaml.getContext('faq-view', { f })
                })
                
                ctx.replyWithMarkdown(messages || yaml.getContext('FAQ'), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
            break
            case yaml.getContext('menu')[3][1]:
                ctx.replyWithMarkdown(yaml.getContext('settings'), keyboard(yaml.getContext('settings-menu')).oneTime().resize().extra())
            break
            case yaml.getContext('menu')[4][0]:
                let extra = Extra.markup(keyboard(yaml.getContext('menu')).oneTime().resize()).webPreview(false)
                ctx.replyWithMarkdown(yaml.getContext('admin-panels'), extra)
            break

            // clicked butons from menu categorys
            case yaml.getContext('about-me-menu')[0][0]:
                ctx.scene.enter('about-me')
            break
            case yaml.getContext('account-menu')[0][0]:
                ctx.scene.enter('new-account')
            break

            // back
            case yaml.getContext('back-button')[0] || yaml.getContext('back-button')[1]:
                ctx.replyWithMarkdown(yaml.getContext('old-hello'), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
            break

            // not found
            default: next()
        }
    },
    course: async (ctx, yaml, next) => {
        let course = await Course.find({})

        for(c of course){
            if(ctx.message.text === c.name){
                ctx.session.courses = c._id
                return ctx.reply(yaml.getContext('course-info', { course: c }), inlineKeyboard([ callbackButton(yaml.getContext('ispay'), 'ispay'),callbackButton(yaml.getContext('back-button')[1], 'cancel') ]).extra())
            }
        }

        next()
    },
    cancelCallback: (ctx, yaml, next) => {
        ctx.deleteMessage()
        ctx.session.courses = ''
        ctx.replyWithMarkdown(yaml.getContext('old-hello'), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
    },
    payment: async (ctx, yaml) => {
        ctx.deleteMessage()
        let course = await Course.findById(ctx.session.courses)
        
        ctx.replyWithInvoice({
            provider_token: process.env.PAYMENT_TOKEN,
            start_parameter: 'foo',
            title: course.name,
            description: course.description,
            currency: 'KZT',
            is_flexible: false,
            need_shipping_address: false,
            prices: [{ label: course.name, amount: Math.trunc(course.payment * 100) }],
            payload: {}
        })
    },
    successPayment: async (ctx, yaml, next) => {
        let user = await User.find({})
        let course = await Course.findById(ctx.session.courses)
        ctx.reply(yaml.getContext('success-payment', { course }), keyboard(yaml.getContext('menu')).oneTime().resize().extra())

        user.forEach(u => {
            if(u.is_admin) ctx.telegram.sendMessage(u._id, `# [New payment] User: ${ctx.from.username || ctx.from.first_name} \n\nCourse: ${course.name} \nPays: ${course.payment}`)
        })

        ctx.session.courses = ''
    },
    settings: (ctx, yaml, next) => {
        if(ctx.message.text === yaml.getContext('settings-menu')[0][0]){
            ctx.reply(yaml.getContext('lang-text'), keyboard(yaml.getContext('lang-menu')).oneTime().resize().extra())
        }else{
            next()
        }
    },
    settinglang: (ctx, yaml, next) => {
        if(ctx.message.text === yaml.getContext('lang-menu')[0][0]){
            ctx.session.lang = 'ru'
            yaml.setPath(`messages/${ctx.session ? ctx.session.lang || 'ru' : 'ru'}.yml`)
            ctx.reply(yaml.getContext('lang-edit-done'), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
        }else if(ctx.message.text === yaml.getContext('lang-menu')[1][0]){
            ctx.session.lang = 'kz'
            yaml.setPath(`messages/${ctx.session ? ctx.session.lang || 'ru' : 'ru'}.yml`)
            ctx.reply(yaml.getContext('lang-edit-done'), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
        }else{
            next()
        }
    }
}
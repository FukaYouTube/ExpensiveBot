const yamlParser = require('yaml-parser')
const yaml = new yamlParser.YamlParser()

const User = require('../models/user.model')
const Account = require('../models/account.model')

const { keyboard } = require('telegraf/markup')
const Extra = require('telegraf/extra')

module.exports = {
    "yaml-parser-admin-messages": (ctx, next) => {
        yaml.setPath(`messages/admin.${ctx.session ? ctx.session.lang || 'ru' : 'ru'}.yml`)
        next()
    },
    "new-code": async (ctx, next) => {
        let user = await User.find({})

        if(ctx.message.text === 'generate'){
            ctx.session.secret = Math.floor(100000 + Math.random() * 900000)
            console.log(ctx.session.secret)

            user.forEach(u => {
                if(u.is_admin) ctx.telegram.sendMessage(u._id, `# [new Admin: ${ctx.from.username || ctx.from.first_name}] active ${ctx.session.secret}`)
            })
        }

        next()
    },
    "active-code": async (ctx, next) => {
        let user = await User.findById(ctx.from.id)

        switch(ctx['hears-command']){
            case 'active':
                if(ctx['hears-match'][0] == ctx.session.secret){
                    user.is_admin = true
                    user.save()
                    ctx.reply('# [Success] Added new administrators!', keyboard(yaml.getContext('menu')).oneTime().resize().extra())
                }else{
                    next()
                }
            break
            default: next()
        }
    },
    "main-menu-admin": async (ctx, next) => {
        let user = await User.findById(ctx.from.id)

        if(!user.is_admin) return next()
        ctx.reply('# [Admin panels]', keyboard(yaml.getContext('menu')).oneTime().resize().extra())
    },
    "get-menu": async (ctx, next) => {
        let user = await User.findById(ctx.from.id)
        let users = await User.find({})

        if(!user.is_admin) return next()
        
        switch(ctx.message.text){
            case yaml.getContext('menu')[0][0]:
                let messages = yaml.getContext('all-user-header')
                users.forEach((u, i) => {
                    messages += yaml.getContext('all-user-view', { user: u, i }) + '\n'
                })
                messages += yaml.getContext('all-user-footer')

                ctx.reply(messages, keyboard(yaml.getContext('menu')).oneTime().resize().extra())
            break
            case yaml.getContext('menu')[0][1]:
                ctx.scene.enter('new-course')
            break
            case yaml.getContext('menu')[2][0]:
                ctx.reply(yaml.getContext('command-list'), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
            break
            default: next()
        }
    },
    "back-to-main-menu": (ctx, next) => {
        ctx.message.text === yaml.getContext('menu')[3][0]
        ? ctx.reply('# [Main menu]', keyboard(yaml.getContext('main-menu')).oneTime().resize().extra())
        : next()
    },
    "push-to-account": async (ctx, next) => {
        ctx.answerCbQuery()
        const matchAction = ctx.callbackQuery.data.replace('_', ' ').trim().split(/ +/g)

        let acc = await Account.findById(matchAction[1])

        if(matchAction[0] === 'a'){
            acc.publication = true
            acc.save()
            
            await ctx.deleteMessage()
            ctx.reply(yaml.getContext('account-added'), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
        }else if(matchAction[0] === 'r'){
            await Account.remove({ _id: matchAction[1] })
            
            await ctx.deleteMessage()
            ctx.reply(yaml.getContext('account-remove'), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
        }
    },
    "FAQ-push": async (ctx, next) => {
        ctx.message.text === yaml.getContext('menu')[1][0]
        ? ctx.scene.enter('faq-scene')
        : next()
    },
    "view-user": async (ctx, next) => {
        if(ctx['hears-command'] === 'user' || ctx['hears-command'] === 'ban'){
            let user = await User.findById(ctx['hears-match'][0] !== 'user' ? ctx['hears-match'][0] : ctx['hears-match'][1])
            let acc = await Account.find({ _owner: user._id })

            if(ctx['hears-command'] === 'user'){
                return ctx.reply(yaml.getContext('view-user', { user, acc }, keyboard(yaml.getContext('menu')).oneTime().resize().extra()))
            }else if(ctx['hears-command'] === 'ban' && ctx['hears-match'][0] === 'user'){
                user.is_banned = true
                user.save()
    
                return ctx.reply(yaml.getContext('banned-user', keyboard(yaml.getContext('menu')).oneTime().resize().extra()))
            }
        }else{
            next()
        }
    }
}
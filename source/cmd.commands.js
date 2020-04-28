const User = require('../models/user.model')

const { keyboard } = require('telegraf/markup')

exports.start = async (ctx, yaml) => {
    let user = await User.findById(ctx.from.id)
    if(!user){
        user = new User({
            _id:        ctx.from.id,        // user id
            username:   ctx.from.username,  // @username
            first_name: ctx.from.first_name // first name
        })
        
        user.save()
        ctx.replyWithMarkdown(yaml.getContext('new-hello', { user: ctx.from }), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
    }else{
        ctx.replyWithMarkdown(yaml.getContext('old-hello'), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
    }
}

exports.help = (ctx, yaml) => {
    
}
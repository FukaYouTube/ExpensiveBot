const { keyboard } = require('telegraf/markup')

module.exports = {
    $commands: require('./cmd.commands'),
    $hears: require('./cmd.hears'),
    $admin: require('./cmd.admin'),
    
    $notfound: (ctx, yaml) => {
        ctx.replyWithMarkdown(yaml.getContext('command-not-found', { commands: ctx.message.text }), keyboard(yaml.getContext('menu')).oneTime().resize().extra())
    }
}
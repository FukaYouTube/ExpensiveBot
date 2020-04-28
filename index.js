require('dotenv').config()

require('mongoose').connect(process.env.URI_MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(error => console.log(error)).then(() => console.log(`# Connect to DB`))

const yamlParser = require('yaml-parser')
const yaml = new yamlParser.YamlParser()

const Telegtaf = require('telegraf')
const app = new Telegtaf(process.env.BOT_TOKEN)

const { session } = Telegtaf

app.use(session())
app.use(require('./stage'))

const User = require('./models/user.model')

// use yaml parser
app.use(async (ctx, next) => {
    yaml.setPath(`messages/${ctx.session ? ctx.session.lang || 'ru' : 'ru'}.yml`)
    next()
})

// src
const source = require('./source')

// default commands
app.start(ctx => source.$commands.start(ctx, yaml))
app.help(ctx => source.$commands.help(ctx, yaml))

app.use(async (ctx, next) => {
    let user = await User.findById(ctx.from.id)
    if(user.is_banned) return null
    
    next()
})

// use hears commands
app.use((ctx, next) => source.$hears['use-hears-commands'](ctx, next))

// hears
app.hears(/./gm, (ctx, next) => source.$hears['get-menu'](ctx, yaml, next))
app.hears(/./gm, (ctx, next) => source.$hears.course(ctx, yaml, next))
app.hears(/./gm, (ctx, next) => source.$hears.settings(ctx, yaml, next))

app.action('cancel', (ctx, next) => source.$hears.cancelCallback(ctx, yaml, next))
app.action('ispay', (ctx, next) => source.$hears.payment(ctx, yaml, next))

app.on('pre_checkout_query', ({ answerPreCheckoutQuery }) => answerPreCheckoutQuery(true))
app.on('successful_payment', ctx => source.$hears.successPayment(ctx, yaml))

// admin panels
app.use((ctx, next) => source.$admin['yaml-parser-admin-messages'](ctx, next))

app.hears(/./gm, (ctx, next) => source.$admin['new-code'](ctx, next))
app.hears(/./gm, (ctx, next) => source.$admin['active-code'](ctx, next))
app.hears(/./gm, (ctx, next) => source.$admin['get-menu'](ctx, next))
app.hears(/./gm, (ctx, next) => source.$admin['back-to-main-menu'](ctx, next))
app.hears(/./gm, (ctx, next) => source.$admin['FAQ-push'](ctx, next))
app.hears(/./gm, (ctx, next) => source.$admin['view-user'](ctx, next))

app.command('/admin_panel', (ctx, next) => source.$admin['main-menu-admin'](ctx, next))

app.action(/./gm, (ctx, next) => source.$admin['push-to-account'](ctx, next))

// command and hears not found functions
app.hears(/./gm, ctx => source.$notfound(ctx, yaml))

app.startPolling()
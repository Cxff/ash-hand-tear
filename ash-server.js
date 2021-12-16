
const fs = require('fs')
const path = require('path')
const Koa = require('koa')

const app = new Koa()

app.use(ctx => {
  const { request: { url, query } } = ctx
  if (url === '/') {
    // 访问跟目录
    let content = fs.readFileSync('./index.html', 'utf-8')
    ctx.type = 'text/html'
    ctx.body = content
  } else if (url.endsWith('.js')) {
    const p = path.resolve(__dirname, url.slice(1))
    ctx.type = 'application/javascript'
    const content = fs.readFileSync(p, 'utf-8')
    ctx.body = content
  }
})

app.listen(9097, () => {
  console.log('listen 9097')
})
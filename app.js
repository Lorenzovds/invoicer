const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const httpError = require('http-errors')
const path = require('path')

const router = require('./routes')
const logger = require('./lib/logger')
const pino = require('express-pino-logger')({
  logger
})

const {
  NODE_ENV = 'development'
} = process.env

const app = express()

// log every incomming request
app.use(pino)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  next()
})

app.use('/api', router)

app.use('/', express.static(`${__dirname}/client/build`))

app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/client/public/index.html`))
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(httpError(404))
})

// only send stacktrace when in development
app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .send({
      message: err.message,
      error: NODE_ENV === 'production' ? {} : err
    })
})

module.exports = app

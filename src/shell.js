const config = require('../config')

const User = require('./models/user')
const Attendance = require('./models/attendance')

const repl = require('repl')

// Start REPL server
const server = repl.start('akara > ')

// Context vars
server.context.config = config
server.context.User = User
server.context.Attendance = Attendance

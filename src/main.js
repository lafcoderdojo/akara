const config = require('../config')

const Express = require('express')
const server = Express()
const path = require('path')
const url = require('url')

const User = require('./models/user')
const Attendance = require('./models/attendance')

server.use('/api', Express.json())

server.route = function(route, handler, method = 'get') {
    console.log(`Endpoint setup for ${method.toUpperCase()} to ${route}`)

    const METHODS = [
        'get',
        'put',
        'post',
        'delete',
    ]
    if (!METHODS.includes(method)) {
        throw `The route definition for ${method} method is invalid`
    }

    this[method](route, function(req, res) {

        // set CORS header if applicable
        if (config.CORS_ALLOWED_ORIGINS.includes(req.get('Origin'))) {
            res.setHeader('Access-Control-Allow-Origin', req.get('Origin'))
        }

        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(handler.apply(this, arguments) || {}))
    })
}

server.api = function(route, handler, method) {
    this.route('/api' + route, handler, method)
}

server.describe = function(modelClass) {

    // list endpoints

    this.api(`/${modelClass.collectionName}`, (req, res) => {
        const queries = url.parse(req.url, true).query
        return modelClass.all().filter(queries).value()
    }, 'get')

    this.api(`/${modelClass.collectionName}`, (req, res) => {
        const props = Object.assign({}, req.body)
        const instance = new modelClass(props)
        instance.save()

        res.status(201)
        return instance.props // include id here
    }, 'post')

    // instance endpoints

    this.api(`/${modelClass.collectionName}/:pk`, (req, res) => {
        const pk = req.params.pk
        const instance = new modelClass({id: pk})

        return instance.from_db().value()
    }, 'get')

    this.api(`/${modelClass.collectionName}/:pk`, (req, res) => {
        const pk = req.params.pk
        const instance = new modelClass({id: pk})
        instance.assign(req.body)
        instance.save()

        return instance.props
    }, 'put')

    this.api(`/${modelClass.collectionName}/:pk`, (req, res) => {
        const pk = req.params.pk
        const instance = new modelClass({id: pk})
        instance.delete()

        res.status(204)
    }, 'delete')

}

// Specific API definitions
server.api('/users', (req, res) => {
    const queries = url.parse(req.url, true).query
    let full_name_search
    result = User.all().filter(queries)
    if (queries.full_name_search) {
        full_name_search = queries.full_name_search.toLowerCase().trim()
        delete queries.full_name_search

        result = result.filter(obj => obj.name.toLowerCase().includes(full_name_search))
    } else {
        // If there is no search string, prevent security issues by not returning any results
        return []
    }
    const lookups = result.value().slice(0, 6)

    // for security purposes, demographic data is hidden here
    return lookups.map(userJSON => {
        return ({
            id: userJSON.id,
            name: userJSON.name,
            user_info: {
                school: userJSON.user_info.school,
            },
        })
    })
}, 'get')

server.api('/users/:pk/attendances', (req, res) => {
    const queries = url.parse(req.url, true).query
    return Attendance.all().filter({user_id: req.params.pk}).value()
}, 'get')

// override the /users/:pk endpoint to hide sensitive demographic data
server.api('/users/:pk', (req, res) => {
    return {
        Error: 'Individual user lookups are disabled at the moment',
    }
})

// App definitions
server.describe(User)
server.describe(Attendance)

// serialize incoming request data as JSON for API requests
server.use('/', Express.static('./static/'))
server.use('/', (req, res) => {
    res.sendFile('index.html', {
        root: path.join(__dirname, '../static/')
    })
})

server.listen(config.PORT, () => {
    console.log('Server started and listening on port', config.PORT)
})

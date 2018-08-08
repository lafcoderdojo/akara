const config = require('../config')

const Express = require('express')
const server = Express()
const path = require('path')
const url = require('url')

const User = require('./models/user')
const Attendance = require('./models/attendance')
const Admin = require('./models/admin')

const json_to_csv = require('./services/json_to_csv')

server.use('/api', Express.json())

server.route = function(
    route,
    handler,
    method = 'get',
    permissionCheck = req => true,
) {
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

        if (permissionCheck(req)) {
            res.setHeader('Content-Type', 'application/json')

            // FIXME: the handler is executed last, just before the send,
            //  because this allows the handler to override other
            //  response settings within itself. Not ideal, but it works
            //  for now.
            const result = handler.apply(this, arguments)
            let responseBody = '';
            if (typeof result === 'object') {
                responseBody = JSON.stringify(result)
            } else {
                responseBody = result
            }
            res.send(responseBody)
        } else {
            res.status(401)
            res.end()
        }
    })
}

server.api = function(route, handler, method) {
    this.route('/api' + route, handler, method)
}

server.admin_api = function(route, handler, method) {
    const permissionCheck = req => {
        return Admin.validatePassword(req.get('X-Admin-Pass'))
    }
    this.route('/api' + route, handler, method, permissionCheck)
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

// Admin endpoints
server.api('/validate_password', (req, res) => {
    const { password_value } = Object.assign({}, req.body)
    return (
        Admin.validatePassword(password_value)
    )
}, 'post')
server.admin_api('/get_event_label', (req, res) => {
    try {
        const event_slug = Admin.get_event_label()
        return {
            event_label: event_slug,
        }
    } catch (e) {
        return {
            error: e.toString(),
        }
    }
})
server.admin_api('/update_event_label', (req, res) => {
    const queries = url.parse(req.url, true).query
    const event_slug = queries.event_label
    if (event_slug) {
        try {
            Admin.set_event_label(event_slug)
            return {
                event_label: event_slug,
            }
        } catch (e) {
            return {
                error: e.toString(),
            }
        }
    } else {
        return {
            error: 'no event label provided',
        }
    }
}, 'post')
server.admin_api('/get_event_dates', (req, res) => {
    return {
        event_dates: Attendance.get_distinct_dates(),
    }
})
server.admin_api('/download_attendance_csv', (req, res) => {
    const queries = url.parse(req.url, true).query
    const event_date = queries.event_date
    if (event_date) {
        const users = User.filter_for_attendance(event_date).value()

        // With a CSV header and a plain text payload,
        //  the API will send the response directly without
        //  encoding it as a JSON.
        res.setHeader('Content-Type', 'text/csv')
        return json_to_csv(users)
    } else {
        return {
            error: 'no event date provided',
        }
    }
})

// App definitions
server.describe(User)
server.describe(Attendance)

// serialize incoming request data as JSON for API requests
server.use('/', Express.static('./static/'))
server.use('/dashboard', (req, res) => {
    res.sendFile('admin_dashboard.html', {
        root: path.join(__dirname, '../static/')
    })
})
server.use('/', (req, res) => {
    res.sendFile('index.html', {
        root: path.join(__dirname, '../static/')
    })
})

server.listen(config.PORT, () => {
    console.log('Server started and listening on port', config.PORT)
})

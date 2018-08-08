const config = require('../../config')
const crypto = require('crypto')

const {Database} = require('./model')

if (!Database.has('event_slug').value()) {
    Database.set('event_slug', 'strike').value()
    Database.write()
}

class Admin {

    static validatePassword(password_value) {
        if (typeof password_value !== 'string') return false

        const password_hash = crypto.createHash('sha256').update(password_value).digest('base64')
        return password_hash === config.ADMIN_PASSWORD_HASH
    }

    static get_event_label() {
        return Database.get('event_slug').value()
    }

    static set_event_label(new_event_slug = '') {
        Database.set('event_slug', new_event_slug).value()
        Database.write()
    }

}

module.exports = Admin

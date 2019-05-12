const {Database, Model} = require('./model')
const Hash = require('crypto').createHash('sha256')

if (!Database.has('attendances').value()) {
    Database.set('attendances', []).value()
    Database.write()
}

function pw_hash(pw, salt) {
    // note: I know this insanely insecure.
    // This is a proof of concept / MVP. Leave me alone.

    if (!pw || !salt) throw 'Both the password and salt are required!'

    const secret = pw + salt
    return Hash.update(secret).digest('hex')
}

class Attendance extends Model {

    static get collectionName() {
        return 'attendances'
    }

    // returns the latest 36 dates (usually 1.5 year)
    static get_distinct_dates() {
        const date_set = new Set()
        for (const attendance of this.all().value()) {
            date_set.add(attendance.iso_date.substr(0, 10))
        }
        return [...date_set].reverse().slice(0, 36)
    }

    constructor(props) {
        super('attendances', props)
        if (!('dojo_slug' in props)) {
            props.dojo_slug = Database.get('event_slug').value()
        }
    }

    get user_id() {
        return this.props.user_id
    }

    set user_id(val) {
        this.props.user_id = val
    }

    get iso_date() {
        return this.props.iso_date
    }

    set iso_date(val) {
        this.props.iso_date = val
    }

    get dojo_slug() {
        return this.props.dojo_slug
    }

    set dojo_slug(val) {
        this.props.dojo_slug = val
    }

}

module.exports = Attendance

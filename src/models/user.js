const {Database, Model} = require('./model')
const Hash = require('crypto').createHash('sha256')

const Attendance = require('./attendance')

if (!Database.has('users').value()) {
    Database.set('users', []).value()
    Database.write()
}

function pw_hash(pw, salt) {
    // note: I know this insanely insecure.
    // This is a proof of concept / MVP. Leave me alone.

    if (!pw || !salt) throw 'Both the password and salt are required!'

    const secret = pw + salt
    return Hash.update(secret).digest('hex')
}

class User extends Model {

    static get collectionName() {
        return 'users'
    }

    constructor(props) {
        super('users', props)
    }

    get name() {
        return this.props.name
    }

    set name(val) {
        this.props.name = val
    }

    get grade_level() {
        return this.props.grade_level
    }

    set grade_level(val) {
        this.props.grade_level = +val
    }

    get created_iso_date() {
        return this.props.created_iso_date
    }

    set created_iso_date(val) {
        this.props.created_iso_date = val
    }

    get email() {
        return this.props.email
    }

    set email(val) {
        this.props.email = val
    }

    get user_info() {
        return this.props.user_info
    }

    set user_info(json) {
        this.props.user_info = json
    }

    get attendances() {
        if (this.id) {
            return Attendance.filter({user_id: this.id})
        } else {
            // should return an empty collection of Attendances
            return Attendance.filter({user_id: -1})
        }
    }

    /**
     * Filter users by attendance on a particular date
     *
     * @param {Date|String} date - date of event, in either ISO string or a Date object
     */
    static filter_for_attendance(date) {
        if (date instanceof Date) {
            date = date.toISOString()
        }

        const user_ids = Attendance
            .filter(a => a.iso_date.includes(date))
            .map(a => a.user_id)
            .value()
        const users = User
            .filter(u => user_ids.includes(u.id))
        return users
    }

}

module.exports = User

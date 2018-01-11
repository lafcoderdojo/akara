const {Database, Model} = require('./model')
const Hash = require('crypto').createHash('sha256')

const Attendance = require('./attendance')

if (!Database.has('users').value()) {
    Database.set('users', [])
        .write()
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

    hash_password(pw) {
        return pw_hash(pw, this.email)
    }

    check_password(val) {
        return (hash_password(val) === this.props.password_hash)
    }

    set_password(val) {
        this.props.password_hash = this.hash_password(val)
    }

    get attendances() {
        if (this.id) {
            return Attendance.filter({user_id: this.id})
        } else {
            // should return an empty collection of Attendances
            return Attendance.filter({user_id: -1})
        }
    }

}

module.exports = User

const low = require('lowdb')
const shortid = require('shortid')
// synchronous filesystem db adapter for lowdb, async version is FileAsync
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('./db.json')
const Database = low(adapter)

class Model {

    constructor(collectionName, props = {}) {
        this.collectionName = collectionName
        this.props = props
    }
    
    static all() {
        return Database.get(this.collectionName)
    }

    all() {
        // cheap hack but it's simple and it works
        return this.constructor.all()
    }

    static filter() {
        return this.all().filter.apply(this, arguments)
    }

    static get(props) {
        return this.all().find(props)
    }

    get(props) {
        return this.constructor.get(props)
    }

    get id() {
        return this.props.id
    }

    assign(props) {
        this.props = Object.assign(this.props, props)
    }

    from_db() {
        return this.all().find({id: this.id})
    }

    save() {
        let instance = this.from_db()
        if (instance.value()) {
            // already exists, so find it and save
            instance.assign(this.props)
            const fromDb = this.get({ id: instance.id })
            instance = fromDb.assign(this.props).value()
        } else {
            // doesn't exist, create one
            this.props.id = shortid.generate()
            instance = this.all().push(this.props).value()
        }

        Database.write()
        return instance
    }

    delete() {
        const instance = this.from_db()
        if (instance) {
            // already exists, okay to delete
            this.all()
                .remove({id: this.id})
                .write()
        } else {
            throw 'Cannot save model ' + this.toString()
        }
    }

    toString() {
        return `${this.collectionName} model id: ${this.id} with props ${this.props}`
    }

}

module.exports = {
    Database,
    Model,
}
const low = require('lowdb')
// synchronous filesystem db adapter for lowdb, async version is FileAsync
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('./db/db.json')
const Database = low(adapter)

class Model {

    constructor(collectionName, props = {}) {
        this.collectionName = collectionName
        this.props = props
    }
    
    static all() {
        return Database.get(this.collectionName)
    }

    static filter() {
        return this.all().filter.apply(this, arguments)
    }

    static get(props) {
        return this.all().find(props)
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
        if (instance) {
            // already exists, so find it and save
            instance.assign(this.props)
        } else {
            // doesn't exist, create one
            instance = this.all().push(this.props)
        }

        instance.write()
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
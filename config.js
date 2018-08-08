const fs = require('fs')

const CONFIG = {

    PORT: 5000,

    LOCATIONS: [
        {
            slug: 'strike',
            name: 'CoderDojo Strike',
        },
        {
            slug: 'imagine',
            name: 'CoderDojo Imagine',
        },
    ],

    CORS_ALLOWED_ORIGINS: [
        'https://akara.surge.sh',
        'http://localhost:5000',
        'http://localhost',
    ],

    // read the hash from ./key.txt here.
    ADMIN_PASSWORD_HASH: fs.readFileSync('./key.txt', {encoding: 'utf8'}).trim(),

}

module.exports = CONFIG


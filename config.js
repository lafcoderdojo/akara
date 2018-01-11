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

    API_DOMAIN: 'https://akara.now.sh',
    STATIC_DOMAIN: 'https://akara.surge.sh',

    CORS_ALLOWED_ORIGINS: [
        'https://akara.surge.sh',
        'http://localhost:5000',
        'http://localhost',
    ],

}

module.exports = CONFIG


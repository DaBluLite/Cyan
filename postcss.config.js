const header = require('postcss-header');

/** @type {import('postcss-load-config').Config} */
const config = {
    map: { annotation: false },
    plugins: [
        require('@tailwindcss/postcss'),
    ]
}

module.exports = config
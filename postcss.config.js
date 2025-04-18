const header = require('postcss-header');

/** @type {import('postcss-load-config').Config} */
const config = {
    map: { annotation: false },
    plugins: [
        header({header: `/**
            * Credits:
            * Icons by Bootrstrap Icons
            * Fonts by Google Fonts
            */`}),
        require('@tailwindcss/postcss'),
    ]
}

module.exports = config
fx_version 'cerulean'
game 'gta5'

version '1.8'
description 'Phone for FiveM'
author 'Chezza Studios'

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/app.js',
    'web/public/assets/**/*',
    'web/public/styles/**',
    'web/locales.json'
}

shared_scripts {
    'config.lua',
    'phone.lua'
}

client_scripts {
    'client/main.lua',
    'client/functions.lua',
    'apps/**/cl_*.lua'
}

server_scripts {
    '@mysql-async/lib/MySQL.lua',
    'server/classes/phone.lua',
    'server/main.lua',
    'server/functions.lua',
    'apps/**/sv_*.lua'
}

dependency 'screenshot-basic'
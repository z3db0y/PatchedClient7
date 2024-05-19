const electron = require('electron');
const path = require('path');

class BrowserWindow extends electron.BrowserWindow {
    constructor(opts) {
        const preload = opts.webPreferences?.preload || '';
        if (preload) {
            preload = path.resolve(__dirname, preload);
        }

        opts.webPreferences = {
            ...opts.webPreferences,
            preload: path.resolve(__dirname, 'preload.patched.js'),
        };

        super(opts);
        this.webContents.on('ipc-message', (event, chan) => {
            if (chan === 'original-preload') {
                event.reply('original-preload', preload);
            }
        });
    }
}

delete require.cache[require.resolve('electron')].exports;
require.cache[require.resolve('electron')].exports = {
    ...electron,
    BrowserWindow,
};

Object.freeze(require.cache[require.resolve('electron')]);

const http = require('http');
const https = require('https');
const net = require('net');

http.request = () => {};
https.request = () => {};
net.connect = () => {};

delete require.cache[require.resolve('http')].exports;
delete require.cache[require.resolve('https')].exports;
delete require.cache[require.resolve('net')].exports;

require.cache[require.resolve('http')].exports = http;
require.cache[require.resolve('https')].exports = https;
require.cache[require.resolve('net')].exports = net;

Object.freeze(require.cache[require.resolve('http')]);
Object.freeze(require.cache[require.resolve('https')]);
Object.freeze(require.cache[require.resolve('net')]);

try {
    const ws = require('ws');

    ws = () => {};
    ws.WebSocket = () => {};

    delete require.cache[require.resolve('ws')].exports;
    require.cache[require.resolve('ws')].exports = ws;

    Object.freeze(require.cache[require.resolve('ws')]);
} catch (_) {}

// What now, bestbuy?

fetch = () => {
    return new Promise.resolve({
        ok: false,
        json: () => 'nope',
        text: () => 'nope',
    });
};

XMLHttpRequest = () => {};

const { ipcRenderer } = require('electron');
ipcRenderer.on('original-preload', (_, preload) => {
    require(preload);
});

ipcRenderer.send('original-preload');

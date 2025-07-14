const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require("electron-reload")(__dirname)
const WebSocket = require('ws');

// ─── 1) HTTPS SERVER ─────────────────────────────────────────────────
const https = require('https');
const fs    = require('fs');
const express = require('express');
const httpApp = express();

httpApp.use(express.static(__dirname));

// Serve /ip.json for frontend config
httpApp.get('/ip.json', (req, res) => {
  res.json({ IP_ADDRESS: process.env.IP_ADDRESS || 'localhost' });
});

const options = {
  key:  fs.readFileSync(path.join(__dirname,'certs','key.pem')),
  cert: fs.readFileSync(path.join(__dirname,'certs','cert.pem')),
};

const server = https.createServer(options, httpApp);

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('📱 Phone connected');
  ws.on('message', msg => {
    try {
      const { ax, ay } = JSON.parse(msg);
      //console.log(`ax=${ax}, ay=${ay}` )
      if (mainWindow) {
        mainWindow.webContents.send('motion-data', msg.toString());
      }
    } catch (e) {
      console.error('Invalid motion data', e);
    }
  });
  ws.on('close', () => console.log('📱 Phone disconnected'));
});

const IP = process.env.IP_ADDRESS || 'localhost';

server.listen(3000, () => {
  console.log(`HTTPS & WSS server at https://${IP}:3000`);
});

let mainWindow;
let isClickThrough = true; // Start as click-through

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    //width: 200, height: 100,
    width: 800, height: 600,
    //maxHeight:100, minHeight:100,
    //maxWidth:200, minWidth:200,
    frame:false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    },
    transparent: true,
    alwaysOnTop: true,
    type: "toolbar", // or "notification"
    focusable: false,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
  mainWindow.setTitle('');

  // Start as click-through
  mainWindow.setIgnoreMouseEvents(true, { forward: true });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // Register global shortcut: Ctrl+Shift+D
  globalShortcut.register('Control+Shift+D', () => {
    isClickThrough = !isClickThrough;
    if (isClickThrough) {
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      mainWindow.setIgnoreMouseEvents(false);
    }
  });

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

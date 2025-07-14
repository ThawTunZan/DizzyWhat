const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('node:path');
require("electron-reload")(__dirname)

let mainWindow;
let isClickThrough = true; // Start as click-through

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 200, height: 100,
    maxHeight:100, minHeight:100,
    maxWidth:200, minWidth:200,
    frame:false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: __dirname + "\\preload.js"
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

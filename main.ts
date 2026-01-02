/*
 * built using electron
 * creates window
 * wires IPC handlers
 * never contains business logic
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the app
  mainWindow.loadFile('renderer/index.html');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for notes operations
ipcMain.handle('save-note', async (event, noteData) => {
  // TODO: Implement note saving logic
  console.log('Saving note:', noteData);
  return { success: true, id: Date.now() };
});

ipcMain.handle('load-notes', async () => {
  // TODO: Implement notes loading logic
  console.log('Loading notes');
  return [
    { id: 1, title: 'Sample Note 1', content: 'This is a sample note', createdAt: new Date() },
    { id: 2, title: 'Sample Note 2', content: 'Another sample note', createdAt: new Date() }
  ];
});

ipcMain.handle('delete-note', async (event, noteId) => {
  // TODO: Implement note deletion logic
  console.log('Deleting note:', noteId);
  return { success: true };
});
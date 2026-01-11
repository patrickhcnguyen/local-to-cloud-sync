/*
 * built using electron
 * creates window
 * wires IPC handlers
 * never contains business logic
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { init as initEngine } from './engine/init';
import { saveNote, loadNotes, removeNote } from './engine/notesEngine';

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

app.on('ready', async () => {
  try {
    console.log('Initializing engine...');
    await initEngine();
    console.log('Engine initialized, creating window...');
    createWindow();
  } catch (error) {
    console.error('Failed to initialize engine:', error);
  }
});
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
  return await saveNote(noteData);
});

ipcMain.handle('load-notes', async () => {
  return await loadNotes();
});

ipcMain.handle('delete-note', async (event, noteId) => {
  return await removeNote(noteId);
});
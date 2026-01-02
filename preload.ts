/*
 * exposes safe functions to UI
 * prevents UI from accessing Node APIs directly
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Notes operations
  saveNote: (noteData: any) => ipcRenderer.invoke('save-note', noteData),
  loadNotes: () => ipcRenderer.invoke('load-notes'),
  deleteNote: (noteId: number) => ipcRenderer.invoke('delete-note', noteId),

  // Platform info
  platform: process.platform,

  // Version info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});
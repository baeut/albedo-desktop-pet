const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Allow renderer to toggle mouse passthrough
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },
  // Move window by delta
  moveWindow: (deltaX, deltaY) => {
    ipcRenderer.send('move-window', deltaX, deltaY);
  },
  // Get current window position
  getWindowPosition: () => {
    return ipcRenderer.invoke('get-window-position');
  },
  // Listen for commands from main process
  onCommand: (callback) => {
    ipcRenderer.on('command', (event, command) => callback(command));
  }
});

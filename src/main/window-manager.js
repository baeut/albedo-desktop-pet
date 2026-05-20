const { screen } = require('electron');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(
  require('electron').app.getPath('userData'),
  'window-position.json'
);

class WindowManager {
  constructor(window) {
    this.window = window;
    this.loadPosition();
  }

  loadPosition() {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        const bounds = this.window.getBounds();
        this.window.setPosition(data.x || bounds.x, data.y || bounds.y);
      }
    } catch (e) {
      // Use default position
    }

    this.window.on('moved', () => {
      this.savePosition();
    });
  }

  savePosition() {
    try {
      const [x, y] = this.window.getPosition();
      fs.writeFileSync(CONFIG_PATH, JSON.stringify({ x, y }));
    } catch (e) {
      // Silent fail
    }
  }

  resetPosition() {
    const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
    this.window.setPosition(screenWidth - 340, 100);
    this.savePosition();
  }

  /**
   * Ensure window stays within visible screen area
   */
  clampToScreen() {
    const [x, y] = this.window.getPosition();
    const bounds = this.window.getBounds();
    const display = screen.getDisplayNearestPoint({ x, y });
    const { x: sx, y: sy, width: sw, height: sh } = display.workArea;

    let newX = Math.max(sx, Math.min(x, sx + sw - bounds.width));
    let newY = Math.max(sy, Math.min(y, sy + sh - bounds.height));

    if (newX !== x || newY !== y) {
      this.window.setPosition(newX, newY);
    }
  }
}

module.exports = { WindowManager };

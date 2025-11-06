# Malwa CRM - Desktop Application Setup Guide

## 📋 Overview
This guide will help you convert the Malwa CRM web application into a standalone Windows desktop application (.exe) using Electron.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Windows OS (for building .exe)

---

## 📦 Step 1: Install Electron Dependencies

```bash
npm install --save-dev electron electron-builder concurrently wait-on cross-env
```

---

## 📄 Step 2: Create Electron Main Process File

Create a new file: `electron/main.js`

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#ffffff',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    app.quit();
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
```

---

## ⚙️ Step 3: Update package.json

Add these scripts and electron configuration:

```json
{
  "name": "malwa-crm",
  "version": "2.0.0",
  "description": "Malwa Trolley CRM - Desktop Application",
  "author": "Malwa Trolley",
  "main": "electron/main.js",
  "homepage": "./",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron": "wait-on http://localhost:5173 && cross-env NODE_ENV=development electron .",
    "electron:dev": "concurrently \"npm run dev\" \"npm run electron\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:linux": "npm run build && electron-builder --linux"
  },
  "build": {
    "appId": "com.malwatrolley.crm",
    "productName": "Malwa CRM",
    "directories": {
      "buildResources": "build",
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "package.json"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": [
            "x64"
          ]
        }
      ],
      "icon": "build/icon.png",
      "artifactName": "Malwa-CRM-Setup-${version}.${ext}"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Malwa CRM"
    },
    "mac": {
      "target": "dmg",
      "icon": "build/icon.png",
      "category": "public.app-category.business"
    },
    "linux": {
      "target": [
        "AppImage",
        "deb"
      ],
      "icon": "build/icon.png",
      "category": "Office"
    }
  }
}
```

---

## 🖼️ Step 4: Prepare Application Icon

1. Create a `build` folder in project root
2. Add your application icon as `build/icon.png` (512x512 px recommended)
3. For Windows, you can convert PNG to ICO using online tools

---

## 🔧 Step 5: Update Vite Configuration

Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
```

---

## 🏗️ Step 6: Build Desktop Application

### Development Mode (Test before building)
```bash
npm run electron:dev
```

### Build Windows Executable
```bash
npm run electron:build:win
```

The executable will be created in the `release` folder:
- **Setup File**: `Malwa-CRM-Setup-2.0.0.exe`
- **Portable Version**: `Malwa-CRM-2.0.0.exe`

---

## 📁 Project Structure

```
malwa-crm/
├── electron/
│   └── main.js          # Electron main process
├── build/
│   └── icon.png         # Application icon
├── src/                 # React source code
├── dist/                # Built web app
├── release/             # Built desktop app (.exe)
├── package.json
├── vite.config.js
└── SETUP.md
```

---

## 🔒 Database Configuration

### Using Supabase (Recommended)
- No additional configuration needed
- Works out of the box
- Real-time sync enabled
- Cloud-based storage

### Using Local Database (Optional)
For offline functionality, you can integrate:
- SQLite
- Better-sqlite3
- IndexedDB (browser storage)

---

## 📦 Distribution

### Installer (.exe)
- Double-click to install
- Creates desktop shortcut
- Adds to Start Menu
- Auto-updates support

### Portable Version
- No installation required
- Run from USB drive
- Single executable file

---

## 🐛 Troubleshooting

### Issue: White Screen on Startup
**Solution**: Check if `base: './'` is set in vite.config.js

### Issue: Database Connection Error
**Solution**: Verify .env file has correct Supabase credentials

### Issue: Build Fails
**Solution**:
```bash
# Clear cache and rebuild
rm -rf node_modules dist release
npm install
npm run electron:build:win
```

### Issue: Icon Not Showing
**Solution**: Ensure icon.png is 512x512 and in the build folder

---

## 🚀 Advanced Configuration

### Auto-Update Setup
1. Install electron-updater:
```bash
npm install electron-updater
```

2. Add to main.js:
```javascript
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

### Custom Menu Bar
```javascript
const { Menu } = require('electron');

const template = [
  {
    label: 'File',
    submenu: [
      { role: 'quit' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'toggleDevTools' }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
```

---

## 📝 Environment Variables

Create `.env.local` for production:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_NAME=Malwa CRM
VITE_APP_VERSION=2.0.0
```

---

## 🎯 Production Checklist

- [ ] Update version in package.json
- [ ] Set production Supabase credentials
- [ ] Add application icon
- [ ] Test in development mode
- [ ] Build Windows executable
- [ ] Test installer on clean system
- [ ] Create user documentation
- [ ] Setup auto-update server (optional)

---

## 📞 Support

For issues or questions:
- **Email**: malwatrolley@gmail.com
- **Phone**: +91 8224000822

---

## 📄 License

Malwa Trolley CRM © 2025
All Rights Reserved

---

## 🎉 Success!

Your desktop application is ready!

**Final Output**: `release/Malwa-CRM-Setup-2.0.0.exe`

Double-click to install and enjoy your standalone Malwa CRM desktop application!

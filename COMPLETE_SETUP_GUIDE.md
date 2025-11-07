# 🚀 Malwa CRM - Complete Setup Guide

Everything you need to build and run your Desktop CRM Application

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Project Setup](#project-setup)
3. [Run Web Version](#run-web-version)
4. [Build Desktop App](#build-desktop-app)
5. [Login & Use](#login--use)
6. [Files & Documentation](#files--documentation)
7. [Troubleshooting](#troubleshooting)

---

## 💻 System Requirements

### **Minimum Requirements:**
- Windows 10 or higher
- 4 GB RAM
- 2 GB free disk space
- Node.js v18 or higher

### **Check Your System:**

```powershell
# Check Node.js version
node --version
# Should show: v18.x.x or higher

# Check npm version
npm --version
# Should show: 9.x.x or higher
```

### **Install Node.js (if needed):**

1. Visit: https://nodejs.org
2. Download LTS version (Recommended)
3. Run installer (accept all defaults)
4. Restart your terminal/PowerShell
5. Verify: `node --version`

---

## 📂 Project Setup

### **Step 1: Navigate to Project**

```powershell
# Open PowerShell
# Press Windows Key, type "PowerShell", press Enter

# Navigate to your project folder
cd "C:\Users\YOUR_USERNAME\Desktop\Final-Crm-main"

# Verify you're in the right place
dir package.json
# You should see package.json listed
```

### **Step 2: Install Dependencies**

```powershell
npm install
```

**What this does:**
- Downloads all required packages
- Creates `node_modules` folder
- Takes 2-5 minutes
- ~400 packages installed
- ~600 MB download

**Expected Output:**
```
added 400 packages in 2m
```

---

## 🌐 Run Web Version

Before building the desktop app, test the web version:

### **Start Development Server:**

```powershell
npm run dev
```

**Expected Output:**
```
VITE v5.x.x ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### **Open in Browser:**

1. Open your browser (Chrome, Edge, Firefox)
2. Go to: `http://localhost:5173`
3. You should see the login page

### **Login:**

```
Email:    Shahidmultaniii@gmail.com
Password: S#d_8224
```

### **Test Features:**

- ✅ Add a customer
- ✅ Navigate to different pages
- ✅ Check dark mode toggle
- ✅ Verify responsive design

### **Stop Server:**

Press `Ctrl+C` in PowerShell to stop

---

## 🖥️ Build Desktop App

### **Build Command:**

```powershell
npm run electron:build:win
```

**What this does:**
1. ✅ Builds React app for production
2. ✅ Packages with Electron
3. ✅ Creates Windows installers
4. ✅ Saves to `release` folder

**Time:** 3-5 minutes

**Progress You'll See:**
```
> malwa-crm@2.0.0 electron:build:win
> npm run build && electron-builder --win

vite v5.x.x building for production...
✓ 3124 modules transformed.
✓ built in 7.75s

electron-builder 24.13.3
  • electron-builder  version=24.13.3
  • loaded configuration  file=package.json
  • platform=win32 arch=x64 appId=com.malwatrolley.crm
  • packaging       [========================] 100%
  • building block map   [========================] 100%
  • building NSIS installer [====================] 100%
  • artifacts:
    - Malwa-CRM-Setup-2.0.0.exe
    - Malwa-CRM-Portable-2.0.0.exe

✓ Built in 3m 45s
```

### **Find Your Files:**

```powershell
# Navigate to release folder
cd release

# List files
dir
```

**You'll see:**

```
📁 release/
├── 📦 Malwa-CRM-Setup-2.0.0.exe        (~120 MB)
├── 📦 Malwa-CRM-Portable-2.0.0.exe     (~150 MB)
├── 📄 latest.yml
└── 📁 win-unpacked/ (build artifacts)
```

---

## 🎯 Install & Use Desktop App

### **Option 1: Setup Installer (Recommended)**

**File:** `Malwa-CRM-Setup-2.0.0.exe`

**Installation:**
1. Double-click `Malwa-CRM-Setup-2.0.0.exe`
2. Choose installation directory (or use default)
3. Select shortcuts:
   - ✅ Create Desktop shortcut
   - ✅ Create Start Menu shortcut
4. Click "Install"
5. Click "Finish"

**Launch:**
- Double-click Desktop shortcut "Malwa CRM"
- OR: Start Menu → Malwa CRM

**Uninstall:**
- Control Panel → Programs → Uninstall a program
- Select "Malwa CRM" → Uninstall

---

### **Option 2: Portable Version**

**File:** `Malwa-CRM-Portable-2.0.0.exe`

**Usage:**
1. Copy file to any folder (Desktop, USB drive, etc.)
2. Double-click to run
3. No installation required
4. Data stored in same location as .exe

**Remove:**
- Delete the .exe file
- Delete AppData folder (if any)

---

## 🔐 Login & Use

### **Login Credentials:**

```
Email:    Shahidmultaniii@gmail.com
Password: S#d_8224
```

### **First Login:**

When you login for the first time:
1. ✅ User ID generated automatically
2. ✅ Profile created in IndexedDB
3. ✅ Redirected to Dashboard
4. ✅ All features unlocked

### **Features Available:**

**Customer Management:**
- Add, edit, delete customers
- Track balances and ledgers
- Opening balance support
- Search and filter

**Vendor Management:**
- Manage vendors
- Track purchases
- Vendor ledgers

**Supplier Management:**
- Supplier database
- Purchase tracking
- Credit management

**Labour Management:**
- Labour records
- Rate tracking
- Skill management

**Inventory:**
- Stock management
- Categories
- Stock movements

**Jobs:**
- Job creation
- Inspection
- Estimates
- Invoicing

**Accounts:**
- Ledgers
- Vouchers
- GST tracking
- Reports

**Settings:**
- Company master
- User management
- Multiplier settings
- Backup & restore

---

## 📚 Files & Documentation

### **Created Files:**

```
✅ electron/main.js                    Electron main process
✅ ELECTRON_BUILD_GUIDE.md             Complete build guide
✅ BUILD_DESKTOP_APP.txt               Quick reference
✅ ICON_SETUP.txt                      Icon instructions
✅ COMPLETE_SETUP_GUIDE.md             This file
✅ LOCAL_DATABASE_GUIDE.md             Database guide
✅ DATA_FLOW_GUIDE.md                  Data flow guide
```

### **Updated Files:**

```
✅ package.json                        Electron config added
✅ vite.config.js                      Build config updated
✅ src/lib/supabase.js                 Removed (local only)
✅ All stores (src/store/*.js)         IndexedDB integrated
```

---

## 🚨 Troubleshooting

### **Problem 1: "npm: command not found"**

**Cause:** Node.js not installed

**Fix:**
```
1. Download Node.js from https://nodejs.org
2. Install LTS version
3. Restart terminal
4. Run: node --version
```

---

### **Problem 2: "Cannot find package.json"**

**Cause:** Wrong directory

**Fix:**
```powershell
# Find package.json location
cd "C:\Users\YOUR_USERNAME\Desktop"
Get-ChildItem -Recurse -Filter "package.json" -Depth 3

# Navigate to correct folder
cd "correct-folder-path"
```

---

### **Problem 3: Build fails with errors**

**Cause:** Corrupted dependencies

**Fix:**
```powershell
# Clean install
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install

# Try build again
npm run electron:build:win
```

---

### **Problem 4: .exe won't run (Windows warning)**

**Cause:** Unsigned executable

**Fix:**
```
1. Right-click .exe file
2. Properties
3. Check "Unblock" at bottom
4. Apply → OK
5. Run .exe again

OR

Click "More info" → "Run anyway"
```

---

### **Problem 5: Port 5173 already in use**

**Cause:** Another app running on same port

**Fix:**
```powershell
# Find process using port 5173
netstat -ano | findstr :5173

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F

# Or close other running dev servers
# Or restart computer
```

---

### **Problem 6: Electron build takes too long**

**Cause:** Large node_modules, antivirus scanning

**Fix:**
```
1. Add project folder to antivirus exclusions
2. Close unnecessary programs
3. Use wired internet (faster download)
4. Be patient (3-5 minutes is normal)
```

---

## ✅ Verification Checklist

After setup, verify everything works:

**Web Version:**
- [ ] `npm run dev` starts server
- [ ] `http://localhost:5173` loads
- [ ] Login works
- [ ] Can add customer
- [ ] Data persists after refresh
- [ ] Dark mode works

**Desktop Build:**
- [ ] `npm run electron:build:win` completes
- [ ] `release` folder created
- [ ] `.exe` files exist (~120-150 MB)
- [ ] No error messages

**Desktop App:**
- [ ] Installer runs
- [ ] Desktop shortcut created
- [ ] App launches
- [ ] Login works
- [ ] All features work
- [ ] Data persists after close

---

## 🎯 Quick Command Reference

### **Essential Commands:**

```powershell
# Navigate to project
cd "C:\Users\YOUR_USERNAME\Desktop\Final-Crm-main"

# Install dependencies
npm install

# Run web version
npm run dev

# Build desktop app
npm run electron:build:win

# Check Node.js version
node --version

# Check npm version
npm --version

# Clean install
rm -rf node_modules && npm install
```

---

## 📊 What Gets Built

### **Development Files (Local):**

```
project-root/
├── node_modules/          600 MB (dependencies)
├── dist/                  2 MB (web build)
├── release/               300 MB (desktop builds)
│   ├── Malwa-CRM-Setup-2.0.0.exe
│   └── Malwa-CRM-Portable-2.0.0.exe
└── electron/              1 KB (Electron code)
```

### **User Installation (After Install):**

```
C:\Users\USERNAME\AppData\Local\Programs\Malwa CRM\
├── Malwa CRM.exe          ~180 MB
├── resources/
├── locales/
└── ...

Desktop:
└── Malwa CRM.lnk          (shortcut)

User Data:
C:\Users\USERNAME\AppData\Roaming\Malwa CRM\
└── IndexedDB/             1-50 MB (varies)
```

---

## 🎨 Customization (Optional)

### **Change App Name:**

Edit `package.json`:
```json
{
  "productName": "Your Company Name CRM",
  "version": "2.0.0"
}
```

Rebuild: `npm run electron:build:win`

---

### **Add Custom Icon:**

1. Create `build` folder in project root
2. Add icons:
   - `build/icon.ico` (256x256)
   - `build/icon.png` (512x512)
3. Rebuild: `npm run electron:build:win`

See `ICON_SETUP.txt` for details.

---

### **Change Window Size:**

Edit `electron/main.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1600,    // Change width
  height: 1000,   // Change height
  // ...
});
```

Rebuild: `npm run electron:build:win`

---

## 🌟 Key Features

### **Local-First Architecture:**
- ✅ No internet required
- ✅ Data never leaves your computer
- ✅ Fast performance
- ✅ Complete privacy
- ✅ No recurring costs

### **Full CRM Functionality:**
- ✅ Customer management
- ✅ Vendor management
- ✅ Supplier management
- ✅ Labour tracking
- ✅ Inventory system
- ✅ Job management
- ✅ Financial ledgers
- ✅ Reports & exports

### **Professional UI:**
- ✅ Modern design
- ✅ Dark mode
- ✅ Responsive layout
- ✅ Keyboard shortcuts
- ✅ Fast navigation

### **Desktop App Benefits:**
- ✅ Native Windows application
- ✅ Taskbar integration
- ✅ Desktop shortcut
- ✅ Professional installer
- ✅ Menu bar
- ✅ Full-screen mode

---

## 📞 Support & Contact

### **Technical Issues:**
- Email: malwatrolley@gmail.com
- Phone: +91 8224000822

### **Documentation:**
- ELECTRON_BUILD_GUIDE.md (detailed)
- LOCAL_DATABASE_GUIDE.md (database)
- DATA_FLOW_GUIDE.md (architecture)

### **Resources:**
- Node.js: https://nodejs.org
- Electron: https://www.electronjs.org
- Vite: https://vitejs.dev

---

## 🎉 Success!

If you've reached this point, congratulations!

**You now have:**
- ✅ Fully functional CRM web app
- ✅ Windows desktop application
- ✅ Professional installer
- ✅ Portable version
- ✅ Complete offline capability
- ✅ Zero monthly costs

**Share your app:**
1. Upload `.exe` to cloud storage
2. Share download link
3. Users install and use
4. No server needed!

---

## 🚀 Next Steps

### **For Development:**
- Make changes to code
- Test with `npm run dev`
- Build with `npm run electron:build:win`
- Share new version

### **For Distribution:**
- Copy `.exe` to USB drive
- Email to users
- Upload to cloud storage
- Share download link

### **For Production:**
- Consider code signing certificate
- Create user manual
- Setup auto-updates (optional)
- Gather user feedback

---

## 📝 Summary

### **3 Commands to Success:**

```powershell
# 1. Install
npm install

# 2. Build
npm run electron:build:win

# 3. Share
# Find in: release/Malwa-CRM-Setup-2.0.0.exe
```

**That's it!** Your professional desktop CRM is ready.

---

© 2025 Malwa Trolley CRM
Local-First • Privacy-Focused • No Cloud Required
Version 2.0.0 • Electron + React + IndexedDB

**Built with ❤️ for local businesses**

import { app, BrowserWindow } from 'electron'
import './NativeMenu'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
	global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
	? 'http://localhost:9080'
	: `file://${__dirname}/index.html`

function createWindow () {
	/**
	 * Initial window options
	 */

	mainWindow = new BrowserWindow({
		useContentSize: true,
		titleBarStyle: 'hidden',
		x: 2600,
		y: 570,
		height: 830,
		width: 1460,
	})

	mainWindow.loadURL(winURL)

	// Workaround for cut/copy/paste/close keybindings not working in devtools window on OSX
	if (process.platform === 'darwin') {
		mainWindow.webContents.on('devtools-opened', () => {
			mainWindow.webContents.devToolsWebContents.executeJavaScript(`
				window.addEventListener('keydown', function (e) {
					if (e.keyCode === 65 && e.metaKey) {
						document.execCommand('Select All');
					} else if (e.keyCode === 67 && e.metaKey) {
						document.execCommand('copy');
					} else if (e.keyCode === 86 && e.metaKey) {
						document.execCommand('paste');
					} else if (e.keyCode === 87 && e.metaKey) {
						window.close();
					} else if (e.keyCode === 88 && e.metaKey) {
						document.execCommand('cut');
					}
				});`)
		})
	}

	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow()
	}
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
	autoUpdater.quitAndInstall()
})

app.on('ready', () => {
	if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

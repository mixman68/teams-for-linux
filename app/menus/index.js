const { app, Menu, ipcMain } = require('electron');
const application = require('./application');
const preferences = require('./preferences');
const help = require('./help');
const Tray = require('./tray');
const fs = require('fs');
const path = require('path');

class Menus {
	constructor(window, config, iconPath) {
		this.window = window;
		this.iconPath = iconPath;
		this.config = config;
		this.shouldQuit = false;
		this.initialize();
	}

	quit() {
		this.shouldQuit = true;
		app.quit();
	}

	open() {
		if (!this.window.isVisible()) {
			this.window.show();
		}

		this.window.focus();
	}

	reload() {
		this.window.show();
		this.window.reload();
	}

	debug() {
		this.window.openDevTools();
	}

	hide() {
		this.window.hide();
	}

	purgeServiceWorker() {
		//Clear service
		const userDataPath = app.getPath('userData');
		const serviceWorkerPath = path.join(userDataPath,'Partitions',config.partition.replace('persist:',''),'Service Worker');
		if(fs.existsSync(serviceWorkerPath)){
			console.log('Service worker path exists, rm this');
			fs.rmdirSync(serviceWorkerPath, { recursive:true });
		}
		this.window.webContents.send('purge-service-worker');
	}

	initialize() {
		const appMenu = application(this);

		this.window.setMenu(Menu.buildFromTemplate([
			appMenu,
			preferences(),
			help(app, this.window),
		]));

		this.window.on('close', (event) => {
			if (!this.shouldQuit && !this.config.closeAppOnCross) {
				event.preventDefault();
				this.hide();
			} else {
				app.quit();
			}
		});

		//On mac no systray
		if (process.platform !== 'darwin') {
			new Tray(this.window, appMenu.submenu, this.iconPath);
		} else {
			//Menu for mac
			const menuMac = {
				label: app.getName(),
				submenu: [
					{ role: 'about' },
					{
						label: 'Fix Teams blank screen',
						click: () => this.purgeServiceWorker(),
					},
					{ type: 'separator' },
					{ role: 'services', submenu: [] },
					{ type: 'separator' },
					{ role: 'hide' },
					{ role: 'hideothers' },
					{ role: 'unhide' },
					{ type: 'separator' },
					{ role: 'quit' }
				]
			};
			Menu.setApplicationMenu(Menu.buildFromTemplate([
				menuMac,
				preferences(),
				help(app, this.window),
			]));
		}
	}
}

exports = module.exports = Menus;

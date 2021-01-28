const {ipcMain, app, Notification} = require('electron');

let notificationCount = 0;

exports.addDesktopNotificationHack = function addDesktopNotificationHack(iconPath) {
	ipcMain.on('notifications', async (e, msg) => {
		if (msg.count > 0 && msg.count > notificationCount) {
			notificationCount = msg.count
			const body = ((msg.text) ? `(${msg.count}): ${msg.text}` : `You got ${msg.count} notification(s)`);
			const notification = new Notification({
				title: 'Microsoft Teams',
				body: body,

			});
			notification.onclick = () => {
				window.show();
				window.focus();
			};
			if (notification.show !== undefined) {
				notification.show();
			}
		}
	});
};

exports.addBadgeCounter = function addBadgeCounter() {
	ipcMain.on('notifications', async (e, msg) => {
		app.setBadgeCount(msg.count);
	});
};
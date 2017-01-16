const path = require('path');
const fs = require('fs-extra');

var run = function ({cartoryType, backupDirPath, appendToFilename = ''}) {
	return new Promise(function (resolve, reject) {
		let fileName = path.join(backupDirPath, cartoryType + ' ' + appendToFilename + '.json');
		// console.log(`Seeing if exists and is available to write:\n${fileName}`);
		fs.access(fileName, fs.constants.R_OK | fs.constants.W_OK, err => {
			if (err) {
				if (err.code === 'ENOENT') {
					// console.warn(fileName, ', File does not exist');
					return resolve('CAN_CREATE_FILE');
				}
				console.error(`New file not acessible in path!`, fileName, err);
				return reject(`Err File generation ${cartoryType}`);
			}
			// console.log(`Backup file already exists!\n`, fileName);
			return reject('JSON_BACKUP_FILE_ALREADY_CREATED');
		});
	});
};

module.exports = run;

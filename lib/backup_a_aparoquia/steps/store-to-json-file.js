const path = require('path');
const fs = require('fs-extra');

var run = function ({cartoryType, data, backupDirPath, appendToFilename = ''}) {
	return new Promise(function (resolve, reject) {
		let fileName = path.join(backupDirPath, cartoryType + ' ' + appendToFilename + '.json');
		// console.log(`Trying to write:\n ${fileName}`);
		fs.outputJson(fileName, data, err => {
			if (err) {
				console.error(`New file not saved!`, fileName, err);
				return reject(`Err_File_generation`);
			}
			console.log(`${fileName} saved!`);
			return resolve('Saved');
		});
	});
};

module.exports = run;

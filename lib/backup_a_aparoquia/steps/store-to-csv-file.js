const path = require('path');
const fs = require('fs-extra');
const json2csv = require('json2csv');

var run = function ({cartoryType, data, backupDirPath, appendToFilename = ''}) {
	return new Promise(function (resolve, reject) {
		let fileName = path.join(backupDirPath, cartoryType + ' ' + appendToFilename + 'zzz.csv');
		// console.log(`Trying to write:\n ${fileName}`);
		var result = json2csv({data, del: ';'});
		fs.outputFile(fileName, '\ufeff' + result, err => {
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

const path = require('path');
const fs = require('fs-extra');
const converter = require('json-2-csv');

var run = function ({cartoryType, data, backupDirPath, appendToFilename = ''}) {
	return new Promise(function (resolve, reject) {
		let fileName = path.join(backupDirPath, cartoryType + ' ' + appendToFilename + 'zzz.csv');
		// console.log(`Trying to write:\n ${fileName}`);

		var options = {
			delimiter: {
				// wrap: '"', // Double Quote (") character
				field: ';', // Comma field delimiter
				array: '"\r\n"', // Semicolon array value delimiter
				eol: '\n' // Newline delimiter
			},
			prependHeader: true,
			sortHeader: false,
			trimHeaderValues: true,
			trimFieldValues: true
		};

		var json2csvCallback = function (err, csv) {
			if (err) {
				console.log(`tHE ERR in csv Generation ${err}`);
				return reject(`Err_CSV_generation`);
			}
			console.log(csv);
			fs.outputFile(fileName, '\ufeff' + csv, err => {
				if (err) {
					console.error(`New file not saved!`, fileName, err);
					return reject(`Err_File_generation`);
				}
				console.log(`${fileName} saved!`);
				return resolve('Saved');
			});
		};

		converter.json2csv(data, json2csvCallback, options);
	});
};

module.exports = run;

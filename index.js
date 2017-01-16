console.info(`Starting with NODE_ENV: ${process.env.NODE_ENV}`);

// this sets scope on current directory instead "c:\windows\system32" (for node-windows)
process.chdir(__dirname);

// require (...more) environment variables from the .env file
// (these will not override node-windows)
require('dotenv').config();

// Our Logger, current console-stamp only
require('./lib/log/index.js');

console.log(`NODE_ENV after '.env' file load: ${process.env.NODE_ENV}`);

const path = require('path');
const schedule = require('node-schedule');
const cronParser = require('cron-parser');
const moment = require('moment');
const cartories = require('./config/cartories.js');

const baseDirectory = path.join('./backups');
// const baseDirectory = 'c:/anydirectory';

const options = {
	headers:
	{
		authorization: 'Basic ' + Buffer.from(`${process.env.AParoquiaUsername}:${process.env.AParoquiaPassword}`).toString('base64'),
		// eslint-disable-next-line
		par_par_token: process.env.par_par_token
	}
};

let appendToFilename = (process.env.appendTimeOrDateToFilename === 'false') ? '' : moment().format(process.env.appendTimeOrDateToFilename);
// console.info(`"${appendToFilename}", will appended to EACH cartory filename`);

var BackupLib = require('./lib/backup_a_aparoquia/index.js');

/* A) Run now */
function runNow() {
	cartories.forEach(cartory => {
		appendToFilename = (process.env.appendTimeOrDateToFilename === 'false') ? '' : moment().format(process.env.appendTimeOrDateToFilename);
		return BackupLib.runBackup(
			{
				baseDirectory,
				cartoryType: cartory.cartoryType,
				url: cartory.url,
				requestType: cartory.requestType,
				options,
				// doAtCurrentTime: true,
				appendToFilename,
				parameterToMap: cartory.parameterToMap
			});
	});
}

/**/

/* B) Run scheduled  */
function runScheduled() {
	let CronBackup = process.env['cron_backup_' + process.env.NODE_ENV];
	let CronTerminate = process.env['cron_terminate_' + process.env.NODE_ENV];
	const JobName = `"JSON Backup from AParoquia"`;
	console.log(`\nStarting ${JobName} @ ${moment().format('YYYY-MM-DD')} in mode: ${process.env.NODE_ENV}
		# Cron_Terminate_rule: ${CronTerminate} \t # Cron_Backup_Rule: ${CronBackup}
		Next Backup @ ${cronParser.parseExpression(CronBackup).next()}
		Next Terminate @ ${cronParser.parseExpression(CronTerminate).next()}`);

	// Check: http://crontab.guru/#52-59/2_12_*_*_*     look .env values
	// At every 52, 54, 56 and 58th minute past the 12th hour.

	var job = schedule.scheduleJob(CronBackup, function () {
		console.log(`\nStarting backup Job @ ${moment().format('YYYY-MM-DD @ HH:mm')}\n`);
		appendToFilename = (process.env.appendTimeOrDateToFilename === 'false') ? '' : moment().format(process.env.appendTimeOrDateToFilename);
		console.info(`"${appendToFilename}", will appended to EACH cartory filename`);
		cartories.forEach(cartory => {
			return BackupLib.runBackup(
				{
					baseDirectory,
					cartoryType: cartory.cartoryType,
					url: cartory.url,
					requestType: cartory.requestType,
					options,
					// doAtCurrentTime: true,
					appendToFilename,
					parameterToMap: cartory.parameterToMap
				});
		});
	});

	// Exit process smoothly
	var terminate_job = schedule.scheduleJob(CronTerminate, function () {
		console.log('Starting Terminate Job @', moment().format('YYYY-MM-DD @ HH:mm'));
		process.exit(0);
	});
}
/**/

runNow();
// runScheduled();

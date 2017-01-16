const path = require('path');
const moment = require('moment');
const createBackup = require('./steps/create-backup');
const storeToJSONFile = require('./steps/store-to-json-file');
const storeToCSVFile = require('./steps/store-to-csv-file');
const fileExists = require('./steps/file-exists-for-today.js');

/**
 * Cria um ficheiro JSON por cada tipo de cartório na directoria baseDirectory/ano/mês/dia
 * @params {String} baseDirectory - O directorio base onde irão ser guardados os ficheiros
 * @params {String} cartoryType - 'baptisms' || 'casamentos' || 'crismas' || 'funerals'
 * @params {String} url - O URL onde vai buscar a informação (executar request)
 * @params {Object} options - Os headers que vão ser utilizados (autenticação)
 * @params {String} parameterToMap - Qual o nome do campo que vai ser mapeado, para executar o segundo request default: 'ano'
 * @params {Boolean} doAtCurrentTime - Se cria uma directoria com "Horas-minutos" para guardar os ficheiros
 * @params {Boolean} appendCurrentTimeToFilename - Se cria o ficheiro com o cartório correspondete + "Horas-minutos"
 * @returns {String} 'DONE' || 'NOT_DONE'
 */
var runBackup = function ({baseDirectory, cartoryType, url, requestType, options, parameterToMap, doAtCurrentTime, appendToFilename}) {
	const year = moment().format('YYYY');
	const month = moment().format('MM');
	const day = moment().format('DD');
	const hours = doAtCurrentTime ? moment().format('HH-mm') : '';
	const backupDirPath = path.join(baseDirectory, year, month, day, hours);

	fileExists({cartoryType, backupDirPath, appendToFilename})
	.then(() => createBackup({cartoryType, url, requestType, options, parameterToMap}))
	.then(data => storeToJSONFile({cartoryType, data, backupDirPath, appendToFilename}))
	// .then(data => storeToCSVFile({cartoryType, data, backupDirPath, appendToFilename}))
	.then(/*data => data; console.log('data inside promisse', data)*/)
	.catch(err => {
		if (err === 'JSON_BACKUP_FILE_ALREADY_CREATED') {
			console.log(`'${cartoryType}' already exists in ${backupDirPath}!`);
		}
		else {
			console.log(`Error ${cartoryType} message ${err}`);
		}
	});
};
module.exports = {runBackup, fileExists};

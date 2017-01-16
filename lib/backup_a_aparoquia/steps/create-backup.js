const axios = require('axios');
const _ = require('lodash');

var run = function ({cartoryType, url, requestType = 'GET', options, parameterToMap = 'ano'}) {
	return new Promise(function (resolve, reject) {
		options.method = requestType;
		axios.get(url, options)
		.then(function (response) {
			// console.log(`'${parameterToMap}' de '${cartoryType}'`, response.data);
			let urlArray = _.compact(_.map(response.data, parameterToMap));
			// console.log(`${cartoryType} urlArray`, urlArray);

			let promiseArray = urlArray.map(mappedParameter => axios.get(url + '/' + mappedParameter, options));
			axios.all(promiseArray)
			.then(function (results) {
				let temp = _.flatten(results.map(r => r.data));
				return resolve(temp);
				// console.log('All baptisms', temp);
			})
			.catch(function (err) {
				console.log(`Err catching all ${cartoryType}`, err);
				return reject(`Err catching all ${cartoryType}`);
			});
		})
		.catch(function (err) {
			console.log(`Err making first request to ${cartoryType}`, err);
			return reject(`Err making first request to ${cartoryType}`);
		});
	});
};

module.exports = run;

var moment = require('moment');

moment.locale('pt');
require('console-stamp')(console, {
	metadata: function () {
		return ('[' + process.memoryUsage().rss + ']');
	},
	colors: {
		stamp: 'yellow',
		label: 'white',
		metadata: 'green'
	},
	formatter: function () {
		return moment().format('LLLL');
	}
});

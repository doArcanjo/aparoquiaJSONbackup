var path = require('path')//,
    // jf = require('jsonfile');

var env_args_path = path.normalize(__dirname +'/..'+ '/service_environment.json');
var service_name_path = path.normalize(__dirname + '/..'+ '/service_name.json');
var moduleToRunPath = path.normalize(__dirname + '/services/WinService');
var TerminalPath = path.normalize(__dirname + '/services/BlessedListTerminal');

var env_args = require(env_args_path);
var service_name = require(service_name_path);

console.log(service_name , 'env_args',env_args)

require(TerminalPath).init(moduleToRunPath, service_name, env_args);

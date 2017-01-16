var nodeEnvironment = require('node-windows'),
    Service = nodeEnvironment.Service,
    path = require('path'),
    util = require("util"),
    events = require("events"),
    moment = require('moment');

var LogInConsoleCurrentDateTime = function(message) {

    var myReadableJsonForLog = JSON.stringify(message, undefined, 2);
    var dateOfLog = moment().format('YYYY-MM-DD@HH:mm') + '\t: ';
    var dataToappend = dateOfLog + myReadableJsonForLog;
    console.log(dataToappend);

};

var getObjects = function(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == '') {
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1) {
                objects.push(obj);
            }
        }
    }
    return objects;
};


module.exports = function(env_args, names_obj) {

    //    ------  Comunication Part   -----
    // This will create a stream where we will
    // pass the messages
    console.log("names_obj", names_obj);

    function MyStream() {
        events.EventEmitter.call(this);
    }

    util.inherits(MyStream, events.EventEmitter);

    MyStream.prototype.writeToOutput = function(data) {
        this.emit("writeToOutput", data);
    };

    var stream = new MyStream();

    var writeToOutput = function(outputResult) {
        stream.writeToOutput(outputResult);

    };

    var searchProcess = function() {
        nodeEnvironment.list(function(svc) {
            var myEXEOfService = getObjects(svc, 'ImageName', names_obj.svc_name.toLowerCase() + '.exe');
            // console.log("myEXEOfService :" + JSON.stringify(myEXEOfService));
            writeToOutput(JSON.stringify(myEXEOfService));
        }, true);
    };


    var searchAndKillProcess = function() {
        nodeEnvironment.list(function(svc) {
            var myEXEOfService = getObjects(svc, 'ImageName', names_obj.svc_name.toLowerCase() + '.exe');

            if (myEXEOfService[0] && myEXEOfService[0].PID) {
                writeToOutput("myEXEOfService PID:" + myEXEOfService[0].PID);
                nodeEnvironment.kill(myEXEOfService[0].PID, true, function(err) {
                    if (err) {
                        writeToOutput('ERR killing:' + myEXEOfService[0].ImageName + ", with PID: " + myEXEOfService[0].PID);
                        writeToOutput('Msg:' + err);
                    } else {
                        writeToOutput(myEXEOfService[0].ImageName + ", with PID: " + myEXEOfService[0].PID + ", was shut off");
                    }
                });
            }else{
                 writeToOutput("The Service: \n" +  names_obj.svc_name.toLowerCase().white.bold + '.exe'.white.bold+"\nisn't running".red );
            }
            // console.log("myEXEOfService PID:"+JSON.stringify(myEXEOfService));

        }, true);
    };


    // -------------    WinService Part    ------------------
    var PathToNodeRunnable = path.join(__dirname ,'../../../' , 'index.js');
    console.log("PathToNodeRunnable:" + PathToNodeRunnable);
    var confService = {
        name: names_obj.svc_name,
        description: names_obj.big_name + ' made with Node, running @ Windows. Configuration: '+env_args[1].value,
        script: PathToNodeRunnable,
        env: env_args,
        maxRestarts: 12,
        wait: 5,
        grow: .1
    };
    // ,
    //     wait: 5,
    //     grow: .5
    var svc = new Service(confService);




    function restartService() {

        //FOD***** isto quando o windows recomeça...
        // OU SEJA AS COM PORTS VÃO ESTAR OCUPADAS
        // E O SERVIÇO VAI BLOQUEAR ESTA ***** TODA

        /* process.on('uncaughtException', function(err) {
            // handle the error safely
            writeToOutput("Yey restartservice");
        });*/


        try {
            if (svc && svc.exists) {
                svc.start();
            } else {
                svc = new Service(confService);
                svc.start();
                writeToOutput("The Service: \n" + svc.name.red + "\n isn't instaled");
            }

        } catch (err) {
            /*svc = new Service(confService);
             svc.start();*/
            writeToOutput(err);
            LogInConsoleCurrentDateTime(err);
        }

        // try {
        //     if (svc && svc.exists) {
        //         //console.log("!!!!! Exists ");
        //         svc.restart();
        //         writeToOutput("The Service: \n" + (svc.name).cyan + "\n is restarting...");
        //     } else
        //         writeToOutput("The Service: \n" + svc.name.cyan.bold + "\n isn't instaled");
        // } catch (err) {
        //     // handle the error safely
        //     //console.log(err);
        //     writeToOutput(err);
        // }
    }

    function uninstallService() {
        /*    process.on('uncaughtException', function(err) {
            // handle the error safely
            writeToOutput("uninstallService");
        });*/
        try {
            if (svc && svc.exists) {
                //console.log("!!!!! Exists");          
                //svc.removeAllListeners() ;
                svc.uninstall();
            } else
                writeToOutput("The Service: \n" + svc.name.red + "\n isn't instaled");
        } catch (err) {
            // handle the error safely
            //console.log(err);
            writeToOutput(err);
        }
    }

    function installService(cb) {
        /*    process.on('uncaughtException', function(err) {
            // handle the error safely
            writeToOutput("Yey instalation");
        });
        process.on('error', function(err) {
            // handle the error safely
            writeToOutput("Yey instalation error");
        });*/

        try {
            svc.install();
        } catch (err) {
            // handle the error safely
            svc = new Service(confService);
            svc.install();
            //console.log(err);
            writeToOutput(err);
        }
        if (cb) cb();
    }

    function startService() {
        /*    process.on('uncaughtException', function(err) {
            // handle the error safely
            writeToOutput("Yey instalation");
        });
        process.on('error', function(err) {
            // handle the error safely
        writeToOutput("Yey instalation error");
        });*/
        try {
            if (svc && svc.exists) {
                svc.start();
            } else {
                svc = new Service(confService);
                svc.start();
                writeToOutput("The Service: \n" + svc.name.red + "\n isn't instaled");
            }

        } catch (err) {
            /*svc = new Service(confService);
             svc.start();*/
            writeToOutput(err);
            LogInConsoleCurrentDateTime(err);
        }
    }

    function stopService() {
        try {
            if (svc && svc.exists) {
                svc.stop();
            } else {
                writeToOutput("The Service: \n" + svc.name.red + "\n isn't instaled");
            }

        } catch (err) {
            // handle the error safely
            /*svc = new Service(confService);
                svc.install();
                console.log(err);*/
            writeToOutput(err);
        }
    }


    //------------------------------------   Events Catched from Node-Windows     ------------------------------- 

    svc.on('install', function() {
        writeToOutput("Installation of the service: \n" + svc.name + "\n has been completed!");

    });

    svc.on('alreadyinstalled', function() {
        writeToOutput(svc.name + "\nis already installed!" + "\n... just Starting it!");
    });

    svc.on('invalidinstallation', function() {
        writeToOutput("Installation of " + svc.name + "\nis detected, \nbut are missing required files");
    });

    svc.on('uninstall', function() {
        writeToOutput("Uninstall of the service: \n".red + svc.name + "\n has been completed!");
    });

    svc.on('start', function() {
        writeToOutput("Service: \n" + svc.name.red + "\n has started successfully!");
    });

    svc.on('stop', function(cb) {
        //console.log("Stop @ WinService, CB is:" + JSON.stringify(cb, undefined, 2));
        //console.log("Stop @ WinService, we are NOT going to restart the service");

        writeToOutput("Stop of the service: \n" + svc.name + "\n has been completed!");
    });

    svc.on('error', function(cb) {
        console.log("Error @ WinService CB, is:" + JSON.stringify(cb, undefined, 2));
        console.log("Error @ WinService, we are going to restart the service");
        /* DONT THERE ARE SOME ERRRORS WE WANT TO SHOW AND DONT NEED TO RESTART 
         */
        setTimeout(function() {

            restartService();
        }, 5000);
        writeToOutput("Ocurred some strange Behivour at: \n" + svc.name + "\n ");
    });


    // Instead of the Switch Stament of "ExecucuteNodeServiceOperation"
    // we can map our functions this way

    //Start Service is not doing what expected... Restart Service is
    //so  KITA -->    'Start Service': startService,
    var ServiceActions = {
        'Install Service': installService,
        'Start Service': startService,
        'Restart Service': restartService,
        'Stop Service': stopService,
        'Uninstall Service': uninstallService,
        'searchProcess': searchProcess,
        'searchAndKillProcess': searchAndKillProcess
    };

    //The list of comands we will expose to use in our blessed terminal
    var commandsAvailable = Object.keys(ServiceActions);

    module.ServiceActions = ServiceActions;
    module.commandsAvailable = commandsAvailable;
    module.stream = stream;

    return module;

};

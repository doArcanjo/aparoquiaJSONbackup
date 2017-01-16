var init = function(ModulePath, names ,env_args) {

    var eventemitter = require('events').EventEmitter;
    var blessed = require('blessed');
    // var prettyjson = require('prettyjson');
    var terminalScreen = blessed.screen();

    //TODO change to service instead for other platforms
    /*var WinService = require('./WinService');
var commandsAvailable=WinService.commandsAvailable;
WinService.stream.on('writeToOutput',writeToOutputBox);*/

    var WinService = require(ModulePath)(env_args,names);
    var commandsAvailable = WinService.commandsAvailable;
    WinService.stream.on('writeToOutput', writeToOutputBox);

    //------------------    Pretty Console Part ------------------------------

    //CLS on windows... and all
    var lines = process.stdout.getWindowSize()[1];
    for (var i = 0; i < lines; i++) {
        console.log('\r\n');
    }

    //Writes to Outputbox and re-renders the screen
    //Outputbox = "Our Component to display Outputs"

    function writeToOutputBox(msg) {

        Outputbox.setContent(msg.toString());
        terminalScreen.render();
    }

    terminalScreen.append(blessed.text({
        top: 0,
        left: 0,
        width: '100%',
        //bg: 'blue',
        content: '{green-fg}' + names.big_name + '{/green-fg} {red-fg,ul}Setup Manager{/red-fg,ul}',
        bg: '#0000ff',
        // bg: blessed.colors.match('#0000ff'),
        tags: true,
        align: 'center'
    }));


    terminalScreen.append(blessed.line({
        orientation: 'horizontal',
        top: 1,
        left: 0,
        right: 0
    }));

    terminalScreen.append(blessed.text({
        top: 2,
        left: 0,
        border: {
            type: 'line'
        },
        width: '66%',
        //bg: 'blue',
        content: '{green-fg}{/green-fg} Use the arrows! {red-fg,ul}To exit hit \'Esc\', \'q\' or Ctrl+C{/red-fg,ul}',
        bg: '#00ffff',
        // bg: blessed.colors.match('#0000ff'),
        tags: true,
        align: 'left'
    }));



    var list = blessed.list({
        parent: terminalScreen,
        width: '50%',
        height: '50%',
        top: 'center',
        left: 'center',
        align: 'center',
        fg: 'blue',
        border: {
            type: 'line'
        },
        selectedBg: 'green',
        mouse: true,
        keys: false

    });

    var input = blessed.textbox({
        label: ' Comand Choosen ',
        content: ' ',
        fg: 'green',
        bg: 'default',
        barBg: 'default',
        barFg: 'blue',
        border: {
            type: 'ascii',
            fg: 'default',
            bg: 'default'
        },
        width: '30%',
        height: 3,
        right: 0,
        top: 2,
        keys: true
    });

    var producedByBox = blessed.box({
        fg: 'green',
        bg: 'default',
        content: '  Paroquia Costa de Caparica ',
        label: ' Made for ',
        barBg: 'green',
        barFg: 'blue',
        border: {
            type: 'none',
            fg: 'default',
            bg: 'default'
        },
        width: '33%',
        height: 3,
        right: 0,
        bottom: 1
    });




    list.setItems(commandsAvailable);

    list.prepend(new blessed.Text({
        left: 9,
        content: ' Select one option:',

    }));


    if (terminalScreen.autoPadding) {
        list.children[0].rleft = -list.ileft + 2;
        list.children[0].rtop = -list.itop;
    }

    //Creating Our Output Box use it the Service
    var Outputbox = blessed.box({
        fg: 'green',
        bg: 'default',
        content: 'Waiting for Command...',
        label: 'Execution Status',
        barBg: 'green',
        barFg: 'blue',
        border: {
            type: 'line',
            fg: 'default',
            bg: 'default'
        },
        width: '46%',
        height: 5,
        left: 0,
        bottom: 1
    });


    // Select the first item.
    list.select(0);

    // Append our box to the terminalScreen.
    terminalScreen.append(Outputbox);
    terminalScreen.append(list);
    terminalScreen.append(input);
    terminalScreen.append(producedByBox);


    //doesn't work on windows cmd
    list.on('wheeldown', function() {
        list.down();
        terminalScreen.render();
        //console.log("wheeldown");
    });

    //doesn't work on windows cmd
    list.on('wheelup', function() {
        list.up();
        //console.log("wheelup");
        terminalScreen.render();
    });

    //doesn't work on windows cmd
    //change mouseup?
    list.on('element click', function(el, data) {
        var OperationToDo = list.ritems[list.selected];
        input.setContent("  " + OperationToDo);
        WinService.ServiceActions[OperationToDo]();
        terminalScreen.render();
    });

    // List keys are disabled on List
    list.on('keypress', function(ch, key) {
        if (key.name === 'up' || key.name === 'k') {
            list.up();
            terminalScreen.render();
            return;
        } else if (key.name === 'down' || key.name === 'j') {
            list.down();
            terminalScreen.render();
            return;
        }
    });


    list.key('enter', function() {
        var OperationToDo = list.ritems[list.selected];
        input.setContent("  " + OperationToDo);
        //terminalScreen.render();
        list.focus();
        //This instead of Switch statement in "ExecucuteNodeServiceOperation"
        WinService.ServiceActions[OperationToDo]();
        //ExecucuteNodeServiceOperation(OperationToDo);
        terminalScreen.render();

    });

    // Quit on Escape, q, or Control-C.
    terminalScreen.key(['escape', 'q', 'C-c'], function(ch, key) {
        return process.exit(0);
    });


    list.focus();
    terminalScreen.render();
};

module.exports = {
    init: init
};

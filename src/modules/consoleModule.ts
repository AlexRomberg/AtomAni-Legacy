// consoleModule.ts
//---------------------------------------------------
// custom Node.js module to colorize console output
//
// © Alexander Romberg @ KFTG (IMS)
//---------------------------------------------------

import ConfigFile from 'config';
const LogLevel: number = ConfigFile.has('settings.loglevel') ? ConfigFile.get('settings.loglevel') : 1;

function log(color: ("reset" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white"), text: string): void {
    let colors = {
        "reset": "\x1b[0m",
        "black": "\x1b[30m",
        "red": "\x1b[31m",
        "green": "\x1b[32m",
        "yellow": "\x1b[33m",
        "blue": "\x1b[34m",
        "magenta": "\x1b[35m",
        "cyan": "\x1b[36m",
        "white": "\x1b[37m"
    };
    console.log(colors[color] + "%s" + colors.reset, text);
};

function info(intput: string) {
    if (LogLevel > 2) {
        log("green", intput);
    }
}
function warn(intput: string) {
    if (LogLevel > 1) {
        log("yellow", intput);
    }
}
function error(intput: string) {
    if (LogLevel > 0) {
        log("red", intput);
    }
}

export default { log, info, warn, error };
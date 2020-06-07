const { spawn } = require("child_process");

const isWindows = () => {
    return process.platform === "win32";
};

const getNpxCmd = () => {
    return isWindows ? "npx.cmd" : "npx";
};

const shellNpxScript = (scriptName, scriptArgs, excludeNoInstall) => {
    const scriptCmdLine = `${scriptName} "${scriptArgs}"`;
    const p = spawn(getNpxCmd(), [scriptName, scriptArgs]);
    p.on("exit", function(code) {
        const options = excludeNoInstall ? "" : "--no-install ";
        const shellCmd = "`npx " + options + scriptCmdLine + "`";
        if (code !== 0) {
            console.error(`${shellCmd} failed with error code: ${code}`);
            process.exit(code);
        } else {
            console.info(`${shellCmd} successful.`);
            process.exit(0);
        }
    });
    p.stdout.on("data", (data) => {
        console.info(data.toString("ascii"));
    });
    p.stderr.on("data", (data) => {
        console.error(data.toString("ascii"));
    });
    p.on("error", (error) => {
        console.error(error.message);
    });
    p.on("close", (code) => {
        console.log("process exiting with code: " + code);
    });
};

module.exports = {
    shellNpxScript
};

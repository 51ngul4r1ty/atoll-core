const webpack = require("webpack");
const rimraf = require("rimraf");
const chalk = require("chalk");
const { choosePort } = require("react-dev-utils/WebpackDevServerUtils");
const webpackConfig = require("../config/webpack.config.js")(process.env.NODE_ENV || "production");
const paths = require("../config/paths");
const { logMessage, compilerPromise, sleep } = require("./utils");

const HOST = process.env.HOST || "http://localhost";

const generateStaticHTML = async () => {
    const nodemon = require("nodemon");
    const fs = require("fs");
    const puppeteer = require("puppeteer");
    const PORT = await choosePort("localhost", 8505);

    process.env.PORT = PORT;

    const script = nodemon({
        script: `${paths.serverBuild}/server.js`,
        ignore: ["*"]
    });

    script.on("start", async () => {
        try {
            // TODO: add try/wait/retry here instead of just generally waiting for 2000 ms
            await sleep(2000);
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(`${HOST}:${PORT}`);
            const pageContent = await page.content();
            fs.writeFileSync(`${paths.clientBuild}/index.html`, pageContent);
            await browser.close();
            script.emit("quit");
        } catch (err) {
            script.emit("quit");
            console.log(err);
        }
    });

    script.on("exit", (code) => {
        process.exit(code);
    });

    script.on("crash", () => {
        process.exit(1);
    });
};

const build = async () => {
    rimraf.sync(paths.clientBuild);
    rimraf.sync(paths.serverBuild);

    const includesServer = webpackConfig.length > 1;

    let clientConfig;
    let serverConfig;
    let multiCompiler;

    if (includesServer) {
        [clientConfig, serverConfig] = webpackConfig;
        multiCompiler = webpack([clientConfig, serverConfig]);
    } else {
        [clientConfig] = webpackConfig;
        multiCompiler = webpack([clientConfig]);
    }

    const clientCompiler = multiCompiler.compilers.find((compiler) => compiler.name === "client");
    let serverCompiler;
    if (includesServer) {
        serverCompiler = multiCompiler.compilers.find((compiler) => compiler.name === "server");
    }

    const clientPromise = compilerPromise("client", clientCompiler);
    let serverPromise;
    if (includesServer) {
        serverPromise = compilerPromise("server", serverCompiler);
    }

    if (includesServer) {
        serverCompiler.watch({}, (error, stats) => {
            if (!error && !stats.hasErrors()) {
                console.log(stats.toString(serverConfig.stats));
                return;
            }
            console.error(chalk.red(stats.compilation.errors));
        });
    }

    clientCompiler.watch({}, (error, stats) => {
        if (!error && !stats.hasErrors()) {
            console.log(stats.toString(clientConfig.stats));
            return;
        }
        console.error(chalk.red(stats.compilation.errors));
    });

    // wait until client and server is compiled
    try {
        if (includesServer) {
            await serverPromise;
        }
        await clientPromise;
        // TODO: See if this is required for SSR or not
        // if (includesServer) {
        //     await generateStaticHTML();
        // }
        logMessage("Done!", "info");
        process.exit(0);
    } catch (error) {
        logMessage(error, "error");
        process.exit(1);
    }
};

build();

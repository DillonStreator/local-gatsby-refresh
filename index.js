const http = require("http");
const lt = require("localtunnel");
const chalk = require("chalk");

const {
    PORT = 3131,
    GATSBY_PORT = 8000,
    SUBDOMAIN,
} = process.env;

http.createServer((req, res) => res.end()).listen(PORT);

(async () => {
    console.log('attempting to open tunnel...');
    try {
        const tunnel = await lt({ port: PORT, subdomain: SUBDOMAIN });
        console.log('tunnel opened...');
        console.log('Your webhook url is: ', chalk.cyanBright(tunnel.url));

        tunnel.on('request', (info) => {
            console.log(info);
            http.request({
                hostname: 'localhost',
                port: GATSBY_PORT,
                path: '/__refresh',
                method: "POST",
            }, (res) => {
                if (res.statusCode == 200) {
                    console.log('updated');
                }
            })
            .on('error', console.error)
            .end();
        });

        tunnel.on('error', (err) => {
            console.error(err)
        });

        tunnel.on('close', () => {
            console.log('closed tunnel...');
        });
    } catch (error) {
        console.log(chalk.red(error));
    }
})();

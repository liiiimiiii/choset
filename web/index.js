const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const { exec, execSync } = require('child_process');
const port = process.env.SERVER_PORT || process.env.PORT || 3000;        
const NEZHA_SERVER = process.env.NEZHA_SERVER || '8xix888xix8.kunei.eu.org';     
const NEZHA_PORT = process.env.NEZHA_PORT || '443';
const NEZHA_KEY = process.env.NEZHA_KEY || '111111';

// root route
app.get("/", function(req, res) {
  res.send("Hello world!");
});


app.use('/xyz', createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true,
  pathRewrite: {
    '^/xyz': '/',
  }
}));

const metaInfo = execSync(
  'curl -s https://speed.cloudflare.com/meta | awk -F\\" \'{print $26"-"$18}\' | sed -e \'s/ /_/g\'',
  { encoding: 'utf-8' }
);
const ISP = metaInfo.trim();

// run-nezha
let NEZHA_TLS = '';
if (NEZHA_SERVER && NEZHA_PORT && NEZHA_KEY) {
  const tlsPorts = ['443', '8443', '2096', '2087', '2083', '2053'];
  if (tlsPorts.includes(NEZHA_PORT)) {
    NEZHA_TLS = '--tls';
  } else {
    NEZHA_TLS = '';
  }
  const command = `nohup ./swith -s ${NEZHA_SERVER}:${NEZHA_PORT} -p ${NEZHA_KEY} ${NEZHA_TLS} >/dev/null 2>&1 &`;
  try {
    exec(command);
    console.log('swith is running');

    setTimeout(() => {
      runWeb();
    }, 2000);
  } catch (error) {
    console.error(`swith running error: ${error}`);
  }
} else {
  console.log('NEZHA variable is empty, skip running');
  runWeb();
}

function runWeb() {
  const command1 = `nohup ./web -c ./web.json >/dev/null 2>&1 &`;
  exec(command1, (error) => {
    if (error) {
      console.error(`web running error: ${error}`);
    } else {
      console.log('web is running');

      setTimeout(() => {
        runServer();
      }, 2000);
    }
  });
}

app.listen(port, () => console.log(`App is listening on port ${port}!`));

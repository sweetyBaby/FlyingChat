const http = require('http');
const Koa = require('koa');
const helmet = require('koa-helmet');
const cors = require('koa-cors');
const responseTime = require('koa-response-time');
const body = require('koa-body');
const logger = require('koa-logger');
const { errorHandler } = require('./middlewares');
const { util } = require('./common');
const config = require('./config');
const { commonBiz, socketIOBiz } = require('./bizs');

const app = new Koa();
app.keys = [config.sessionSecret];
app.use(logger());
app.use(errorHandler({ env: config.debug ? 'development' : 'production' }));
app.use(responseTime());
app.use(helmet());
app.use(cors());
app.use(body({ multipart: true }));

app.use(commonBiz.setUser);
// Load routes
util.loadRoutes(app, config.routesPath);

process.on('uncaughtException', err => {
  console.error('uncaughtException', err);
});

const server = http.createServer(app.callback());
const io = require('socket.io')(
  server,
  Object.assign({ handlePreflightRequest: socketIOBiz.handlePreflightRequest }, config.socketOpt)
);
global.io = io; // register to global
socketIOBiz.initSocketIOBiz(); // 初始化Socket.io逻辑
server.listen(config.port, err => {
  const addr = server.address();
  console.log(`Server started at ${addr.address}:${addr.port}...`);
});

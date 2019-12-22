import * as express from 'express';
import * as bodyParser from 'body-parser';
import { CronJob } from 'cron';
import { Handler } from './route/handler';
import { Authentication } from './route/authentication';
import { Router } from './route/router';
import { HOSTPORT, MS } from './config';
import { Tickets } from './service/tickets';
import { TaskManager } from './task/task.manager';
import { Log } from './common/log';
import { G } from './gorm/gorm';
import { Articles } from './service/articles';
import { ID } from './common/id';
import { Messages } from './service/messages';
import { Favors } from './service/favor';
import { MasterSlaver, SlaverStartTasks } from './service/master.slaver';


// const a = require('request-promise-native')(
//     {
//         method: 'POST', 
//         url: `${MS.MASTER.ADDR}/master/restore/tickets`,
//         headers: {
//             'Accept-Encoding': 'gzip',
//             'Authorization': `Bearer ${Authentication.instance._sign(MS.MASTER.SIGNATURE)}`,
//         }
//     },(a,b,c)=>{
//         console.log(a,b,c);
//     }
// )

const app = express();
app.use('/', express.static('./assets', {
    setHeaders: function(res, path) {
        res.set("Access-Control-Allow-Origin", "*");
    }
}) );
//app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' })); // for parsing application/json
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // for parsing application/x-www-form-urlencoded
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
    if (req.method == 'OPTIONS') {
        res.send(200);
    }else {
        next();
    }
});


// var tm = null;


const setup = async () =>{
    await G.connect();
    const HandlerFactory : Handler[] = [
        Authentication.instance,
        MasterSlaver.instance,
        Tickets.instance,
        Articles.instance,
        Messages.instance,
        Favors.instance
    ];
    for(let i = 0 ; i < HandlerFactory.length ; i ++ ){
        var h = <Handler>HandlerFactory[i];
        var routers = await h.routers();
        routers.forEach(router => {
            router.process(app);
        })
    }
}

// run app
const server = app.listen(HOSTPORT, async () => {
    try{
        await setup();
        Log.info(`${(MS.MASTER.ONLINE? 'MASTER ':'')} ${(MS.MASTER.ONLINE? 'SLAVER ': '')} Listening at http://${server.address().address}:${server.address().port}`);
    }catch(e){
        Log.error(JSON.stringify(e));
    }    
});
server.on('connection', function(socket) {
    Log.info(`master connection was made by a client(${socket.remoteAddress}:${socket.remotePort}).`);
    socket.setTimeout(120 * 1000); 
    // 30 second timeout. Change this as you see fit.
    socket.on('data',function(data){
    });
    socket.on('end',function(data){
    });
});

if(MS.SLAVER.ONLINE){
    const slaver_web = express();
    slaver_web.use('/', express.static('../web/dist', {index: "index.html"}) );
    const slaver_server = slaver_web.listen(80, async () => {
        Log.info(`SLAVER WEB Listening at http://${slaver_server.address().address}:${slaver_server.address().port}`);
    });
    slaver_server.on('connection', function(socket) {
        Log.info(`slaver connection was made by a client(${socket.remoteAddress}:${socket.remotePort}).`);
    });
    const job = new CronJob({
        cronTime: '00 00 */12 * * 0-6',
        onTick: async () => {  setTimeout(async ()=> {await SlaverStartTasks.instance.handle('tickets',null);},5000); },
        runOnInit: true
    });
    job.start();
}
//
//wget https://nodejs.org/dist/v12.14.0/node-v12.14.0-linux-x64.tar.xz
//tar -xvf node-v12.14.0-linux-x64.tar.xz
//ln -s ~/node-v12.14.0-linux-x64/bin/node /usr/local/bin/node
//ln -s ~/node-v12.14.0-linux-x64/bin/npm /usr/local/bin/npm
//ln -s ~/node-v12.14.0-linux-x64/bin/tsc /usr/local/bin/tsc
//ln -s ~/node-v12.14.0-linux-x64/bin/tsserver /usr/local/bin/tsserver
//ln -s ~/node-v12.14.0-linux-x64/bin/pm2 /usr/local/bin/pm2
//npm install -g pm2

//https://dev.mysql.com/downloads/repo/yum/
//wget https://dev.mysql.com/get/mysql57-community-release-el7-9.noarch.rpm
//rpm -ivh mysql57-community-release-el7-9.noarch.rpm
//yum install mysql-server
//systemctl start mysqld
//grep 'temporary password' /var/log/mysqld.log
//mysql_secure_installation

//npm clean-install
//npm install request
//npm install mysql
//npm install typescript

//pm2 start bin/app.js --node-args="--experimental-worker"

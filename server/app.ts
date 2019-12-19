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
const HandlerFactory : Handler[] = [
    Authentication.instance,
    MasterSlaver.instance,
    Tickets.instance,
    Articles.instance,
    Messages.instance,
    Favors.instance
];
// register all application routes
async function setup(app){
    await G.connect();
    for(let i = 0 ; i < HandlerFactory.length ; i ++ ){
        var h = <Handler>HandlerFactory[i];
        var routers = await h.routers();
        routers.forEach(router => {
            router.process(app);
        })
    }
}

// run app
var server = app.listen(HOSTPORT, async () => {
    console.log('Listening at http://localhost:'+HOSTPORT);
    await setup(app);
});
server.on('connection', function(socket) {
    console.log("A new connection was made by a client.");
    socket.setTimeout(120 * 1000); 
    // 30 second timeout. Change this as you see fit.
    socket.on('data',function(data){
    });
    socket.on('end',function(data){
    });
});

if(MS.SLAVER.ONLINE){
    const job = new CronJob('00 00 */8 * * 0-6', async function() {
        await SlaverStartTasks.instance.handle('tickets',null);
    });
    job.start();
}

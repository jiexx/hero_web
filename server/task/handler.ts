import { workerData, Worker, MessagePort } from 'worker_threads';
import { POOL, Query } from "./pool";
import * as request from "request-promise-native";
import { Log } from '../common/log';
import { ID } from '../common/id';

interface Message {
    command: string;
}


export class QuerytMessage implements Message{
    command: string = 'QUERY';
    constructor(public query : Query, public indexTemplate: number, public params: Object = null){}
}
export class StringMessage implements Message{
    command: string = 'DEBUG';
    constructor(public str : string){}
}
export class IdleMessage implements Message{
    command: string = 'IDLE';
    constructor(public result : any = null){}
}

export class Dispatcher {
    handlers = <[Handler]>{};
    constructor( ...args: Handler[]){
        args.forEach(a => { this.handlers[a.command] = a });
    }
    dispath(port: Worker | MessagePort){
        port.on('message',  async (message) => {
            this.handlers[message.command].dispath(port, message);
        });
    }
    send(port: Worker | MessagePort, message: Message){
        port.postMessage(message);
    }
}

export abstract class Handler {
    abstract get command(): string;
    abstract async handle(port: Worker | MessagePort, message: Message);
    dispath(worker: Worker | MessagePort, message: Message){
        if(this.command == message.command){
            this.handle(worker, message);
        }
    }
}

export class Idle extends Handler {
    get command(): string{
        return 'IDLE';
    }
    async handle(worker: Worker, message: Message){
        let msg = message as IdleMessage;
        if(msg.result){
            let r = await POOL.push(msg.result.query, msg.result.res, msg.result.indexTemplate);
        }
        let data = POOL.pop();
        if(!data){
            Log.info('worker EXIT')
            worker.postMessage({command:'EXIT'});
            return;
        }
        data.query.body = JSON.stringify(data.query.body);
        worker.postMessage({command:'START',query:data.query,indexTemplate:data.indexTemplate, params:data.params});
    }
}

export class Debug extends Handler {
    get command(): string{
        return 'DEBUG';
    }
    async handle(port: MessagePort, message: Message){
        let msg = message as StringMessage;
        Log.info(msg.str)
    }
}

export class Start extends Handler {
    get command(): string{
        return 'START';
    }
    async handle(port: MessagePort, message: Message){
        try {
            let start = new Date().getTime();
            let msg = message as QuerytMessage;
            let res = await request(msg.query);
            
            port.postMessage({command:'DEBUG', str:'COMPLETE:  '+msg.query.uri+' '+JSON.stringify(msg.params)+' '+(new Date().getTime() - start)+'ms'});
            port.postMessage({command:'IDLE', result:{query:msg.query, res:res, indexTemplate:msg.indexTemplate}});
        } catch (error) {
            port.postMessage({command:'DEBUG', str:'ERROR:  '+error.toString()});
            port.postMessage({command:'IDLE'});
        }
    }
}

export class Exit extends Handler {
    get command(): string{
        return 'EXIT';
    }
    async handle(port: MessagePort, message: Message){
        process.exit();
    }
}

export class End extends Handler {
    get command(): string{
        return 'exit';
    }
    async handle(port: MessagePort, message: Message){
        Log.info('END '+JSON.stringify(message));
    }
}
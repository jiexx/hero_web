import { workerData, Worker, MessagePort } from 'worker_threads';
import { POOL, Query } from "./pool";
import * as request from "request-promise-native";
import { Log } from '../common/log';
import { ID } from '../common/id';
import { _http } from '../common/http';

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
            return this.handle(worker, message);
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
    async handle(port: Worker, message: Message){
        let msg = message as StringMessage;
        Log.info(msg.str)
    }
}

export class Start extends Handler {
    get command(): string{
        return 'START';
    }
    _request(query: Query){
        return  _http.request({
            url: query.uri,
            headers: query.headers,
            method: query.method == 'POST'? 'POST' :'GET',
            body: query.body
        })
    }
    async handle(port: MessagePort, message: Message){
        try {
            
            let start = new Date().getTime();
            let msg = message as QuerytMessage;
            let stream = await this._request(msg.query)
            // .catch((e)=>{
            //     port.postMessage({command:'DEBUG', str:'ERR:  '+e.message});
            // });
            port.postMessage({command:'DEBUG', str:'COMPLETE:  '+workerData.name+' '+msg.query.uri+' '+JSON.stringify(msg.params)+' '+(new Date().getTime() - start)+'ms'});
            port.postMessage({command:'IDLE', result:{query:msg.query, res:stream._buffer.toString(), indexTemplate:msg.indexTemplate}});
        } catch (error) {
            port.postMessage({command:'DEBUG', str:'ERROR:  '+error.toString()});
            port.postMessage({command:'IDLE'});
        }
    }
}

export class Exit extends Handler {
    constructor(private name: string = null){
        super();
    }
    get command(): string{
        return 'EXIT';
    }
    async handle(port: MessagePort, message: Message){
        //port.postMessage({command:'DEBUG', str:`exit: ${process.pid}  ${this.name}`});
        port.postMessage({command:'END', name:this.name});
        process.exit();
    }
}

export class End extends Handler {
    constructor(private callback: Function = null){
        super();
    }
    get command(): string{
        return 'END';
    }
    async handle(port: Worker, message: Message){
        //Log.info('END '+port.threadId+' '+(message as any).name );
        Log.info('...... '+(message as any).name+' END' );
        if(this.callback){
            this.callback((message as any).name);
        }
    }
}
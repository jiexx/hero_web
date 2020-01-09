import { Worker, MessageChannel } from 'worker_threads';
import { Idle, Debug, Handler, Dispatcher, End } from './handler';
import { POOL } from './pool';
import { config } from './config';
import { TaskWriteStream } from './task.stream';


export class TaskManager extends TaskWriteStream {
    threads = {};
    dispatcher: Dispatcher;
    callback: Function = null;
    constructor(){
        super();
        let couter = config.threads.length;
        this.dispatcher = new Dispatcher(new Idle(), new Debug(), new End((name)=>{
            couter --;
            if(!couter && this.callback){
                this.callback();
            }
        }));
    }
    async setup(batchNo: number = 0){
        await POOL.setup(batchNo);
    }
    async start(callback: Function){
        this. callback = callback;
        for(let i = 0 ; i < config.threads.length ; i ++){
            if(this.threads[i]){
                await this.threads[i].terminate();
            }
        }
        
        for(let i = 0 ; i < config.threads.length ; i ++){
            let thread = new Worker('./task/task.import.js', {workerData: { path: './task.ts', name: config.threads[i].name} });
            this.threads[config.threads[i].name] = thread;
            this.dispatcher.dispath(thread);
        }
    }

}



 

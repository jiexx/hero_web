import { Worker, MessageChannel } from 'worker_threads';
import { Idle, Debug, Handler, Dispatcher } from './handler';
import { POOL } from './pool';
import { config } from './config';


export class TaskManager {
    threads = {};
    dispatcher: Dispatcher;
    constructor(){
        this.dispatcher = new Dispatcher(new Idle(), new Debug());
    }
    async setup(batchNo: number = 0){
        await POOL.setup(batchNo);
    }
    async start(){
        for(let i in this.threads){
            if(this.threads[i]){
                await this.threads[i].terminate();
            }
        }
        for(let i in config.threads){
            let thread = new Worker('./task/task.import.js', {workerData: { path: './task.ts' } });
            this.threads[config.threads[i].name] = thread;
            this.dispatcher.dispath(thread);
        }
    }

}



 

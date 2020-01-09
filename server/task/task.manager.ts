import { Worker, MessageChannel } from 'worker_threads';
import { Idle, Debug, Handler, Dispatcher, End } from './handler';
import { POOL } from './pool';
import { config } from './config';


export class TaskManager {
    threads = {};
    dispatcher: Dispatcher = null;
    constructor(){
    }
    async setup(batchNo: number = 0){
        await POOL.setup(batchNo);
    }
    async start(callback: Function){
        let once = true;
        this.dispatcher = new Dispatcher(new Idle(), new Debug(), new End((name)=>{
            if(this.threads[name]){
                this.threads[name] = null;
            }
            if( /* Object.values(this.threads).every(e => e == null) */once && POOL.empty() && callback){
                once = false;
                callback();
            }
        }));
        
        for  (let i = 0 ; i < config.threads.length ; i ++) {
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



 

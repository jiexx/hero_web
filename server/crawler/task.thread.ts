import { parentPort, workerData } from 'worker_threads';
import { Handler, Exit, Start, Dispatcher, StringMessage, IdleMessage } from './handler';
import { Task } from './task';
import { TaskReadStream, TaskWriteStream } from './task.stream';

export class TaskThread extends Task{
    dispatcher: Dispatcher;
    constructor(){
        super();
        this.dispatcher = new Dispatcher(new Start(), new Exit(workerData.name));
        this.setup();
    }
    setup(){
        this.dispatcher.send(parentPort, new StringMessage(workerData.name+' task ......'));
        this.dispatcher.send(parentPort, new IdleMessage());
        this.dispatcher.dispath(parentPort);
    }
}

new Task();
import { parentPort, workerData } from 'worker_threads';
import { Handler, Exit, Start, Dispatcher, StringMessage, IdleMessage } from './handler';

export class Task {
    dispatcher: Dispatcher;
    constructor(){
        this.dispatcher = new Dispatcher(new Start(), new Exit(workerData.name));
        this.setup();
    }
    setup(){
        this.dispatcher.send(parentPort, new StringMessage(workerData.name+' task....'));
        this.dispatcher.send(parentPort, new IdleMessage());
        this.dispatcher.dispath(parentPort);
    }
}

new Task();
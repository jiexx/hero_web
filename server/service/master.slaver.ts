import { Vertex } from "../gorm/vertex";
import { ID } from "../common/id";
import { OK, ERR, STREAM } from "../common/result";
import { HandlersContainer, MHandler, SHandler } from "../route/handler";
import { Edge, Edges } from "../gorm/edge";
import { Authentication } from "../route/authentication";
import { Articles } from "./articles";
import { Messages } from "./messages";
import * as request from "request-promise-native";
import * as zlib from "zlib";
import { MS, HOSTPORT } from "../config";
import { PassThrough, Transform, Stream } from 'stream'
import { G } from "../gorm/gorm";
import { Tickets } from "./tickets";
import { TaskManager } from "../task/task.manager";
import { Favors, FavorNotify } from "./favor";
import { resolve } from "path";


class Pump {
    pass: PassThrough;
    constructor(transform: Transform){
        this.pass = new PassThrough().pipe(transform);
    }
    buf: string = '';
    stack: string[] = [];
    MAX: number = 100;
    put(chunk: string){
        let pos = 0;
        this.buf += chunk;
        while ((pos = this.buf.indexOf('\n')) >= 0) {
            if (pos == 0) {
                this.buf = this.buf.slice(1);
                continue;
            }
            let line = this.buf.slice(0,pos);
            if (line.length > 0) {
                this.stack.push(line);
                if(this.stack.length >= this.MAX){
                    //console.log('push stack: '+this.stack.length);
                    this.pass.write(this.stack);
                    this.stack = [];
                }
            }
            this.buf = this.buf.slice(pos+1);
        }
    }
    end(){
        if(this.stack.length > 0){
            //console.log('push stack: '+this.stack.length);
            //console.log('buf: '+this.buf.length);
            this.pass.write(this.stack);
            this.stack = [];
        }
        this.pass.end();
    }
}

class Streams {
    private list: any;
    private sequence: string[];
    constructor(list:any, sequence:string[]){
        this.list = list;
        this.sequence = sequence;
    }
    get names(){
        return this.sequence;
    }
    exist(name:string){
        return !!this.list[name];
    }
    async merge(){
        let merge = new PassThrough();
        let streams = [];
        for(let i = 0 ; i < this.sequence.length ; i ++){
            let s = await this.list[this.sequence[i]].stream({
                select: '*'
            });
            streams.push(s);
        }
        let counter = 0;
        merge.write(`${this.sequence[0]}\n`);
        return streams.reduce((pt, s, i, a) => {
            s.pipe(
                new Transform({
                    objectMode: true,
                    transform: (data,encoding,callback) => {
                        //console.log('id: '+data.id)
                        let str = JSON.stringify(data)+'\n';
                        counter += str.length;
                        pt.write(str);
                        callback();
                    }
                })
            ).pipe(pt, {end: false});
            s.once('end',() => { 
                s.readableEnded = true;
                if(!a.every(s => s.readableEnded)) {
                    pt.write(`${this.sequence[i+1]}\n`);
                }else{
                    console.log('send total :'+counter);
                    pt.end();
                }
            });
            return pt;
        }, merge);
    }
    private repo = null;
    private async process(data){
        let stack = [];
        for(let i = 0 ; i < data.length ; i ++){
            if(this.repo){
                if(this.exist(data[i])){
                    if(stack.length > 0){
                        await this.repo.save(stack);
                    }
                    this.repo = this.list[data[i]];
                }else{
                    //console.log('input id: '+JSON.parse(data[i]).id);
                    stack.push(JSON.parse(data[i]));
                }
            }else{
                if(this.exist(data[i])){
                    this.repo = this.list[data[i]];
                }
            }
        }
        if(this.repo && stack.length > 0) {
            await this.repo.save(stack);
        }
    }
    async receive(opts){
        return new Promise((resolve, reject) => {
            let pump = new Pump(
                    new Transform({
                        objectMode: true,
                        transform: async (data,encoding,callback) => {
                            await this.process(data);
                            callback();
                        }
                    })
                    .once('finish', ()=> resolve())
                );

            request(opts).on('data', async (d) => {
                pump.put(d.toString());
            }).on('complete', async (d) => {
                pump.end();
            }).on('response', (response)=> {
                response.on('data', function(data) {
                    console.log('received ' + data.length + ' bytes of compressed data')
                })
            }).on('error',()=>{
                reject();
            });
        });
    }
};
class SlaverRestore extends SHandler {
    async handle(path:string, q:any){
        let streams = new Streams({
            'users':Authentication.instance.users.repo, 
            'articles':Articles.instance.articles.repo, 
            'msgs':Messages.instance.messages.repo, 
            'joins':G.join
        },['users', 'articles', 'msgs', 'joins']);

        await streams.receive(
            {
                method: 'POST', 
                url: `${MS.MASTER.ADDR}/master/backup`,
                gzip: true,
                headers: {
                    'Accept-Encoding': 'gzip',
                    'Connection': 'keep-alive',
                    'Authorization': `Bearer ${Authentication.instance._sign(MS.MASTER.SIGNATURE)}`,
                }
            }
        )

        return OK(path);
    }
}
class MasterBackup extends MHandler {
    async handle(path:string, q:any){

        let streams = new Streams({
            'users':Authentication.instance.users.repo, 
            'articles':Articles.instance.articles.repo, 
            'msgs':Messages.instance.messages.repo, 
            'joins':G.join
        },['users', 'articles', 'msgs', 'joins']);

        let result = await streams.merge();

        return STREAM(result);
    }
}

class MasterRestoreTickets extends MHandler {
    async handle(path:string, q:any){

        let bktable = await Tickets.instance.backup('tickets_bk');

        await bktable.repo.clear();

        let streams = new Streams({
            'tickets':bktable.repo
        },['tickets']);

        await streams.receive({
            method: 'POST', 
            url: `${MS.SLAVER.ADDR}/slaver/tickets`,
            gzip: true,
            timeout:150000,
            headers: {
                'Accept-Encoding': 'gzip',
                'Authorization': `Bearer ${Authentication.instance._sign(MS.SLAVER.SIGNATURE)}`,
            }
        });

        const queryRunner = G.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.query(`RENAME TABLE ${Tickets.instance.tickets.label} To tickets_tmp,  tickets_bk TO ${Tickets.instance.tickets.label}, tickets_tmp To tickets_bk`)
        await queryRunner.executeMemoryDownSql();
        await queryRunner.release();

        await FavorNotify.instance.handle(path, q);
        // RENAME TABLE foo TO foo_old, foo_new To foo;
        return OK(path);
    }
}

class SlaverTickets extends SHandler {
    async handle(path:string, q:any){

        let streams = new Streams({
            'tickets':Tickets.instance.tickets.repo
        },['tickets']);

        let result = await streams.merge();

        return STREAM(result);
    }
}

export class SlaverStartTasks extends SHandler {
    tm: any = null;
    async handle(path:string, q:any){
        let bktable = await Tickets.instance.backup('tickets_bk');
        await bktable.repo.clear();
        const queryRunner = G.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.query(`RENAME TABLE ${Tickets.instance.tickets.label} To tickets_tmp,  tickets_bk TO ${Tickets.instance.tickets.label}, tickets_tmp To tickets_bk`)
        await queryRunner.executeMemoryDownSql();
        await queryRunner.release();

        await this.start(async ()=>{
            await this.notify();
        })
        return OK(path);
    }
    async start(onFinish = null){
        let counter = ID.beginBatchCounter();
        console.log('batch start ', counter)
        if(!this.tm) {
            this.tm = new TaskManager();
            await this.tm.setup(counter);
        }
        await this.tm.start(()=>{
            ID.endBatchCounter();
            if(onFinish){
                onFinish();
            }
        });
        
    }
    async notify(){
        await request(
            {
                method: 'POST', 
                url: `${MS.MASTER.ADDR}/master/restore/tickets`,
                headers: {
                    'Accept-Encoding': 'gzip',
                    'Authorization': `Bearer ${Authentication.instance._sign(MS.MASTER.SIGNATURE)}`,
                }
            }
        )
    }
}

export class MasterSlaver  extends HandlersContainer  {
    constructor(public articles: Vertex, public favors: Edge, public post: Edge){
        super();
    }
    async setup(){
        this.addHandler(new MasterRestoreTickets());
        this.addHandler(new SlaverStartTasks());
        this.addHandler(new SlaverTickets());
    }
    public async routers(){
        await this.setup();
        return super.routers();
    }
}
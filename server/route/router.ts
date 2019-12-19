

import { Request, Response, Express } from "express";
import { createGzip } from "zlib";
import { Log } from "../common/log";
import { Handler } from "./handler";
import { Authentication } from "./authentication";
const cwd = process.cwd();

abstract class Process {
    auth: any = null;
    constructor(auth:number = 0){
        switch(auth){
            case 0: 
                this.auth = null;
                break;
            case 1: 
                this.auth = Authentication.instance.authenticate;
                break;
            case 2: 
                this.auth = Authentication.instance.masterAuthenticate;
                break;
            case 3: 
                this.auth = Authentication.instance.slaverAuthenticate;
                break;
        }
        //this.auth = auth ? Authentication.instance.authenticate : null;
    }
    abstract process(h:Handler, path:string, app:Express);
    protected abstract prepare(h:Handler, path:string, req:Request, res: Response): Object;
    protected async complete(path:string, result:Object, res:Response){
        if(result['code']=='REDIRECT'){
            res.redirect(result['data']);
        }else if(result['code']=='DIRECT'){
            if(result['msg']) {
                res.header("Content-Type", result['msg']);
            }
            res.send(result['data']);
        }else if(result['code']=='FILE'){
            res.header("Content-Type", result['msg']);
            res.sendFile(result['data'],{ root : cwd});
        }else if(result['code']=='IMAGE'){
            res.send(result['data']);
        }else if(result['code']=='OK'){
            res.send(result);
        }else if(result['code']=='STREAM'){
            res.header('Content-Encoding', 'gzip');
            result['data'].pipe(createGzip()).pipe(res);
            // res.on('finish', function() {
            //     console.log(res);
            // });
        }else {
            res.send({code:'OK', msg:'', data:result});
        }
    };
    protected failed(result:Object, res:Response){
        res.send(result);
    };
    protected async execute(h:Handler, path:string, req:Request, res: Response) {
        try {
            const data = this.prepare(h, path, req, res);
            if(this.auth){
                data['user'] = req['user'];
            }
            const result = await h.handle(path, data);
            if(result.code == 'ERR'){
                this.failed(result, res);
            }else {
                await this.complete(path, result, res);
            }
        }catch(e){
            Log.error(e);
            res.send({ code: 'ERR', msg: path, data: null });
        }
    }
}
class Post extends Process {
    process(h:Handler, path:string, app:Express){
        if(this.auth){
            app.post(path, this.auth, (req, res, next) => {
                Log.info(path+' '+this.constructor.name+' received');
                this.execute(h, path, req, res);
            });
        }else{
            app.post(path, (req, res, next) => {
                Log.info(path+' '+this.constructor.name+' received');
                this.execute(h, path, req, res);
            });
        }
    }
    protected prepare(h:Handler, path:string, req:Request, res: Response): Object{
        return Object.assign(req.body,req.params);
    }
};

class Get extends Process {
    process(h:Handler, path:string, app:Express){
        if(this.auth){
            app.get(path, this.auth, (req, res, next) => {
                Log.info(path+' '+this.constructor.name+' received');
                req.connection.setTimeout(60*10*1000);
                this.execute(h, path, req, res);
            });
        }else{
            app.get(path, (req, res, next) => {
                Log.info(path+' '+this.constructor.name+' received');
                req.connection.setTimeout(60*10*1000);
                this.execute(h, path, req, res);
            });
        }
    }
    protected prepare(h:Handler, path:string, req:Request, res: Response): Object{
        return Object.assign(req.query,req.params);
    }
};

export class Router {
    path: string = '';
    handler: Handler = null;
    processor: Process[] = [];
    constructor(path:string, h:Handler, auth: number = 1,  post:boolean = true, get:boolean = false, pattern:boolean = false){
        this.path = path.toLowerCase();
        this.handler = h;

        this.processor[0] =  ( get ? new Get(auth) : null ); 
        this.processor[1] =  ( post ? new Post(auth) : null ); 


        Log.info('POST:'+(!!post)+' GET:'+(!!get)+((auth == 1 && ' authorized | ')||(auth == 0 && ' unauthorized | ')||(auth == 2 && ' master | ')||(auth == 3 && ' slaver |  '))+this.path);
    }

    process(app:Express) {
        for(let i = 0 ; i < this.processor.length; i ++){
            if(this.processor[i]){
                this.processor[i].process(this.handler, this.path, app);
            }
        }
    }
}

import { readdirSync, statSync, createReadStream, Stats, access } from 'fs';
import * as https from "https"
import { request, IncomingMessage, ServerResponse, ClientRequest } from "http";
import { createGunzip, createInflate, createGzip } from 'zlib';
import { join,resolve } from 'path';
import { MS } from "../config";
import { _files, FileWriteStream } from "./files";
import { ReadStream } from "fs";
import { ID } from './id';

export class Cache {

    constructor(){
    }
    
    getFiles(path: string): string[] {
        return readdirSync(path).map(file => join(path, file)).reduce((p, path) => { statSync(path).isDirectory() ? p = p.concat(this.getFiles(path)) : p.push(path); return p }, []);
    }
    private _cache = <[FileWriteStream]>{};
    private _length = 0;
    append(path: string) {
        this.getFiles(path).forEach(filename => { let md5 = ID.md5(filename);/* console.log(filename,md5); */let fws = new FileWriteStream(filename); this._cache[md5] = fws; createReadStream(filename, _files.encoding(filename)).pipe(createGzip()).pipe(fws).on('finish',()=>this._length+=fws._buffer.length);  });
    }
    cache(){
        this.append(MS.MASTER.ASSETS);
    }
    cacheStream(path: string){
        let md5 = ID.md5(path);
        return this._cache[md5] && this._cache[md5].getReadableStream();
    }
    get cacheRegex(){
        return '/';
    }
    response(req: IncomingMessage, res: ServerResponse){
        let filename = req.url == '/' ? join(MS.MASTER.ASSETS,'index.html') : join(MS.MASTER.ASSETS,req.url.substr(req.url.indexOf('asset/')+6));
        console.log(filename);
        const file = this.cacheStream(filename);
        if(!file){
            res.end('none')
            return ;
        }
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "public, max-age=0")
        let ua = req.headers['user-agent'];
        let encoding = req.headers['accept-encoding'] || req.headers['Accept-Encoding'];
        if(encoding && encoding.includes('gzip') && !/Windows NT/.test(ua)){
            res.setHeader('Content-Encoding', 'gzip');
            file.pipe(res);
        }else{
            file.pipe(createGunzip()).pipe(res);
        }
        //console.log('mime',mimetype,req.url);
    }
}

export const _cache = new Cache();
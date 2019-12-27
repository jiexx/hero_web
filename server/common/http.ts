import * as URL from "url";
import { request, IncomingMessage, IncomingHttpHeaders, ServerResponse } from "http";
import { Log } from "./log";
import { Readable, ReadableOptions, Writable, WritableOptions } from "stream";
import { createGunzip, createInflate, createGzip } from 'zlib';
import { join,resolve } from 'path';
import { MS } from "../config";
import { Files } from "./files";
import { ReadStream } from "fs";

class HttpReadStream extends Readable {
    _buffer: Buffer;
    _index: number = 0;
    constructor(buffer: Buffer, options: ReadableOptions = { objectMode: false }) {
        super(options);
        this._buffer = buffer;
    }
    _read = () => {
        if (this._index + 102400 >= this._buffer.length){
            this.push(Buffer.from(this._buffer, this._index, this._buffer.length - this._index));
            this.push(null);
            this._index = 0;
        }else {
            this.push(Buffer.from(this._buffer, this._index, 102400));
            this._index += 102400;
        }
    };
}
class HttpWriteStream extends Writable {
    _buffer: Buffer;
    headers: {};
    statusCode: number;
    constructor(options: WritableOptions = { objectMode: false }) {
        super(options);
        this._buffer = Buffer.from('','utf8');
    }
    _write = (chunk, enc, callback) => {
        let  buffer = (Buffer.isBuffer(chunk)) ? chunk : new Buffer(chunk, enc);
        this._buffer = Buffer.concat([this._buffer, buffer]);
        callback();
    };
    _destroy(err, callback){
        this._buffer = null;
        super._destroy(err, callback);
    }
}

export interface HttpRequestOption {
    url: string;
    headers?: {};
    method: 'POST' | 'GET';
    body?: any;
}
export class Http {
    private http(rq: HttpRequestOption) : Promise<IncomingMessage>{
        return new Promise((resolve, rejects) => {
            try{
                const postData = rq.body;
                const url = URL.parse(rq.url);
                rq.headers = rq.headers || {timeout: 120000};
                rq.headers['Content-Length'] = Buffer.byteLength(postData);
                rq.headers['Content-Type'] = rq.headers['Content-Type'] || 'application/x-www-form-urlencoded';
                rq.headers['Accept-Encoding'] = rq.headers['Accept-Encoding'] || 'gzip';
                rq.headers['Connection'] = rq.headers['Connection'] || 'keep-alive';
                const options = {
                    hostname: url.hostname,
                    port: url.port,
                    path: url.pathname,
                    method: rq.method,
                    headers: rq.headers
                };
                const req = request(options);
                req.on('response', function (res) {
                    resolve(res);
                })
                req.on('error', (e) => {
                    // console.error(`problem with request: ${e.message}`);
                    rejects(e);
                });
                req.write(postData);
                req.end();          
            }catch(e){
                Log.error(e.message);
                rejects(e);
            }
        })
    }
    stream(rq: HttpRequestOption){
        let hws = new HttpWriteStream();
        this.http(rq).then((res: IncomingMessage)=>{
            hws.statusCode = res.statusCode;
            hws.headers = {...res.headers};
            let encoding = res.headers['content-encoding'] || res.headers['Content-Encoding'];
            if (encoding.includes('gzip')) {
                res.pipe(createGunzip()).pipe(hws)
            } else if (encoding.includes('deflate')) {
                res.pipe(createInflate()).pipe(hws)
            } else {
                res.pipe(hws)
            }
        });
        return hws;
    }
    request(rq: HttpRequestOption){
        return new Promise((resolve, rejects) => {
            let hws = this.stream(rq)
            .on('finish', async (d) => {
                resolve(hws._buffer.toString());
            })
            .on('error', (e)=>{
                rejects(e);
            })
        });
    }
    
    constructor(public files: Files = null){
        
    }
    cache(){
        this.files = new Files();
        this.files.cache(MS.MASTER.WEBBASE);
    }
    response(req: IncomingMessage, res: ServerResponse){
        let filename = req.url == '/' ? join(MS.MASTER.WEBBASE,'index.html') : join(MS.MASTER.WEBBASE,req.url)
        const file = this.files.getFileStream(filename);
        const mimetype = this.files.mime(filename);
        //console.log('mime',mimetype,req.url);
        if(file && mimetype){
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Cache-Control", "public, max-age=432000")
            res.setHeader('Content-type', mimetype);
            let encoding = req.headers['accept-encoding'] || req.headers['Accept-Encoding'];
            if(encoding && encoding.includes('gzip')){
                res.setHeader('Content-Encoding', 'gzip');
                file.pipe(res);
            }else{
                file.pipe(createGunzip()).pipe(res);
            }
        }else if(mimetype){
            this.files.getOneStream(join(MS.MASTER.ASSETS,req.url),(stream: ReadStream)=>{
                res.setHeader('Content-type', mimetype);
                let encoding = req.headers['accept-encoding'] || req.headers['Accept-Encoding'];
                if(encoding && encoding.includes('gzip')){
                    res.setHeader('Content-Encoding', 'gzip');
                    stream.pipe(createGzip()).pipe(res);
                }else{
                    stream.pipe(res);
                }
            })
            
        }else{
            res.end('none.')
        }
    }
}

export const _http = new Http();
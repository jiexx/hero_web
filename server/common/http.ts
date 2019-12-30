import * as URL from "url";
import * as https from "https";
import { CookieJar } from "tough-cookie";
import { request, IncomingMessage, ServerResponse, ClientRequest } from "http";
import { Log } from "./log";
import { Readable, ReadableOptions, Writable, WritableOptions } from "stream";
import { createGunzip, createInflate, createGzip } from 'zlib';

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
    location: string;
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
    chunk?: boolean;
    cookie?: any;
    counter?: number;
}
export class Http {
    private http(hnd: (options: https.RequestOptions | string | URL, callback?: (res: IncomingMessage) => void) => ClientRequest, rq: HttpRequestOption, resolve: (im: IncomingMessage) => void, rejects: (error: Error) => void) : void{
        try{
            const postData = rq.body;
            const url = URL.parse(rq.url);
            rq.headers = rq.headers || {timeout: 120000};
            if(postData && !rq.chunk){
                rq.headers['Content-Length'] = Buffer.byteLength(postData);
            }
            rq.headers['Content-Type'] = rq.headers['Content-Type'] || rq.headers['content-type'] || 'application/x-www-form-urlencoded';
            rq.headers['Accept-Encoding'] = rq.headers['Accept-Encoding'] || rq.headers['accept-encoding'] || 'gzip';
            rq.headers['Connection'] = rq.headers['Connection'] || rq.headers['connection'] || 'keep-alive';
            const options = {
                hostname: url.hostname,
                port: url.port,
                path: url.path,
                method: rq.method,
                headers: rq.headers
            };
            const req = hnd(options);
            req.on('response', (res) => {
                resolve(res);
            })
            req.on('error', (e) => {
                // console.error(`problem with request: ${e.message}`);
                rejects(e);
            });
            if(postData){
                req.write(postData);
            }
            req.end();          
        }catch(e){
            Log.error(e.message);
            rejects(e);
        }
    }
    stream(rq: HttpRequestOption, hnd: (options: https.RequestOptions | string | URL, callback?: (res: IncomingMessage) => void) => ClientRequest = request) : HttpWriteStream{
        let hws = new HttpWriteStream();
        this.http(hnd, rq, (res: IncomingMessage)=>{
            hws.statusCode = res.statusCode;
            hws.headers = {...res.headers};
            hws.emit('headers');
            let encoding = res.headers['content-encoding'] || res.headers['Content-Encoding'];
            res.on('error',(e)=>{
                hws.emit('error', e);
            })
            if (encoding && encoding.includes('gzip')) {
                res.pipe(createGunzip()).on('data',(d)=>{hws.emit('data',d)}).pipe(hws);
            } else if (encoding && encoding.includes('deflate')) {
                res.pipe(createInflate()).on('data',(d)=>{hws.emit('data',d)}).pipe(hws)
            } else {
                res.on('data',(d)=>{hws.emit('data',d)}).pipe(hws);
            }
        },(e)=>{
            hws.emit('error', e);
        });
        return hws;
    }
    request(rq: HttpRequestOption): Promise<HttpWriteStream>{
        return new Promise((resolve, rejects) => {
            let hws = this.stream(rq)
            .on('finish', async (d) => {
                resolve(hws);
            })
            .on('error', (e)=>{
                rejects(e);
            })
        });
    }
    requests(rq: HttpRequestOption): Promise<HttpWriteStream>{
        return new Promise((resolve, rejects) => {
            let hws = this.stream(rq, https.request)
            .on('finish', async (d) => {
                resolve(hws);
            })
            .on('error', (e)=>{
                rejects(e);
            })
        });
    }
    redirectsStream(rq: HttpRequestOption, callback: (hws: HttpWriteStream)=>void): void {
        if(!rq.cookie){
            rq.cookie = new CookieJar();
        }
        !rq.counter ? rq.counter = 0 : rq.counter ++ 
        let hws = this.stream(rq, https.request)
        .on('headers', async () => {
            let res = hws;
            res.location = rq.url;
            if(res.statusCode == 302 && res.headers['location'] && rq.counter < 5){
                rq.url = res.headers['location'];
                res.location = rq.url;
                if(res.headers['set-cookie'] ){
                    if(Object.prototype.toString.call(res.headers['set-cookie']) == '[object Array]'){
                        res.headers['set-cookie'].forEach(e=>rq.cookie.setCookieSync(e, res.headers['location'], {ignoreError: true}));
                    }else if(Object.prototype.toString.call(res.headers['set-cookie']) == '[object String]'){
                        rq.cookie.setCookie(res.headers['set-cookie'], res.location, {ignoreError: true})
                    }
                    rq.headers['cookie'] = rq.cookie.getCookieStringSync(res.location);
                }
                this.redirectsStream(rq, callback);
            }else {
                if(rq['counter'] >= 5){
                    res.statusCode = -103;
                }
                if(callback){
                    callback(res);
                }
            }
        });
    }
    async redirects(rq: HttpRequestOption): Promise<HttpWriteStream> {
        if(!rq.cookie){
            rq.cookie = new CookieJar();
        }
        !rq.counter ? rq.counter = 0 : rq.counter ++ 
        let res = await this.requests(rq);
        res.location = rq.url;
        if(res.statusCode == 302 && res.headers['location'] && rq.counter < 5){
            rq.url = res.headers['location'];
            if(res.headers['set-cookie'] ){
                if(Object.prototype.toString.call(res.headers['set-cookie']) == '[object Array]'){
                    res.headers['set-cookie'].forEach(e=>rq.cookie.setCookieSync(e, res.headers['location'], {ignoreError: true}));
                }else if(Object.prototype.toString.call(res.headers['set-cookie']) == '[object String]'){
                    rq.cookie.setCookie(res.headers['set-cookie'], res.location, {ignoreError: true})
                }
                rq.headers['cookie'] = rq.cookie.getCookieStringSync(res.location);
            }
            return await this.redirects(rq);
        }else {
            if(rq['counter'] >= 5){
                res.statusCode = -103;
            }
            return res;
        }
    }
}
export const _http = new Http();
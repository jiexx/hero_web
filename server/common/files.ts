import { readdirSync, statSync, createReadStream, Stats, access, ReadStream } from 'fs';
import { join } from 'path';
import { createGzip } from 'zlib';
import { WritableOptions, ReadableOptions, Readable, Writable  } from "stream";
import { IncomingMessage, ServerResponse } from 'http';
import { MS } from '../config';
import { _alipay } from './pay';
export class FileReadStream extends Readable {
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
export class FileWriteStream extends Writable {
    _buffer: Buffer;
    _filename: string = '';
    constructor(filename: string, options: WritableOptions = { objectMode: false }) {
        super(options);
        this._filename = filename;
        this._buffer = Buffer.from('','utf8');
    }
    _write = (chunk, enc, callback) => {
        let  buffer = (Buffer.isBuffer(chunk)) ? chunk : new Buffer(chunk, enc);
        this._buffer = Buffer.concat([this._buffer, buffer]);
        callback();
    };
    getReadableStream(): FileReadStream{
        return new FileReadStream(this._buffer);
    }
}

export class Files {
    public _mime = {
        '.html' : {mime:'text/html',encoding:{encoding:'utf8'}},
        '.ico' : {mime:'image/x-icon',encoding:{}},
        '.jpg' : {mime:'image/jpeg',encoding:{}},
        '.png' : {mime:'image/png',encoding:{}},
        '.svg' : {mime:'image/svg+xml',encoding:{encoding:'utf8'}},
        '.gif' : {mime:'image/gif',encoding:{}},
        '.css' : {mime:'text/css',encoding:{encoding:'utf8'}},
        '.js' : {mime:'text/javascript',encoding:{encoding:'utf8'}},
        '.woff2': {mime:'application/font-woff2',encoding:{}},
    };
    get assetRegex(){
        return /^\/asset\/.*\.(htm|html|jpg|png|gif|js|css|ico|woff2)$/;
    }
    get mediaRegex(){
        return /^\/media\/.*\.(htm|html|jpg|png|gif|js|css|ico|woff2)$/;
    }
    get qrcodeRegex(){
        return /^qrcode\/.*\.(jpg|png|gif|svg)$/;
    }
    encoding(url: string){
        let dotoffset = url.lastIndexOf('.');
        return (this._mime[ url.substr(dotoffset) ] && this._mime[ url.substr(dotoffset) ].encoding) || {encoding:'utf8'};
    }
    dotMime(url: string){
        let dotoffset = url.lastIndexOf('.');
        return this._mime[ url.substr(dotoffset) ] && this._mime[ url.substr(dotoffset) ].mime;
    }
    
    

    mediaStream(path: string, callback: Function){
        access(path, (err) => {
            if(!err && callback){
                callback(createReadStream(path, this.encoding(path)));
            }
        });
    }
    mime(req: IncomingMessage, res: ServerResponse){
        const mimetype = this.dotMime(req.url);
        res.setHeader('Content-type', mimetype);
    }
    response(req: IncomingMessage, res: ServerResponse){
        this.mediaStream(join(MS.MASTER.MEDIA,req.url),(stream: ReadStream)=>{
            let encoding = req.headers['accept-encoding'] || req.headers['Accept-Encoding'];
            if(encoding && encoding.includes('gzip')){
                res.setHeader('Content-Encoding', 'gzip');
                stream.pipe(createGzip()).pipe(res);
            }else{
                stream.pipe(res);
            }
        });
    }
    
}
export const _files = new Files();
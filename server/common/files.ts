import { readdirSync, statSync, createReadStream } from 'fs';
import { join } from 'path';
import { createGzip } from 'zlib';
import { WritableOptions, ReadableOptions, Readable, Writable  } from "stream";
import { Log } from './log';
import { ID } from './id';
class FileReadStream extends Readable {
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
class FileWriteStream extends Writable {
    _buffer: Buffer;
    _index: number = 0;
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
    getReadableStream(){
        return new FileReadStream(this._buffer);
    }
}

class Files {
    private _mime = {
        '.html' : 'text/html',
        '.ico' : 'image/x-icon',
        '.jpg' : 'image/jpeg',
        '.png' : 'image/png',
        '.gif' : 'image/gif',
        '.css' : 'text/css',
        '.js' : 'text/javascript'
    };
    mime(url: string){
        let dotoffset = url.lastIndexOf('.');
        return this._mime[ url.substr(dotoffset) ];
    }
    getFiles(path: string): string[] {
        return readdirSync(path).map(file => join(path, file)).reduce((p, path) => { statSync(path).isDirectory() ? p = p.concat(this.getFiles(path)) : p.push(path); return p }, []);
    }
    private _cache = {};
    private _length = 0;
    cache(path: string) {
        this.getFiles(path).map(filename => { let md5 = ID.md5(filename);/* console.log(filename,md5); */let fws = new FileWriteStream(filename); this._cache[md5] = fws; createReadStream(filename, {encoding: 'utf8'}).pipe(createGzip()).pipe(fws).on('finish',()=>this._length+=fws._buffer.length);  });
    }
    getFileStream(path: string){
        let md5 = ID.md5(path);
        return this._cache[md5] && this._cache[md5].getReadableStream();
    }

}

export const _files = new Files();
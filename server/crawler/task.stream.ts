import { Readable, ReadableOptions, Writable, WritableOptions, Duplex } from "stream";
import { createGunzip } from 'zlib';

export class TaskReadStream extends Readable {
    _buffer: any[];
    _index: number = 0;
    constructor(buffer: any[], options: ReadableOptions = { objectMode: true }) {
        super(options);
        this._buffer = buffer;
    }
    _read = () => {
        if (this._index + 102400 >= this._buffer.length){
            this.push(this._buffer.slice(this._index, this._buffer.length-1));
            this.push(null);
            this._index = 0;
        }else {
            this.push(this._buffer.slice(this._index, this._index+102400));
            this._index += 102400;
        }
    };
}
export class TaskWriteStream extends Writable {
    _buffer: any[];
    _index: number = 0;
    constructor(options: WritableOptions = { objectMode: true }) {
        super(options);
        this._buffer = [];
    }
    _write = (chunk, enc, callback) => {
        if(Object.prototype.toString.call(chunk) == '[object Array]'){
            this._buffer = [...this._buffer, ...chunk];
        }else if(Object.prototype.toString.call(chunk) == '[object Object]'){
            this._buffer = [...this._buffer, ...[chunk]];
        }
        callback();
    };
    _destroy(err, callback){
        this._buffer = null;
        super._destroy(err, callback);
    }
}

export class TaskStream extends Duplex {
    _buffer: any[];
    _index: number = 0;
    constructor(options: WritableOptions = { objectMode: true }) {
        super(options);
        this._buffer = [];
    }
    _write = (chunk, enc, callback) => {
        if(Object.prototype.toString.call(chunk) == '[object Array]'){
            this._buffer = [...this._buffer, ...chunk];
        }else if(Object.prototype.toString.call(chunk) == '[object Object]'){
            this._buffer = [...this._buffer, ...[chunk]];
        }
        callback();
    };
    _read = () => {
        if (this._index + 102400 >= this._buffer.length){
            this.push(this._buffer.slice(this._index, this._buffer.length-1));
            this.push(null);
            this._index = 0;
        }else {
            this.push(this._buffer.slice(this._index, this._index+102400));
            this._index += 102400;
        }
    };
}
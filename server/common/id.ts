import shortid = require('shortid');
import uuidv4 = require('uuid/v4');
import crypto = require('crypto');
import fs = require('fs'); 
import { MEDIADIR, COUNTERFILE } from '../config';

class Id {
    get short(){
        return shortid.generate()
    }
    get long(){
        return uuidv4();
    }
    get datetime(){
        let d = new Date();
        d.setMilliseconds(0);
        return d+'';
    }
    get now(){
        //return new Date().toLocaleString();
        var d = new Date();
        return d.getFullYear()+'-'+("0"+(d.getMonth()+1)).slice(-2)+'-'+("0"+(d.getDate())).slice(-2)+' '+("0"+(d.getHours())).slice(-2)+':'+("0"+(d.getMinutes())).slice(-2)+':'+("0"+(d.getSeconds())).slice(-2);
    }
    get today(){
        var d = new Date();
        return d.getFullYear()+'-'+("0"+(d.getMonth()+1)).slice(-2)+'-'+("0"+(d.getDate())).slice(-2);
    }
    get nowFormat(){
        var d = new Date();
        return ("0"+(d.getHours())).slice(-2)+'-'+("0"+(d.getMinutes())).slice(-2);
    }
    timeDiff(from:string, to:string){
        return new Date(new Date(from).getTime() - new Date(to).getTime());
    }
    timeFormat(date:Date) {
        var d = date,
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
    
        return [year, month, day].join('-');
    }
    dayDiff(from:string, to:string){
        //diff.getUTCFullYear() - 1970; diff.getUTCMonth() 
        return this.timeDiff(from, to).getUTCDate() - 1;;
    }
    dayAdd(date:string, days:number) {
        var result = new Date(date);
        result.setDate(new Date(date).getDate() + days);
        return result;
    }
    // compress(str:string){
    //     return new Promise<string>((resolve,reject)=>{
    //         lzma./*LZMA().*/compress(str, 9, (result, error)=>{
    //             if(!error){
    //                 let utf8 = Buffer.from(result).toString('utf8');
    //                 let ucs2 = Buffer.from(result).toString('ucs2');
    //                 let utf16le = Buffer.from(result).toString('utf16le');
    //                 let binary = Buffer.from(result).toString('binary');
    //                 let hex = Buffer.from(result).toString('hex');
    //                 let base64 = Buffer.from(result).toString('base64');
    //                 let a1 = Buffer.from(utf8,'utf8');
    //                 let a2 = Buffer.from(ucs2,'ucs2');
    //                 let a3 = Buffer.from(hex,'hex');
    //                 let a4 = Buffer.from(base64,'base64');
    //                 return resolve(Buffer.from(result).toString('ucs2'));
    //             }else{
    //                 return reject(error);
    //             }
    //         });
    //     })
    // }
    // decompress(ucs2:string){
    //     return new Promise<string>((resolve,reject)=>{
    //         lzma./*LZMA().*/decompress(Buffer.from(ucs2,'ucs2'), (result, error)=>{
    //             if(!error){
    //                 return resolve(result);
    //             }else{
    //                 return reject(error);
    //             }
    //         });
    //     })
    // }
    debase64(data:string){
        let matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return new Error('Invalid input string');
        }
        return Buffer.from(matches[2], 'base64');
    }
    debase64type(data:string){
        let matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return new Error('Invalid input string');
        }
        return matches[1];
    }
    beginBatchCounter(){
        if(!fs.existsSync(COUNTERFILE)){
            fs.writeFileSync(COUNTERFILE, JSON.stringify({counter:2,begin:ID.now,end:''}));
            return 2;
        }else {
            let batch = JSON.parse(fs.readFileSync(COUNTERFILE).toString());
            return batch.end.length > 1 ? batch.counter : -100;
        }
        
    }
    endBatchCounter(){
        if(fs.existsSync(COUNTERFILE)){
            let batch = JSON.parse(fs.readFileSync(COUNTERFILE).toString());
            fs.writeFileSync(COUNTERFILE, JSON.stringify({counter:batch.counter,begin:batch.begin,end:ID.now}));
        }
    }
    passBatchCounter(){
        if(fs.existsSync(COUNTERFILE)){
            let batch = JSON.parse(fs.readFileSync(COUNTERFILE).toString());
            fs.writeFileSync(COUNTERFILE, JSON.stringify({counter:batch.counter+1,begin:batch.begin,end:batch.end,pass:ID.now}));
            return batch.counter;
        }
    }
    savebase64image(data:string){
        let d = this.debase64(data);
        let label = ID.long+'.jpg';
        if(!fs.existsSync(MEDIADIR)) fs.mkdirSync(MEDIADIR,{ recursive: true });
        fs.writeFileSync(MEDIADIR+label, d);
        return label;
    }
    get code(){
        var d = Math.floor(Math.random() * 10000);
        return d < 1000 ? 1000+d : d;
    }
    md5(key:string){
        return crypto.createHash('md5').update(key).digest('hex') ;
    }
    
}
export const ID = new Id();
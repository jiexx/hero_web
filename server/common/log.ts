import { ID } from "./id";

export class Log {
    static error(str: string) {
        const err = {};
        Error.captureStackTrace(err);
        console.log(ID.now, str, err['stack'].split("\n"));
    }
    static warning(str: string) {
        console.log(ID.now,str);
    }
    static info(...args:any) {
        console.log(ID.now,args.toString());
    }
}
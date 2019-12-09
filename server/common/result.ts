
export const ERR = function (msg:String = null, data:Object = null){
    return { code: 'ERR', msg: msg, data: data };
}

export const OK = function (data:Object = null,msg:any = ''){
    return { code: 'OK', msg: msg, data: data };
}

export const REDIRECT = function (data:Object = null,){
    return { code: 'REDIRECT', msg: '', data: data };
}

export const DIRECT = function (data:Object = null,type:string = null){
    return { code: 'DIRECT', msg: type, data: data };
}

export const FILE = function (type:string, dir:string = null){
    return { code: 'FILE', msg: type, data: dir  };
}
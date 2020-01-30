import { strictEqual } from "assert";
import { config } from "./config";
import { ID } from "../common/id";
import { G, V } from "../gorm/gorm";
import { Vertex } from "../gorm/vertex";
import { Log } from "../common/log";


export interface Query {
    uri: string;
    headers: Object;
    method: string;
    body: string;
    timeout: number
}
interface Selector {
    j:Object;
    x:Object;
}
interface Item {
    query: Query;
    indexTemplate: number;
    params: Object;
}
class Template{
    // curr: Selector;
    // next: Selector;
    // node: Vertex;
    batchNo: number;
    constructor(public curr: Selector, public next: Selector, public node: Vertex ){
        this.curr = new JSelector(curr);
        this.next = new JSelector(next);
    }
    parseCurrPage(data: JSON){
        return (this.curr as JSelector).parse(data, this.batchNo);
    }
    parseNextPage(data: JSON){
        return (this.next as JSelector).parse(data, this.batchNo);
    }
    setBatchNo(batchNo: number){
        this.batchNo = batchNo;
    }
}

class JSelector implements Selector{
    j: Object;    
    x: Object;
    jKeys: any[];
    constructor(selector:Selector){
        this.j = !selector ? {} : selector.j || {};
        this.x = !selector ? {} : selector.x || {};
        this.jKeys = Object.keys(this.j);
    }
    define(){
        let def = Object.keys(this.j).reduce((p, c) => { p[c] = {type: G.STRING}; return p}, {});
        def['createtime'] = {type: G.STRING};
        def['batch'] = {type: G.NUMBER};
        return def;
    }
    parse(data: JSON, batchNo: number){
        try {
            return this.jKeys.reduce((p, c) => {let ex = this.extract(this.j[c], data); if(ex){ex.forEach((e,i) => { p[i] = p[i] || {'createtime':ID.now,'batch':batchNo}; p[i][c] = e+'';});}; return p}, []);
        }catch(e){
            Log.error(e.toString());
            return null;
        }
    }
    extract(pattern:string, json:Object){
        var ptt = (' '+pattern.trim()).split(' .');
        ptt.splice(0,1);
        return this.jget(json, ptt);
    }
    jget(json, stack){
        if(stack.length==0){
            return json;
        }
        if(Object.prototype.toString.call(json) == '[object Object]'){
            var n = stack.splice(0,1);
            if(!n){
                return json;
            }
            for(var i in json){
                if(i == n){
                    return this.jget(json[i], stack);
                } 
            }
            return null;
        }else if(Object.prototype.toString.call(json) == '[object Array]'){
            var group = [];
            for(let k = 0 ; k < json.length ; k ++){
                group.push(this.jget(json[k], [...stack]));
            }
            for(let i in group){
                if(Object.prototype.toString.call(group[i]) == '[object Array]'&&group[i].length == 1){
                    group[i] = group[i][0];
                }
            }
            return group;
        }else {
            return json;
        }
    }
    
}



export class Pool {
    private _items: Item[] = [];
    private _templates: Template[] = [];
    empty() {
        return this._items.length <= 0;
    }
    pop() : Item{
        return this._items.shift();
    }
    async push(req:Query, result:any, indexTemplate:number){
        let template = this._templates[indexTemplate];
        
        // let js1 = new JSelector(template.curr);
        // let js2 = new JSelector(template.next);
        try {
            let data = JSON.parse(result);
            let curr = template.parseCurrPage(data);
            let next = template.parseNextPage(data);
            if(data && data.error) {
                throw Error(data.message);
            }
        
            if(curr && curr.length > 0){
                //console.log('B', curr.map(e=>{return e['B']}))
                await template.node.addBulk(curr);
            }
            if(!next ) {
                return null;
            }
            for(let i = 0 ; i < next.length ; i ++){
                this._items.push({
                    query:{
                        uri: next[i].url, 
                        headers: req.headers, 
                        method: req.method,
                        body: '',
                        timeout: 120000
                    }, 
                    indexTemplate: indexTemplate,
                    params: null
                })
            }
            return curr;
        }catch(e){
            Log.error(e.toString());
        }
    }
    info(){

    }
    private print(str:string, param:Object){
        let re = new RegExp (Object.keys(param).map(e =>{return '<%= '+e+' %>'}).join('|'), 'g');
        return str.replace(re,  (...args) => { return param[args[0].substring(4,args[0].length-3)]; });
    }

    async setup(batchNo: number){
        strictEqual(Object.prototype.toString.call(config.template)=='[object Array]', true,'config.template should be array');
        strictEqual(Object.prototype.toString.call(config.params)=='[object Array]', true,'config.params should be array');
        strictEqual(config.params.length==config.template.length, true,'config.template, params should be equal length');
        config.template.forEach((val, i)=>{
            strictEqual(Object.prototype.toString.call(config.params[i])=='[object Array]', true,'config.params should be array');
            strictEqual(Object.prototype.toString.call(config.template[i].url)=='[object String]', true,'config.template.url should be string');
            strictEqual(Object.prototype.toString.call(config.template[i].headers)=='[object Object]', true,'config.template.headers should be json');
            strictEqual(Object.prototype.toString.call(config.template[i].method)=='[object String]', true,'config.template.method should be string');
            strictEqual(Object.prototype.toString.call(config.template[i].body)=='[object Object]', true,'config.template.body should be string');
            strictEqual(Object.prototype.toString.call(config.template[i].curr)=='[object Object]', true,'config.template.curr , j, x should be json');
            strictEqual(config.template.length == config.params.length, true,'config.template.length == param');
            //strictEqual(config.template[i].next && Object.prototype.toString.call(config.template[i].next)=='[object Object]', true,'config.template.next should be json');
        });
        await G.connect(async () => {
            for(let i = 0 ; i < config.template.length ; i++) {
                let t = config.template[i];
                let def = new JSelector(t.curr).define();
                let node = await V.define(t.name.replace(/\./g,'_'), def);
                this._templates[i] = new Template(t.curr, t.next, node);//{ curr: t.curr, next: t.next, node: node };
                this._templates[i].setBatchNo(batchNo);
                config.params[i].forEach((p,j) => {
                    let str = JSON.stringify(t.body);
                    let body = this.print(str, p);
                    this._items.push({
                        query:{
                            uri: t.url, 
                            headers: t.headers, 
                            method: t.method,
                            body: JSON.parse(body),
                            timeout: 120000
                        }, 
                        indexTemplate: i,
                        params: p
                    })
                });
            }
        });
    }
};


export const POOL = new Pool();
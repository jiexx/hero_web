import { Entity, PrimaryGeneratedColumn, Column, Repository } from 'typeorm';
import { G } from './gorm';
import { Model } from './model';
import { Vertex } from './vertex';
import { Edge } from './edge';

export interface IInternalOptions {
    replace?: any;
    verties?: any;
    needLeftVertex?: boolean;
}
class Join {
    id: number;
    _e_id:number;
    _e_label: string;
    _v_from_id: number;
    _v_to_id: number;
    _v_from_label: string;
    _v_to_label: string;
 
};
export class JoinSQL {
    right = 'join';//Join;
    rightAlias = '$';
    rid = null;
    constructor(protected dir: string = 'from'){
        this.rid = dir == 'from' ? 'to' : 'from';
    }
    get ltag() {
        return {
            'Edge': `${this.rightAlias}._e`,
            'Vertex': `${this.rightAlias}._v_${this.rid}`
        };
    }
    get rtag() {
        return {
            'Edge': `${this.rightAlias}._e`,
            'Vertex': `${this.rightAlias}._v_${this.dir}`
        };
    }
    condition(left:Model, joinWhere:Model){
        let c1 = `${left.label}._label = ${this.ltag[left.constructor.name]}_label`;
        let c2 = ` AND ${left.label}.id = ${this.ltag[left.constructor.name]}_id`;

        let w1 = !left.label ? '' : ` AND ${left.label}._label = "${left.label}"`;
        let w2 = !left.id ? '' : ` AND ${left.label}.id = ${left.id}`;

        return c1 + (!joinWhere.id ? '' : c2) + w1 + w2;
    }
    where(left:Model, joinWhere:Model){
        let w1 = `${this.rtag[joinWhere.constructor.name]}_label = "${joinWhere.label}"`;
        let w2 = ` AND ${this.rtag[joinWhere.constructor.name]}_id = ${joinWhere.id}`;

        return  w1 + (!joinWhere.id ? '' : w2) ;
    }
    async query(left:Model, joinWhere:Model,opts:Object = null){
        let condition = this.condition(left, joinWhere);
        let where = this.where(left, joinWhere);
        let query = await left.repo.repository.createQueryBuilder(left.label)
            .leftJoinAndSelect(this.right, this.rightAlias, condition)
        if(opts){
            for(let opt in opts) {
                if(query[opt]){
                    if(Object.prototype.toString.call(opts[opt]).slice(8, -1) != 'Array'){
                        query = query[opt].apply(query, [opts[opt]]);
                    }else{
                        query = query[opt].apply(query, opts[opt]);
                    }
                }
            }
        }
        
        let result = query.where(where)
            .getMany();
            
        return result;
    }
}
class Alias {
    alias = '$';
    rid = null;
    constructor(protected dir: string = 'from'){
        this.rid = dir == 'from' ? 'to' : 'from';
    }
    name(n: number){
        let str = this.alias;
        for(let i = 0 ; i < n ; i ++) {
            str += this.alias;
        }
        return str;
    }
    get from() {
        return {
            'Edge': `_e`,
            'Vertex': `_v_${this.rid}`
        };
    };
    get to() {
        return {
            'Edge': `_e`,
            'Vertex': `_v_${this.dir}`
        }
    };
    condition_join_first(n: number, m: Model, countVLast: number){
        return `${this.name(countVLast)}.${this.to[m.constructor.name]}_id = ${m.label}${n}.id 
        AND '${m.label}' = ${this.name(countVLast)}.${this.to[m.constructor.name]}_label`
    }
    condition_join_model(n: number, m: Model, countVLast: number){
        return `${this.name(countVLast)}.${this.from[m.constructor.name]}_id = ${m.label}${n}.id 
        AND '${m.label}' = ${this.name(countVLast)}.${this.from[m.constructor.name]}_label`
    }
    condition_join_iterate(n: number, m: Model, countVLast: number){
        return `${this.name(countVLast-1)}.${this.from[m.constructor.name]}_id = ${this.name(countVLast)}.${this.to[m.constructor.name]}_id  
        AND ${this.name(countVLast-1)}.${this.from[m.constructor.name]}_label = ${this.name(countVLast)}.${this.to[m.constructor.name]}_label`
    }
    where(n: number, m: Model[], w: Model){
        return m.reduce((str,e,i) =>{
            return str += (e.id && e.id > -1 ?  
                `${e.id} = ${this.name(i)}.${this.from[e.constructor.name]}_id AND '${e.label}' = ${this.name(i)}.${this.from[e.constructor.name]}_label AND ` 
                : 
                `'${e.label}' = ${this.name(i)}.${this.from[e.constructor.name]}_label AND `);
        }, (w.id && w.id > -1 ?  
            `${w.id} = ${this.name(0)}.${this.to[w.constructor.name]}_id AND '${w.label}' = ${this.name(0)}.${this.to[w.constructor.name]}_label AND ` 
            : 
            `'${w.label}' = ${this.name(0)}.${this.to[w.constructor.name]}_label AND `)
        );
    }
    beginWhere(w: Model){
        return (w.id && w.id > -1 ?  
            `${w.id} = ${this.name(0)}.${this.to[w.constructor.name]}_id AND '${w.label}' = ${this.name(0)}.${this.to[w.constructor.name]}_label AND ` 
            : 
            `'${w.label}' = ${this.name(0)}.${this.to[w.constructor.name]}_label AND `);
    }
    iterateWhere(countVLast: number, e: Model){
        return (e.id && e.id > -1 ?  
            `${e.id} = ${this.name(countVLast)}.${this.from[e.constructor.name]}_id AND '${e.label}' = ${this.name(countVLast)}.${this.from[e.constructor.name]}_label AND ` 
            : 
            `'${e.label}' = ${this.name(countVLast)}.${this.from[e.constructor.name]}_label AND `);
    }
}
export class ExJoinSQL {
    relation = 'join';//Join;
    alias: Alias ;
    iterator: JoinIterator;
    constructor( dir: string = 'from'){
        this.alias = new Alias(dir);
        this.iterator = new JoinIterator().create(dir);
    }
    _first(q: any, m: Model) {
        if( !m.id || m.id < 0 ){
            return q.leftJoinAndSelect( m.label, m.label+0, this.alias.condition_join_first(0, m, 0));
        }
        return null;
    }
    _begin(q: any, m: Model, first: number = 0) {
        return q.leftJoinAndSelect( m.label, m.label+first, this.alias.condition_join_model(first, m, 0));
    }
    _iterate(q: any, m: Model, n: number, countVLast: number) {
        return q.leftJoinAndSelect(this.relation, this.alias.name(countVLast), this.alias.condition_join_iterate(n, m, countVLast))
                .leftJoinAndSelect( m.label, m.label+n, this.alias.condition_join_model(n, m, countVLast));
    }
    _iterateWithoutV(q: any, m: Model, n: number, countVLast: number) {
        return q.leftJoinAndSelect( m.label, m.label+n, this.alias.condition_join_model(n, m, countVLast));
    }
    _end(q: any, m: Model[], n: number, joinWhere: Model) {
        let where = this.alias.where(n, m, joinWhere);
        return q.where(where.substr(0, where.length-4));
    }
    
    ELast(m:Model){
        return m.constructor.name == 'Edge'
    }
    VLast(m:Model){
        return m.constructor.name == 'Vertex'
    }
    async count0(list:Model[],joinWhere:Model,opts:Object = null){
        //console.log(G);
        if(!G.join){
            await G.getJoin();
        }
        let q = G.join.repository.createQueryBuilder(this.alias.name(0)).select("count(*)", "count");
        let countVLast = 0;
        let where = this.alias.beginWhere(joinWhere);
        let query = this._begin(q, list[0]);
        where += this.alias.iterateWhere(countVLast, list[0]);
        
        for(let i = 1 ; i < list.length ; i ++) {
            if(this.ELast(list[i-1])) {
                where += this.alias.iterateWhere(countVLast, list[i]);
                query = this._iterateWithoutV(query, list[i], i, countVLast);
            }else {
                countVLast ++;
                where += this.alias.iterateWhere(countVLast, list[i]);
                query = this._iterate(query, list[i], i, countVLast);
            }
        }
        query = q.where(where.substr(0, where.length-4))//this._end(query, list, list.length, joinWhere);

        if(opts){
            for(let opt in opts) {
                if(query[opt]){
                    if(Object.prototype.toString.call(opts[opt]).slice(8, -1) != 'Array'){
                        query = query[opt].apply(query, [opts[opt]]);
                    }else{
                        query = query[opt].apply(query, opts[opt]);
                    }
                }
            }
        }
        //console.log(query.getSql());
        let result = await query.getRawOne();
        return result.count;
    }
    async query0(list:Model[],joinWhere:Model,opts:Object = null){
        //console.log(G);
        if(!G.join){
            await G.getJoin();
        }
        let q = G.join.repository.createQueryBuilder(this.alias.name(0));

        let countVLast = 0;
        let where = this.alias.beginWhere(joinWhere);
        let first = this._first(q, joinWhere);
        let offset = !first ? 0 : 1;
        let query = !first ? this._begin(q, list[0]) : this._begin(first, list[0], 1);
        where += this.alias.iterateWhere(countVLast, list[0]);
        
        for(let i = 1 ; i < list.length ; i ++) {
            if(this.ELast(list[i-1])) {
                where += this.alias.iterateWhere(countVLast, list[i]);
                query = this._iterateWithoutV(query, list[i], i+offset, countVLast);
            }else {
                countVLast ++;
                where += this.alias.iterateWhere(countVLast, list[i]);
                query = this._iterate(query, list[i], i+offset, countVLast);
            }
        }
        query = q.where(where.substr(0, where.length-4))//this._end(query, list, list.length, joinWhere);
        
        if(opts){
            for(let opt in opts) {
                if(query[opt]){
                    if(Object.prototype.toString.call(opts[opt]).slice(8, -1) != 'Array'){
                        query = query[opt].apply(query, [opts[opt]]);
                    }else{
                        query = query[opt].apply(query, opts[opt]);
                    }
                }
            }
        }
        //console.log(query.getSql());
        let result = await query.getRawMany();
        let transform = this.transform(result, list, opts && opts['replacement']);
        return transform;
    }

    async count(list:Model[],joinWhere:Model,opts:Object = null){
        //console.log(G);
        if(!G.join){
            await G.getJoin();
        }
        let query = G.join.repository.createQueryBuilder(this.alias.name(0)).select("count(*)", "count");
        let groups = list.reduce((p,c,i)=>{ this.VLast(c) ? p.push({V:c,E:[]}) : p[i].E.push(c); return p }, [this.VLast(joinWhere) ? {V:joinWhere,E:[]} : {V: null, E:[joinWhere]}]) 
        
        groups.forEach(e =>{
            query = this.iterator.iterate(e.V, e.E as Edge[], query) as any;
        })
        query = query.where(this.iterator._where);


        if(opts){
            for(let opt in opts) {
                if(query[opt]){
                    if(Object.prototype.toString.call(opts[opt]).slice(8, -1) != 'Array'){
                        query = query[opt].apply(query, [opts[opt]]);
                    }else{
                        query = query[opt].apply(query, opts[opt]);
                    }
                }
            }
        }
        //console.log(query.getSql());
        let result = await query.getRawOne();
        return result.count;
    }
    async query(list:Model[],joinWhere:Model,opts:Object = null){
        //console.log(G);
        if(!G.join){
            await G.getJoin();
        }
        let query = G.join.repository.createQueryBuilder(this.iterator._joinAlias);

        let groups = list.reduce((p,c,i)=>{ this.VLast(c) ? p.push({V:c,E:[]}) : p[p.length-1].E.push(c); return p }, [this.VLast(joinWhere) ? {V:joinWhere,E:[]} : {V: null, E:[joinWhere]}]) 

        opts && this.iterator.needV0(opts['__InternalOptions']);
        groups.forEach(e =>{
            query = this.iterator.iterate(e.V, e.E as Edge[], query) as any;
        })
        query = query.where(this.iterator._where);
        
        if(opts){
            for(let opt in opts) {
                if(query[opt]){
                    if(Object.prototype.toString.call(opts[opt]).slice(8, -1) != 'Array'){
                        query = query[opt].apply(query, [opts[opt]]);
                    }else{
                        query = query[opt].apply(query, opts[opt]);
                    }
                }
            }
        }
        //console.log(query.getSql());
        let result = await query.getRawMany();
        //let transform = this.transform(result, list, opts && opts['__InternalOptions']);
        return this.iterator.transform(result);
    }
    transform(data:any[], list:Model[], iopts: IInternalOptions = null){
        let T = null;
        if(iopts){
            iopts.replace && (T = list.reduce((p,v,i)=>{p = Object.assign(p, v.columns().reduce((col,c)=>{  col[iopts.replace[v.label+i]+'_'+c] = {on: v.label +'_'+(i),prop:c}; return col;}, {})); return p},{}));
            iopts.verties && (T = iopts.verties.reduce((p,v) => {if(!p[v]){p[v]={on:v,prop:v}}; return p}, T));
        }else {
            T = list.reduce((p,v,i)=>{p = Object.assign(p, v.columns().reduce((col,c)=>{  col[v.label+(i)+'_'+c] = {on: v.label +'_'+(i),prop:c}; return col;}, {})); return p},{});
        }
        return data.map(row => { return Object.keys(row).reduce((p,v)=>{if(!T[v]){ return p;}; if(!p[T[v].on]){p[T[v].on]={}}; p[T[v].on][T[v].prop]=row[v]; return p;},{}) });    }
}

class JoinIterator {
    static R = 'join';
    static TAG = '$';
    static DIR: string[] = ['from', 'to'];
    N: {Vertex:string, Edge:string} = {'Vertex':'_v_', 'Edge':'_e'}
    private indicator: number = 0;
    private index: number = 0;
    private prev: JoinIterator;
    setDirection(direction: string = 'from'){
        this.indicator = direction == 'from' ? 1 : 0;
    }
    create(direction: string = 'from'){
        this.setDirection(direction);
        this.prev = new JoinIterator();
        this.prev.setDirection(direction);
        return this;
    }
    step(){
        if(this.index == 0){
            this.index ++
        }else {
            this.index ++;
            this.prev.index ++;
        }
    }
    get _joinAlias(){
        return new Array(this.index+2).join(JoinIterator.TAG);
    }
    private get _from(){
        return JoinIterator.DIR[this.indicator];
    }
    private get _to(){
        return JoinIterator.DIR[1-this.indicator];
    }
    private _n(node: 'Vertex' | 'Edge' = 'Vertex'){
        return this.N[node];
    }
    _nodeAlias(node: Model){
        return `${node.label}${this.index}`;
    }

    n_p(node: Model, p: 'id'| 'label'){
        return (node[p] && typeof node[p] == 'string' && `'${node[p]}'`) 
        || (node[p] && typeof node[p] == 'number' && `${node[p]}`)
        ||`${this._nodeAlias(node)}.${p == 'id' ? 'id' : '_label'}`
    }

    from_n_p(p: 'id'| 'label', node: 'Vertex' | 'Edge' = 'Vertex'){
        return `${this._joinAlias}.${this._n(node)}${node == 'Vertex' ? this._from : ''}_${p}`;
    }
    to_n_p(p: 'id'| 'label', node: 'Vertex' | 'Edge' = 'Vertex'){
        return `${this._joinAlias}.${this._n(node)}${node == 'Vertex' ? this._to : ''}_${p}`;
    }

    curr_to_n_p_equal_prev_from_n_p(){
        return ['id','label'].map(e => `${this.to_n_p(e as any)} = ${this.prev.from_n_p(e as any)}`).join(' AND ');
    }
    x1il_equal_x2(node: Model, x1:(node: Model, p: 'id'| 'label')=>void, x2: (p: 'id'| 'label', node: 'Vertex' | 'Edge')=>void ){
        return ['id', 'label'].map(e => `${x1.call(this, node, e as any)} = ${x2.call(this, e as any, node.constructor.name as any)}`).join(' AND ');
    }
    x1i_equal_x2(node: Model, x1:(node: Model, p: 'id'| 'label')=>void, x2: (p: 'id'| 'label', node: 'Vertex' | 'Edge')=>void ){
        return (node.id && node.id > -1 ? ['id', 'label'] : ['label']).map(e => `${x1.call(this, node, e as any)} = ${x2.call(this, e as any, node.constructor.name as any)}`).join(' AND ');
    }
    joinPrev(qb: {leftJoinAndSelect:(name: string, alias: string, condition: string)=>any}){
        return qb.leftJoinAndSelect(JoinIterator.R, this._joinAlias, this.curr_to_n_p_equal_prev_from_n_p());
    }
    private _transformor = {};
    transform(result: any[]){
        return result.map(row => { return Object.keys(row).reduce((p,v)=>{if(!this._transformor[v]){ return p;}; if(!p[this._transformor[v].on]){p[this._transformor[v].on]={}}; p[this._transformor[v].on][this._transformor[v].prop]=row[v]; return p;},{}) });   
    }
    joinModel(node: Model, qb: {leftJoinAndSelect:(name: string, alias: string, condition: string)=>any}, x_n_p:(p: 'id'| 'label', node: 'Vertex' | 'Edge')=>any = this.from_n_p){
        !this._replaces ? this._transformor = {...this._transformor, ...(node.columns().reduce((col,c)=>{  col[this._nodeAlias(node)+'_'+c] = {on: node.label +'_'+(this.index),prop:c}; return col;}, {}))}
                        : this._transformor = {...this._transformor, ...(node.columns().reduce((col,c)=>{  col[this._nodeAlias(node)+'_'+c] = {on: (this._replaces[this._nodeAlias(node)] || node.label) +'_'+(this.index),prop:c}; return col;}, {}))};
        return qb.leftJoinAndSelect(node.label, this._nodeAlias(node), this.x1il_equal_x2(node, this.n_p, x_n_p) );
    }
    to_n_p_equal_n_p(node: Model){
        return this.x1i_equal_x2(node, this.n_p, this.to_n_p)
    }
    from_n_p_equal_n_p(node: Model){
        return this.x1i_equal_x2(node, this.n_p, this.from_n_p)
    }

    /* V0  E...   V    E...   V

    to<---e----from        
                   <----e-----from */
    private _needV0: boolean = false;
    private _replaces = null;
    needV0(iopts: IInternalOptions){
        if(!iopts){
            return;
        }
        iopts.needLeftVertex && (this._needV0 = iopts.needLeftVertex);

        iopts.verties && (this._transformor = iopts.verties);//iopts.verties.reduce((p,v) => {if(!p[v]){p[v]={on:v,prop:v}}; return p}, this._transformor);

        iopts.replace && (this._replaces = iopts.replace);
    }
    private _count: number = 0;
    iterate(v: Vertex, es: Edge[], qb: {leftJoinAndSelect:(name: string, alias: string, condition: string)=>any}){
        let q  = qb;
        if(this._count == 0) {
            this._where = this.to_n_p_equal_n_p(v);
            es.forEach(e => this._where += ' AND ' + this.to_n_p_equal_n_p(e));
            if(this._needV0){
                q = this.joinModel(v, q, this.to_n_p);
            }

            q = es.reduce((p,e)=>this.joinModel(e, p), q);
            this._count ++;
        }else if(this._count == 1) {
            this._where += ' AND ' +  this.from_n_p_equal_n_p(v);
            q = this.joinModel(v, q);

            this._count ++;
            this.step();
        }else{
            this._where += ' AND ' +  this.from_n_p_equal_n_p(v);
            es.forEach(e => this._where += ' AND ' + this.from_n_p_equal_n_p(e));

            q = this.joinPrev(q);
            q = this.joinModel(v, q);
            q = es.reduce((p,e)=>this.joinModel(e, p), q);

            this.step();
        }
        return q;
    }
    _where: string = '';
}



export abstract class Repo {
    constructor(protected label: string,  public schema:Object, public repository: Repository<any> = null){
        const clz = this.getClass(this.label);
        this.repository = this.create(clz);
    }
    abstract getClass(label: string) : any;
    abstract create(clazz: any): Repository<any>
    async sync(){
        await G.connection.synchronize();
    }
    async save<T>(props:any){
        let propeties = await this.repository.save(props);
        return propeties;
    }
    async remove<T>(props:any){
        let propeties = await this.repository.remove(props);
        return propeties;
    }
    async find(props: Object) {
        let propeties = await this.repository.find(props);
        return propeties;
    }
    async hasId(id: number) {
        let propeties = await this.repository.findOne(id);
        return propeties;
    }
    async stream(opts: Object = null){
        let stream = await this.repository.createQueryBuilder(this.label);
        for(let opt in opts) {
            if(stream[opt]){
                if(Object.prototype.toString.call(opts[opt]).slice(8, -1) != 'Array'){
                    stream = stream[opt].apply(stream, [opts[opt]]);
                }else{
                    stream = stream[opt].apply(stream, opts[opt]);
                }
            }
        }
        let s = await stream.stream();
        return (s as any).stream();
    }
    async clear(){
        await this.repository.clear();
    }
    
}

export class ModelRepo extends Repo {
    constructor(schema: Object, model: Model){
        schema['id'] = { type: G.NUMBER };
        schema['_label'] = { type: G.STRING, len: 64 };
        schema['_type'] = { type: G.STRING, len: 1 };
        super(model.label, schema);
    }
    getClass(label: string) : any{
        let func =  (name) => ({[name] : class {}})[name];
        //var clz = ({[label] : class {}})[label]
        let clazz = func(label);
        clazz.prototype['id'] = -1;
        clazz.prototype['_label'] = null;
        clazz.prototype['_type'] = null;
        Object.keys(this.schema).forEach(propertyName => {
            clazz.prototype[propertyName] = null;
        });
        //Object.defineProperty(clazz.constructor, 'name', { value: label, writable: false });
        //Object.defineProperty(clazz, 'name', { value: label, writable: false });
        return clazz;
    }
    create(clazz: any): Repository<any>{
        PrimaryGeneratedColumn()(clazz.prototype, 'id');
        Column({ type: 'varchar', length: 64 })(clazz.prototype, '_label');
        Column({ type: 'varchar', length: 1 })(clazz.prototype, '_type');
        Object.keys(this.schema).forEach(propertyName => {
            if(this.schema[propertyName].type == G.STRING) {
                Column({ type: this.schema[propertyName].type || G.STRING, length: this.schema[propertyName].len || 512, default: this.schema[propertyName].default || '', charset:'utf8'})(clazz.prototype, propertyName);
            }else if(this.schema[propertyName].type == G.NUMBER){
                Column({ type: this.schema[propertyName].type || G.NUMBER, default: this.schema[propertyName].default || 0})(clazz.prototype, propertyName);
            }else {
                Column({ type: this.schema[propertyName].type })(clazz.prototype, propertyName);
            }
        })
        if(!G.connection.options.entities){
            (G.connection.options.entities as any)= [];    
        }
        Entity(this.label)(clazz);
        G.connection.options.entities.push(clazz);

        (G.connection as any).buildMetadatas();
        return G.connection.getRepository(clazz);
    }
}
export class JoinRepo extends Repo {
    constructor(){
        let schema = {
            _e_id: {
                type: G.NUMBER,
                required: true,
            },
            _e_label: {
                type: G.STRING,
                required: true,
                len: 64
            },
            _v_from_id: {
                type: G.NUMBER,
                required: true,
            },
            _v_from_label: {
                type: G.STRING,
                required: true,
                len: 64
            },
            _v_to_id: {
                type: G.NUMBER,
                required: true,
            },
            _v_to_label: {
                type: G.STRING,
                required: true,
                len: 64
            },
        }
        super('join', schema);
    }
    getClass(label: string) : any{
        let func =  (name) => ({[name] : class {}})[name];
        let clazz = func(label);
        clazz.prototype['id'] = -1;
        Object.keys(this.schema).forEach(propertyName => {
            clazz.prototype[propertyName] = null;
        });
        return clazz;
        //return Join;
    }
    create(clazz: any): Repository<any>{
        PrimaryGeneratedColumn()(clazz.prototype, 'id');
        // Column({ type: 'int' })(clazz.prototype, '_e_id');
        // Column({ type: 'varchar', length: 64 })(clazz.prototype, '_e_label');
        // Column({ type: 'int' })(clazz.prototype, '_v_from_id');
        // Column({ type: 'int' })(clazz.prototype, '_v_to_id');
        // Column({ type: 'varchar', length: 64 })(clazz.prototype, '_v_from_label');
        // Column({ type: 'varchar', length: 64 })(clazz.prototype, '_v_to_label');
        // Entity('Join')(clazz);

        // if(!G.connection.options.entities){
        //     (G.connection.options.entities as any)= [];    
        // }
        // G.connection.options.entities.push(clazz);
        
        // (G.connection as any).buildMetadatas();
        // return G.connection.getRepository(clazz);
        Object.keys(this.schema).forEach(propertyName => {
            if(this.schema[propertyName].type == G.STRING) {
                Column({ type: this.schema[propertyName].type || G.STRING, length: this.schema[propertyName].len || 512 })(clazz.prototype, propertyName);
            }else {
                Column({ type: this.schema[propertyName].type })(clazz.prototype, propertyName);
            }
        })
        if(!G.connection.options.entities){
            (G.connection.options.entities as any)= [];    
        }
        Entity(this.label)(clazz);
        G.connection.options.entities.push(clazz);

        (G.connection as any).buildMetadatas();
        return G.connection.getRepository(clazz);
    }
    async join(from:Vertex, to:Vertex, edge:Edge){
        await G.join.save({_e_id:edge.id,_e_label:edge.label, _v_from_label: from.label, _v_to_label: to.label, _v_from_id: from.id, _v_to_id: to.id });
    }
    async joins(froms:Vertex[], tos:Vertex[], edges:Edge[]){
        if(froms.length == tos.length && tos.length == edges.length){
            let data = edges.map((v,i)=>{return {_e_id:v.id,_e_label:v.label, _v_from_label: froms[i].label, _v_to_label: tos[i].label, _v_from_id: froms[i].id, _v_to_id: tos[i].id }});
            await G.join.save(data);
        }
    }
    async unjoin(from:Vertex = null, to:Vertex = null, edge:Edge = null){
        let join = {};
        if(from) {
           join['_v_from_label'] = from.label;
           join['_v_from_id'] = from.id;
        }
        if(to) {
            join['_v_to_label'] = to.label;
            join['_v_to_id'] = to.label;
        }
        if(edge) {
            join['_e_label'] = edge.label;
            join['_e_id'] = edge.id;
        }
        let e = await G.join.find(join);
        if(e.length > 0){
            return await G.join.remove(e);
        }
    }
    async unjoins(edges:Edge[] = null){
        let join = edges.reduce((p,c)=>{p.push({_e_label:c.label,_e_id:c.id});return p}, [])
        let e = await G.join.find({where:join});
        if(e.length > 0){
            return await G.join.remove(e);
        }
    }
}

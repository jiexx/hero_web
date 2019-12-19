
import { G } from "./gorm";
import { Model } from "./model";
import { Vertex } from "./vertex";
import { ModelRepo, JoinRepo, Repo } from "./repo";


export class Edge extends Model {
    
    private _from: Vertex = null;
    private _to: Vertex = null;

    constructor(label: string, schema:Object = null){
        super(label);
        if(!G.edges[label] && schema){
            G.edges[label] = new ModelRepo(schema, this);
        }
        this.repo = G.edges[label];
        //return vextex.extendProperties(props);
    }

    async add(props:Object){
        let o = await this.addE(props);
        let inst = new Edge(this.label);
        return inst.extendProperties(o);
    }
    async addE(props: Object) {
        const checkSchemaResponse = this.checkSchema(this.repo.schema, props, true);
        if (this.checkSchemaFailed(checkSchemaResponse)) {
            throw (checkSchemaResponse);
        }
        props['_label'] = this.label;
        props['_type'] = 'E';
        return await this.repo.save(props) as Edge;
    }
    static instance(result:any[]):Edge[]{
        if(Object.prototype.toString.call(result).slice(8, -1) == 'Array'){
            return result.reduce((p,c)=>{let inst = new Edge(c._label); inst.extendProperties(c); p.push(inst); return p},[]);
        }
    }
    async find(where:Object){
        let o = await this.repo.find(where);
        return Edge.instance(o);
    }

    async remove(){
        await this.repo.remove(this.id?{id:this.id}:{});
        if(!G.join){
            await G.getJoin();
        }
        if(G.join){
            await G.join.unjoin(null, null, this);
        }
        return this;
    }

    from(alias: Vertex ) {
        this._from = alias;
        return this;
    }

    to(alias: Vertex ) {
        this._to = alias;
        return this;
    }
    async next() {
        if (this._from && this._to ) {
            if(!G.join){
                await G.getJoin();
            }
            if(Object.prototype.toString.call(this._from).slice(8, -1) == 'Object'
                && Object.prototype.toString.call(this._to).slice(8, -1) == 'Object'
                && this._from.constructor.name == 'Vertex'
                && this._to.constructor.name == 'Vertex'
            ){
                await G.join.join(<Vertex>this._from, <Vertex>this._to, this);
            }
        }
    }

    async outV(where:Vertex, opts = null) {
        let o = await super.outV(where, opts);
        return Vertex.instance(o);
    }
    
    async inV(where:Vertex, opts = null) {
        let o = await super.inV(where, opts);
        return Vertex.instance(o);
    }
        
}



export class Edges extends Array<Edge> {
    private _from: Vertex[] = null;
    private _to: Vertex[]  = null;
    constructor(private repoEdge: Edge){
        super();
    }
    async add(props: Object[]){
        return await this.addE(props);
    }
    async addE(props: Object[]) {
        let edges = Edge.instance(props);
        if (edges.length < 1) {
            return null;    
        }
        edges.forEach((e,i) =>{
            // const checkSchemaResponse = e.checkSchema(e.repo.schema, props[i], true);
            // if (e.checkSchemaFailed(checkSchemaResponse)) {
            //     throw (checkSchemaResponse);
            // }
            props[i]['_label'] = e.label;
            props[i]['_type'] = 'E';
        })
        let prop = props.reduce((p:Object[],c)=>{p.push(c);return p},[])
        
        let result = await this.repoEdge.repo.save(prop);
        if(result.length < 1){
            return null;
        }
        this.push(...Edge.instance(result));
        return this;
    }
    from (alias: Vertex[] ) {
        this._from = alias;
        return this;
    }
    to(alias: Vertex[] ){
        this._to = alias;
        return this;
    }
    async next() {
        if (this._from && this._to ) {
            if(!G.join){
                await G.getJoin();
            }
            if(Object.prototype.toString.call(this._from).slice(8, -1) == 'Array'
                && Object.prototype.toString.call(this._to).slice(8, -1) == 'Array'
            ){
                await G.join.joins(this._from, this._to, this as any);
            }
        }
    }
    async drops(){
        if(this.length < 1){
            return;
        }
        let prop = this.reduce((p:Object[],c)=>{p.push({id:c.id});return p},[])
        let o = await this[0].repo.remove(prop);
        if(G.join){
            await G.join.unjoins(this);
        }
        return Edge.instance(o);
    }
}

import { G } from "./gorm";
import { Model } from "./model";
import { Vertex } from "./vertex";
import { ModelRepo, JoinRepo } from "./repo";


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

    async remove(props:Object){
        let o = await this.repo.remove(props);
        if(G.join){
            await G.join.unjoin(null, null, this);
        }
        return Edge.instance(o);
    }

    from(alias: Vertex) {
        this._from = alias;
        return this;
    }

    to(alias: Vertex) {
        this._to = alias;
        return this;
    }
    async next() {
        if (this._from && this._to ) {
            if(!G.join){
                G.getJoin();
            }
            await G.join.join(this._from, this._to, this);
        }
    }

    async outV(where:Vertex) {
        let o = await super.outV(where);
        return Vertex.instance(o);
    }
    
    async inV(where:Vertex) {
        let o = await super.inV(where);
        return Vertex.instance(o);
    }
        
}
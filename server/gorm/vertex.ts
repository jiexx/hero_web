import { Model } from "./model";
import { G } from "./gorm";
import { Repo, ModelRepo } from "./repo";
import { Edge } from "./edge";

declare global {
    interface Array<T> {
        remove(elem: T): Array<T>;
    }
}

if (!Array.prototype.remove) {
    Array.prototype.remove = function <T>(this: T[], elem: T): T[] {
        return this.filter(e => e !== elem);
    }
}
/**
* @param {string} label
* @param {object} schema
* @param {object} gorm
*/
export class Vertex extends Model {


    constructor(label: string, schema: Object = null){
        super(label);
        if(!G.vertices[label] && schema){
            G.vertices[label] = new ModelRepo(schema, this);
        }
        this.repo = G.vertices[label];
        //return vextex.extendProperties(props);
    }
    // as(alias: string) {
    //     G.aliases[alias] = this;
    //     return this;
    // }

    async add(props:Object){
        let o = await this.addV(props);
        let inst = new Vertex(this.label);
        return inst.extendProperties(o);
    }
    async addBulk(props:Array<Object>){
        let os = await this.addVBulk(props);
        return os.reduce((p,c)=>{let inst = new Vertex(this.label); inst.extendProperties(c);p.push(inst); return p}, [])
    }
    async remove(props:Object){
        let o = await this.repo.remove(props);
        return Vertex.instance(o);
    }
    async removeAll(props:Object){
        let o = await this.repo.remove(props);
        return Vertex.instance(o);
    }
    addE(edge: Edge) {
        return edge.from(this)
    }
    private async addV(props:Object) {
        const checkSchemaResponse = this.checkSchema(this.repo.schema, props, true);
        if (this.checkSchemaFailed(checkSchemaResponse)) {
            throw (checkSchemaResponse);
        }
        props['_label'] = this.label;
        props['_type'] = 'V';
        return await this.repo.save(props) as Vertex;
    }
    private async addVBulk(props:Array<Object>) {
        const checkSchemaResponse = this.checkSchema(this.repo.schema, props[0], true);
        if (this.checkSchemaFailed(checkSchemaResponse)) {
            throw (checkSchemaResponse);
        }
        props.forEach(e=>{e['_label'] = this.label;e['_type'] = 'V'});
        return await this.repo.save(props) as Vertex[];
    }

    static instance(result: any[]):Vertex[]{
        if(Object.prototype.toString.call(result).slice(8, -1) == 'Array'){
            return result.reduce((p,c)=>{let inst = new Vertex(c._label); inst.extendProperties(c); p.push(inst); return p},[]);
        }
    }
    async find(where:Object){
        let o = await this.repo.find(where);
        return Vertex.instance(o);
    }
    async out(target:Edge) {
        let o = await super.out(target);
        return Edge.instance(o);
    }
    
    async in(target:Edge) {
        let o = await super.in(target);
        return Edge.instance(o);
    }

    async outV(target:Vertex) {
        let o = await super.outV(target);
        return Vertex.instance(o);
    }
    
    async inV(target:Vertex) {
        let o = await super.inV(target);
        return Vertex.instance(o);
    }
    async exOut(target:Model[], opts:Object = null) {
        let o = await super.exOut(target, opts);
        return o;
    }
    
    async exIn(target:Model[], opts:Object = null) {
        let o = await super.exIn(target, opts);
        return o;
    }

    async exOutCount(target:Model[], opts:Object = null) {
        let o = await super.exOutCount(target, opts);
        return o;
    }
    
    async exInCount(target:Model[], opts:Object = null) {
        let o = await super.exInCount(target, opts);
        return o;
    }
}
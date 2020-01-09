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
    async addBulk(props:Object[]){
        let os = await this.addVBulk(props);
        return os.reduce((p,c)=>{let inst = new Vertex(this.label); inst.extendProperties(c);p.push(inst); return p}, [])
    }
    async remove(){
        await this.repo.remove({id:this.id});
        return this;
    }
    async removeBulk(props:Object[]){
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
    async out(target:Edge, opts:Object = null) {
        let o = await super.out(target, opts);
        return Edge.instance(o);
    }
    
    async in(target:Edge, opts:Object = null) {
        let o = await super.in(target, opts);
        return Edge.instance(o);
    }

    async outV(target:Vertex, opts:Object = null) {
        let o = await super.outV(target, opts);
        return Vertex.instance(o);
    }
    
    async inV(target:Vertex, opts:Object = null) {
        let o = await super.inV(target, opts);
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

export class Vertices extends Array<Vertex> {
    constructor(private repoVertex: Vertex){
        super();
    }
    async add(props: Object[]){
        return await this.addV(props);
    }
    async addV(props: Object[]) {
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
        
        let result = await this.repoVertex.repo.save(prop);
        if(result.length < 1){
            return null;
        }
        this.push(...Vertex.instance(result));
        return this;
    }
    async drops(){
        if(this.length < 1){
            return;
        }
        let prop = this.reduce((p:Object[],c)=>{p.push({id:c.id});return p},[])
        let o = await this[0].repo.remove(prop);
        return o;
    }
}
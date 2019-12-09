
import { Vertex } from "./vertex";
import { Edge } from "./edge";
import { G } from "./gorm";
import { Repo, ModelRepo, JoinSQL, ExJoinSQL } from "./repo";

class Join {
    id: number;
    name: string;
    _v_from_id: number;
    _v_to_id: number;
    _v_from_label: string;
    _v_to_label: string;
};

type ExtendedProperties<T> = { [P in keyof T]: T[P] };
/**
* @param {object} gorm
* @param {string} gremlinStr
*/
export abstract class Model {
    private _repo: ModelRepo;
    get repo() {
        return this._repo;
    }
    set repo(repo: ModelRepo) {
        this._repo = repo;
    }
    constructor(label: string ) { this._label =  label;}

    private clz<T>(className: string) {
        var newInstance = Object.create(window[className].prototype);
        newInstance.constructor.apply(newInstance);
        return newInstance as any & ExtendedProperties<T>;
    }
    private _label: string = null;
    get label() {
        return this._label;
    }
    private _id: number = null;
    get id() {
        return this._id;
    }
    set id(id:number) {
        this._id = id;
    }

    protected extendProperties(props: Object) {
        this._id = props['id'];
        this['_label'] = this.label;
        return Object.keys(props).reduce((prev, curr, i) => { prev[curr] = props[curr]; return prev; }, this);
    }

    columns(){
        return Object.keys(this.repo.schema);
    }

    properties(){
        return Object.keys(this.repo.schema).reduce((p,c)=>{p[c]=this[c];return p},{});
    }
    
    async outV(out: Vertex){
        let jsql = new JoinSQL('from');
        let result = await jsql.query(out, this);
        return result;
    }
    async inV(In: Vertex){
        let jsql = new JoinSQL('to');
        let result = await jsql.query(In, this);
        return result;
    }
    async out(out: Edge){
        let jsql = new JoinSQL('from');
        let result = await jsql.query(out, this);
        return result;
    }
    async in(In: Edge){
        let jsql = new JoinSQL('to');
        let result = await jsql.query(In, this);
        return result;
    }

    async exOut(out: Model[], opts:Object = null){
        let jsql = new ExJoinSQL('from');
        let result = await jsql.query(out, this, opts);
        return result;
    }
    async exIn(In: Model[], opts:Object = null){
        let jsql = new ExJoinSQL('to');
        let result = await jsql.query(In, this, opts);
        return result;
    }

    async exOutCount(out: Model[], opts:Object = null){
        let jsql = new ExJoinSQL('from');
        let result = await jsql.count(out, this, opts);
        return result;
    }
    async exInCount(In: Model[], opts:Object = null){
        let jsql = new ExJoinSQL('to');
        let result = await jsql.count(In, this, opts);
        return result;
    }
    
    project(...args: string[]){
        return args.reduce((pr,cu)=>{pr[cu] = this[cu];return pr;},{})
    }

    /**
    * Wraps '' around value if string and returns it
    */
    stringifyValue(value) {
        if (typeof value === 'string') {
            return `'${value}'`;
        } else {
            return `${value}`;
        }
    }

    /**
    * Checks Date types and parses it into millis
    * @param {Date/String/Number} value - number string or date representing date
    */
    dateGetMillis(value) {
        let millis = NaN;
        if (value instanceof Date) {
            millis = value.getTime();
        } else {
            const strValue = value.toString();
            const isNum = /^\d+$/.test(strValue);
            if (isNum) {
                millis = parseInt(strValue);
            } else {
                millis = Date.parse(strValue);
            }
        }
        return millis;
    }

    /**
    * Checks whether the props object adheres to the schema model specifications
    * @param {object} schema
    * @param {object} props
    * @param {boolean} checkRequired should be true for create and update methods
    */
    checkSchema(schema, props, checkRequired) {
        const schemaKeys = Object.keys(schema);
        const propsKeys = Object.keys(props);
        const response = {};

        function addErrorToResponse(key, message) {
            if (!response[key]) response[key] = [];
            response[key].push(message);
        }

        if (checkRequired) {
            for (let sKey of schemaKeys) {
                if (schema[sKey].required) {
                    if (!props[sKey]) {
                        addErrorToResponse(sKey, `A valid value for '${sKey}' is required`);
                    }
                }
            }
        }
        for (let pKey of propsKeys) {
            if (schemaKeys.includes(pKey)) {
                if (schema[pKey].type === G.DATE) {
                    const millis = this.dateGetMillis(props[pKey]);
                    if (Number.isNaN(millis)) {
                        addErrorToResponse(pKey, `'${pKey}' should be a Date`);
                    } else {
                        props[pKey] = millis;  //known side-effect
                    }
                } else {
                    
                    if (!(typeof props[pKey] === G.jstype(schema[pKey].type))) {
                        addErrorToResponse(pKey, `'${pKey}' should be a ${schema[pKey].type}`);
                    }
                }
            } else {
                addErrorToResponse(pKey, `'${pKey}' is not part of the schema model`);
            }
        }
        return response;
    }

    /**
     * returns true if response is an empty object and false if it contains any error message
     * @param {object} response return value from checkSchema
    */
    checkSchemaFailed(response) {
        if (Object.keys(response).length === 0) return false;
        return true;
    }
}

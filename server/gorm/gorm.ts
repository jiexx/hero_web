import { getConnectionManager, Connection,createConnection } from "typeorm";
import { DBUSER, DBPWD, DBNAME, DBHOST } from "./config";
import { Vertex } from "./vertex";
import { Edge } from "./edge";
import { Log } from "../common/log";
import { Repo, ModelRepo, JoinRepo } from "./repo";
import { join } from "path";


export class V {
    static async define(label:string, schema:Object){
        await G.connect();
        let vertex = new Vertex(label, schema); 
        await vertex.repo.sync();
        return vertex;
    }
}
export class E {
    static async define(label:string, schema:Object){
        await G.connect();
        let edge = new Edge(label, schema); 
        await edge.repo.sync();
        return edge;
    }
}
export class Gorm {
    STRING = 'varchar';
    TEXT = 'text';
    NUMBER = 'bigint';
    BOOLEAN = 'boolean';
    //date = "2017-06-21";
    //datetime = new Date();datetime.setMilliseconds(0);
    //timestamp = new Date();timestamp.setMilliseconds(0); 
    DATE = 'datetime';
    vertices = <[ModelRepo]>{};
    edges = <[ModelRepo]>{};
    connection: Connection = null;
    join:JoinRepo;
    async getJoin(){
        if(!this.join){
            this.join = new JoinRepo();
            await this.join.sync();
        }
        return this.join;
    }
    //aliases: any;
    private dbtype2jstype = {};
    constructor() {
        this.dbtype2jstype[this.STRING] = 'string';
        this.dbtype2jstype[this.NUMBER] = 'number';
        this.dbtype2jstype[this.BOOLEAN] = 'boolean';
        this.dbtype2jstype[this.TEXT] = 'string';
    }

    jstype(dbtype:string){
        return this.dbtype2jstype[dbtype];
    }
    async useDatabase(connection: Connection){
        const queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        let hasDatabase = await queryRunner.hasDatabase(DBNAME);
        if(!hasDatabase){
            await queryRunner.query(`create database ${DBNAME}`);
            hasDatabase = await queryRunner.hasDatabase(DBNAME);
        }
        await queryRunner.executeMemoryDownSql();
        await queryRunner.release();
    }
    async create() {
        let connection = await createConnection({
            type: "mysql",
            host: DBHOST,
            port: 3306,
            username: DBUSER,
            password: DBPWD,
            //database: DBNAME
        });
        await this.useDatabase(connection);
        await connection.close();
        this.connection = await createConnection({
            type: "mysql",
            host: DBHOST,
            port: 3306,
            username: DBUSER,
            password: DBPWD,
            database: DBNAME
        });
        await this.connection.synchronize();
    }
    async connect(callback:Function = null){
        try{
            
            if(this.connection /* || getConnectionManager().get("default") */ ) {
                if(callback){
                    await callback(this);
                }
                return;
            }else {
                Log.info('connect database...')
                await this.create();
                if(callback){
                    await callback(this);
                }
            }
        }catch(e){
            Log.error(JSON.stringify(e));
        }
    }

}

export const G = new Gorm();
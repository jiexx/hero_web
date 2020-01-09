import { V, G, E } from "../gorm/gorm";
import { Vertex } from "../gorm/vertex";
import { ID } from "../common/id";
import { OK, ERR } from "../common/result";
import { AHandler, HandlersContainer, AdminHandler } from "../route/handler";
import { Edge, Edges } from "../gorm/edge";
import { Authentication } from "../route/authentication";
import { NUMPERPAGE } from "../config";
import { Tickets } from "./tickets";
import { IInternalOptions } from "../gorm/repo";

enum FavorState {
    READED = 3,
    SUBSCRIBED = 1,
    OFF = 0,
    RECIEVED = 2,
}

enum FavorMethod {
    MSG = 1,
    EMAIL = 0,
}

class FavorValidator {
    private data: string[] = [];
    ticketDeparttime(){
        this.data.push( `DATEDIFF(NOW(), date(${Tickets.instance.tickets.label}1.createtime)) <= 30 AND DATEDIFF(date(${Tickets.instance.tickets.label}1.depart), NOW()) > 3` );
        return this;
    }
    greaterTicketPrice(){
        this.data.push( `CAST(SUBSTRING(${Tickets.instance.tickets.label}1.price,4) AS SIGNED) < ${Favors.instance.favors.label}0.price ` );
        return this;
    }
        
    createtime(){
        this.data.push( `DATEDIFF(NOW(), date(${Favors.instance.favors.label}0.createtime)) <= 30 ` );
        return this;
    }
    equalPlace(place: string){
        this.data.push( `${Favors.instance.favors.label}0.place = '${place}'` );
        return this;
    }

    subscribed(){
        this.data.push( `${Favors.instance.favors.label}0.state = ${FavorState.SUBSCRIBED}` );
        return this;
    }

    received(){
        this.data.push( `${Favors.instance.favors.label}0.state = ${FavorState.RECIEVED}` );
        return this;
    }

    readed(){
        this.data.push( `${Favors.instance.favors.label}0.state = ${FavorState.READED}` );
        return this;
    }
    
    join(op: string){
        let e = this.data.join(' '+op+' ');
        this.data = ['('+ e+')'];
        return this;
    }
    complete(op: string = ''){
        return this.data.join(' '+op+' ');
    }
}
class InternalOptions {
    private opts :IInternalOptions = {replace:null};
    replace(internalVertexName: string, to: string){
        !this.opts.replace &&( this.opts.replace = {});
        !this.opts.replace[internalVertexName] && (this.opts.replace[internalVertexName] = to);
        return this;
    }
    addVerties(internalVertexName: string, externalVertexName: string, props: string[]){
        let vs = props.reduce((p,v) => {p[internalVertexName+'_'+v] = {on:externalVertexName,prop:v}; return p;}, {});
        this.opts.verties = {...this.opts.verties, ...vs};
        return this;
    }
    needLeftVertex(){
        this.opts['needLeftVertex'] = true;
        return this;
    }
    complete(){
        return this.opts;
    }
}




class FavorCancel extends AHandler {
    async handle(path:string, q:any){
        if(!q.favorid || !q.place) {
            return ERR(path);    
        }
        let favor = await Favors.instance.favors.find({id: q.favorid})
        if (favor.length < 1) {
            return ERR(path);
        }
        let user = Vertex.instance([q.user]);
        if (user.length < 1) {
            return ERR(path);    
        }
        let list = await user[0].exOut([Favors.instance.favors],
            {
                andWhere: new FavorValidator().equalPlace(q.place).complete()
            }
        );
        let result = list.reduce((p:any[],c)=>{p.push(c['favors_0']); return p}, []);
        let edges = new Edges(Favors.instance.favors);
        edges.push(...Edge.instance(result));
        await edges.drops();
        
        return OK(path);
    }
}
class FavorRead extends AHandler {
    async handle(path:string, q:any){
        if(!q.favorid || !q.place) {
            return ERR(path);    
        }
        let favor = await Favors.instance.favors.find({id: q.favorid})
        if (favor.length < 1) {
            return ERR(path);
        }
        let result = await Favors.instance.favors.add({ id: favor[0].id, state:FavorState.READED, updatetime: ID.now});
        if (!result.id) {
            return ERR(path);
        }
        
        return OK(path);
    }
}

class FavorList extends AHandler {
    async handle(path:string, q:any){

        let user = Vertex.instance([q.user]);
        if (user.length < 1) {
            return ERR(path);    
        }

        let list = await user[0].exOut([Favors.instance.favors],
            {
                addSelect: ["count(*)", "count_n"],
                andWhere: !q.place ? new FavorValidator().createtime().subscribed().complete('AND') : new FavorValidator().createtime().subscribed().equalPlace(q.place).complete('AND'),
                offset:NUMPERPAGE*q.page,
                limit:NUMPERPAGE,
                groupBy: [Favors.instance.favors.label+"0.place"],
                orderBy:[Favors.instance.favors.label+"0.createtime", "ASC"],
                __InternalOptions: new InternalOptions().addVerties('count','count',['n']).complete()
            }
        );

        return OK(list);
    }
}

class FavorCount extends AHandler {
    async handle(path:string, q:any){
        let where = '';
        if(q.state == 'received'){
            where = new FavorValidator().createtime().received().complete('AND')
        }else {
            where = new FavorValidator().createtime().subscribed().complete('AND')
        }
        let user = Vertex.instance([q.user]);
        if (user.length < 1) {
            return ERR(path);    
        }
        

        const count = await user[0].exOutCount([Favors.instance.favors],
            {
                andWhere: where
            }
        );
        return OK(count);
    }
}

class FavorSublist extends AHandler {
    async handle(path:string, q:any){
        if (!q.place ) {
            return ERR(path);
        }
        let user = Vertex.instance([q.user]);
        if (user.length < 1) {
            return ERR(path);    
        }
        let list = await user[0].exOut([Favors.instance.favors, Tickets.instance.tickets],
            {
                andWhere:  new FavorValidator().createtime().received().equalPlace(q.place).complete('AND'),
                offset:NUMPERPAGE*q.page,
                limit:NUMPERPAGE,
                orderBy:[Tickets.instance.tickets.label+"0.depart", "ASC"],
                __InternalOptions: new InternalOptions().replace(Tickets.instance.tickets.label+'0', 'tickets').complete()
            }
        );
        return OK(list);
    }
}
class FavorSubcount extends AHandler {
    async handle(path:string, q:any){
        if (!q.place ) {
            return ERR(path);
        }
        let where = '';
        if(q.state == 'received'){
            where = new FavorValidator().createtime().received().equalPlace(q.place).complete('AND')
        }else {
            where = new FavorValidator().readed().received().join('OR').createtime().equalPlace(q.place).complete('AND')
        }
        let user = Vertex.instance([q.user]);
        if (user.length < 1) {
            return ERR(path);    
        }
        const count = await user[0].exOutCount([Favors.instance.favors],
            {
                andWhere: where
            }
        );
        return OK(count);
    }
}

class FavorPost extends AHandler {
    async handle(path:string, q:any){ 
        if (!q.price || (q.method != FavorMethod.EMAIL && q.method != FavorMethod.MSG) || !q.to || !q.place ) {
            return ERR(path);
        }
        let user = Vertex.instance([q.user])[0];
        let now = ID.now;
        let to = await Tickets.instance.tickets.find({id: q.to})
        if (to.length < 1) {
            return ERR(path);
        }
        let list = await user.exOut([Favors.instance.favors],
            {
                andWhere: new FavorValidator().equalPlace(q.place).createtime().complete('AND'),
            }
        );
        if(list.length > 0){
            return OK(path);
        }

        /////////////////////////////////////////////////////////////
        let favor = await Favors.instance.favors.add({price:q.price, method:q.method, state:FavorState.SUBSCRIBED, place:q.place, createtime: now, updatetime: now});
        if (!favor.id) {
            return ERR(path);
        }
        await user.addE(favor).to(to[0]).next();
        return OK(path);
    }
}
class FavorClear extends AdminHandler {
    async handle(path:string, q:any){
        const favors = await Authentication.instance.users.exOut([Favors.instance.favors],
                {
                    andWhere: `${Favors.instance.favors.label}0.state = ${FavorState.RECIEVED} `
                }
            );
        let result = favors.reduce((p:any[],c)=>{p.push(c['favors_0']); return p}, []);
        let edges = new Edges(Favors.instance.favors);
        edges.push(...Edge.instance(result));
        await edges.drops();
        return OK(path);
    }
}
export class FavorNotify extends AdminHandler {
    async handle(path:string, q:any){
        let opt = {
            leftJoinAndSelect: [
                `${Tickets.instance.tickets.label}`,
                `${Tickets.instance.tickets.label}1`,
                `${Tickets.instance.tickets.label}1.E = ${Favors.instance.favors.label}0.place OR ${Tickets.instance.tickets.label}1.B = ${Favors.instance.favors.label}0.place`,
            ],
            andWhere: new FavorValidator().createtime().ticketDeparttime().greaterTicketPrice().subscribed().complete('AND'),
            __InternalOptions: new InternalOptions()
                            .needLeftVertex()
                            .addVerties(Tickets.instance.tickets.label+'1', 'tickets', Tickets.instance.tickets.columns())
                            .replace(Tickets.instance.tickets.label+'0', '$tickets')
                            .complete()
        };
        const favors = await Authentication.instance.users.exOut([Favors.instance.favors, Tickets.instance.tickets],
                opt
            );
        if(favors.length < 1){
            return OK(path);
        }
        let now = ID.now;
        let result = favors.reduce((p,c,i) => { 
            const { id, ...f } = c.favors_0;
            p.edges[i] = {...f, ...{state:FavorState.RECIEVED, createtime: now, updatetime: now}}; 
            p.from[i] = c.users_0; p.to[i] = c.tickets;
            return p;
        }, {edges:[], from:[], to:[]});
        let edges = new Edges(Favors.instance.favors);
        await edges.add(result.edges);
        await edges.from(Vertex.instance(result.from)).to(Vertex.instance(result.to)).next();
        edges = null;
        return OK(path);
    }
}


export class Favors  extends HandlersContainer  {
    constructor(public articles: Vertex, public favors: Edge, public post: Edge){
        super();
    }
    async setup(){
        this.favors = await E.define('favors', {
            price: {
                type: G.NUMBER,
            },
            method:{
                type: G.NUMBER,
            },
            state:{
                type: G.NUMBER, //0: off, 1: on, 2: sublist, 
            },
            place: {
                type: G.STRING,
                len: 8
            },
            ticketid: {
                type: G.NUMBER,
            },
            createtime: {
                type: G.STRING,
                len: 32
            },
            updatetime: {
                type: G.STRING,
                len: 32
            },
        });
        this.addHandler(new FavorCount());
        this.addHandler(new FavorSubcount());
        this.addHandler(new FavorList())
        this.addHandler(new FavorSublist());
        this.addHandler(new FavorPost());
        this.addHandler(new FavorCancel());
        this.addHandler(new FavorNotify());
        this.addHandler(new FavorClear());
        this.addHandler(new FavorRead());
    }
    public async routers(){
        await this.setup();
        return super.routers();
    }
}
import { V, G, E } from "../gorm/gorm";
import { Vertex } from "../gorm/vertex";
import { ID } from "../common/id";
import { OK, ERR } from "../common/result";
import { UHandler, AHandler, Handler, HandlersContainer } from "../route/handler";
import { Edge, Edges } from "../gorm/edge";
import { Authentication } from "../route/authentication";
import { NUMPERPAGE, NUMPERSUBPAGE } from "../config";
import { Tickets } from "./tickets";

const EMAILMSG = 0;
const SMSMSG = 1;
const FAVORDISABLE = 0;
const FAVORENABLE = 1;
const FAVORMSG = 2;

class FavorCount extends AHandler {
    async handle(path:string, q:any){
        let user = Vertex.instance([q.user]);
        if (user.length < 1) {
            return ERR(path);    
        }
        const count = await user[0].exOutCount([Favors.instance.favors],
            {
                andWhere: q.active ? `${Favors.instance.favors.label}0.state = ${FAVORMSG}` 
                    : `${Favors.instance.favors.label}0.state = ${FAVORENABLE}`,
            }
        );
        return OK(count);
    }
}

class FavorActive extends AHandler {
    async handle(path:string, q:any){
        if(!q.favorid || !q.E) {
            return ERR(path);    
        }
        let favor = await Favors.instance.favors.find({id: q.favorid})
        if (favor.length < 1) {
            return ERR(path);
        }
        if(favor[0].state == FAVORENABLE){
            let user = Vertex.instance([q.user]);
            if (user.length < 1) {
                return ERR(path);    
            }
            let list = await user[0].exOut([Favors.instance.favors, Tickets.instance.tickets],
                {
                    andWhere: `'${q.E}' = ${Tickets.instance.tickets.label}1.E`,
                }
            );
            let result = list.reduce((p:any[],c)=>{p.push(c['favors_0']); return p}, []);
            let edges = new Edges(Favors.instance.favors);
            edges.push(...Edge.instance(result));
            await edges.drops();
        }else {
            await favor[0].remove();
        }
        
        return OK(path);
    }
}

class FavorList extends AHandler {
    async handle(path:string, q:any){
        if (q.active && !q.E) {
            return ERR(path);
        }
        let user = Vertex.instance([q.user]);
        if (user.length < 1) {
            return ERR(path);    
        }
        let list = await user[0].exOut([Favors.instance.favors, Tickets.instance.tickets],
            {
                andWhere: q.active ? `${Favors.instance.favors.label}0.state = ${FAVORMSG} AND '${q.E}' = ${Tickets.instance.tickets.label}1.E` 
                    : `${Favors.instance.favors.label}0.state = ${FAVORENABLE}`,
                offset:NUMPERPAGE*q.page,
                limit:NUMPERPAGE,
                orderBy:[Tickets.instance.tickets.label+"1.depart", "ASC"],
                replacement:{
                    target:[Favors.instance.favors, Tickets.instance.tickets],
                    replace:[Favors.instance.favors.label, 'tickets']
                }
            }
        );
        return OK(list);
    }
}


class FavorPost extends AHandler {
    async handle(path:string, q:any){
        if (!q.price || (q.method != SMSMSG && q.method != EMAILMSG) || !q.to ) {
            return ERR(path);
        }
        let user = Vertex.instance([q.user])[0];
        let now = ID.now;
        let to = await Tickets.instance.tickets.find({id: q.to})
        if (to.length < 1) {
            return ERR(path);
        }
        let list = await user.exOut([Favors.instance.favors, Tickets.instance.tickets],
            {
                andWhere: `${Tickets.instance.tickets.label}1.E = '${to[0].E}'`,
            }
        );
        if(list.length > 0){
            return OK(path);
        }

        /////////////////////////////////////////////////////////////
        let favor = await Favors.instance.favors.add({price:q.price, method:q.method, state:FAVORENABLE, createtime: now, updatetime: now});
        if (!favor.id) {
            return ERR(path);
        }
        await user.addE(favor).to(to[0]).next();
        return OK(path);
    }
}
class FavorClear extends AHandler {
    async handle(path:string, q:any){
        let opt = {
            andWhere: `${Favors.instance.favors.label}1.state = ${FAVORMSG} `
        };
        const favors = await Authentication.instance.users.exOut([Favors.instance.favors, Tickets.instance.tickets],
                opt
            );
        let result = favors.reduce((p:any[],c)=>{p.push(c['favors_1']); return p}, []);
        let edges = new Edges(Favors.instance.favors);
        edges.push(...Edge.instance(result));
        await edges.drops();
        return OK(path);
    }
}
export class FavorNotify extends AHandler {
    async handle(path:string, q:any){
        let opt = {
            leftJoinAndSelect: [
                `${Tickets.instance.tickets.label}`,
                `${Tickets.instance.tickets.label}3`,
                `${Tickets.instance.tickets.label}2.E = ${Tickets.instance.tickets.label}3.E`,
            ],
            andWhere: `DATEDIFF(NOW(), date(${Favors.instance.favors.label}1.createtime)) >= 0 AND DATEDIFF(NOW(), date(${Favors.instance.favors.label}1.createtime)) <= 30 AND ${Favors.instance.favors.label}1.state = ${FAVORENABLE}
                AND DATEDIFF(NOW(), date(${Tickets.instance.tickets.label}2.createtime)) >= 0 AND DATEDIFF(NOW(), date(${Tickets.instance.tickets.label}2.createtime)) <= 30
                AND CAST(SUBSTRING(${Tickets.instance.tickets.label}3.price,4) AS SIGNED) < ${Favors.instance.favors.label}1.price 
                AND DATEDIFF(date(${Tickets.instance.tickets.label}3.depart), NOW()) > 0`,
            replacement:{
                target:[Authentication.instance.users, Favors.instance.favors, Tickets.instance.tickets, Tickets.instance.tickets],
                replace:[Authentication.instance.users.label, Favors.instance.favors.label, '$tickets', 'tickets']
            }
        };
        const favors = await Authentication.instance.users.exOut([Favors.instance.favors, Tickets.instance.tickets],
                opt
            );
        if(favors.length < 1){
            return OK(path);
        }
        let now = ID.now;
        let result = favors.reduce((p,c,i) => { 
            const { id, ...f } = c.favors_1;
            p.edges[i] = {...f, ...{state:FAVORMSG, createtime: now, updatetime: now}}; 
            p.from[i] = c.users_0; p.to[i] = c.tickets_3;
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
                type: G.NUMBER, //0: cancel, 1: to be favor, 2: to be removed, 
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
        this.addHandler(new FavorList())
        this.addHandler(new FavorPost());
        this.addHandler(new FavorActive());
        this.addHandler(new FavorNotify());
        this.addHandler(new FavorClear());
    }
    public async routers(){
        await this.setup();
        return super.routers();
    }
}
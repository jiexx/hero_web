import { AHandler, HandlersContainer } from "../route/handler";
import { G, V } from "../gorm/gorm";
import { Vertex } from "../gorm/vertex";
import { OK, ERR } from "../common/result";
import { NUMPERSUBPAGE, NUMPERPAGE } from "../config";


class TicketCount extends AHandler {
    async handle(path:string, q:any){
        if(!q.note && Object.prototype.toString.call(q.note) != '[object Array]'){
            return ERR(path);
        }
        const tickets = await Tickets.instance.tickets.repo.repository.createQueryBuilder(Tickets.instance.tickets.label)
            .select("count(distinct E)", "count")
            .where("DATEDIFF(date(depart), NOW()) > 0 AND DATEDIFF(NOW(), date(createtime)) <= 30 ");
        const result = await Tickets.instance.filter(tickets, q)
            .getRawOne();
        return OK(result.count);
    }
}

class TicketSubcount extends AHandler {
    async handle(path:string, q:any){
        if(!q.note && Object.prototype.toString.call(q.note) != '[object Array]'){
            return ERR(path);
        }
        const tickets = await Tickets.instance.tickets.repo.repository.createQueryBuilder(Tickets.instance.tickets.label)
            .select("count(*)", "count")
            .where("DATEDIFF(date(depart), NOW()) > 0 AND DATEDIFF(NOW(), date(createtime)) <= 30 ");
        const result = await Tickets.instance.filter(tickets, q)
            .getRawOne();
        return OK(result.count);
    }
}


class TicketSublist extends AHandler {
    async handle(path:string, q:any){
        if(!q.note && Object.prototype.toString.call(q.note) != '[object Array]' && !q.end && !q.begin){
            return ERR(path);
        }
        
        const tickets = await Tickets.instance.tickets.repo.repository.createQueryBuilder(Tickets.instance.tickets.label)
            .where("DATEDIFF(date(depart), NOW()) > 0 AND DATEDIFF(NOW(), date(createtime)) <= 30 ");
        const result = await Tickets.instance.filter(tickets, q)
            .orderBy("CAST(SUBSTRING(price,4) AS SIGNED)", "ASC")
            .limit(NUMPERSUBPAGE)
            .offset( q.page*NUMPERSUBPAGE)
        //let sql = result.getSql();
        const r = await result.getMany();
        return OK(r);
    }
}

class TicketList extends AHandler {
    fileds(){
        return  Object.keys(Tickets.instance.tickets.repo.schema)
                    .map(e => {if(e=='price') {return'MIN(CAST(SUBSTRING(price,4) AS SIGNED)) as price';} return e  }).join(',');
    }
    async handle(path:string, q:any){
        if(!q.note && Object.prototype.toString.call(q.note) != '[object Array]'){
            return ERR(path);
        }
        const tickets = await Tickets.instance.tickets.repo.repository.createQueryBuilder(Tickets.instance.tickets.label)
            .select(this.fileds())
            .where("DATEDIFF(date(depart), NOW()) > 0 AND DATEDIFF(NOW(), date(createtime)) <= 30 ");
        const result = await Tickets.instance.filter(tickets, q) 
            .orderBy("price", "ASC")
            .limit(NUMPERPAGE)
            .offset( q.page*NUMPERPAGE);
        //console.log(result.getSql())
            //.getRawMany();
        const r = await result.getRawMany()
        return OK(r);
    }
}
export class Tickets extends HandlersContainer {
    tickets: Vertex;
    define(){
        const j = {
            price: '.result .38 .2 .1 .1', 
            airline: '.result .38 .2 .2 .3 .2',
            A: '.result .38 .2 .2 .3 .2',
            flight: '.result .38 .2 .2 .2 .7',
            depart: '.result .38 .2 .2 .2 .4',
            arrive: '.result .38 .2 .2 .2 .3',
            begin: '.result .38 .2 .2 .2 .1 .2',
            B: '.result .38 .2 .2 .2 .1 .1',
            end: '.result .38 .2 .2 .2 .2 .2',
            E: '.result .38 .2 .2 .2 .2 .1',
            stops:'.result .38 .2 .2 .2 .8 .2',
            S: '.result .38 .2 .2 .2 .8 .1'
        };
        return Object.keys(j).reduce((p, c) => { p[c] = {type: G.STRING}; return p}, {createtime:{type: G.STRING}, batch:{type: G.NUMBER}})
    }
    filter(tickets: any, q: any){
        if(q.end && (q.contains || 'NOT IN') == 'NOT IN'){
            tickets.andWhere(" E = '"+q.end+"'");
        }else if(q.begin && (q.contains || 'NOT IN') == 'IN'){
            tickets.andWhere(" B = '"+q.begin+"'");
        }else {
            
            if((q.contains || 'NOT IN') == 'NOT IN') {
                tickets.andWhere(" E NOT IN (" + q.note.map(e=>"'"+e+"'") + ")" );
                tickets.addGroupBy('E')
            }else {
                tickets.andWhere(" B NOT IN (" + q.note.map(e=>"'"+e+"'") + ")" );
                tickets.addGroupBy('B')
            }
        }
        
        switch(q.stops){ 
            case 'X':
            tickets.andWhere("LOCATE(',', flight) < 1");
            break;
            case 'I':
            tickets.andWhere("LOCATE(',', flight) > 1");
            break;
        }
        return tickets;
    }
    public async routers(){
        this.addHandler(new TicketSublist());
        this.addHandler(new TicketSubcount());
        this.addHandler(new TicketList());
        this.addHandler(new TicketCount());
        this.tickets = await V.define('matrix_itasoftware_com', this.define());
        return super.routers();
    }
    public async backup(name:string){
        return await V.define(name, this.define());
    }
}
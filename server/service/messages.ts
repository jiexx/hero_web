import { V, G, E } from "../gorm/gorm";
import { Vertex } from "../gorm/vertex";
import { ID } from "../common/id";
import { OK, ERR } from "../common/result";
import { UHandler, AHandler, Handler, HandlersContainer } from "../route/handler";
import { Edge } from "../gorm/edge";
import { Authentication } from "../route/authentication";
import { NUMPERPAGE, NUMPERSUBPAGE } from "../config";

class MessageCount extends AHandler {
    async handle(path:string, q:any){
        let user = Vertex.instance([q.user]);
        if (user.length < 1) {
            return ERR(path);    
        }
        let opt = {};
        if(q.unread != null) {
            opt['andWhere'] = 'messages0.readed = false' 
        }
        const count = await user[0].exInCount([Messages.instance.messages],
            opt
        );
        return OK(count);
    }
}

class MessageReaded extends AHandler {
    async handle(path:string, q:any){
        if(!q.msgid) {
            return ERR(path);    
        }
        let msg = await Messages.instance.messages.find({id: q.msgid})
        if (msg.length < 1) {
            return ERR(path);
        }
        let m = msg[0].properties()
        m.readed = msg[0].readed ? false : true;
        m.updatetime = ID.now;
        let message = await Messages.instance.messages.add(m);
        if (!message.id) {
            return ERR(path);
        }
        return OK(m.readed);
    }
}

class MessageList extends AHandler {
    async handle(path:string, q:any){
        let user = Vertex.instance([q.user]);
        if (user.length < 1) {
            return ERR(path);    
        }
        let list = await user[0].exIn([Messages.instance.messages,Authentication.instance.users],
            {
                offset:NUMPERPAGE*q.page,
                limit:NUMPERPAGE,
                orderBy:[Messages.instance.messages.label+"0.createtime", "DESC"]
            }
        );
        // if (list.length < 1) {
        //     return ERR(path);
        // }
        return OK(list);
    }
}


class MessagePost extends AHandler {
    async handle(path:string, q:any){
        if (!q.content || !q.title || !q.to || q.to == q.user.id) {
            return ERR(path);
        }
        let user = Vertex.instance([q.user])[0];
        let now = ID.now;
        let to = await Authentication.instance.users.find({id: q.to})
        if (to.length < 1) {
            return ERR(path);
        }

        /////////////////////////////////////////////////////////////
        let message = await Messages.instance.messages.add({title:q.title, content:q.content, readed:false, createtime: now, updatetime: now});
        if (!message.id) {
            return ERR(path);
        }
        await user.addE(message).to(to[0]).next();
        return OK(path);
    }
}


export class Messages  extends HandlersContainer  {
    constructor(public articles: Vertex, public messages: Edge, public post: Edge){
        super();
    }
    async setup(){
        this.messages = await E.define('messages', {
            title: {
                type: G.STRING,
                len: 32
            },
            content:{
                type: G.STRING,
                len: 256
            },
            readed:{
                type: G.BOOLEAN,
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
        this.addHandler(new MessageCount());
        this.addHandler(new MessageList())
        this.addHandler(new MessagePost());
        this.addHandler(new MessageReaded());
    }
    public async routers(){
        await this.setup();
        return super.routers();
    }
}
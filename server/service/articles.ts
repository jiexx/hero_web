import { V, G, E } from "../gorm/gorm";
import { Vertex, Vertices } from "../gorm/vertex";
import { ID } from "../common/id";
import { OK, ERR } from "../common/result";
import { UHandler, AHandler, Handler, HandlersContainer, AdminHandler } from "../route/handler";
import { Edge, Edges } from "../gorm/edge";
import { Authentication, Permit } from "../route/authentication";
import { NUMPERPAGE, NUMPERSUBPAGE } from "../config";

class ArticleCount extends AHandler {
    async handle(path:string, q:any){
        let root = await Articles.instance.articles.find({id: 1});
        if (root.length < 1) {
            return ERR(path);    
        }
        const count = await root[0].exInCount([Articles.instance.articles,Authentication.instance.users]);
        return OK(count);
    }
}
class ArticleSubcount extends AHandler {
    async handle(path:string, q:any){
        let article = await Articles.instance.articles.find({id: q.articleid})
        if (article.length < 1) {
            return ERR(path);
        }
        const count = await article[0].exInCount([Articles.instance.articles,Authentication.instance.users]);
        return OK(count);
    }
}


class ArticleList extends AHandler {
    async handle(path:string, q:any){
        let root = await Articles.instance.articles.find({id: 1});
        if (root.length < 1) {
            return ERR(path);    
        }
        let list = await root[0].exIn([Articles.instance.articles,Authentication.instance.users],
            {
                offset:NUMPERPAGE*q.page,
                limit:NUMPERPAGE,
                orderBy:[Articles.instance.articles.label+"0.createtime", "DESC"]
            }
        );
        // if (list.length < 1) {
        //     return ERR(path);
        // }
        return OK(list);
    }
}

class ArticlePost extends AHandler {
    async handle(path:string, q:any){
        if (!q.content || !q.title) {
            return ERR(path);
        }
        let now = ID.now;
        let root = await Articles.instance.articles.find({id: 1})
        if (root.length < 1) {
            Articles.instance.articles.add({title:'root', content:'root', userid:0, createtime: now, updatetime: now});
        }
        let user = Vertex.instance([q.user])[0];
        let post = await Articles.instance.post.add({ createtime: now});
        if (!post.id) {
            return ERR(path);
        }
        let comment = await Articles.instance.comment.add({ createtime: now});
        if (!comment.id) {
            return ERR(path);
        }
        let article = await Articles.instance.articles.add({title:q.title, content:q.content, userid:parseInt(q.user.id), createtime: now, updatetime: now});
        if (!article.id) {
            return ERR(path);
        }
        await user.addE(post).to(article).next();
        await article.addE(comment).to(root[0]).next();
        return OK(article.userid);
    }
}

class ArticleSublist extends AHandler {
    async handle(path:string, q:any){
        let article = await Articles.instance.articles.find({id: q.articleid})
        if (article.length < 1) {
            return ERR(path);
        }
        let list = await article[0].exIn([Articles.instance.articles,Authentication.instance.users],
            {
                offset:NUMPERSUBPAGE*q.page,
                limit:NUMPERSUBPAGE,
                orderBy:[Articles.instance.articles.label+"0.createtime", "DESC"]
            }
        );
        // if (list.length < 1) {
        //     return ERR(path);
        // }
        return OK(list);
    }
}

class ArticleComment extends AHandler {
    async handle(path:string, q:any){
        if (!q.content && !q.articleid) {
            return ERR(path);
        }
        let user = Vertex.instance([q.user])[0];
        let now = ID.now;
        let article = await Articles.instance.articles.find({id: q.articleid})
        if (article.length < 1) {
            return ERR(path);
        }
        let post = await Articles.instance.post.add({ createtime: now});
        if (!post.id) {
            return ERR(path);
        }
        /////////////////////////////////////////////////////////////
        let comment = await Articles.instance.comment.add({ createtime: now});
        if (!comment.id) {
            return ERR(path);
        }
        let reply = await Articles.instance.articles.add({content:q.content, userid:parseInt(q.user.id), createtime: now, updatetime: now});
        if (!reply.id) {
            return ERR(path);
        }
        await user.addE(post).to(reply).next();
        await reply.addE(comment).to(article[0]).next();
        return OK(reply.id);
    }
}

class ArticleRemove extends AdminHandler {
    async handle(path:string, q:any){
        if (!q.articleid) {
            return ERR(path);
        }
        let root = await Articles.instance.articles.find({id: 1});
        if (root.length < 1) {
            return ERR(path);    
        }
        
        let article = await Articles.instance.articles.find({id: q.articleid})
        if (article.length < 1) {
            return ERR(path);
        }
        let head = await root[0].exIn([Articles.instance.comment,article[0]]);
        let v = [], e = [];
        let ev = [];
        if(head.length==1){
            e.push(head[0][Articles.instance.comment.label+'_0']);
        }
        for(let i = 0 ; i < 4 ; i ++ ){
            ev.push(Articles.instance.comment);
            ev.push(Articles.instance.articles);
            let r = await article[0].exIn(ev);
            r.forEach(a => Object.keys(a).forEach((name:string) => name.includes(Articles.instance.comment.label)? e.push(a[name]) : v.push(a[name])));
        }

        e = e.filter((val,i) =>{ return e.findIndex(value=>value.id == val.id) == i });
        let edges = new Edges(Articles.instance.comment);
        edges.push(...Edge.instance(e) );
        await edges.drops();

        v = v.filter((val,i) =>{ return v.findIndex(value=>value.id == val.id) == i });
        v.push(article[0]);
        let vertices = new Vertices(Articles.instance.comment);
        vertices.push(...Vertex.instance(v) );
        await vertices.drops();

        return OK(path);
    }
}

export class Articles  extends HandlersContainer  {
    constructor(public articles: Vertex, public comment: Edge, public post: Edge){
        super();
    }
    async setup(){
        this.articles = await V.define('articles', {
            title: {
                type: G.STRING,
            },
            content:{
                type: G.TEXT
            },
            userid: {
                type: G.NUMBER
            },
            createtime: {
                type: G.STRING,
                len: 32
            },
            updatetime: {
                type: G.STRING,
                len: 32
            }
        });
        this.comment = await E.define('comment', {
            createtime: {
                type: G.STRING,
                len: 32
            },
        });
        this.post = await E.define('post', {
            createtime: {
                type: G.STRING,
                len: 32
            },
        });
        this.addHandler(new ArticleCount());
        this.addHandler(new ArticleSubcount());
        this.addHandler(new ArticleList())
        this.addHandler(new ArticlePost());
        this.addHandler(new ArticleComment());
        this.addHandler(new ArticleSublist());
        this.addHandler(new ArticleRemove());
    }
    public async routers(){
        await this.setup();
        return super.routers();
    }
}
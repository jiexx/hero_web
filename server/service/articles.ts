import { V, G, E } from "../gorm/gorm";
import { Vertex } from "../gorm/vertex";
import { ID } from "../common/id";
import { OK, ERR } from "../common/result";
import { UHandler, AHandler, Handler, HandlersContainer } from "../route/handler";
import { Edge } from "../gorm/edge";
import { Authentication } from "../route/authentication";
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
        if (!q.content) {
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
    }
    public async routers(){
        await this.setup();
        return super.routers();
    }
}
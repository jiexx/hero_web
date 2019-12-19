
import * as passport from "passport";
import jwt = require('jsonwebtoken');
import { Strategy, ExtractJwt } from "passport-jwt";
import * as crypto from 'crypto'; 
import * as request from "request-promise-native";
import * as urlencode from 'urlencode';


import { Singleton } from "../common/singleton";
import { Log } from "../common/log";
import { V, G } from "../gorm/gorm";
import { Vertex } from "../gorm/vertex";
import { ID } from "../common/id";
import { OK, ERR } from "../common/result";
import { UHandler, AHandler, Handler, HandlersContainer } from "./handler";
import { Router } from "./router";
import { MS } from "../config";

class Sms {
    apikey: string = '9c8ac43e28bf7233bb814740bf9158c5';
    userid: string = 'E107RW';
    pwd: string = 'k75LqD';
    password(timestamp:number){
        let pwd = this.userid+'00000000'+this.pwd+timestamp;
        return crypto.createHash('md5').update(pwd,'utf8').digest('hex')
    }
    async emit(mobile:string, content:string){
        var timestamp = new Date().getTime();
        var result = await request.post({ 
            url: 'http://api01.monyun.cn:7901/sms/v2/std/single_send', 
            method: "POST", 
            json:{
                apikey:this.apikey,
                mobile:mobile,
                content:urlencode(content,'gbk'),
                timestamp:timestamp
            }
        });
    }
    async send(mobile:string, code:string){//海优良品登录验证码：{w1-8}，请惠存。 '登录验证码：'+code+'，如非本人操作，请忽略此短信。'
        this.emit(mobile, '海优良品登录验证码：'+code+'，请惠存。');
    }
}
export const SMS: Sms = new Sms();

class AuthSign extends UHandler {
    async handle(path:string, q:any){
        let u = {};
        u['signid'] = ID.long;
        u['createtime'] = ID.now;
        u['updatetime'] = ID.now;
        u['state'] = '_TEMP';
        let user = await Authentication.instance.users.add(u);
        if (user.id > -1) {
            return OK({token:Authentication.instance._sign(u['signid']),profile:Authentication.instance.profile(user)/*{state:u['state']}*/});
        }
        return ERR(path);
    }
}

class AuthSms extends AHandler {
    async handle(path:string, q:any){
        if(!q.tel || !q.tel.match(/^((13[0-9])|(15[^4])|(18[0-9])|(17[0-1|3|5-8])|(14[5|7|9]))\d{8}$/g)) {
            return ERR('非手机号');
        }
        var t = new Date(q.user.updatetime).getTime(); 
        if(t > 0 && new Date().getTime()-t<60000 && q.user.createtime != q.user.updatetime){
            return ERR('1分钟内只能获取一次验证码');
        }
        let user = {mobile:parseInt(q.tel), id:q.user.id, signid:q.user.signid, state:'_CHECKING', updatetime:ID.now, code:ID.code+''}
        const result = await Authentication.instance.users.add(user);
        if (!result && result.length != 1) {
            return ERR(path);
        }
        Log.info('verify code:'+user.code);
        SMS.send(q.tel, user.code);
        
        //var token = Signature.instance.sign(userid);
        return OK(path);
    }
}

class AuthCheckin extends AHandler {
    async handle(path:string, q:any){
        if(!q.tel || !q.tel.match(/^((13[0-9])|(15[^4])|(18[0-9])|(17[0-1|3|5-8])|(14[5|7|9]))\d{8}$/g)) {
            return ERR('非手机号');
        }
        if(!q.code || q.code.length != 4) {
            return ERR('错误的验证码');
        }
        const userWithCode = await Authentication.instance.users.find({id: q.user.id, code: q.code});
        if(userWithCode.length<1){
            return ERR('错误的验证码');
        }
        //user already existed
        const userWithTelExisted = await Authentication.instance.users.find({mobile: q.tel});
        if(userWithTelExisted.length > 0){
            let removed = userWithTelExisted.map(e=>{return {id:e['id']};});
            let userWithCodeRemoved = await Authentication.instance.users.removeBulk(removed);
            if(userWithCodeRemoved.length<1){
                return ERR(path);
            }
            let userWithTelReplaced = (userWithTelExisted[0] as Vertex).properties();
            userWithTelReplaced['mobile'] = parseInt(q.tel);
            userWithTelReplaced['signid'] = q.user.signid;
            userWithTelReplaced['code'] = q.user.code;
            userWithTelReplaced['state'] = '_CHECKED';
            userWithTelReplaced['updatetime'] = ID.now;
            const result = await Authentication.instance.users.add(userWithTelReplaced);
            if (!result && result.length != 1) {
                return ERR(path);
            }
            return OK(Authentication.instance.profile(userWithTelReplaced)/*{mobile:userWithTelReplaced['mobile'],state:userWithTelReplaced['state']}*/);
        }else {
            q.user.state = '_CHECKED';
            q.user.updatetime = ID.now;
            const result = await Authentication.instance.users.add(q.user);
            if (result.length != 1) {
                return ERR(path);
            }
            return OK(Authentication.instance.profile(q.user)/*{mobile:q.user['mobile'],state:q.user['state']}*/);
        }
        
    }
}

class AuthUpload extends AHandler {
    async handle(path:string, q:any){
        let label = ID.savebase64image(q.file);
        return OK(label);
    }
}

class AuthProfile extends AHandler {
    async handle(path:string, q:any){
        if(!q.avatar && !q.name && !q.about){
            return ERR(path);
        }
        // let result = {mobile:q.user.mobile, state:q.user.state, avatar:q.user.avatar, name: q.user.name, about:q.user.about};
        if(q.avatar){
            q.user.avatar = q.avatar;
        }
        if(q.name){
            q.user.name = q.name;
        }
        if(q.about){
            q.user.about = q.about;
        }
        if(q.cars){
            q.user.cars = q.cars.join(',');
        }
        
        q.user.mobile = parseInt(q.user.mobile);
        const userSaved = await Authentication.instance.users.add(q.user);
        if (userSaved.mobile != q.user.mobile) {
            return ERR(path);
        }
        return OK(Authentication.instance.profile(q.user));
    }
}

export class Authentication  extends HandlersContainer  {
    options = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: '123!@#'
    };
    constructor(public users: Vertex){
        super();
        passport.use('logined', new Strategy(this.options, async (jwt_payload, next) => {
            Log.info('signature received '+jwt_payload.id);
            if(!jwt_payload.id){
                next(null, false);
                return;
            }
			try{
                const user = await this.users.find({signid : jwt_payload.id});
                if (user.length == 1) {
                    next(null, user[0].properties());
                }else {
                    next(null, false);
                }
            }catch(err){
                Log.error(err);
                next(null, false);
            }
        }));
        passport.use('master', new Strategy(this.options, async (jwt_payload, next) => {
            Log.info('master signature received '+jwt_payload.id);
            if(!jwt_payload.id){
                next(null, false);
                return;
            }
			try{
                if(MS.MASTER.SIGNATURE == jwt_payload.id) {
                    next(null, true);
                }else{
                    next(null, false);
                }
            }catch(err){
                Log.error(err);
                next(null, false);
            }
        }));
        passport.use('slaver', new Strategy(this.options, async (jwt_payload, next) => {
            Log.info('slaver signature received '+jwt_payload.id);
            if(!jwt_payload.id){
                next(null, false);
                return;
            }
			try{
                if(MS.SLAVER.SIGNATURE == jwt_payload.id) {
                    next(null, true);
                }else{
                    next(null, false);
                }
            }catch(err){
                Log.error(err);
                next(null, false);
            }
		}));
    }
    _sign(id: String) {
        var payload = {id: id};
        return jwt.sign(payload, this.options.secretOrKey);
    }
    get authenticate(){
        return passport.authenticate('logined', { session: false }) ;
    }
    get masterAuthenticate(){
        return passport.authenticate('master', { session: false }) ;
    }
    get slaverAuthenticate(){
        return passport.authenticate('slaver', { session: false }) ;
    }
    allowed = ['name', 'mobile', 'avatar', 'about', 'state', 'cars'];
    profile(user: any){
        return this.allowed.reduce((obj, key) => { if(user[key]) { obj[key] = user[key] }; return obj; }, {});
    }
    async setup(){
        this.users = await V.define('users', {
            name: {
                type: G.STRING,
            },
            signid:{
                type: G.STRING
            },
            mobile: {
                type: G.NUMBER
            },
            avatar: {
                type: G.STRING
            },
            about: {
                type: G.STRING,
                len: 256
            },
            state: {
                type: G.STRING,
                len: 16
            },
            code: {
                type: G.STRING,
                len: 32
            },
            cars: {
                type: G.STRING,
                len: 256
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
        this.addHandler(new AuthSign())
        this.addHandler(new AuthSms());
        this.addHandler(new AuthCheckin());
        this.addHandler(new AuthProfile());
        this.addHandler(new AuthUpload());
    }
    public async routers(){
        await this.setup();
        return super.routers();
    }
}
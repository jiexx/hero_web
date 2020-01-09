import { OK, ERR, STREAM } from "../common/result";
import { HandlersContainer, AFHandler, AHandler } from "../route/handler";
import { imageSync } from "qr-image";
import { _alipay } from "../common/pay";
import { _files } from "../common/files";
import { Log } from "../common/log";

class PayQrcode extends AFHandler {
    async order(q:any){
        let order = _alipay.order(q.subject, 10, q.user.id)
        let qrcode = await _alipay.qrPay(order);
        Log.info(qrcode);
        //let img = imageSync(qrcode, { type: q.type || 'svg'  });
        //return {qrcode:/* 'data:image/svg+xml;base64,' */'data:image/svg+xml;charset=utf-8,'+img,orderid:order.out_trade_no};
        return {qrcode:qrcode,orderid:order.out_trade_no};
    }
    async handle(path:string, q:any){
        if(!q.subject){
            return ERR(path);
        }
        let o = await this.order(q);
        return OK(o);
    }
}
class PayQuery extends AFHandler {
    async handle(path:string, q:any){
        if(!q.orderid){
            return ERR(path);
        }
        let query = await _alipay.query(q.orderid);
        if(query.out_trade_no != q.orderid) {
            return OK(-400);
        }else if (query.error){ //not existed
            return OK(-500);
        }else if(query.trade_status == 'WAIT_BUYER_PAY'){
            return OK(-200);
        }else if(query.trade_status == 'TRADE_CLOSED'){
            return OK(-100);
        }else if(query.trade_status == 'TRADE_FINISHED'){
            return OK(100);
        }else if(query.trade_status == 'TRADE_SUCCESS'){
            return OK(200);
        }else {
            return OK(-300)
        }
    }
}

export class Pay  extends HandlersContainer  {
    constructor(){
        super();
    }
    async setup(){
        this.addHandler(new PayQrcode());
        this.addHandler(new PayQuery());
    }
    public async routers(){
        await this.setup();
        return super.routers();
    }
}
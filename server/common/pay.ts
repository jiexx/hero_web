import { ID } from "./id";
import { MS, PAY } from "../config";
import { _http, Http } from "./http";
import { Log } from "./log";
import { ServerResponse, IncomingMessage } from "http";

export class Alipay {
    constructor() {  

    }
    order(subject: string, price: number, buyer_id: string) {
        return {
            subject:subject, 
            out_trade_no:ID.long, 
            total_amount:price,
            buyer_id:buyer_id,
            seller_id:PAY.ALI.SELLERID,
            product_code: 'FAST_INSTANT_TRADE_PAY',//'QUICK_MSECURITY_PAY',
        }; 
    }
    private open(order: any){
        let pay = {
            app_id: PAY.ALI.APPID,
            method: 'alipay.trade.page.pay',
            charset: 'utf-8',
            sign_type: 'RSA2',
            timestamp: ID.now,
            version: '1.0',
            notify_url: PAY.ALI.NOTIFY,
            biz_content: JSON.stringify(order)
        };
        let toSign = Object.entries(pay).sort().map(v => v.join('=')).join('&');
        let sign = ID.rsa256(toSign, PAY.ALI.KEY);
        pay['sign'] = sign;
        return PAY.ALI.HOST+'?'+Object.entries(pay).sort().map(([k,v]) => `${k}=${encodeURIComponent(v as any)}`).join('&');
    }
    private async pay(url: string):Promise<string>{
        return new Promise((resolve,rejects) =>{
            _http.redirectsStream({
                url: url,
                method: 'GET',
                headers: {'Content-Type': 'text/html'}
            },(hws)=>{
                hws.on('data',(d)=>{
                    let m = /<input name="qrCode" type="hidden" value="([^"]*)" id="J_qrCode"/g.exec(d.toString());
                    if(m){
                        //Log.info(m[1]);
                        hws.end();
                        hws.destroy();
                        resolve(m[1]);
                    }
                })
                .on('error',e =>{
                    rejects(e);
                })
            }); 
        })
        
    }
    async qrPay(order:any):Promise<string>{
        let o = { ...order, ...{qr_pay_mode: 4,qrcode_width: 100} };
        let url = this.open(o);
        return await this.pay(url);
    }
    check(response:any){
        if(response.trade_status == 'TRADE_FINISHED' || response.trade_status === 'TRADE_CLOSED') {
            let qs = Object.entries(response).filter(([k,v])=>k !== 'sign' && k !== 'sign_type' && v).sort().map(([k, v]) => `${k}=${decodeURIComponent(v as any)}`).join('&');
            return ID.rsa256V(qs, PAY.ALI.PUBKEY, response.sign);
        }
    }

    private getTradeState(orderid: string){
        let pay = {
            app_id: PAY.ALI.APPID,
            method: 'alipay.trade.query',
            charset: 'utf-8',
            sign_type: 'RSA2',
            timestamp: ID.now,
            version: '1.0',
            biz_content: JSON.stringify({
                out_trade_no:orderid, 
            })
        };
        let toSign = Object.entries(pay).sort().map(v => v.join('=')).join('&');
        let sign = ID.rsa256(toSign, PAY.ALI.KEY);
        pay['sign'] = sign;
        return PAY.ALI.HOST+'?'+Object.entries(pay).sort().map(([k,v]) => `${k}=${encodeURIComponent(v as any)}`).join('&');
    }
    async query(orderid: string):Promise<{trade_status:string,out_trade_no:string, error: boolean}>{
        let url = this.getTradeState(orderid);
        return new Promise((resolve,rejects) =>{
            let out_trade_no = null;
            let trade_status = null;
            let sub_code = null;
            _http.redirectsStream({
                url: url,
                method: 'GET',
                headers: {'Content-Type': 'text/html'}
            },(hws)=>{
                hws.on('data',(d)=>{
                    let m = /"out_trade_no"[^"]*"([^"]+)"/g.exec(d.toString());
                    if(m){
                        out_trade_no = m[1]; 
                        //Log.info(m[1]);
                    }
                    let n = /"trade_status"[^"]*"([^"]+)"/g.exec(d.toString());
                    if(n){
                        trade_status = m[1]; 
                        //Log.info(m[1]);
                    }
                    let e = /"sub_code"[^"]*"([^"]+)"/g.exec(d.toString());
                    if(e){
                        sub_code = e[1]; 
                        if(sub_code == 'ACQ.TRADE_NOT_EXIST'){
                            trade_status = 'ACQ.TRADE_NOT_EXIST';
                            hws.end();
                            hws.destroy();
                            resolve({out_trade_no: out_trade_no, trade_status: trade_status, error: true})
                        }
                        //Log.info(m[1]);
                    }
                    if(trade_status /* && trade_status */){
                        hws.end();
                        hws.destroy();
                        resolve({out_trade_no: out_trade_no, trade_status: trade_status, error: false})
                    }
                })
                .on('error',e =>{
                    rejects(e);
                })
            }); 
        })
        
    }
}
export const _alipay = new Alipay();
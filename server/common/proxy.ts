
import { Request, Response } from "express";
import { _http } from "../common/http";
import { createGunzip, createInflate, createGzip } from 'zlib';

class ProxyGet {
    get urlRegex(){
        return '/proxy/get/:url';
    }
    response(req: Request, res: Response){
        let hws = _http.stream({
            url: (req.params.url),
            method: 'GET',
            headers:{ 'Content-Type': req.headers['Content-Type']} 
        })
        let rs = hws.getProxyReadStream();
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "public, max-age=0")
        let encoding = req.headers['accept-encoding'] || req.headers['Accept-Encoding'];
        if(encoding && encoding.includes('gzip')){
            res.setHeader('Content-Encoding', 'gzip');
            rs.pipe(createGzip()).pipe(res);
        }else{
            rs.pipe(res);
        }
    }
}
export const _proxy = new ProxyGet();
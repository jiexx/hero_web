import { ConfigService } from "./net.config";
import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";


class ImageLoc {
    constructor(protected config: ConfigService, protected sanitizer:DomSanitizer){
    }
    isBased64(img: any){
        return !!img && Object.prototype.toString.call(img)=='[object String]' && img.indexOf('image/') > -1;
    }
    isUrl(img: any){
        return !!img && Object.prototype.toString.call(img)=='[object String]' &&  ['.ico','.jpg','.png','.gif'].findIndex(e=> img.indexOf(e) > 1) > -1&& img.indexOf(this.config.MEDIA_HOST.URL) > -1;
    }
    isImgLabel(img: any){
        return !!img && Object.prototype.toString.call(img)=='[object String]' &&  ['.ico','.jpg','.png','.gif'].findIndex(e=> img.indexOf(e) > 1) > -1
    }
    isSanitizer(img: any){
        return !!img && Object.prototype.toString.call(img)=='[object Object]' && !!img.changingThisBreaksApplicationSecurity ;
    }
    protected imgUrl(img: string){
        var url = '';
        if(this.isImgLabel(img)){
            if(!img.includes(this.config.MEDIA_HOST.URL)){
                url = this.config.MEDIA_HOST.URL+img;
            }else{
                url = img;
            }
        }
        return url/* +'\n' */;
    }
    protected imgPath(img: string){
        var url = '';
        if(this.isImgLabel(img)){
            if(!img.includes(this.config.MEDIA_HOST.URL)){
                url = img;
            }else{
                url = img.substr(this.config.MEDIA_HOST.URL.length);
            }
        }
        return url/* +'\n' */;
    }
    imgSanitizer(img: any, defaultImg: string){
        if(this.isBased64(img) || this.isSanitizer(img)){
            return img;
        }else if(this.isUrl(img)){
            return this.sanitizer.bypassSecurityTrustResourceUrl(img);
        }else if(this.isImgLabel(img)){
            return this.sanitizer.bypassSecurityTrustResourceUrl(this.imgUrl(img));
        }else if(this.isImgLabel(defaultImg)){
            return this.sanitizer.bypassSecurityTrustResourceUrl(this.imgUrl(defaultImg));
        }
    }
    imgStore(img: any, defaultImg: string){
        if(this.isBased64(img)){
            return defaultImg;
        }else if(this.isSanitizer(img)){
            return this.imgPath(img.changingThisBreaksApplicationSecurity);
        }else if(this.isImgLabel(img)){
            return this.imgPath(img);
        }else if(this.isImgLabel(defaultImg)){
            return this.imgPath(defaultImg);
        }
    }
    imgLink(img: any, defaultImg: string){
        if(this.isBased64(img)){
            return defaultImg;
        }else if(this.isSanitizer(img)){
            return this.imgUrl(img.changingThisBreaksApplicationSecurity);
        }else if(this.isImgLabel(img)){
            return this.imgUrl(img);
        }else if(this.isImgLabel(defaultImg)){
            return this.imgUrl(defaultImg);
        }
    }
    imgSanitizers(img: any[], defaultImg: string){
        return img.map(e => this.imgSanitizer(e, defaultImg));
    }
    imgStores(img: any[], defaultImg: string){
        return img.map(e => this.imgStore(e, defaultImg));
    }
}


class MediaUrl extends ImageLoc{
    protected imgUrl(img: string){
        return img.includes('media/img/') ? super.imgUrl(img) : super.imgUrl('media/img/'+img);
    }
    protected imgPath(img: string){
        return img.includes('media/img/') ? super.imgPath(img) : 'media/img/'+super.imgPath(img);
    }
}


@Injectable()
export class ImageUrl {
    assets: ImageLoc;
    media: MediaUrl;
    constructor(protected config: ConfigService, protected sanitizer:DomSanitizer){
        this.assets = new ImageLoc(config, sanitizer);
        this.media = new MediaUrl(config, sanitizer);
    }
}
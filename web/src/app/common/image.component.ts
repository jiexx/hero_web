import { Component, ChangeDetectorRef, Input, OnInit, Sanitizer, Output } from '@angular/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventEmitter } from '@angular/core';
import { HttpRequest } from './net.request';
import { ConfigService } from './net.config';
import { AuthGuard } from './auth.guard';
import { ImageUrl } from './image.url';

class Rect {
    r: number;
    constructor(public halfW: number, public halfH: number){
        this.r = halfH / halfW;
    }
    porject(dst: Rect){
        var halfW, halfH;
        if(this.r > dst.r) {
            halfH = this.halfW * dst.r
            return {x:0, y:this.halfH-halfH, w:this.halfW<<1, h:halfH<<1};
        }else {
            halfW = this.halfH / dst.r;
            return {x:this.halfW-halfW, y:0, w:halfW<<1, h:this.halfH<<1};
        }
    }
}

class Project {
    constructor(private r: Rect){
    }
    static P(imgWidth, imgHeight, canvWidth, canvHeight) {
        var src = new Rect(imgWidth >> 1, imgHeight >> 1);
        var a = src.porject(new Rect(canvWidth >> 1, canvHeight >> 1));
        return {
            srcX: a.x, srcY: a.y,  srcW: a.w,  srcH: a.h, 
            dstX: 0,   dstY: 0,    dstW: canvWidth,  dstH: canvHeight
        };
    }

}


@Component({
    selector: 'images',
    template:
`<div style="display: table; margin-left: auto; margin-right: auto;border: none" >

    <div style="display:table-cell; vertical-align: middle; position: relative;padding-right:10px;" *ngFor="let img of imgSanitizers(); let i = index ">
        <img [ngStyle]="{'width.px':size.w,'height.px':size.h}" [ngClass]="imageClass" [src]="img" >
        <a style="color:#ff8888; position: absolute; font-size:20px; cursor: pointer; top:-2px; right:2px;" (click)="onRemove(i)"><mat-icon>remove_circle</mat-icon></a>
    </div>

    <div style="display:table-cell;position:relative;margin:5px" [ngStyle]="{'width.px':size.w,'height.px':size.h}" *ngIf="images.length<max">
        <div style=" border:1px dashed #ccc; font-size: 60px; text-align: center; color:#CCC; vertical-align: middle;width:100%;height:100%"
            [ngStyle]="{'line-height.px':size.h}">+</div>
        <canvas #imgcanvas style="position:absolute;top:0;bottom:0;left:0;right:0;width:100%;height:100%"></canvas>
        <input type="file" style="position:absolute;opacity:0;top:0;bottom:0;left:0;right:0;width:100%;cursor:pointer;" multiple="multiple"
            #file (change)="onChange(file.files, imgcanvas)" />
    </div>

</div>`
})
export class ImageComponent {
    @Input() size: any = {w:1, h:1};  // style show width
    @Input() max: number = 1; // contain number of picture
    @Input() defaultImage: string = 'default.img';
    @Input() imageClass: number = 0;

    @Output() onUploaded: EventEmitter<any> = new EventEmitter();

    private _images: any[] = [];
    @Input() set images(values: any[]) {
        this._images = this.imgUrl.media.imgStores(values, this.defaultImage);
    }
    get images(): any[] {
        return this._images;
    }

    imgSanitizers(){
        return this.imgUrl.media.imgSanitizers(this.images, 'default.png')
    }

    constructor(
        private hr: HttpRequest,
        private ref: ChangeDetectorRef,
        public imgUrl: ImageUrl
     ) { 
    }


    onChange(files, canvas: HTMLCanvasElement){
        if (!files[0] || !files[0].type) return;
        var that = this;
        for(var i in files) {
          if (files[i] && files[i].type && files[i].type.indexOf('image') > -1) {
            var reader = new FileReader();
            reader.onloadend = function (evt:any) {
                var img = new Image();
                img.src = evt.target.result;
                var ctx = canvas.getContext("2d");
                ctx.fillStyle="#ffffff";
                canvas.width = that.size.w;
                canvas.height = that.size.h;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                img.onload = function() {
                    var t = Project.P(img.width, img.height, canvas.width, canvas.height);
                    ctx.drawImage(img, t.srcX, t.srcY, t.srcW, t.srcH, t.dstX, t.dstY, t.dstW, t.dstH );
                    that.save(canvas.toDataURL("image/jpeg"));
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
            reader.readAsDataURL(files[i]);
          }
        }
    }
    @Output() imagesChange:EventEmitter<any> = new EventEmitter();
    save(data:string){
        this._images.push(data);
        //this.imagesChange.emit(this._images);
        this.ref.detectChanges();
        this.hr.upload(data, (result) => {
            this._images.pop();
            //console.log(this.hr.uploadPath(result.data));
            let url = this.imgUrl.media.imgStore(result.data, this.defaultImage)
            console.log(url);
            this._images.push(url);
            this.onUploaded.emit(url);
            this.imagesChange.emit(this._images);
        });
    }
    onRemove(index:number){
        this._images.splice(index,1);
    }

}
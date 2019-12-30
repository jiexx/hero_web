import { Message } from './dcl.message';
import { InfoDialogComponent } from './dialog.info.component';
import { MsgDialogComponent } from './dialog.msg.component';
import { FavorDialogComponent } from './dialog.favor.component';

export class DialogMessage extends Message {

    constructor(public from: any, public to: any, public info: any, public pass: Function = null, public fail: Function = null, public closed: Function = null) {
        super(from, to);

    };
    public success(param:any){
        if(this.pass) this.pass.call(this.from, param);
    }
    public error(param:any){
        if(this.fail) this.fail.call(this.from, param);
    }
}
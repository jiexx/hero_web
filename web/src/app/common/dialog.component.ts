import { Component, OnInit } from '@angular/core';
import { BusService } from 'app/common/dcl.bus.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DialogMessage } from './dcl.dialog.message';
import { InfoDialogComponent } from './dialog.info.component';
import { MsgDialogComponent } from './dialog.msg.component';
import { FavorDialogComponent } from './dialog.favor.component';
import { IDialogComponent } from './dialog.interface';
import { Type } from '@angular/compiler';


@Component({
    selector: 'dialogs',
    template: ' ',
})
export class DialogComponent implements OnInit { 
    constructor(public dialog: MatDialog, private busService: BusService) {
        
    }

    ngOnInit() {
        this.add(InfoDialogComponent);
        this.add(MsgDialogComponent);
        this.add(FavorDialogComponent);
    }
 
    add(dialog: any){

        this.busService.receive(dialog, (msg: DialogMessage) => {
            this.create(msg);
        })
    }

    create(msg: DialogMessage){
        const dialogRef = this.dialog.open(msg.to, {
            //width: '250px'
        });
        dialogRef.afterClosed().subscribe(result => {
            if (msg && msg.closed) msg.closed();
            this.dialog.closeAll();
            msg.info['_ref'] = null;
        });
        (<IDialogComponent>dialogRef.componentInstance).msg = msg;
        (<IDialogComponent>dialogRef.componentInstance).dialogRef = dialogRef;
        if(!msg.info) {
            msg['info'] = {_ref:dialogRef}
        }else{
            msg.info['_ref'] = dialogRef;
        }
        return dialogRef;
    }
    

}

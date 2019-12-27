import { Component, OnInit } from '@angular/core';
import { BusService } from 'app/common/dcl.bus.service';
import { MatDialogRef, MatDialog } from '@angular/material';
import { DialogMessage } from './dcl.dialog.message';

export class IDialogComponent {
    msg: DialogMessage;
    dialogRef: MatDialogRef<any>
    confirm(result: any = null) {
        if (this.msg && this.msg.pass) this.msg.pass(result);
        this.dialogRef.close();
    }
    decline(result: any = null) {
        if (this.msg && this.msg.fail) this.msg.fail(result);
        this.dialogRef.close();
    }
}

@Component({
    selector: 'dialogs',
    template: ' ',
})
export class DialogComponent implements OnInit { 
    constructor(public dialog: MatDialog, private busService: BusService) {
        
    }
    ngOnInit() {
        this.add('InfoDialogComponent');
        this.add('MsgDialogComponent');
        this.add('FavorDialogComponent');
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
        });
        (<IDialogComponent>dialogRef.componentInstance).msg = msg;
        (<IDialogComponent>dialogRef.componentInstance).dialogRef = dialogRef;
    }
    

}

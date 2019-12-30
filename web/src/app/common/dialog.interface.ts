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

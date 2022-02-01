import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-join-setup-dialog',
    templateUrl: './join-setup-dialog.component.html',
    styleUrls: ['./join-setup-dialog.component.scss'],
})
export class JoinSetupDialogComponent implements OnInit {
    constructor(private dialogRef: MatDialogRef<JoinSetupDialogComponent>) {}

    ngOnInit(): void {}

    onNoClick() {
        this.dialogRef.close();
    }
}

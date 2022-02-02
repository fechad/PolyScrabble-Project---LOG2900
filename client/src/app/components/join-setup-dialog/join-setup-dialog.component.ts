import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-join-setup-dialog',
    templateUrl: './join-setup-dialog.component.html',
    styleUrls: ['../../styles/dialogs.scss'],
})
export class JoinSetupDialogComponent {
    constructor(public dialogRef: MatDialogRef<JoinSetupDialogComponent>) {}

    closeDialog() {
        this.dialogRef.close();
    }
}

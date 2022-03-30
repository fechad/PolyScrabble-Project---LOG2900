import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-add-player-dialog',
    templateUrl: './add-player-dialog.component.html',
    styleUrls: ['./add-player-dialog.component.scss'],
})
export class AddPlayerDialogComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<AddPlayerDialogComponent>) {}

    ngOnInit(): void {}

    closeDialog() {
        this.dialogRef.close();
    }
}

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-help-info',
    templateUrl: './help-info.component.html',
    styleUrls: ['./help-info.component.scss'],
})
export class HelpInfoComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<HelpInfoComponent>) {}

    ngOnInit(): void {}

    closeDialog(): void {
        this.dialogRef.close();
    }
}

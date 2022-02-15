import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-help-info',
    templateUrl: './help-info.component.html',
    styleUrls: ['./help-info.component.scss'],
})
export class HelpInfoComponent {
    constructor(public dialogRef: MatDialogRef<HelpInfoComponent>) {}

    closeDialog(): void {
        this.dialogRef.close();
    }
}

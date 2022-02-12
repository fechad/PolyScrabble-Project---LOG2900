import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-endgame-pop-up',
    templateUrl: './endgame-pop-up.component.html',
    styleUrls: ['./endgame-pop-up.component.scss'],
})
export class EndgamePopUpComponent {
    constructor(private dialogRef: MatDialogRef<EndgamePopUpComponent>) {}

    closeDialog(): void {
        this.dialogRef.close();
    }
}

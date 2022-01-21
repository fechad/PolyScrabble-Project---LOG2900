import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClassicMultiplayerDialogComponent } from '@app/components/classic-multiplayer-dialog/classic-multiplayer-dialog.component';

@Component({
    selector: 'app-classic-modes-page',
    templateUrl: './classic-modes-page.component.html',
    styleUrls: ['./classic-modes-page.component.scss'],
})
export class ClassicModesPageComponent {
    constructor(public dialog: MatDialog) {}

    openDialog() {
        this.dialog.open(ClassicMultiplayerDialogComponent);
    }
}

import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameSetupDialogComponent } from '@app/components/game-setup-dialog/game-setup-dialog.component';

@Component({
    selector: 'app-three-button-options',
    templateUrl: './three-button-options.component.html',
    styleUrls: ['../../styles/menus.scss'],
})
export class ThreeButtonOptionsComponent {
    @Input() name: string[];
    constructor(public dialog: MatDialog) {}
    openDialog() {
        this.dialog.open(GameSetupDialogComponent);
    }
}

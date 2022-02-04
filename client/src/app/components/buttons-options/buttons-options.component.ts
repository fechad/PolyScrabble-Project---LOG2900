import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ButtonParameters } from '@app/classes/button-parameters';
import { MenusStatesService } from '@app/services/menus-states.service';
import { GameSetupDialogComponent } from '../game-setup-dialog/game-setup-dialog.component';

@Component({
    selector: 'app-buttons-options',
    templateUrl: './buttons-options.component.html',
    styleUrls: ['../../styles/menus.scss'],
})
export class ButtonsOptionsComponent {
    @Input() donneesBoutons: ButtonParameters[];
    constructor(public matDialog: MatDialog, public state: MenusStatesService) {}

    openDialog(prompt: boolean) {
        if (prompt) {
            this.matDialog.open(GameSetupDialogComponent);
        }
    }
    modifyMode(chosenMode: string) {
        this.state.assignMode(chosenMode);
    }
}

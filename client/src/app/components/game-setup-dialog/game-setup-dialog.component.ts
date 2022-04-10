import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Parameters } from '@app/classes/parameters';
import * as cst from '@app/constants';
import { AvatarSelectionService } from '@app/services/avatar-selection.service';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-game-setup-dialog',
    templateUrl: './game-setup-dialog.component.html',
    styleUrls: ['../../styles/dialogs.scss'],
})
export class GameSetupDialogComponent implements OnInit {
    gameParametersForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<GameSetupDialogComponent>,
        public communicationService: CommunicationService,
        public avatarSelectionService: AvatarSelectionService,
        @Inject(MAT_DIALOG_DATA) public data: { log2990: boolean },
    ) {}

    closeDialog() {
        this.dialogRef.close();
    }

    ngOnInit() {
        this.gameParametersForm = this.formBuilder.group({
            playerName: new FormControl('', [
                Validators.required,
                Validators.pattern('^[a-zA-ZÀ-ùç]*$'),
                Validators.maxLength(cst.MAX_NAME_CHARACTERS),
            ]),
            minutes: new FormControl(1, [Validators.required]),
            seconds: new FormControl(0, [Validators.required]),
            dictionnary: new FormControl(0, [Validators.required]),
        });
    }

    async onSubmit() {
        for (const key of Object.keys(this.gameParametersForm.controls)) {
            if (!this.gameParametersForm.controls[key].valid) {
                return;
            }
        }

        const parameters = new Parameters();
        parameters.avatar = this.avatarSelectionService.imgChosen;
        parameters.timer = this.gameParametersForm.value.minutes * cst.SEC_CONVERT + this.gameParametersForm.value.seconds;
        parameters.dictionnary = this.gameParametersForm.value.dictionnary;
        parameters.log2990 = this.data.log2990;
        await this.communicationService.createRoom(this.gameParametersForm.value.playerName, parameters, undefined);
        this.dialogRef.close();
    }
}

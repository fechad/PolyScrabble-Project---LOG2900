import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Difficulty, GameType, Parameters } from '@app/classes/parameters';
import { Room } from '@app/classes/room';
import * as cst from '@app/constants';
import { AvatarSelectionService } from '@app/services/avatar-selection.service';
import { CommunicationService } from '@app/services/communication.service';
import { Observable } from 'rxjs';
@Component({
    selector: 'app-solo-dialog',
    templateUrl: './solo-dialog.component.html',
    styleUrls: ['./solo-dialog.component.scss'],
})
export class SoloDialogComponent implements OnInit {
    soloParametersForm: FormGroup;
    difficulties = [
        { id: Difficulty.Beginner, name: 'débutant' },
        { id: Difficulty.Expert, name: 'expert' },
    ];
    availableName = ['Francois', 'Etienne', 'Anna'];
    opponentName: string;
    selectedRoom: Observable<Room>;
    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<SoloDialogComponent>,
        public communicationService: CommunicationService,
        public avatarSelectionService: AvatarSelectionService,
        @Inject(MAT_DIALOG_DATA) public data: { name?: string; dictionnary?: string; timer?: number; log2990: boolean },
    ) {}

    ngOnInit(): void {
        const minutesSelect = this.data.timer ? Math.floor(this.data.timer / cst.SEC_CONVERT) : 1;
        const secondsSelect = this.data.timer ? this.data.timer % cst.SEC_CONVERT : 0;

        this.soloParametersForm = this.formBuilder.group({
            playerName: new FormControl(this.data.name || '', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]),
            difficulty: new FormControl(Difficulty.Beginner, [Validators.required]),
            minutes: new FormControl(minutesSelect, [Validators.required]),
            seconds: new FormControl(secondsSelect, [Validators.required]),
            dictionnary: new FormControl(0, [Validators.required]),
        });
        this.opponentName = this.availableName[Math.floor(Math.random() * this.availableName.length)];
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    switchName(name: string): string {
        this.availableName = ['Francois', 'Etienne', 'Anna'];
        if (this.soloParametersForm.value.playerName === name) {
            this.availableName.splice(this.availableName.indexOf(name), 1);
            this.opponentName = this.availableName[Math.floor(Math.random() * this.availableName.length)];
        }
        return this.opponentName;
    }

    async onSubmit() {
        for (const key of Object.keys(this.soloParametersForm.controls)) {
            if (!this.soloParametersForm.controls[key].valid) {
                return;
            }
        }
        if (this.communicationService.selectedRoom.value) this.communicationService.leave();
        const parameters = new Parameters();
        parameters.avatar = this.avatarSelectionService.imgChosen;
        parameters.timer = this.soloParametersForm.value.minutes * cst.SEC_CONVERT + this.soloParametersForm.value.seconds;
        parameters.dictionnary = this.soloParametersForm.value.dictionnary;
        parameters.difficulty = this.soloParametersForm.value.difficulty;
        parameters.gameType = GameType.Solo;
        parameters.log2990 = this.data.log2990;
        await this.communicationService.createRoom(this.soloParametersForm.value.playerName, parameters, this.opponentName);
        this.closeDialog();
    }
}

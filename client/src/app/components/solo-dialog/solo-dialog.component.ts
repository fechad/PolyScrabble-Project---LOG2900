import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { difficulties, Difficulty, GameType, Parameters } from '@app/classes/parameters';
import * as cst from '@app/constants';
import { CommunicationService } from '@app/services/communication.service';
@Component({
    selector: 'app-solo-dialog',
    templateUrl: './solo-dialog.component.html',
    styleUrls: ['./solo-dialog.component.scss'],
})
export class SoloDialogComponent implements OnInit {
    soloParametersForm: FormGroup;
    difficulty = difficulties;
    availableName = ['Francois', 'Etienne', 'Anna'];
    opponentName: string;
    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<SoloDialogComponent>,
        public communicationService: CommunicationService,
        @Inject(MAT_DIALOG_DATA) public data: unknown,
    ) {}

    ngOnInit(): void {
        this.soloParametersForm = this.formBuilder.group({
            playerName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]),
            difficulty: new FormControl(0, [Validators.required]),
            minutes: new FormControl(1, [Validators.required]),
            seconds: new FormControl(0, [Validators.required]),
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
        if (this.communicationService.selectedRoom.value !== undefined) this.communicationService.leave();
        const parameters = new Parameters();
        parameters.timer = this.soloParametersForm.value.minutes * cst.SEC_CONVERT + this.soloParametersForm.value.seconds;
        parameters.dictionnary = this.soloParametersForm.value.dictionnary;
        parameters.difficulty = Difficulty.Beginner;
        parameters.gameType = GameType.Solo;
        await this.communicationService.createRoom(this.soloParametersForm.value.playerName, parameters, this.opponentName);
        this.closeDialog();
    }
}

import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { difficulties, Difficulty, GameType, Parameters } from '@app/classes/parameters';
import { Room } from '@app/classes/room';
import * as cst from '@app/constants';
import { AvatarSelectionService } from '@app/services/avatar-selection.service';
import { CommunicationService } from '@app/services/communication.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    selectedRoom: Observable<Room>;
    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<SoloDialogComponent>,
        public communicationService: CommunicationService,
        public avatarSelectionService: AvatarSelectionService,
        @Inject(MAT_DIALOG_DATA) public data: { room: number; name: string; dictionnary: string; timer: number },
    ) {
        this.selectedRoom = this.communicationService.rooms.pipe(map((rooms) => rooms[this.data.room]));
    }

    ngOnInit(): void {
        this.soloParametersForm = this.formBuilder.group({
            playerName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]),
            difficulty: new FormControl(0, [Validators.required]),
            minutes: new FormControl(1, [Validators.required]),
            seconds: new FormControl(0, [Validators.required]),
            dictionnary: new FormControl(0, [Validators.required]),
        });
        this.opponentName = this.availableName[Math.floor(Math.random() * this.availableName.length)];

        if (this.communicationService.selectedRoom.value) {
            this.soloParametersForm.get('playerName')?.setValue(this.data.name);
            this.soloParametersForm.get('minutes')?.setValue(Math.floor(this.data.timer / cst.SEC_CONVERT));
            if (this.data.timer / cst.SEC_CONVERT - Math.floor(this.data.timer / cst.SEC_CONVERT) === 0.5)
                this.soloParametersForm.get('seconds')?.setValue(30);
            else this.soloParametersForm.get('seconds')?.setValue(0);
        }
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
        parameters.difficulty = Difficulty.Beginner;
        parameters.gameType = GameType.Solo;
        await this.communicationService.createRoom(this.soloParametersForm.value.playerName, parameters, this.opponentName);
        this.closeDialog();
    }
}

import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Difficulty, GameType, Parameters } from '@app/classes/parameters';
import { Room } from '@app/classes/room';
import { VP } from '@app/classes/virtual-player';
import * as constants from '@app/constants';
import { AvatarSelectionService } from '@app/services/avatar-selection.service';
import { CommunicationService } from '@app/services/communication.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-solo-dialog',
    templateUrl: './solo-dialog.component.html',
    styleUrls: ['./solo-dialog.component.scss'],
})
export class SoloDialogComponent implements OnInit {
    @ViewChild('dropDown') dropDown: ElementRef;
    soloParametersForm: FormGroup;
    difficulties = [
        { id: Difficulty.Beginner, name: 'débutant' },
        { id: Difficulty.Expert, name: 'expert' },
    ];

    opponentName: string;
    selectedRoom: Observable<Room>;
    databaseNames: VP[];
    list: string[] = [];
    constructor(
        private httpClient: HttpClient,
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<SoloDialogComponent>,
        public communicationService: CommunicationService,
        public avatarSelectionService: AvatarSelectionService,
        @Inject(MAT_DIALOG_DATA) public data: { name?: string; dictionnary?: string; timer?: number; log2990: boolean },
    ) {}

    async ngOnInit(): Promise<void> {
        const minutesSelect = this.data.timer ? Math.floor(this.data.timer / constants.SEC_CONVERT) : 1;
        const secondsSelect = this.data.timer ? this.data.timer % constants.SEC_CONVERT : 0;
        const dictionarySelect = this.data.dictionnary
            ? (await this.communicationService.dictionnaries).findIndex((dictionary) => dictionary.name === this.data.dictionnary)
            : 0;

        this.soloParametersForm = this.formBuilder.group({
            playerName: new FormControl(this.data.name || '', [
                Validators.required,
                Validators.pattern('^[a-zA-ZÀ-ùç]*$'),
                Validators.maxLength(constants.MAX_NAME_CHARACTERS),
            ]),
            difficulty: new FormControl(Difficulty.Beginner, [Validators.required]),
            minutes: new FormControl(minutesSelect, [Validators.required]),
            seconds: new FormControl(secondsSelect, [Validators.required]),
            dictionnary: new FormControl(dictionarySelect, [Validators.required]),
        });
        this.databaseNames = await this.httpClient.get<VP[]>(`${environment.serverUrl}/vp-names`).toPromise();
        await this.chooseOpponent();
    }

    async chooseOpponent() {
        const names = await this.getPlayers();
        this.opponentName = names[Math.floor(Math.random() * names.length)];
    }

    rightSummary(id: string): boolean {
        return this.dropDown.nativeElement.options[this.dropDown.nativeElement.selectedIndex].value[constants.INDEX_POSITION] === id;
    }

    async getPlayers(): Promise<string[]> {
        this.list = this.databaseNames
            .filter((player) => {
                if (player.beginner !== Boolean(this.soloParametersForm.value.difficulty)) {
                    return player;
                } else return;
            })
            .map((vp) => vp.name);
        return this.list;
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    switchName(name: string): string {
        const availableName = this.list.map((vp) => vp);
        if (!this.soloParametersForm.value.playerName) return this.opponentName;
        if (this.soloParametersForm.value.playerName.toLowerCase() === name.toLowerCase()) {
            availableName.splice(availableName.indexOf(name), 1);
            this.opponentName = availableName[Math.floor(Math.random() * availableName.length)];
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
        parameters.timer = this.soloParametersForm.value.minutes * constants.SEC_CONVERT + this.soloParametersForm.value.seconds;
        parameters.dictionnary = this.soloParametersForm.value.dictionnary;
        parameters.difficulty = this.soloParametersForm.value.difficulty;
        parameters.gameType = GameType.Solo;
        parameters.log2990 = this.data.log2990;
        await this.communicationService.createRoom(this.soloParametersForm.value.playerName, parameters, this.opponentName);
        this.closeDialog();
    }
}

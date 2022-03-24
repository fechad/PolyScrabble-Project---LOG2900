import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Parameters } from '@app/classes/parameters';
import * as cst from '@app/constants';
import { CommunicationService } from '@app/services/communication.service';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-game-setup-dialog',
    templateUrl: './game-setup-dialog.component.html',
    styleUrls: ['../../styles/dialogs.scss'],
})
export class GameSetupDialogComponent implements OnInit {
    gameParametersForm: FormGroup;
    imgList: string[] = ['assets/icon-images/1.png', 'assets/icon-images/2.png', 'assets/icon-images/3.png', 'assets/icon-images/4.png'];
    imgChosen: string = this.imgList[0];
    idx: number = 0;
    faArrowRight = faArrowRight;
    faArrowLeft = faArrowLeft;
    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<GameSetupDialogComponent>,
        public communicationService: CommunicationService,
        @Inject(MAT_DIALOG_DATA) public data: unknown,
    ) {}

    closeDialog() {
        this.dialogRef.close();
    }

    ngOnInit() {
        this.gameParametersForm = this.formBuilder.group({
            playerName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]),
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
        parameters.avatar = this.imgChosen;
        parameters.timer = this.gameParametersForm.value.minutes * cst.SEC_CONVERT + this.gameParametersForm.value.seconds;
        parameters.dictionnary = this.gameParametersForm.value.dictionnary;
        await this.communicationService.createRoom(this.gameParametersForm.value.playerName, parameters, undefined);
        this.dialogRef.close();
    }

    chooseIcon(next: boolean) {
        if (next) this.idx++;
        else this.idx--;
        if (this.idx === -1) this.idx = 3;
        this.imgChosen = this.imgList[this.idx % 4];
    }
}

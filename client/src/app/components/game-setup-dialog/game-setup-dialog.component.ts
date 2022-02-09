import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Parameters } from '@app/classes/parameters';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-game-setup-dialog',
    templateUrl: './game-setup-dialog.component.html',
    styleUrls: ['../../styles/dialogs.scss'],
})
export class GameSetupDialogComponent implements OnInit {
    gameParametersForm: FormGroup;
    constructor(
        private router: Router,
        private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<GameSetupDialogComponent>,
        public communicationService: CommunicationService,
        @Inject(MAT_DIALOG_DATA) public data: unknown,
    ) {}

    closeDialog(): void {
        this.dialogRef.close();
    }

    ngOnInit(): void {
        this.gameParametersForm = this.formBuilder.group({
            id: [''],
            playerName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]),
            minutes: new FormControl(1, [Validators.required]),
            seconds: new FormControl(0, [Validators.required]),
            dictionary: new FormControl('', [Validators.required]),
        });
    }

    async onSubmit() {
        for (const key of Object.keys(this.gameParametersForm.controls)) {
            if (!this.gameParametersForm.controls[key].valid) {
                return;
            }
        }

        const parameters = new Parameters();
        parameters.timer = this.gameParametersForm.value.minutes * 60 + this.gameParametersForm.value.seconds;
        parameters.dictionnary = this.gameParametersForm.value.dictionary;
        const error = parameters.validateParameters();
        if (error !== undefined) {
            console.error(error, parameters, this.gameParametersForm.value);
            return;
        }
        await this.communicationService.createRoom(this.gameParametersForm.value.playerName, parameters);
        this.dialogRef.close();
        this.router.navigate(['/waiting-room']);
    }

    createGame() {
        const uuid = 1;
        this.router.navigate(['/game', uuid]);
    }
}

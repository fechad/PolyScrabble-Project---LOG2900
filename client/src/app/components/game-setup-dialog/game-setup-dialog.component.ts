import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GamesListService } from '@app/services/games-list.service';

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
        private gameService: GamesListService,
        @Inject(MAT_DIALOG_DATA) public data: unknown,
    ) {}

    closeDialog(): void {
        this.dialogRef.close();
    }

    ngOnInit(): void {
        this.gameParametersForm = this.formBuilder.group({
            id: [''],
            playerName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]),
            timer: [''],
            dictionary: new FormControl('', [Validators.required]),
        });
    }

    onSubmit() {
        for (const key of Object.keys(this.gameParametersForm.controls)) {
            if (!this.gameParametersForm.controls[key].valid) {
                return;
            }
        }

        this.gameService.addGame(this.gameParametersForm.value);
        this.dialogRef.close();
        this.router.navigate(['/waiting-room']);
    }

    // avoid having turn time limit at 00:00 or 5:30
    checkNonZero() {
        const minute = document.getElementById('minutes') as HTMLSelectElement;
        const second = document.getElementById('seconds') as HTMLSelectElement;

        const selectedMin = minute?.options[minute?.selectedIndex].text;
        const selectedSec = second?.options[second?.selectedIndex].text;

        if (selectedMin === '0' && selectedSec === '00') {
            second.selectedIndex = 1;
        }

        if (selectedMin === '5' && selectedSec === '30') {
            second.selectedIndex = 0;
        }
    }

    createGame() {
        const uuid = 1;
        this.router.navigate(['/game', uuid]);
    }
}

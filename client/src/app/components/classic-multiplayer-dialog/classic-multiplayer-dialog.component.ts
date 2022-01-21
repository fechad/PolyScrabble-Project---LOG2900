import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GamesListService } from '@app/services/games-list.service';

@Component({
    selector: 'app-classic-multiplayer-dialog',
    templateUrl: './classic-multiplayer-dialog.component.html',
    styleUrls: ['./classic-multiplayer-dialog.component.scss'],
})
export class ClassicMultiplayerDialogComponent implements OnInit {
    gameParametersForm: FormGroup;
    constructor(
        private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<ClassicMultiplayerDialogComponent>,
        private gameService: GamesListService,
        @Inject(MAT_DIALOG_DATA) public data: unknown,
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    ngOnInit() {
        // use VALIDATORS HERE
        this.gameParametersForm = this.formBuilder.group({
            id: [],
            playerName: ['', [Validators.required]],
            timer: [, [Validators.required]],
            dictionary: ['', [Validators.required]],
        });
    }

    onSubmit() {
        this.gameService.addGame(this.gameParametersForm.value);
        this.dialogRef.close();
    }

    // avoid having turn time limit at 00:00
    checkNonZero() {
        const minute = document.getElementById('minutes') as HTMLSelectElement;
        const second = document.getElementById('seconds') as HTMLSelectElement;

        const selectedMin = minute?.options[minute?.selectedIndex].text;
        const selectedSec = second?.options[second?.selectedIndex].text;

        if (selectedMin === '0') {
            second.selectedIndex = 1;
        }

        if (selectedMin === '0' && selectedSec === '00') {
            second.selectedIndex = 1;
        }
    }
}

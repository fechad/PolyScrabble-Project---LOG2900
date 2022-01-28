import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GamesListService } from '@app/services/games-list.service';

@Component({
    selector: 'app-game-setup-dialog',
    templateUrl: './game-setup-dialog.component.html',
    styleUrls: ['./game-setup-dialog.component.scss'],
})
export class GameSetupDialogComponent implements OnInit {
    serverMessage: string = '';
    serverClock: Date;

    wordInput = '';
    serverValidationResult = '';
    messageToServer = '';

    broadcastMessage = '';
    serverMessages: string[] = [];

    roomMessage = '';
    roomMessages: string[] = [];

    gameParametersForm: FormGroup;
    constructor(
        private router: Router,
        private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<GameSetupDialogComponent>,
        private gameService: GamesListService,
        @Inject(MAT_DIALOG_DATA) public data: unknown,
    ) {
        this.gameParametersForm = this.formBuilder.group({
            id: [''],
            playerName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]),
            timer: new FormControl('', [Validators.required]),
            dictionary: new FormControl('', [Validators.required]),
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    get socketId() {
        return this.gameService.socket.id ? this.gameService.socket.id : '';
    }

    ngOnInit(): void {
        this.connect();
    }

    onSubmit() {
        this.gameService.addGame(this.gameParametersForm.value);
        this.dialogRef.close();
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

    connect() {
        if (!this.gameService.isSocketAlive()) {
            this.gameService.connect();
            this.configureBaseSocketFeatures();
        }
    }

    configureBaseSocketFeatures() {
        this.gameService.on('connect', () => {
            console.log(`Connexion par WebSocket sur le socket ${this.socketId}`);
        });
        // Afficher le message envoyé lors de la connexion avec le serveur
        this.gameService.on('hello', (message: string) => {
            this.serverMessage = message;
        });

        // Afficher le message envoyé à chaque émission de l'événement "clock" du serveur
        this.gameService.on('clock', (time: Date) => {
            this.serverClock = time;
        });

        // Gérer l'événement envoyé par le serveur : afficher le résultat de validation
        this.gameService.on('wordValidated', (isValid: boolean) => {
            const validationString = `Le mot est ${isValid ? 'valide' : 'invalide'}`;
            this.serverValidationResult = validationString;
        });

        // Gérer l'événement envoyé par le serveur : afficher le message envoyé par un client connecté
        this.gameService.on('massMessage', (broadcastMessage: string) => {
            this.serverMessages.push(broadcastMessage);
        });

        // Gérer l'événement envoyé par le serveur : afficher le message envoyé par un membre de la salle
        this.gameService.on('roomMessage', (roomMessage: string) => {
            this.roomMessages.push(roomMessage);
        });
    }
}

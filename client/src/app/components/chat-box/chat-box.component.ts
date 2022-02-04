import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { SkipTurnService } from '@app/services/skip-turn.service';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit {
    @ViewChild('scroll') private scroller: ElementRef;
    textValue: string = '';
    yourMessage: boolean = true;
    syntaxIsValid: boolean = true;
    commandStructure: string[] = [];
    myId: string | undefined;
    
    constructor(public communicationService: CommunicationService, private skipTurnService: SkipTurnService) {
        this.myId = this.communicationService.getId();
        console.log(this.myId);
    }

    ngOnInit(): void {}

    sendMessage() {
        if (this.validateSyntax()) {
            this.communicationService.sendMessage(this.textValue);
            this.textValue = '';
            this.scrollToBottom();
            /* TODO: Send this message to server */
        }
    }

    isMyMessage() {
        this.yourMessage = false;
    }

    scrollToBottom() {
        this.scroller.nativeElement.scrollTop = this.scroller.nativeElement.scrollHeight;
    }
    validateSyntax(): boolean {
        if (this.textValue.trim() === '') {
            return false;
        } else if (this.textValue[0] == '!') {
            this.guessCommand(this.textValue);
        }
        return this.syntaxIsValid;
    }
    systemError(error: string) {
        /* TODO: Envoi un message rétroactif dans la boite selon l'ereur*/
        /*
        cas 1: erreur de syntaxe
        cas 2: commande imposible a trouver
        cas 3: Entrée invalide
        */
    }
    guessCommand(text: string) {
        if (text.includes('placer')) this.placer(text);
        if (text.includes('échanger')) this.echanger(text);
        if (text.includes('passer')) this.passer(text);
    }
    placer(command: string) {
        /* TODO: vérifie si la commande placer a la bonne synthaxe*/
        this.commandStructure = command.split(' ');
        if (this.commandStructure[this.commandStructure.length - 1].match(/[0-9]/g) || this.commandStructure.length < 3) {
            this.syntaxIsValid = false;
        } else if (
            this.commandStructure[0] === '!placer' &&
            this.commandStructure.length != 1 &&
            this.commandStructure[2][this.commandStructure[2].length - 1].match(/[a-zA-Z]/g)
        ) {
            if (this.commandStructure[1].length === 3) {
                if (this.commandStructure[1][0].match(/[a-o]/g) && this.commandStructure[1][1].match(/[0-9]/g)) {
                    this.syntaxIsValid = true;
                    console.log('entered');
                }
            } else if (this.commandStructure[1].length === 4) {
                if (
                    this.commandStructure[1][0].match(/[a-o]/g) &&
                    this.commandStructure[1][1].match(/[1]/g) &&
                    this.commandStructure[1][2].match(/[0-4]/g)
                    /*(this.commandStructure[1][3].match(/[hv]/g))*/
                ) {
                    this.syntaxIsValid = true;
                    console.log('entered');
                }
            } else {
                this.syntaxIsValid = false;
            }
        }
    }
    echanger(command: string) {
        this.commandStructure = command.split(' ');
        if (this.commandStructure[1].match(/[A-Z0-9]/g)) {
            this.syntaxIsValid = false;
        } else if (this.commandStructure.length > 1) {
            if (
                this.commandStructure[0] === '!échanger' &&
                (this.commandStructure[1].match(/[^A-Z^0-9]/g) || this.commandStructure[1].includes('*'))
            ) {
                this.syntaxIsValid = true;
                console.log(this.commandStructure);
            }
        } else {
            this.syntaxIsValid = false;
        }
    }
    passer(command: string) {
        if (command === '!passer') {
            this.skipTurnService.skipTurn();
            this.syntaxIsValid = false;
        }
    }
}
Injector.create({
    providers: [{ provide: ChatBoxComponent, deps: [SkipTurnService] }],
});

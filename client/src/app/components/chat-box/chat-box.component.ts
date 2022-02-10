import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
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

    constructor(public communicationService: CommunicationService, public gameContextService: GameContextService) {
        this.myId = this.communicationService.getId();
        console.log(this.myId);
    }
    //pre-dev
    ngOnInit(): void {}

    clearText() {
        this.textValue = '';
    }
    isMyMessage() {
        this.yourMessage = false;
    }

    scrollToBottom() {
        this.scroller.nativeElement.scrollTop = this.scroller.nativeElement.scrollHeight;
    }
    validateSyntax() {
        if (this.textValue.trim() !== '') {
            this.commandStructure = this.textValue.split(' ');
            if (this.commandStructure[0][0] === '!') {
                const error = this.validateCommand();
                if (error !== undefined) {
                    console.log(error.message); // TODO: push dans le chat-box locale
                    this.communicationService.sendLocalMessage(error.message);
                }
            } else {
                this.communicationService.sendMessage(this.textValue);
            }
            this.scrollToBottom();
        }
        this.clearText();
    }

    validateCommand(): Error | undefined {
        if (this.commandStructure[0] === '!placer' && this.commandStructure.length === 3) return this.placer();
        if (this.commandStructure[0] === '!échanger' && this.commandStructure.length === 2) return this.echanger();
        if (this.commandStructure[0] === '!passer' && this.commandStructure.length === 1) return this.passer();

        return new Error(`La commande ${this.commandStructure[0]} n'existe pas`);
    }
    placer(): Error | undefined {
        let error: Error | undefined;
        if (this.commandStructure[2].match(/[^a-zA-Z]/g)) {
            error = new Error("Un des caractère n'est pas valide, les caractères valides sont a-z et *");
        } else {
            // imbriquer si test chevalet est vrai
            /* TODO:checker si c dans le chevalet */
            if (this.commandStructure[1][0].match(/[a-o]/g) && this.commandStructure[1][this.commandStructure[1].length - 1].match(/[hv]/g)) {
                if (this.commandStructure[1].length === 3) {
                    if (this.commandStructure[1][1].match(/[0-9]/g)) {
                        console.log(this.commandStructure); // TODO: Envoyer commande
                        this.communicationService.placer(this.commandStructure[2], this.commandStructure[1]);
                    }
                } else if (
                    this.commandStructure[1].length === 4 &&
                    this.commandStructure[1][1].match(/[1]/g) &&
                    this.commandStructure[1][2].match(/[0-4]/g)
                ) {
                    console.log(this.commandStructure); // TODO: Envoyer commande
                    this.communicationService.placer(this.commandStructure[2], this.commandStructure[1]);
                }
            } else {
                error = new Error("Cette ligne n'existe pas ou l'orientation n'est pas valide");
            }
        }
        return error;
    }
    echanger(): Error | undefined {
        let error: Error | undefined;
        if (this.commandStructure[1].match(/[^a-z*]/g)) {
            error = new Error("Un des caractère n'est pas valide, les caractères valides sont a-z et *");
        } else {
            console.log(this.commandStructure);
            /* TODO:checker si c dans le chevalet */
        }
        return error;
    }
    passer(): Error | undefined {
        this.communicationService.switchTurn();
        /* TODO: envoyer au serveur que le tour a été passé */
        return;
    }
}
Injector.create({
    providers: [{ provide: ChatBoxComponent, deps: [SkipTurnService] }],
});

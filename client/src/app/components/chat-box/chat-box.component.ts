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
    @ViewChild('writingBox') set writingBoxRef(textarea: ElementRef) {
        if (textarea) {
            textarea.nativeElement.focus();
        }
    }

    textValue: string = '';
    yourMessage: boolean = true;
    syntaxIsValid: boolean = true;
    commandStructure: string[] = [];
    help: string[] = [
        'Voici ce que vous pouvez faire:',
        '!placer <ligne><colonne>[(h|v)] <lettres>',
        'ex: !placer g10v abc placera verticalement les lettres abc verticalement',
        'à partir de la position g10',
    ];
    myId: string | undefined;

    constructor(public communicationService: CommunicationService, public gameContextService: GameContextService) {
        this.myId = this.communicationService.getId();
    }

    ngOnInit() {}

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
        if (!this.textValue.trim().match(/[A-zÀ-ú0-9*!?]/g) && this.textValue.trim() !== '') {
            this.communicationService.sendLocalMessage('Message ne peut contenir du caractère non textuelle autre que !, ? et *');
        } else if (this.textValue.trim() !== '') {
            this.commandStructure = this.textValue.split(' ');
            if (this.commandStructure[0][0] === '!') {
                const error = this.validateCommand();
                if (error !== undefined) {
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
        if (this.commandStructure[0] === '!aide' && this.commandStructure.length === 1) return this.sendHelp();
        return new Error(`La commande ${this.commandStructure[0]} n'existe pas`);
    }
    sendHelp() {
        for (const message of this.help) {
            this.communicationService.sendLocalMessage(message);
        }
        return undefined;
    }
    placer(): Error | undefined {
        let error: Error | undefined;
        if (this.commandStructure[2].match(/[^A-zÀ-ú]/g)) {
            error = new Error("Un des caractère n'est pas valide, les caractères valides sont a-z et *");
        } else {
            /* TODO:checker si c dans le chevalet */
            if (this.commandStructure[1][0].match(/[a-o]/g) && this.commandStructure[1][this.commandStructure[1].length - 1].match(/[hv]/g)) {
                if (this.commandStructure[1].length === 3) {
                    if (this.commandStructure[1][1].match(/[1-9]/g)) {
                        this.communicationService.placer(this.commandStructure[2], this.commandStructure[1]);
                    }
                } else if (
                    this.commandStructure[1].length === 4 &&
                    this.commandStructure[1][1].match(/[1]/g) &&
                    this.commandStructure[1][2].match(/[0-4]/g)
                ) {
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
            /* TODO:checker si c dans le chevalet */
            this.communicationService.echanger(this.commandStructure[1]);
        }
        return error;
    }
    passer(): Error | undefined {
        this.communicationService.switchTurn();
        return;
    }
}
Injector.create({
    providers: [{ provide: ChatBoxComponent, deps: [SkipTurnService] }],
});

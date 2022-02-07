import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { Game } from '@app/classes/game';
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

    constructor(public communicationService: CommunicationService, private game: Game) {
        this.myId = this.communicationService.getId();
        console.log(this.myId);
    }

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
                const error = this.game.validateCommand(this.commandStructure);
                if (error !== undefined) {
                    console.log(error.message); // TODO: push dans le chat-box locale
                    this.game.systemError(error.message);
                }
            } else {
                this.game.sendMessage(this.textValue);
            }
            this.scrollToBottom();
        }
        this.clearText();
    }

    //TODO: send the rest from here to game
}
Injector.create({
    providers: [{ provide: ChatBoxComponent, deps: [SkipTurnService] }],
});

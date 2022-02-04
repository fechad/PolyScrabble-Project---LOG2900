import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PlayerId } from '@app/classes/room';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit {
    @ViewChild('scroll') private scroller: ElementRef;
    textValue: string = '';
    yourMessage: boolean = true;
    myId: PlayerId | undefined;
    constructor(public communicationService: CommunicationService) {
        this.myId = this.communicationService.getId();
    }

    ngOnInit(): void {}

    sendMessage() {
        if (this.validSyntax()) {
            this.communicationService.sendMessage(this.textValue);
            this.textValue = '';
            this.scrollToBottom();
        }
    }

    isMyMessage() {
        this.yourMessage = false;
    }

    scrollToBottom() {
        this.scroller.nativeElement.scrollTop = this.scroller.nativeElement.scrollHeight;
    }
    validSyntax(): boolean {
        if (this.textValue.trim() === '') {
            return false;
        } else {
            return true;
        }
    }
    systemError(error: string) {
        /* TODO: Envoi un message rétroactif dans la boite selon l'ereur*/
        /*
        cas 1: erreur de syntaxe
        cas 2: commande imposible a trouver
        cas 3: Entrée invalide
        */
    }
    placer(commande: string) {
        /* TODO: vérifie si la commande placer a la bonne synthaxe*/
    }
    echanger(commande: string) {
        /* TODO: vérifie si la commande echanger a la bonne synthaxe*/
    }
    passer(commande: string) {}
}

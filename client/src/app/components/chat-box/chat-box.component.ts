import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { SkipTurnService } from '@app/services/skip-turn.service';

@Component({
    selector: 'app-chat-box',
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit {
    @ViewChild('scroll') private scroller: ElementRef;
    messages: string[] = [];
    textValue: string = '';
    yourMessage: boolean = true;
    syntaxIsValid: boolean = true;
    constructor(private skipTurnService: SkipTurnService) {}

    ngOnInit(): void {}

    sendMessage() {
        if (this.validSyntax()) {
            this.messages.push(this.textValue);
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
    placer(commande: string) {
        /* TODO: vérifie si la commande placer a la bonne synthaxe*/
        console.log(commande);
    }
    echanger(commande: string) {
        /* TODO: vérifie si la commande echanger a la bonne synthaxe*/
        console.log(commande);
    }
    passer(commande: string) {
        this.skipTurnService.skipTurn();
        console.log(commande);
        this.syntaxIsValid = false;
    }
}
Injector.create({
    providers: [{ provide: ChatBoxComponent, deps: [SkipTurnService] }],
});

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

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
    constructor() {}

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
        } else {
            return true;
        }
    }
}

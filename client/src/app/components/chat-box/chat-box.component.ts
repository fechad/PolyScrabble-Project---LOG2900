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
        if (this.validSynthax()) {
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
    validSynthax(): boolean {
        if (this.textValue === '') {
            return false;
        } else {
            return true;
        }
    }
}

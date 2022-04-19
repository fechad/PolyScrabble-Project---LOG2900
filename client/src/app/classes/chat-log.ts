import { BehaviorSubject } from 'rxjs';
import { Message } from './message';

export enum MessageType {
    Normal,
    Command,
    Local,
}

export class ChatLog {
    readonly messages: BehaviorSubject<Message[]> = new BehaviorSubject([] as Message[]);
    readonly tempMessages: BehaviorSubject<string[]> = new BehaviorSubject([] as string[]);
    successfulSending: (message: string) => boolean;
    private msgCount: number = 0;

    receiveMessages(message: Message, msgCount: number, myself: boolean) {
        this.messages.next([...this.messages.value, message]);
        if (this.msgCount <= msgCount && myself) {
            this.tempMessages.value.splice(0, msgCount - this.msgCount + 1);
        }
        this.msgCount = msgCount + 1;
    }

    clearMessages() {
        this.messages.next([]);
        this.tempMessages.next([]);
    }

    addMessage(message: string, type: MessageType = MessageType.Normal) {
        switch (type) {
            case MessageType.Local:
                this.messages.next([...this.messages.value, { text: message, emitter: 'local' }]);
                break;
            case MessageType.Command:
                this.messages.next([...this.messages.value, { text: message, emitter: 'command' }]);
                break;
            default:
                if (this.successfulSending(message)) this.tempMessages.next([...this.tempMessages.value, message]);
                break;
        }
    }
}

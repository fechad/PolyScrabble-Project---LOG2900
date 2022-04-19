import { ChatLog } from './chat-log';

describe('ChatLog', () => {
    let chatLog: ChatLog;
    beforeEach(() => (chatLog = new ChatLog()));
    it('should create an instance', () => {
        expect(new ChatLog()).toBeTruthy();
    });

    it('should clear the messages', () => {
        chatLog.messages.next([
            { emitter: 'Obi-wan', text: 'Hello there' },
            { emitter: 'General Grievous', text: 'General Kenobi! You are a bold one' },
        ]);
        chatLog.clearMessages();
        expect(chatLog.messages.value).toEqual([]);
    });

    it('should receive new messages', () => {
        const MESSAGES = [
            { emitter: 'Obi-wan', text: 'Hello there' },
            { emitter: 'General Grievous', text: 'General Kenobi! You are a bold one' },
        ];
        chatLog.receiveMessages(MESSAGES[0], 0, false);
        chatLog.receiveMessages(MESSAGES[1], 0, true);
        expect(chatLog.messages.value).toEqual(MESSAGES);
    });

    it('should receive new messages and remove them from temp', () => {
        const MESSAGES = [
            { emitter: 'Obi-wan', text: 'Hello there' },
            { emitter: 'General Grievous', text: 'General Kenobi! You are a bold one' },
        ];
        chatLog.tempMessages.next([MESSAGES[0].text, MESSAGES[1].text]);
        chatLog.receiveMessages(MESSAGES[0], 0, true);
        expect(chatLog.messages.value).toEqual(MESSAGES.slice(0, 1));
        expect(chatLog.tempMessages.value).toEqual([MESSAGES[1].text]);
        chatLog.receiveMessages(MESSAGES[1], 1, true);
        expect(chatLog.messages.value).toEqual(MESSAGES);
    });
});

import { Message } from '@app/message';
import { Service } from 'typedi';

@Service()
export class LeaderBoardService {
    clientMessages: Message[];
    constructor() {
        this.clientMessages = [];
    }

    about(): Message {
        return {
            title: 'Basic Server About Page',
            body: 'Try calling /api/docs to get the documentation',
        };
    }

    async helloWorld(): Promise<Message> {
        return { title: 'Hello World', body: 'Time is now' };
    }

    // TODO : ceci est à titre d'exemple. À enlever pour la remise
    storeMessage(message: Message): void {
        // eslint-disable-next-line no-console
        console.log(message);
        this.clientMessages.push(message);
    }

    getAllMessages(): Message[] {
        return this.clientMessages;
    }
}

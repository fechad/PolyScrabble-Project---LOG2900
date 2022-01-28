import { Message } from '@app/message';
import { LeaderBoardService } from '@app/services/leaderboard.service';
import { expect } from 'chai';

describe('Leaderboard service', () => {
    let leaderboardService: LeaderBoardService;

    beforeEach(async () => {
        leaderboardService = new LeaderBoardService();
    });

    it('should return a simple message if #about is called', () => {
        const expectedTitle = 'Basic Server About Page';
        const expectedBody = 'Try calling /api/docs to get the documentation';
        const aboutMessage = leaderboardService.about();
        expect(aboutMessage.title).to.equals(expectedTitle);
        expect(aboutMessage.body).to.equals(expectedBody);
    });

    it('should return Hello World as title', (done: Mocha.Done) => {
        leaderboardService.helloWorld().then((result: Message) => {
            expect(result.title).to.equals('Hello World');
            done();
        });
    });

    it('should have a body that starts with "Time is"', (done: Mocha.Done) => {
        leaderboardService.helloWorld().then((result: Message) => {
            expect(result.body)
                .to.be.a('string')
                .and.satisfy((body: string) => body.startsWith('Time is'));
            done();
        });
    });

    it('should store a message', (done: Mocha.Done) => {
        const newMessage: Message = { title: 'Hello', body: 'World' };
        leaderboardService.storeMessage(newMessage);
        expect(leaderboardService.clientMessages[0]).to.equals(newMessage);
        done();
    });

    it('should get all messages', (done: Mocha.Done) => {
        const newMessage: Message = { title: 'Hello', body: 'World' };
        const newMessage2: Message = { title: 'Hello', body: 'Again' };
        leaderboardService.clientMessages.push(newMessage);
        leaderboardService.clientMessages.push(newMessage2);
        const messages = leaderboardService.getAllMessages();
        expect(messages).to.equals(leaderboardService.clientMessages);
        done();
    });
});

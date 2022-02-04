// import { Application } from '@app/app';
// import { LeaderBoardService } from '@app/services/leaderboard.service';
// import { expect } from 'chai';
// import { StatusCodes } from 'http-status-codes';
// import { createStubInstance, SinonStubbedInstance } from 'sinon';
// import * as supertest from 'supertest';
// import { Container } from 'typedi';
// import { Message } from './leaderboard.controller';

// const HTTP_STATUS_OK = StatusCodes.OK;
// const HTTP_STATUS_CREATED = StatusCodes.CREATED;

// describe('LeaderBoardController', () => {
//     const baseMessage = { title: 'Hello world', body: 'anything really' } as Message;
//     let leaderboardService: SinonStubbedInstance<LeaderBoardService>;
//     let expressApp: Express.Application;

//     beforeEach(async () => {
//         leaderboardService = createStubInstance(LeaderBoardService);
//         leaderboardService.helloWorld.resolves(baseMessage);
//         leaderboardService.about.returns(baseMessage);
//         leaderboardService.getAllMessages.returns([baseMessage, baseMessage]);
//         const app = Container.get(Application);
//         // eslint-disable-next-line dot-notation
//         Object.defineProperty(app['leaderBoardController'], 'leaderboardService', { value: leaderboardService });
//         expressApp = app.app;
//     });

//     it('should return message from leaderboard service on valid get request to root', async () => {
//         return supertest(expressApp)
//             .get('/api/leaderboard')
//             .expect(HTTP_STATUS_OK)
//             .then((response) => {
//                 expect(response.body).to.deep.equal(baseMessage);
//             });
//     });

//     it('should return message from leaderboard service on valid get request to about route', async () => {
//         const aboutMessage = { ...baseMessage, title: 'About' };
//         leaderboardService.about.returns(aboutMessage);
//         return supertest(expressApp)
//             .get('/api/leaderboard/about')
//             .expect(HTTP_STATUS_OK)
//             .then((response) => {
//                 expect(response.body).to.deep.equal(aboutMessage);
//             });
//     });

//     it('should store message in the array on valid post request to /send', async () => {
//         const message: Message = { title: 'Hello', body: 'World' };
//         return supertest(expressApp).post('/api/leaderboard/send').send(message).set('Accept', 'application/json').expect(HTTP_STATUS_CREATED);
//     });

//     it('should return an array of messages on valid get request to /all', async () => {
//         leaderboardService.getAllMessages.returns([baseMessage, baseMessage]);
//         return supertest(expressApp)
//             .get('/api/leaderboard/all')
//             .expect(HTTP_STATUS_OK)
//             .then((response) => {
//                 expect(response.body).to.deep.equal([baseMessage, baseMessage]);
//             });
//     });
// });

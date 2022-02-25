// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ElementRef } from '@angular/core';
// import { TestBed } from '@angular/core/testing';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { ChatBoxLogicService } from './chat-box-logic.service';
// import SpyObj = jasmine.SpyObj;

// describe('ChatBoxLogicService', () => {
//     let service: ChatBoxLogicService;
//     let elemRef: SpyObj<ElementRef>;
//     // const placeCommands = ['!placer g9h baf', '!placer g9h abc', '!placer g13h def', '!placer g13v a', '!placer g13 g'];
//     // const invalidPlaceCommands = ['!placer gz adant', '!placer g9h adan*', '!placer g16h s', '!placer g13v ', '!placer g13 5'];
//     // const exchangeCommands = ['!échanger ab', '!échanger e', ' !échanger cdg'];
//     // const invalidExchangeCommands = ['!échanger', '!échanger eT', ' !échanger e23', '!échanger e*'];
//     beforeEach(() => {
//         elemRef = jasmine.createSpyObj('ElementRef', ['nativeElement', 'nativeElement.focus']);
//     });

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule, FormsModule],
//             declarations: [ChatBoxLogicService],
//             providers: [
//                 { provide: ElementRef, useValue: elemRef },
//                 { provide: Router, useValue: {} },
//             ],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         // service.gameContextService.state.next({ ...service.gameContextService.state.value, turn: service.gameContextService.myId });
//     });

//     it('should create', () => {
//         expect(service).toBeTruthy();
//     });

// it('validateCommand should call placer for a list of valid !placer commands ', () => {
//     const place = spyOn(service, 'place' as never).and.callThrough();
//     for (const i of placeCommands) {
//         service.validateSyntax(i);
//         expect(place).toHaveBeenCalled();
//     }
// });

// it('placer should call communicationService.placer() for a list of valid !placer commands', () => {
//     const comPlace = spyOn(service.communicationService, 'place').and.callThrough();
//     const rackStub: Letter[] = [];
//     const RACKS_LENGTH = 7;
//     for (let i = 0; i < RACKS_LENGTH; i++) {
//         rackStub.push(alphabet[i]); // adds 'abcdefg'
//     }
//     service.gameContextService.rack.next(rackStub);
//     for (const i of placeCommands) {
//         service.validateSyntax(i);
//         expect(comPlace).toHaveBeenCalled();
//     }
// });

// it('validateSyntax should call communicationService.sendLocalMessage for a list of invalid !placer commands ', () => {
//     const sendLocalMessage = spyOn(service.communicationService, 'sendLocalMessage').and.callThrough();
//     for (const i of invalidPlaceCommands) {
//         service.validateSyntax(i);
//         expect(sendLocalMessage).toHaveBeenCalled();
//     }
// });

// it('validateCommand should call echanger for a list of valid !echanger commands ', () => {
//     const exchange = spyOn(service, 'exchange' as never).and.callThrough();
//     for (const i of exchangeCommands) {
//         service.validateSyntax(i);
//         expect(exchange).toHaveBeenCalled();
//     }
// });

// it('placer should call communicationService.echanger() for a list of valid !echanger commands', () => {
//     const comExchange = spyOn(service.communicationService, 'exchange').and.callThrough();
//     const rackStub: Letter[] = [];
//     const RACKS_LENGTH = 7;
//     for (let i = 0; i < RACKS_LENGTH; i++) {
//         rackStub.push(alphabet[i]); // adds 'abcdefg'
//     }
//     service.gameContextService.rack.next(rackStub);
//     for (const i of exchangeCommands) {
//         service.validateSyntax(i);
//         expect(comExchange).toHaveBeenCalled();
//     }
// });

// it('validateSyntax should call communicationService.sendLocalMessage for a list of invalid !echanger commands ', () => {
//     const sendLocalMessage = spyOn(service.communicationService, 'sendLocalMessage').and.callThrough();
//     for (const i of invalidExchangeCommands) {
//         service.validateSyntax(i);
//         expect(sendLocalMessage).toHaveBeenCalled();
//     }
// });

// it('validateCommand should call pass when !passer command is sent ', () => {
//     const pass = spyOn(service, 'pass' as never).and.callThrough();
//     service.validateSyntax('!passer');
//     expect(pass).toHaveBeenCalled();
// });

// it('pass should call communicationService.switchTurn() for a valid !passer command', () => {
//     const switchTurn = spyOn(service.communicationService, 'switchTurn').and.callThrough();
//     service.validateSyntax('!passer');
//     expect(switchTurn).toHaveBeenCalled();
// });

// it('validateSyntax should call communicationService.sendLocalMessage for a list of invalid !passer commands ', () => {
//     const sendLocalMessage = spyOn(service.communicationService, 'sendLocalMessage').and.callThrough();
//     for (const i of ['!passer 5', '!passer a', '!passer A', '!passer *']) {
//         service.validateSyntax(i);
//         expect(sendLocalMessage).toHaveBeenCalled();
//     }
// });

// it('validateSyntax should call communicationService.sendMessage for a list of commands not starting with !', () => {
//     const sendMessage = spyOn(service.communicationService, 'sendMessage').and.callThrough();
//     for (const i of ['passer', 'placer g14v ab', 'echanger aw', 'aide']) {
//         service.validateSyntax(i);
//         expect(sendMessage).toHaveBeenCalled();
//     }
// });
// it('validateSyntax should not call communicationService.sendMessage for an empty message', () => {
//     const sendMessage = spyOn(service.communicationService, 'sendMessage').and.callThrough();
//     service.validateSyntax('');
//     expect(sendMessage).not.toHaveBeenCalled();
// });
// it('validateSyntax should not call communicationService.sendLocalMessage for the accepted characters', () => {
//     const sendLocalMessage = spyOn(service.communicationService, 'sendLocalMessage').and.callThrough();
//     const invalidText = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     service.validateSyntax(invalidText);
//     expect(sendLocalMessage).not.toHaveBeenCalled();
// });
// it('validateSyntax should call communicationService.sendLocalMessage for the !aide command', () => {
//     const sendLocalMessage = spyOn(service.communicationService, 'sendLocalMessage').and.callThrough();
//     service.validateSyntax('!aide');
//     expect(sendLocalMessage).toHaveBeenCalled();
// });
// it('validateSyntax should not call help for an invalid !aide command', () => {
//     const help = spyOn(service, 'sendHelp' as never).and.callThrough();
//     service.validateSyntax('!aide v');
//     expect(help).not.toHaveBeenCalled();
// });
// });

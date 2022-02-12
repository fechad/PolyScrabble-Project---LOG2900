import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { alphabet, Letter } from '@app/services/Alphabet';
import { ChatBoxComponent } from './chat-box.component';

import SpyObj = jasmine.SpyObj;

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;
    let elemRef: SpyObj<ElementRef>;
    const placerCommands = ['!placer g9h baf', '!placer g9h abc', '!placer g13h def', '!placer g13v a', '!placer g13 g'];
    const invalidPlacerCommands = ['!placer gz adant', '!placer g9h adan*', '!placer g16h s', '!placer g13v ', '!placer g13 5'];
    const echangerCommands = ['!échanger ab', '!échanger e', ' !échanger cdg'];
    const invalidEchangerCommands = ['!échanger', '!échanger eT', ' !échanger e23', '!échanger e*'];
    beforeEach(() => {
        elemRef = jasmine.createSpyObj('ElementRef', ['nativeElement', 'nativeElement.focus']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ChatBoxComponent],
            providers: [
                { provide: ElementRef, useValue: elemRef },
                { provide: Router, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.gameContextService.isMyTurn.next(true);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('validateCommand should call placer for a list of valid !placer commands ', () => {
        const placer = spyOn(component, 'placer').and.callThrough();
        for (const i of placerCommands) {
            component.textValue = i;
            component.validateSyntax();
            fixture.whenStable().then(() => {
                expect(placer).toHaveBeenCalled();
            });
        }
    });

    it('placer should call communicationService.placer() for a list of valid !placer commands', () => {
        const comPlacer = spyOn(component.communicationService, 'placer').and.callThrough();
        const rackStub: Letter[] = [];
        const RACKS_LENGTH = 7;
        for (let i = 0; i < RACKS_LENGTH; i++) {
            rackStub.push(alphabet[i]); // adds 'abcdefg'
        }
        component.gameContextService.rack.next(rackStub);
        for (const i of placerCommands) {
            component.textValue = i;
            component.validateSyntax();
            expect(comPlacer).toHaveBeenCalled();
        }
    });

    it('validateSyntax should call communicationService.sendLocalMessage for a list of invalid !placer commands ', () => {
        const sendLocalMessage = spyOn(component.communicationService, 'sendLocalMessage').and.callThrough();
        for (const i of invalidPlacerCommands) {
            component.textValue = i;
            component.validateSyntax();
            expect(sendLocalMessage).toHaveBeenCalled();
        }
    });

    it('validateCommand should call echanger for a list of valid !echanger commands ', () => {
        const echanger = spyOn(component, 'echanger').and.callThrough();
        for (const i of echangerCommands) {
            component.textValue = i;
            component.validateSyntax();
            expect(echanger).toHaveBeenCalled();
        }
    });

    it('placer should call communicationService.echanger() for a list of valid !echanger commands', () => {
        const comEchanger = spyOn(component.communicationService, 'echanger').and.callThrough();
        const rackStub: Letter[] = [];
        const RACKS_LENGTH = 7;
        for (let i = 0; i < RACKS_LENGTH; i++) {
            rackStub.push(alphabet[i]); // adds 'abcdefg'
        }
        component.gameContextService.rack.next(rackStub);
        for (const i of echangerCommands) {
            component.textValue = i;
            component.validateSyntax();
            expect(comEchanger).toHaveBeenCalled();
        }
    });

    it('validateSyntax should call communicationService.sendLocalMessage for a list of invalid !echanger commands ', () => {
        const sendLocalMessage = spyOn(component.communicationService, 'sendLocalMessage').and.callThrough();
        for (const i of invalidEchangerCommands) {
            component.textValue = i;
            component.validateSyntax();
            expect(sendLocalMessage).toHaveBeenCalled();
        }
    });

    it('validateCommand should call placer when !passer command is sent ', () => {
        const passer = spyOn(component, 'passer').and.callThrough();
        component.textValue = '!passer';
        component.validateSyntax();
        expect(passer).toHaveBeenCalled();
    });

    it('placer should call communicationService.switchTurn() for a valid !passer command', () => {
        const switchTurn = spyOn(component.communicationService, 'switchTurn').and.callThrough();
        component.textValue = '!passer';
        component.validateSyntax();
        expect(switchTurn).toHaveBeenCalled();
    });

    it('validateSyntax should call communicationService.sendLocalMessage for a list of invalid !passer commands ', () => {
        const sendLocalMessage = spyOn(component.communicationService, 'sendLocalMessage').and.callThrough();
        for (const i of ['!passer 5', '!passer a', '!passer A', '!passer *']) {
            component.textValue = i;
            component.validateSyntax();
            expect(sendLocalMessage).toHaveBeenCalled();
        }
    });

    it('validateSyntax should call communicationService.sendMessage for a list of commands not starting with !', () => {
        const sendMessage = spyOn(component.communicationService, 'sendMessage').and.callThrough();
        for (const i of ['passer', 'placer g14v ab', 'echanger aw', 'aide']) {
            component.textValue = i;
            component.validateSyntax();
            expect(sendMessage).toHaveBeenCalled();
        }
    });
    it('validateSyntax should not call communicationService.sendMessage for an empty message', () => {
        const sendMessage = spyOn(component.communicationService, 'sendMessage').and.callThrough();
        component.textValue = '';
        component.validateSyntax();
        expect(sendMessage).not.toHaveBeenCalled();
    });
    it('clear text should empty the chatBox textValue', () => {
        component.textValue = 'oejnien  eoij ini eo jo';
        component.clearText();
        expect(component.textValue).toEqual('');
    });
    it('validateSyntax should not call communicationService.sendLocalMessage for the accepted characters', () => {
        const sendLocalMessage = spyOn(component.communicationService, 'sendLocalMessage').and.callThrough();
        component.textValue = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        component.validateSyntax();
        expect(sendLocalMessage).not.toHaveBeenCalled();
    });
    it('validateSyntax should call communicationService.sendLocalMessage for the !aide command', () => {
        const sendLocalMessage = spyOn(component.communicationService, 'sendLocalMessage').and.callThrough();
        component.textValue = '!aide';
        component.validateSyntax();
        expect(sendLocalMessage).toHaveBeenCalled();
    });
    it('validateSyntax should not call help for an invalid !aide command', () => {
        const help = spyOn(component, 'sendHelp').and.callThrough();
        component.textValue = '!aide v';
        component.validateSyntax();
        expect(help).not.toHaveBeenCalled();
    });
});

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatBoxComponent } from './chat-box.component';

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;
    const placerCommands = ['!placer g9h adant', '!placer g9h adanT', '!placer g13h s', '!placer g13v s', '!placer g13 s'];
    const invalidPlacerCommands = ['!placer gz adant', '!placer g9h adan*', '!placer g16h s', '!placer g13v ', '!placer g13 5'];
    const echangerCommands = ['!échanger mwb', '!échanger e*', ' !échanger eew'];
    const invalidEchangerCommands = ['!échanger', '!échanger eT', ' !échanger e23'];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ChatBoxComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('validateCommand should call placer for a list of valid !placer commands ', () => {
        const placer = spyOn(component, 'placer').and.callThrough();
        for (const i of placerCommands) {
            component.textValue = i;
            component.validateSyntax();
            expect(placer).toHaveBeenCalled();
        }
    });

    it('placer should call communicationService.placer() for a list of valid !placer commands', () => {
        const comPlacer = spyOn(component.communicationService, 'placer').and.callThrough();
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
        for (const i of ['passer', 'placer g14v ab', 'echanger aw']) {
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
});

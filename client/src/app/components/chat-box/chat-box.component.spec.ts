import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatBoxComponent } from './chat-box.component';

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;
    const placerCommands = ['!placer g9h adant', '!placer g9h adanT', '!placer g13h s', '!placer g13v s', '!placer g13 s'];
    const invalidPlacerCommands = ['!placer gz adant', '!placer g9h adan*', '!placer g16h s', '!placer g13v ', '!placer g13 5'];

    // const echangerCommands = ['3'];

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
    /*
    it('placer should return an Error type for a list of invalid !placer commands', () => {
        // const placer = spyOnProperty(component, 'placer', undefined).and.returnValue(typeof Error);
        for (const i of invalidPlacerCommands) {
            component.textValue = i;
            const result = component.placer();
            expect(result?.message).toEqual(
                "Un des caractère n'est pas valide, les caractères valides sont a-z et *" ||
                    "Cette ligne n'existe pas ou l'orientation n'est pas valide",
            );
        }
    });
    */
});

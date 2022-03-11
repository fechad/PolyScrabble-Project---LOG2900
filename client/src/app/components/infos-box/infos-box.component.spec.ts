import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerId } from '@app/classes/room';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { InfosBoxComponent } from './infos-box.component';

class GameContextServiceMock {
    myId: PlayerId | undefined;
    getId(): PlayerId | undefined {
        return this.myId;
    }
}

describe('InfosBoxComponent', () => {
    let fixture: ComponentFixture<InfosBoxComponent>;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfosBoxComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: GameContextService, useClass: GameContextServiceMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getId']);
        fixture = TestBed.createComponent(InfosBoxComponent);

        fixture.detectChanges();
    });
});

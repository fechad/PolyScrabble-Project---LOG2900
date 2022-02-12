import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { BehaviorSubject } from 'rxjs';
import { InfosBoxComponent } from './infos-box.component';

export class GameContextServiceMock {
    isMyTurn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
}

describe('InfosBoxComponent', () => {
    // let component: InfosBoxComponent;
    let fixture: ComponentFixture<InfosBoxComponent>;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let gameContextServiceSpy: jasmine.SpyObj<GameContextService>;

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
        // gameContextServiceSpy = jasmine.createSpyObj('GameContextService', ['isMyTurn']);
        fixture = TestBed.createComponent(InfosBoxComponent);
        // component = fixture.componentInstance;
        fixture.detectChanges();

        const isMyTurn = 'isMyTurn';
        Object.defineProperty(gameContextServiceSpy, isMyTurn, { value: true });
    });

    // TO-DO
    // it('should create', () => {
    //     expect(component).toBeTruthy();
    // });

    // it('should call reset', () => {
    //     const resetSpy = spyOn(component, 'reset');
    //     component.ngAfterViewInit();
    //     expect(resetSpy).toHaveBeenCalled();
    // });
});

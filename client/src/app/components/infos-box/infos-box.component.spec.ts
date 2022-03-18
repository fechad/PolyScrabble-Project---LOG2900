import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameState } from '@app/classes/game';
import { PlayerId } from '@app/classes/room';
import { CommunicationServiceMock } from '@app/pages/game-page/game-page.component.spec';
import { GameContextService } from '@app/services/game-context.service';
import { CountdownComponent } from 'ngx-countdown';
import { BehaviorSubject } from 'rxjs';
import { InfosBoxComponent } from './infos-box.component';

class GameContextServiceMock {
    myId: PlayerId | undefined;
    readonly state: BehaviorSubject<GameState>;
    getId(): PlayerId | undefined {
        return this.myId;
    }
}

describe('InfosBoxComponent', () => {
    //let component: InfosBoxComponent;
    let fixture: ComponentFixture<InfosBoxComponent>;
    let communicationServiceSpy: CommunicationServiceMock;
    let countdown: CountdownComponent;
    let http: HttpClient;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfosBoxComponent, CountdownComponent],
            imports: [],
            providers: [
                { provide: CountdownComponent, useValue: countdown },
                { provide: CommunicationServiceMock, useValue: communicationServiceSpy },
                { provide: GameContextService, useValue: GameContextServiceMock },
                { provide: HttpClient, useValue: http },
                { provide: Router, useValue: router },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getId']);
        fixture = TestBed.createComponent(InfosBoxComponent);
        //component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // it('should create', () => {
    //     expect(component).toBeTruthy();
    // });
});

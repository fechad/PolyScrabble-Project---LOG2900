import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { State } from '@app/classes/room';
import { CommunicationServiceMock } from '@app/constants';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication.service';
import { WaitingRoomPageComponent } from './waiting-room-page.component';
const dialogMock = {
    close: () => {
        return;
    },
};

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let router: Router;
    let service: CommunicationServiceMock;

    beforeEach(async () => {
        service = new CommunicationServiceMock();
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), HttpClientModule, AppRoutingModule],
            declarations: [WaitingRoomPageComponent],
            providers: [
                { provide: CommunicationService, useValue: service },
                { provide: MatDialog, useValue: dialogMock },
                { provide: ActivatedRoute, useValue: { snapshot: { url: [''] } } },
            ],
        })
            .overrideComponent(WaitingRoomPageComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        router = TestBed.inject(Router);
        router.initialNavigation();
        service.selectedRoom.subscribe(async (room) => {
            if (room === undefined) router.navigate(['/']);
            else if (room.state === State.Started) router.navigate(['/game']);
            fixture.detectChanges();
        });
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

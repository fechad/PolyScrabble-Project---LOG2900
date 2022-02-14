import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';

// export class CommunicationServiceMock {
//     readonly selectedRoom: BehaviorSubject<Room | undefined> = new Room()
// }

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: Router, useValue: {} }],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        const dictionnaries = httpMock.expectOne('http://localhost:3000/api/dictionnaries');
        dictionnaries.flush([]);
    });

    it('should detect main player', () => {
        service.isMainPlayer();
    });
});

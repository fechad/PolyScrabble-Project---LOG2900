import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { HighScoresComponent } from './high-scores.component';

const dialogMock = {
    close: () => {
        return;
    },
};

describe('HighScoresComponent', () => {
    let component: HighScoresComponent;
    let fixture: ComponentFixture<HighScoresComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [HighScoresComponent],
            providers: [{ provide: MatDialogRef, useValue: dialogMock }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HighScoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});

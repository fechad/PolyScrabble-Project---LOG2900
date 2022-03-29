import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetTabComponent } from './reset-tab.component';

describe('ResetTabComponent', () => {
    let component: ResetTabComponent;
    let fixture: ComponentFixture<ResetTabComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ResetTabComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ResetTabComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

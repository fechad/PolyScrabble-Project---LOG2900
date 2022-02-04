import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfosBoxComponent } from './infos-box.component';

describe('InfosBoxComponent', () => {
    // let component: InfosBoxComponent;
    let fixture: ComponentFixture<InfosBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfosBoxComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InfosBoxComponent);
        // component = fixture.componentInstance;
        fixture.detectChanges();
    });
    /*
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    */
});

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatBoxComponent } from './chat-box.component';
import SpyObj = jasmine.SpyObj;

describe('ChatBoxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;
    let elemRef: SpyObj<ElementRef>;
    beforeEach(() => {
        elemRef = jasmine.createSpyObj('ElementRef', ['nativeElement', 'nativeElement.focus']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule],
            declarations: [ChatBoxComponent],
            providers: [
                { provide: ElementRef, useValue: elemRef },
                { provide: Router, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.gameContextService.state.next({ ...component.gameContextService.state.value, turn: component.gameContextService.myId });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('validateSyntax() should empty the chatBox textValue', () => {
        component.textValue = 'oejnien  eoij ini eo jo';
        component.validateSyntax();
        expect(component.textValue).toEqual('');
    });
});

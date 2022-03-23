import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AuthService);
        sessionStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('retrieve codes', async () => {
        sessionStorage.clear();
        expect(AuthService.getAuth()).toEqual({});

        sessionStorage.setItem('ids', '');
        expect(AuthService.getAuth()).toEqual({});

        sessionStorage.setItem('ids', 'alibaba');
        expect(AuthService.getAuth()).toEqual({ id: 'alibaba' });
        expect(sessionStorage.getItem('ids')).toEqual('');

        sessionStorage.setItem('ids', 'a;b;c;d;d;e');
        expect(AuthService.getAuth()).toEqual({ id: 'e' });
        expect(sessionStorage.getItem('ids')).toEqual('a;b;c;d;d');
    });

    it('save codes', async () => {
        sessionStorage.clear();
        AuthService.saveAuth('ab');
        expect(sessionStorage.getItem('ids')).toEqual('ab');

        sessionStorage.setItem('ids', '');
        AuthService.saveAuth('ab');
        expect(sessionStorage.getItem('ids')).toEqual('ab');

        sessionStorage.setItem('ids', 'alibaba');
        AuthService.saveAuth('ab');
        expect(sessionStorage.getItem('ids')).toEqual('alibaba;ab');

        sessionStorage.setItem('ids', 'a;b;c;d;d;e');
        AuthService.saveAuth('ab');
        expect(sessionStorage.getItem('ids')).toEqual('a;b;c;d;d;e;ab');
    });
});

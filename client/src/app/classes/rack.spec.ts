import { Rack } from './rack';

describe('Rack', () => {
    let rack: Rack;
    beforeEach(() => {
        rack = new Rack();
    });
    it('should create an instance', () => {
        expect(new Rack()).toBeTruthy();
    });

    it('should not update when characters not in rack', () => {
        rack.rack.next([{ name: 'a', score: 1 }]);
        const beforeRack = rack.rack.value;
        expect(() => rack.attemptTempUpdate('ab')).toThrowError();
        expect(beforeRack).toEqual(rack.rack.value);
    });

    it('should throw when characters not in rack', () => {
        rack.rack.next([{ name: 'a', score: 1 }]);
        expect(() => rack.attemptTempUpdate('ab')).toThrowError();
    });

    it('should not throw when upper case characters and * in rack', () => {
        rack.rack.next([{ name: '*', score: 0 }]);
        expect(() => rack.attemptTempUpdate('M')).not.toThrowError();
    });
});

import { CommandParsing } from './command-parsing';

describe('CommandParsing', () => {
    it('should create an instance', () => {
        expect(new CommandParsing()).toBeTruthy();
    });
    it('should only validate upper Case Letters', () => {
        expect(CommandParsing.isUpperCaseLetter('M')).toBeTrue();
        expect(CommandParsing.isUpperCaseLetter('J')).toBeTrue();
        expect(CommandParsing.isUpperCaseLetter('l')).toBeFalse();
    });
});

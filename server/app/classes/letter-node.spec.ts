import { expect } from 'chai';
import { LetterNode } from './letter-node';

describe('Letter Node', () => {
    let letterNode: LetterNode;
    before(async () => {
        letterNode = new LetterNode('a');
    });
    it('should create letter node', () => {
        expect(letterNode.letter).to.equal('a');
        expect(letterNode.final).to.equal(false);
    });
    it('should add node if there is none', () => {
        expect(letterNode.nextNodes.length).to.equal(0);
        letterNode.getNext('b');
        expect(letterNode.nextNodes.length).to.equal(1);
    });

    it('should not add a second one if letter is already in nextNodes', () => {
        expect(letterNode.nextNodes.length).to.equal(1);
        letterNode.getNext('b');
        expect(letterNode.nextNodes.length).to.equal(1);
    });
});

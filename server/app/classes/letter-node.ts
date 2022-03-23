export class LetterNode {
    nextNodes: LetterNode[] = [];
    final: boolean = false;
    constructor(readonly letter: string) {}

    addNext(letter: string) {
        let nextNode = this.getNext(letter);
        if (nextNode === undefined) {
            nextNode = new LetterNode(letter);
            this.nextNodes.push(nextNode);
        }
        return nextNode;
    }
    getNext(letter: string) {
        return this.nextNodes.find((node) => node.letter === letter);
    }
}

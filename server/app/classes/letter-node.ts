export class LetterNode {
    nextNodes: LetterNode[] = [];
    final: boolean = false;
    constructor(readonly letter: string) {}

    getNext(letter: string) {
        let nextNode = this.nextNodes.find((node) => node.letter === letter);
        if (nextNode === undefined) {
            nextNode = new LetterNode(letter);
            this.nextNodes.push(nextNode);
        }
        return nextNode;
    }
}

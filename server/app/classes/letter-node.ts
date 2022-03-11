export class LetterNode {
    value: string;
    nextNodes: LetterNode[] = [];
    final: boolean = false;
    constructor(letter: string) {
        this.value = letter;
    }

    getNext(letter: string) {
        let nextNode = this.nextNodes.find((node) => {
            return node.value === letter;
        });
        if (nextNode === undefined) {
            nextNode = new LetterNode(letter);
            this.nextNodes.push(nextNode);
        }
        return nextNode;
    }
}

import { LetterNode } from './letter-node';

export type DictionnaryInfo = { id: number; name: string; description: string };

export class Dictionnary {
    readonly trie: LetterNode;
    readonly words: Set<string>;

    constructor(readonly id: number, readonly name: string, words: string[], readonly description: string) {
        this.trie = Dictionnary.generateTrie(words);
        this.words = new Set(words);
    }

    private static generateTrie(dictionnary: string[]): LetterNode {
        const trie = new LetterNode('*');
        for (const word of dictionnary) {
            let actualNode = trie;
            [...word].forEach((letter) => {
                actualNode = actualNode.addNext(letter.toUpperCase());
            });
            actualNode.terminal = true;
        }
        return trie;
    }

    getInfo(): DictionnaryInfo {
        return { id: this.id, name: this.name, description: this.description };
    }

    isValidWord(playedWord: string) {
        return this.words.has(playedWord.toLowerCase());
    }
}

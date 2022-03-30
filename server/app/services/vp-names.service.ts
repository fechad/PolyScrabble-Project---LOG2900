import * as cst from '@app/controllers/db.controller';
import { DataBaseController, VP } from '@app/controllers/db.controller';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

@Service()
export class VpNamesService {
    private vpCollection: Collection | undefined = undefined;
    constructor(private dataBase: DataBaseController) {
        this.vpCollection = this.dataBase.db?.collection(cst.VP_COLLECTION);
    }

    async getHNames(): Promise<VP[]> {
        console.log(this.vpCollection);
        if (this.vpCollection === undefined) return cst.DEFAULT_VPS;
        // else return this.vpCollection.aggregate() as unknown as VP[];
        const vpNames = (await this.vpCollection.aggregate().toArray()) as VP[];
        // vpNames.push(...cst.DEFAULT_VPS);
        console.log(vpNames);
        return vpNames;
    }

    async addVP(vp: VP) {
        console.log('sss');
        await this.vpCollection?.insertOne(vp);
        console.log(this.vpCollection);
    }

    async deleteVP(name: string) {
        if (this.vpCollection === undefined) return;
        await this.vpCollection.deleteOne({ name: { $eq: name } });
    }
}

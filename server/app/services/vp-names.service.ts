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
        if (this.vpCollection === undefined) return cst.DEFAULT_VPS;
        const vpNames = (await this.vpCollection.aggregate().toArray()) as VP[];
        console.log(vpNames);
        return vpNames;
    }

    async addVP(vp: VP) {
        // const alreadyInReady = await this.vpCollection?.find(vp)
        await this.vpCollection?.insertOne(vp);
    }

    async deleteVP(name: string) {
        if (this.vpCollection === undefined) return;
        console.log(name);
        await this.vpCollection.deleteOne({ name: { $eq: name } });
    }
}

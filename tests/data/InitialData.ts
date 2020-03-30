import { FirestoreTestSupporter } from "firestore-test-supporter";

import * as firebase from "@firebase/testing";
import { users } from "./collections/users";
import { records } from "./collections/records";
import { seasons } from "./collections/seasons";

export default class InitialData {
    private supporter: FirestoreTestSupporter;
    private db: firebase.firestore.Firestore;

    constructor(rulesFilePath: string) {
        this.supporter = new FirestoreTestSupporter("my-test-project", rulesFilePath);
        this.db = this.supporter.getAdminFirestore();
    }

    // usersコレクションに初期データを追加
    async setupUsers() {
        for (const userId of Object.keys(users.initialData)) {
            const userDoc = this.db.collection(users.collectionPath).doc(userId);
            await firebase.assertSucceeds(userDoc.set(users.initialData[userId]))
        }
    }

    // recordsコレクションに初期データを追加
    async setupRecords() {
        const recordDoc = this.db.collection(records.collectionPath).doc(records.initialData.id);
        await firebase.assertSucceeds(recordDoc.set(records.initialData))
    }

    // seasonsコレクションに初期データを追加
    async setupSeasons() {
        const seasonDoc = this.db.collection(seasons.collectionPath).doc(seasons.initialData(true).id);
        await firebase.assertSucceeds(seasonDoc.set(seasons.initialData(true)))
    }
}
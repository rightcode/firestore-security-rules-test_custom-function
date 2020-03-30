process.env.FIRESTORE_EMULATOR_HOST = "localhost:58080";

import { FirestoreTestSupporter } from "firestore-test-supporter";
import * as path from "path";
import * as firebase from "@firebase/testing";
import { users } from "./data/collections/users";
import { records } from "./data/collections/records";
import InitialData from "./data/InitialData";

describe("成績データの削除テスト", () => {
    const rulesFilePath = path.join(__dirname, "firestore.rules");
    const supporter = new FirestoreTestSupporter("my-test-project", rulesFilePath);

    beforeEach(async () => {
        await supporter.loadRules();

        // 各コレクションに初期データを追加
        const initialData = new InitialData(rulesFilePath);
        await initialData.setupUsers();
        await initialData.setupRecords();
        await initialData.setupSeasons();
    });

    afterEach(async () => {
        await supporter.cleanup()
    });

    describe("adminユーザ以外は削除不可", () => {
        test("ログインしていないユーザはデータの削除不可", async () => {
            // 認証されていないクライアントを取得
            const db = supporter.getFirestore();

            const doc = db.collection(records.collectionPath).doc(records.initialData.id);
            await firebase.assertFails(doc.delete());
        });

        test("adminユーザはデータの削除に成功する", async () => {
            // adminユーザで認証されたクライアントを取得
            const db = supporter.getFirestoreWithAuth(users.sample.admin);

            const doc = db.collection(records.collectionPath).doc(records.initialData.id);
            await firebase.assertSucceeds(doc.delete());
        });

        test("teacherユーザはデータの削除不可", async () => {
            // teacherユーザで認証されたクライアントを取得
            const db = supporter.getFirestoreWithAuth(users.sample.teacher);

            const doc = db.collection(records.collectionPath).doc(records.initialData.id);
            await firebase.assertFails(doc.delete());
        });

        test("studentユーザはデータの削除不可", async () => {
            // studentユーザで認証されたクライアントを取得
            const db = supporter.getFirestoreWithAuth(users.sample.student);

            const doc = db.collection(records.collectionPath).doc(records.initialData.id);
            await firebase.assertFails(doc.delete());
        })
    })
});
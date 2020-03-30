// Firestoreエミュレータのホストとポートを指定
process.env.FIRESTORE_EMULATOR_HOST = "localhost:58080";

import { FirestoreTestSupporter } from "firestore-test-supporter";

import * as path from "path";
import * as firebase from "@firebase/testing";

// テストデータと初期データのセットアップクラスの読み込み
import { users } from "./data/collections/users";
import { records } from "./data/collections/records";
import InitialData from "./data/InitialData";

describe("成績データの追加テスト", () => {
    const rulesFilePath = path.join(__dirname, "firestore.rules");
    const supporter = new FirestoreTestSupporter("my-test-project", rulesFilePath);

    beforeEach(async () => {
        // セキュリティルールの読み込み
        await supporter.loadRules();

        // usersコレクションに初期データを追加
        const initialData = new InitialData(rulesFilePath);
        await initialData.setupUsers()
    });

    afterEach(async () => {
        // データのクリーンアップ
        await supporter.cleanup()
    });

    test('要件にあったデータの追加に成功', async () => {
        // adminユーザで認証されたクライアントを取得
        const db = supporter.getFirestoreWithAuth(users.sample.admin);

        const doc = db.collection(records.collectionPath).doc(records.initialData.id);
        await firebase.assertSucceeds(doc.set(records.initialData))
    });

    test('ログインしていないユーザは追加不可', async () => {
        // 認証されていないクライアントを取得
        const db = supporter.getFirestore();

        const doc = db.collection(records.collectionPath).doc(records.initialData.id);
        await firebase.assertFails(doc.set(records.initialData))
    });

    describe('adminユーザ以外は追加不可', () => {
        test('teacherユーザは追加不可', async () => {
            // teacherユーザで認証されたクライアントを取得
            const db = supporter.getFirestoreWithAuth(users.sample.teacher);

            const doc = db.collection(records.collectionPath).doc(records.initialData.id);
            await firebase.assertFails(doc.set(records.initialData))
        });

        test('studentユーザは追加不可', async () => {
            // studentユーザで認証されたクライアントを取得
            const db = supporter.getFirestoreWithAuth(users.sample.student);

            const doc = db.collection(records.collectionPath).doc(records.initialData.id);
            await firebase.assertFails(doc.set(records.initialData))
        });
    });

    test('成績フィールドは空のマップ', async () => {
        const db = supporter.getFirestoreWithAuth(users.sample.admin);
        const doc = db.collection(records.collectionPath).doc(records.initialData.id);

        // 成績フィールドに空のマップ以外の値を設定
        const badInitialData = {
            ...records.initialData,
            record: records.sample.record
        };

        await firebase.assertFails(doc.set(badInitialData))
    });

    test('所定のフォーマットでないデータは追加不可', async () => {
        for (const key of Object.keys(records.initialData)) {
            const db = supporter.getFirestoreWithAuth(users.sample.admin);
            const doc = db.collection(records.collectionPath).doc(records.initialData.id);

            // 情報の不足した初期データの追加に失敗
            const initialDataClone: any = { ...records.initialData };
            delete initialDataClone[key];
            await firebase.assertFails(doc.set(initialDataClone));

            // 不正な型の初期データの追加に失敗
            initialDataClone[key] = null;
            await firebase.assertFails(doc.set(initialDataClone))
        }
    });
});
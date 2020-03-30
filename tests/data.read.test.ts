process.env.FIRESTORE_EMULATOR_HOST = "localhost:58080";

import { FirestoreTestSupporter } from "firestore-test-supporter";
import * as path from "path";
import * as firebase from "@firebase/testing";
import { users } from "./data/collections/users";
import { records } from "./data/collections/records";
import { seasons } from "./data/collections/seasons";
import InitialData from "./data/InitialData";

describe("成績データの取得テスト", () => {
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

    test("adminユーザはデータの取得可", async () => {
        // adminユーザで認証されたクライアントを取得
        const db = supporter.getFirestoreWithAuth(users.sample.admin);

        const doc = db.collection(records.collectionPath).doc(records.initialData.id);
        await firebase.assertSucceeds(doc.get());
    });

    test("ログインしていないユーザは取得不可", async () => {
        // 認証されていないクライアントを取得
        const db = supporter.getFirestore();

        const doc = db.collection(records.collectionPath).doc(records.initialData.id);
        await firebase.assertFails(doc.get());
    });

    describe("teacherユーザの取得要件", () => {
        let doc: firebase.firestore.DocumentReference;
        beforeEach(() => {
            // teacherユーザで認証されたクライアントを取得
            const db = supporter.getFirestoreWithAuth(users.sample.teacher);
            doc = db.collection(records.collectionPath).doc(records.initialData.id);
        });

        test('要件にあったデータの取得に成功', async () => {
            await firebase.assertSucceeds(doc.get());
        });

        test("担任でないデータは取得不可", async () => {
            // データベース上のデータの担任を変更
            const dbWithAdmin = supporter.getAdminFirestore();
            const docWithAdmin = dbWithAdmin.collection(records.collectionPath).doc(records.initialData.id);
            const newData = { ...records.validUpdateDataForTeacher, homeroomTeacher: "other_teacher" };
            await firebase.assertSucceeds(docWithAdmin.update(newData));

            await firebase.assertFails(doc.get());
        })
    });

    describe("studentユーザの取得要件", () => {
        test('要件にあったデータの取得に成功', async () => {
            // データベース上のデータの成績評価期間フラグをfalseに変更
            const dbWithAdmin = supporter.getAdminFirestore();
            const seasonDoc = dbWithAdmin.collection(seasons.collectionPath).doc(seasons.initialData(true).id);
            await firebase.assertSucceeds(seasonDoc.update(seasons.initialData(false)));

            // studentユーザで認証されたクライアントを取得
            const db = supporter.getFirestoreWithAuth(users.sample.student);

            const doc = db.collection(records.collectionPath).doc(records.initialData.id);
            await firebase.assertSucceeds(doc.get());
        });

        test("自分以外のデータは取得不可", async () => {
            // データベース上のデータの成績評価期間フラグをfalseに変更
            const dbWithAdmin = supporter.getAdminFirestore();
            const seasonDoc = dbWithAdmin.collection(seasons.collectionPath).doc(seasons.initialData(true).id);
            await firebase.assertSucceeds(seasonDoc.update(seasons.initialData(false)));

            // 成績データの生徒と異なる生徒で認証されたクライアントを取得
            const db = supporter.getFirestoreWithAuth(users.sample.other_student);

            const doc = db.collection(records.collectionPath).doc(records.initialData.id);
            await firebase.assertFails(doc.get());
        });

        test("対象シーズンが成績評価期間の場合は取得不可", async () => {
            // studentユーザで認証されたクライアントを取得
            const db = supporter.getFirestoreWithAuth(users.sample.student);

            const doc = db.collection(records.collectionPath).doc(records.initialData.id);
            await firebase.assertFails(doc.get());
        })
    })
});
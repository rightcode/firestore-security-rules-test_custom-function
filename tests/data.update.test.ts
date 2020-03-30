process.env.FIRESTORE_EMULATOR_HOST = "localhost:58080";

import { FirestoreTestSupporter } from "firestore-test-supporter";
import * as path from "path";
import * as firebase from "@firebase/testing";
import { users } from "./data/collections/users";
import { records } from "./data/collections/records";
import { seasons } from "./data/collections/seasons";
import InitialData from "./data/InitialData";

describe("成績データの更新テスト", () => {
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

    test('ログインしていないユーザは更新不可', async () => {
        // 認証されていないクライアントを取得
        const db = supporter.getFirestore();

        const doc = db.collection(records.collectionPath).doc(records.initialData.id);
        await firebase.assertFails(doc.update(records.initialData))
    });

    describe("adminユーザの更新要件", () => {
        let doc: firebase.firestore.DocumentReference;
        beforeEach(() => {
            // adminユーザで認証されたクライアントを取得
            const db = supporter.getFirestoreWithAuth(users.sample.admin);

            doc = db.collection(records.collectionPath).doc(records.initialData.id);
        });

        test('要件にあったデータの更新に成功', async () => {
            await firebase.assertSucceeds(doc.update(records.validUpdateDataForAdmin));
        });

        test('idの更新不可', async () => {
            // リクエストデータのidを変更
            const badData = { ...records.validUpdateDataForAdmin, id: "other_id" };

            await firebase.assertFails(doc.update(badData));
        });

        test('studentIdの更新不可', async () => {
            // リクエストデータのstudentIdを変更
            const badData = { ...records.validUpdateDataForAdmin, studentId: "other0000" };

            await firebase.assertFails(doc.update(badData));
        });

        test('seasonの更新不可', async () => {
            // リクエストデータのseasonを変更
            const badData = { ...records.validUpdateDataForAdmin, season: { year: 2011, semester: 3 } };

            await firebase.assertFails(doc.update(badData));
        });

        test('recordの更新不可', async () => {
            // リクエストデータのrecordを変更
            const badData = { ...records.validUpdateDataForAdmin, record: { Math: 3, NationalLanguage: 4 } };

            await firebase.assertFails(doc.update(badData));
        });
    });

    describe("teacherユーザの更新要件", () => {
        let doc: firebase.firestore.DocumentReference;
        beforeEach(() => {
            // teacherユーザで認証されたクライアントを取得
            const db = supporter.getFirestoreWithAuth(users.sample.teacher);

            doc = db.collection(records.collectionPath).doc(records.initialData.id);
        });

        test('要件にあったデータの更新に成功', async () => {
            await firebase.assertSucceeds(doc.update(records.validUpdateDataForTeacher));
        });

        test('担任でないデータは更新不可', async () => {
            // データベース上のデータの担任を変更
            const dbWithAdmin = supporter.getAdminFirestore();
            const docWithAdmin = dbWithAdmin.collection(records.collectionPath).doc(records.initialData.id);
            const newData = { ...records.validUpdateDataForTeacher, homeroomTeacher: "other_teacher" };
            await firebase.assertSucceeds(docWithAdmin.update(newData));

            await firebase.assertFails(doc.update(records.validUpdateDataForTeacher));
        });

        describe('成績以外のフィールドは更新不可', () => {
            test('idの更新不可', async () => {
                // リクエストデータのidを変更
                const badData = { ...records.validUpdateDataForTeacher, id: "other_id" };

                await firebase.assertFails(doc.update(badData));
            });

            test('studentIdの更新不可', async () => {
                // リクエストデータのstudentIdを変更
                const badData = { ...records.validUpdateDataForTeacher, studentId: "other0000" };

                await firebase.assertFails(doc.update(badData));
            });

            test('seasonの更新不可', async () => {
                // リクエストデータのseasonを変更
                const badData = { ...records.validUpdateDataForTeacher, season: { year: 2009, semester: 1 } };

                await firebase.assertFails(doc.update(badData));
            });

            test('nameの更新不可', async () => {
                // リクエストデータのnameを変更
                const badData = { ...records.validUpdateDataForTeacher, name: "other_name" };

                await firebase.assertFails(doc.update(badData));
            });

            test('homeroomTeacherの更新不可', async () => {
                // リクエストデータのhomeroomTeacherを変更
                const badData = { ...records.validUpdateDataForTeacher, homeroomTeacher: "other_id" };

                await firebase.assertFails(doc.update(badData));
            });
        });

        test('対象シーズンが成績評価期間外の場合は更新不可', async () => {
            // データベース上のデータの成績評価期間フラグをfalseに変更
            const dbWithAdmin = supporter.getAdminFirestore();
            const seasonDoc = dbWithAdmin.collection(seasons.collectionPath).doc(seasons.initialData(true).id);
            await firebase.assertSucceeds(seasonDoc.update(seasons.initialData(false)));

            await firebase.assertFails(doc.update(records.validUpdateDataForTeacher));
        });
    });

    test('studentユーザは更新不可', async () => {
        // studentユーザで認証されたクライアントを取得
        const db = supporter.getFirestoreWithAuth(users.sample.student);

        const doc = db.collection(records.collectionPath).doc(records.initialData.id);
        await firebase.assertFails(doc.update(records.initialData));
    });
});
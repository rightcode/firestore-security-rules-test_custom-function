import { users } from "./users";
import { seasons } from "./seasons";

export namespace records {
    export namespace sample {
        // 成績ID
        export const id = "YYYYYYYYYY";

        // 成績
        export const record = {
            Math: 4,
            NationalLanguage: 3
        };
    }

    // コレクションパス
    export const collectionPath = "students/" + users.sample.student + "/records";

    // 初期データ
    export const initialData = {
        id: sample.id,
        studentId: users.sample.student,
        season: seasons.sample.season,
        name: users.sample.student,
        homeroomTeacher: users.sample.teacher,
        record: {}
    };

    // 更新用データ/システム管理者向け
    export const validUpdateDataForAdmin = {
        id: sample.id,
        studentId: users.sample.student,
        season: seasons.sample.season,
        name: "Eto",
        homeroomTeacher: "Fujita0000",
        record: {}
    };

    // 更新用データ/教師向け
    export const validUpdateDataForTeacher = {
        id: sample.id,
        studentId: users.sample.student,
        season: seasons.sample.season,
        name: users.sample.student,
        homeroomTeacher: users.sample.teacher,
        record: {
            Math: 5,
            NationalLanguage: 5
        }
    };
}


export namespace users {
    export namespace sample {
        // システム管理者
        export const admin = "Aida0000";

        // 教師
        export const teacher = "Baba0000";

        // 生徒
        export const student = "Dojima0000";

        // その他の生徒
        export const other_student = "Fujita"
    }

    // コレクションパス
    export const collectionPath = "users";

    // 初期データ
    const _initialData: any = {};
    _initialData[sample.admin] = {
        id: sample.admin,
        roles: ["admin"]
    };
    _initialData[sample.teacher] = {
        id: sample.teacher,
        roles: ["teacher"]
    };
    _initialData[sample.student] = {
        id: sample.student,
        roles: ["student"]
    };
    _initialData[sample.other_student] = {
        id: sample.other_student,
        roles: ["student"]
    };
    export const initialData = _initialData;
}
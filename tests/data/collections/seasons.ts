export namespace seasons {
    export namespace sample {
        // 対象シーズン
        export const season = "2010_2"
    }

    // コレクションパス
    export const collectionPath = "seasons";

    // 初期データ
    export const initialData = (evaluationPeriod: boolean) => ({
        id: sample.season,
        evaluationPeriod: evaluationPeriod
    });
}

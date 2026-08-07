"use strict";

const B = (id, type, label, hint = "処理の役割を考える", acceptsChildren = false, branches = null) => ({ id, type, label, hint, acceptsChildren, branches });
const I = (id, label, value, type = "number", options = {}) => ({ id, label, value, type, ...options });
const commonDummies = [
  B("dummyInput", "input", "計算結果を入力する", "結果を受け取る処理ではありません"),
  B("dummyOutput", "output", "入力された値をそのまま出力する", "途中の値を表示する処理です")
];

function makeProblem(config) {
  return { hideAssemblyInputSymbol: true, ...config, expected: config.expected || { root: config.correct.map((block) => block.id), nested: {} } };
}

const problems = [
  makeProblem({
    id: "name", category: "順次", title: "氏名をつなげて表示", inputNote: "例の値を自由に変更して確かめられます。",
    description: "氏・名・氏（かな）・名（かな）を受け取り、<code>山田太郎 (やまだ たろう)</code> の形で表示してください。",
    hideAssemblyInputSymbol: true,
    inputs: [I("lastName", "氏", "山田", "text"), I("firstName", "名", "太郎", "text"), I("lastKana", "氏（かな）", "やまだ", "text"), I("firstKana", "名（かな）", "たろう", "text")],
    unorderedPrefix: ["declareSetLastName", "declareSetFirstName", "declareSetLastKana", "declareSetFirstKana"],
    correct: [B("declareSetLastName", "input", "氏の入力値を受け取り、変数 lastName を宣言すると同時に設定する", "氏の入力値を受け取りながら変数を宣言する"), B("declareSetFirstName", "input", "名の入力値を受け取り、変数 firstName を宣言すると同時に設定する", "名の入力値を受け取りながら変数を宣言する"), B("declareSetLastKana", "input", "氏（かな）の入力値を受け取り、変数 lastKana を宣言すると同時に設定する", "氏（かな）の入力値を受け取りながら変数を宣言する"), B("declareSetFirstKana", "input", "名（かな）の入力値を受け取り、変数 firstKana を宣言すると同時に設定する", "名（かな）の入力値を受け取りながら変数を宣言する"), B("declareFullName", "declaration", "整形後の氏名を格納するための変数 fullName を宣言する", "完成した表示用の文字列を入れる変数を用意する"), B("combineName", "calculation", "氏と名を結合し、半角スペース・(・氏（かな）・半角スペース・名（かな）・)を順に加えて整形し、変数 fullName に設定する", "期待される出力と同じ形の文字列に整形する"), B("outputFullName", "output", "整形後の変数 fullName の値を出力する", "完成した文字列を表示する")],
    dummies: [B("combineKanaOnly", "calculation", "氏（かな）と名（かな）だけを結合する"), B("outputLastName", "output", "氏だけを出力する"), B("setFullNameFirst", "assignment", "変数 fullName に、氏の入力値だけを設定する"), B("setResultNameOnly", "assignment", "変数 result に、氏と名だけを結合して設定する"), B("combineWithoutFormat", "calculation", "氏・名・氏（かな）・名（かな）を、空白や括弧を入れずに結合して、変数 fullName に設定する"), B("combineNameReverse", "calculation", "名・氏・名（かな）・氏（かな）の順に結合して、変数 fullName に設定する"), B("combineWithoutFirstKana", "calculation", "氏・名・氏（かな）だけを結合して、変数 fullName に設定する"), ...commonDummies],
    execute(v) { const output = `${v.lastName}${v.firstName} (${v.lastKana} ${v.firstKana})`; return { output, traceColumns: ["処理", "fullName の値"], trace: [["結合後", output]] }; },
    explanation: [["4つの入力値を受け取る", "氏・名・氏（かな）・名（かな）は別々の入力値です。それぞれの変数を宣言すると同時に、対応する入力値を設定します。"], ["整形後の氏名を入れる変数を宣言する", "期待される出力と同じ形に整えた文字列を保存するため、表示用の fullName を用意します。"], ["記号と半角スペースを含めて整形する", "まず氏と名をつなげます。続けて半角スペース、(、氏（かな）、半角スペース、名（かな）、)をこの順に加えることで、「山田太郎 (やまだ たろう)」の形になります。"], ["整形後の fullName を出力する", "すべての文字と記号を整形して fullName に入れてから出力するため、途中の文字列ではなく完成形を表示できます。"]],
    code: [["declareSetLastName", "String lastName = \"山田\";  // 氏の入力値", "氏を宣言と同時に設定する", "String 型の変数 lastName を宣言し、氏の入力値「山田」を同時に設定します。"], ["declareSetFirstName", "String firstName = \"太郎\";  // 名の入力値", "名を宣言と同時に設定する", "String 型の変数 firstName を宣言し、名の入力値「太郎」を同時に設定します。"], ["declareSetLastKana", "String lastKana = \"やまだ\";  // 氏（かな）の入力値", "氏（かな）を宣言と同時に設定する", "String 型の変数 lastKana を宣言し、氏（かな）の入力値「やまだ」を同時に設定します。"], ["declareSetFirstKana", "String firstKana = \"たろう\";  // 名（かな）の入力値", "名（かな）を宣言と同時に設定する", "String 型の変数 firstKana を宣言し、名（かな）の入力値「たろう」を同時に設定します。"], ["declareFullName", "String fullName;", "整形後の氏名を入れる変数", "氏名・かな・記号を整形した完成文字列を保存するための String 型の変数です。"], ["combineName", "fullName = lastName + firstName + \" (\" + lastKana + \" \" + firstKana + \")\";", "文字列を指定の形に整える", "氏と名をつなげた後、半角スペースと ( を加え、かな2つの間にも半角スペースを入れ、最後に ) を加えます。完成形を fullName に設定します。"], ["outputFullName", "System.out.println(fullName);", "整形後の文字列を出力する", "整形済みの fullName を画面に表示します。"]]
  }),
  makeProblem({
    id: "triangle", category: "順次", title: "三角形の面積", inputNote: "底辺と高さには 0 より大きい数を入力してください。",
    description: "三角形の底辺と高さを受け取り、面積を求めて表示してください。", inputs: [I("base", "底辺", 6), I("height", "高さ", 4)],
    unorderedPrefix: ["inputBase", "inputHeight"],
    correct: [B("inputBase", "input", "底辺の入力値を受け取り、変数 base を宣言すると同時に設定する", "底辺の入力値を受け取りながら変数を宣言する"), B("inputHeight", "input", "高さの入力値を受け取り、変数 height を宣言すると同時に設定する", "高さの入力値を受け取りながら変数を宣言する"), B("declareArea", "declaration", "面積を格納するための変数 area を宣言する"), B("calculateArea", "calculation", "底辺 × 高さ ÷ 2 を計算して、変数 area に設定する"), B("outputArea", "output", "変数 area の値を出力する")],
    dummies: [B("calculateRectangle", "calculation", "底辺 × 高さを計算して、そのまま出力する"), B("divideBase", "calculation", "底辺 ÷ 高さを計算する"), B("setResultByAddition", "assignment", "変数 result に、底辺と高さを足した値を設定する"), B("calculateAverageSides", "calculation", "底辺と高さを足してから、2 で割る"), B("doubleRectangleArea", "calculation", "底辺 × 高さ × 2 を計算して、変数 area に設定する"), B("divideThenAdd", "calculation", "底辺を 2 で割ってから、高さを加えて変数 area に設定する"), ...commonDummies],
    valid: (v) => Number(v.base) > 0 && Number(v.height) > 0, execute(v) { const area = Number(v.base) * Number(v.height) / 2; return { output: area, traceColumns: ["底辺", "高さ", "area の値"], trace: [[v.base, v.height, area]] }; },
    explanation: [["底辺と高さを受け取る", "面積の計算に必要な2つの入力値を、それぞれ base と height に設定します。この2つの入力順は入れ替わっても構いません。"], ["面積を入れる変数を宣言する", "計算した面積を保存してから表示するため、area を用意します。"], ["三角形の公式を使う", "三角形の面積は「底辺 × 高さ ÷ 2」です。長方形の半分になるため、最後に 2 で割ります。"], ["area を出力する", "公式で求めた値を画面に表示します。"]],
    code: [["inputBase", "double base = 6;  // 底辺の入力値", "底辺を受け取る", "底辺の入力値を base に設定します。"], ["inputHeight", "double height = 4;  // 高さの入力値", "高さを受け取る", "高さの入力値を height に設定します。"], ["declareArea", "double area;", "double とは", "double は小数を含む数を入れられる型です。"], ["calculateArea", "area = base * height / 2;", "計算と代入", "右側で面積を計算し、結果を area に入れます。"], ["outputArea", "System.out.println(area);", "出力", "計算済みの area を表示します。"]]
  }),
  makeProblem({
    id: "evenOdd", category: "選択", title: "偶数・奇数の判定", inputNote: "整数を入力してください。", description: "整数を1つ受け取り、その値が偶数か奇数かを判定して表示してください。", inputs: [I("number", "入力値", 8)],
    correct: [B("inputNumber", "input", "整数の入力値を受け取り、変数 number を宣言すると同時に設定する", "判定する整数を受け取りながら変数を宣言する"), B("checkRemainder", "decision", "変数 number を 2 で割った余りが 0 か判定する", "if の条件を確認する", true, [["true", "条件が真（はい）のとき"], ["false", "条件が偽（いいえ）のとき"]]), B("outputEven", "output", "文字列「偶数」を出力する", "真の経路で実行する処理"), B("outputOdd", "output", "文字列「奇数」を出力する", "偽の経路で実行する処理")], dummies: [B("checkDivideTwo", "decision", "入力値を 2 で割った結果が 0 か判定する"), B("outputEvenOdd", "output", "文字列「偶数」または「奇数」を出力する"), B("outputNumber", "output", "入力値をそのまま出力する"), B("setResultByDivision", "assignment", "変数 result に、入力値を 2 で割った結果を設定する"), B("checkRemainderOne", "decision", "変数 number を 2 で割った余りが 1 か判定する"), B("checkRemainderBelowTwo", "decision", "変数 number を 2 で割った余りが 2 未満か判定する"), B("checkNumberOverTwo", "decision", "変数 number が 2 より大きいか判定する"), ...commonDummies], expected: { root: ["inputNumber", "checkRemainder"], branches: { checkRemainder: { true: ["outputEven"], false: ["outputOdd"] } } },
    execute(v) { const output = Number(v.number) % 2 === 0 ? "偶数" : "奇数"; return { output, traceColumns: ["入力値", "2で割った余り", "判定"], trace: [[v.number, Number(v.number) % 2, output]] }; },
    explanation: [["判定する整数を受け取る", "最初に入力値を number に設定します。判定処理では、この変数の値を使います。"], ["if の条件を確認する", "偶数は 2 で割り切れる数なので、number を 2 で割った余りが 0 かを調べます。"], ["真の経路では「偶数」を出力する", "余りが 0 なら条件は真です。真の経路にある「偶数」を出力する処理を実行します。"], ["偽の経路では「奇数」を出力する", "余りが 0 でなければ条件は偽です。偽の経路にある「奇数」を出力する処理を実行します。"]],
    code: [["inputNumber", "int number = 8;  // 整数の入力値", "整数を受け取る", "入力された整数を number に設定します。"], ["checkRemainder", "if (number % 2 == 0) {", "if文と %", "% は割り算の余りを求めます。if は条件が成り立つときに処理を選ぶ文です。"], ["outputEven", "    System.out.println(\"偶数\");", "真の経路の処理", "条件が真の場合に、偶数を表示します。"], ["outputOdd", "} else {", "偽の経路への切替", "条件が偽の場合は、else により偽の経路の処理を実行します。"], ["outputOdd", "    System.out.println(\"奇数\");", "偽の経路の処理", "条件が偽の場合に、奇数を表示します。"], ["checkRemainder", "}", "波かっこ", "if / else 全体の処理の終わりを表します。"]]
  }),
  makeProblem({
    id: "max", category: "選択", title: "2つの値の大きい方", inputNote: "2つの整数を入力してください。", description: "2つの整数を受け取り、大きい方の値を表示してください。", inputs: [I("a", "入力値 a", 12), I("b", "入力値 b", 7)],
    unorderedPrefix: ["inputA", "inputB"],
    correct: [B("inputA", "input", "1つ目の整数を受け取り、変数 a を宣言すると同時に設定する", "1つ目の入力値を受け取りながら変数を宣言する"), B("inputB", "input", "2つ目の整数を受け取り、変数 b を宣言すると同時に設定する", "2つ目の入力値を受け取りながら変数を宣言する"), B("compareValues", "decision", "変数 a が変数 b より大きいか判定する", "if の条件を確認する", true, [["true", "条件が真（はい）のとき"], ["false", "条件が偽（いいえ）のとき"]]), B("outputA", "output", "変数 a の値を出力する", "if の中で実行する処理"), B("elseOutputB", "else", "それ以外の場合の処理を実行する（else）", "条件が偽のときの処理をまとめる", true, [["false", "else の中で実行する処理"]]), B("outputB", "output", "変数 b の値を出力する", "else の中で実行する処理"), B("compareLess", "decision", "変数 a が変数 b より小さいか判定する", "別解の if の条件を確認する", true, [["true", "条件が真（はい）のとき"], ["false", "条件が偽（いいえ）のとき"]]), B("outputBWhenLess", "output", "変数 b の値を出力する", "別解の if の中で実行する処理"), B("elseOutputA", "else", "それ以外の場合の処理を実行する（else）", "別解で条件が偽のときの処理をまとめる", true, [["false", "else の中で実行する処理"]]), B("outputAWhenGreater", "output", "変数 a の値を出力する", "別解の else の中で実行する処理")], dummies: [B("compareEqual", "decision", "変数 a と変数 b が等しいか判定する"), B("elseCompareEqual", "else", "それ以外の場合の処理を実行する（else）", "条件が偽のときの処理をまとめる", true, [["false", "else の中で実行する処理"]]), B("outputSmaller", "output", "小さい方の値を出力する"), B("setResultByAddition", "assignment", "変数 result に、変数 a と変数 b を足した値を設定する"), B("compareLessOrEqual", "decision", "変数 a が変数 b 以下か判定する"), B("compareSumToZero", "decision", "変数 a と変数 b の合計が 0 か判定する"), B("checkAIsPositive", "decision", "変数 a が 0 以上か判定する"), ...commonDummies], expected: { root: ["inputA", "inputB", "compareValues"], branches: { compareValues: { true: ["outputA"], false: ["elseOutputB"] }, elseOutputB: { false: ["outputB"] } } }, validSolutions: [{ root: ["inputA", "inputB", "compareValues"], branches: { compareValues: { true: ["outputA"], false: ["elseOutputB"] }, elseOutputB: { false: ["outputB"] } } }, { root: ["inputA", "inputB", "compareLess"], branches: { compareLess: { true: ["outputBWhenLess"], false: ["elseOutputA"] }, elseOutputA: { false: ["outputAWhenGreater"] } } }],
    execute(v) { const output = Number(v.a) >= Number(v.b) ? Number(v.a) : Number(v.b); return { output, traceColumns: ["a", "b", "大きい方"], trace: [[v.a, v.b, output]] }; },
    explanation: [["2つの整数を受け取る", "比較する値を a と b に設定します。比較前に両方の値が用意できていれば、入力順は入れ替わっても構いません。"], ["比較する向きは2通りある", "a が b より大きいかを調べて a を出す方法と、a が b より小さいかを調べて b を出す方法は、どちらも正しい考え方です。"], ["同じ値でも矛盾しない", "a と b が同じなら、どちらを出力しても同じ値です。両方の解法で正しい結果になります。"]],
    code: [["inputA", "int a = 12;  // 1つ目の入力値", "1つ目の整数を受け取る", "入力された整数を a に設定します。"], ["inputB", "int b = 7;  // 2つ目の整数を受け取る", "入力された整数を b に設定します。"], ["compareValues", "if (a >= b) {", "比較演算子 >=", "左の値が右の値以上なら true になります。"], ["outputA", "    System.out.println(a);", "if の中の処理", "a が大きい、または同じときに a を表示します。"], ["elseOutputB", "} else {", "else の開始", "条件が偽の場合に実行する処理を始めます。"], ["outputB", "    System.out.println(b);", "else の中の処理", "a が b より小さいときに b を表示します。"], ["compareValues", "}", "波かっこ", "if / else 全体の終わりを表します。"]]
  }),
  makeProblem({
    id: "weekday", category: "選択", title: "曜日を表示", inputNote: "0〜6 の整数を入力してください。", description: "0 なら日曜日、1 なら月曜日、…、6 なら土曜日を表示し、それ以外は Error と表示してください。", inputs: [I("day", "曜日の番号", 1)],
    correct: [B("inputDay", "input", "曜日の番号を受け取り、変数 day を宣言すると同時に設定する", "曜日の番号を受け取りながら変数を宣言する"), B("declareWeekday", "declaration", "曜日を格納するための変数 weekday を宣言する"), B("selectWeekday", "decision", "変数 day の値に応じて分岐する（switch）", "day の値ごとに処理を選ぶ", true, [["0", "day が 0 の場合"], ["1", "day が 1 の場合"], ["2", "day が 2 の場合"], ["3", "day が 3 の場合"], ["4", "day が 4 の場合"], ["5", "day が 5 の場合"], ["6", "day が 6 の場合"], ["default", "それ以外の場合"]]), B("setSunday", "assignment", "変数 weekday に文字列「日曜日」を設定する"), B("setMonday", "assignment", "変数 weekday に文字列「月曜日」を設定する"), B("setTuesday", "assignment", "変数 weekday に文字列「火曜日」を設定する"), B("setWednesday", "assignment", "変数 weekday に文字列「水曜日」を設定する"), B("setThursday", "assignment", "変数 weekday に文字列「木曜日」を設定する"), B("setFriday", "assignment", "変数 weekday に文字列「金曜日」を設定する"), B("setSaturday", "assignment", "変数 weekday に文字列「土曜日」を設定する"), B("setWeekdayError", "assignment", "変数 weekday に文字列「Error」を設定する"), B("outputWeekday", "output", "変数 weekday の値を出力する")], dummies: [B("loopWeekday", "loop", "0 から 6 まで繰り返して曜日を表示する"), B("outputDay", "output", "入力値をそのまま出力する"), B("setResultAsDayNumber", "assignment", "変数 result に、曜日の番号をそのまま設定する"), B("selectNextWeekday", "decision", "変数 day の値に 1 を足して、対応する曜日を変数 weekday に設定する"), B("selectWeekdayByRemainder", "decision", "変数 day を 7 で割った余りに応じて、変数 weekday に曜日を設定する"), B("checkDayIsNonNegative", "decision", "変数 day が 0 以上かだけを判定して、変数 weekday に曜日を設定する"), B("selectWeekdayShifted", "decision", "変数 day の値に応じて、翌日の曜日を変数 weekday に設定する（switch）", "day の値ごとに処理を選ぶ", true, [["0", "day が 0 の場合"], ["1", "day が 1 の場合"], ["2", "day が 2 の場合"], ["3", "day が 3 の場合"], ["4", "day が 4 の場合"], ["5", "day が 5 の場合"], ["6", "day が 6 の場合"], ["default", "それ以外の場合"]]), ...commonDummies], expected: { root: ["inputDay", "declareWeekday", "selectWeekday", "outputWeekday"], branches: { selectWeekday: { "0": ["setSunday"], "1": ["setMonday"], "2": ["setTuesday"], "3": ["setWednesday"], "4": ["setThursday"], "5": ["setFriday"], "6": ["setSaturday"], default: ["setWeekdayError"] } } },
    execute(v) { const names = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]; const output = Number.isInteger(Number(v.day)) && Number(v.day) >= 0 && Number(v.day) <= 6 ? names[Number(v.day)] : "Error"; return { output, traceColumns: ["入力値", "weekday の値"], trace: [[v.day, output]] }; },
    explanation: [["曜日の番号を受け取る", "最初に入力された番号を day に設定します。この値を使って、どの曜日を選ぶか判断します。"], ["曜日を入れる変数を用意する", "選択した曜日の文字列を保存するために weekday を宣言します。"], ["switch の各場合に処理を置く", "0〜6 とそれ以外の各経路の内側で、対応する文字列を weekday に設定します。"], ["選択後に出力する", "どの分岐を通っても weekday に結果を入れてから、一度だけ表示します。"]],
    code: [["inputDay", "int day = 1;  // 曜日の番号", "曜日の番号を受け取る", "入力された番号を day に設定します。"], ["declareWeekday", "String weekday;", "String とは", "曜日のような文字を入れる型です。"], ["selectWeekday", "switch (day) {", "switch文とは", "1つの値に応じて複数の処理を選ぶ文です。"], ["setSunday", "    case 0: weekday = \"日曜日\"; break;", "case と break", "day が 0 の場合に日曜日を設定し、break で switch を終えます。"], ["setMonday", "    case 1: weekday = \"月曜日\"; break;", "case と break", "day が 1 の場合に月曜日を設定します。"], ["setTuesday", "    case 2: weekday = \"火曜日\"; break;", "case と break", "day が 2 の場合に火曜日を設定します。"], ["setWednesday", "    case 3: weekday = \"水曜日\"; break;", "case と break", "day が 3 の場合に水曜日を設定します。"], ["setThursday", "    case 4: weekday = \"木曜日\"; break;", "case と break", "day が 4 の場合に木曜日を設定します。"], ["setFriday", "    case 5: weekday = \"金曜日\"; break;", "case と break", "day が 5 の場合に金曜日を設定します。"], ["setSaturday", "    case 6: weekday = \"土曜日\"; break;", "case と break", "day が 6 の場合に土曜日を設定します。"], ["setWeekdayError", "    default: weekday = \"Error\";", "default とは", "どの case にも一致しない場合に Error を設定します。"], ["selectWeekday", "}", "波かっこ", "switch 文の終わりを表します。"], ["outputWeekday", "System.out.println(weekday);", "出力", "選ばれた曜日または Error を表示します。"]]
  }),
  makeProblem({
    id: "greeting", category: "選択", title: "時間帯に応じた挨拶", inputNote: "0〜23 の整数を入力してください。", description: "時刻を受け取り、0〜11 は「おはようございます」、12〜17 は「こんにちは」、18〜23 は「こんばんは」、それ以外は案内文を表示してください。", inputs: [I("hour", "時刻", 15)],
    correct: [B("inputHour", "input", "時刻を受け取り、変数 hour を宣言すると同時に設定する", "時刻を受け取りながら変数を宣言する"), B("declareGreeting", "declaration", "挨拶を格納するための変数 greeting を宣言する"), B("checkMorning", "decision", "変数 hour が 0 以上 11 以下か判定する", "最初の if の条件を確認する", true, [["true", "条件が真（はい）のとき"], ["false", "条件が偽（いいえ）のとき"]]), B("setMorning", "assignment", "変数 greeting に文字列「おはようございます」を設定する"), B("checkAfternoon", "elseIf", "それ以外の場合で、変数 hour が 17 以下か判定する（else if）", "次の時間帯の条件を確認する", true, [["true", "条件が真（はい）のとき"], ["false", "条件が偽（いいえ）のとき"]]), B("setAfternoon", "assignment", "変数 greeting に文字列「こんにちは」を設定する"), B("checkEvening", "elseIf", "それ以外の場合で、変数 hour が 23 以下か判定する（else if）", "最後の時間帯の条件を確認する", true, [["true", "条件が真（はい）のとき"], ["false", "条件が偽（いいえ）のとき"]]), B("setEvening", "assignment", "変数 greeting に文字列「こんばんは」を設定する"), B("elseGreeting", "else", "それ以外の場合の処理を実行する（else）", "範囲外の時刻の処理をまとめる", true, [["false", "else の中で実行する処理"]]), B("setHourGuide", "assignment", "変数 greeting に文字列「0〜23時で指定してください」を設定する"), B("outputGreeting", "output", "変数 greeting の値を出力する")], dummies: [B("checkMorningOnly", "decision", "時刻が 12 より小さいかだけ判定する"), B("wrongElseIf", "elseIf", "それ以外の場合で、変数 hour が 12 より小さいか判定する（else if）", "次の時間帯の条件を確認する", true, [["true", "条件が真（はい）のとき"], ["false", "条件が偽（いいえ）のとき"]]), B("outputHour", "output", "時刻をそのまま出力する"), B("setResultAsHour", "assignment", "変数 result に、入力された時刻を設定する"), B("setMorningForAfternoon", "decision", "変数 hour が 12〜17 のとき、「おはようございます」を変数 greeting に設定する"), B("setHelloAfterNoon", "decision", "変数 hour が 12 以上なら、「こんにちは」を変数 greeting に設定する"), B("setGreetingForValidHour", "decision", "変数 hour が 0〜23 のとき、「こんにちは」を変数 greeting に設定する"), ...commonDummies], expected: { root: ["inputHour", "declareGreeting", "checkMorning", "outputGreeting"], branches: { checkMorning: { true: ["setMorning"], false: ["checkAfternoon"] }, checkAfternoon: { true: ["setAfternoon"], false: ["checkEvening"] }, checkEvening: { true: ["setEvening"], false: ["elseGreeting"] }, elseGreeting: { false: ["setHourGuide"] } } },
    execute(v) { const h = Number(v.hour); const output = h >= 0 && h <= 11 ? "おはようございます" : h <= 17 && h >= 12 ? "こんにちは" : h <= 23 && h >= 18 ? "こんばんは" : "0〜23時で指定してください"; return { output, traceColumns: ["時刻", "greeting の値"], trace: [[v.hour, output]] }; },
    explanation: [["時刻を受け取る", "入力された時刻を hour に設定します。後の条件分岐では、この値がどの時間帯に入るかを調べます。"], ["挨拶を入れる変数を宣言する", "選んだ挨拶を1か所に保存して、最後に表示できるようにします。"], ["if / else if を上から順に確認する", "時刻は複数の範囲に分かれます。先に当てはまる時間帯を決め、残りだけを次の else if で調べます。"], ["else で範囲外を扱う", "0〜23 のどれにも当てはまらない場合を最後に用意すると、想定外の入力にも案内を返せます。"]],
    code: [["inputHour", "int hour = 15;  // 時刻の入力値", "時刻を受け取る", "入力された時刻を hour に設定します。"], ["declareGreeting", "String greeting;", "String とは", "文字列を入れる変数の型です。"], ["checkMorning", "if (hour >= 0 && hour <= 11) {", "if と &&", "0以上かつ11以下なら、朝の処理を実行します。"], ["setMorning", "    greeting = \"おはようございます\";", "if の中の処理", "朝の挨拶を greeting に設定します。"], ["checkAfternoon", "} else if (hour <= 17) {", "else if", "朝でなかった場合だけ、17以下かを確認します。"], ["setAfternoon", "    greeting = \"こんにちは\";", "else if の中の処理", "昼の挨拶を greeting に設定します。"], ["checkEvening", "} else if (hour <= 23) {", "else if", "ここまで当てはまらなければ、23以下かを確認します。"], ["setEvening", "    greeting = \"こんばんは\";", "else if の中の処理", "夜の挨拶を greeting に設定します。"], ["elseGreeting", "} else {", "else", "どの時間帯にも当てはまらない場合の処理を始めます。"], ["setHourGuide", "    greeting = \"0〜23時で指定してください\";", "else の中の処理", "範囲外の時刻への案内を設定します。"], ["checkMorning", "}", "波かっこ", "if / else if / else 全体の終わりを表します。"], ["outputGreeting", "System.out.println(greeting);", "出力", "決定した挨拶を表示します。"]]
  }),
  makeProblem({
    id: "leap", category: "ネストした選択", title: "うるう年の判定", inputNote: "西暦を整数で入力してください。", description: "4で割り切れる年はうるう年、ただし100で割り切れる年はうるう年ではなく、400で割り切れる年はうるう年です。このルールで判定してください。", inputs: [I("year", "西暦", 2020)],
    correct: [B("inputYear", "input", "西暦を受け取り、変数 year を宣言すると同時に設定する", "西暦を受け取りながら変数を宣言する"), B("declareLeap", "declaration", "判定結果を格納するための変数 leapYear を宣言する"), B("checkFourHundred", "decision", "変数 year が 400 で割り切れるか判定する", "最初の if の条件を確認する", true, [["true", "条件が真（はい）のとき"], ["false", "条件が偽（いいえ）のとき"]]), B("setLeapByFourHundred", "assignment", "変数 leapYear に文字列「うるう年です」を設定する"), B("checkOneHundred", "elseIf", "それ以外の場合で、変数 year が 100 で割り切れるか判定する（else if）", "100年の例外を確認する", true, [["true", "条件が真（はい）のとき"], ["false", "条件が偽（いいえ）のとき"]]), B("setCommonByOneHundred", "assignment", "変数 leapYear に文字列「うるう年ではありません」を設定する"), B("checkFour", "elseIf", "それ以外の場合で、変数 year が 4 で割り切れるか判定する（else if）", "通常の4年ごとの条件を確認する", true, [["true", "条件が真（はい）のとき"], ["false", "条件が偽（いいえ）のとき"]]), B("setLeapByFour", "assignment", "変数 leapYear に文字列「うるう年です」を設定する"), B("elseCommonYear", "else", "それ以外の場合の処理を実行する（else）", "どの条件にも当てはまらない年を扱う", true, [["false", "else の中で実行する処理"]]), B("setCommonByDefault", "assignment", "変数 leapYear に文字列「うるう年ではありません」を設定する"), B("outputLeap", "output", "変数 leapYear の値を出力する")], dummies: [B("checkFourOnly", "decision", "4 で割り切れるかだけを判定する"), B("wrongLeapElseIf", "elseIf", "それ以外の場合で、変数 year が 4 で割り切れるか判定する（else if）", "次の条件を確認する", true, [["true", "条件が真（はい）のとき"], ["false", "条件が偽（いいえ）のとき"]]), B("checkHundredFirst", "decision", "100 で割り切れる年を必ずうるう年にする"), B("setResultByFour", "assignment", "変数 result に、変数 year を 4 で割った結果を設定する"), B("checkFourOrHundred", "decision", "4 または 100 で割り切れる年を、うるう年に設定する"), B("setFourHundredAsCommonYear", "decision", "400 で割り切れる年を、うるう年ではないと設定する"), B("checkRemainderOneForLeap", "decision", "変数 year を 4 で割った余りが 1 か判定する"), ...commonDummies], expected: { root: ["inputYear", "declareLeap", "checkFourHundred", "outputLeap"], branches: { checkFourHundred: { true: ["setLeapByFourHundred"], false: ["checkOneHundred"] }, checkOneHundred: { true: ["setCommonByOneHundred"], false: ["checkFour"] }, checkFour: { true: ["setLeapByFour"], false: ["elseCommonYear"] }, elseCommonYear: { false: ["setCommonByDefault"] } } },
    execute(v) { const y = Number(v.year); const leap = y % 400 === 0 || (y % 4 === 0 && y % 100 !== 0); const output = leap ? "うるう年です" : "うるう年ではありません"; return { output, traceColumns: ["西暦", "4で割り切れる", "100で割り切れる", "400で割り切れる", "判定"], trace: [[y, y % 4 === 0 ? "はい" : "いいえ", y % 100 === 0 ? "はい" : "いいえ", y % 400 === 0 ? "はい" : "いいえ", output]] }; },
    explanation: [["判定する西暦を受け取る", "入力された西暦を year に設定します。すべての割り切れ判定は、この値を使います。"], ["結果を入れる変数を宣言する", "うるう年かどうかという文字列の結果を保存するために leapYear を用意します。"], ["例外を優先して if / else if で確認する", "400で割り切れる年を先に判定し、次に100年の例外、最後に4年ごとの通常条件を確認します。"], ["else で平年を設定する", "どの条件にも当てはまらない年は、最後の else で平年として扱います。"]],
    code: [["inputYear", "int year = 2020;  // 西暦の入力値", "西暦を受け取る", "入力された西暦を year に設定します。"], ["declareLeap", "String leapYear;", "String とは", "判定結果の文章を入れる型です。"], ["checkFourHundred", "if (year % 400 == 0) {", "最初の if", "400で割り切れる年は必ずうるう年です。"], ["setLeapByFourHundred", "    leapYear = \"うるう年です\";", "if の中の処理", "400年の例外に当てはまる結果を設定します。"], ["checkOneHundred", "} else if (year % 100 == 0) {", "else if", "400では割り切れず100で割り切れる年は平年です。"], ["setCommonByOneHundred", "    leapYear = \"うるう年ではありません\";", "else if の中の処理", "100年の例外に当てはまる結果を設定します。"], ["checkFour", "} else if (year % 4 == 0) {", "else if", "残った年は4で割り切れるかを調べます。"], ["setLeapByFour", "    leapYear = \"うるう年です\";", "else if の中の処理", "4年ごとの条件に当てはまる結果を設定します。"], ["elseCommonYear", "} else {", "else", "どの条件にも当てはまらない場合の処理を始めます。"], ["setCommonByDefault", "    leapYear = \"うるう年ではありません\";", "else の中の処理", "通常の平年の結果を設定します。"], ["checkFourHundred", "}", "波かっこ", "if / else if / else 全体の終わりを表します。"], ["outputLeap", "System.out.println(leapYear);", "出力", "判定結果を表示します。"]]
  }),
  makeProblem({
    id: "sum", category: "繰り返し", title: "1から n までの合計", inputNote: "1〜100の整数を入力してください。", description: "整数 <code>n</code> が与えられたとき、1から <code>n</code> までの整数の合計を求めて出力してください。", inputs: [I("n", "入力値 n", 3, "number", { min: 1, max: 100 })],
    correct: [B("inputN", "input", "整数の入力値を受け取り、変数 n を宣言すると同時に設定する", "合計する範囲の終点を受け取りながら変数を宣言する"), B("declareSum", "declaration", "合計を格納するための変数 sum を宣言する"), B("initializeSum", "assignment", "変数 sum に、初期値として 0 を設定する"), B("loop", "loop", "ループカウンタ変数 i を 1 から n まで、1 ずつ増やしながら繰り返す", "開始・終了・増分を考える", true), B("addCurrent", "calculation", "変数 sum に、ループカウンタ変数 i の値を加える"), B("outputSum", "output", "変数 sum の値を出力する")],
    dummies: [B("initializeSumOne", "assignment", "変数 sum に、初期値として 1 を設定する"), B("loopFromZero", "loop", "ループカウンタ変数 i を 0 から n まで、1 ずつ増やしながら繰り返す", "開始値を考える", true), B("outputCurrent", "output", "ループカウンタ変数 i を、その都度出力する"), B("addToN", "calculation", "変数 n に、ループカウンタ変数 i の値を加える"), B("setResultAsInput", "assignment", "変数 result に、入力値 n を設定する"), B("initializeSumN", "assignment", "変数 sum に、初期値として入力値 n を設定する"), B("loopUntilBeforeN", "loop", "ループカウンタ変数 i を 1 から n の手前まで、1 ずつ増やしながら繰り返す", "終了条件を考える", true), B("multiplyCurrent", "calculation", "変数 sum に、ループカウンタ変数 i の値を掛ける"), B("loopByTwo", "loop", "ループカウンタ変数 i を 1 から n まで、2 ずつ増やしながら繰り返す", "増やし方を考える", true), ...commonDummies], expected: { root: ["inputN", "declareSum", "initializeSum", "loop", "outputSum"], nested: { loop: ["addCurrent"] } },
    valid: (v) => Number.isInteger(Number(v.n)) && Number(v.n) >= 1 && Number(v.n) <= 100,
    execute(v) { let sum = 0; const trace = [["初期状態", "-", sum]]; for (let i = 1; i <= Number(v.n); i += 1) { sum += i; trace.push([`${i}回目`, i, sum]); } return { output: sum, traceColumns: ["繰り返し回数", "ループカウンタ変数 i", "sum の値"], trace }; },
    explanation: [["n の入力値を受け取る理由", "どこまで足し算を繰り返すかを決めるため、最初に入力値を n に設定します。"], ["sum を最初に宣言する理由", "合計を入れる箱を、使う前に用意します。"], ["初期値を 0 にする理由", "まだ何も足していない合計は0であり、0は足しても計算を変えません。"], ["i を 1 から始める理由", "問題が1からnまでを扱うため、ループカウンタ変数 i も1から始めます。"], ["sum に i を加える理由", "繰り返すたびに現在の i を足すことで、sum が途中までの合計になります。"], ["最後に出力する理由", "すべて加え終えた完成した合計を表示します。"]],
    code: [["inputN", "int n = 3;  // 入力値", "n を受け取る", "入力された整数を n に設定します。"], ["declareSum", "int sum;", "int とは", "int は整数を入れるための型です。"], ["initializeSum", "sum = 0;", "=（代入）とは", "右側の値を左側の変数に入れます。"], ["loop", "for (int i = 1; i <= n; i++) {", "for文とは", "初期化・継続条件・増分をまとめて書く繰り返しです。"], ["addCurrent", "    sum = sum + i;", "加算して代入", "sum と i を足した新しい値を、sum に入れ直します。"], ["loop", "}", "波かっこ", "繰り返す処理の終わりを表します。"], ["outputSum", "System.out.println(sum);", "出力", "完成した sum を表示します。"]]
  })
];

const problemHints = {
  name: [
    { simple: "完成形の表示には、4つの入力値だけでなく、空白やかっこも必要です。どこで完成した文字列を作るか考えましょう。", concrete: "氏・名・氏（かな）・名（かな）をそれぞれ受け取り、fullName を用意してから「氏名 (かな かな)」の形に整えます。" },
    { simple: "入力値と、整形後の文字列は役割が異なります。表示用の値を入れる場所を用意できているでしょうか。", concrete: "4つの入力用変数の後に、整形後の文字列を入れる変数 fullName を宣言します。" },
    { simple: "画面に表示するのは途中の文字ではなく、整形が終わった値です。", concrete: "最後に、整形後の変数 fullName の値を出力します。" }
  ],
  triangle: [
    { simple: "面積を出す前に、計算に必要な2つの値がそろっているか確認しましょう。", concrete: "底辺を base、高さを height として、それぞれ入力値を受け取ります。" },
    { simple: "三角形の面積は、長方形の面積とどのような関係でしょうか。", concrete: "面積は「底辺 × 高さ ÷ 2」です。計算結果を area に設定します。" },
    { simple: "出力する値は、計算式そのものではなく、計算後の結果です。", concrete: "最後に変数 area の値を出力します。" }
  ],
  evenOdd: [
    { simple: "偶数か奇数かでは、判定の後に必ず2つの経路のどちらかを通ります。", concrete: "number を 2 で割った余りが 0 か判定するブロックを置きます。" },
    { simple: "真の経路と偽の経路では、表示する文字列が異なります。", concrete: "真の経路には「偶数」を出力するブロック、偽の経路には「奇数」を出力するブロックを直接配置します。" },
    { simple: "判定に使う値は、判定する前に変数として受け取る必要があります。", concrete: "最初に整数の入力値を受け取り、変数 number を宣言すると同時に設定します。" }
  ],
  max: [
    { simple: "2つの値のどちらを出力するかは、比較結果によって変わります。", concrete: "a が b 以上か判定する if ブロックを置きます。" },
    { simple: "比較が真の場合と偽の場合に、それぞれどちらの変数を表示するか考えましょう。", concrete: "真の経路では a を出力し、偽の経路では else ブロック内で b を出力します。" },
    { simple: "比較する前に、2つの値を別々に準備する必要があります。", concrete: "入力値 a と入力値 b は、どちらが先でも構いませんが、両方を受け取ってから比較します。" }
  ],
  weekday: [
    { simple: "1つの数値に応じて多くの処理を選ぶときは、各場合を分けて考えます。", concrete: "day の値に応じて分岐する switch ブロックを置き、0〜6 とそれ以外の8つの領域を使います。" },
    { simple: "どの経路でも、最後に表示する変数へ文字列を設定する必要があります。", concrete: "0 の領域には「日曜日」、1 の領域には「月曜日」…、それ以外には「Error」を weekday に設定します。" },
    { simple: "曜日を選ぶ処理と、表示する処理は分けられています。", concrete: "switch の後に、変数 weekday の値を出力します。" }
  ],
  greeting: [
    { simple: "時間帯は複数あります。上から順に条件を確認すると、次に調べる範囲が絞れます。", concrete: "最初は hour が 0〜11 かを if で判定し、偽の経路に else if をつなげます。" },
    { simple: "各時間帯では、表示用の変数へ異なる挨拶を設定します。", concrete: "朝は「おはようございます」、12〜17時は「こんにちは」、18〜23時は「こんばんは」を greeting に設定します。" },
    { simple: "どの時間帯にも当てはまらない場合も、最後に扱う必要があります。", concrete: "最後の else の中で「0〜23時で指定してください」を greeting に設定し、最後に greeting を出力します。" }
  ],
  sum: [
    { simple: "合計を作るには、最初に何も足していない状態を表す値が必要です。", concrete: "sum を宣言し、繰り返しの前に sum を 0 に設定します。" },
    { simple: "問題文は 1 から n までです。繰り返しの開始値・終了値・増やし方を確認しましょう。", concrete: "ループカウンタ変数 i を 1 から n まで、1ずつ増やしながら繰り返します。" },
    { simple: "繰り返しの中では、毎回の値を合計へ反映させます。", concrete: "繰り返しブロックの内側に「sum に i を加える」を置き、繰り返し後に sum を出力します。" }
  ],
  leap: [
    { simple: "うるう年には例外があります。どの条件を先に調べるべきか、ルールの優先順位を考えましょう。", concrete: "最初に 400 で割り切れるかを判定し、偽の経路で 100、さらに 4 の条件へ進みます。" },
    { simple: "各条件の真の経路では、判定結果の文字列を設定します。", concrete: "400 と 4 の真の経路では「うるう年です」、100 の真の経路では「うるう年ではありません」を leapYear に設定します。" },
    { simple: "すべての条件に当てはまらない年も、最後に結果を決める必要があります。", concrete: "最後の else で「うるう年ではありません」を設定し、分岐の後に leapYear を出力します。" }
  ]
};

const maxProblem = problems.find((problem) => problem.id === "max");
maxProblem.explanation = [["2つの整数を受け取る", "比較する値を a と b に設定します。比較前に両方の値が用意できていれば、入力順は入れ替わっても構いません。"], ["比較する向きは2通りある", "a が b より大きいかを調べて a を出す方法と、a が b より小さいかを調べて b を出す方法は、どちらも正しい考え方です。"], ["同じ値でも矛盾しない", "a と b が同じなら、どちらを出力しても同じ値です。両方の解法で正しい結果になります。"]];
maxProblem.code = [["inputA", "int a = 12;  // 1つ目の入力値", "1つ目の整数を受け取る", "入力された整数を a に設定します。"], ["inputB", "int b = 7;  // 2つ目の入力値", "2つ目の整数を受け取る", "入力された整数を b に設定します。"], ["compareValues", "if (a > b) {", "比較演算子 >", "a が b より大きいときだけ true になります。"], ["outputA", "    System.out.println(a);", "if の中の処理", "a が大きいときに a を表示します。"], ["elseOutputB", "} else {", "else の開始", "a が b 以下の場合に実行する処理を始めます。"], ["outputB", "    System.out.println(b);", "else の中の処理", "b が a 以上の場合に b を表示します。"], ["compareValues", "}", "波かっこ", "if / else 全体の終わりを表します。"], ["compareLess", "// 別解: if (a < b) {", "別解", "比較の向きを反対にしても、真の経路で b を出せば正解です。"], ["outputBWhenLess", "//     System.out.println(b);", "別解の真の経路", "a が b より小さいときに b を表示します。"], ["elseOutputA", "// } else {", "別解の else", "a が b 以上の場合は a を表示する経路へ進みます。"], ["outputAWhenGreater", "//     System.out.println(a);", "別解の偽の経路", "a が b 以上のときに a を表示します。"], ["compareLess", "// }", "別解の終わり", "別解の if / else 全体の終わりです。"]];
problemHints.max = [{ simple: "2つの値のどちらを出力するかは、比較結果によって変わります。", concrete: "a が b より大きいかを判定して a を出す方法と、a が b より小さいかを判定して b を出す方法の2通りがあります。" }, { simple: "真の場合と偽の場合に、必ず大きい方を出力できているか確認しましょう。", concrete: "a > b なら真の経路で a、それ以外なら b を出力します。別解では a < b なら b、それ以外なら a を出力します。" }, { simple: "a と b が同じ場合も、出力結果は同じです。", concrete: "同じ値なら a を出しても b を出しても結果は同じため、どちらの比較方法も正解として扱います。" }];

problems.sort((left, right) => ["name", "triangle", "evenOdd", "max", "weekday", "greeting", "sum", "leap"].indexOf(left.id) - ["name", "triangle", "evenOdd", "max", "weekday", "greeting", "sum", "leap"].indexOf(right.id));

const $ = (s) => document.querySelector(s);
const palette = $("#block-palette"), assemblyList = $("#assembly-list"), problemInputs = $("#problem-inputs"), expectedOutputValue = $("#expected-output-value"), feedback = $("#feedback"), hintArea = $("#hint-area"), hintButton = $("#hint-button"), hintPanel = $("#hint-panel"), hintCount = $("#hint-count"), hintText = $("#hint-text"), concreteHintButton = $("#concrete-hint-button"), concreteHintText = $("#concrete-hint-text"), previousHintButton = $("#previous-hint-button"), nextHintButton = $("#next-hint-button"), resultPanel = $(".result-panel"), resultContent = $("#result-content"), resultDetails = $("#result-details"), resultDrawerTab = $("#result-drawer-tab"), problemDrawerTab = $("#problem-drawer-tab"), problemDrawerClose = $("#problem-drawer-close"), workspace = $(".workspace"), buildPanel = $(".build-panel"), codeCorrespondence = $("#code-correspondence");
const completionStorageKey = "algobridge-completed-problems";
function loadCompletions() { try { const saved = JSON.parse(localStorage.getItem(completionStorageKey) || "{}"); return Object.fromEntries(problems.filter((problem) => saved?.[problem.id]?.inputValues && typeof saved[problem.id].inputValues === "object").map((problem) => [problem.id, saved[problem.id]])); } catch { return {}; } }
let problemIndex = 0, currentProblem = problems[0], dragged = null, history = [], hints = [], shownHints = 0, concreteHintVisible = false, isInstructorMode = localStorage.getItem("algobridge-instructor-mode") === "true", completedProblems = loadCompletions();
const passwordHash = "02006319c292b2880b56de90a7e8a1751713baae6cf9762a1ac8b216a50192e7";
const sourceResizer = $("#source-resizer");

function escapeHtml(text) { return String(text).replace(/[&<>\"]/g, (x) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[x])); }
function formatLabel(text) { return escapeHtml(text).replace(/(sum|area|fullName|weekday|greeting|leapYear|lastName|firstName|lastKana|firstKana|base|height|number|year|hour|day|[abni])/g, '<span class="token-variable">$1</span>').replace(/(\b\d+\b)/g, '<span class="token-value">$1</span>').replace(/(受け取る|宣言する|設定する|出力する|結合する|加える|判定する|繰り返す|実行する)/g, '<span class="token-verb">$1</span>'); }
function blocks() { return [...assemblyList.querySelectorAll(".placed-block")]; }
function directIds(zone) { return [...zone.querySelectorAll(":scope > .placed-block")].map((x) => x.dataset.blockId); }
function definition(id) { return [...currentProblem.correct, ...currentProblem.dummies].find((b) => b.id === id); }
function expectedIdsFor(expected) { return [...expected.root, ...Object.values(expected.nested || {}).flat(), ...Object.values(expected.branches || {}).flatMap((branch) => Object.values(branch).flat())]; }
function expectedIds() { return [...new Set((currentProblem.validSolutions || [currentProblem.expected]).flatMap(expectedIdsFor))]; }
function values() { return Object.fromEntries(currentProblem.inputs.map((input) => [input.id, $("#input-" + input.id).value])); }
function problemNumber(index) { return ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"][index] || String(index + 1); }
function selectProblem(index) { if (index < 0 || index >= problems.length || index === problemIndex) return; workspace.classList.remove("is-problem-list-open"); problemIndex = index; currentProblem = problems[problemIndex]; history = []; renderProblem(); }
function isCompleted(problem = currentProblem) { return Boolean(completedProblems[problem.id]); }
function savedInputValues(problem = currentProblem) { return completedProblems[problem.id]?.inputValues || {}; }
function saveCompletion(inputValues) { completedProblems[currentProblem.id] = { inputValues }; localStorage.setItem(completionStorageKey, JSON.stringify(completedProblems)); updateCompletionProgress(); }
function updateCompletionProgress() { const count = Object.keys(completedProblems).length; const completed = isCompleted(); $("#completed-count").textContent = count; $("#completed-total").textContent = problems.length; $("#current-completion-status").textContent = `問題${problemNumber(problemIndex)}：${completed ? "正解済み" : "未挑戦"}`; $(".completion-progress").classList.toggle("is-completed", completed); $("#reset-completion-button").disabled = count === 0; }

function renderProblem() {
  $("#lesson-position").textContent = `問題 ${problemIndex + 1} / ${problems.length}`;
  $("#problem-heading").textContent = `問題 ${problemNumber(problemIndex)}：${currentProblem.title}`; $("#problem-description").innerHTML = currentProblem.description; $("#problem-category").textContent = currentProblem.category;
  $("#input-note").textContent = currentProblem.inputNote; $("#assembly-input-symbol").textContent = `入力：${currentProblem.inputs.map((x) => x.label).join("、")}`;
  problemInputs.replaceChildren();
  const savedValues = savedInputValues();
  currentProblem.inputs.forEach((input) => { const label = document.createElement("label"); label.className = "number-input"; const inputValue = savedValues[input.id] ?? input.value; label.innerHTML = `<span>${escapeHtml(input.label)}</span><input id="input-${input.id}" type="${input.type}" value="${escapeHtml(inputValue)}" ${input.min !== undefined ? `min="${input.min}"` : ""} ${input.max !== undefined ? `max="${input.max}"` : ""}>`; problemInputs.append(label); });
  problemInputs.querySelectorAll("input").forEach((input) => input.addEventListener("input", updateExpectedOutput));
  $("#previous-problem-button").disabled = problemIndex === 0; $("#next-problem-button").disabled = problemIndex === problems.length - 1;
  $("#block-count").textContent = `全${currentProblem.correct.length + currentProblem.dummies.length}個（正解は${currentProblem.correct.length}個）`;
  $("#problem-list-summary").textContent = `全${problems.length}問`;
  const list = $("#problem-list-items"); list.replaceChildren();
  problems.forEach((problem, index) => { const button = document.createElement("button"); button.type = "button"; button.className = "problem-list-item"; button.classList.toggle("is-current", index === problemIndex); button.innerHTML = `<span class="problem-list-number">${problemNumber(index)}</span><span><strong>問題 ${problemNumber(index)}</strong><small>${escapeHtml(problem.title)} <em>${escapeHtml(problem.category)}</em></small></span>`; button.addEventListener("click", () => selectProblem(index)); list.append(button); });
  resetWorkspace(false); renderLearningSupport(); updateExpectedOutput(); updateCompletionProgress(); if (isCompleted()) renderResult(values(), "completed");
}

function updateExpectedOutput() { const v = values(); expectedOutputValue.textContent = isValid(v) ? currentProblem.execute(v).output : "-"; }
function isValid(v) { return currentProblem.valid ? currentProblem.valid(v) : Object.values(v).every((x) => String(x).trim() !== ""); }
function shuffle(list) { return [...list].sort(() => Math.random() - .5); }
function renderPalette() { palette.replaceChildren(); const grouped = Object.values([...currentProblem.correct, ...currentProblem.dummies].reduce((groups, block) => { (groups[block.type] ||= []).push(block); return groups; }, {})); shuffle(grouped).forEach((group) => shuffle(group).forEach((block) => { const button = document.createElement("button"); button.type = "button"; button.className = `source-block block-${block.type}`; button.draggable = true; button.dataset.blockId = block.id; button.innerHTML = `<span class="block-handle">⠿</span><span class="block-copy"><strong>${formatLabel(block.label)}</strong><small>${escapeHtml(block.hint)}</small></span>`; button.addEventListener("dragstart", () => { dragged = { id: block.id, source: "palette" }; }); button.addEventListener("click", () => addBlock(block.id, assemblyList)); palette.append(button); })); updatePalette(); }
function zoneMessage(zone, next = false) { if (zone.classList.contains("branch-body")) return next ? "次の処理をここに配置" : "ここに処理を配置"; return next ? "次の繰り返し処理をここに配置" : "ここに繰り返しの中の処理を配置"; }
function createEmpty(zone, nested = false) { const empty = document.createElement("div"); empty.className = nested ? "nested-empty" : "empty-state"; empty.dataset.empty = "true"; empty.innerHTML = nested ? zoneMessage(zone) : '<span class="empty-icon">＋</span><strong>ここに処理を配置</strong><p>左側の一覧からドラッグ＆ドロップ</p>'; zone.append(empty); }
function createDropSpace(zone, nested = false) { const space = document.createElement("div"); space.className = "drop-space"; space.dataset.dropSpace = "true"; space.textContent = nested ? zoneMessage(zone, true) : "次の処理をここに配置"; zone.append(space); return space; }
function updateZoneDropSpace(zone) { const nested = zone !== assemblyList; const hasBlocks = directIds(zone).length > 0; const empty = zone.querySelector(":scope > [data-empty]"); let space = zone.querySelector(":scope > .drop-space"); if (!hasBlocks) { space?.remove(); if (!empty) createEmpty(zone, nested); return; } empty?.remove(); if (!space) space = createDropSpace(zone, nested); zone.append(space); }
function createBlock(id) { const block = definition(id), item = document.createElement("article"); item.className = `placed-block block-${block.type}`; item.draggable = true; item.dataset.blockId = id; item.innerHTML = `<div class="placed-copy"><strong>${formatLabel(block.label)}</strong><span>${escapeHtml(block.hint)}</span><button class="remove-block" type="button" aria-label="削除">×</button></div>`; item.querySelector(".remove-block").addEventListener("click", () => { saveHistory(); item.remove(); refreshAssembly(); }); item.addEventListener("dragstart", () => { dragged = { id, source: "placed", item }; }); if (block.type === "loop" && block.acceptsChildren) { const body = document.createElement("div"); body.className = "loop-body dropzone"; body.dataset.zone = id; body.innerHTML = '<span class="loop-body-label">繰り返しの中で実行する処理</span>'; createEmpty(body, true); addDropEvents(body); item.append(body); const end = document.createElement("div"); end.className = "loop-end-symbol"; end.innerHTML = "<span>繰り返し終了</span>"; item.append(end); } const branchDefinitions = block.branches || (block.type === "decision" ? [["true", "条件が真（はい）のとき"], ["false", "条件が偽（いいえ）のとき"]] : null); if (branchDefinitions) { item.classList.add("has-branch-body"); const branches = document.createElement("div"); branches.className = "branch-bodies"; branchDefinitions.forEach(([name, label]) => { const branch = document.createElement("div"); branch.className = `branch-body branch-body-${name} dropzone`; branch.dataset.zone = `${id}:${name}`; branch.dataset.branch = name; branch.innerHTML = `<span class="branch-body-label">${label}</span>`; createEmpty(branch, true); addDropEvents(branch); branches.append(branch); }); item.append(branches); } return item; }
function addBlock(id, zone) { if (blocks().some((x) => x.dataset.blockId === id)) return; saveHistory(); zone.querySelector(":scope > [data-empty]")?.remove(); zone.insertBefore(createBlock(id), zone.querySelector(":scope > .drop-space")); refreshAssembly(); }
function addDropEvents(zone) { zone.addEventListener("dragover", (event) => { event.preventDefault(); zone.classList.add("is-drag-over"); }); zone.addEventListener("dragleave", () => zone.classList.remove("is-drag-over")); zone.addEventListener("drop", (event) => { event.preventDefault(); zone.classList.remove("is-drag-over"); if (!dragged) return; const id = dragged.id; const target = event.target.closest(".placed-block"); const targetInZone = target?.parentElement === zone ? target : null; const item = dragged.source === "placed" ? dragged.item : createBlock(id); if (dragged.source === "placed") { saveHistory(); dragged.item.remove(); } if (dragged.source === "palette" && blocks().some((block) => block.dataset.blockId === id)) return; zone.querySelector(":scope > [data-empty]")?.remove(); if (targetInZone && targetInZone !== item) { const midpoint = targetInZone.getBoundingClientRect().top + targetInZone.getBoundingClientRect().height / 2; zone.insertBefore(item, event.clientY < midpoint ? targetInZone : targetInZone.nextSibling); } else { zone.insertBefore(item, zone.querySelector(":scope > .drop-space")); } dragged = null; refreshAssembly(); }); }
function addPaletteDropEvents() { palette.addEventListener("dragover", (event) => { if (dragged?.source !== "placed") return; event.preventDefault(); palette.classList.add("is-remove-target"); }); palette.addEventListener("dragleave", (event) => { if (!palette.contains(event.relatedTarget)) palette.classList.remove("is-remove-target"); }); palette.addEventListener("drop", (event) => { event.preventDefault(); palette.classList.remove("is-remove-target"); if (dragged?.source !== "placed") return; saveHistory(); dragged.item.remove(); dragged = null; refreshAssembly(); }); }
function updateAssemblySymbols() { const hasInputBlock = currentProblem.hideAssemblyInputSymbol || blocks().some((block) => definition(block.dataset.blockId)?.type === "input"); [$("#assembly-input-symbol"), $("#assembly-after-input-arrow")].forEach((element) => { element.hidden = hasInputBlock; }); $("#assembly-input-arrow").hidden = false; }
function refreshAssembly() { [assemblyList, ...assemblyList.querySelectorAll(".loop-body, .branch-body")].forEach(updateZoneDropSpace); updateAssemblySymbols(); updatePalette(); clearFeedback(); clearResults(); }
function updatePalette() { palette.querySelectorAll(".source-block").forEach((button) => { const used = blocks().some((x) => x.dataset.blockId === button.dataset.blockId); button.disabled = used; button.draggable = !used; button.classList.toggle("is-used", used); }); const undoButton = $("#undo-button"); undoButton.disabled = !history.length; undoButton.title = history.length ? "直前の配置に戻す" : "戻せる配置はありません"; }
function snapshotBlock(block) { return { id: block.dataset.blockId, children: block.querySelector(":scope > .loop-body") ? [...block.querySelector(":scope > .loop-body").querySelectorAll(":scope > .placed-block")].map(snapshotBlock) : [], branches: Object.fromEntries([...block.querySelectorAll(":scope > .branch-bodies > .branch-body")].map((branch) => [branch.dataset.branch, [...branch.querySelectorAll(":scope > .placed-block")].map(snapshotBlock)])) }; }
function snapshot() { return [...assemblyList.children].filter((x) => x.classList.contains("placed-block")).map(snapshotBlock); }
function saveHistory() { history.push(snapshot()); }
function restoreBlock(entry, zone) { const saved = typeof entry === "string" ? { id: entry } : entry; const block = createBlock(saved.id); zone.querySelector(":scope > [data-empty]")?.remove(); zone.append(block); const loopBody = block.querySelector(":scope > .loop-body"); (saved.children || []).forEach((child) => restoreBlock(child, loopBody)); Object.entries(saved.branches || {}).forEach(([name, children]) => { const branch = block.querySelector(`:scope > .branch-bodies > .branch-body[data-branch="${name}"]`); children.forEach((child) => restoreBlock(child, branch)); }); }
function restore(snap) { assemblyList.replaceChildren(); snap.forEach((entry) => restoreBlock(entry, assemblyList)); refreshAssembly(); }
function resetWorkspace(withHistory = true) { if (withHistory && blocks().length) saveHistory(); assemblyList.replaceChildren(); createEmpty(assemblyList); updateAssemblySymbols(); renderPalette(); clearFeedback(); clearResults(); }
function matchesSolution(expected) { const root = directIds(assemblyList), all = blocks().map((x) => x.dataset.blockId), expectedIdsForSolution = expectedIdsFor(expected); if (all.length !== expectedIdsForSolution.length || all.some((id) => !expectedIdsForSolution.includes(id))) return false; const unordered = currentProblem.unorderedPrefix || []; const rootMatches = unordered.length ? unordered.every((id) => root.slice(0, unordered.length).includes(id)) && JSON.stringify(root.slice(unordered.length)) === JSON.stringify(expected.root.slice(unordered.length)) : JSON.stringify(root) === JSON.stringify(expected.root); if (!rootMatches) return false; const nestedMatches = Object.entries(expected.nested || {}).every(([parent, ids]) => JSON.stringify(directIds(assemblyList.querySelector(`[data-block-id="${parent}"] .loop-body`) || document.createElement("div"))) === JSON.stringify(ids)); const branchMatches = Object.entries(expected.branches || {}).every(([parent, branchMap]) => Object.entries(branchMap).every(([name, ids]) => JSON.stringify(directIds(assemblyList.querySelector(`[data-block-id="${parent}"] .branch-body[data-branch="${name}"]`) || document.createElement("div"))) === JSON.stringify(ids))); return nestedMatches && branchMatches; }
function validateAssembly() { return (currentProblem.validSolutions || [currentProblem.expected]).some(matchesSolution); }
function feedbackText() { const all = blocks().map((x) => x.dataset.blockId); return all.some((id) => !expectedIds().includes(id)) ? "この問題では使わないブロックが含まれています。問題文に必要な処理だけを選びましょう。" : "必要な処理ブロックがまだ揃っていません。問題文を見直して、残りの処理を追加しましょう。"; }
function showFeedback(text) { feedback.innerHTML = `<strong>もう一度、組み立てを確認しましょう</strong><ul><li>${escapeHtml(text)}</li></ul>`; feedback.hidden = false; hints = problemHints[currentProblem.id] || currentProblem.correct.map((block) => ({ simple: `「${block.hint}」という役割の処理が必要か考えてみましょう。`, concrete: `文章ブロック「${block.label}」を確認しましょう。` })); shownHints = 0; concreteHintVisible = false; hintArea.hidden = false; hintButton.hidden = false; hintPanel.hidden = true; }
function clearFeedback() { feedback.hidden = true; hintArea.hidden = true; hintPanel.hidden = true; hintButton.hidden = false; concreteHintVisible = false; }
function clearResults() { resultContent.hidden = true; resultPanel.hidden = true; resultDrawerTab.hidden = true; workspace.classList.remove("is-result-open"); clearCorrespondence(); }
function createFlowNode(id, label, className = "") {
  const node = document.createElement("div");
  node.className = `flow-node ${className}`.trim();
  if (id) node.dataset.flowBlock = id;
  const text = document.createElement("span");
  text.textContent = label;
  node.append(text);
  return node;
}

function appendFlowArrow(container) {
  const arrow = document.createElement("span");
  arrow.className = "flow-arrow";
  arrow.textContent = "↓";
  container.append(arrow);
}

function flowClass(block) {
  if (block.type === "input") return "input-node";
  if (block.type === "output") return "output-node";
  if (block.type === "decision") return "decision-node";
  if (block.type === "else" || block.type === "elseIf") return "else-node";
  if (block.type === "loop") return "loop-start-node";
  return "";
}

function appendFlowBlock(container, id) {
  const block = definition(id);
  const nestedIds = currentProblem.expected.nested?.[id] || [];
  const branches = currentProblem.expected.branches?.[id];
  if (branches) {
    container.append(createFlowNode(id, block.label, flowClass(block)));
    appendFlowArrow(container);
    const branchGroup = document.createElement("div");
    const branchEntries = Object.entries(branches);
    branchGroup.className = `flow-decision-branches${branchEntries.length === 1 ? " is-single" : ""}`;
    branchEntries.forEach(([name, branchIds]) => {
      const branch = document.createElement("div");
      branch.className = `flow-decision-branch flow-decision-branch-${name}`;
      const label = block.branches?.find(([branchName]) => branchName === name)?.[1] || (name === "true" ? "真（はい）" : "偽（いいえ）");
      branch.innerHTML = `<strong>${escapeHtml(label)}</strong>`;
      branchIds.forEach((branchId) => {
        appendFlowArrow(branch);
        appendFlowBlock(branch, branchId);
      });
      branchGroup.append(branch);
    });
    container.append(branchGroup);
    return;
  }
  if (!nestedIds.length) {
    container.append(createFlowNode(id, block.label, flowClass(block)));
    return;
  }

  const loop = document.createElement("div");
  loop.className = "flow-loop";
  loop.append(createFlowNode(id, block.label, "loop-start-node"));
  nestedIds.forEach((nestedId) => {
    appendFlowArrow(loop);
    const nestedBlock = definition(nestedId);
    loop.append(createFlowNode(nestedId, nestedBlock.label, flowClass(nestedBlock)));
  });
  const back = document.createElement("div");
  back.className = "loop-back";
  back.textContent = "条件を確認して繰り返す ↺";
  loop.append(back);
  loop.append(createFlowNode(id, "繰り返し終了", "loop-end-node"));
  container.append(loop);
}

function renderLearningSupport() {
  const reasons = $("#reason-list");
  reasons.replaceChildren();
  currentProblem.explanation.forEach(([title, text]) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${escapeHtml(text)}</p>`;
    reasons.append(li);
  });

  const flow = $("#flowchart");
  flow.replaceChildren();
  flow.append(createFlowNode("", "開始", "terminal"));
  currentProblem.expected.root.forEach((id) => {
    appendFlowArrow(flow);
    appendFlowBlock(flow, id);
  });
  appendFlowArrow(flow);
  flow.append(createFlowNode("", "終了", "terminal"));

  const code = $("#java-code");
  code.replaceChildren();
  currentProblem.code.forEach(([id, line, title, description], index) => {
    const button = document.createElement("button");
    button.className = "code-line";
    button.type = "button";
    button.dataset.codeBlock = id;
    button.dataset.codeTitle = title;
    button.dataset.codeDescription = description;
    button.dataset.codeLine = line;
    button.innerHTML = `<span class="line-number">${index + 1}</span><span class="code-content">${highlight(line)}</span>`;
    button.addEventListener("click", () => showCorrespondence(id, button));
    code.append(button);
  });
}
function highlight(line) { return escapeHtml(line).replace(/\b(int|double|String|if|else|for|switch|case|break)\b/g, '<span class="syntax-keyword">$1</span>').replace(/(\b\d+\b)/g, '<span class="syntax-number">$1</span>').replace(/(System|out|println)/g, '<span class="syntax-method">$1</span>'); }
function renderResult(v, mode = "learner") { const result = currentProblem.execute(v); $("#output-value").textContent = `出力結果：${result.output}`; $("#trace-caption").textContent = currentProblem.inputs.map((x) => `${x.label} = ${v[x.id]}`).join(" / "); $("#trace-head").innerHTML = `<tr>${result.traceColumns.map((x) => `<th>${escapeHtml(x)}</th>`).join("")}</tr>`; const tbody = $("#trace-body"); tbody.replaceChildren(); result.trace.forEach((row) => { const tr = document.createElement("tr"); tr.innerHTML = row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join(""); tbody.append(tr); }); $("#success-badge").textContent = mode === "instructor" ? "講師用・正解例" : mode === "completed" ? "正解済み" : "実行成功"; resultContent.hidden = false; if (mode !== "learner") { $("#success-modal").hidden = true; openResult(); return; } $("#success-kicker").textContent = "COMPLETED!"; $("#success-modal-title").textContent = "正解です！"; $("#success-modal-message").textContent = "処理の順番と配置が、正しく組み立てられています。"; $("#success-confirm-button").textContent = "結果を確認する"; $("#success-modal").hidden = false; resultDetails.open = false; }
function run() { const v = values(); clearFeedback(); if (!isValid(v)) { showFeedback("入力値の範囲や形式を確認してください。"); return; } if (isInstructorMode) { renderResult(v, "instructor"); return; } if (!validateAssembly()) { showFeedback(feedbackText()); return; } saveCompletion(v); renderResult(v); }
function openResult() { resultPanel.hidden = false; resultDrawerTab.hidden = true; workspace.classList.add("is-result-open"); resultDetails.open = true; }
function closeResult() { resultPanel.hidden = true; resultDrawerTab.hidden = false; workspace.classList.remove("is-result-open"); }
function syntaxNotes(code) {
  const notes = [];
  const add = (term, text) => notes.push(`<li><code>${escapeHtml(term)}</code>：${escapeHtml(text)}</li>`);
  if (/\bint\b/.test(code)) add("int", "整数を入れるための型です。小数や文字は入れません。");
  if (/\bdouble\b/.test(code)) add("double", "小数を含む数を入れるための型です。面積のように小数になることがある値に使います。");
  if (/\bString\b/.test(code)) add("String", "文字や文章を入れるための型です。氏名・曜日・挨拶などを保存できます。");
  if (/\/\//.test(code)) add("//", "ここから右はメモ（コメント）です。プログラムの動きには影響しません。");
  if (/\bfor\b/.test(code)) add("for (最初; 条件; 更新)", "最初は1回だけ実行、条件が成り立つ間は繰り返し、1周終わるたびに更新します。");
  if (/\bi\+\+/.test(code)) add("i++", "ループカウンタ変数 i を 1 増やす短い書き方です。");
  if (/\bif\b/.test(code) && !/else if/.test(code)) add("if", "かっこの中の条件が成り立つときだけ、波かっこの中を実行します。");
  if (/else if/.test(code)) add("else if", "それまでの条件に当てはまらなかったときに、次の条件を調べます。");
  if (/\belse\b/.test(code) && !/else if/.test(code)) add("else", "前の条件が成り立たなかった場合に実行する処理です。");
  if (/\bswitch\b/.test(code)) add("switch", "1つの値を見て、対応する case の処理を選ぶ構文です。");
  if (/\bcase\b/.test(code)) add("case 0:", "switch の値が 0 と等しいときの処理を表します。コロンの後に実行する内容を書きます。");
  if (/\bbreak\b/.test(code)) add("break", "switch の処理をここで終える指示です。次の case まで続けて実行されるのを防ぎます。");
  if (/%/.test(code)) add("%", "割り算の余りを求める記号です。例：8 % 2 の結果は 0 です。");
  if (/==/.test(code)) add("==", "左右の値が等しいかを比べる記号です。値を入れる = とは役割が違います。");
  if (/>=/.test(code)) add(">=", "左の値が右の値より大きい、または同じときに成り立ちます。");
  if (/<=/.test(code)) add("<=", "左の値が右の値より小さい、または同じときに成り立ちます。");
  if (/&&/.test(code)) add("&&", "「かつ」を表します。左右の条件がどちらも成り立つときだけ全体が成り立ちます。");
  if (/System\.out\.println/.test(code)) add("System.out.println(...) ", "かっこの中の値を画面に表示し、最後に改行する命令です。");
  if (/\*/.test(code)) add("*", "掛け算を表す記号です。");
  if (/\+/.test(code) && !/\+\+/.test(code)) add("+", /String|\"/.test(code) ? "文字列どうしをつなげる記号です。" : "足し算を表す記号です。");
  if (/\//.test(code) && !/\/\//.test(code)) add("/", "割り算を表す記号です。");
  if (/\s=\s/.test(code) && !/==/.test(code)) add("=", "右側で求めた値を、左側の変数に入れる記号です。");
  if (/\"/.test(code)) add('"..."', "ダブルクォーテーションで囲まれた部分は、そのままの文字として扱います。");
  if (/{/.test(code)) add("{", "ここから、その条件または繰り返しで実行する処理のまとまりが始まります。");
  if (/}/.test(code)) add("}", "ここで処理のまとまりが終わります。");
  if (/;/.test(code)) add(";", "Javaでは、ここで1つの命令が終わることを表します。");
  return notes.length ? `<div class="syntax-notes"><p>単語・記号の見方</p><ul>${notes.join("")}</ul></div>` : "";
}
function clearCorrespondence() { document.querySelectorAll(".is-corresponding,.is-selected").forEach((x) => x.classList.remove("is-corresponding", "is-selected")); codeCorrespondence.textContent = "コードの行をクリックしてください"; }
function showCorrespondence(id, line) { clearCorrespondence(); document.querySelectorAll(`[data-block-id="${id}"],[data-flow-block="${id}"]`).forEach((x) => x.classList.add("is-corresponding")); line.classList.add("is-selected"); codeCorrespondence.innerHTML = `<strong>${escapeHtml(line.dataset.codeTitle)}</strong><p class="code-correspondence-description">${escapeHtml(line.dataset.codeDescription)}</p>${syntaxNotes(line.dataset.codeLine)}`; const block = assemblyList.querySelector(`[data-block-id="${id}"]`); if (block) { block.scrollIntoView({ behavior: "smooth", block: "center" }); block.focus({ preventScroll: true }); } }
async function instructorLogin(event) { event.preventDefault(); const value = $("#instructor-password").value; const encoded = new TextEncoder().encode(value); const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", encoded))).map((b) => b.toString(16).padStart(2, "0")).join(""); if (hash !== passwordHash) { $("#instructor-login-error").textContent = "パスワードが違います。"; $("#instructor-login-error").hidden = false; return; } isInstructorMode = true; localStorage.setItem("algobridge-instructor-mode", "true"); $("#instructor-modal").hidden = true; updateInstructor(); }
function updateInstructor() { document.body.classList.toggle("is-instructor-mode", isInstructorMode); $("#instructor-mode-button").textContent = isInstructorMode ? "受講者モードに戻る" : "講師用"; }

addDropEvents(assemblyList); addPaletteDropEvents(); renderProblem(); updateInstructor();
problemDrawerTab.addEventListener("click", () => workspace.classList.add("is-problem-list-open")); problemDrawerClose.addEventListener("click", () => workspace.classList.remove("is-problem-list-open"));
sourceResizer.addEventListener("pointerdown", (event) => { const bounds = workspace.getBoundingClientRect(); const startX = event.clientX; const startWidth = $(".source-panel").getBoundingClientRect().width; sourceResizer.setPointerCapture(event.pointerId); document.body.classList.add("is-resizing"); const resize = (moveEvent) => { const maxWidth = Math.min(560, bounds.width - (workspace.classList.contains("is-result-open") ? 820 : 520)); const width = Math.max(280, Math.min(maxWidth, startWidth + moveEvent.clientX - startX)); workspace.style.setProperty("--source-panel-width", `${width}px`); }; const stop = () => { document.body.classList.remove("is-resizing"); sourceResizer.removeEventListener("pointermove", resize); sourceResizer.removeEventListener("pointerup", stop); sourceResizer.removeEventListener("pointercancel", stop); }; sourceResizer.addEventListener("pointermove", resize); sourceResizer.addEventListener("pointerup", stop); sourceResizer.addEventListener("pointercancel", stop); });
$("#run-button").addEventListener("click", run); $("#undo-button").addEventListener("click", () => { const snap = history.pop(); if (snap) restore(snap); });
$("#previous-problem-button").addEventListener("click", () => selectProblem(problemIndex - 1));
$("#next-problem-button").addEventListener("click", () => selectProblem(problemIndex + 1));
$("#reset-button").addEventListener("click", () => { $("#reset-modal").hidden = false; }); $("#reset-cancel-button").addEventListener("click", () => { $("#reset-modal").hidden = true; }); $("#reset-confirm-button").addEventListener("click", () => { $("#reset-modal").hidden = true; renderProblem(); });
$("#reset-completion-button").addEventListener("click", () => { $("#completion-reset-modal").hidden = false; }); $("#completion-reset-cancel-button").addEventListener("click", () => { $("#completion-reset-modal").hidden = true; }); $("#completion-reset-confirm-button").addEventListener("click", () => { completedProblems = {}; localStorage.removeItem(completionStorageKey); $("#completion-reset-modal").hidden = true; renderProblem(); });
$("#hint-button").addEventListener("click", () => { $("#hint-modal").hidden = false; }); $("#hint-cancel-button").addEventListener("click", () => { $("#hint-modal").hidden = true; }); $("#hint-confirm-button").addEventListener("click", () => { $("#hint-modal").hidden = true; shownHints = 1; concreteHintVisible = false; renderHint(); });
function renderHint() { const hint = hints[shownHints - 1]; hintPanel.hidden = false; hintButton.hidden = true; hintCount.textContent = `ヒント ${shownHints} / ${hints.length}`; hintText.textContent = hint.simple; concreteHintButton.hidden = concreteHintVisible; concreteHintText.hidden = !concreteHintVisible; concreteHintText.textContent = hint.concrete; previousHintButton.hidden = shownHints <= 1; nextHintButton.hidden = shownHints >= hints.length; } concreteHintButton.addEventListener("click", () => { concreteHintVisible = true; renderHint(); }); previousHintButton.addEventListener("click", () => { shownHints -= 1; concreteHintVisible = false; renderHint(); }); nextHintButton.addEventListener("click", () => { shownHints += 1; concreteHintVisible = false; renderHint(); });
$("#success-confirm-button").addEventListener("click", () => { $("#success-modal").hidden = true; openResult(); }); resultDetails.addEventListener("toggle", () => { if (!resultDetails.open && !resultContent.hidden && $("#success-modal").hidden) closeResult(); }); resultDrawerTab.addEventListener("click", openResult);
$("#flow-tab").addEventListener("click", () => { $("#flow-tab").classList.add("is-active"); $("#java-tab").classList.remove("is-active"); $("#flow-panel").hidden = false; $("#java-panel").hidden = true; }); $("#java-tab").addEventListener("click", () => { $("#java-tab").classList.add("is-active"); $("#flow-tab").classList.remove("is-active"); $("#java-panel").hidden = false; $("#flow-panel").hidden = true; });
$("#instructor-mode-button").addEventListener("click", () => { if (isInstructorMode) { isInstructorMode = false; localStorage.removeItem("algobridge-instructor-mode"); updateInstructor(); } else { $("#instructor-modal").hidden = false; $("#instructor-password").focus(); } }); $("#instructor-cancel-button").addEventListener("click", () => { $("#instructor-modal").hidden = true; }); $("#instructor-form").addEventListener("submit", instructorLogin);

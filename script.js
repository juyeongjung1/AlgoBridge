"use strict";

const B = (id, type, label, hint = "処理の役割を考える", acceptsChildren = false) => ({ id, type, label, hint, acceptsChildren });
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
    correct: [B("declareSetLastName", "input", "氏の入力値を受け取り、変数 lastName に設定する", "氏の入力値を受け取る"), B("declareSetFirstName", "input", "名の入力値を受け取り、変数 firstName に設定する", "名の入力値を受け取る"), B("declareSetLastKana", "input", "氏（かな）の入力値を受け取り、変数 lastKana に設定する", "氏（かな）の入力値を受け取る"), B("declareSetFirstKana", "input", "名（かな）の入力値を受け取り、変数 firstKana に設定する", "名（かな）の入力値を受け取る"), B("declareFullName", "declaration", "表示用の変数 fullName を宣言する", "完成した氏名を入れる変数を用意する"), B("combineName", "calculation", "氏・名・かな2つを結合して、変数 fullName に設定する", "文字を指定の形につなげる"), B("outputFullName", "output", "変数 fullName の値を出力する", "完成した文字列を表示する")],
    dummies: [B("combineKanaOnly", "calculation", "氏（かな）と名（かな）だけを結合する"), B("outputLastName", "output", "氏だけを出力する"), B("setFullNameFirst", "assignment", "変数 fullName に、氏の入力値だけを設定する"), B("setResultNameOnly", "assignment", "変数 result に、氏と名だけを結合して設定する"), ...commonDummies],
    execute(v) { const output = `${v.lastName}${v.firstName} (${v.lastKana} ${v.firstKana})`; return { output, traceColumns: ["処理", "fullName の値"], trace: [["結合後", output]] }; },
    explanation: [["4つの入力値を受け取る", "氏・名・氏（かな）・名（かな）は別々の入力値です。受け取った値を、それぞれ対応する変数へ設定します。"], ["fullName を宣言する", "4つの文字を結合した完成形を保存するため、出力用の fullName を別に用意します。"], ["指定の形に結合する", "氏と名をつなげ、続けて半角空白・括弧・かな2つを加えることで、指定された表示形式になります。"], ["完成した fullName を出力する", "すべてを結合し終えてから出力するため、途中の文字列ではなく完成形を表示できます。"]],
    code: [["declareSetLastName", "String lastName = \"山田\";  // 氏の入力値", "入力値を受け取る", "氏の入力値を lastName に設定します。"], ["declareSetFirstName", "String firstName = \"太郎\";  // 名の入力値", "入力値を受け取る", "名の入力値を firstName に設定します。"], ["declareSetLastKana", "String lastKana = \"やまだ\";  // 氏（かな）の入力値", "入力値を受け取る", "氏（かな）の入力値を lastKana に設定します。"], ["declareSetFirstKana", "String firstKana = \"たろう\";  // 名（かな）の入力値", "入力値を受け取る", "名（かな）の入力値を firstKana に設定します。"], ["declareFullName", "String fullName;", "出力用変数", "結合した完成形を入れるための文字列変数です。"], ["combineName", "fullName = lastName + firstName + \" (\" + lastKana + \" \" + firstKana + \")\";", "+ とは", "文字列どうしを + でつなげ、指定された表示形式を作ります。"], ["outputFullName", "System.out.println(fullName);", "System.out.println とは", "かっこの中にある完成した文字列を画面に表示します。"]]
  }),
  makeProblem({
    id: "triangle", category: "順次", title: "三角形の面積", inputNote: "底辺と高さには 0 より大きい数を入力してください。",
    description: "三角形の底辺と高さを受け取り、面積を求めて表示してください。", inputs: [I("base", "底辺", 6), I("height", "高さ", 4)],
    unorderedPrefix: ["inputBase", "inputHeight"],
    correct: [B("inputBase", "input", "底辺の入力値を受け取り、変数 base に設定する", "底辺の入力値を受け取る"), B("inputHeight", "input", "高さの入力値を受け取り、変数 height に設定する", "高さの入力値を受け取る"), B("declareArea", "declaration", "面積を格納するための変数 area を宣言する"), B("calculateArea", "calculation", "底辺 × 高さ ÷ 2 を計算して、変数 area に設定する"), B("outputArea", "output", "変数 area の値を出力する")],
    dummies: [B("calculateRectangle", "calculation", "底辺 × 高さを計算して、そのまま出力する"), B("divideBase", "calculation", "底辺 ÷ 高さを計算する"), B("setResultByAddition", "assignment", "変数 result に、底辺と高さを足した値を設定する"), ...commonDummies],
    valid: (v) => Number(v.base) > 0 && Number(v.height) > 0, execute(v) { const area = Number(v.base) * Number(v.height) / 2; return { output: area, traceColumns: ["底辺", "高さ", "area の値"], trace: [[v.base, v.height, area]] }; },
    explanation: [["底辺と高さを受け取る", "面積の計算に必要な2つの入力値を、それぞれ base と height に設定します。この2つの入力順は入れ替わっても構いません。"], ["面積を入れる変数を宣言する", "計算した面積を保存してから表示するため、area を用意します。"], ["三角形の公式を使う", "三角形の面積は「底辺 × 高さ ÷ 2」です。長方形の半分になるため、最後に 2 で割ります。"], ["area を出力する", "公式で求めた値を画面に表示します。"]],
    code: [["inputBase", "double base = 6;  // 底辺の入力値", "底辺を受け取る", "底辺の入力値を base に設定します。"], ["inputHeight", "double height = 4;  // 高さの入力値", "高さを受け取る", "高さの入力値を height に設定します。"], ["declareArea", "double area;", "double とは", "double は小数を含む数を入れられる型です。"], ["calculateArea", "area = base * height / 2;", "計算と代入", "右側で面積を計算し、結果を area に入れます。"], ["outputArea", "System.out.println(area);", "出力", "計算済みの area を表示します。"]]
  }),
  makeProblem({
    id: "evenOdd", category: "選択", title: "偶数・奇数の判定", inputNote: "整数を入力してください。", description: "整数を1つ受け取り、その値が偶数か奇数かを判定して表示してください。", inputs: [I("number", "入力値", 8)],
    correct: [B("inputNumber", "input", "整数の入力値を受け取り、変数 number に設定する", "判定する整数を受け取る"), B("checkRemainder", "decision", "変数 number を 2 で割った余りが 0 か判定する"), B("outputEvenOdd", "output", "判定結果として「偶数」または「奇数」を出力する")], dummies: [B("checkDivideTwo", "decision", "入力値を 2 で割った結果が 0 か判定する"), B("outputNumber", "output", "入力値をそのまま出力する"), B("setResultByDivision", "assignment", "変数 result に、入力値を 2 で割った結果を設定する"), ...commonDummies],
    execute(v) { const output = Number(v.number) % 2 === 0 ? "偶数" : "奇数"; return { output, traceColumns: ["入力値", "2で割った余り", "判定"], trace: [[v.number, Number(v.number) % 2, output]] }; },
    explanation: [["判定する整数を受け取る", "最初に入力値を number に設定します。判定処理では、この変数の値を使います。"], ["余りで判定する", "偶数は 2 で割り切れる数なので、2 で割った余りが 0 かを調べます。"], ["条件に応じて表示を変える", "余りが 0 なら偶数、それ以外なら奇数を出力します。"]],
    code: [["inputNumber", "int number = 8;  // 整数の入力値", "整数を受け取る", "入力された整数を number に設定します。"], ["checkRemainder", "if (number % 2 == 0) {", "if文と %", "% は割り算の余りを求めます。if は条件が成り立つときに処理を選ぶ文です。"], ["outputEvenOdd", "    System.out.println(\"偶数\");", "条件が真のとき", "条件が成り立つ場合に偶数を表示します。"], ["outputEvenOdd", "} else { System.out.println(\"奇数\"); }", "else とは", "if の条件が成り立たない場合の処理です。"]]
  }),
  makeProblem({
    id: "max", category: "選択", title: "2つの値の大きい方", inputNote: "2つの整数を入力してください。", description: "2つの整数を受け取り、大きい方の値を表示してください。", inputs: [I("a", "入力値 a", 12), I("b", "入力値 b", 7)],
    unorderedPrefix: ["inputA", "inputB"],
    correct: [B("inputA", "input", "1つ目の整数を受け取り、変数 a に設定する", "1つ目の入力値を受け取る"), B("inputB", "input", "2つ目の整数を受け取り、変数 b に設定する", "2つ目の入力値を受け取る"), B("compareValues", "decision", "変数 a が変数 b 以上か判定する"), B("outputLarger", "output", "大きい方の値を出力する")], dummies: [B("compareEqual", "decision", "変数 a と変数 b が等しいか判定する"), B("outputSmaller", "output", "小さい方の値を出力する"), B("setResultByAddition", "assignment", "変数 result に、変数 a と変数 b を足した値を設定する"), ...commonDummies],
    execute(v) { const output = Number(v.a) >= Number(v.b) ? Number(v.a) : Number(v.b); return { output, traceColumns: ["a", "b", "大きい方"], trace: [[v.a, v.b, output]] }; },
    explanation: [["2つの整数を受け取る", "比較する値を a と b に設定します。比較前に両方の値が用意できていれば、入力順は入れ替わっても構いません。"], ["2つの値を比較する", "a が b 以上かを調べれば、どちらを表示すればよいか選べます。"], ["条件に応じて値を出力する", "条件が真なら a、そうでなければ b を表示します。同じ値の場合も a を出力できるため、以上（>=）を使います。"]],
    code: [["inputA", "int a = 12;  // 1つ目の入力値", "1つ目の整数を受け取る", "入力された整数を a に設定します。"], ["inputB", "int b = 7;  // 2つ目の入力値", "2つ目の整数を受け取る", "入力された整数を b に設定します。"], ["compareValues", "if (a >= b) {", "比較演算子 >=", "左の値が右の値以上なら true になります。"], ["outputLarger", "    System.out.println(a);", "真の場合", "a が大きい、または同じときに a を表示します。"], ["outputLarger", "} else { System.out.println(b); }", "elseの場合", "a が b より小さいときに b を表示します。"]]
  }),
  makeProblem({
    id: "weekday", category: "選択", title: "曜日を表示", inputNote: "0〜6 の整数を入力してください。", description: "0 なら日曜日、1 なら月曜日、…、6 なら土曜日を表示し、それ以外は Error と表示してください。", inputs: [I("day", "曜日の番号", 1)],
    correct: [B("inputDay", "input", "曜日の番号を受け取り、変数 day に設定する", "曜日を表す番号を受け取る"), B("declareWeekday", "declaration", "曜日を格納するための変数 weekday を宣言する"), B("selectWeekday", "decision", "変数 day の値に応じて、曜日または Error を変数 weekday に設定する"), B("outputWeekday", "output", "変数 weekday の値を出力する")], dummies: [B("loopWeekday", "loop", "0 から 6 まで繰り返して曜日を表示する"), B("outputDay", "output", "入力値をそのまま出力する"), B("setResultAsDayNumber", "assignment", "変数 result に、曜日の番号をそのまま設定する"), ...commonDummies],
    execute(v) { const names = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]; const output = Number.isInteger(Number(v.day)) && Number(v.day) >= 0 && Number(v.day) <= 6 ? names[Number(v.day)] : "Error"; return { output, traceColumns: ["入力値", "weekday の値"], trace: [[v.day, output]] }; },
    explanation: [["曜日の番号を受け取る", "最初に入力された番号を day に設定します。この値を使って、どの曜日を選ぶか判断します。"], ["曜日を入れる変数を用意する", "選択した曜日の文字列を保存するために weekday を宣言します。"], ["番号ごとに処理を選ぶ", "0〜6 のどれかに応じて曜日を選びます。範囲外の値には Error を設定します。"], ["選択後に出力する", "どの分岐を通っても weekday に結果を入れてから、一度だけ表示します。"]],
    code: [["inputDay", "int day = 1;  // 曜日の番号", "曜日の番号を受け取る", "入力された番号を day に設定します。"], ["declareWeekday", "String weekday;", "String とは", "曜日のような文字を入れる型です。"], ["selectWeekday", "switch (day) {", "switch文とは", "1つの値に応じて複数の処理を選ぶ文です。"], ["selectWeekday", "    case 0: weekday = \"日曜日\"; break;", "case と break", "case は一致する値の処理、break は switch 文を終える指示です。"], ["outputWeekday", "System.out.println(weekday);", "出力", "選ばれた曜日または Error を表示します。"]]
  }),
  makeProblem({
    id: "greeting", category: "選択", title: "時間帯に応じた挨拶", inputNote: "0〜23 の整数を入力してください。", description: "時刻を受け取り、0〜11 は「おはようございます」、12〜17 は「こんにちは」、18〜23 は「こんばんは」、それ以外は案内文を表示してください。", inputs: [I("hour", "時刻", 15)],
    correct: [B("inputHour", "input", "時刻を受け取り、変数 hour に設定する", "判定する時刻を受け取る"), B("declareGreeting", "declaration", "挨拶を格納するための変数 greeting を宣言する"), B("selectGreeting", "decision", "変数 hour の範囲に応じて、変数 greeting に挨拶を設定する"), B("outputGreeting", "output", "変数 greeting の値を出力する")], dummies: [B("checkMorningOnly", "decision", "時刻が 12 より小さいかだけ判定する"), B("outputHour", "output", "時刻をそのまま出力する"), B("setResultAsHour", "assignment", "変数 result に、入力された時刻を設定する"), ...commonDummies],
    execute(v) { const h = Number(v.hour); const output = h >= 0 && h <= 11 ? "おはようございます" : h <= 17 && h >= 12 ? "こんにちは" : h <= 23 && h >= 18 ? "こんばんは" : "0〜23時で指定してください"; return { output, traceColumns: ["時刻", "greeting の値"], trace: [[v.hour, output]] }; },
    explanation: [["時刻を受け取る", "入力された時刻を hour に設定します。後の条件分岐では、この値がどの時間帯に入るかを調べます。"], ["挨拶を入れる変数を宣言する", "選んだ挨拶を1か所に保存して、最後に表示できるようにします。"], ["範囲を上から順に判定する", "時刻は複数の範囲に分かれます。小さい時間帯から順に条件を確認します。"], ["範囲外も扱う", "0〜23 以外の場合を最後に用意すると、想定外の入力にも案内を返せます。"]],
    code: [["inputHour", "int hour = 15;  // 時刻の入力値", "時刻を受け取る", "入力された時刻を hour に設定します。"], ["declareGreeting", "String greeting;", "String とは", "文字列を入れる変数の型です。"], ["selectGreeting", "if (hour >= 0 && hour <= 11) {", "&& とは", "&& は「かつ」を表し、2つの条件が両方成り立つかを調べます。"], ["selectGreeting", "} else if (hour <= 17) {", "else if とは", "前の条件に当てはまらない場合に、次の条件を調べます。"], ["outputGreeting", "System.out.println(greeting);", "出力", "決定した挨拶を表示します。"]]
  }),
  makeProblem({
    id: "leap", category: "ネストした選択", title: "うるう年の判定", inputNote: "西暦を整数で入力してください。", description: "4で割り切れる年はうるう年、ただし100で割り切れる年はうるう年ではなく、400で割り切れる年はうるう年です。このルールで判定してください。", inputs: [I("year", "西暦", 2020)],
    correct: [B("inputYear", "input", "西暦を受け取り、変数 year に設定する", "判定する西暦を受け取る"), B("declareLeap", "declaration", "判定結果を格納するための変数 leapYear を宣言する"), B("checkLeapRules", "decision", "変数 year が 4・100・400 で割り切れるかを順に判定して、変数 leapYear に結果を設定する"), B("outputLeap", "output", "変数 leapYear の値を出力する")], dummies: [B("checkFourOnly", "decision", "4 で割り切れるかだけを判定する"), B("checkHundredFirst", "decision", "100 で割り切れる年を必ずうるう年にする"), B("setResultByFour", "assignment", "変数 result に、変数 year を 4 で割った結果を設定する"), ...commonDummies],
    execute(v) { const y = Number(v.year); const leap = y % 400 === 0 || (y % 4 === 0 && y % 100 !== 0); const output = leap ? "うるう年です" : "うるう年ではありません"; return { output, traceColumns: ["西暦", "4で割り切れる", "100で割り切れる", "400で割り切れる", "判定"], trace: [[y, y % 4 === 0 ? "はい" : "いいえ", y % 100 === 0 ? "はい" : "いいえ", y % 400 === 0 ? "はい" : "いいえ", output]] }; },
    explanation: [["判定する西暦を受け取る", "入力された西暦を year に設定します。すべての割り切れ判定は、この値を使います。"], ["結果を入れる変数を宣言する", "うるう年かどうかという文字列の結果を保存するために leapYear を用意します。"], ["例外を含むルールを順に判定する", "400で割り切れる年はうるう年です。そうでなく100で割り切れる年は平年、それ以外で4で割り切れる年はうるう年になります。"], ["ネストで例外を表す", "大きなルールの中に例外の条件を置くことで、2100年のような例外も正しく判定できます。"]],
    code: [["inputYear", "int year = 2020;  // 西暦の入力値", "西暦を受け取る", "入力された西暦を year に設定します。"], ["declareLeap", "String leapYear;", "String とは", "判定結果の文章を入れる型です。"], ["checkLeapRules", "if (year % 400 == 0) {", "最初の例外", "400で割り切れる年は必ずうるう年です。"], ["checkLeapRules", "} else if (year % 100 == 0) {", "2つ目の条件", "400では割り切れず100で割り切れる年は平年です。"], ["checkLeapRules", "} else if (year % 4 == 0) {", "通常の条件", "残った年は4で割り切れるかを調べます。"], ["outputLeap", "System.out.println(leapYear);", "出力", "判定結果を表示します。"]]
  }),
  makeProblem({
    id: "sum", category: "繰り返し", title: "1から n までの合計", inputNote: "1〜100の整数を入力してください。", description: "整数 <code>n</code> が与えられたとき、1から <code>n</code> までの整数の合計を求めて出力してください。", inputs: [I("n", "入力値 n", 3, "number", { min: 1, max: 100 })],
    correct: [B("inputN", "input", "整数の入力値を受け取り、変数 n に設定する", "合計する範囲の終点を受け取る"), B("declareSum", "declaration", "合計を格納するための変数 sum を宣言する"), B("initializeSum", "assignment", "変数 sum に、初期値として 0 を設定する"), B("loop", "loop", "ループカウンタ変数 i を 1 から n まで、1 ずつ増やしながら繰り返す", "開始・終了・増分を考える", true), B("addCurrent", "calculation", "変数 sum に、ループカウンタ変数 i の値を加える"), B("outputSum", "output", "変数 sum の値を出力する")],
    dummies: [B("initializeSumOne", "assignment", "変数 sum に、初期値として 1 を設定する"), B("loopFromZero", "loop", "ループカウンタ変数 i を 0 から n まで、1 ずつ増やしながら繰り返す", "開始値を考える", true), B("outputCurrent", "output", "ループカウンタ変数 i を、その都度出力する"), B("addToN", "calculation", "変数 n に、ループカウンタ変数 i の値を加える"), B("setResultAsInput", "assignment", "変数 result に、入力値 n を設定する"), ...commonDummies], expected: { root: ["inputN", "declareSum", "initializeSum", "loop", "outputSum"], nested: { loop: ["addCurrent"] } },
    valid: (v) => Number.isInteger(Number(v.n)) && Number(v.n) >= 1 && Number(v.n) <= 100,
    execute(v) { let sum = 0; const trace = [["初期状態", "-", sum]]; for (let i = 1; i <= Number(v.n); i += 1) { sum += i; trace.push([`${i}回目`, i, sum]); } return { output: sum, traceColumns: ["繰り返し回数", "ループカウンタ変数 i", "sum の値"], trace }; },
    explanation: [["n の入力値を受け取る理由", "どこまで足し算を繰り返すかを決めるため、最初に入力値を n に設定します。"], ["sum を最初に宣言する理由", "合計を入れる箱を、使う前に用意します。"], ["初期値を 0 にする理由", "まだ何も足していない合計は0であり、0は足しても計算を変えません。"], ["i を 1 から始める理由", "問題が1からnまでを扱うため、ループカウンタ変数 i も1から始めます。"], ["sum に i を加える理由", "繰り返すたびに現在の i を足すことで、sum が途中までの合計になります。"], ["最後に出力する理由", "すべて加え終えた完成した合計を表示します。"]],
    code: [["inputN", "int n = 3;  // 入力値", "n を受け取る", "入力された整数を n に設定します。"], ["declareSum", "int sum;", "int とは", "int は整数を入れるための型です。"], ["initializeSum", "sum = 0;", "=（代入）とは", "右側の値を左側の変数に入れます。"], ["loop", "for (int i = 1; i <= n; i++) {", "for文とは", "初期化・継続条件・増分をまとめて書く繰り返しです。"], ["addCurrent", "    sum = sum + i;", "加算して代入", "sum と i を足した新しい値を、sum に入れ直します。"], ["loop", "}", "波かっこ", "繰り返す処理の終わりを表します。"], ["outputSum", "System.out.println(sum);", "出力", "完成した sum を表示します。"]]
  })
];

problems.sort((left, right) => ["name", "triangle", "evenOdd", "max", "weekday", "greeting", "sum", "leap"].indexOf(left.id) - ["name", "triangle", "evenOdd", "max", "weekday", "greeting", "sum", "leap"].indexOf(right.id));

const $ = (s) => document.querySelector(s);
const palette = $("#block-palette"), assemblyList = $("#assembly-list"), problemInputs = $("#problem-inputs"), expectedOutputValue = $("#expected-output-value"), feedback = $("#feedback"), hintArea = $("#hint-area"), hintButton = $("#hint-button"), hintPanel = $("#hint-panel"), hintCount = $("#hint-count"), hintText = $("#hint-text"), previousHintButton = $("#previous-hint-button"), nextHintButton = $("#next-hint-button"), resultPanel = $(".result-panel"), resultContent = $("#result-content"), resultDetails = $("#result-details"), resultDrawerTab = $("#result-drawer-tab"), problemDrawerTab = $("#problem-drawer-tab"), problemDrawerClose = $("#problem-drawer-close"), workspace = $(".workspace"), buildPanel = $(".build-panel"), codeCorrespondence = $("#code-correspondence");
let problemIndex = 0, currentProblem = problems[0], dragged = null, history = [], hints = [], shownHints = 0, isInstructorMode = localStorage.getItem("algobridge-instructor-mode") === "true";
const passwordHash = "02006319c292b2880b56de90a7e8a1751713baae6cf9762a1ac8b216a50192e7";
const sourceResizer = $("#source-resizer");

function escapeHtml(text) { return String(text).replace(/[&<>\"]/g, (x) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[x])); }
function formatLabel(text) { return escapeHtml(text).replace(/(sum|area|fullName|weekday|greeting|leapYear|lastName|firstName|lastKana|firstKana|base|height|number|year|hour|day|[abni])/g, '<span class="token-variable">$1</span>').replace(/(\b\d+\b)/g, '<span class="token-value">$1</span>').replace(/(受け取る|宣言する|設定する|出力する|結合する|加える|判定する|繰り返す)/g, '<span class="token-verb">$1</span>'); }
function blocks() { return [...assemblyList.querySelectorAll(".placed-block")]; }
function directIds(zone) { return [...zone.querySelectorAll(":scope > .placed-block")].map((x) => x.dataset.blockId); }
function definition(id) { return [...currentProblem.correct, ...currentProblem.dummies].find((b) => b.id === id); }
function expectedIds() { return [...currentProblem.expected.root, ...Object.values(currentProblem.expected.nested || {}).flat()]; }
function values() { return Object.fromEntries(currentProblem.inputs.map((input) => [input.id, $("#input-" + input.id).value])); }
function problemNumber(index) { return ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"][index] || String(index + 1); }
function selectProblem(index) { if (index < 0 || index >= problems.length || index === problemIndex) return; workspace.classList.remove("is-problem-list-open"); problemIndex = index; currentProblem = problems[problemIndex]; history = []; renderProblem(); }

function renderProblem() {
  $("#lesson-position").textContent = `問題 ${problemIndex + 1} / ${problems.length}`;
  $("#problem-heading").textContent = `問題 ${problemNumber(problemIndex)}：${currentProblem.title}`; $("#problem-description").innerHTML = currentProblem.description; $("#problem-category").textContent = currentProblem.category;
  $("#input-note").textContent = currentProblem.inputNote; $("#assembly-input-symbol").textContent = `入力：${currentProblem.inputs.map((x) => x.label).join("、")}`;
  problemInputs.replaceChildren();
  currentProblem.inputs.forEach((input) => { const label = document.createElement("label"); label.className = "number-input"; label.innerHTML = `<span>${escapeHtml(input.label)}</span><input id="input-${input.id}" type="${input.type}" value="${escapeHtml(input.value)}" ${input.min !== undefined ? `min="${input.min}"` : ""} ${input.max !== undefined ? `max="${input.max}"` : ""}>`; problemInputs.append(label); });
  problemInputs.querySelectorAll("input").forEach((input) => input.addEventListener("input", updateExpectedOutput));
  $("#previous-problem-button").disabled = problemIndex === 0; $("#next-problem-button").disabled = problemIndex === problems.length - 1;
  $("#block-count").textContent = `全${currentProblem.correct.length + currentProblem.dummies.length}個（正解は${currentProblem.correct.length}個）`;
  $("#problem-list-summary").textContent = `全${problems.length}問`;
  const list = $("#problem-list-items"); list.replaceChildren();
  problems.forEach((problem, index) => { const button = document.createElement("button"); button.type = "button"; button.className = "problem-list-item"; button.classList.toggle("is-current", index === problemIndex); button.innerHTML = `<span class="problem-list-number">${problemNumber(index)}</span><span><strong>問題 ${problemNumber(index)}</strong><small>${escapeHtml(problem.title)} <em>${escapeHtml(problem.category)}</em></small></span>`; button.addEventListener("click", () => selectProblem(index)); list.append(button); });
  resetWorkspace(false); renderLearningSupport(); updateExpectedOutput();
}

function updateExpectedOutput() { const v = values(); expectedOutputValue.textContent = isValid(v) ? currentProblem.execute(v).output : "-"; }
function isValid(v) { return currentProblem.valid ? currentProblem.valid(v) : Object.values(v).every((x) => String(x).trim() !== ""); }
function shuffle(list) { return [...list].sort(() => Math.random() - .5); }
function renderPalette() { palette.replaceChildren(); const grouped = Object.values([...currentProblem.correct, ...currentProblem.dummies].reduce((groups, block) => { (groups[block.type] ||= []).push(block); return groups; }, {})); shuffle(grouped).forEach((group) => shuffle(group).forEach((block) => { const button = document.createElement("button"); button.type = "button"; button.className = `source-block block-${block.type}`; button.draggable = true; button.dataset.blockId = block.id; button.innerHTML = `<span class="block-handle">⠿</span><span class="block-copy"><strong>${formatLabel(block.label)}</strong><small>${escapeHtml(block.hint)}</small></span>`; button.addEventListener("dragstart", () => { dragged = { id: block.id, source: "palette" }; }); button.addEventListener("click", () => addBlock(block.id, assemblyList)); palette.append(button); })); updatePalette(); }
function createEmpty(zone, nested = false) { const empty = document.createElement("div"); empty.className = nested ? "nested-empty" : "empty-state"; empty.dataset.empty = "true"; empty.innerHTML = nested ? "ここに繰り返しの中の処理を配置" : '<span class="empty-icon">＋</span><strong>ここに処理を配置</strong><p>左側の一覧からドラッグ＆ドロップ</p>'; zone.append(empty); }
function createDropSpace(zone, nested = false) { const space = document.createElement("div"); space.className = "drop-space"; space.dataset.dropSpace = "true"; space.textContent = nested ? "次の繰り返し処理をここに配置" : "次の処理をここに配置"; zone.append(space); return space; }
function updateZoneDropSpace(zone) { const nested = zone !== assemblyList; const hasBlocks = directIds(zone).length > 0; const empty = zone.querySelector(":scope > [data-empty]"); let space = zone.querySelector(":scope > .drop-space"); if (!hasBlocks) { space?.remove(); if (!empty) createEmpty(zone, nested); return; } empty?.remove(); if (!space) space = createDropSpace(zone, nested); zone.append(space); }
function createBlock(id) { const block = definition(id), item = document.createElement("article"); item.className = `placed-block block-${block.type}`; item.draggable = true; item.dataset.blockId = id; item.innerHTML = `<div class="placed-copy"><strong>${formatLabel(block.label)}</strong><span>${escapeHtml(block.hint)}</span><button class="remove-block" type="button" aria-label="削除">×</button></div>`; item.querySelector(".remove-block").addEventListener("click", () => { saveHistory(); item.remove(); refreshAssembly(); }); item.addEventListener("dragstart", () => { dragged = { id, source: "placed", item }; }); if (block.acceptsChildren) { const body = document.createElement("div"); body.className = "loop-body dropzone"; body.dataset.zone = id; body.innerHTML = '<span class="loop-body-label">繰り返しの中で実行する処理</span>'; createEmpty(body, true); addDropEvents(body); item.append(body); const end = document.createElement("div"); end.className = "loop-end-symbol"; end.innerHTML = "<span>繰り返し終了</span>"; item.append(end); } return item; }
function addBlock(id, zone) { if (blocks().some((x) => x.dataset.blockId === id)) return; saveHistory(); zone.querySelector(":scope > [data-empty]")?.remove(); zone.insertBefore(createBlock(id), zone.querySelector(":scope > .drop-space")); refreshAssembly(); }
function addDropEvents(zone) { zone.addEventListener("dragover", (event) => { event.preventDefault(); zone.classList.add("is-drag-over"); }); zone.addEventListener("dragleave", () => zone.classList.remove("is-drag-over")); zone.addEventListener("drop", (event) => { event.preventDefault(); zone.classList.remove("is-drag-over"); if (!dragged) return; const id = dragged.id; const target = event.target.closest(".placed-block"); const targetInZone = target?.parentElement === zone ? target : null; const item = dragged.source === "placed" ? dragged.item : createBlock(id); if (dragged.source === "placed") { saveHistory(); dragged.item.remove(); } if (dragged.source === "palette" && blocks().some((block) => block.dataset.blockId === id)) return; zone.querySelector(":scope > [data-empty]")?.remove(); if (targetInZone && targetInZone !== item) { const midpoint = targetInZone.getBoundingClientRect().top + targetInZone.getBoundingClientRect().height / 2; zone.insertBefore(item, event.clientY < midpoint ? targetInZone : targetInZone.nextSibling); } else { zone.insertBefore(item, zone.querySelector(":scope > .drop-space")); } dragged = null; refreshAssembly(); }); }
function addPaletteDropEvents() { palette.addEventListener("dragover", (event) => { if (dragged?.source !== "placed") return; event.preventDefault(); palette.classList.add("is-remove-target"); }); palette.addEventListener("dragleave", (event) => { if (!palette.contains(event.relatedTarget)) palette.classList.remove("is-remove-target"); }); palette.addEventListener("drop", (event) => { event.preventDefault(); palette.classList.remove("is-remove-target"); if (dragged?.source !== "placed") return; saveHistory(); dragged.item.remove(); dragged = null; refreshAssembly(); }); }
function updateAssemblySymbols() { const hasInputBlock = currentProblem.hideAssemblyInputSymbol || blocks().some((block) => definition(block.dataset.blockId)?.type === "input"); [$("#assembly-input-symbol"), $("#assembly-after-input-arrow")].forEach((element) => { element.hidden = hasInputBlock; }); $("#assembly-input-arrow").hidden = false; }
function refreshAssembly() { [assemblyList, ...assemblyList.querySelectorAll(".loop-body")].forEach(updateZoneDropSpace); updateAssemblySymbols(); updatePalette(); clearFeedback(); clearResults(); }
function updatePalette() { palette.querySelectorAll(".source-block").forEach((button) => { const used = blocks().some((x) => x.dataset.blockId === button.dataset.blockId); button.disabled = used; button.draggable = !used; button.classList.toggle("is-used", used); }); const undoButton = $("#undo-button"); undoButton.disabled = !history.length; undoButton.title = history.length ? "直前の配置に戻す" : "戻せる配置はありません"; }
function snapshot() { return [...assemblyList.children].filter((x) => x.classList.contains("placed-block")).map((x) => ({ id: x.dataset.blockId, children: x.querySelector(".loop-body") ? directIds(x.querySelector(".loop-body")) : [] })); }
function saveHistory() { history.push(snapshot()); }
function restore(snap) { assemblyList.replaceChildren(); snap.forEach((entry) => { const block = createBlock(entry.id); assemblyList.append(block); const zone = block.querySelector(".loop-body"); entry.children.forEach((id) => { zone.querySelector(":scope > [data-empty]")?.remove(); zone.append(createBlock(id)); }); }); refreshAssembly(); }
function resetWorkspace(withHistory = true) { if (withHistory && blocks().length) saveHistory(); assemblyList.replaceChildren(); createEmpty(assemblyList); updateAssemblySymbols(); renderPalette(); clearFeedback(); clearResults(); }
function validateAssembly() { const root = directIds(assemblyList), all = blocks().map((x) => x.dataset.blockId), expected = expectedIds(); if (all.some((id) => !expected.includes(id))) return false; if (expected.some((id) => !all.includes(id))) return false; const unordered = currentProblem.unorderedPrefix || []; const rootMatches = unordered.length ? unordered.every((id) => root.slice(0, unordered.length).includes(id)) && JSON.stringify(root.slice(unordered.length)) === JSON.stringify(currentProblem.expected.root.slice(unordered.length)) : JSON.stringify(root) === JSON.stringify(currentProblem.expected.root); if (!rootMatches) return false; return Object.entries(currentProblem.expected.nested || {}).every(([parent, ids]) => JSON.stringify(directIds(assemblyList.querySelector(`[data-block-id="${parent}"] .loop-body`) || document.createElement("div"))) === JSON.stringify(ids)); }
function feedbackText() { const all = blocks().map((x) => x.dataset.blockId); return all.some((id) => !expectedIds().includes(id)) ? "この問題では使わないブロックが含まれています。問題文に必要な処理だけを選びましょう。" : "必要な処理ブロックがまだ揃っていません。問題文を見直して、残りの処理を追加しましょう。"; }
function showFeedback(text) { feedback.innerHTML = `<strong>もう一度、組み立てを確認しましょう</strong><ul><li>${escapeHtml(text)}</li></ul>`; feedback.hidden = false; hints = currentProblem.correct.flatMap((b) => [`「${b.hint}」という役割の処理が必要か考えてみましょう。`, `文章ブロック「${b.label}」を確認しましょう。`]); shownHints = 0; hintArea.hidden = false; hintButton.hidden = false; hintPanel.hidden = true; }
function clearFeedback() { feedback.hidden = true; hintArea.hidden = true; hintPanel.hidden = true; hintButton.hidden = false; }
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
  if (block.type === "loop") return "loop-start-node";
  return "";
}

function appendFlowBlock(container, id) {
  const block = definition(id);
  const nestedIds = currentProblem.expected.nested?.[id] || [];
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
function renderResult(v, preview = false) { const result = currentProblem.execute(v); $("#output-value").textContent = `出力結果：${result.output}`; $("#trace-caption").textContent = currentProblem.inputs.map((x) => `${x.label} = ${v[x.id]}`).join(" / "); $("#trace-head").innerHTML = `<tr>${result.traceColumns.map((x) => `<th>${escapeHtml(x)}</th>`).join("")}</tr>`; const tbody = $("#trace-body"); tbody.replaceChildren(); result.trace.forEach((row) => { const tr = document.createElement("tr"); tr.innerHTML = row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join(""); tbody.append(tr); }); $("#success-badge").textContent = preview ? "講師用・正解例" : "実行成功"; resultContent.hidden = false; if (preview) { $("#success-modal").hidden = true; openResult(); return; } $("#success-kicker").textContent = "COMPLETED!"; $("#success-modal-title").textContent = "正解です！"; $("#success-modal-message").textContent = "処理の順番と配置が、正しく組み立てられています。"; $("#success-confirm-button").textContent = "結果を確認する"; $("#success-modal").hidden = false; resultDetails.open = false; }
function run() { const v = values(); clearFeedback(); if (!isValid(v)) { showFeedback("入力値の範囲や形式を確認してください。"); return; } if (isInstructorMode) { renderResult(v, true); return; } if (!validateAssembly()) { showFeedback(feedbackText()); return; } renderResult(v); }
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
$("#hint-button").addEventListener("click", () => { $("#hint-modal").hidden = false; }); $("#hint-cancel-button").addEventListener("click", () => { $("#hint-modal").hidden = true; }); $("#hint-confirm-button").addEventListener("click", () => { $("#hint-modal").hidden = true; shownHints = 1; renderHint(); });
function renderHint() { hintPanel.hidden = false; hintButton.hidden = true; hintCount.textContent = `ヒント ${shownHints} / ${hints.length}`; hintText.textContent = hints[shownHints - 1]; previousHintButton.hidden = shownHints <= 1; nextHintButton.hidden = shownHints >= hints.length; } previousHintButton.addEventListener("click", () => { shownHints -= 1; renderHint(); }); nextHintButton.addEventListener("click", () => { shownHints += 1; renderHint(); });
$("#success-confirm-button").addEventListener("click", () => { $("#success-modal").hidden = true; openResult(); }); resultDetails.addEventListener("toggle", () => { if (!resultDetails.open && !resultContent.hidden && $("#success-modal").hidden) closeResult(); }); resultDrawerTab.addEventListener("click", openResult);
$("#flow-tab").addEventListener("click", () => { $("#flow-tab").classList.add("is-active"); $("#java-tab").classList.remove("is-active"); $("#flow-panel").hidden = false; $("#java-panel").hidden = true; }); $("#java-tab").addEventListener("click", () => { $("#java-tab").classList.add("is-active"); $("#flow-tab").classList.remove("is-active"); $("#java-panel").hidden = false; $("#flow-panel").hidden = true; });
$("#instructor-mode-button").addEventListener("click", () => { if (isInstructorMode) { isInstructorMode = false; localStorage.removeItem("algobridge-instructor-mode"); updateInstructor(); } else { $("#instructor-modal").hidden = false; $("#instructor-password").focus(); } }); $("#instructor-cancel-button").addEventListener("click", () => { $("#instructor-modal").hidden = true; }); $("#instructor-form").addEventListener("submit", instructorLogin);

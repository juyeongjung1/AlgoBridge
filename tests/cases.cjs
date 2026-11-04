const variations = {
  name: [{lastName:'佐藤', firstName:'花子', lastKana:'さとう', firstKana:'はなこ'}],
  triangle: [{base:'3',height:'1'},{base:'2.5',height:'4.5'}],
  bmi: [{heightCm:'180',weightKg:'75'},{heightCm:'100',weightKg:'50'}],
  billing: [{basePremium:'0',discount:'0'},{basePremium:'100',discount:'100'}],
  policyFormat: [{customerName:'佐藤花子',policyNumber:'P-9999'}],
  evenOdd: [-3,-2,-1,0,1,2].map(number=>({number})),
  max: [{a:-3,b:-2},{a:7,b:7},{a:5,b:9}],
  eligibility: [0,17,18,19].map(age=>({age})),
  contractStatus: ['無効','満了','停止',' 有効 '].map(contractStatus=>({contractStatus})),
  greeting: [-1,0,11,12,17,18,23,24].map(hour=>({hour})),
  weekday: [-1,0,1,2,3,4,5,6,7].map(day=>({day})),
  accidentCategory: ['A','C','Z','a','constructor','__proto__','toString'].map(accidentCode=>({accidentCode})),
  sum: [1,2,10,100].map(n=>({n})),
  evenSum: [1,2,3,99,100].map(n=>({n})),
  fizzBuzz: [1,3,5,14,15,16,30].map(n=>({n})),
  annualPremium: [{monthlyPremium:0,months:1},{monthlyPremium:100,months:1},{monthlyPremium:100,months:12}],
  leap: [1900,2000,2020,2021,2100,2400].map(year=>({year})),
  arraySum: ['0','5','3,1,3','-1,-2','2000000000,2000000000'].map(premiums=>({premiums})),
  arrayAverage: ['0','5','1,2','1,2,2'].map(premiums=>({premiums})),
  premiumMax: ['0','5','3,1,3','-5,-3,-8'].map(premiums=>({premiums})),
  thresholdCount: [{premiums:'100,99,101',threshold:100},{premiums:'1,2',threshold:3},{premiums:'1,2',threshold:0}],
  policySearch: [{policyNumbers:'P-1,P-2',target:'P-1'},{policyNumbers:'P-1,P-2',target:'P-2'},{policyNumbers:'P-1,P-2',target:'P-3'},{policyNumbers:'P-1,P-10',target:'P-1'},{policyNumbers:'P-10',target:'P-1'}],
  firstEligible: ['17,18,19','20,25','16,17','18','-1,18'].map(ages=>({ages})),
  paymentStatusCount: ['支払済','未払','未払,未払','未払,支払済,未払'].map(statuses=>({statuses})),
  premiumStats: [{premiums:'100,99,101',threshold:100},{premiums:'1,2',threshold:3},{premiums:'1,2',threshold:0}],
  swapPremium: [{first:1,second:2},{first:0,second:0},{first:-3,second:4}],
  bubblePass: ['2,1','4,3,2,1','1,2,3,4','2,2,1','-1,-5,0'].map(premiums=>({premiums})),
  bubbleSort: ['2,1','4,3,2,1','1,2,3,4','2,2,1','-1,-5,0'].map(premiums=>({premiums})),
  claimReception: ['有効','無効'].flatMap(contractStatus=>['事故','病気'].flatMap(accidentType=>[17,18].map(age=>({contractStatus,accidentType,age})))),
  coverageDecision: [11,12,13].flatMap(paidMonths=>[2,3,4].map(policyYears=>({paidMonths,policyYears})))
};
const list = value => String(value).split(/[、,\s]+/).filter(Boolean);
const numbers = value => list(value).map(Number);
function reference(id, v) {
  switch(id) {
    case 'name': return `${v.lastName}${v.firstName} (${v.lastKana} ${v.firstKana})`;
    case 'triangle': return v.base * v.height / 2;
    case 'bmi': return (Math.round((v.weightKg / ((v.heightCm / 100) ** 2)) * 10) / 10).toFixed(1);
    case 'billing': return v.basePremium - v.discount;
    case 'policyFormat': return `${v.customerName}（証券番号：${v.policyNumber}）`;
    case 'evenOdd': return Number(v.number) % 2 === 0 ? '偶数' : '奇数';
    case 'max': return Math.max(Number(v.a), Number(v.b));
    case 'eligibility': return Number(v.age) >= 18 ? '申込可能' : '申込対象外';
    case 'contractStatus': return v.contractStatus === '有効' ? '受付可能' : '契約状態を確認してください';
    case 'greeting': return Number(v.hour) < 0 || Number(v.hour) > 23 ? '0〜23時で指定してください' : Number(v.hour) < 12 ? 'おはようございます' : Number(v.hour) < 18 ? 'こんにちは' : 'こんばんは';
    case 'weekday': return ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'][Number(v.day)] || 'Error';
    case 'accidentCategory': return new Map([['A','自動車事故受付'],['B','火災事故受付'],['C','傷害事故受付']]).get(v.accidentCode) || '区分を確認してください';
    case 'sum': return Number(v.n) * (Number(v.n) + 1) / 2;
    case 'evenSum': return Math.floor(Number(v.n) / 2) * (Math.floor(Number(v.n) / 2) + 1);
    case 'fizzBuzz': return Array.from({length:Number(v.n)},(_,i)=> ((i+1)%3===0?'Fizz':'')+((i+1)%5===0?'Buzz':'') || i+1).join('\n');
    case 'annualPremium': return Number(v.monthlyPremium) * Number(v.months);
    case 'leap': { const y = Number(v.year); return (y % 100 === 0 ? y % 400 === 0 : y % 4 === 0) ? 'うるう年です' : 'うるう年ではありません'; }
    case 'arraySum': return numbers(v.premiums).reduce((a,b)=>a+b,0);
    case 'arrayAverage': return (Math.round(numbers(v.premiums).reduce((a,b)=>a+b,0)/numbers(v.premiums).length * 10) / 10).toFixed(1);
    case 'premiumMax': return Math.max(...numbers(v.premiums));
    case 'thresholdCount': return numbers(v.premiums).filter(n=>n>=Number(v.threshold)).length;
    case 'policySearch': return list(v.policyNumbers).some(n=>n===v.target) ? '見つかりました' : '見つかりません';
    case 'firstEligible': return numbers(v.ages).find(n=>n>=18) ?? '該当なし';
    case 'paymentStatusCount': return list(v.statuses).filter(x=>x==='未払').length;
    case 'premiumStats': { const found = numbers(v.premiums).filter(n=>n>=Number(v.threshold)); return `件数：${found.length} / 合計：${found.reduce((a,b)=>a+b,0)}`; }
    case 'swapPremium': return `${v.second}, ${v.first}`;
    case 'bubblePass': { const a = numbers(v.premiums); let maximum = a[0]; const b = []; for(const n of a.slice(1)){b.push(Math.min(maximum,n));maximum=Math.max(maximum,n);} b.push(maximum); return '[' + b.join(', ') + ']'; }
    case 'bubbleSort': return '[' + numbers(v.premiums).sort((a,b)=>a-b).join(', ') + ']';
    case 'claimReception': return v.contractStatus !== '有効' ? '契約状態を確認してください' : v.accidentType !== '事故' ? '事故区分を確認してください' : Number(v.age) >= 18 ? '事故受付可能' : '年齢条件を確認してください';
    case 'coverageDecision': return Number(v.paidMonths) < 12 ? '連続支払済月数が条件に達していません' : Number(v.policyYears) >= 3 ? '長期継続割引' : '契約年数が条件に達していません';
    default: throw Error(id);
  }
}

// 追加した境界値。範囲外の値は受理せず、Javaに渡さない。
variations.bmi.push({heightCm: '100', weightKg: '12.25'}, {heightCm: '1', weightKg: '10000'});
for (const id of ['arraySum','arrayAverage','premiumMax','bubblePass','bubbleSort']) variations[id].push({premiums:'1'}, {premiums:Array(20).fill(1000000).join(',')});
variations.name.push({lastName:'山田"\\\\', firstName:'太郎', lastKana:'やまだ', firstKana:'たろう'});
module.exports = { variations, reference };


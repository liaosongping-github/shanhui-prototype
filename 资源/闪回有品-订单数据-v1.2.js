(()=>{const states={all:'全部',pay:'待付款',ship:'待发货',receive:'待收货',done:'已完成',closed:'已关闭',timeout:'已超时'},rows=[];
function add(state,date,model,spec,price,extra={}){rows.push({state,date,model,spec,price,channel:'实时竞拍',tags:['哈哈哈'],report:true,purchase:true,...extra});}
add('ship','2026-11-16','小米13 Pro (5G)','8G+128G',500);add('ship','2026-11-14','华为 Mate70 Air','12G+256G',999);add('ship','2026-11-14','荣耀 Magic5 (5G)','8G+256G',888);add('ship','2026-11-14','小米13 Pro (5G)','8G+128G',800);
add('pay','2026-03-19','华为 Pocket S (4G)','8G+128G','2.40',{tags:[],frozen:'0.6'});add('pay','2026-03-19','华为 Pocket S (4G)','8G+128G','2.40',{tags:[],frozen:'0.6'});
['JDVC1046165101','JDVC1046165100','JDVC1046165099'].forEach((logistics,i)=>add('receive','2026-11-06','iPhone 13',i===2?'128G':'',2871,{grade:i===2?'':'A3+',logistics,tags:['测试使用标签Ａ','FOG可售后']}));
add('done','2026-11-12','iPhone 16','',600,{strict:true,grade:'E1',tags:['测试使用标签Ａ','FOG可售后'],report:false,purchase:false});for(let i=0;i<2;i++)add('done','2026-11-11','荣耀 Play3','全网通 | 6G+128G | 极光蓝 | 过保（保修期≤1个月）| 国行',600,{channel:'一口价',grade:'99新',tags:['官方自检'],report:false,purchase:false});
add('closed','2026-11-14','小米11','8G+128G',2000);add('closed','2026-11-12','iPhone 13','128G',800,{tags:['哈哈哈','测试使用标签Ａ','FOG可售后']});add('closed','2026-11-05','华为 Mate70 RS 非凡大师 先锋版','16G+1T',3000,{tags:[]});add('closed','2026-10-14','iPhone 12','',3100,{grade:'A2',tags:['测试使用标签Ａ','FOG可售后'],ai:true});
add('timeout','2025-06-04','华为 Nova10 青春版（4G）','8G+128G',4);[['vivo X Fold (5G)','12G+256G | 梧桐灰',666],['vivo X90 Pro (5G)','8G+256G | 原黑',580],['小米10s','8G+128G | 蓝色',600]].forEach(([m,s,p])=>add('timeout','2025-04-01',m,'全网通 | '+s+' | 国行',p,{channel:'暗拍',grade:'B2',tags:['官方自检'],report:false,purchase:false}));
// Screenshot variants; extra rows are explicitly local demonstration copies.
add('ship','2026-10-15','小米11','',3200,{strict:true,grade:'A3+',tags:['哈哈哈'],report:false,purchase:false});
add('ship','2026-03-27','OPPO Find X5 Pro (5G)','12G+256G',3500,{tags:['测试使用标签Ａ']});
for(const state of ['pay','ship','receive','done','closed','timeout']){const originals=rows.filter(r=>r.state===state);let i=0;while(rows.filter(r=>r.state===state).length<7){const source=originals[i%originals.length];rows.push({...source,tags:[...source.tags],demoExtra:true});i++;}}
const quoteIcon='<svg class="manual-quote-icon" viewBox="0 0 26 32" aria-hidden="true"><path d="M7 13V8a6 6 0 0 1 12 0v5" fill="none" stroke="#ffc327" stroke-width="2.1" stroke-linecap="round"/><path d="M10 18V8a2 2 0 0 1 4 0v10l2-1 2 1h3a2 2 0 0 1 2 2v9H11l-6-8a2 2 0 0 1 3-3l2 2z" fill="#fff" stroke="#ff632e" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
rows.forEach((r,i)=>r.id='demo-'+(i+1));window.youpinOrderRows=rows;
})();
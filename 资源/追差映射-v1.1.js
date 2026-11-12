(() => {
  const xiaomi=window.prototypeContext.page.id==='xiaomi-claim-mapping';
  mountPrototypeHeader(document.querySelector('.boss-top'));
  const vendor=xiaomi?'小米零售通':'VIVO追责';
  const headers=xiaomi?['厂商','选项ID','选项名称','类型','追差金额上限（%）','更新人','更新时间']:['厂商','三方大类项名称','三方大类项编码','三方小类项名称','三方小类项编码','闪回收大类项名称','闪回收大类项ID','闪回收小类项名称','闪回收小类项ID','创建人','创建时间','更新人','更新时间'];
  const samples=[['3320','触屏失灵','比例','25%'],['3260','完全不显示/全花屏','比例','100%'],['4420','有网络锁','佣金',''],['1100','存储容量','比例','12%'],['3240','显示不正常/漏液/断线','比例','30%'],['3150','屏幕破损','比例','15%'],['1520','不能正常开机/反复重启','佣金',''],['1215200','不能正常开机/重启','佣金',''],['1132350','断线/漏液/花屏','比例','30%'],['2128','外壳明显碎裂','比例','15%']];
  const dates=['2025-08-04 16:24:32','2025-08-04 16:24:34','2025-08-01 10:41:55','2025-08-01 10:41:55','2025-08-04 16:24:32','2025-08-04 16:24:34','2025-12-09 16:19:53','2025-08-04 16:24:26','2025-08-04 16:24:32','2025-08-04 16:24:33'];
  const records=xiaomi?samples.map((v,i)=>[vendor,...v,'演示用户',dates[i]]):Array.from({length:10},(_,i)=>[vendor,'基础信息','100',i===9?'内存':'型号',i===9?'102':'101','','','',i===9?'1109':String(11+i),'演示用户','2025-05-06 17:…','演示用户','2025-05-06 17:…']);
  const select=document.getElementById('vendor');select.append(new Option(vendor,vendor));if(!xiaomi)select.value=vendor;
  document.getElementById('code-label').firstChild.textContent=xiaomi?'选项ID ':'三方大类项编码 ';
  const head=document.getElementById('mapping-head'),rows=document.getElementById('rows');
  const tr=document.createElement('tr'),th=document.createElement('th'),all=document.createElement('input');all.type='checkbox';all.className='mapping-check';all.setAttribute('aria-label','全选当前页');th.append(all);tr.append(th);
  for(const label of headers){const cell=document.createElement('th');cell.scope='col';cell.textContent=label;tr.append(cell);}head.append(tr);
  let page=1,pageSize=10,filtered=records,searching=false;
  const selection=new Set(),bulk=document.getElementById('batch-delete');
  function selectionState(){const boxes=[...rows.querySelectorAll('input')];all.checked=boxes.length>0&&boxes.every(b=>b.checked);all.indeterminate=boxes.some(b=>b.checked)&&!all.checked;bulk.disabled=!selection.size;}
  all.onchange=()=>{const checked=all.checked;for(const box of rows.querySelectorAll('input')){box.checked=checked;box.onchange();}selectionState();};
  const pagination=createPrototypePagination(document.getElementById('pagination'),{pageSizes:[10,20,50,100],onChange(p,size,focus){page=p;pageSize=size;render(focus);}});
  function render(focus=false){
    rows.replaceChildren();const shown=filtered.slice((page-1)*pageSize,page*pageSize);
    for(const record of shown){const row=document.createElement('tr'),cell=document.createElement('td'),box=document.createElement('input');box.type='checkbox';box.className='mapping-check';box.setAttribute('aria-label','选择记录 '+(records.indexOf(record)+1));box.checked=selection.has(record);box.onchange=()=>{if(box.checked)selection.add(record);else selection.delete(record);selectionState();};cell.append(box);row.append(cell);for(const value of record){const td=document.createElement('td');td.textContent=value;td.title=value;row.append(td);}rows.append(row);}
    if(!shown.length){const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=headers.length+1;cell.className='mapping-empty';cell.textContent=searching?'暂无匹配记录':'此页截图尚未提供，待补充复刻。';row.append(cell);rows.append(row);}
    pagination({total:searching?filtered.length:(xiaomi?42:93),page,pageSize},focus);selectionState();
  }
  document.getElementById('query-form').onsubmit=e=>{e.preventDefault();const code=document.getElementById('mapping-code').value.trim();searching=Boolean(code)||(xiaomi&&Boolean(select.value));filtered=records.filter(r=>(!code||r[xiaomi?1:2].includes(code))&&(!select.value||r[0]===select.value));page=1;selection.clear();render();};
  for(const button of document.querySelectorAll('[data-pending]'))button.onclick=()=>showPrototypeMessage(button.textContent.trim()+'的操作规则及弹窗待补充，目前仅复刻入口。','warning');
  document.getElementById('favorite').onclick=e=>{const active=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',String(active));e.currentTarget.textContent=active?'★ 已收藏':'☆ 收藏';};
  render();
})();

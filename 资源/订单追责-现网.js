const fields = '极简订单类型|单位|门店省|闪回省|条码|代理商|客户|门店|店员|店员电话|机型名称|追责原因|成交价|前端检测价|前端检测价差|重大差错价差|实际差错价|第三方单号|三方原始单号|原始IMEI号|门店第三方编码|追责业务类型|订单号|下单时间|进入追责时间|签收时间|拆包监控-选填|三方议价金额|差错金额追回状态|是否明星机|是否优质订单|三方保价兜底|申诉原因|渠道类型|核算单位|手动检测方式|订单状态|闲鱼订单类型|处理状态|追责类型|触发规则|三星后付费订单|仓位名称|是否极简订单|极简买家|追责备注|预估价|重大差错项|差异明细项|重大差错附件|上次操作时间|申诉状态|下单方式|申诉图片|渠道人员驳回图片|渠道人员驳回原因|驳回详情原因|终审判责人|审核人|审核时间|处理人|处理时间|售后工单单号|售后检测人员|主单号|业务类型|售后标签'.split('|');
let columns = fields.slice();
const selected = new Set();
const columnWidths = new Map();

function configureColumnWidths() {
  configurePrototypeTableColumns(document.querySelector('.table-scroll table'), [
    { key: '选择', width: 44, minWidth: 44 },
    { key: '操作', width: 370, minWidth: 370 },
    ...columns.map(key => ({ key, width: 140, minWidth: 44 }))
  ], columnWidths);
}
const filterOptions = {
  订单状态: '已作废|异常状态|已退还|估价|待上传图片|客户提交|立即回收|已上门|收货拆包|发货提醒|待议价|待退还|已入库（此状态已弃用）|待入库|追责-待入库|追责判断|待追责|待审核|已入库|待发货|已销售|其他出库|销售结算|上门中|物流异常|待复检|待检测确定|待议价确认|预订单|询价中|待确认|预约待回收|待退货退款|待验机|快速询价状态|待退款|待toc复检'.split('|'),
  处理状态: ['待审核', '待处理', '已完成', '待复核', '已关闭'],
  追责类型: ['回收追责', '售后追责', '协助追差'],
  订单类型: ['正常订单', '保值订单', '繁星竞价平台', 'vivo竞价平台', '苏宁竞价平台'],
  闲鱼订单类型: ['闲鱼兜底', '闲鱼追责'],
  核算单位: ['深圳闪回科技有限公司', '赣州闪回科技有限公司', '深圳天海优品科技有限公司', '深圳闪吉科技有限公司', '深圳闪新软件技术服务有限公司', 'Shanhui Technology Holding Limited', '浙江闪回科技有限公司'],
  追责业务类型: ['闪回-追责', '闪回-回收商追责', '回收商-追责', '回收商-追责-荣耀垫付'],
  是否优质订单: ['是', '否'],
  三方保价兜底: ['是', '否']
};
const unitTree = [{
  label: '深圳闪回科技有限公司',
  expanded: true,
  children: [
    { label: '闪回华强1号店', hasHiddenChildren: true },
    { label: '柜台销售109' },
    { label: '回收事业部', hasHiddenChildren: true },
    { label: 'ID锁仓' },
    { label: '测试组织单位' }
  ]
}];
const multipleFilters = new Set(['订单状态', '处理状态', '追责类型', '订单类型', '追责业务类型']);
const records = Array.from({length:498}, (_, i) => {
  const row = Object.fromEntries(fields.map(name => [name, '—']));
  Object.assign(row, {'极简订单类型':'演示类型','单位':i%2?'演示仓乙':'演示仓甲','门店省':i%2?'浙江省':'广东省','闪回省':'广东省','条码':`DEMO-BAR-${String(i+1).padStart(3,'0')}`,'代理商':'演示代理商','客户':'演示客户','门店':`演示门店${i+1}`,'店员':'演示店员','店员电话':'138****0000','机型名称':'演示机型','订单号':`DEMO-${String(i+1).padStart(3,'0')}`,'处理状态':'待审核','订单状态':'演示状态','下单时间':`2026-11-0${i+1} 10:00:00`,'进入追责时间':`2026-11-0${i+1} 12:00:00`,'核算单位':'演示单位','是否优质订单':i%2?'是':'否','三方保价兜底':i%2?'否':'是','审核人':'演示审核人','追责业务类型':'演示业务','追责类型':'演示追责类型','闲鱼订单类型':'演示订单类型','极简买家':'演示买家'});
  // 枚举来自用户截图，记录与枚举之间的对应关系仅供原型筛选演示。
  for (const name of Object.keys(filterOptions)) {
    const options = filterOptions[name];
    row[name] = options[i % options.length];
  }
  row['订单状态'] = ['待审核', '待确认', '预约待回收', '待退货退款'][i % 4];
  row['处理状态'] = i === 8 || i === 9 ? '待处理' : '待审核';
  row['单位'] = unitTree[0].children[i % unitTree[0].children.length].label;
  const day = String(i % 30 + 1).padStart(2, '0');
  row['下单时间'] = `2026-11-${day} 10:00:00`;
  row['进入追责时间'] = `2026-11-${day} 12:00:00`;
  return row;
});
let visible = records.filter(row => row['处理状态'] === '待审核');
let page = 1;
let pageSize = 10;
const pagination = createPrototypePagination(document.getElementById('pagination'), {
  pageSizes: [10, 20, 50, 100],
  onChange(nextPage, nextSize, restoreFocus) {
    if (nextPage === page && nextSize === pageSize) return;
    page = nextPage;
    pageSize = nextSize;
    render();
    pagination({ total: visible.length, page, pageSize }, restoreFocus);
    document.querySelector('.table-scroll').scrollTop = 0;
  }
});
const filterLines = [['单位','订单号','条码','订单状态'],['处理状态','追责类型','订单类型'],['闲鱼订单类型','联系电话','开始时间'],['结束时间','进入追责开始时间','进入追责结束时间'],['核算单位','追责业务类型','是否优质订单'],['三方保价兜底','极简买家','审核人']];
const textFields = ['订单号','条码','联系电话','极简买家','审核人'];
const inputs = {};
for (const names of filterLines) {
  const line=document.createElement('div');line.className='filter-line';
  for(const name of names) {
    const isText = textFields.includes(name);
    const field = document.createElement(isText ? 'label' : 'div');
    field.className = 'filter-field';
    field.append(document.createTextNode(name));
    if (isText) {
      const input = document.createElement('input');
      inputs[name] = input;
      field.append(input);
    } else {
      const control = name.includes('时间') ? prototypeFilters.date(name) : prototypeFilters.choice({
        name,
        options: filterOptions[name],
        tree: name === '单位' ? unitTree : undefined,
        multiple: multipleFilters.has(name),
        initial: name === '处理状态' ? ['待审核'] : []
      });
      inputs[name] = control;
      field.append(control.element);
    }
    line.append(field);
  }
  document.getElementById('filter-fields').append(line);
}
const actions = [['查询',''],['表头排序','orange'],['⬇ 导出','gray'],['⬇ 导出全部','gray'],['新增追责','green'],['追责撤回','red'],['⬆ 导入强制追责单','gray'],['☁ 模板','white'],['⬆ 导入差错价','gray'],['☁ 模板','white'],['⬆ 导入追责原因','gray'],['☁ 模板','white'],['⬆ 资金池批量追责','gray'],['☁ 模板','white'],['⬆ 手工导入追责单','gray'],['☁ 模板','white'],['⬆ 导入店员补差','gray'],['☁ 模板','white'],['⬆ 导入不追责','gray'],['☁ 模板','white']];
function pending(title) {const p=document.createElement('p');p.textContent='该操作的弹窗、字段、权限和提交规则尚未提供，等待截图或操作说明后复刻。当前为本地演示。';showPrototypeDialog(title+' · 待核实',p);}

const sidebarToggle = document.getElementById('boss-sidebar-toggle');
const sidebar = document.getElementById('boss-sidebar');
sidebarToggle.onclick = () => {
  sidebar.hidden = !sidebar.hidden;
  sidebarToggle.setAttribute('aria-expanded', String(!sidebar.hidden));
  sidebarToggle.setAttribute('aria-label', sidebar.hidden ? '显示侧栏' : '收起侧栏');
};

const shortcutIcons = [
  ['导出列表', 'M8 2v8m-3-3 3 3 3-3M3 10v4h10v-4'],
  ['导入进度', 'M8 11V3M5 6l3-3 3 3M3 10v4h10v-4'],
  ['系统参数', 'M8 2v2m0 8v2M2 8h2m8 0h2M4 4l1 1m6 6 1 1M4 12l1-1m6-6 1-1M11 8a3 3 0 1 1-6 0 3 3 0 1 1 6 0Z'],
  ['旧boss', 'M3 5h10v8H3zM6 5V3h4v2M3 8h10'],
  ['数据报表', 'M2 3v11h12M4 11l3-4 2 2 4-4v6Z'],
  ['消息', 'M3 11h10l-2-3V6a3 3 0 0 0-6 0v2zM7 14h2'],
  ['绑定微信', 'M9 6a4 4 0 1 0-6 4l-.5 2 2-1h2M13 12l.5 2-2-1H10a3 3 0 1 1 3-1Z'],
  ['检测APP扫码', 'M2 2h4v4H2zM10 2h4v4h-4zM2 10h4v4H2zM10 10h2v2m2-2v4h-4']
];
const shortcuts = document.querySelector('.boss-shortcuts');
for (const [label, icon] of shortcutIcons) {
  const button = document.createElement('button');
  button.type = 'button';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', icon);
  svg.append(path);
  button.append(svg, document.createTextNode(label));
  if (label === '消息') {
    const badge = document.createElement('span');
    badge.className = 'boss-message-badge';
    badge.textContent = '6';
    button.append(badge);
  }
  button.onclick = () => pending(label);
  shortcuts.append(button);
}

function fillTopMenu(panelId, options, choose) {
  const panel = document.getElementById(panelId);
  const menu = panel.closest('details');
  const trigger = menu.querySelector('summary');
  for (const option of options) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = option;
    button.onclick = () => {
      menu.open = false;
      trigger.focus();
      choose(option, button);
    };
    panel.append(button);
  }
}

const currentUnit = document.getElementById('boss-current-unit');
fillTopMenu('boss-unit-options', [
  '深圳闪回科技有限公司', '闪回华强1号店', '柜台销售109', '回收事业部', '顺丰检测中心-停用',
  '闪回收总仓', '异常到货仓', '追责仓', '闪回华强3号店', '借机仓', '转转2.0售后退货仓', '转转质检仓'
], (unit, button) => {
  currentUnit.textContent = unit;
  for (const item of button.parentElement.children) {
    item.setAttribute('aria-pressed', String(item === button));
  }
});
for (const button of document.getElementById('boss-unit-options').children) {
  button.setAttribute('aria-pressed', String(button.textContent === currentUnit.textContent));
}
fillTopMenu('boss-account-options', ['修改密码', '申请权限', '申请借机', '退出登录'], pending);

document.addEventListener('click', event => {
  const menu = document.querySelector('.boss-menu[open]');
  if (menu && !menu.contains(event.target)) menu.open = false;
});
document.querySelector('.boss-top-menus').addEventListener('keydown', event => {
  const menu = event.target.closest('.boss-menu[open]');
  if (event.key === 'Escape' && menu) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});

for(const [name,color] of actions) {const b=document.createElement('button');b.textContent=name;b.className=color;b.type=name==='查询'?'submit':'button';if(name==='表头排序')b.onclick=editColumns;else if(name!=='查询')b.onclick=()=>pending(name);document.getElementById('toolbar').append(b);}
const pushPicker = prototypeFilters.choice({
  name: '推送对象',
  options: ['推送城市经理&省经理', '推送客户负责人', '推送店长', '推送店员'],
  multiple: true,
  action: {
    label: '推送',
    run(recipients) {
      if (!recipients.length) {
        showPrototypeMessage('请选择推送对象', 'warning');
        return;
      }
      if (!selected.size) {
        showPrototypeMessage('请先勾选需要推送的订单', 'warning');
        return;
      }
      showPrototypeMessage('推送追责订单成功');
    }
  }
});
pushPicker.element.classList.add('push-picker');
document.getElementById('toolbar').append(pushPicker.element);
function render() {
  const offset = (page - 1) * pageSize;
  const pageRows = visible.slice(offset, offset + pageSize);
  const header=document.createElement('tr');
  const checkHead = document.createElement('th');
  const all = document.createElement('input');
  all.type = 'checkbox';
  all.className = 'check';
  all.setAttribute('aria-label', '选择当前页');
  all.disabled = !pageRows.length;
  all.checked = pageRows.length > 0 && pageRows.every(row => selected.has(row['订单号']));
  all.indeterminate = !all.checked && pageRows.some(row => selected.has(row['订单号']));
  all.onchange = () => {
    for (const row of pageRows) {
      if (all.checked) selected.add(row['订单号']);
      else selected.delete(row['订单号']);
    }
    render();
  };
  checkHead.append(all);
  header.append(checkHead);
  for(const name of ['操作',...columns]){const th=document.createElement('th');th.textContent=name;header.append(th);}document.getElementById('head').replaceChildren(header);
  const body=document.getElementById('rows');body.replaceChildren();
  for(const row of pageRows){const tr=document.createElement('tr');const td=document.createElement('td');const c=document.createElement('input');c.type='checkbox';c.className='check';c.checked=selected.has(row['订单号']);c.setAttribute('aria-label','选择 '+row['订单号']);c.onchange=()=>{if(c.checked)selected.add(row['订单号']);else selected.delete(row['订单号']);render();};td.append(c);tr.append(td);
    const ops=document.createElement('td');for(const action of ['查看明细','追责处理','追责备注','日志']){const b=document.createElement('button');b.textContent=action;if(action==='追责处理')b.className='outline';b.onclick=()=>action==='查看明细'?openOrderDetails(row):action==='追责处理'?openAccountability(row):pending(action+' / '+row['订单号']);ops.append(b);}tr.append(ops);
    for(const name of columns){const cell=document.createElement('td');cell.textContent=row[name];cell.title=row[name];tr.append(cell);}body.append(tr);
  }
  if(!visible.length){const tr=document.createElement('tr');const td=document.createElement('td');td.colSpan=columns.length+2;td.textContent='暂无符合条件的模拟记录，请调整筛选条件';tr.append(td);body.append(tr);}
  configureColumnWidths();
  document.getElementById('count').textContent = selected.size ? '已选 ' + selected.size + ' 条' : '';
}
document.getElementById('query-form').onsubmit=e=>{
  e.preventDefault();
  for(const pair of [['开始时间','结束时间'],['进入追责开始时间','进入追责结束时间']])if(inputs[pair[0]].value&&inputs[pair[1]].value&&inputs[pair[0]].value>inputs[pair[1]].value){document.getElementById('result-note').textContent='开始时间应早于或等于结束时间（演示校验）';return;}
  visible=records.filter(row=>Object.entries(inputs).every(([key,input])=>{
    if (input.values) {
      const values = input.values;
      if (!values.length) return true;
      if (key === '单位' && values.includes(unitTree[0].label)) {
        return unitTree[0].children.some(unit => unit.label === row[key]);
      }
      return values.includes(row[key]);
    }
    const value=input.value.trim();if(!value)return true;
    if(key.includes('时间')){const date=row[key.startsWith('进入追责')?'进入追责时间':'下单时间'].slice(0,10);return key.includes('结束')?date<=value:date>=value;}
    const name = key === '联系电话' ? '店员电话' : key;
    return String(row[name] || '').includes(value);
  }));
  page = 1;
  selected.clear();
  document.getElementById('result-note').textContent = '查询已完成 · 本地模拟筛选；真实筛选口径待核实';
  render();
  pagination({ total: visible.length, page, pageSize });
  document.querySelector('.table-scroll').scrollTop = 0;
};
function editColumns(){
  const box=document.createElement('div');const note=document.createElement('p');note.textContent='演示交互，真实排序弹窗待核实。上下移动调整当前预览；刷新后恢复原始字段顺序。';box.append(note);
  const list=document.createElement('div');box.append(list);
  function draw(){list.replaceChildren();columns.forEach((name,index)=>{const row=document.createElement('div');row.className='column-row';const label=document.createElement('label');label.textContent=`${index+1}. ${name}`;row.append(label);for(const [text,delta] of [['上移',-1],['下移',1]]){const b=document.createElement('button');b.textContent=text;b.disabled=index+delta<0||index+delta>=columns.length;b.onclick=()=>{[columns[index],columns[index+delta]]=[columns[index+delta],columns[index]];draw();render();};row.append(b);}list.append(row);});}
  draw();showPrototypeDialog('表头排序 · 演示',box);
}
document.getElementById('favorite').onclick=e=>{e.preventDefault();e.currentTarget.textContent=e.currentTarget.textContent.includes('已收藏')?'☆ 收藏':'★ 已收藏（本次演示）';};
render();
pagination({ total: visible.length, page, pageSize });

// 用户明确要求所有复选框可点击；真实禁用与联动规则待核实。
function openAccountability(row) {
  const content = document.createElement('div');
  const options = document.createElement('div'); options.className = 'accountability-options';
  const labels = ['退回门店','不结算服务费','扣服务费','店员补差','不追责','免责不结服务费','免责结服务费','扣门店服务费','追责不扣服务费','客户免责额度','苏宁追责','繁星追责','vivo追责','SAAS追责','XY追责','先行退三方'];
  for (const name of labels) {
    const label = document.createElement('label'); const input = document.createElement('input');
    input.type = 'checkbox'; input.value = name;
    input.disabled = false;
    label.append(input, document.createTextNode(name)); options.append(label);
  }
  const remark = document.createElement('label'); remark.className = 'accountability-remark';
  remark.textContent = '备注：'; const textarea = document.createElement('textarea'); textarea.rows = 2; remark.append(textarea);
  content.append(options, remark);
  openPrototypeModal({title: '追责处理', content, width: 1050, onConfirm() {
    return true;
  }});
}

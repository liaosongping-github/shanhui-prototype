mountPrototypeHeader(document.querySelector('.boss-top'));
const byId = id => document.getElementById(id);
const fields = [
  ['订单号'], ['条码'], ['实物码'], ['快递单号'], ['订单状态', ['待拣货', '已退还']],
  ['发货类型', ['回收退还', '售后退还']], ['仓位', ['深圳演示仓']], ['客户'], ['联系人'], ['地址'],
  ['是否装箱', ['是', '否']], ['是否有物流单号', ['是', '否']], ['创建时间'], ['拣货单号'],
  ['销售类型', ['演示销售']]
];
const columns = [
  ['操作', 402], ['订单编号', 140], ['订单状态', 80], ['发货类型', 80], ['关联单号', 140],
  ['客户名称', 80], ['联系人', 80], ['联系电话', 90], ['快递单号', 140], ['地址', 80],
  ['数量', 80], ['销售类型', 80], ['拣货单', 80], ['创建时间', 110], ['备注', 80], ['仓位', 80], ['拍照图片', 80]
];
const records = Array.from({length: 12}, (_, i) => ({
  '订单编号': 'CR-DEMO-' + String(i + 1).padStart(3, '0'),
  '订单状态': i === 0 ? '已退还' : '待拣货',
  '发货类型': i === 0 ? '回收退还' : '售后退还',
  '关联单号': i === 0 ? '' : 'SRO-DEMO-' + (i + 1),
  '客户名称': '演示客户' + (i + 1), '联系人': '联系人' + (i + 1),
  '联系电话': '138****0000', '快递单号': i === 0 ? 'SF-DEMO-001' : '',
  '地址': '广东省深圳市演示地址', '数量': '1', '销售类型': i === 0 ? '' : '演示销售',
  '拣货单': '', '创建时间': '2026-11-' + String(14 - i).padStart(2, '0') + ' 10:00:00',
  '备注': i === 0 ? '' : '售后退还演示', '仓位': '深圳演示仓', '拍照图片': '',
  '条码': 'DEMO-B-' + (i + 1), '实物码': 'DEMO-P-' + (i + 1)
}));
const fieldMap = {'订单号':'订单编号', '客户':'客户名称', '拣货单号':'拣货单'};
const make = (tag, value = '') => Object.assign(document.createElement(tag), {textContent: value});
const message = value => { byId('return-message').textContent = value; };
const button = (name, run, color = '') => {
  const element = make('button', name);
  element.type = 'button';
  element.className = 'return-btn ' + color;
  element.addEventListener('click', run);
  return element;
};
for (const [name, options] of fields) {
  const label = make('label');
  label.append(make('span', name));
  if (name === '创建时间') {
    label.className = 'return-dates';
    for (const side of ['起', '止']) {
      const input = make('input');
      input.type = 'date';
      input.name = name + side;
      input.setAttribute('aria-label', name + side);
      label.append(input);
    }
  } else {
    const input = make(options ? 'select' : 'input');
    input.name = name;
    if (options) {
      input.add(new Option('请选择', ''));
      for (const option of options) input.add(new Option(option, option));
    }
    label.append(input);
  }
  byId('return-fields').append(label);
}
let current = records;
let page = 1;
const selected = new Set();
const form = byId('return-query');
const query = button('查询', () => {});
query.type = 'submit';
byId('return-toolbar').append(query);
const batch = [];
for (const name of ['新增','批量确认','合并打印所有拣货和快递面单','合并打印勾选拣货单','合并客户打印拣货单','合并快递上门','批量打印快递面单','合并退还客户','批量拍照','导出','拣货单清单']) {
  const item = button(name, () => message(name + '的窗口及业务规则待补充。'), name === '导出' ? 'gray' : '');
  if (['合并打印勾选拣货单','合并客户打印拣货单','合并快递上门','批量打印快递面单','合并退还客户','批量拍照'].includes(name)) batch.push(item);
  byId('return-toolbar').append(item);
}
const table = byId('return-head').parentElement;
const widths = make('colgroup');
const head = make('tr');
for (const [name, width] of columns) {
  const col = make('col');
  col.style.width = width + 'px';
  widths.append(col);
  const cell = make('th', name);
  cell.scope = 'col';
  head.append(cell);
}
table.prepend(widths);
byId('return-head').append(head);
const checkbox = label => {
  const element = make('input');
  element.type = 'checkbox';
  element.className = 'return-selection';
  element.setAttribute('aria-label', label);
  return element;
};
const all = checkbox('选择本页');
head.firstElementChild.prepend(all);
const visible = () => {
  const size = Number(byId('return-size').value);
  return current.slice((page - 1) * size, page * size);
};
function updateSelection() {
  const count = visible().filter(row => selected.has(row)).length;
  all.checked = count > 0 && count === visible().length;
  all.indeterminate = count > 0 && !all.checked;
  all.disabled = !visible().length;
  for (const item of batch) item.disabled = !selected.size;
}
all.addEventListener('change', () => {
  for (const row of visible()) {
    if (all.checked) selected.add(row);
    else selected.delete(row);
  }
  render();
});
function showRecord(row, action) {
  byId('return-dialog-title').textContent = action;
  const list = make('dl');
  for (const key of action === '日志' ? ['订单编号', '创建时间', '订单状态'] : columns.slice(1).map(([name]) => name)) {
    list.append(make('dt', key), make('dd', row[key] || '—'));
  }
  byId('return-dialog-body').replaceChildren(list);
  byId('return-dialog').showModal();
}
function render() {
  const body = byId('return-rows');
  body.replaceChildren();
  for (const row of visible()) {
    const tr = make('tr');
    const actions = make('td');
    const check = checkbox('选择 ' + row['订单编号']);
    check.checked = selected.has(row);
    check.addEventListener('change', () => {
      if (check.checked) selected.add(row);
      else selected.delete(row);
      updateSelection();
    });
    actions.append(check, button('查看明细', () => showRecord(row, '查看明细')), button('日志', () => showRecord(row, '日志'), 'gray'));
    if (row['订单状态'] === '待拣货') {
      actions.append(button('作废', () => message('作废规则待补充。'), 'red'), button('退还客户', () => message('退还客户的弹窗与接口规则待补充。')));
    }
    tr.append(actions);
    for (const [key] of columns.slice(1)) {
      const cell = make('td', row[key]);
      cell.title = row[key];
      tr.append(cell);
    }
    body.append(tr);
  }
  if (!current.length) {
    const row = make('tr');
    const empty = make('td', '暂无数据');
    empty.colSpan = columns.length;
    row.append(empty);
    body.append(row);
  }
  byId('return-count').textContent = '共 ' + current.length + ' 条';
  const pages = byId('return-pages');
  pages.replaceChildren();
  const last = Math.max(1, Math.ceil(current.length / Number(byId('return-size').value)));
  function addPage(label, target, disabled = false) {
    const control = make('button', label);
    control.type = 'button';
    control.disabled = disabled;
    if (label === String(page)) control.setAttribute('aria-current', 'page');
    control.addEventListener('click', () => { page = target; render(); });
    pages.append(control);
  }
  addPage('‹', page - 1, page === 1);
  for (let i = 1; i <= last; i++) addPage(String(i), i);
  addPage('›', page + 1, page === last);
  updateSelection();
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const criteria = new FormData(form);
  current = records.filter(row => Array.from(criteria).every(([key, raw]) => {
    const value = raw.trim();
    if (!value) return true;
    if (key === '创建时间起') return row['创建时间'].slice(0, 10) >= value;
    if (key === '创建时间止') return row['创建时间'].slice(0, 10) <= value;
    if (key === '是否装箱') return value === '否';
    if (key === '是否有物流单号') return Boolean(row['快递单号']) === (value === '是');
    const actual = row[fieldMap[key] || key];
    return form.elements.namedItem(key).tagName === 'SELECT' ? actual === value : actual.includes(value);
  }));
  selected.clear();
  page = 1;
  render();
  message('');
});
byId('return-size').addEventListener('change', () => { page = 1; render(); });
byId('favorite').addEventListener('click', event => {
  event.preventDefault();
  const favorite = event.currentTarget;
  favorite.textContent = favorite.textContent.startsWith('☆') ? '★ 已收藏' : '☆ 收藏';
});
render();
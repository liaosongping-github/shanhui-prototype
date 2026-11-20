(() => {
  mountPrototypeHeader(document.querySelector('.boss-top'));

  const records = [
    { order: '', barcode: '', model: '', price: '', position: '', unit: '闪回收总仓', client: '刘江', customer: '宇轩', time: '2019-03-13 11:58:20' },
    { order: '', barcode: '', model: '', price: '', position: '', unit: '京东POP店', client: '个人客户', customer: '宇轩', time: '2019-04-13 14:58:31' },
    { order: 'CS2017063001602', barcode: 'CS20170630016...', model: 'iPhone 6S', price: '1972', position: '转出检测', unit: '优品事业部', client: '', customer: '全钢', time: '' },
    { order: 'CS2017063001602', barcode: 'CS20170630016...', model: 'iPhone 6S', price: '1972', position: '转出检测', unit: '京东优品仓', client: '北京京东', customer: '杨学蕊', time: '' },
    { order: 'SM2017080700001', barcode: 'SM20170807000...', model: 'iPhone 6', price: '1530', position: '转出检测', unit: '闪回收总仓', client: 'C陈巧荣', customer: '深圳市柏仕通通...', time: '' },
    { order: 'SM2017081000002', barcode: 'SM20170810000...', model: 'iPhone 6', price: '2050', position: '转出检测', unit: '趣分期仓', client: '个人客户', customer: '马文慧', time: '' },
    { order: 'CB2017020409491', barcode: 'CB20170204094...', model: 'iPhone 6S', price: '1871', position: '销售', unit: '京东代销仓', client: '广州晶东', customer: '苏雪晴', time: '' },
    { order: 'CB2017021911566', barcode: 'CB20170219115...', model: 'iPhone 6', price: '1132', position: '销售', unit: '京东代销仓', client: '广州晶东', customer: '苏雪晴', time: '' },
    { order: 'CB2017022000309', barcode: 'CB20170220003...', model: 'iPhone 6', price: '1416', position: '销售', unit: '京东代销仓', client: '广州晶东', customer: '苏雪晴', time: '' },
    { order: 'CB2017022010263', barcode: 'CB20170220102...', model: 'iPhone 6S Plus', price: '2176', position: '销售', unit: '京东代销仓', client: '广州晶东', customer: '苏雪晴', time: '' },
    { order: 'SM2019033000001', barcode: 'SM20190330000...', model: 'iPhone 6', price: '499', position: '销售出库', unit: '京东POP店', client: '', customer: '龙进', time: '' },
    { order: 'TCS2019040200075', barcode: 'TCS20190402007...', model: 'iPhone 8 plus', price: '545', position: '销售结算', unit: '京东POP店', client: '回收转优品', customer: '罗源顺', time: '' },
    { order: 'TCS2019040200138', barcode: 'TCS20190402001...', model: '小米9 SE', price: '1355', position: '销售结算', unit: '京东POP店', client: '回收转优品', customer: '罗源顺', time: '' },
    { order: 'TCS2019040200333', barcode: 'TCS20190402003...', model: '小米平板', price: '106', position: '销售结算', unit: '京东POP店', client: '回收转优品', customer: '罗源顺', time: '' },
    { order: 'SM2019033000001', barcode: 'SM20190330000...', model: 'iPhone 6', price: '499', position: '销售出库', unit: '京东POP店', client: '', customer: '龙进', time: '' },
    { order: 'SM2019033000001', barcode: 'SM20190330000...', model: 'iPhone 6', price: '499', position: '销售出库', unit: '京东POP店', client: '', customer: '龙进', time: '' }
  ];

  const rows = document.getElementById('inspection-rows');
  const codeInput = document.getElementById('inspection-code');
  let focusedIndex = -1;

  function render() {
    rows.replaceChildren();
    records.forEach((record, index) => {
      const row = document.createElement('tr');
      row.dataset.index = String(index);
      if (index === focusedIndex) row.classList.add('is-focused');
      const values = [record.order, record.barcode, record.model, record.price, record.position, record.unit, record.client, record.customer, record.time];
      for (const value of values) {
        const cell = document.createElement('td');
        cell.textContent = value;
        cell.title = value;
        row.append(cell);
      }
      const actionCell = document.createElement('td');
      actionCell.className = 'inspection-action-col';
      const actionWrap = document.createElement('div');
      actionWrap.className = 'inspection-row-actions';
      for (const action of ['ToC检测', '检测']) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.action = action;
        button.textContent = action;
        button.disabled = !record.order;
        button.onclick = () => {
          showPrototypeMessage('已选择订单 ' + record.order + ' 的“' + action + '”入口；检测流程与结果录入规则待核对。', 'warning');
        };
        actionWrap.append(button);
      }
      actionCell.append(actionWrap);
      row.append(actionCell);
      rows.append(row);
    });
  }

  document.getElementById('start-inspection').addEventListener('click', () => {
    const keyword = codeInput.value.trim();
    if (!keyword) {
      showPrototypeMessage('请先输入或扫描条码/实物码。', 'warning');
      codeInput.focus();
      return;
    }
    const index = records.findIndex(record => record.order.includes(keyword) || record.barcode.includes(keyword));
    if (index < 0) {
      showPrototypeMessage('当前演示数据中没有匹配的条码，实际扫码流程待核对。', 'warning');
      return;
    }
    focusedIndex = index;
    render();
    rows.querySelector('tr[data-index="' + index + '"]')?.scrollIntoView({ block: 'center' });
    showPrototypeMessage('已定位演示记录；实际检测流程与设备联动规则待核对。', 'warning');
  });

  for (const button of document.querySelectorAll('[data-pending]')) {
    button.addEventListener('click', () => {
      showPrototypeMessage('“' + button.dataset.pending + '”的业务规则和后续页面待补充，当前仅复刻入口。', 'warning');
    });
  }

  document.getElementById('favorite').addEventListener('click', event => {
    const button = event.currentTarget;
    const active = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? '★ 已收藏' : '☆ 收藏';
  });

  render();
})();

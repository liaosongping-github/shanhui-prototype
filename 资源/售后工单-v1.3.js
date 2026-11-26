(() => {
  mountPrototypeHeader(document.querySelector('.boss-top'));

  const fullActions = ['检测确认', '售后确认', '检测报告', '重新检测', '处理结果', '取消退货', '补充证据', '日志', '工单', '实物'];
  const returnActions = ['检测确认', '补充证据', '日志', '工单', '回退至总部处理', '实物'];
  const pendingInspectionActions = ['检测确认', '补充证据', '日志', '工单', '实物'];
  const pendingInspectionCompareActions = ['检测确认', '补充证据', '日志', '工单', '实物', '报告对比'];
  const tabNames = ['全部', '严选订单', '实时竞拍', '闪优优', '转转', '2B销售', '2C销售', '拍机堂', '95分销售平台', '支付宝商城', '批发销售', '聚水潭'];
  const columns = [
    ['时效提醒', 'reminder', 150], ['条码', 'barcode', 176], ['实物码', 'physicalCode', 160],
    ['状态', 'status', 120], ['来源', 'source', 130], ['售后方式', 'method', 100], ['售后类型', 'afterType', 108],
    ['业务类型', 'businessType', 120], ['退款单号', 'refundOrderNo', 170], ['销售类型', 'salesType', 105],
    ['渠道类型', 'channelType', 110], ['销售平台', 'platform', 142],
    ['议价次数', 'bargainCount', 105], ['销售金额', 'salesAmount', 110], ['拍机堂价格', 'paimaitangPrice', 120],
    ['三方差价', 'thirdDifference', 110], ['期望返还金额', 'expectedReturn', 125], ['调价金额', 'adjustAmount', 150],
    ['调价后销售价', 'adjustedSalesPrice', 130], ['调价后差价对比', 'adjustedDifference', 135],
    ['拍机堂查询选项', 'inspectionQueryOption', 130], ['检测审核人员', 'inspectionReviewer', 125],
    ['实物状态', 'physicalStatus', 130], ['是否严选订单', 'strictOrder', 130], ['出库时间', 'outboundTime', 170],
    ['签收状态', 'signStatus', 110], ['签收时间', 'signTime', 170], ['售后收货时间', 'afterSalesReceiptTime', 170],
    ['机型', 'model', 130], ['一级分类', 'category1', 110], ['二级分类', 'category2', 110],
    ['售后原因', 'afterSalesReason', 145],
    ['售后收货单位', 'afterSalesReceivingUnit', 160], ['源单号/第三方单号', 'thirdOrder', 185],
    ['三方原始单号', 'thirdOriginalOrder', 180], ['买家退货单号', 'buyerReturnOrder', 180],
    ['平台收货单号', 'platformReceiptOrder', 180], ['平台退还单号', 'platformRefundOrder', 180],
    ['素材凭证', 'materialEvidence', 120], ['出库单位', 'outboundUnit', 150], ['销售单', 'salesOrder', 180],
    ['出库单快递单号', 'outboundExpressNo', 180], ['密封袋码', 'sealBagCode', 150], ['售后单号', 'afterOrder', 190],
    ['异常条码', 'abnormalBarcode', 170], ['付款凭证', 'paymentEvidence', 120], ['退款账号', 'refundAccount', 140],
    ['客户', 'buyer', 150], ['顾客名称', 'customer', 150], ['手机号码', 'phone', 140], ['驳回原因', 'rejectReason', 150],
    ['转寄方式', 'forwardMethod', 130], ['转寄联系人', 'forwardContact', 125], ['转寄联系电话', 'forwardPhone', 150],
    ['转寄地址', 'forwardAddress', 220], ['竞价客户', 'bidCustomer', 130], ['单据日期', 'documentDate', 150]
  ].map(([label, key, width]) => ({ label, key, width }));
  const baseRecords = [
    {
      channel: '严选订单', subtab: '其它', reminder: '离超时还有23:40:48', barcode: 'TCB2026110650166-402', physicalCode: '',
      status: '待总部处理', source: '闪云拍卖后', method: '调价', afterType: '其他', customer: '', buyer: '刘江',
      imei: '000000000000001', phone: '138****6096', afterOrder: 'SH2026110650166', thirdOrder: 'JD2026111700188', platform: '京东', receivedAt: '2026-11-16 15:20:08', actions: fullActions
    },
    {
      channel: '实时竞拍', subtab: '其它', reminder: '', barcode: 'TCB2026110649834-403', physicalCode: '',
      status: '客户确认', source: '闪云拍卖后', method: '调价', afterType: '其他', customer: '宇轩', buyer: '个人客户',
      phone: '139****3721', afterOrder: 'SH2026110649834', thirdOrder: 'JD2026111700194', platform: '京东', receivedAt: '2026-11-16 16:04:36', actions: returnActions
    },
    {
      channel: '闪优优', subtab: '其它', reminder: '', barcode: 'TCB2026111249885-610', physicalCode: '',
      status: '客户确认', source: '闪云拍卖后', method: '调价', afterType: '其他', customer: '马文慧', buyer: '个人客户',
      phone: '136****5188', afterOrder: 'SH2026111249885', thirdOrder: 'JD2026111700210', platform: '京东', receivedAt: '2026-11-17 09:12:44', actions: returnActions
    },
    {
      channel: '2C销售', subtab: '售后留言', reminder: '离超时还有08:12:06', barcode: 'TCB2026111346128-118', physicalCode: 'SW2026111346128',
      status: '待检测', source: '售后留言', method: '退货', afterType: '售后留言', customer: '陈巧荣', buyer: '北京京东',
      phone: '137****0241', afterOrder: 'SH2026111346128', thirdOrder: 'JD2026111700311', platform: '京东', receivedAt: '2026-11-17 10:06:12', actions: fullActions
    },
    {
      channel: '拍机堂', subtab: '其它', reminder: '离超时还有18:06:22', barcode: 'TCB2026111053981-221', physicalCode: 'SW2026111053981',
      status: '待总部处理', source: '第三方售后', method: '补差', afterType: '其他', customer: '苏雪晴', buyer: '广州晶东',
      phone: '135****8840', afterOrder: 'SH2026111053981', thirdOrder: 'PAI2026111700086', platform: '拍拍', receivedAt: '2026-11-15 11:28:05', actions: returnActions
    },
    {
      channel: '支付宝商城', subtab: '测试tab', reminder: '', barcode: 'TCB2026111517026-305', physicalCode: 'SW2026111517026',
      status: '已完成', source: '售后留言', method: '退货', afterType: '测试tab', customer: '罗源顺', buyer: '回收转优品',
      phone: '134****6637', afterOrder: 'SH2026111517026', thirdOrder: 'ALI2026111700203', platform: '支付宝商城', receivedAt: '2026-11-15 14:32:51', actions: returnActions
    },
    {
      channel: '转转', subtab: '其它', reminder: '离超时还有11:31:54', barcode: 'TCB2026111452701-606', physicalCode: 'SW2026111452701',
      status: '待总部处理', source: '第三方售后', method: '调价', afterType: '其他', customer: '杨学蕊', buyer: '北京京东',
      phone: '132****4419', afterOrder: 'SH2026111452701', thirdOrder: 'ZZ2026111700128', platform: '闪回收', receivedAt: '2026-11-15 17:06:33', actions: fullActions
    }
  ];

  const pendingInspectionRecords = [
    {
      channel: '严选订单', subtab: '其它', reminder: '离超时还有00:00:00', barcode: 'TCB2026110650170-410', physicalCode: '',
      status: '待检测审核', source: '闪云拍前置赔付', method: '调价', afterType: '其他', customer: '', buyer: '',
      phone: '', afterOrder: 'SH2026110650170', thirdOrder: 'JD2026111700410', platform: '京东', receivedAt: '2026-11-17 11:18:26', businessType: '先检后销', bargainCount: '0', documentDate: '2026-11-02', actions: pendingInspectionActions
    },
    {
      channel: '实时竞拍', subtab: '其它', reminder: '离超时还有00:00:00', barcode: 'TCB2026110250161-797', physicalCode: '',
      status: '待检测审核', source: '闪云拍前置赔付', method: '调价', afterType: '其他', customer: '客户仓2...', buyer: '王佳佳...',
      phone: '15002088907', afterOrder: 'SH2026110250161', thirdOrder: 'JD2026111700797', platform: '京东', receivedAt: '2026-11-17 11:24:10', businessType: '先检后销', salesType: '竞价', bargainCount: '0', expectedReturn: '210', adjustedDifference: '0.00', inspectionQueryOption: '查看', physicalStatus: '在途/未签收', strictOrder: '非严选订单', model: 'iPhone 12', documentDate: '2026-11-02', outboundUnit: '客户仓测试仓', salesOrder: 'SL20261029003257148', abnormalBarcode: 'SRO20261102175820536173', bidCustomer: '王佳测试', actions: pendingInspectionCompareActions
    },
    {
      channel: '转转', subtab: '其它', reminder: '离超时还有00:00:00', barcode: 'TCB2026110295173-850', physicalCode: '',
      status: '待检测审核', source: '闪云拍卖后', method: '调价', afterType: '其他', customer: '', buyer: '',
      phone: '', afterOrder: 'SH2026110295173', thirdOrder: 'ZZ2026111700850', platform: '闪回收', receivedAt: '2026-11-17 11:31:44', salesType: '竞价', bargainCount: '0', documentDate: '2026-11-02', actions: pendingInspectionActions
    },
    {
      channel: '2C销售', subtab: '售后留言', reminder: '离超时还有00:00:00', barcode: 'TCB2026110250022-553', physicalCode: '',
      status: '待检测审核', source: '闪云拍前置赔付', method: '调价', afterType: '其他', customer: '', buyer: '',
      phone: '', afterOrder: 'SH2026110250022', thirdOrder: 'JD2026111700553', platform: '京东', receivedAt: '2026-11-17 11:38:05', businessType: '先检后销', salesType: '竞价', bargainCount: '0', documentDate: '2026-11-02', actions: pendingInspectionCompareActions
    },
    {
      channel: '拍机堂', subtab: '其它', reminder: '离超时还有00:00:00', barcode: 'TCB2026110295001-599', physicalCode: '',
      status: '待检测审核', source: '闪云拍卖后', method: '调价', afterType: '其他', customer: '', buyer: '',
      phone: '', afterOrder: 'SH2026110295001', thirdOrder: 'PAI2026111700599', platform: '拍拍', receivedAt: '2026-11-17 11:45:32', salesType: '竞价', bargainCount: '0', documentDate: '2026-11-02', actions: pendingInspectionActions
    }
  ];

  const records = Array.from({ length: 24 }, (_, index) => {
    const base = baseRecords[index % baseRecords.length];
    const batch = Math.floor(index / baseRecords.length);
    const suffix = String(index + 1).padStart(3, '0');
    return {
      ...base,
      channel: tabNames[(index % (tabNames.length - 1)) + 1],
      barcode: index < baseRecords.length ? base.barcode : base.barcode.replace(/-\d{3}$/, '-' + suffix),
      afterOrder: index < baseRecords.length ? base.afterOrder : base.afterOrder.slice(0, -3) + suffix,
      thirdOrder: index < baseRecords.length ? base.thirdOrder : base.thirdOrder.slice(0, -3) + suffix,
      reminder: batch && base.reminder ? base.reminder : base.reminder,
      receivedAt: index < baseRecords.length ? base.receivedAt : '2026-11-' + String(10 + (index % 8)).padStart(2, '0') + ' 10:' + String((index * 7) % 60).padStart(2, '0') + ':20'
    };
  });

  records.splice(1, 0, ...structuredClone(pendingInspectionRecords));

  const salesTypeByChannel = {
    '严选订单': '严选',
    '实时竞拍': '竞价',
    '闪优优': '零售',
    '转转': '竞价',
    '2B销售': '批发',
    '2C销售': '零售',
    '拍机堂': '竞价',
    '95分销售平台': '零售',
    '支付宝商城': '零售',
    '批发销售': '批发',
    '聚水潭': '零售'
  };
  const unitByPlatform = {
    '京东': '京东代销仓',
    '拍拍': '优品事业部',
    '支付宝商城': '支付宝商城仓',
    '闪回收': '闪回收总仓'
  };
  const modelSamples = ['iPhone 12', 'iPhone 6S', 'iPhone 6', '小米9 SE', 'iPhone 8 plus', '小米平板'];
  const amountSamples = [
    { salesAmount: '1972', paimaitangPrice: '1850', thirdDifference: '122', expectedReturn: '210', adjustAmount: '100', adjustedSalesPrice: '1872', adjustedDifference: '0.00' },
    { salesAmount: '1530', paimaitangPrice: '1450', thirdDifference: '80', expectedReturn: '150', adjustAmount: '8', adjustedSalesPrice: '1522', adjustedDifference: '0.00' },
    { salesAmount: '2050', paimaitangPrice: '1980', thirdDifference: '70', expectedReturn: '180', adjustAmount: '13', adjustedSalesPrice: '2037', adjustedDifference: '0.00' },
    { salesAmount: '1871', paimaitangPrice: '1780', thirdDifference: '91', expectedReturn: '210', adjustAmount: '100', adjustedSalesPrice: '1771', adjustedDifference: '0.00' },
    { salesAmount: '1132', paimaitangPrice: '1080', thirdDifference: '52', expectedReturn: '100', adjustAmount: '8', adjustedSalesPrice: '1124', adjustedDifference: '0.00' }
  ];
  records.forEach((record, index) => {
    const digits = record.afterOrder.replace(/\D/g, '').slice(-12);
    const amount = amountSamples[index % amountSamples.length];
    const model = modelSamples[index % modelSamples.length];
    record.salesType ||= salesTypeByChannel[record.channel] || '';
    record.bargainCount ||= '0';
    record.refundOrderNo ||= digits ? 'TK' + digits : '';
    record.buyerReturnOrder ||= digits ? 'RT' + digits : '';
    record.platformReceiptOrder ||= digits ? 'PR' + digits : '';
    record.platformRefundOrder ||= digits ? 'RF' + digits : '';
    record.salesOrder ||= digits ? 'SL' + digits : '';
    record.outboundExpressNo ||= digits ? 'SF' + digits : '';
    record.sealBagCode ||= digits ? 'BAG' + digits.slice(-8) : '';
    record.materialEvidence ||= '查看';
    record.paymentEvidence ||= '查看';
    record.outboundUnit ||= unitByPlatform[record.platform] || '';
    record.afterSalesReceivingUnit ||= record.outboundUnit;
    record.model ||= model;
    record.physicalStatus ||= record.status === '已完成' ? '已签收' : '在途/未签收';
    record.strictOrder ||= record.channel === '严选订单' ? '严选订单' : '非严选订单';
    record.inspectionQueryOption ||= record.status === '待检测审核' ? '查看' : '';
    record.inspectionReviewer ||= '';
    record.afterSalesReason ||= '';
    record.thirdOriginalOrder ||= '';
    record.rejectReason ||= '';
    record.forwardMethod ||= '';
    record.forwardContact ||= '';
    record.forwardPhone ||= '';
    record.forwardAddress ||= '';
    record.documentDate ||= record.receivedAt ? record.receivedAt.slice(0, 10) : '';
    record.outboundTime ||= record.documentDate ? record.documentDate + ' 10:20:00' : '';
    record.signStatus ||= record.status === '已完成' ? '已签收' : '待签收';
    record.signTime ||= record.status === '已完成' ? record.receivedAt : '';
    record.afterSalesReceiptTime ||= record.receivedAt || '';
    record.abnormalBarcode ||= '';
    for (const key of ['salesAmount', 'paimaitangPrice', 'thirdDifference', 'expectedReturn', 'adjustAmount', 'adjustedSalesPrice', 'adjustedDifference']) {
      if (record[key] == null || record[key] === '') record[key] = amount[key];
    }
    if (!record.refundAccount && record.phone.replace(/\D/g, '').length >= 4) {
      record.refundAccount = '尾号' + record.phone.replace(/\D/g, '').slice(-4);
    }
    if (!record.bidCustomer && ['严选订单', '实时竞拍', '转转'].includes(record.channel)) {
      record.bidCustomer = '王佳测试';
    }
  });

  const columnGroup = document.getElementById('after-sales-columns');
  const actionColumn = document.createElement('col');
  actionColumn.className = 'col-actions';
  columnGroup.append(actionColumn, ...columns.map(column => {
    const col = document.createElement('col');
    col.style.width = column.width + 'px';
    col.style.minWidth = column.width + 'px';
    return col;
  }));

  const headRow = document.getElementById('after-sales-head');
  const actionHead = document.createElement('th');
  actionHead.scope = 'col';
  actionHead.textContent = '操作';
  headRow.append(actionHead, ...columns.map(column => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = column.label;
    return th;
  }));

  const rows = document.getElementById('after-sales-rows');
  const paginationRoot = document.getElementById('pagination');
  let activeTab = '全部';
  let activeSubtab = '全部';
  let filtered = records.slice();
  let page = 1;
  let pageSize = 20;

  const read = id => document.getElementById(id).value.trim();
  function matchesQuery(record) {
    const checks = [
      [read('barcode'), record.barcode],
      [read('physical-code'), record.physicalCode],
      [read('imei'), record.imei],
      [read('after-sales-no'), record.afterOrder],
      [read('customer-name'), record.customer],
      [read('buyer-name'), record.buyer],
      [read('phone'), record.phone],
      [read('third-party-order'), record.thirdOrder],
      [read('outbound-unit'), record.source],
      [read('source'), record.source],
      [read('sales-platform'), record.platform],
      [read('status'), record.status],
      [read('after-sales-method'), record.method]
    ];
    return checks.every(([query, value]) => !query || String(value || '').includes(query));
  }

  function filterRecords() {
    filtered = records.filter(record =>
      (activeTab === '全部' || record.channel === activeTab) &&
      (activeSubtab === '全部' || record.subtab === activeSubtab) &&
      matchesQuery(record)
    );
  }

  function actionClass(action) {
    if (['检测确认', '售后确认', '检测报告', '回退至总部处理'].includes(action)) return 'is-red';
    if (['重新检测', '处理结果', '报告对比'].includes(action)) return 'is-blue';
    if (action === '取消退货') return 'is-orange';
    if (['补充证据', '日志'].includes(action)) return 'is-gray';
    return 'is-white';
  }

  const pagination = createPrototypePagination(paginationRoot, {
    pageSizes: [10, 20, 50],
    onChange(nextPage, nextSize, focus) {
      page = nextPage;
      pageSize = nextSize;
      render(focus);
    }
  });

  function render(focus = false) {
    rows.replaceChildren();
    const start = (page - 1) * pageSize;
    const shown = filtered.slice(start, start + pageSize);
    for (const record of shown) {
      const row = document.createElement('tr');
      const actionCell = document.createElement('td');
      actionCell.className = 'col-actions';
      const actionGrid = document.createElement('div');
      actionGrid.className = 'after-sales-row-actions';
      for (const action of record.actions) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = actionClass(action);
        button.textContent = action;
        button.onclick = () => {
          if (action === '检测确认') {
            openAfterSalesInspection(record, button);
          } else if(action === '日志'){openOperationLog(record,button);
          } else if (action === '售后确认' || action === '检测报告') {
            openAfterSalesDetectionReport(record, button);
          } else {
            showPrototypeMessage('“' + action + '”的处理流程和校验规则待核对，当前仅复刻入口。', 'warning');
          }
        };
        actionGrid.append(button);
      }
      actionCell.append(actionGrid);
      row.append(actionCell);

      for (const column of columns) {
        const value = record[column.key] ?? '';
        const cell = document.createElement('td');
        if (column.key === 'reminder' && value) {
          cell.className = 'after-sales-timer';
          cell.append(document.createTextNode('离超时还有'));
          const strong = document.createElement('strong');
          strong.textContent = String(value).replace('离超时还有', '');
          cell.append(strong);
        } else if (column.key === 'inspectionQueryOption' && value) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'after-sales-table-action';
          button.textContent = value;
          button.onclick = () => showPrototypeMessage('“拍机堂查询选项”的查询规则待核对。', 'warning');
          cell.append(button);
        } else if (column.key === 'adjustAmount') {
          cell.className = 'after-sales-adjust-amount';
          const valueText = document.createElement('span');
          valueText.textContent = value;
          const edit = document.createElement('button');
          edit.type = 'button';
          edit.className = 'after-sales-inline-edit';
          edit.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 11-.5 2.5L5 13l7.5-7.5-2-2L3 11Zm6-6 2 2"/></svg><span>编辑</span>';
          edit.onclick = () => showPrototypeMessage('“调价金额”的编辑规则和弹窗待核对。', 'warning');
          cell.append(valueText, edit);
        } else {
          cell.textContent = value;
          cell.title = value;
          if (column.key === 'status' && value === '待检测审核') {
            cell.className = 'after-sales-status is-pending-inspection';
          }
        }
        row.append(cell);
      }
      rows.append(row);
    }
    if (!shown.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = columns.length + 1;
      cell.className = 'after-sales-empty';
      cell.textContent = '当前筛选条件与业务标签下没有演示数据；实际查询结果和空状态文案待核对。';
      row.append(cell);
      rows.append(row);
    }
    pagination({ total: filtered.length, page, pageSize }, focus);
  }

  document.getElementById('query-form').addEventListener('submit', event => {
    event.preventDefault();
    filterRecords();
    page = 1;
    render();
    showPrototypeMessage('已按当前条件筛选演示数据。');
  });

  document.getElementById('query-form').addEventListener('reset', () => {
    window.setTimeout(() => {
      filterRecords();
      page = 1;
      render();
      showPrototypeMessage('查询条件已重置。');
    }, 0);
  });

  for (const button of document.querySelectorAll('[data-pending]')) {
    button.addEventListener('click', () => {
      showPrototypeMessage('“' + button.dataset.pending + '”的业务规则和弹窗待补充，当前仅复刻入口。', 'warning');
    });
  }

  for (const tab of document.querySelectorAll('[data-tab]')) {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      for (const item of document.querySelectorAll('[data-tab]')) item.setAttribute('aria-selected', String(item === tab));
      filterRecords();
      page = 1;
      render();
    });
  }

  for (const tab of document.querySelectorAll('[data-subtab]')) {
    tab.addEventListener('click', () => {
      activeSubtab = tab.dataset.subtab;
      for (const item of document.querySelectorAll('[data-subtab]')) item.setAttribute('aria-selected', String(item === tab));
      filterRecords();
      page = 1;
      render();
    });
  }

  document.getElementById('favorite').addEventListener('click', event => {
    const button = event.currentTarget;
    const active = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? '★ 已收藏' : '☆ 收藏';
  });

  function openOperationLog(record,trigger){
    const rows=record.operationLogs||[
      ['2026-10-13 10:06:46','系统操作','已完成','客户确认','补差金额已发放至余额，请查收～',''],
      ['2026-10-13 10:03:20','系统操作','客户确认','待客户确认','补差金额已确认，等待财务打款，请耐心等待',''],
      ['2026-10-13 10:03:05','演示员工','待客户确认','待总部处理','售后补差金额：66元，请确认。超48h未确认，补差金额将自动生效。',''],
      ['2026-10-13 10:02:48','演示员工','待总部处理','待检测','检测完成',''],
      ['2026-10-13 09:54:54','演示员工','待检测','待检测审核','该机器已触发前置售后，售后客服受理中，请耐心等待',''],
      ['2026-10-12 18:47:16','150****8907','待检测审核','','您的售后申请已提交检测审核，24h内出结果','']
    ];
    const statement=record.buyerStatement||{reason:'不同意当前补差金额，外观问题影响使用，请重新核对。',expectedAmount:300,evidence:[{src:'../资源/待审核售后-凭证截图.png',type:'image',name:'买家凭证'}]};
    const disagreementRow=['2026-11-18 14:46:12','系统操作','待总部处理','待客户确认','不同意补差，期望补差金额：'+statement.expectedAmount,''];const displayRows=[...rows];const confirmationIndex=displayRows.findIndex(row=>row[2]==='待客户确认');displayRows.splice(confirmationIndex<0?0:confirmationIndex,0,['2026-10-13 10:03:05','演示员工','待客户确认','待总部处理','售后补差金额：66元，请确认。超48h未确认，补差金额将自动生效。',''],disagreementRow);
    const content=document.createElement('div');content.className='operation-log-content';
    const scroll=document.createElement('div');scroll.className='operation-log-scroll';const table=document.createElement('table');const head=table.createTHead().insertRow();for(const name of ['操作时间','操作人','新状态','旧状态','备注','原因']){const th=document.createElement('th');th.textContent=name;head.append(th);}const body=table.createTBody();for(const [index,values] of displayRows.entries()){const tr=body.insertRow();for(const [column,value] of values.entries()){const td=tr.insertCell();td.textContent=value||'';if(values===disagreementRow&&column===5){td.className='operation-disagree-reason';const reason=document.createElement('p');reason.textContent='不同意原因：'+(statement.reason||'暂无');const label=document.createElement('p');label.textContent='凭证：';td.append(reason,label);for(const item of statement.evidence||[]){if(!/^(?:\.\.\/资源\/|data:image\/|data:video\/|blob:)/.test(item.src||''))continue;if(item.type==='video'||item.type?.startsWith('video/')){const video=document.createElement('video');video.src=item.src;video.controls=true;td.append(video);}else{const button=document.createElement('button');button.type='button';button.className='operation-log-evidence';const img=document.createElement('img');img.src=item.src;img.alt=item.name||'买家上传凭证';button.append(img);button.onclick=()=>{if(window.openPrototypeImageViewer)window.openPrototypeImageViewer({src:item.src,title:'买家上传凭证',alt:img.alt,trigger:button});};td.append(button);}}const amount=document.createElement('p');amount.textContent='期望补差金额：￥ '+statement.expectedAmount;td.append(amount);}}}scroll.append(table);content.append(scroll);if(!record.operationLogs){const note=document.createElement('p');note.className='operation-log-note';note.textContent='按截图复刻的演示日志，非当前工单真实操作记录。';content.append(note);}showPrototypeDialog('操作日志',content);const dialog=content.closest('dialog');dialog.classList.add('operation-log-dialog');dialog.addEventListener('close',()=>{dialog.classList.remove('operation-log-dialog');trigger?.focus();},{once:true});
  }
  filterRecords();
  render();
})();

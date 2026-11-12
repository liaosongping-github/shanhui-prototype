(() => {
  const $ = id => document.getElementById(id);
  // 脱敏演示记录，保留截图的行数与厂商、渠道的分布。
  const records = [
    ['vivo竞价平台', 'vivo聚合平台_非体专店', '演示用户A', '2026-11-04 15:33:02'],
    ['迪信通', '演示渠道-008', '演示用户B', '2026-11-04 14:37:33'],
    ['闪回门店系统（h5&app&ios）', '全部渠道', '演示用户C', '2026-06-22 14:48:30'],
    ['vivo竞价平台', '演示渠道-009', '演示用户C', '2026-06-22 14:18:22'],
    ['三星门店系统（h5&app&ios）', '演示渠道A', '演示用户C', '2026-06-17 18:13:19'],
    ['闪回门店系统（h5&app&ios）', '演示渠道B', '演示用户C', '2026-06-17 14:24:35'],
    ['三星门店系统（h5&app&ios）', '全部渠道', '演示用户B', '2026-06-09 16:41:13']
  ].map(([vendor, channel, creator, createdAt]) => ({
    vendor, channel, creator, createdAt, status: '启用'
  }));

  Object.assign(records[0], {
    hours: 72,
    items: [
      { issue: '能开机', editIssue: '能开机-1510', support: '支持', denied: '不可售后描述', allowed: '可售后描述' },
      { issue: '山寨或高仿', editIssue: '山寨或高仿-1530', support: '不支持', denied: '不可售后描述', allowed: '可售后描述' }
    ]
  });

  mountPrototypeHeader(document.querySelector('.boss-top'));

  $('favorite').onclick = event => {
    const button = event.currentTarget;
    const favorite = button.getAttribute('aria-pressed') === 'false';
    button.setAttribute('aria-pressed', String(favorite));
    button.textContent = favorite ? '★ 已收藏' : '☆ 收藏';
  };

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-pending]');
    if (button) window.showPrototypeMessage(button.dataset.pending + '的现网交互待核对', 'warning');
  });

  const vendorOptions = [...new Set(records.map(record => record.vendor))];
  const vendorPicker = window.prototypeFilters.choice({ name: '厂商', options: vendorOptions });
  const statusPicker = window.prototypeFilters.choice({ name: '状态', options: ['启用', '停用'] });
  const channelPicker = window.createRuleChannelPicker({
    additional: records.map(record => record.channel)
  });
  $('vendor-picker').append(vendorPicker.element);
  $('status').append(statusPicker.element);
  $('channel').append(channelPicker.element);

  let criteria = {};
  let filtered = records;
  let page = 1;
  let pageSize = 10;
  const renderPager = window.createPrototypePagination($('pagination'), {
    pageSizes: [10, 20, 50, 100],
    onChange(nextPage, nextSize, restoreFocus) {
      page = nextPage;
      pageSize = nextSize;
      render(restoreFocus);
    }
  });

  function action(text, onClick, extraClass = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rule-link' + extraClass;
    if (onClick) button.onclick = onClick;
    else button.dataset.pending = text;
    button.textContent = text;
    return button;
  }

  function addCell(row, content) {
    const cell = row.insertCell();
    cell.append(content);
    if (typeof content === 'string') cell.title = content;
    return cell;
  }

  function render(restoreFocus) {
    const rows = $('rows');
    rows.replaceChildren();
    const start = (page - 1) * pageSize;
    for (const record of filtered.slice(start, start + pageSize)) {
      const row = rows.insertRow();
      addCell(row, record.vendor);
      addCell(row, record.channel);
      addCell(row, action('查看详情', () => window.showRuleDetails(record)));
      const status = document.createElement('span');
      status.className = 'rule-status';
      status.classList.toggle('is-inactive', record.status === '停用');
      status.textContent = record.status;
      addCell(row, status);
      addCell(row, record.creator);
      addCell(row, record.createdAt);
      const edit = action('编辑', () => editRule(record));
      edit.dataset.ruleEdit = '';
      addCell(row, edit).append(action('删除', null, ' rule-delete'));
    }
    if (!filtered.length) {
      const cell = addCell(rows.insertRow(), '暂无数据');
      cell.colSpan = 7;
      cell.className = 'rule-empty';
    }
    renderPager({ total: filtered.length, page, pageSize }, restoreFocus);
  }

  function refreshResults() {
    const { vendor, channel, status } = criteria;
    filtered = records.filter(record =>
      (!vendor || record.vendor === vendor) &&
      (!channel || record.channel === channel) &&
      (!status || record.status === status)
    );
    page = 1;
    render();
  }

  function editRule(record) {
    window.showRuleEditor({
      record,
      vendors: vendorOptions,
      channels: records.map(entry => entry.channel),
      onSave(values) {
        if (record) Object.assign(record, values);
        else records.unshift({
          ...values, creator: '演示用户',
          createdAt: new Intl.DateTimeFormat('sv-SE', {
            timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'medium'
          }).format(new Date())
        });
      },
      onClose(reason) {
        if (reason !== 'confirm') return;
        refreshResults();
        window.showPrototypeMessage('已保存演示规则');
        $('add-rule').focus();
      }
    });
  }

  $('add-rule').onclick = () => editRule();
  $('query-form').onsubmit = event => {
    event.preventDefault();
    criteria = {
      vendor: vendorPicker.values[0], channel: channelPicker.value, status: statusPicker.values[0]
    };
    refreshResults();
  };

  $('query-form').onreset = () => {
    for (const picker of [vendorPicker, statusPicker]) {
      // 使用现有组件的清空入口，保持组件内部选中状态同步。
      if (picker.values.length) picker.element.querySelector('.filter-picker-clear').click();
    }
    channelPicker.clear();
    channelPicker.close();
    criteria = {};
    refreshResults();
  };

  render();
})();

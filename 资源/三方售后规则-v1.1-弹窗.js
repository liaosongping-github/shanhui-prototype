(() => {
  const hourStarts = ['签收后', '发货后', '付款后'];
  const headers = ['售后问题', '是否支持售后', '不可售后描述', '可售后描述'];

  function afterSalesLimits(record) {
    return record?.afterSalesLimits ?? [{
      start: record?.hourStart || hourStarts[0],
      hours: record ? record.hours ?? null : 0
    }];
  }

  function buildAfterSalesControls(form, record) {
    const add = form.querySelector('.rule-add-term');
    const terms = [];
    const relation = document.createElement('select');
    relation.className = 'rule-term-relation';
    relation.setAttribute('aria-label', '售后时效条件关系');
    relation.add(new Option('且', 'and'));
    relation.add(new Option('或', 'or'));
    relation.value = record?.afterSalesRelation === 'or' ? 'or' : 'and';

    function update() {
      const hasSecond = terms.length === 2;
      add.hidden = hasSecond;
      terms.forEach(term => { term.hours.required = hasSecond; });
    }

    function appendTerm({ start, hours }, second = false) {
      const row = document.createElement('div');
      row.className = 'rule-term';
      const picker = window.prototypeFilters.choice({
        name: second ? '第二项售后时效起算点' : '第一项售后时效起算点',
        options: hourStarts,
        initial: [start]
      });
      picker.element.classList.add('rule-hour-start');
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = 'any';
      input.value = hours ?? '';
      input.setAttribute('aria-label', second ? '第二项售后时效小时数' : '第一项售后时效小时数');
      const term = { picker, hours: input };
      terms.push(term);
      row.append(picker.element, input, '小时');
      if (second) {
        row.prepend(relation);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'rule-link rule-delete';
        remove.textContent = '移除';
        remove.setAttribute('aria-label', '移除第二项售后时效');
        remove.onclick = () => {
          terms.pop();
          relation.value = 'and';
          row.remove();
          update();
          add.focus();
        };
        row.append(remove);
      }
      add.before(row);
      update();
      return picker.element.querySelector('button');
    }

    afterSalesLimits(record).forEach((limit, index) => appendTerm(limit, index === 1));
    add.onclick = () => {
      if (terms.length === 2) return;
      const start = terms[0].picker.values[0] === '付款后' ? '签收后' : '付款后';
      appendTerm({ start, hours: null }, true).focus();
    };
    return () => ({
      afterSalesLimits: terms.map(({ picker, hours }) => ({
        start: picker.values[0], hours: hours.value === '' ? null : hours.valueAsNumber
      })),
      afterSalesRelation: terms.length === 2 ? relation.value : null
    });
  }

  function bindAppealLimit(form, record, field) {
    const input = form.elements[field];
    const unlimitedField = field + 'Unlimited';
    const unlimited = form.elements[unlimitedField];
    input.value = record?.[field] ?? '';
    unlimited.checked = Boolean(record?.[unlimitedField]);
    let draftValue = input.value;
    unlimited.onchange = () => {
      if (unlimited.checked) draftValue = input.value;
      input.value = unlimited.checked ? '' : draftValue;
      input.disabled = unlimited.checked;
    };
    input.disabled = unlimited.checked;
    return () => ({
      [field]: input.disabled || input.value === '' ? null : input.valueAsNumber,
      [unlimitedField]: unlimited.checked
    });
  }

  function formatAppealLimit(record, field, unit) {
    if (record[field + 'Unlimited']) return '不限';
    return record[field] == null ? '—' : record[field] + unit;
  }

  function makeTable(editable) {
    const region = document.createElement('div');
    region.className = 'rule-items-scroll';
    const table = document.createElement('table');
    table.className = 'rule-items';
    table.setAttribute('aria-label', '售后问题列表');
    const header = table.createTHead().insertRow();
    for (const title of editable ? [...headers, '操作'] : headers) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = title;
      header.append(th);
    }
    const rows = table.createTBody();
    region.append(table);
    return { region, rows };
  }

  function showEmpty(rows, columnCount) {
    const cell = rows.insertRow().insertCell();
    cell.className = 'rule-items-empty';
    cell.colSpan = columnCount;
    cell.textContent = '暂无数据';
  }

  function open(title, content, options = {}) {
    const modal = window.openPrototypeModal({ title, content, width: 900, ...options });
    modal.element.classList.add('rule-modal');
    return modal;
  }

  window.showRuleDetails = record => {
    const content = document.createElement('div');
    const facts = document.createElement('dl');
    facts.className = 'rule-facts';
    const values = [
      ['厂商', record.vendor], ['对应渠道', record.channel],
      ['售后时效', afterSalesLimits(record).filter(limit => limit.hours != null)
        .map(limit => limit.start + limit.hours + '小时').join(record.afterSalesRelation === 'or' ? ' 或 ' : ' 且 ') || '—'],
      ['启用状态', record.status],
      ['复议时效', formatAppealLimit(record, 'appealHours', '小时')],
      ['复议次数', formatAppealLimit(record, 'appealCount', '次')]
    ];
    for (const [index, [label, value]] of values.entries()) {
      const pair = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      if (index < 2) term.className = 'rule-required';
      term.textContent = label;
      description.textContent = value;
      pair.append(term, description);
      facts.append(pair);
    }
    const { region, rows } = makeTable(false);
    for (const item of record.items || []) {
      const row = rows.insertRow();
      for (const value of [item.issue, item.support, item.denied, item.allowed]) {
        row.insertCell().textContent = value || '—';
      }
    }
    if (!rows.rows.length) showEmpty(rows, 4);
    content.append(facts, region);
    const modal = open('三方售后规则详情', content);
    modal.element.classList.add('rule-detail-modal');
    modal.element.querySelector('.prototype-modal-footer').hidden = true;
  };

  window.showRuleEditor = ({ record, vendors, channels, onSave, onClose }) => {
    const form = document.createElement('form');
    form.innerHTML = `
      <div class="rule-editor-fields">
        <label class="rule-editor-field">
          <span class="rule-required">厂商</span>
          <select name="vendor" required><option value="">请选择</option></select>
        </label>
        <div class="rule-editor-field">
          <span class="rule-required">对应渠道</span><div class="rule-editor-channel"></div>
        </div>
        <div class="rule-editor-field rule-hours">
          <div class="rule-hours-label"><span data-change="C04">售后时效</span></div>
          <div class="rule-terms">
            <button type="button" class="rule-link rule-add-term">+ 添加时效</button>
          </div>
        </div>
        <div class="rule-editor-field rule-appeal">
          <div class="rule-hours-label"><label for="rule-appeal-hours" data-change="C05">复议时效</label></div>
          <div class="rule-appeal-limits">
            <div class="rule-appeal-limit">
              <input id="rule-appeal-hours" type="number" min="0" step="any" name="appealHours"> 小时
              <label><input type="checkbox" name="appealHoursUnlimited" aria-label="复议时效不限">不限</label>
            </div>
            <div class="rule-appeal-limit">
              <label for="rule-appeal-count">复议次数</label>
              <input id="rule-appeal-count" type="number" min="0" step="1" name="appealCount"> 次
              <label><input type="checkbox" name="appealCountUnlimited" aria-label="复议次数不限">不限</label>
            </div>
          </div>
        </div>
        <fieldset class="rule-editor-status">
          <legend>启用状态</legend>
          <label><input type="radio" name="status" value="启用" checked> 启用</label>
          <label><input type="radio" name="status" value="停用"> 禁用</label>
        </fieldset>
      </div>
      <div class="rule-editor-actions">
        <button type="button" data-unverified="批量删除">批量删除</button>
        <span>
          <button type="button" class="gray" data-unverified="导入">导入</button>
          <button type="button" class="white" data-unverified="模板">模板</button>
        </span>
      </div>`;
    form.onsubmit = event => event.preventDefault();
    const vendor = form.elements.vendor;
    for (const name of vendors) vendor.add(new Option(name, name));
    vendor.value = record?.vendor || '';
    const readLimits = buildAfterSalesControls(form, record);
    const readAppealHours = bindAppealLimit(form, record, 'appealHours');
    const readAppealCount = bindAppealLimit(form, record, 'appealCount');
    form.elements.status.value = record?.status || '启用';

    const channel = window.createRuleChannelPicker({ initial: record?.channel, additional: channels });
    form.querySelector('.rule-editor-channel').append(channel.element);
    const { region, rows } = makeTable(true);
    form.append(region);
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'rule-add-item';
    add.textContent = '+ 添加一行';
    form.append(add);

    function addItem(item = {}) {
      rows.querySelector('.rule-items-empty')?.parentElement.remove();
      const row = rows.insertRow();
      const support = document.createElement('select');
      support.setAttribute('aria-label', '是否支持售后');
      support.add(new Option('请选择', ''));
      support.add(new Option('支持'));
      support.add(new Option('不支持'));
      support.value = item.support || '';
      for (const [index, value] of [item.editIssue || item.issue, '', item.denied, item.allowed].entries()) {
        const cell = row.insertCell();
        if (index === 1) {
          cell.append(support);
        } else {
          const input = document.createElement('input');
          input.type = 'text';
          input.placeholder = headers[index];
          input.setAttribute('aria-label', headers[index]);
          input.value = value || '';
          cell.append(input);
        }
      }
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'rule-link rule-delete';
      remove.textContent = '删除';
      remove.onclick = () => {
        row.remove();
        if (!rows.rows.length) showEmpty(rows, 5);
        add.focus();
      };
      row.insertCell().append(remove);
      return row;
    }

    for (const item of record?.items || []) addItem(item);
    if (!rows.rows.length) showEmpty(rows, 5);
    add.onclick = () => addItem().querySelector('input').focus();
    const modal = open(record ? '编辑三方售后规则' : '创建三方售后规则', form, {
      confirmText: '保存规则', cancelText: '返回列表页',
      onClose(reason) {
        channel.close();
        onClose(reason);
      },
      onConfirm(api) {
        if (!form.reportValidity()) return false;
        if (!channel.value) {
          api.setMessage('请选择对应渠道。');
          form.querySelector('.rule-channel-trigger').focus();
          return false;
        }
        const items = [...rows.rows].filter(row => row.cells.length === 5).map(row => {
          const [issue, support, denied, allowed] = [...row.querySelectorAll('input, select')]
            .map(control => control.value.trim());
          return { issue, support, denied, allowed };
        });
        onSave({
          vendor: vendor.value, channel: channel.value, status: form.elements.status.value,
          ...readLimits(),
          ...readAppealHours(),
          ...readAppealCount(),
          items
        });
        return true;
      }
    });
    form.addEventListener('click', event => {
      const action = event.target.closest('[data-unverified]');
      if (action) modal.setMessage(action.dataset.unverified + '的现网交互待核对。');
    });
  };
})();

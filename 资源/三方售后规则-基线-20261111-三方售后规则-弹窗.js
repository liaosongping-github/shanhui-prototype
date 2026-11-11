(() => {
  const hourStarts = ['签收后', '发货后'];
  const headers = ['售后问题', '是否支持售后', '不可售后描述', '可售后描述'];

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
      ['时效', record.hours == null ? '—' : (record.hourStart || hourStarts[0]) + record.hours + '小时'],
      ['启用状态', record.status]
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
          <span>时效</span>
          <div>
            <div class="rule-hour-start"></div>
            <input type="number" min="0" step="any" name="hours" aria-label="时效小时数"> 小时
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
    const hourStart = window.prototypeFilters.choice({
      name: '时效起算点', options: hourStarts, initial: [record?.hourStart || hourStarts[0]]
    });
    form.querySelector('.rule-hour-start').append(hourStart.element);
    form.elements.hours.value = record ? record.hours ?? '' : 0;
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
        const hours = form.elements.hours.value;
        onSave({
          vendor: vendor.value, channel: channel.value, status: form.elements.status.value,
          hourStart: hourStart.values[0],
          hours: hours === '' ? null : Number(hours), items
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

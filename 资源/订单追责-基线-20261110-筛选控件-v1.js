window.prototypeFilters = (() => {
  function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    if (tag === 'button') node.type = 'button';
    return node;
  }

  let activePicker;

  function createPicker(name, panelClass, onOpen) {
    const root = element('div', 'filter-picker');
    const trigger = element('button', 'filter-picker-trigger');
    const value = element('span', 'filter-picker-value');
    const icon = element('span', 'filter-picker-icon', '⌄');
    const panel = element('div', 'filter-picker-panel ' + panelClass);
    const clear = element('button', 'filter-picker-clear', '×');
    clear.setAttribute('aria-label', '清空' + name);
    icon.setAttribute('aria-hidden', 'true');
    trigger.append(value, icon);
    trigger.setAttribute('aria-label', name);
    trigger.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    root.append(trigger, clear, panel);

    function close(restoreFocus = false) {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (activePicker === picker) activePicker = null;
      if (restoreFocus) trigger.focus();
    }

    trigger.onclick = () => {
      if (!panel.hidden) return close();
      activePicker?.close();
      activePicker = picker;
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      onOpen?.();
    };
    root.onkeydown = event => {
      if (event.key === 'Escape' && !panel.hidden) {
        event.stopPropagation();
        close(true);
      }
    };
    const picker = { root, trigger, value, icon, panel, clear, close };
    return picker;
  }

  document.addEventListener('pointerdown', event => {
    if (activePicker && !activePicker.root.contains(event.target)) activePicker.close();
  });
  document.addEventListener('focusin', event => {
    if (activePicker && !activePicker.root.contains(event.target)) activePicker.close();
  });

  function choice({ name, options = [], tree, multiple = false, initial = [], action }) {
    const picker = createPicker(name, tree ? 'filter-tree-panel' : '');
    const selected = new Set(initial);
    const optionButtons = new Map();
    const summary = element('div', 'filter-picker-summary');
    picker.root.append(summary);

    function update() {
      const values = [...selected];
      picker.value.textContent = multiple && values.length ? '' : values[0] || '请选择';
      picker.trigger.classList.toggle('has-value', values.length > 0);
      picker.clear.hidden = multiple || !values.length;
      summary.replaceChildren();
      if (multiple) {
        for (const label of values) {
          const tag = element('button', 'filter-picker-tag', label + ' ×');
          tag.setAttribute('aria-label', '移除' + label);
          tag.onclick = () => {
            selected.delete(label);
            update();
            picker.trigger.focus();
          };
          summary.append(tag);
        }
      }
      for (const [label, button] of optionButtons) {
        button.setAttribute('aria-pressed', String(selected.has(label)));
      }
    }

    function addOption(label, parent) {
      const button = element('button', 'filter-picker-option', label);
      optionButtons.set(label, button);
      button.onclick = () => {
        if (!multiple) selected.clear();
        if (selected.has(label)) selected.delete(label);
        else selected.add(label);
        update();
        if (!multiple) picker.close(true);
      };
      parent.append(button);
    }

    function addTreeNode(node, parent) {
      const row = element('div', 'filter-tree-row');
      parent.append(row);
      if (node.children || node.hasHiddenChildren) {
        const toggle = element('button', 'filter-tree-toggle');
        const branch = element('div', 'filter-tree-branch');
        branch.hidden = !node.expanded;
        toggle.setAttribute('aria-label', '展开或收起' + node.label);
        function updateBranch() {
          toggle.textContent = branch.hidden ? '▸' : '▾';
          toggle.setAttribute('aria-expanded', String(!branch.hidden));
        }
        toggle.onclick = () => {
          branch.hidden = !branch.hidden;
          updateBranch();
        };
        updateBranch();
        row.append(toggle);
        parent.append(branch);
        if (node.children) node.children.forEach(child => addTreeNode(child, branch));
        else branch.append(element('div', 'filter-tree-pending', '下级单位待补充'));
      }
      addOption(node.label, row);
    }

    if (tree) tree.forEach(node => addTreeNode(node, picker.panel));
    else options.forEach(label => addOption(label, picker.panel));
    if (action) {
      const footer = element('div', 'filter-picker-footer');
      const button = element('button', '', action.label);
      button.onclick = () => action.run([...selected]);
      footer.append(button);
      picker.panel.append(footer);
    }
    picker.clear.onclick = () => {
      selected.clear();
      update();
      picker.trigger.focus();
    };
    update();
    return { element: picker.root, get values() { return [...selected]; } };
  }

  function date(name) {
    const picker = createPicker(name, 'filter-calendar', openAtSelection);
    const today = new Date();
    let month;
    let value = '';
    picker.icon.textContent = '▦';
    picker.root.classList.add('filter-date-picker');

    function updateValue(next) {
      value = next;
      picker.value.textContent = next;
      picker.clear.hidden = !next;
    }

    function dateKey(day) {
      const pad = number => String(number).padStart(2, '0');
      return day.getFullYear() + '-' + pad(day.getMonth() + 1) + '-' + pad(day.getDate());
    }

    function openAtSelection() {
      const date = value ? new Date(value + 'T00:00:00') : today;
      month = new Date(date.getFullYear(), date.getMonth(), 1);
      render();
    }

    function render(focusControl) {
      const header = element('div', 'filter-calendar-header');
      function navigation(symbol, label, delta) {
        const button = element('button', '', symbol);
        button.setAttribute('aria-label', label);
        button.onclick = () => {
          month = new Date(month.getFullYear(), month.getMonth() + delta, 1);
          render(label);
        };
        header.append(button);
      }
      navigation('«', '上一年', -12);
      navigation('‹', '上个月', -1);
      header.append(element('strong', '', month.getFullYear() + ' 年 ' + (month.getMonth() + 1) + ' 月'));
      navigation('›', '下个月', 1);
      navigation('»', '下一年', 12);
      const grid = element('div', 'filter-calendar-grid');
      for (const weekday of '日一二三四五六') grid.append(element('span', 'filter-calendar-weekday', weekday));
      for (let index = 0; index < 42; index++) {
        const day = new Date(month.getFullYear(), month.getMonth(), 1 - month.getDay() + index);
        const key = dateKey(day);
        const button = element('button', '', String(day.getDate()));
        button.setAttribute('aria-label', key);
        button.setAttribute('aria-pressed', String(key === value));
        button.classList.toggle('other-month', day.getMonth() !== month.getMonth());
        button.classList.toggle('today', key === dateKey(today));
        button.onclick = () => {
          updateValue(key);
          picker.close(true);
        };
        grid.append(button);
      }
      picker.panel.replaceChildren(header, grid);
      if (focusControl) header.querySelector('[aria-label="' + focusControl + '"]').focus();
    }

    picker.clear.onclick = () => {
      updateValue('');
      picker.close(true);
    };
    updateValue('');
    return { element: picker.root, get value() { return value; } };
  }

  return { choice, date };
})();

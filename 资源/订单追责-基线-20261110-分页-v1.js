window.createPrototypePagination = function (root, { pageSizes, onChange }) {
  const totalLabel = document.createElement('span');
  totalLabel.setAttribute('aria-live', 'polite');
  const size = document.createElement('select');
  size.setAttribute('aria-label', '每页条数');
  for (const value of pageSizes) size.add(new Option(value + '条/页', value));
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', '列表分页');
  root.append(totalLabel, size, nav);
  size.onchange = () => onChange(1, Number(size.value));

  return function render({ total, page, pageSize }, restoreFocus = false) {
    const last = Math.max(1, Math.ceil(total / pageSize));
    totalLabel.textContent = '共 ' + total + ' 条';
    size.value = String(pageSize);
    nav.replaceChildren();

    function button(text, label, target, disabled = false) {
      const control = document.createElement('button');
      control.type = 'button';
      control.textContent = text;
      control.setAttribute('aria-label', label);
      control.disabled = disabled;
      control.onclick = () => onChange(target, pageSize, true);
      nav.append(control);
      return control;
    }

    button('‹', '上一页', page - 1, page === 1);
    const start = Math.max(2, Math.min(page - 2, last - 5));
    const pages = [1];
    for (let number = start; number <= Math.min(last - 1, start + 4); number++) {
      pages.push(number);
    }
    if (last > 1) pages.push(last);

    let current;
    for (const [index, number] of pages.entries()) {
      if (index && number - pages[index - 1] > 1) {
        const gap = document.createElement('span');
        gap.className = 'pagination-gap';
        gap.textContent = '…';
        nav.append(gap);
      }
      const control = button(String(number), '第 ' + number + ' 页', number);
      if (number === page) {
        current = control;
        control.setAttribute('aria-current', 'page');
      }
    }
    button('›', '下一页', page + 1, page === last);
    if (restoreFocus) current?.focus();
  };
};

window.configurePrototypeTableColumns = function (table, definitions, columnWidths = new Map()) {
  const names = definitions.map(item => item.key);
  table.querySelector('colgroup')?.remove();
  const group = document.createElement('colgroup');
  const headerCells = table.querySelectorAll('th');
  table.classList.add('resizable-table');

  function updateTableWidth() {
    table.style.width = names.reduce((sum, name) => sum + columnWidths.get(name), 0) + 'px';
    table.style.setProperty('--checkbox-column-width', columnWidths.get(names[0]) + 'px');
  }

  names.forEach((name, index) => {
    const minimum = definitions[index].minWidth ?? 44;
    if (!columnWidths.has(name)) {
      columnWidths.set(name, Math.max(minimum, definitions[index].width ?? 140));
    }
    const column = document.createElement('col');
    column.style.width = columnWidths.get(name) + 'px';
    group.append(column);
    const handle = document.createElement('span');
    handle.className = 'column-resize-handle';
    handle.title = '拖拽调整' + name + '列宽';
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-label', '调整' + name + '列宽');
    handle.setAttribute('aria-orientation', 'vertical');
    handle.tabIndex = 0;

    function setWidth(width) {
      const nextWidth = Math.max(minimum, Math.round(width));
      columnWidths.set(name, nextWidth);
      column.style.width = nextWidth + 'px';
      handle.setAttribute('aria-valuenow', nextWidth);
      updateTableWidth();
    }

    handle.setAttribute('aria-valuemin', minimum);
    handle.setAttribute('aria-valuenow', columnWidths.get(name));
    handle.onkeydown = event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      setWidth(columnWidths.get(name) + (event.key === 'ArrowRight' ? 10 : -10));
    };
    handle.onpointerdown = event => {
      if (event.button !== 0) return;
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = columnWidths.get(name);
      handle.setPointerCapture(event.pointerId);
      document.body.classList.add('resizing-column');
      handle.onpointermove = move => setWidth(startWidth + move.clientX - startX);
      function finish() {
        handle.onpointermove = null;
        document.body.classList.remove('resizing-column');
      }
      handle.onpointerup = finish;
      handle.onpointercancel = finish;
      handle.onlostpointercapture = finish;
    };
    headerCells[index].querySelectorAll('.column-resize-handle').forEach(node => node.remove());
    headerCells[index].append(handle);
  });
  table.prepend(group);
  updateTableWidth();
  return columnWidths;
};

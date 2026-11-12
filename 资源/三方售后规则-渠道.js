(() => {
  const channels = [
    { name: '347039(未命名)', code: '347039' },
    { name: '演示渠道-009', code: '149510', branch: true },
    { name: '演示渠道-008', code: '149413', branch: true },
    { name: '全部渠道', code: '10', branch: true }
  ];
  let active;
  let sequence = 0;

  window.createRuleChannelPicker = ({ initial = '', additional = [] } = {}) => {
    const element = document.createElement('div');
    element.className = 'rule-channel-picker';
    element.innerHTML = `
      <button type="button" class="rule-channel-trigger" aria-expanded="false"></button>
      <div class="rule-channel-panel" hidden>
        <div class="rule-channel-search">
          <input type="search" placeholder="输入渠道名称搜索" aria-label="搜索渠道">
          <button type="button" class="white">清除</button>
        </div>
        <div class="rule-channel-results"></div>
      </div>`;
    const trigger = element.querySelector('.rule-channel-trigger');
    const panel = element.querySelector('.rule-channel-panel');
    const search = panel.querySelector('input');
    const results = panel.querySelector('.rule-channel-results');
    panel.id = 'rule-channel-options-' + (++sequence);
    trigger.setAttribute('aria-controls', panel.id);
    let selected = initial;

    function update() {
      trigger.textContent = selected || '请选择渠道';
      trigger.classList.toggle('has-value', Boolean(selected));
      trigger.setAttribute('aria-label', '对应渠道，' + trigger.textContent);
    }

    function close(focus = false) {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      if (active === picker) active = null;
      if (focus) trigger.focus();
    }

    function render() {
      const keyword = search.value.trim().toLowerCase();
      const extra = [...new Set(additional)]
        .filter(name => name && !channels.some(channel => channel.name === name))
        .map(name => ({ name }));
      const options = keyword ? [...channels, ...extra] : channels;
      results.replaceChildren();
      for (const channel of options) {
        if (!channel.name.toLowerCase().includes(keyword)) continue;
        const row = document.createElement('div');
        row.className = 'rule-channel-option';
        const expand = document.createElement('button');
        expand.type = 'button';
        expand.className = 'rule-channel-expand';
        expand.textContent = '▸';
        expand.setAttribute('aria-label', '展开' + channel.name);
        expand.setAttribute('aria-expanded', 'false');
        expand.hidden = !channel.branch;
        const note = document.createElement('div');
        note.textContent = '下级渠道待核对';
        note.className = 'rule-channel-note';
        note.hidden = true;
        expand.onclick = () => {
          note.hidden = !note.hidden;
          expand.textContent = note.hidden ? '▸' : '▾';
          expand.setAttribute('aria-expanded', String(!note.hidden));
          expand.setAttribute('aria-label', (note.hidden ? '展开' : '收起') + channel.name);
        };
        const choose = document.createElement('button');
        choose.type = 'button';
        choose.className = 'white';
        choose.textContent = '选择';
        choose.setAttribute('aria-label', '选择' + channel.name);
        choose.onclick = () => {
          selected = channel.name;
          update();
          close(true);
        };
        row.append(expand, choose, channel.name + (channel.code ? ' - ' + channel.code : ''));
        results.append(row, note);
      }
      if (!results.childElementCount) results.textContent = '暂无数据';
    }

    const picker = {
      element, close, get value() { return selected; },
      clear() {
        selected = '';
        search.value = '';
        update();
        render();
      }
    };
    trigger.onclick = () => {
      if (!panel.hidden) return close(true);
      active?.close();
      active = picker;
      search.value = '';
      render();
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      search.focus();
    };
    search.oninput = render;
    panel.querySelector('.rule-channel-search button').onclick = () => {
      picker.clear();
      search.focus();
    };
    element.onkeydown = event => {
      if (panel.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close(true);
      }
      if (event.target === search && event.key === 'Enter') event.preventDefault();
    };
    update();
    return picker;
  };

  function closeOutside(event) {
    if (active && !active.element.contains(event.target)) active.close();
  }
  document.addEventListener('pointerdown', closeOutside);
  document.addEventListener('focusin', closeOutside);
})();

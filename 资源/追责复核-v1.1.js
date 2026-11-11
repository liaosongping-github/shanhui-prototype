function openOrderReview(row) {
  const key = 'prototype:orders:v1.1:review:' + row['订单号'];
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key)) || {}; } catch (_) {}

  const content = document.createElement('div');
  content.className = 'order-review-form';
  const identity = document.createElement('section');
  identity.className = 'single-push-summary';
  for (const name of ['代理商', '实际差错价', '条码', '重大差错项']) {
    const item = document.createElement('div');
    const caption = document.createElement('span');
    caption.textContent = name + '：';
    item.append(caption, document.createTextNode(row[name] ?? '—'));
    identity.append(item);
  }
  const controls = new Map();
  function field(parent, name, tag = 'input', settings = {}) {
    const label = document.createElement('label');
    label.className = 'order-review-field';
    const caption = document.createElement('span');
    caption.textContent = name + '：';
    if (settings.required) caption.className = 'is-required';
    const control = document.createElement(tag);
    if (settings.options) {
      control.add(new Option('请选择' + name, ''));
      for (const option of settings.options) control.add(new Option(option, option));
    }
    if (tag === 'textarea') control.rows = 2;
    control.required = Boolean(settings.required);
    control.readOnly = Boolean(settings.readOnly);
    control.value = settings.readOnly ? settings.value : saved.fields?.[name] ?? '';
    if (settings.placeholder) control.placeholder = settings.placeholder;
    if (!settings.readOnly) controls.set(name, control);
    label.append(caption, control);
    parent.append(label);
    return control;
  }

  const rejection = document.createElement('section');
  rejection.className = 'order-review-rejection';
  field(rejection, '闲鱼拒绝原因', 'input', {readOnly: true, value: row['闲鱼拒绝原因'] ?? '问题不存在/举证不清晰（示例）'});
  field(rejection, '闲鱼拒绝原因描述', 'input', {readOnly: true, value: row['闲鱼拒绝原因描述'] ?? '不同意售后（示例）'});
  const demo = document.createElement('p');
  demo.className = 'order-review-demo';
  demo.textContent = '下拉枚举及选项映射为演示数据';
  content.append(identity, rejection, demo);

  const amount = field(content, '退差金额', 'input', {required: true});
  amount.type = 'number'; amount.min = '0'; amount.step = '0.01';
  field(content, '售后原因', 'select', {required: true, options: ['质检报告不符']});
  field(content, '追责原因', 'textarea', {readOnly: true, value: row['追责原因'] ?? '—'});

  const mappings = [
    {name: '明显弯曲', rows: [['屏幕外观完美', '屏幕外观完美'], ['屏幕划痕', '屏幕外观完美']]},
    {name: '屏幕划痕', rows: [['屏幕有划痕', '屏幕外观有瑕疵']]}
  ];
  const cards = Array.isArray(saved.cards) ? saved.cards : [{mapping: 0, selected: null, images: [], video: ''}];
  const selector = document.createElement('select');
  selector.setAttribute('aria-label', '追责选项');
  selector.add(new Option('请选择追责选项', ''));
  mappings.forEach((mapping, index) => selector.add(new Option(mapping.name, String(index))));
  const add = document.createElement('button');
  add.type = 'button'; add.textContent = '添加';
  const picker = document.createElement('div');
  picker.className = 'order-review-picker';
  picker.append(document.createTextNode('追责选项：'), selector, add);
  const list = document.createElement('div');
  content.append(picker, list);
  field(content, '处理类型', 'select', {required: true, options: ['补差']});
  field(content, '全程视频链接', 'input', {placeholder: '请输入全程视频链接'});
  field(content, '备注', 'textarea');

  const modal = openPrototypeModal({title: '复核', content, width: 900,
    confirmText: '重新推送', cancelText: '不追责',
    onConfirm(api) {
      for (const [name, control] of controls) {
        if (control.checkValidity()) continue;
        api.setMessage('请填写有效的' + name);
        control.reportValidity();
        return false;
      }
      return true;
    },
    onClose(reason) {
      if (reason === 'confirm') finishReview('重新推送成功（模拟）');
      if (reason === 'no-accountability') openNoAccountabilityRemark(finishReview);
    }
  });
  modal.element.classList.add('order-review-modal');
  modal.element.querySelector('.prototype-modal-footer .gray').onclick = () => modal.close('no-accountability');

  function finishReview(message) {
    try { localStorage.removeItem(key); } catch (_) {}
    showPrototypeMessage(message);
  }

  add.onclick = () => {
    if (selector.value === '') { modal.setMessage('请先选择追责选项'); selector.focus(); return; }
    const mapping = Number(selector.value);
    if (cards.some(card => card.mapping === mapping)) { modal.setMessage('此追责选项已添加'); return; }
    cards.push({mapping, selected: null, images: [], video: ''});
    selector.value = '';
    modal.setMessage('');
    renderCards();
  };

  function renderCards() {
    list.replaceChildren();
    cards.forEach((card, index) => {
      const mapping = mappings[card.mapping];
      if (!mapping) return;
      const section = document.createElement('section');
      section.className = 'order-review-card';
      const heading = document.createElement('div');
      heading.className = 'order-review-card-header';
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'red'; remove.textContent = '删除';
      remove.onclick = () => { cards.splice(index, 1); renderCards(); add.focus(); };
      heading.append(document.createTextNode('追责选项 ' + (index + 1)), remove);
      const table = document.createElement('table');
      const header = table.createTHead().insertRow();
      for (const title of ['选择', '追责选项', '映射选项', '闲鱼选项']) {
        const th = document.createElement('th'); th.scope = 'col'; th.textContent = title; header.append(th);
      }
      const body = table.createTBody();
      mapping.rows.forEach(([mapped, platform], choice) => {
        const tr = body.insertRow();
        const radio = document.createElement('input');
        radio.type = 'radio'; radio.name = 'order-review-mapping-' + index;
        radio.checked = card.selected === choice;
        radio.setAttribute('aria-label', '选择' + mapped);
        radio.onchange = () => { card.selected = choice; };
        tr.insertCell().append(radio);
        for (const value of [mapping.name, mapped, platform]) tr.insertCell().textContent = value;
      });
      const evidence = document.createElement('div');
      evidence.className = 'order-review-evidence';
      evidence.append(document.createTextNode('图片补充证据：'));
      card.images.forEach((src, photoIndex) => {
        const preview = document.createElement('div');
        preview.className = 'order-review-preview';
        const image = document.createElement('img'); image.src = src; image.alt = '补充证据 ' + (photoIndex + 1);
        const clear = document.createElement('button'); clear.type = 'button'; clear.className = 'red'; clear.textContent = '×';
        clear.setAttribute('aria-label', '删除图片 ' + (photoIndex + 1));
        clear.onclick = () => { card.images.splice(photoIndex, 1); renderCards(); };
        preview.append(image, clear); evidence.append(preview);
      });
      const upload = document.createElement('input');
      upload.type = 'file'; upload.accept = 'image/*'; upload.hidden = true;
      const choose = document.createElement('button');
      choose.type = 'button'; choose.className = 'white'; choose.textContent = '+ 添加图片';
      choose.disabled = card.images.length >= 9;
      choose.onclick = () => upload.click();
      upload.onchange = () => {
        const file = upload.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { modal.setMessage('请选择图片文件'); return; }
        choose.disabled = true;
        const reader = new FileReader();
        reader.onload = () => {
          if (!modal.element.open || !cards.includes(card) || card.images.length >= 9) return;
          card.images.push(reader.result);
          renderCards();
        };
        reader.onerror = () => { choose.disabled = false; modal.setMessage('图片读取失败'); };
        reader.readAsDataURL(file);
      };
      evidence.append(upload, choose, document.createTextNode(card.images.length + '/9'));
      const video = document.createElement('label');
      video.className = 'order-review-field';
      const link = document.createElement('input');
      link.placeholder = '请输入视频链接'; link.value = card.video;
      link.oninput = () => { card.video = link.value; };
      video.append(document.createTextNode('视频补充证据：'), link);
      section.append(heading, table, evidence, video);
      list.append(section);
    });
  }
  renderCards();
}

function openNoAccountabilityRemark(finishReview) {
  const content = document.createElement('div');
  content.className = 'order-review-field';
  const label = document.createElement('span');
  label.textContent = '备注：';

  const quickRemark = document.createElement('select');
  quickRemark.setAttribute('aria-label', '快捷备注');
  quickRemark.add(new Option('快捷备注', ''));
  for (const reason of ['举证不充分', '复核后无差错']) {
    quickRemark.add(new Option(reason + '（示例）', reason));
  }

  const extraRemark = document.createElement('textarea');
  extraRemark.rows = 2;
  extraRemark.placeholder = '补充备注';
  extraRemark.setAttribute('aria-label', '补充备注');
  content.append(label, quickRemark, extraRemark);

  const modal = openPrototypeModal({title: '不追责备注', content, width: 760,
    confirmText: '确认备注', cancelText: '不备注',
    onConfirm(api) {
      if (quickRemark.value || extraRemark.value.trim()) return true;
      api.setMessage('请选择快捷备注或填写补充备注');
      quickRemark.focus();
      return false;
    },
    onClose(reason) {
      if (reason === 'confirm') finishReview('已按不追责处理并备注（模拟）');
      if (reason === 'without-remark') finishReview('已按不追责处理（模拟）');
    }
  });
  modal.element.querySelector('.prototype-modal-footer .gray').onclick = () => modal.close('without-remark');
}

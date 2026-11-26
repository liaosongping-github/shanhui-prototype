function openConsultationVideo(src, title, trigger) {
  const dialog = document.createElement('dialog');
  dialog.className = 'consultation-video-viewer';
  dialog.setAttribute('aria-label', title);
  const video = document.createElement('video');
  video.src = src;
  video.controls = true;
  video.playsInline = true;
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '关闭';
  close.onclick = () => dialog.close();
  const feedback = document.createElement('p');
  feedback.hidden = true;
  video.addEventListener('error', () => {
    feedback.hidden = false;
    feedback.textContent = '视频无法播放，请检查链接是否有效。';
  });
  dialog.addEventListener('close', () => {
    video.pause();
    dialog.remove();
    trigger.focus();
  }, {once: true});
  dialog.append(close, video, feedback);
  document.body.append(dialog);
  dialog.showModal();
  close.focus();
}

function buildCalculatorConsultation(identity, row, scenario, returnReview) {
  const content = document.createElement('div');
  content.className = 'order-review-form';
  let submitted = null;
  try {
    submitted = JSON.parse(localStorage.getItem(calculatorSubmittedKey(row)));
  } catch (_) {}
  submitted ||= {
    differ_price: '100.00',
    differ_data: [{title: '边框差异', remark: '实物边框有磕碰，报价时的质检报告未记录',
      images: [{type: 'image', url: '../资源/待审核售后-凭证截图.png'}]}]
  };
  function section(title) {
    const group = document.createElement('section');
    group.className = 'consultation-review-section';
    const heading = document.createElement('h3');
    heading.textContent = title;
    content.append(heading, group);
    return group;
  }
  function field(group, title, value, multiline = false) {
    const label = document.createElement('label');
    label.className = 'order-review-field';
    const control = document.createElement(multiline ? 'textarea' : 'input');
    if (multiline) control.rows = 2;
    control.readOnly = true;
    control.value = value;
    label.append(document.createTextNode(title), control);
    group.append(label);
  }
  function reviewSummary(entries, className) {
    const list = document.createElement('dl');
    list.className = className;
    for (const [name, value] of entries) {
      const pair = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = name;
      description.textContent = value;
      if (name === '处理结果' || name === '协商金额') description.classList.add('calculator-review-highlight');
      pair.append(term, description);
      list.append(pair);
    }
    return list;
  }
  function renderReturnRecipient(group) {
    const card = document.createElement('div');
    card.className = 'calculator-return-recipient';
    const title = document.createElement('h4');
    title.textContent = '退货收件信息';
    card.append(title, reviewSummary([
      ['收货人', '演示收货人'],
      ['联系电话', '138****0000'],
      ['退货地址', '广东省深圳市南山区演示收货地址']
    ], 'calculator-return-recipient-details'));
    group.append(card);
  }
  if (scenario === 'consultation') {
    const group = section('小算盘协商信息');
    group.append(reviewSummary([
      ['处理结果', '协商（待协商）'],
      ['协商金额', '￥80.00'],
      ['协商备注', '实物存在边框磕碰，建议补差 ￥80.00。']
    ], 'calculator-review-summary'));
  } else if (scenario === 'return-decision') {
    const group = section('小算盘退货申请');
    group.append(reviewSummary([['处理结果', '退货（发起退货申请）'], ['申请说明', '客户申请退回设备。']], 'calculator-review-summary'));
    renderReturnRecipient(group);
  } else if (scenario === 'return-shipment') {
    const group = section('小算盘退货地址');
    group.append(reviewSummary([['处理结果', '退货（寄回机器）']], 'calculator-review-summary'));
    renderReturnRecipient(group);
  } else {
    const group = section('小算盘驳回信息');
    group.append(reviewSummary([
      ['处理结果', '驳回（已驳回）'],
      ['驳回原因', '报价时的质检报告已记录该划痕。']
    ], 'calculator-review-summary'));
  }
  section('追责单基础信息').append(identity);
  const previous = section('我方推送小算盘的申诉差异信息');
  field(previous, '申请追差金额', submitted.differ_price);
  for (const item of submitted.differ_data) {
    field(previous, '标题', item.title);
    field(previous, '描述', item.remark, true);
    const label = document.createElement('p');
    label.textContent = '凭证';
    const gallery = document.createElement('div');
    gallery.className = 'consultation-evidence';
    for (const [index, evidence] of item.images.entries()) {
      const isVideo = evidence.type === 'video';
      const title = (isVideo ? '视频' : '图片') + '凭证 ' + (index + 1);
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.setAttribute('aria-label', '预览' + title);
      const media = document.createElement(isVideo ? 'video' : 'img');
      if (isVideo) {
        media.preload = 'metadata';
        media.muted = true;
        media.playsInline = true;
      } else {
        media.alt = title;
        media.loading = 'lazy';
      }
      const badge = document.createElement('span');
      badge.textContent = isVideo ? '▶ 视频' : '图片';
      media.addEventListener('error', () => {
        media.hidden = true;
        badge.textContent = isVideo ? '视频预览不可用' : '图片加载失败';
      });
      tile.append(media, badge);
      media.src = evidence.url;
      tile.onclick = () => {
        if (isVideo) openConsultationVideo(evidence.url, title, tile);
        else openPrototypeImageViewer({src: evidence.url, title, trigger: tile});
      };
      gallery.append(tile);
    }
    previous.append(label, gallery);
  }
  if (returnReview) {
    const form = buildCalculatorPushForm(row, submitted);
    const editor = form.element;
    editor.hidden = scenario !== 'rejection';
    const readOnlyFields = [...previous.children];
    previous.append(editor);
    if (scenario === 'rejection') {
      for (const field of readOnlyFields) field.hidden = true;
    }
    returnReview.enable = () => {
      content.querySelector('.calculator-review-highlight').textContent = scenario === 'consultation' ? '协商（我方不同意协商）' : '退货（我方不同意退货）';
      for (const field of readOnlyFields) field.hidden = true;
      editor.hidden = false;
    };
    returnReview.submit = api => {
      if (!form.validate(api)) return false;
      const payload = form.payload();
      try { localStorage.setItem(calculatorSubmittedKey(row), JSON.stringify(payload)); } catch (_) {
        api.setMessage('无法保存重新推送的信息，请重试');
        return false;
      }
      return true;
    };
  }

  return content;
}

function calculatorSubmittedKey(row) {
  return 'prototype:orders:v1.3:single-push:' + row['订单号'] + ':xiaosuanpan:submitted';
}


function openOrderReview(row) {
  const key = 'prototype:orders:v1.3:review:' + row['订单号'];
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

  const panels = document.createElement('div');
  const names = ['闲鱼复核', '小算盘协商', '小算盘退货', '小算盘驳回'];
  const consultationReview = {};
  const rejectionReview = {};
  let consultationDeclined = false;
  const scenarioPanels = {
    '闲鱼复核': content,
    '小算盘协商': buildCalculatorConsultation(identity.cloneNode(true), row, 'consultation', consultationReview),
    '小算盘驳回': buildCalculatorConsultation(identity.cloneNode(true), row, 'rejection', rejectionReview)
  };
  const returnPanel = document.createElement('div');
  const returnStages = document.createElement('div');
  returnStages.className = 'calculator-return-stages';
  const returnReview = {};
  let returnDeclined = false;
  const decision = buildCalculatorConsultation(identity.cloneNode(true), row, 'return-decision', returnReview);
  const shipment = buildCalculatorConsultation(identity.cloneNode(true), row, 'return-shipment');
  returnPanel.append(decision, shipment);
  scenarioPanels['小算盘退货'] = returnPanel;
  panels.append(...Object.values(scenarioPanels));
  let scenario = names[0];
  let shipping = false;
  const modal = openPrototypeModal({title: '复核', content: panels, width: 900,
    confirmText: '重新推送', cancelText: '不追责',
    onConfirm(api) {
      if (scenario === '小算盘协商' && consultationDeclined) return consultationReview.submit(api);
      if (scenario === '小算盘退货' && !shipping && returnDeclined) return returnReview.submit(api);
      if (scenario === '小算盘协商' || (scenario === '小算盘退货' && !shipping)) {
        return validateReviewInput(remark, '请输入处理备注');
      }
      if (scenario === '小算盘退货') return validateReviewInput(tracking, '请输入快递单号');
      if (scenario === '小算盘驳回') return rejectionReview.submit(api);
      for (const [name, control] of controls) {
        if (control.checkValidity()) continue;
        api.setMessage('请填写有效的' + name);
        control.reportValidity();
        return false;
      }
      return true;
    },
    onClose(reason) {
      if (reason === 'confirm' && scenario === '小算盘协商') showPrototypeMessage(consultationDeclined ? '重新推送成功（模拟）' : '已同意协商（模拟）');
      else if (reason === 'confirm' && scenario === '小算盘退货') showPrototypeMessage(shipping ? '已提交快递单号（模拟）' : returnDeclined ? '重新推送成功（模拟）' : '已同意退货（模拟）');
      else if (reason === 'confirm') finishReview('重新推送成功（模拟）');
      if (reason === 'no-accountability') openNoAccountabilityRemark(finishReview);
    }
  });
  modal.element.classList.add('order-review-modal');
  const confirm = modal.element.querySelector('.prototype-modal-footer .green');
  const cancel = modal.element.querySelector('.prototype-modal-footer .gray');
  const remarkField = document.createElement('label');
  remarkField.className = 'consultation-review-remark';
  remarkField.hidden = true;
  const remarkCaption = document.createElement('span');
  remarkCaption.textContent = '备注';
  const remark = document.createElement('input');
  remark.type = 'text';
  remark.name = 'remark';
  remark.required = true;
  remark.placeholder = '请输入协商处理备注';
  remarkField.append(remarkCaption, remark);
  confirm.before(remarkField);

  const trackingField = remarkField.cloneNode(true);
  trackingField.querySelector('span').textContent = '快递单号';
  const tracking = trackingField.querySelector('input');
  tracking.name = 'back_tracking_no';
  tracking.placeholder = '请输入京东或顺丰快递单号';
  tracking.value = '';
  confirm.before(trackingField);

  function validateReviewInput(input, message) {
    if (input.value.trim()) return true;
    input.setCustomValidity(message);
    input.focus();
    input.reportValidity();
    return false;
  }
  for (const input of [remark, tracking]) {
    input.addEventListener('input', () => input.setCustomValidity(''));
  }
  cancel.onclick = () => modal.close('no-accountability');

  const decline = document.createElement('button');
  decline.type = 'button';
  decline.className = 'gray';
  decline.textContent = '不同意';
  cancel.before(decline);
  decline.onclick = () => {
    if (!validateReviewInput(remark, '请输入处理备注')) return;
    if (scenario === '小算盘协商' && !consultationDeclined) {
      consultationDeclined = true;
      consultationReview.enable();
    } else if (scenario === '小算盘退货' && !shipping && !returnDeclined) {
      returnDeclined = true;
      returnReview.enable();
    } else return;
    updateScenario();
    confirm.focus({preventScroll: true});
  };
  const switcher = document.createElement('div');
  switcher.className = 'single-push-switcher';
  switcher.setAttribute('aria-label', '切换复核场景');
  const panel = document.createElement('div');
  panel.className = 'single-push-panel';
  while (modal.element.firstChild) panel.append(modal.element.firstChild);
  modal.element.classList.add('single-push-modal', 'consultation-review-modal');
  modal.element.append(switcher, returnStages, panel);
  function selectButton(container, name, run) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = name;
    button.onclick = run;
    container.append(button);
    return button;
  }
  const tabs = names.map(name => selectButton(switcher, name, () => {
    scenario = name;
    updateScenario();
  }));
  const stages = ['是否同意退货', '填写快递单号'].map((name, index) => selectButton(returnStages, name, () => {
    shipping = index === 1;
    updateScenario();
  }));
  function updateScenario() {
    const returning = scenario === '小算盘退货';
    returnStages.hidden = !returning;
    const deciding = (scenario === '小算盘协商' && !consultationDeclined) || (returning && !shipping && !returnDeclined);
    for (const [name, view] of Object.entries(scenarioPanels)) view.hidden = scenario !== name;
    decision.hidden = shipping;
    shipment.hidden = !shipping;
    remarkField.hidden = !deciding;
    trackingField.hidden = !(returning && shipping);
    decline.hidden = !deciding;
    cancel.hidden = deciding || (returning && shipping);
    remark.placeholder = returning ? '请输入退货处理备注' : '请输入协商处理备注';
    remark.setCustomValidity('');
    confirm.textContent = deciding ? '同意' : returning && shipping ? '已发货' : '重新推送';
    cancel.textContent = '不追责';
    for (const [buttons, active] of [[tabs, names.indexOf(scenario)], [stages, Number(shipping)]]) {
      buttons.forEach((button, index) => {
        button.className = index === active ? '' : 'white';
        button.setAttribute('aria-pressed', String(index === active));
      });
    }
    modal.setMessage('');
    panel.querySelector('.prototype-modal-body').scrollTop = 0;
  }
  updateScenario();

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

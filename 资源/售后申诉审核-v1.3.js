/* 仅供 V1.2 售后工单本地演示，不调用业务接口。 */
window.openAfterSalesInspection = function(record, trigger) {
  const slots = record.barcode === 'TCB2026110650170-410' ? ['', '-2'] : [''];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const field = (label, value) => `<div class="appeal-detail"><span>${label}</span><strong>${escape(value) || '—'}</strong></div>`;
  const section = title => `<h3 class="appeal-section">${title}</h3>`;
  const pending = text => showPrototypeMessage(text + '的真实规则待核对。', 'warning');
  const content = document.createElement('form');
  content.className = 'appeal-form';
  content.innerHTML = `
    ${section('门店信息')}
    <div class="appeal-details">${field('门店名称', '演示门店')}${field('店员姓名', '演示店员')}${field('订单标签', 'FOG可售后')}${field('店员电话', '138****6096')}
      <button type="button" class="appeal-risk" data-pending="卖家标签">风险卖家</button><button type="button" class="appeal-outline" data-pending="门店标签">＋标签</button>
      <span>竞价详情：</span><button type="button" class="appeal-link" data-pending="竞价详情">点击查看详情</button>${field('渠道类型', record.channel)}</div>
    <div class="appeal-details"><span>回收订单：</span><button type="button" class="appeal-link" data-pending="回收单详情">查看回收单详情</button></div>
    ${section('申诉客户信息')}
    <div class="appeal-details">${field('客户', record.buyer)}${field('顾客名称', record.customer)}${field('手机号码', record.phone)}${field('买家省份', '广东省')}${field('客户经理', '演示经理')}<button type="button" class="appeal-risk" data-pending="买家标签">风险买家</button><button type="button" class="appeal-outline" data-pending="客户标签">＋标签</button></div>
    <div class="appeal-details">${field('客户描述', '')}${field('买家标签', '')}</div>
    <div class="appeal-details"><label for="appeal-internal">内部备注</label><textarea id="appeal-internal" placeholder="请输入内容"></textarea><button type="button" data-pending="编辑内部备注">编辑备注</button></div>
    <h3 class="appeal-metric-title">⌁ 买家指标信息</h3><p class="appeal-period">数据周期：2026-10-11 至 2026-11-10　　统计日：2026-11-17</p>
    <div class="appeal-cards"><div><span>买家名称</span><strong>${escape(record.buyer) || '演示买家'}</strong><small>客户 ID：演示数据</small></div><div><span>成交量</span><strong>74</strong><small>条码数量</small></div><div><span>成交额 / 均价</span><strong>106370.00 元 / 1437.43 元</strong><small>元</small></div><div><span>买家类型</span><strong>普通买家</strong></div></div>
    <div class="appeal-metrics"><h4>经营质量</h4><table><tbody>
    ${[['销售金额','15885.00 元','买家毛利','1732.43 元'],['买家毛利率','10.91%','买家售后数','28'],['买家售后率','37.84%','买家售后成本','23.00 元'],['售后成本率','0.14%','竞价平台销售税','345.46 元'],['平台销售税成本率','2.17%','去税毛利','1386.97 元'],['去税毛利率','8.73%','','']].map(row => `<tr>${row.map((v,i) => `<${i%2 ? 'td' : 'th'}>${v}</${i%2 ? 'td' : 'th'}>`).join('')}</tr>`).join('')}
    </tbody></table><h4>评估结论</h4><div class="appeal-cards">${[['成交贡献','不满足'],['毛利贡献','满足'],['售后优质买家','不满足'],['建议处理导向','谨慎合作']].map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div></div>
    ${section('申诉机器信息')}<div class="appeal-table-scroll"><table class="appeal-machine"><thead><tr>${['条码','实物码','是否有配件','配件名称/数量','品牌','机型','IMEI','销售出库金额','检测等级','回收价','中标时间','标签信息','实时竞拍标签'].map(v=>`<th>${v}</th>`).join('')}</tr></thead><tbody><tr>${[record.barcode,record.physicalCode,'否','',record.model?.includes('iPhone') ? '苹果' : '',record.model,record.imei,record.salesAmount,'A3+','2584','—','演示标签','FOG可售后'].map(v=>`<td>${escape(v)}</td>`).join('')}</tr></tbody></table></div>
    <div class="appeal-section appeal-claim-heading"><h3>申诉信息</h3><div class="appeal-claim-references">${field('源单号/第三方单号',record.thirdOrder)}${field('三方原始单号',record.thirdOriginalOrder)}${field('售后单号',record.afterOrder)}</div></div><div class="appeal-claim">${field('销售平台',record.platform)}${field('售后原因','5天收货3天验货')}${field('出库时间',record.outboundTime)}${field('收货时间',record.receivedAt)}${field('销售金额',record.salesAmount)}${field('期望补差金额',record.expectedReturn)}${field('自动检测项','')}${field('售后类型(补差)','期望补差金额' + record.expectedReturn)}${field('申述项','外观划痕或轻微磕碰,外观有磕碰或掉漆')}${field('申诉内容','外观划痕')}</div>
    <div class="appeal-media-tabs" role="tablist">${['申诉视频','申诉照片','正面照片','背面照片','开箱视频','质检视频','验机差异项','闪回快递拆包视频'].map((v,i)=>`<button type="button" role="tab" aria-selected="${i===0}">${v}</button>`).join('')}</div><div class="appeal-media-empty">暂无申诉视频</div>
    <div class="appeal-table-scroll"><table><thead><tr>${['操作时间','操作人','新状态','旧状态','备注','原因'].map(v=>`<th>${v}</th>`).join('')}</tr></thead><tbody><tr><td>${escape(record.receivedAt)}</td><td>演示用户</td><td>${escape(record.status)}</td><td></td><td>您的售后申请已提交检测审核，24h内出结果</td><td>外观划痕</td></tr></tbody></table></div>
    ${section('审核人员PJT价格截图上传')}
    <div class="appeal-pjt"><div class="appeal-pjt-fields">
      ${slots.map(slot => `<div class="appeal-form-row"><span>截图${slot ? '二' : '一'}</span><div class="appeal-upload-group"><div id="appeal-pjt-preview${slot}" class="appeal-previews"></div><button type="button" class="appeal-outline" id="appeal-pjt-upload${slot}" aria-expanded="false" aria-controls="appeal-upload-options"><span>上传截图</span> ▾</button><input hidden id="appeal-pjt-file${slot}" type="file" accept="image/*"><div id="appeal-paste${slot}" class="appeal-paste" tabindex="0" role="textbox" aria-label="粘贴PJT截图">可点击后直接粘贴图片</div><button type="button" class="appeal-link" id="appeal-pjt-ocr${slot}" disabled>OCR识别</button><div id="appeal-pjt-ocr-status${slot}" role="status"></div></div></div>`).join('')}
      <div id="appeal-upload-options" class="appeal-upload-options" popover="auto"><button type="button" id="appeal-desktop-upload">从电脑上传</button><button type="button" id="appeal-mobile-upload">手机扫码上传</button></div>
      <div class="appeal-form-row"><label for="appeal-amount">预估补差金额</label><div><input id="appeal-amount" type="number" min="0" step="0.01" aria-label="预估补差金额"> 元 <button type="button" class="appeal-link" id="appeal-clear">清空</button></div></div>
      <div class="appeal-form-row"><label for="appeal-pjt-saver">最后保存人</label><output id="appeal-pjt-saver" aria-live="polite"></output></div>
      <div class="appeal-form-row"><span></span><div><button type="button" id="appeal-save">保存PJT信息</button><span id="appeal-save-status" role="status"></span></div></div>
    </div>
      <div id="appeal-mobile-panel" class="appeal-mobile-panel" hidden>
        <div class="appeal-mobile-code">
          <img id="appeal-mobile-qr" width="176" height="176" alt="PJT 手机上传二维码" hidden>
          <div id="appeal-mobile-expired" class="appeal-mobile-expired" hidden><button type="button" id="appeal-mobile-refresh">刷新</button></div>
        </div>
        <div id="appeal-mobile-countdown" hidden>请用微信扫码上传截图，<br>二维码失效倒计时：<span></span></div>
        <div id="appeal-mobile-status" role="status"></div>
        <button type="button" class="appeal-link" id="appeal-mobile-preview">演示手机扫码跳转到H5页面</button>
      </div>
    </div>
    ${section('申诉初测')}<div class="appeal-form-row"><span><em>*</em> 初检结果</span><div class="appeal-radios">${['通过','驳回','协助补差'].map(v=>`<label><input type="radio" name="inspectionResult" value="${v}" required> ${v}</label>`).join('')}</div></div>
    <div class="appeal-form-row appeal-attachment-row"><span>附件</span><div><button type="button" class="appeal-outline" id="appeal-attachment-upload">拍摄上传</button><input hidden id="appeal-attachment-file" type="file" accept="image/*" multiple><div id="appeal-attachments" class="appeal-previews"></div></div></div>
    <div class="appeal-form-row"><label for="appeal-note">初审备注</label><textarea id="appeal-note" aria-label="初审备注"></textarea></div>
    <div class="appeal-footer"><button type="button" class="appeal-transfer" data-pending="转寄机">转寄机</button><button type="button" id="appeal-cancel">取消</button><button type="submit" class="appeal-submit">提交</button></div>`;
  showPrototypeDialog('售后申诉审核', content);
  const dialog = document.getElementById('prototype-dialog');
  dialog.classList.add('after-sales-appeal-dialog');
  dialog.scrollTop = 0;
  const close = dialog.querySelector('.dialog-head button');
  close.textContent = '×'; close.setAttribute('aria-label','关闭售后申诉审核');
  dialog.addEventListener('close', () => { dialog.classList.remove('after-sales-appeal-dialog'); trigger?.focus(); }, {once:true});
  const get = id => content.querySelector('#' + id);
  content.querySelectorAll('[data-pending]').forEach(button => button.onclick = () => pending(button.dataset.pending));
  get('appeal-cancel').onclick = () => dialog.close();
  get('appeal-clear').onclick = () => { get('appeal-amount').value = ''; get('appeal-save-status').textContent = ''; };
  const saver = get('appeal-pjt-saver');
  const saverKey = 'pjt-last-saver-v1.3:' + JSON.stringify([record.afterOrder, record.barcode]);
  saver.textContent = record.pjtLastSaver || '';
  try {
    saver.textContent = localStorage.getItem(saverKey) ?? saver.textContent;
  } catch {}
  function savePjtUser() {
    const user = '演示用户';
    record.pjtLastSaver = saver.textContent = user;
    try {
      localStorage.setItem(saverKey, user);
    } catch {}
  }
  get('appeal-save').onclick = () => {
    if (!get('appeal-amount').reportValidity()) return;
    savePjtUser();
    get('appeal-save-status').textContent = '已暂存本次弹窗的PJT信息（模拟）';
  };
  const revisions = new Map();
  const timers = new Map();
  const recognized = new Set();
  const amountInput = get('appeal-amount');
  function recognizePjt(slot, amount = '') {
    const button = get('appeal-pjt-ocr' + slot);
    const status = get('appeal-pjt-ocr-status' + slot);
    clearTimeout(timers.get(slot));
    recognized.delete(slot);
    if (slots.length === 2) amountInput.value = '';
    button.disabled = true;
    status.textContent = 'OCR识别中…';
    timers.set(slot, setTimeout(() => {
      recognized.add(slot);
      status.textContent = 'OCR已识别 · 识别金额 100.99 元';
      button.textContent = '重新识别';
      button.disabled = false;
      if (recognized.size === slots.length && (amount || !amountInput.value)) amountInput.value = amount || '20.00';
      get('appeal-save-status').textContent = '';
    }, 1000));
  }
  for (const slot of slots) get('appeal-pjt-ocr' + slot).onclick = () => recognizePjt(slot);
  dialog.addEventListener('close', () => timers.forEach(timer => clearTimeout(timer)), {once:true});

  function addImage(file, target, replace, amount = '', slot = '') {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) { showPrototypeMessage('演示图片请小于10MB。','warning'); return; }
    const revision = (revisions.get(slot) || 0) + 1;
    if (replace) revisions.set(slot, revision);
    const reader = new FileReader();
    reader.onload = () => {
      if (!dialog.open || (replace && revision !== revisions.get(slot))) return;
      if (replace) target.replaceChildren();
      const tile = document.createElement('div'); tile.className = 'appeal-image';
      const image = document.createElement('img'); image.src = reader.result; image.alt = '用户上传图片';
      const view = document.createElement('button'); view.type = 'button'; view.className = 'appeal-image-view'; view.setAttribute('aria-label','放大上传图片'); view.append(image);
      view.onclick = () => openPrototypeImageViewer({src:image.src,alt:image.alt,trigger:view});
      const remove = document.createElement('button'); remove.type='button'; remove.className='appeal-image-remove'; remove.textContent='×'; remove.setAttribute('aria-label','删除上传图片'); remove.onclick = () => {
        tile.remove();
        if (!replace) return;
        revisions.set(slot, (revisions.get(slot) || 0) + 1);
        clearTimeout(timers.get(slot));
        recognized.delete(slot);
        if (slots.length === 2) amountInput.value = '';
        get('appeal-pjt-ocr-status' + slot).textContent = '';
        const button = get('appeal-pjt-ocr' + slot);
        button.textContent = 'OCR识别';
        button.disabled = true;
        get('appeal-pjt-upload' + slot).firstElementChild.textContent = '上传截图';
        get('appeal-save-status').textContent = '';
      };
      tile.append(view,remove); target.append(tile);
      if (replace) {
        get('appeal-pjt-upload' + slot).firstElementChild.textContent = '替换截图';
        recognizePjt(slot, amount);
      }
      get('appeal-save-status').textContent='';
    }; reader.readAsDataURL(file);
  }

  const mobilePanel = get('appeal-mobile-panel');
  const mobileStatus = get('appeal-mobile-status');
  const mobileQr = get('appeal-mobile-qr');
  const bridge = 'http://127.0.0.1:4176';
  const countdown = get('appeal-mobile-countdown');
  const expired = get('appeal-mobile-expired');
  const validity = 10 * 60 * 1000;
  let mobileRequest;
  let countdownTimer;
  function expireMobileCode() {
    stopMobileUpload();
    countdown.lastElementChild.textContent = '00:00';
    expired.hidden = false;
  }
  function startCountdown(deadline) {
    clearInterval(countdownTimer);
    function tick() {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      countdown.lastElementChild.textContent = [Math.floor(seconds / 60), seconds % 60]
        .map(value => String(value).padStart(2, '0')).join(':');
      if (!seconds) expireMobileCode();
    }
    countdownTimer = setInterval(tick, 250);
    tick();
  }
  function stopMobileUpload() {
    clearInterval(countdownTimer);
    if (!mobileRequest) return;
    mobileRequest.abort();
    mobileRequest = undefined;
  }
  const previewButton = get('appeal-mobile-preview');
  let previewWindow;
  function receiveMobileImage(images, amount) {
    savePjtUser();
    slots.forEach((slot, index) => addImage(images[index], get('appeal-pjt-preview' + slot), true, amount, slot));
    openMobileUpload();
  }
  previewButton.onclick = () => {
    previewWindow = window.open('./PJT手机上传-v1.3.html?preview=1&count=' + slots.length, '_blank');
  };
  function receivePreview(event) {
    if (!dialog.open || event.source !== previewWindow || event.data?.type !== 'pjt-preview-submit') return;
    const {images, amount} = event.data;
    if (!Array.isArray(images) || images.length !== slots.length || images.some(image => !(image instanceof Blob) || !image.type.startsWith('image/') || image.size > 10 * 1024 * 1024)) return;
    receiveMobileImage(images, typeof amount === 'string' ? amount : '');
    event.source.postMessage({type:'pjt-preview-received'}, '*');
    previewWindow = undefined;
  }
  window.addEventListener('message', receivePreview);
  dialog.addEventListener('close', () => {
    stopMobileUpload();
    window.removeEventListener('message', receivePreview);
  }, {once:true});
  async function openMobileUpload() {
    stopMobileUpload();
    expired.hidden = true;
    countdown.hidden = false;
    startCountdown(Date.now() + validity);
    const request = new AbortController();
    const {signal} = request;
    const requestedAt = Date.now();
    mobileRequest = request;
    mobilePanel.hidden = false;
    mobileQr.src = slots.length === 2 ? '../资源/PJT手机上传双截图二维码-v1.3.svg' : '../资源/PJT手机上传二维码-v1.3.svg';
    mobileQr.hidden = false;
    mobileStatus.textContent = '';
    let receiver;
    try {
      const response = await fetch(bridge + '/session?count=' + slots.length, {method:'POST', signal});
      if (!response.ok) throw new Error();
      const session = await response.json();
      receiver = bridge + '/receive?session=' + encodeURIComponent(session.id);
      if (signal.aborted) return;
      mobileQr.src = 'data:image/svg+xml;base64,' + session.qr;
      mobileQr.hidden = false;
      mobileStatus.textContent = '';
      startCountdown(requestedAt + validity);
      while (!signal.aborted) {
        const result = await fetch(receiver, {signal});
        if (result.status === 200) {
          const images = [await result.blob()];
          if (slots.length === 2) {
            const second = await fetch(receiver + '&slot=2', {signal});
            if (second.status !== 200) throw new Error('Missing second screenshot');
            images.push(await second.blob());
          }
          if (signal.aborted) return;
          receiveMobileImage(images, result.headers.get('X-PJT-Amount'));
          break;
        }
        if (result.status === 410) {
          expireMobileCode();
          break;
        }
        if (result.status !== 204) throw new Error();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch {
      if (!signal.aborted && receiver) {
        mobileStatus.textContent = '连接已中断，请刷新二维码。';
        expireMobileCode();
      }
    } finally {
      if (receiver) fetch(receiver, {method:'DELETE'}).catch(() => {});
      if (mobileRequest === request) {
        mobileRequest = undefined;
      }
    }
  }
  get('appeal-mobile-refresh').onclick = openMobileUpload;
  get('appeal-mobile-upload').onclick = () => {
    get('appeal-upload-options').hidePopover();
    if (mobilePanel.hidden || countdown.hidden || !expired.hidden) openMobileUpload();
  };
  const triggers = slots.map(slot => get('appeal-pjt-upload' + slot));
  let uploadTrigger = triggers[0];
  const uploadOptions = get('appeal-upload-options');
  let closeUploadOptions;
  function showUploadOptions(trigger = uploadTrigger) {
    clearTimeout(closeUploadOptions);
    if (uploadOptions.matches(':popover-open') && trigger === uploadTrigger) return;
    uploadTrigger.setAttribute('aria-expanded', 'false');
    uploadOptions.hidePopover();
    uploadTrigger = trigger;
    uploadOptions.showPopover({source: uploadTrigger});
    const anchor = uploadTrigger.getBoundingClientRect();
    const menu = uploadOptions.getBoundingClientRect();
    uploadOptions.style.left = Math.max(0, Math.min(anchor.left, innerWidth - menu.width)) + 'px';
    uploadOptions.style.top = (anchor.bottom + menu.height <= innerHeight ? anchor.bottom : Math.max(0, anchor.top - menu.height)) + 'px';
  }
  for (const element of [...triggers, uploadOptions]) {
    element.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') showUploadOptions(element === uploadOptions ? uploadTrigger : element);
    });
    element.addEventListener('pointerleave', () => {
      closeUploadOptions = setTimeout(() => {
        if (!uploadOptions.contains(document.activeElement)) uploadOptions.hidePopover();
      }, 180);
    });
  }
  for (const trigger of triggers) trigger.onclick = () => {
    showUploadOptions(trigger);
    uploadOptions.querySelector('button').focus();
  };
  uploadOptions.addEventListener('toggle', event => {
    uploadTrigger.setAttribute('aria-expanded', String(event.newState === 'open'));
  });
  const dismissUploadOptions = () => uploadOptions.hidePopover();
  dialog.addEventListener('scroll', dismissUploadOptions, true);
  dialog.addEventListener('close', () => {
    clearTimeout(closeUploadOptions);
    dismissUploadOptions();
    dialog.removeEventListener('scroll', dismissUploadOptions, true);
  }, {once:true});
  get('appeal-desktop-upload').onclick = () => {
    uploadOptions.hidePopover();
    get('appeal-pjt-file' + slots[triggers.indexOf(uploadTrigger)]).click();
  };
  for (const slot of slots) {
    const target = get('appeal-pjt-preview' + slot);
    get('appeal-pjt-file' + slot).onchange = event => {
      addImage(event.target.files[0], target, true, '', slot);
      event.target.value = '';
    };
    get('appeal-paste' + slot).onpaste = event => {
      const file = Array.from(event.clipboardData.items).find(item => item.type.startsWith('image/'))?.getAsFile();
      if (!file) return;
      event.preventDefault();
      addImage(file, target, true, '', slot);
    };
  }
  get('appeal-attachment-upload').onclick=()=>get('appeal-attachment-file').click();
  get('appeal-attachment-file').onchange=event=>{Array.from(event.target.files).forEach(file=>addImage(file,get('appeal-attachments'),false));event.target.value='';};
  get('appeal-amount').oninput=()=>get('appeal-save-status').textContent='';
  content.querySelectorAll('[role="tab"]').forEach(tab=>tab.onclick=()=>{content.querySelectorAll('[role="tab"]').forEach(t=>t.setAttribute('aria-selected',String(t===tab)));content.querySelector('.appeal-media-empty').textContent='暂无'+tab.textContent;});
  content.onsubmit=event=>{event.preventDefault();showPrototypeMessage('初检结果已模拟提交；未调用真实接口或变更工单状态。');dialog.close();};
};

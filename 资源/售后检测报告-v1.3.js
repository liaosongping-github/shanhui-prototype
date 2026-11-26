/* 仅供 V1.2 售后工单本地演示，不调用业务接口。 */
window.openAfterSalesDetectionReport = function(record, trigger) {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const buyerStatement=record?.buyerStatement||{reason:'不同意当前补差金额，外观问题影响使用，请重新核对。',expectedAmount:300,evidence:[{src:'../资源/待审核售后-凭证截图.png',type:'image',name:'买家上传凭证（演示）'}],demo:true};
  const inspectionRows = [
    ['型号', '全网通（A2634）', '全网通（A2634）'],
    ['存储容量', '128G', '128G'],
    ['开机', '能开机', '能开机'],
    ['ID锁', '无锁或已解锁', '无锁或已解锁'],
    ['保修', '过保（保修期≤1个月）', '过保（保修期≤1个月）'],
    ['购买渠道', '国行', '国行'],
    ['中框背板', '外观细微划痕/无磕碰', '外观细微划痕/无磕碰'],
    ['摄像头镜片', '摄像头镜片正常', '摄像头镜片正常'],
    ['机身弯曲情况', '机身无弯曲', '机身无弯曲'],
    ['屏幕外观', '屏幕轻微使用痕迹', '屏幕轻微使用痕迹'],
    ['屏幕显示', '显示完美无瑕疵', '显示完美无瑕疵'],
    ['触屏失灵', '触屏正常', '触屏正常'],
    ['原装屏', '屏幕无维修', '屏幕无维修'],
    ['通话', '正常通话', '正常通话'],
    ['WIFI/蓝牙', 'WIFI/蓝牙正常', 'WIFI/蓝牙正常'],
    ['拆卸或故障', '无拆修无故障', '无拆修无故障'],
    ['网络锁', '非网络锁', '非网络锁'],
    ['摄像头', '摄像头正常', '摄像头正常'],
    ['按键', '按键正常', '按键正常'],
    ['充电', '充电正常', '充电正常'],
    ['Face ID功能', 'Face ID正常', 'Face ID正常'],
    ['成色', '二手', '二手'],
    ['电池健康度', '电池健康95%-100%', '电池健康95%-100%'],
    ['进水或受潮', '无进水或受潮', '无进水或受潮'],
    ['光线/距离感应', '光线/距离感应正常', '光线/距离感应正常'],
    ['指南针功能', '指南针功能正常', '指南针功能正常'],
    ['声音功能', '声音功能正常', '声音功能正常'],
    ['NFC', 'NFC正常', 'NFC正常'],
    ['振动', '振动正常', '振动正常'],
    ['闪光灯', '闪光灯正常', '闪光灯正常'],
    ['重力感应', '重力感应正常', '重力感应正常'],
    ['商品来源', '正常零售机', '正常零售机'],
    ['颜色', '', '粉色']
  ];

  const content = document.createElement('form');
  content.className = 'detection-report-form';
  content.innerHTML = `
    <section class="buyer-statement-panel" aria-label="买家申述">
      <div class="buyer-statement-title"><strong>买家不同意我方补差金额</strong></div>
      <div class="buyer-statement-fields"><div><span>不同意原因</span><p>${escape(buyerStatement.reason||'暂无')}</p></div><div><span>期望补差金额</span><strong class="buyer-expected">${buyerStatement.expectedAmount==null?'暂无':'￥ '+escape(buyerStatement.expectedAmount)}</strong></div></div>
      <div class="buyer-evidence-label">上传凭证</div><div class="buyer-evidence-list"></div>
    </section>
    <div class="detection-report-actions">
      <button type="button" class="report-confirm">确认</button>
      <button type="button" class="report-reject">驳回</button>
    </div>
    <div class="detection-report-fields">
      <div class="report-field report-plain"><span>客户申述类型</span><strong>补差（期望补差300.00元）</strong></div>
      <div class="report-field report-plain"><span>客户申述项</span><strong>外观划痕或轻微磕碰,外观有磕碰或掉漆</strong></div>
      <label class="report-field"><span>实际原因</span><input name="actualReason" autocomplete="off" disabled></label>
      <label class="report-field"><span>原因说明</span><input name="reasonDescription" autocomplete="off" disabled></label>
      <div class="report-field report-plain"><span>销售平台</span><strong>实时竞拍6.0</strong></div>
      <div class="report-field report-plain"><span>售后原因</span><strong></strong></div>
      <label class="report-field report-claim-content"><span>申诉内容</span><textarea name="claimContent" rows="2">外观划痕</textarea></label>
      <label class="report-field"><span>售后方式</span><select name="afterSalesMethod"><option selected>调价</option><option>退货</option><option>换货</option></select></label>
      <div class="report-field report-plain"><span>检测差价</span><strong>248 元</strong></div>
      <label class="report-field report-with-unit"><span>调价金额</span><span><input name="adjustAmount" type="number" min="0" step="0.01" value="100"><em>元</em></span></label>
      <label class="report-field"><span>快递单号</span><input name="expressNo" autocomplete="off" disabled></label>
      <label class="report-field"><span>已补运费金额</span><input name="compensatedFreight" value="0" disabled></label>
      <label class="report-field"><span>待审批运费金额</span><input name="pendingFreight" value="0" disabled></label>
      <label class="report-field report-date"><span>收货日期</span><input name="receiptDate" type="date" disabled></label>
      <div class="report-field report-plain report-detail-link"><span>竞价详情</span><button type="button" class="report-link" data-pending="竞价详情">点击查看详情</button></div>
    </div>    <h3 class="detection-report-section">售后机器检测报告</h3>
    <div class="detection-report-table-wrap">
      <table class="detection-report-table">
        <thead><tr><th>选项名称</th><th>上次检测</th><th>总部修改</th></tr></thead>
        <tbody>${inspectionRows.map(([name, previous, current], index) => `<tr><td>${escape(name)}</td><td>${escape(previous)}</td><td><input aria-label="${escape(name)}总部修改" value="${escape(current)}" class="${name === '颜色' ? 'is-accent' : ''}"></td></tr>`).join('')}</tbody>
      </table>
    </div>`;

  const statementPanel=content.querySelector('.buyer-statement-panel');
  const expectedField=content.querySelector('.buyer-statement-fields>div:last-child');expectedField.className='buyer-statement-amount';statementPanel.append(expectedField,content.querySelector('.detection-report-actions'));
  const adjustment=content.querySelector('[name=adjustAmount]').closest('label');adjustment.classList.add('buyer-adjustment');content.querySelector('.detection-report-actions').prepend(adjustment);
  for(const item of buyerStatement.evidence||[]){const allowed=/^(?:\.\.\/资源\/|blob:|data:image\/|data:video\/)/.test(item.src||'');if(!allowed)continue;const host=content.querySelector('.buyer-evidence-list');if(item.type==='video'){const video=document.createElement('video');video.controls=true;video.preload='metadata';video.src=item.src;video.setAttribute('aria-label',item.name||'买家凭证视频');host.append(video);}else{const button=document.createElement('button');button.type='button';button.className='buyer-evidence-image';const img=document.createElement('img');img.src=item.src;img.alt=item.name||'买家凭证';button.append(img);button.onclick=()=>{if(window.openPrototypeImageViewer)window.openPrototypeImageViewer({src:item.src,title:img.alt,alt:img.alt,trigger:button});else window.open(item.src,'_blank');};host.append(button);}}
  if(!content.querySelector('.buyer-evidence-list').children.length)content.querySelector('.buyer-evidence-list').textContent='暂无凭证';
  showPrototypeDialog('检测报告', content);
  const dialog = document.getElementById('prototype-dialog');
  dialog.classList.add('after-sales-detection-report-dialog');
  document.documentElement.classList.add('detection-report-open');
  dialog.scrollTop = 0;
  const close = dialog.querySelector('.dialog-head button');
  close.textContent = '×';
  close.setAttribute('aria-label', '关闭检测报告');
  dialog.addEventListener('close', () => {
    dialog.classList.remove('after-sales-detection-report-dialog');
    document.documentElement.classList.remove('detection-report-open');
    trigger?.focus();
  }, {once: true});

  content.querySelectorAll('[data-pending]').forEach(button => {
    button.onclick = () => showPrototypeMessage('“' + button.dataset.pending + '”的详情规则待核对。', 'warning');
  });
  content.querySelector('.report-confirm').onclick = () => {
    showPrototypeMessage('检测报告已模拟确认；未调用真实接口或变更工单状态。');
    dialog.close();
  };
  content.querySelector('.report-reject').onclick = () => {
    showPrototypeMessage('检测报告已模拟驳回；驳回原因和后续流转规则待核对。', 'warning');
    dialog.close();
  };
  content.onsubmit = event => event.preventDefault();
};

// 仅复刻用户截图可见内容；缺失业务规则及折叠内容不推断。
function openOrderDetails(row, {onPush, showPush = true, showAccountability = true} = {}) {
  const opener = document.activeElement;
  const dialog = document.createElement('dialog'); dialog.className = 'order-detail';
  dialog.setAttribute('aria-label','订单详情');
  const header = document.createElement('header'); header.className='order-detail-header';
  const title=document.createElement('h2'); title.textContent='订单详情';
  const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','关闭订单详情');
  const exit=()=>{dialog.close();dialog.remove();if(opener?.isConnected)opener.focus();};
  close.onclick=exit;dialog.addEventListener('cancel',e=>{e.preventDefault();exit();});header.append(title,close);
  const body=document.createElement('div');body.className='order-detail-content';
  function breadcrumb() {
    const line=document.createElement('div');line.className='detail-breadcrumb';line.append(document.createTextNode('商务处理 > 订单追责　'));
    const fav=document.createElement('button');fav.type='button';fav.className='detail-favorite';fav.textContent='☆ 收藏';
    fav.onclick=()=>{fav.textContent=fav.textContent==='☆ 收藏'?'★ 已收藏':'☆ 收藏';};line.append(fav);return line;
  }
  function button(name, color='white', action) {
    const b=document.createElement('button');b.type='button';b.textContent=name;b.className=color;b.onclick=action||(()=>pending(name+' / '+row['订单号']));return b;
  }
  body.append(breadcrumb());
  const actions=document.createElement('div');actions.className='detail-actions';
  if (showAccountability) actions.append(button('追责处理','outline',()=>openAccountability(row)));
  actions.append(button('追责备注',''));
  const pushCurrentOrder = showPush && onPush && (() => onPush(row, dialog));
  if (pushCurrentOrder) actions.append(button('推送', '', pushCurrentOrder));
  body.append(actions);
  const rules=document.createElement('section');rules.className='detail-rules';
  const ruleTitle=document.createElement('h3');ruleTitle.textContent='三方售后规则';rules.append(ruleTitle);
  for (const name of ['申请时间','重大差错','售后时效','售后范围']) {
    const p=document.createElement('p');p.textContent=name+'： —';
    if(name==='售后范围'){const hint=document.createElement('span');hint.className='detail-supported';hint.textContent='（支持）';p.append(hint);}
    rules.append(p);
  }
  body.append(rules,breadcrumb());
  const tools=document.createElement('div');tools.className='detail-tools';
  const primary=['推送','5.2修改退货金额','成本明细','价格追溯','控价明细','统一发货','点击解锁'];
  for(const name of [...primary,'付款特殊处理','异常订单不锁工号','店员补差','添加快递费','修改运单号','查看渠道政策','打印实物码','打印条码','AI机器人追溯','提交投诉','状态回退','退货退款(订单作废)','业务豁免选项']) {
    if (name === '推送' && !showPush) continue;
    tools.append(button(name,primary.includes(name)?'':name==='AI机器人追溯'?'green':['状态回退','退货退款(订单作废)'].includes(name)?'gray':'white', name === '推送' ? pushCurrentOrder : undefined));
  }
  body.append(tools);
  const info=document.createElement('section');info.className='detail-info';
  function group(name, columns) {
    const section=document.createElement('section');section.className='detail-info-group';
    const heading=document.createElement('div');heading.className='detail-group-name';heading.textContent=name;section.append(heading);
    const grid=document.createElement('div');grid.className='detail-info-grid';
    for(const names of columns) {
      const col=document.createElement('div');
      for(const field of names) {
        const item=document.createElement('div');item.className='detail-field';
        const label=document.createElement('span');label.textContent=field+'：';
        const value=document.createElement('span');
        const aliases={'门店名称':'门店','店员姓名':'店员','门店电话':'店员电话','订单编号':'订单号','订单条码':'条码','第三方单号':'第三方单号','订单日期':'下单时间','原IMEI':'原始IMEI号','手机型号':'机型名称','订单备注':'追责备注','成交价格':'成交价','前端检测价':'前端检测价'};
        value.textContent=row[aliases[field]||field]??'—';
        if(['审核记录','极简模式'].includes(field)){const link=button('点击查看','detail-link',()=>pending(field));value.replaceChildren(link);}
        item.append(label,value);col.append(item);
      }
      grid.append(col);
    }
    section.append(grid);info.append(section);
  }
  group('门店信息',[['门店名称'],['店员姓名'],['门店电话'],['单位'],[]]);
  group('订单信息',[
    ['ID','三方原始单号','到仓日期','顾客估价','新检测等级','IMEI','店员发货','审核记录','申诉状态','极简模式'],
    ['订单编号','订单日期','当前位置','门店估价','差错级别','原IMEI','收货单号','扩展信息','议价难度','原快递单号'],
    ['订单条码','更新日期','箱码','后端检测价','成交价格','订单备注','身份证号','销售标签','回收单类型','初始产线'],
    ['实物码','订单状态','箱名','前端检测价','回收总价','机器数量','包裹附件','平台ID','支付宝交易流水号','业务订单类型'],
    ['第三方单号','检测人员','箱内码','检测级别','手机型号','发货单号','付款状态','退款金额','线上简易估价','IMEI2']
  ]);
  group('客户信息',[['订单类型','收款方式'],['订单来源','收款账户'],['顾客姓名'],['顾客电话'],['碎屏保障服务活动抵扣券码']]);
  body.append(info);
  for (const name of ['收货仓库','图片信息','回收映射报告','新检测模板报告','线下订单需发放奖励及服务费政策（绿色为执行的政策）','5.0盈利成本政策（绿色为执行的政策）','日志信息（'+row['订单号']+'）','付款详细信息','增值业务付款详细信息','优惠券信息','特殊固定增值']) {
    const section=document.createElement('details');section.className='detail-section';
    const summary=document.createElement('summary');summary.textContent=name;
    const note=document.createElement('p');note.textContent='截图未展示本区内容，待补充现网资料。';section.append(summary,note);body.append(section);
  }
  dialog.append(header,body);document.body.append(dialog);dialog.showModal();close.focus();
}

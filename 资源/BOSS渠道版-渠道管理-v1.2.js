const channelAdminChannels=["全部渠道","线上","市场优品回收","销售渠道","演示测试","线下","总部回收","业务中心","闪赚","业务中心测试","周超测试渠道","11231","沙井西荟城专区店","白云钟落潭","香港业务","联通同步11","电信不同步","锦楷测试渠道","上海晨骏网络科技有限公司","上海嗨维网络科技有限公司","大中华","刘德华"];
(()=>{
 mountPrototypeHeader(document.querySelector('.boss-top'),{unit:'深圳闪回科技有限公司',user:'演示用户'});
 const form=document.querySelector('#channel-admin-query'),tbody=document.querySelector('#channel-admin-rows'),nodes=document.querySelector('#channel-admin-nodes');
 let activeChannel='全部渠道';
 const records=[
  {id:'1',name:'顺维修',code:'1001',customer:'客户',level:'客户',managerPhone:'13798530675',created:'2026-07-01 10:20:18',linked:'全部渠道',enabled:false,thirdPartyCode:'',topLevel:'D级',upperChannel:'线上停用',province:'广东省/深圳市/南山区',address:'科技园高新南一道中科大厦3楼15楼',street:'请选择',postalCode:'518052',thirdPartyInternal:'',channelStaff:['柜机'],warehouse:'闪回收总仓',subWarehouse:'闪回收总仓',displayRecommended:false,shortName:'顺维修微信',remark:'',managerName:'',openDate:''}
 ];
 for(const name of channelAdminChannels){const b=document.createElement('button');b.type='button';b.className='ca-tree-node'+(name==='全部渠道'?' selected':'');b.textContent=name;b.style.paddingLeft=(name==='全部渠道'?12:30)+'px';b.onclick=()=>{activeChannel=name;render();};nodes.append(b);}
 const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function filtered(){
  const q=Object.fromEntries(new FormData(form));
  return records.filter(r=>(!q.channelId||r.id===q.channelId.trim())&&(!q.channelName||r.name.includes(q.channelName.trim()))&&(!q.managerPhone||r.managerPhone.includes(q.managerPhone.trim()))&&(!q.thirdPartyCode||r.thirdPartyCode.includes(q.thirdPartyCode.trim()))&&(activeChannel==='全部渠道'||r.upperChannel===activeChannel||r.name===activeChannel));
 }
 function render(){
  const data=filtered();tbody.innerHTML='';
  if(!data.length){tbody.innerHTML='<tr><td colspan="10" class="ca-empty">暂无数据</td></tr>';}
  for(const r of data){const tr=document.createElement('tr');tr.innerHTML='<td>'+escapeHtml(r.name)+'</td><td>'+escapeHtml(r.code)+'</td><td>'+escapeHtml(r.customer)+'</td><td>'+escapeHtml(r.level)+'</td><td>'+escapeHtml(r.managerPhone)+'</td><td>'+escapeHtml(r.created)+'</td><td>'+escapeHtml(r.linked)+'</td><td>'+escapeHtml(r.enabled?'启用':'停用')+'</td><td>'+escapeHtml(r.thirdPartyCode)+'</td><td><div class="ca-row-actions"><button type="button" class="ca-plain" data-action="edit">编辑</button><button type="button" class="ca-outline" data-action="pending">渠道配置</button><button type="button" class="ca-outline" data-action="pending">商品组</button></div></td>';tr.querySelector('[data-action=edit]').onclick=()=>openChannelEdit(r);tr.querySelectorAll('[data-action=pending]').forEach(b=>b.onclick=()=>showPrototypeMessage('该项业务规则待补充，当前仅复刻入口。','warning'));tbody.append(tr);}
  document.querySelectorAll('.ca-tree-node').forEach(b=>b.classList.toggle('selected',b.textContent===activeChannel));
 }
 const field=(label,control,className='')=>'<label class="ca-edit-field '+className+'"><span>'+label+'</span><div>'+control+'</div></label>';
 function input(name,value='',type='text'){return '<input name="'+name+'" type="'+type+'" value="'+escapeHtml(value)+'" autocomplete="off">';}
 function select(name,values,value='',placeholder='请选择'){return '<select name="'+name+'"><option value="">'+placeholder+'</option>'+values.map(v=>'<option value="'+escapeHtml(v)+'" '+(v===value?'selected':'')+'>'+escapeHtml(v)+'</option>').join('')+'</select>';}
 function radio(name,label,checked){return '<label class="ca-radio"><input type="radio" name="'+name+'" value="'+label+'" '+(checked?'checked':'')+'>'+label+'</label>';}
 function openChannelEdit(record){
  const content=document.createElement('div');content.className='ca-edit-form';
  content.innerHTML=field('* 上级渠道',input('upperChannel',record.upperChannel),'wide')+field('* 渠道名称',input('name',record.name),'wide')+field('客户',input('customer',record.customer),'wide')+field('渠道员工', '<div class="ca-inline"><input name="channelStaff" value="'+escapeHtml((record.channelStaff||[]).join('、'))+'" readonly><button type="button" class="ca-select-staff">选择</button></div>','wide')+field('* 省市区',input('province',record.province),'wide')+field('* 详细地址',input('address',record.address),'wide')+field('街道',select('street',['请选择','粤海街道','南头街道','西丽街道'],record.street),'wide')+field('邮政编码',input('postalCode',record.postalCode),'wide')+field('店长电话',input('managerPhone',record.managerPhone),'wide')+field('第三方编码',input('thirdPartyCode',record.thirdPartyCode),'wide')+field('第三方对接内部编码',input('thirdPartyInternal',record.thirdPartyInternal),'wide')+field('* 渠道级别',select('level',['客户','门店','代理商'],record.level),'wide')+field('渠道TOP级别',select('topLevel',['D级','C级','B级','A级'],record.topLevel),'wide')+field('* 渠道状态','<div class="ca-radio-group">'+radio('enabled','启用',record.enabled)+radio('enabled','停用',!record.enabled)+'</div>','wide')+field('收货仓库',select('warehouse',['请选择','闪回收总仓','深圳仓'],record.warehouse),'wide')+field('副仓',select('subWarehouse',['请选择','闪回收总仓'],record.subWarehouse),'wide')+field('显示推荐','<div class="ca-radio-group">'+radio('recommended','显示',record.displayRecommended)+radio('recommended','隐藏',!record.displayRecommended)+'</div>','wide')+field('门店简称',input('shortName',record.shortName),'wide')+field('备注',input('remark',record.remark),'wide')+field('当前位置信息', '<span class="ca-location">经度：113.952263 纬度：22.537867　<button type="button" class="ca-link">更新GPS定位信息</button></span>','wide');
  const sections=document.createElement('div');sections.className='ca-edit-sections';
  const section=(title,body,selected=false)=>'<details class="ca-edit-section"'+(selected?' open':'')+'><summary><label><input type="checkbox" '+(selected?'checked':'')+'> '+title+'</label><span>⌄</span></summary><div class="ca-section-body">'+body+'</div></details>';
  const contact=section('门店管理及其他信息',field('绑定渠道',input('linked',record.linked)) + field('运营商',select('operator',['未知','中国移动','中国联通','中国电信'],'未知')) + field('区域经理姓名',input('managerName',record.managerName)) + field('营业时间',input('openDate',record.openDate,'date')) + field('* 门店品牌属性',select('storeBrand',['请选择','闪回收','闪回收微信'],''),) + field('* 门店类型',select('storeType',['请选择','直营店','合作店'],''),))
  const settlement=section('结算信息',field('核算单位',select('settlementUnit',['深圳闪回科技有限公司'],'深圳闪回科技有限公司')) + '<div class="ca-inline-options">'+radio('settlement','回收价',true)+radio('settlement','前端检测价',false)+radio('settlement','销售价',false)+radio('settlement','按报价结算',false)+'</div>'+field('回收服务费计算时间','<div class="ca-inline-options">'+radio('serviceTime','收货时间',true)+radio('serviceTime','下单时间',false)+radio('serviceTime','销售时间',false)+'</div>') + field('是否直签','<div class="ca-inline-options">'+radio('directSign','非直签',true)+radio('directSign','直签',false)+'</div>'))
  const price=section('自主加价',field('所属上级客户',input('upperCustomer','顺维修')) + field('客户每月授信额度',input('customerCredit','0')+' 元') + field('客户本月额度',input('customerMonthLimit','0')+' 元　已用金额 ¥0　占用中 ¥0　剩余 ¥0') + field('门店每月授信额度',input('storeCredit','0')+' 元') + field('门店本月额度',input('storeMonthLimit','0')+' 元　已用金额 ¥0　占用中 ¥0　剩余 ¥0'))
  const shipping=section('自动发货配置',field('发货时间',select('shippingTime',['10','20','30'],'10')) + field('选择取件成交时间范围',select('pickupRange',['10','20','30'],'10')) + field('待发货金额',input('pendingAmount','-1')) + field('物流公司',select('logistics',['顺丰','京东物流','中通'],'顺丰')))
  sections.innerHTML=contact+settlement+price+shipping;
  content.append(sections);
  const error=document.createElement('p');error.className='ca-edit-error';error.setAttribute('role','status');content.append(error);
  const dialog=openPrototypeModal({title:'编辑',content,width:1240,confirmText:'保存',cancelText:'取消',onConfirm:()=>{
    if(!content.querySelector('[name=name]').value.trim()){error.textContent='渠道名称不能为空';return false;}
    const brand=content.querySelector('[name=storeBrand]').value;if(!brand){error.textContent='门店品牌属性不能为空';return false;}
    const values=Object.fromEntries(new FormData(content));record.name=values.name;record.managerPhone=values.managerPhone;record.enabled=values.enabled==='启用';record.upperChannel=values.upperChannel;record.channelStaff=values.channelStaff?values.channelStaff.split('、'):[];render();showPrototypeMessage('已保存本页演示渠道信息。');return true;
  }});dialog.element.classList.add('ca-edit-dialog');
  content.querySelector('.ca-select-staff').onclick=()=>openChannelStaffPicker(record,content,content.querySelector('[name=channelStaff]'));
 }
 function openChannelStaffPicker(record,editContent,targetInput){
  const staff=[{name:'柜机',phone:'13000000000'},{name:'柜机',phone:'1203750'},{name:'柜机',phone:'1252864'}];
  const content=document.createElement('div');content.className='ca-staff-picker';
  content.innerHTML='<table><thead><tr><th>名称</th><th>手机号码</th><th>操作</th></tr></thead><tbody>'+staff.map((s,i)=>'<tr><td>'+s.name+'</td><td>'+s.phone+'</td><td><button type="button" data-i="'+i+'">选择</button></td></tr>').join('')+'</tbody></table>';
  const dialog=document.createElement('dialog');dialog.className='ca-staff-dialog';dialog.innerHTML='<header><h2>该渠道所有店员</h2><button type="button" class="ca-staff-close" aria-label="关闭">×</button></header><div class="ca-staff-body"></div>';dialog.querySelector('.ca-staff-body').append(content);document.body.append(dialog);
  const close=()=>{dialog.close();dialog.remove();};
  dialog.querySelector('.ca-staff-close').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  content.querySelectorAll('button[data-i]').forEach(b=>b.onclick=()=>{const s=staff[Number(b.dataset.i)];targetInput.value=s.name;const phone=editContent.querySelector('[name=managerPhone]');phone.value=s.phone;phone.dispatchEvent(new Event('input',{bubbles:true}));close();});
  dialog.showModal();
 }
 form.onsubmit=e=>{e.preventDefault();render();};
 document.querySelectorAll('[data-pending]').forEach(b=>b.onclick=()=>showPrototypeMessage('“'+b.dataset.pending+'”的业务流程待补充，未执行真实操作。','warning'));
 render();
})();
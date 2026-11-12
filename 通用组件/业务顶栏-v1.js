// 当前原型统一业务顶栏；业务菜单动作由页面回调处理。
window.mountPrototypeHeader = function(host, {unit='深圳闪回科技有限公司', user='演示用户', units=['深圳闪回科技有限公司','演示单位'], onAction}={}) {
  if(!host)return;
  const pending=onAction || (label=>window.showPrototypeMessage?.(label+'的交互待核对','warning'));
  host.classList.add('prototype-business-header');
  host.innerHTML='<div class="boss-home"><button type="button" class="boss-sidebar-toggle" aria-controls="boss-sidebar" aria-expanded="true" aria-label="收起侧栏">☰</button><span>首页</span></div><input type="search" aria-label="全局搜索（待核对）" placeholder="请输入搜索内容" disabled><nav class="boss-shortcuts" aria-label="快捷入口"></nav><div class="boss-top-menus"></div>';
  const toggle=host.querySelector('.boss-sidebar-toggle');
  toggle.onclick=()=>{const sidebar=document.getElementById('boss-sidebar');if(!sidebar)return;sidebar.hidden=!sidebar.hidden;toggle.setAttribute('aria-expanded',String(!sidebar.hidden));toggle.setAttribute('aria-label',sidebar.hidden?'展开侧栏':'收起侧栏');};
const shortcutIcons = [
  ['导出列表', 'M8 2v8m-3-3 3 3 3-3M3 10v4h10v-4'],
  ['导入进度', 'M8 11V3M5 6l3-3 3 3M3 10v4h10v-4'],
  ['系统参数', 'M8 2v2m0 8v2M2 8h2m8 0h2M4 4l1 1m6 6 1 1M4 12l1-1m6-6 1-1M11 8a3 3 0 1 1-6 0 3 3 0 1 1 6 0Z'],
  ['旧boss', 'M3 5h10v8H3zM6 5V3h4v2M3 8h10'],
  ['数据报表', 'M2 3v11h12M4 11l3-4 2 2 4-4v6Z'],
  ['消息', 'M3 11h10l-2-3V6a3 3 0 0 0-6 0v2zM7 14h2'],
  ['绑定微信', 'M9 6a4 4 0 1 0-6 4l-.5 2 2-1h2M13 12l.5 2-2-1H10a3 3 0 1 1 3-1Z'],
  ['检测APP扫码', 'M2 2h4v4H2zM10 2h4v4h-4zM2 10h4v4H2zM10 10h2v2m2-2v4h-4']
];

  for(const [label,icon] of shortcutIcons){
    const b=document.createElement('button');b.type='button';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 16 16');svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',icon);svg.append(path);b.append(svg,document.createTextNode(label));
    if(label==='消息'){const badge=document.createElement('span');badge.className='boss-message-badge';badge.textContent='6';b.append(badge);}
    b.onclick=()=>pending(label);host.querySelector('.boss-shortcuts').append(b);
  }
  function menu(label,options,choose){
    const details=document.createElement('details');details.className='boss-menu';const summary=document.createElement('summary');summary.textContent=label;
    const panel=document.createElement('div');panel.className='boss-menu-panel';
    for(const option of options){const b=document.createElement('button');b.type='button';b.textContent=option;b.onclick=()=>{choose?.(option,summary);details.open=false;summary.focus();};panel.append(b);}
    details.append(summary,panel);host.querySelector('.boss-top-menus').append(details);
    details.addEventListener('toggle',()=>{if(details.open)for(const other of host.querySelectorAll('details'))if(other!==details)other.open=false;});
    return details;
  }
  menu('当前单位: '+unit,units,(value,summary)=>{summary.textContent='当前单位: '+value;});
  menu('（'+user+'）',['修改密码','申请权限','申请借机','退出登录'],value=>pending(value));
  document.addEventListener('click',e=>{if(!host.contains(e.target))for(const d of host.querySelectorAll('details'))d.open=false;});
  host.addEventListener('keydown',e=>{if(e.key==='Escape'){const d=e.target.closest('details[open]');if(d){d.open=false;d.querySelector('summary').focus();e.stopPropagation();}}});
};

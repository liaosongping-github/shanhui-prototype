(() => {
  const config=window.prototypeConfig, q=new URLSearchParams(location.search), review=q.get('mode')==='review';
  const selector=document.getElementById('version'), frame=document.getElementById('preview');
  const local=location.protocol==='file:'||['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  let annotationKey,frameReady=false,syncAvailable=false;
  const buttons=Object.fromEntries(['annotations','edit','share','sync'].map(id=>[id,document.getElementById(id)]));
  let release=(q.get('release')||q.get('version')||config.releases.at(-1)).toLowerCase(), pageId=q.get('page');
  const notice=text=>{
    const n=document.getElementById('notice');n.textContent=text;n.hidden=!text;
    if(text){
      const close=document.createElement('button');close.type='button';close.className='notice-close';close.textContent='×';
      close.setAttribute('aria-label','关闭提示');close.title='关闭提示';
      close.onclick=()=>{n.hidden=true;};n.append(close);
    }
  };
  const url=(root)=>{const u=new URL('index.html',root);u.searchParams.set('release',release);u.searchParams.set('page',pageId);return u;};
  if((!config.releases.includes(release)&&release!=='all')||(review&&release==='all')){document.querySelector('header').hidden=true;frame.hidden=true;notice('该迭代版本不存在，请使用有效版本链接。');return;}
  selector.replaceChildren(new Option('全部（各页最新版）','all'),...config.releases.map(id=>new Option(id.toUpperCase(),id)));
  selector.value=release;selector.hidden=review;
  for(const id of ['edit','share','sync'])buttons[id].hidden=review;
  function updateToolbar(){
    const all=release==='all';
    buttons.annotations.hidden=all;
    buttons.edit.hidden=all||review;
    buttons.share.hidden=all||review;
    buttons.sync.hidden=all||review||!syncAvailable;
  }
  function load(){
    updateToolbar();notice('');
    frameReady=false;for(const id of ['edit','sync'])buttons[id].disabled=true;
    const entries=config.pages.flatMap(page=>{const version=release==='all'?config.releases.slice().reverse().map(id=>page.versions.find(v=>v.id===id)).find(Boolean):page.versions.find(v=>v.id===release);return version?[{page,version}]:[];});
    const entry=entries.find(e=>e.page.id===pageId)||entries[0];
    if(!entry){frame.hidden=true;notice('本版本还没有页面。');return;}
    annotationKey=entry.page.id+'@'+entry.version.id;
    frame.hidden=false;pageId=entry.page.id;document.getElementById('title').textContent=entry.page.name+' · '+entry.version.id.toUpperCase();
    const target=new URL(entry.version.path,location.href);target.searchParams.set('toolbar','parent');target.searchParams.set('release',release);if(review)target.searchParams.set('mode','review');frame.src=target.href;
    buttons.share.hidden=review||release==='all';const address=url(location.href);if(review)address.searchParams.set('mode','review');history.replaceState(null,'',address);
  }
  function send(action){frame.contentWindow.postMessage({type:'prototype-v3-command',action},'*');}
  let dirty=false,editing=false,syncBusy=false,syncTimeout;
  const store=window.prototypeStore;
  store.ready.then(session=>{syncAvailable=!!session||!!store.fileMode;updateToolbar();});
  async function monitorSync(){
    try{
      const result=await store.status();notice(result.message);
      if(result.state==='running'){setTimeout(monitorSync,1500);return;}
      syncBusy=false;buttons.sync.disabled=!frameReady;
      if(result.state==='done'&&result.url){
        const link=document.createElement('a');link.href=result.url;link.target='_blank';link.rel='noopener';link.textContent=' 打开公网原型';document.getElementById('notice').append(link);
      }
    }catch{syncBusy=false;buttons.sync.disabled=!frameReady;notice('无法获取同步状态，请检查本地服务和 GitHub 仓库，勿直接认定同步失败或成功。');}
  }
  buttons.sync.onclick=async()=>{
    if(store.fileMode)try{notice('正在连接保存助手…');await store.connect(true);}catch(error){notice(error.message);return;}
    if(syncBusy)return;
    syncBusy=true;buttons.sync.disabled=true;notice('正在保存当前页标注，随后同步 GitHub…');send('sync');
    syncTimeout=setTimeout(()=>{syncBusy=false;buttons.sync.disabled=!frameReady;notice('页面未响应保存，请刷新后重试。尚未开始同步。');},20000);
  };
  window.addEventListener('message',async event=>{
    if(event.source!==frame.contentWindow||event.data?.type!=='prototype-v3-saved'||!syncBusy)return;
    clearTimeout(syncTimeout);
    if(!event.data.ok){syncBusy=false;buttons.sync.disabled=!frameReady;return;}
    try{await store.sync();monitorSync();}catch(error){syncBusy=false;buttons.sync.disabled=!frameReady;notice('同步未开始：'+error.message);}
  });
  buttons.annotations.onclick=()=>send('annotations');buttons.edit.onclick=async()=>{
    if(store.fileMode&&editing){buttons.edit.disabled=true;try{notice('正在连接保存助手…');await store.connect(true);}catch(error){buttons.edit.disabled=false;notice(error.message);return;}}
    send('edit');
  };selector.onchange=()=>{if(dirty&&!confirm('当前页有未保存标注，确定切换版本？草稿会保留。')){selector.value=release;return;}dirty=false;release=selector.value;load();};
  buttons.share.onclick=async()=>{
    if(dirty){notice('当前页还有未保存标注，请先点击“保存标注到项目”，再复制链接。');return;}
    const link=url(location.href);
    link.searchParams.set('mode','review');
    const label=local?'本地链接':'版本链接';
    try{
      await navigator.clipboard.writeText(link.href);
      notice('已复制'+label+'。');
    }catch{
      notice('无法自动复制，请按 Ctrl+C 复制已选中的'+label+'：');
      const field=document.createElement('input');
      field.readOnly=true;field.value=link.href;field.size=60;
      field.setAttribute('aria-label',label);
      document.getElementById('notice').append(field);
      field.focus();field.select();
    }
  };
  window.addEventListener('message',e=>{if(release==='all'||e.source!==frame.contentWindow||e.data?.type!=='prototype-v3-state')return;frameReady=true;editing=!!e.data.editing;buttons.edit.disabled=!!e.data.saving;buttons.sync.disabled=syncBusy;dirty=!!e.data.dirty;buttons.edit.textContent=e.data.saving?'正在保存…':editing?'保存标注到项目':'编辑标注';buttons.annotations.textContent=e.data.annotations?'隐藏改动标注':'显示改动标注';if(e.data.notice)notice(e.data.notice);});load();
})();

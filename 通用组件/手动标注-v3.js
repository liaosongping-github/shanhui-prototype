(async () => {
  const ctx=window.prototypeContext;if(!ctx?.page||!ctx.version)return;
  // 全部模式只浏览页面，不挂载标注、编辑器或恢复标注草稿。
  if(ctx.release==='all')return;
  const hosted=parent!==window&&new URLSearchParams(location.search).get('toolbar')==='parent';
  const key=ctx.page.id+'@'+ctx.version.id, storage='prototype-draft-v4:'+key;
  const store=window.prototypeStore, session=await store.ready;
  let baseRevision=null,dirty=false,saving=false;
  function normalize(data){
    if(Array.isArray(data)){
      const cards=[];for(const box of data)if(!cards.some(n=>n.id===box.id))cards.push({uid:box.uid,id:box.id,content:box.content||'<p></p>'});
      return {boxes:data.map(({content,...box})=>box),cards};
    }
    return {boxes:Array.isArray(data?.boxes)?data.boxes:[],cards:Array.isArray(data?.cards)?data.cards:[]};
  }
  let data=normalize(structuredClone(window.prototypeAnnotations?.[key]||[])),editing=false,visible=true;
  const visibilityKey='prototype-annotation-visible:'+ctx.root.href;
  try{visible=localStorage.getItem(visibilityKey)!=='false';}catch{}
  if(hosted)visible=new URLSearchParams(location.search).get('annotations')!=='false';
  let warning='';
  if(session){
    try{const saved=await store.read(key);data=normalize(saved.data);baseRevision=saved.revision;}
    catch{warning='无法读取最新标注，请检查本地服务后刷新。';}
  }
  if(!baseRevision)baseRevision=await store.fingerprint(data);
  if(!ctx.review)try{
    const draft=JSON.parse(localStorage.getItem(storage)||'null');
    if(draft&&draft.baseRevision===baseRevision){data=normalize(draft.data);dirty=true;warning='已恢复未保存草稿，请点击保存标注。';}
    else if(draft)warning='检测到另一版本的未保存草稿，已保留草稿但未覆盖项目标注。';
  }catch{warning='无法读取浏览器草稿。';}
  let items=data.boxes,cards=data.cards,pendingNumber=null,pointerEditing=false;
  document.body.classList.add('manual-review-page');
  const shell=document.querySelector('.shell'),layout=document.createElement('div');layout.className='review-layout';
  const right=document.createElement('section');right.className='review-current';right.append(shell);
  const notes=document.createElement('aside');notes.className='review-notes';
  const resize=document.createElement('div');resize.className='review-notes-resize';resize.tabIndex=0;resize.setAttribute('role','separator');resize.setAttribute('aria-label','调整说明栏宽度');
  const collapse=document.createElement('button');collapse.className='manual-collapse';collapse.type='button';
  const content=document.createElement('div');content.className='review-notes-content';
  right.tabIndex=0;right.setAttribute('aria-label','原型页面');
  content.tabIndex=0;content.setAttribute('role','region');content.setAttribute('aria-label','标注描述');
  notes.hidden=!visible;
  notes.append(resize,collapse,content);layout.append(right,notes);document.body.prepend(layout);
  const bar=document.createElement('div');bar.className='review-bar';bar.hidden=hosted;document.body.prepend(bar);
  const button=(label,action)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;return b;};
  const edit=button('编辑标注',()=>command('edit')),toggle=button('隐藏改动标注',()=>command('annotations'));
  const title=document.createElement('strong');title.textContent=ctx.page.name+' · '+ctx.version.id.toUpperCase();bar.append(title);
  if(!ctx.review){const select=document.createElement('select');select.setAttribute('aria-label','选择迭代版本');select.replaceChildren(new Option('全部（各页最新版）','all'),...window.prototypeConfig.releases.map(id=>new Option(id.toUpperCase(),id)));select.value=ctx.release;select.onchange=()=>{const u=new URL('index.html',ctx.root);u.searchParams.set('release',select.value);u.searchParams.set('page',ctx.page.id);location.href=u;};bar.append(select);}
  bar.append(toggle);if(!ctx.review)bar.append(edit);
  function report(notice=''){edit.textContent=saving?'正在保存…':editing?'保存标注到项目':'编辑标注';edit.disabled=saving;toggle.textContent=visible?'隐藏改动标注':'显示改动标注';if(hosted)parent.postMessage({type:'prototype-v3-state',editing,annotations:visible,notice,dirty,saving},'*');else if(notice)alert(notice);}
  function persist(){
    dirty=true;editing=true;
    const draft={boxes:items.filter(i=>i.id),cards};
    try{localStorage.setItem(storage,JSON.stringify({baseRevision,data:draft}));}
    catch{report('草稿暂存失败，请保持页面打开并点击保存标注。');return true;}
    report('有未保存的标注。');
    return true;
  }
  const editor=window.createPrototypeEditor(()=>{editing=true;const ok=persist();report('描述已暂存，请点击“保存标注到项目”。');return ok;});
  function expanded(value){content.hidden=!value;resize.hidden=!value;notes.classList.toggle('review-notes-collapsed',!value);collapse.title=value?'收起说明':'展开说明';collapse.setAttribute('aria-label',collapse.title);collapse.setAttribute('aria-expanded',String(value));}
  collapse.onclick=()=>{expanded(content.hidden);paint();};expanded(true);
  let width=320;function setWidth(n){width=Math.max(220,Math.min(680,innerWidth*.45,n));notes.style.setProperty('--review-notes-width',width+'px');resize.setAttribute('aria-valuenow',width);}
  setWidth(width);resize.onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setWidth(width+(e.key==='ArrowLeft'?20:-20));paint();}};
  resize.onpointerdown=e=>{e.preventDefault();const x=e.clientX,w=width;resize.setPointerCapture(e.pointerId);resize.onpointermove=m=>{setWidth(w+x-m.clientX);paint();};resize.onpointerup=()=>resize.onpointermove=null;};
  const layers=new Map();
  function layerFor(dialog){
    const host=dialog||document.body;
    if(!layers.has(host)){const el=document.createElement('div');el.className='manual-layer';host.append(el);layers.set(host,el);}
    const layer=layers.get(host);
    // 包括新画的框在内，主页面标记不能覆盖说明栏、工具栏或滚动条。
    if(!dialog){const v=right.getBoundingClientRect();layer.style.clipPath=`inset(${v.top}px ${Math.max(0,innerWidth-v.left-right.clientWidth)}px ${Math.max(0,innerHeight-v.bottom)}px ${v.left}px)`;}
    return layer;
  }
  function selector(el){if(el.id)return '#'+CSS.escape(el.id);if(el===document.body)return 'body';const part=el.tagName.toLowerCase()+':nth-of-type('+(Array.from(el.parentElement.children).filter(n=>n.tagName===el.tagName).indexOf(el)+1)+')';return selector(el.parentElement)+' > '+part;}
  function target(item){try{return document.querySelector(item.anchor);}catch{return null;}}
  function bounds(item){
    let nodes;try{nodes=[...document.querySelectorAll(item.anchor)];}catch{return null;}
    const rects=nodes.filter(el=>el.getClientRects().length).map(el=>el.getBoundingClientRect()).filter(r=>r.width&&r.height);
    if(!rects.length)return null;
    const left=Math.min(...rects.map(r=>r.left)),top=Math.min(...rects.map(r=>r.top));
    const right=Math.max(...rects.map(r=>r.right)),bottom=Math.max(...rects.map(r=>r.bottom));
    return {left,top,right,bottom,width:right-left,height:bottom-top};
  }
  function locate(item){const el=target(item);if(!el||!el.getClientRects().length){report('请先打开标注所在弹窗或恢复对应页面区域。');return;}el.scrollIntoView({block:'center',inline:'nearest'});}
  function groupFor(item){return cards.find(i=>i.id===item.id);}
  function editGroup(item){const card=groupFor(item);if(card)editor.editItem(card,render);}
  function openNote(item){
    const card=groupFor(item);if(!card){report('此编号的描述卡已删除。');return;}
    expanded(true);document.getElementById('manual-note-'+card.uid)?.scrollIntoView({block:'nearest'});
  }
  function removeBox(item){
    if(ctx.review)return;
    const previous=items;items=items.filter(i=>i!==item);
    if(!persist())items=previous;
    render();
  }
  function removeCard(card){
    if(ctx.review)return;
    if(!confirm('删除描述卡 '+card.id+'？红框保持不变。'))return;
    const previous=cards;cards=cards.filter(i=>i!==card);
    if(!persist())cards=previous;
    render();
  }
  function commitNumber(item,id){
    id=id.trim();if(!id||id.length>30)return false;
    const oldId=item.id,previousCards=cards;
    item.id=id;
    if(!cards.some(n=>n.id===id))cards=[...cards,{uid:crypto.randomUUID(),id,content:'<p></p>'}];
    if(!persist()){item.id=oldId;cards=previousCards;return false;}
    return true;
  }
  function renameBox(item){
    if(ctx.review)return;
    pendingNumber=item.uid;paint();
    requestAnimationFrame(()=>{const input=document.querySelector('.manual-number-input');input?.focus();input?.select();});
  }
  function render(){
    content.replaceChildren();
    if(!cards.length){const empty=document.createElement('p');empty.textContent=ctx.review?'本页暂无描述卡。':'画框后在左上角填写编号，再点击描述卡的“编辑”填写说明。';content.append(empty);}
    for(const cardData of cards){
      const card=document.createElement('article');card.id='manual-note-'+cardData.uid;
      const marker=document.createElement('span');marker.className='review-marker';marker.textContent=cardData.id;card.append(marker);
      if(!ctx.review)card.append(button('编辑',()=>editGroup(cardData)),button('删除',()=>removeCard(cardData)));
      card.append(editor.displayContent(cardData));content.append(card);
    }
    paint();
  }
  function paint(){
    if(pointerEditing)return;
    if(document.activeElement?.classList.contains('manual-number-input'))return;
    for(const el of layers.values())el.replaceChildren();
    if(!visible)return;
    for(const item of items){const el=target(item);if(!el||!el.getClientRects().length)continue;
      const r=bounds(item),dialog=el.closest('dialog');if(!r||(dialog&&!dialog.open))continue;
      const layer=layerFor(dialog),base=layer.getBoundingClientRect(),box=document.createElement('div');box.className='manual-box';
      box.dataset.anchor=item.anchor;box.dataset.uid=item.uid;
      const clip=document.createElement('div');
      let clipLeft=base.left,clipTop=base.top,clipRight=base.right,clipBottom=base.bottom;
      for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){
        // 单元格 overflow:hidden 仅用于文字省略，不能裁掉框外的编号/删除按钮。
        // 仍由表格滚动容器和原型视口裁剪标注，避免滚出表格后漂浮在页面上。
        if(p.matches('td,th'))continue;
        const css=getComputedStyle(p),v=p.getBoundingClientRect();
        if(/auto|scroll|hidden|clip/.test(css.overflowX)){clipLeft=Math.max(clipLeft,v.left+p.clientLeft);clipRight=Math.min(clipRight,v.left+p.clientLeft+p.clientWidth);}
        if(/auto|scroll|hidden|clip/.test(css.overflowY)){clipTop=Math.max(clipTop,v.top+p.clientTop);clipBottom=Math.min(clipBottom,v.top+p.clientTop+p.clientHeight);}
      }
      Object.assign(clip.style,{position:'absolute',inset:'0',pointerEvents:'none',clipPath:`inset(${Math.max(0,clipTop-base.top)}px ${Math.max(0,base.right-clipRight)}px ${Math.max(0,base.bottom-clipBottom)}px ${Math.max(0,clipLeft-base.left)}px)`});
      layer.append(clip);
      const rect=item.rect||{x:0,y:0,w:1,h:1};
      Object.assign(box.style,{left:r.left-base.left+rect.x*r.width+'px',top:r.top-base.top+rect.y*r.height+'px',width:rect.w*r.width+'px',height:rect.h*r.height+'px'});
      if(pendingNumber===item.uid){
        const input=document.createElement('input');input.className='manual-number-input';input.value=item.id||'';input.placeholder='编号';input.maxLength=30;input.setAttribute('aria-label','红框编号');
        let finished=false;
        function finish(cancel=false){
          if(finished)return;
          if(!cancel&&!commitNumber(item,input.value)){input.setAttribute('aria-invalid','true');input.title='请输入 1–30 个字符的编号';return;}
          finished=true;input.onblur=null;input.blur();pendingNumber=null;if(!item.id)items=items.filter(i=>i!==item);render();
        }
        input.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();finish();}else if(e.key==='Escape'){e.preventDefault();finish(true);}};
        input.onblur=()=>{if(!input.value.trim())finish(true);else finish();};
        input.onpointerdown=e=>e.stopPropagation();box.append(input);clip.append(box);continue;
      }
      let clickTimer;
      const label=button(item.id,()=>{clearTimeout(clickTimer);clickTimer=setTimeout(()=>openNote(item),300);});label.className='manual-label';box.append(label);
      if(!ctx.review){
        label.title='双击修改当前框编号';label.setAttribute('aria-label','标注 '+item.id+'，双击或按 F2 修改编号');
        label.ondblclick=e=>{e.preventDefault();e.stopPropagation();clearTimeout(clickTimer);renameBox(item);};
        label.onkeydown=e=>{if(e.key==='F2'){e.preventDefault();clearTimeout(clickTimer);renameBox(item);}};
        if(editing){const remove=button('×',e=>{e.stopPropagation();removeBox(item);});remove.className='manual-delete';remove.title='删除当前框';remove.setAttribute('aria-label','删除编号 '+item.id+' 的当前框');box.append(remove);}
      }
      if(editing){box.classList.add('manual-movable');const handle=document.createElement('span');handle.className='manual-handle';handle.title='拖动调整大小';box.append(handle);
        box.onpointerdown=e=>{if(e.target.closest('button'))return;e.preventDefault();e.stopPropagation();const start={...rect},x=e.clientX,y=e.clientY,isResize=e.target===handle;box.setPointerCapture(e.pointerId);
          box.onpointermove=m=>{const dx=(m.clientX-x)/r.width,dy=(m.clientY-y)/r.height;item.rect=isResize?{...start,w:Math.max(.01,start.w+dx),h:Math.max(.01,start.h+dy)}:{...start,x:start.x+dx,y:start.y+dy};Object.assign(box.style,{left:r.left-base.left+item.rect.x*r.width+'px',top:r.top-base.top+item.rect.y*r.height+'px',width:item.rect.w*r.width+'px',height:item.rect.h*r.height+'px'});};
          box.onpointerup=()=>{box.onpointermove=null;persist();paint();};
        };
      }
      clip.append(box);
    }
  }
  let drawing=null,raf=0;
  function schedule(){if(drawing||raf)return;raf=requestAnimationFrame(()=>{raf=0;paint();});}
  document.addEventListener('scroll',schedule,true);window.addEventListener('resize',()=>{setWidth(width);schedule();});
  const layoutObserver=new ResizeObserver(()=>{
    layout.style.setProperty('--review-viewport-height',layout.clientHeight+'px');
    layout.style.setProperty('--prototype-scrollbar-width',Math.max(0,right.getBoundingClientRect().width-right.clientWidth)+'px');
    schedule();
  });
  layoutObserver.observe(layout);layoutObserver.observe(right);
  new MutationObserver(records=>{if(records.some(r=>!r.target.closest?.('.manual-layer,.review-notes,.review-editor,.review-bar')))schedule();}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open','hidden','class']});
  document.addEventListener('pointerdown',e=>{
    if(e.target.closest('.manual-layer')){pointerEditing=true;return;}
    if(!editing||e.button!==0||e.target.closest('.manual-layer,.review-notes,.review-bar,.review-editor,.review-image-viewer,[data-prototype-navigation]'))return;
    e.preventDefault();e.stopImmediatePropagation();
    const dialog=e.target.closest('dialog[open]'),layer=layerFor(dialog),draft=document.createElement('div');draft.className='manual-box';layer.append(draft);
    drawing={x:e.clientX,y:e.clientY,element:e.target,dialog,draft,layer};
  },true);
  document.addEventListener('pointercancel',()=>{pointerEditing=false;drawing?.draft.remove();drawing=null;schedule();},true);
  document.addEventListener('pointermove',e=>{if(!drawing)return;const d=drawing,b=d.layer.getBoundingClientRect();Object.assign(d.draft.style,{left:Math.min(d.x,e.clientX)-b.left+'px',top:Math.min(d.y,e.clientY)-b.top+'px',width:Math.abs(e.clientX-d.x)+'px',height:Math.abs(e.clientY-d.y)+'px'});},true);
  function anchorsInBox(root,x,y,w,h){
    const candidates=selector=>Array.from(root.querySelectorAll(selector)).filter(el=>{
      if(el.closest('.manual-layer,.review-notes,[data-prototype-navigation]'))return false;
      const r=el.getBoundingClientRect();if(!r.width||!r.height)return false;
      const overlap=Math.max(0,Math.min(x+w,r.right)-Math.max(x,r.left))*Math.max(0,Math.min(y+h,r.bottom)-Math.max(y,r.top));
      return overlap/(r.width*r.height)>=.6;
    });
    // 多个控件使用联合边界，不能退回不会随表格内容滚动的外壳。
    const controls=candidates('button,a,input,select,textarea,[role="button"],[role="checkbox"]');
    if(controls.length)return controls.filter(el=>!controls.some(other=>other!==el&&other.contains(el)));
    const cells=candidates('td,th');if(cells.length)return cells;
    // 文本/留白从框中心寻找内容锚点，避免起笔落在容器边缘导致绑定整页。
    const center=document.elementsFromPoint(x+w/2,y+h/2).find(el=>root.contains(el)&&!el.closest('.manual-layer,.review-notes')&&el!==root);
    if(center){const cell=center.closest('td,th');return [cell||center];}
    return [root];
  }
  document.addEventListener('pointerup',e=>{
    if(pointerEditing){requestAnimationFrame(()=>{pointerEditing=false;schedule();});return;}
    if(!drawing)return;e.preventDefault();e.stopImmediatePropagation();const d=drawing;drawing=null;d.draft.remove();
    const x=Math.min(d.x,e.clientX),y=Math.min(d.y,e.clientY),w=Math.abs(e.clientX-d.x),h=Math.abs(e.clientY-d.y);if(w<8||h<8)return;
    const anchor=anchorsInBox(d.dialog||shell,x,y,w,h).map(selector).join(', ');
    const r=bounds({anchor});if(!r)return;
    const item={uid:crypto.randomUUID(),id:'',anchor,rect:{x:(x-r.left)/r.width,y:(y-r.top)/r.height,w:w/r.width,h:h/r.height}};items.push(item);renameBox(item);

  },true);
  document.addEventListener('click',e=>{if(editing&&!e.target.closest('.manual-layer,.review-notes,.review-bar,.review-editor,.review-image-viewer,[data-prototype-navigation]')){e.preventDefault();e.stopImmediatePropagation();}},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&editing){drawing?.draft.remove();drawing=null;editing=false;render();report();}});
  async function saveProject(){
    if(saving)return false;
    if(!baseRevision){report('尚未读取项目标注，请刷新页面后重试。');return false;}
    if(pendingNumber){report('请先完成红框编号，再保存标注。');return false;}
    saving=true;report('正在保存标注…');
    const draft={boxes:items.filter(i=>i.id),cards:cards.map(card=>({...card,content:editor.cleanContent(card.content||'').innerHTML}))};
    const signature=JSON.stringify(draft);
    try{
      const saved=await store.save(key,draft,baseRevision);
      baseRevision=saved.revision;window.prototypeAnnotations[key]=saved.data;
      const current={boxes:items.filter(i=>i.id),cards:cards.map(card=>({...card,content:editor.cleanContent(card.content||'').innerHTML}))};
      dirty=JSON.stringify(current)!==signature;
      try{if(dirty)localStorage.setItem(storage,JSON.stringify({baseRevision,data:current}));else localStorage.removeItem(storage);}catch{}
      saving=false;report(dirty?'已保存，保存期间还有新修改，请再次保存。':'标注已保存到项目，本地版本链接已生效。');
      return !dirty;
    }catch(error){saving=false;report('保存失败：'+error.message);return false;}
  }
  async function command(action){
    if(action==='annotations'){visible=!visible;try{localStorage.setItem(visibilityKey,String(visible));}catch{}if(!visible)editing=false;notes.hidden=!visible;render();}
    else if(!ctx.review&&action==='edit'){
      if(editing){
        if(!hosted&&store.fileMode)try{await store.connect(true);}catch(error){report(error.message);return;}
        if(!await saveProject())return;
        editing=false;render();report('标注已保存到项目。');return;
      }
      editing=true;visible=true;notes.hidden=false;render();
    }
    else if(!ctx.review&&(action==='save'||action==='sync')){
      const ok=await saveProject();
      if(hosted&&action==='sync')parent.postMessage({type:'prototype-v3-saved',ok},'*');
      return;
    }
    report();
  }
  window.addEventListener('message',e=>{if(hosted&&e.source===parent&&e.data?.type==='prototype-v3-command')command(e.data.action);});
  window.addEventListener('beforeunload',e=>{if(dirty&&!ctx.review){e.preventDefault();e.returnValue='';}});
  render();report(warning);
  if(ctx.review&&session){
    let reading=false;
    const refresh=async()=>{
      if(reading)return;reading=true;
      try{const saved=await store.read(key);if(saved.revision!==baseRevision){baseRevision=saved.revision;items=saved.data.boxes;cards=saved.data.cards;render();}}
      catch{report('标注更新暂时不可用，请检查本地服务。');}finally{reading=false;}
    };
    setInterval(refresh,2000);window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  }
})();

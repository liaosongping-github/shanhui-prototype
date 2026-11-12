(() => {
  const ctx=window.prototypeContext;
  const entry=document.createElement('button');
  entry.type='button';entry.className='related-config-entry';entry.textContent='查看相关配置';
  document.querySelector('.breadcrumb').append(entry);
  function modal(title,content,width){
    const api=window.openPrototypeModal({title,content,width});
    api.element.classList.add('related-config-modal');
    api.element.querySelector('.prototype-modal-footer').hidden=true;
    return api;
  }
  function showRuleImage(){
    const viewer=document.createElement('dialog');viewer.className='review-image-viewer related-image-viewer';viewer.setAttribute('aria-label','实际差错价自动生成规则图片预览');
    const stage=document.createElement('div');stage.className='related-image-stage';
    const image=document.createElement('img');image.alt='实际差错价自动生成规则流程图（用户提供）';image.draggable=false;
    const toolbar=document.createElement('div');toolbar.className='related-image-tools';toolbar.setAttribute('role','toolbar');toolbar.setAttribute('aria-label','图片工具');
    const percentage=document.createElement('output');percentage.setAttribute('aria-label','缩放比例');
    const status=document.createElement('p');status.className='related-image-status';status.setAttribute('role','status');status.textContent='正在加载图片…';
    let scale=1,x=0,y=0,drag=null,ready=false;
    function paint(){image.style.transform=`translate(-50%,-50%) translate(${x}px,${y}px) scale(${scale})`;percentage.textContent=Math.round(scale*100)+'%';}
    function fit(){if(!ready)return;scale=Math.min(1,(stage.clientWidth-48)/image.naturalWidth,(stage.clientHeight-100)/image.naturalHeight);scale=Math.max(.01,scale);x=0;y=-20;paint();}
    function zoom(factor,px=0,py=0){if(!ready)return;const next=Math.max(.01,Math.min(4,scale*factor)),ratio=next/scale;x=px-(px-x)*ratio;y=py-(py-y)*ratio;scale=next;paint();}
    function close(){window.removeEventListener('resize',fit);viewer.close();viewer.remove();entry.focus();}
    function button(label,text,action){const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',label);b.title=label;b.textContent=text;b.onclick=action;toolbar.append(b);return b;}
    button('缩小','−',()=>zoom(1/1.25));toolbar.append(percentage);button('放大','＋',()=>zoom(1.25));button('适应窗口','适应窗口',fit);button('原始尺寸','1:1',()=>{if(ready){scale=1;x=0;y=0;paint();}});const exit=button('关闭图片','×',close);exit.className='related-image-close';
    stage.append(image,status);viewer.append(stage,toolbar);document.body.append(viewer);viewer.showModal();exit.focus();
    image.onload=()=>{ready=true;image.style.width=image.naturalWidth+'px';image.style.height=image.naturalHeight+'px';status.hidden=true;fit();};
    image.onerror=()=>{status.textContent='图片加载失败，请检查项目中的规则图片。';};
    image.src=new URL('资源/实际差错价自动生成规则.jpg',ctx.root).href;
    stage.onpointerdown=e=>{if(e.button!==0||!ready)return;e.preventDefault();drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:x,startY:y};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');};
    stage.onpointermove=e=>{if(!drag||e.pointerId!==drag.id)return;x=drag.startX+e.clientX-drag.x;y=drag.startY+e.clientY-drag.y;paint();};
    const endDrag=()=>{drag=null;stage.classList.remove('dragging');};stage.onpointerup=endDrag;stage.onpointercancel=endDrag;stage.onlostpointercapture=endDrag;
    stage.addEventListener('wheel',e=>{e.preventDefault();const r=stage.getBoundingClientRect();zoom(e.deltaY<0?1.1:1/1.1,e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2);},{passive:false});
    viewer.addEventListener('cancel',e=>{e.preventDefault();close();});
    viewer.addEventListener('keydown',e=>{e.stopPropagation();if(['+','=','-','0'].includes(e.key)){e.preventDefault();if(e.key==='0')fit();else zoom(e.key==='-'?1/1.25:1.25);}});
    window.addEventListener('resize',fit);
  }
  entry.onclick=()=>{
    const links=document.createElement('div');links.className='related-config-links';
    for(const id of ['third-party-after-sales','xiaomi-claim-mapping','claim-option-mapping']){
      const page=window.prototypeConfig.pages.find(p=>p.id===id);
      const url=new URL('index.html',ctx.root);
      url.searchParams.set('release',ctx.release);url.searchParams.set('page',id);
      if(ctx.review)url.searchParams.set('mode','review');
      const link=document.createElement('a');link.href=url.href;link.target='_top';link.textContent=page.name;links.append(link);
    }
    const imageButton=document.createElement('button');imageButton.type='button';imageButton.textContent='“实际差错价”自动生成规则';links.append(imageButton);
    const configModal=modal('查看相关配置',links,900);
    imageButton.onclick=()=>{
      configModal.close();showRuleImage();
    };
  };
})();

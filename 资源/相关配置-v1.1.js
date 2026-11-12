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
      configModal.close();window.openPrototypeImageViewer({src:new URL('资源/实际差错价自动生成规则.jpg',ctx.root).href,title:'实际差错价自动生成规则图片预览',alt:'实际差错价自动生成规则流程图（用户提供）',trigger:entry});
    };
  };
})();

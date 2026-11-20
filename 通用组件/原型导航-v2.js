(() => {
  const root=new URL('../',document.currentScript.src),config=window.prototypeConfig;
  const current=config.pages.find(p=>p.versions.some(v=>decodeURI(new URL(v.path,root).pathname)===decodeURI(location.pathname)));
  const version=current?.versions.find(v=>decodeURI(new URL(v.path,root).pathname)===decodeURI(location.pathname));
  const q=new URLSearchParams(location.search),review=q.get('mode')==='review',release=q.get('release')||version?.id;
  window.prototypeContext={root,page:current,version,release,review};
  const visiblePages=config.pages.flatMap(page=>{
    const version=release==='all'?config.releases.slice().reverse().map(id=>page.versions.find(v=>v.id===id)).find(Boolean):page.versions.find(v=>v.id===release);
    return version?[{page,version}]:[];
  });
  const availableProducts=new Set(visiblePages.map(({page})=>page.product||'boss'));
  for(const host of document.querySelectorAll('[data-prototype-navigation]')){
    host.classList.add('prototype-navigation');host.replaceChildren();const title=document.createElement('h1');const product=q.get('product')||current?.product||'boss';
    const picker=document.createElement('select');picker.setAttribute('aria-label','切换产品');picker.className='prototype-product-picker';
    for(const item of config.products||[{id:'boss',name:'BOSS系统'}])if(availableProducts.has(item.id))picker.add(new Option(item.name,item.id));picker.value=product;
    picker.onchange=()=>{try{sessionStorage.setItem('prototype-last-page:'+product,current?.id||'');}catch{}const u=new URL('index.html',root);u.searchParams.set('product',picker.value);try{const last=sessionStorage.getItem('prototype-last-page:'+picker.value);if(last)u.searchParams.set('page',last);}catch{}u.searchParams.set('release',release);if(review)u.searchParams.set('mode','review');window.top.location.href=u.href;};title.append(picker);host.append(title);
    for(const group of new Set(config.pages.map(p=>p.group))){
      const section=document.createElement('details');section.open=true;const summary=document.createElement('summary');summary.textContent=group;section.append(summary);
      for(const {page,version:v} of visiblePages){
        if(page.group!==group||(page.product||'boss')!==product)continue;
        const url=new URL('index.html',root);url.searchParams.set('release',release);url.searchParams.set('page',page.id);url.searchParams.set('product',page.product||'boss');if(review)url.searchParams.set('mode','review');
        const link=document.createElement('a');link.href=url.href;link.target='_top';link.className='prototype-page-link';link.textContent=page.name+' · '+(config.releaseNames?.[v.id]||v.id.toUpperCase());if(page===current)link.setAttribute('aria-current','page');section.append(link);
      }if(section.children.length>1)host.append(section);
    }
  }
})();

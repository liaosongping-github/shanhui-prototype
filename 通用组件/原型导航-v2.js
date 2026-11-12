(() => {
  const root=new URL('../',document.currentScript.src),config=window.prototypeConfig;
  const current=config.pages.find(p=>p.versions.some(v=>decodeURI(new URL(v.path,root).pathname)===decodeURI(location.pathname)));
  const version=current?.versions.find(v=>decodeURI(new URL(v.path,root).pathname)===decodeURI(location.pathname));
  const q=new URLSearchParams(location.search),review=q.get('mode')==='review',release=q.get('release')||version?.id;
  window.prototypeContext={root,page:current,version,release,review};
  for(const host of document.querySelectorAll('[data-prototype-navigation]')){
    host.classList.add('prototype-navigation');host.replaceChildren();const title=document.createElement('h1');title.textContent='闪回 · 产品原型';host.append(title);
    for(const group of new Set(config.pages.map(p=>p.group))){
      const section=document.createElement('details');section.open=true;const summary=document.createElement('summary');summary.textContent=group;section.append(summary);
      for(const page of config.pages.filter(p=>p.group===group)){
        const v=release==='all'?config.releases.slice().reverse().map(id=>page.versions.find(v=>v.id===id)).find(Boolean):page.versions.find(v=>v.id===release);if(!v)continue;
        const url=new URL('index.html',root);url.searchParams.set('release',release);url.searchParams.set('page',page.id);if(review)url.searchParams.set('mode','review');
        const link=document.createElement('a');link.href=url.href;link.target='_top';link.className='prototype-page-link';link.textContent=page.name+' · '+v.id.toUpperCase();if(page===current)link.setAttribute('aria-current','page');section.append(link);
      }if(section.children.length>1)host.append(section);
    }
  }
})();

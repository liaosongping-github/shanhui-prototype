(() => {
  const script = document.currentScript;
  const root = new URL('../', script.src);
  const currentPath = decodeURI(location.pathname);
  const config = window.prototypeConfig;
  for (const host of document.querySelectorAll('[data-prototype-navigation]')) {
    host.classList.add('prototype-navigation');
    host.setAttribute('aria-label', '产品原型导航');
    host.replaceChildren();
    const title = document.createElement('h1');
    title.textContent = '闪回 · 产品原型';
    const note = document.createElement('p');
    note.textContent = '持续积累，按需复刻';
    host.append(title, note);
    for (const group of new Set(config.pages.map(page => page.group))) {
      const section = document.createElement('details');
      section.open = true;
      const summary = document.createElement('summary');
      summary.textContent = group;
      section.append(summary);
      for (const page of config.pages.filter(page => page.group === group)) {
        const active = page.versions.find(version => decodeURI(new URL(version.path, root).pathname) === currentPath);
        const version = active || page.versions.at(-1);
        const link = document.createElement('a');
        const url = new URL('index.html', root);
        url.searchParams.set('page', page.id);
        url.searchParams.set('version', version.id);
        link.href = url.href;
        link.target = '_top';
        link.className = 'prototype-page-link';
        link.textContent = page.name + ' · ' + version.id;
        if (active) link.setAttribute('aria-current', 'page');
        section.append(link);
      }
      host.append(section);
    }
    const help = document.createElement('a');
    help.href = new URL('README.md', root).href;
    help.target = '_blank';
    help.rel = 'noopener';
    help.className = 'prototype-help';
    help.textContent = '使用说明';
    host.append(help);
  }
})();

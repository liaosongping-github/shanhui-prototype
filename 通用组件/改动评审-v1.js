(() => {
  const config = window.prototypeReview;
  const shell = document.querySelector('.shell');
  const bar = document.createElement('div'); bar.className = 'review-bar';
  const title = document.createElement('strong'); title.textContent = config.version + ' · 迭代评审';
  const compare = document.createElement('button'); compare.textContent = '左右对照';
  const toggle = document.createElement('button'); toggle.textContent = '隐藏改动标注';
  const hosted = window.parent !== window && new URLSearchParams(location.search).get('toolbar') === 'parent';
  const page = window.prototypeConfig.pages.find(p => p.versions.some(v => decodeURI(new URL(v.path, new URL('../',location.href)).pathname) === decodeURI(location.pathname)));
  const versions = document.createElement('select'); versions.setAttribute('aria-label','选择页面版本');
  if (page) {
    title.textContent = page.name;
    for (const version of page.versions.filter(v=>!v.hidden)) versions.add(new Option(version.label,version.path));
    versions.value = page.versions.find(v=>v.id===config.version)?.path || '';
    versions.onchange=()=>{location.href=new URL('../'+versions.value,location.href).href;};
  }
  bar.append(title, versions, compare, toggle); bar.hidden = hosted;
  const layout = document.createElement('div'); layout.className = 'review-layout';
  const left = document.createElement('section'); left.className = 'review-baseline'; left.hidden = true;
  const heading = document.createElement('h2'); heading.textContent = '现网基线 · 20261110（冻结）';
  const frame = document.createElement('iframe'); frame.title = '本次冻结现网基线'; frame.src = config.baseline + '?compare=1';
  left.append(heading, frame);
  const right = document.createElement('section'); right.className = 'review-current';
  const rightTitle = document.createElement('h2'); rightTitle.textContent = '本次迭代 · ' + config.version; rightTitle.hidden = true; right.append(rightTitle, shell);
  const notes = document.createElement('aside'); notes.className = 'review-notes'; notes.setAttribute('aria-label','本次改动说明');
  const notesHeader = document.createElement('div');
  notesHeader.className = 'review-notes-header';
  const notesToggle = document.createElement('button');
  notesToggle.type = 'button';
  notesToggle.className = 'review-notes-toggle';
  notesToggle.setAttribute('aria-controls', 'review-notes-content');
  const notesContent = document.createElement('div');
  notesContent.id = 'review-notes-content';
  notesContent.className = 'review-notes-content';
  const notesResize = document.createElement('div');
  notesResize.className = 'review-notes-resize';
  notesResize.tabIndex = 0;
  notesResize.setAttribute('role', 'separator');
  notesResize.setAttribute('aria-orientation', 'vertical');
  notesResize.setAttribute('aria-controls', notesContent.id);
  notesResize.setAttribute('aria-label', '调整说明栏宽度');
  notesHeader.append(notesToggle);
  notes.append(notesResize, notesHeader, notesContent);

  function setNotesExpanded(expanded) {
    notesContent.hidden = !expanded;
    notesResize.hidden = !expanded;
    notes.classList.toggle('review-notes-collapsed', !expanded);
    notesToggle.setAttribute('aria-expanded', String(expanded));
    notesToggle.setAttribute('aria-label', expanded ? '收起说明' : '展开说明');
  }
  setNotesExpanded(true);
  notesToggle.onclick = () => setNotesExpanded(notesContent.hidden);

  let preferredNotesWidth = 300;
  function notesWidthLimits() {
    const max = Math.min(680, Math.floor(window.innerWidth * 0.45));
    return {min: Math.min(240, max), max};
  }
  function applyNotesWidth(width) {
    const {min, max} = notesWidthLimits();
    const next = Math.min(max, Math.max(min, Math.round(width)));
    notes.style.setProperty('--review-notes-width', next + 'px');
    notesResize.setAttribute('aria-valuemin', min);
    notesResize.setAttribute('aria-valuemax', max);
    notesResize.setAttribute('aria-valuenow', next);
    return next;
  }
  applyNotesWidth(preferredNotesWidth);
  window.addEventListener('resize', () => applyNotesWidth(preferredNotesWidth));

  notesResize.onkeydown = event => {
    const current = notes.getBoundingClientRect().width;
    const {min, max} = notesWidthLimits();
    const widths = {ArrowLeft: current + 20, ArrowRight: current - 20, Home: min, End: max};
    if (!Object.hasOwn(widths, event.key)) return;
    event.preventDefault();
    preferredNotesWidth = applyNotesWidth(widths[event.key]);
  };
  notesResize.onpointerdown = event => {
    if (event.button !== 0 || !event.isPrimary) return;
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = notes.getBoundingClientRect().width;
    notesResize.setPointerCapture(event.pointerId);
    notes.classList.add('review-notes-dragging');
    notesResize.onpointermove = move => {
      if (move.pointerId === event.pointerId) {
        preferredNotesWidth = applyNotesWidth(startWidth + startX - move.clientX);
      }
    };
    function finish(end) {
      if (end.pointerId !== event.pointerId) return;
      notesResize.onpointermove = null;
      notes.classList.remove('review-notes-dragging');
    }
    notesResize.onpointerup = finish;
    notesResize.onpointercancel = finish;
    notesResize.onlostpointercapture = finish;
  };

  function locate(item) {
    if (item.id === 'C01') document.querySelector('button.outline[data-change="C01"]')?.click();
    const target = item.id === 'C01' ? document.querySelector('.prototype-modal [data-change="C01"]') : document.querySelector(item.target);
    target?.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'});
  }
  function createMarker(id, actionLabel, onClick) {
    const marker = document.createElement('button');
    marker.type = 'button'; marker.className = 'review-marker'; marker.textContent = id;
    marker.setAttribute('aria-label', actionLabel + ' ' + id);
    marker.onclick = onClick;
    return marker;
  }
  const fields = [['title','标注标题'],['before','现网'],['after','本次改动'],['interaction','交互逻辑'],['logic','处理逻辑'],['acceptance','验收要点']];
  const storageKey = 'prototype-review:' + location.pathname + ':' + config.version + ':' + config.baseline;
  const overrides = {};
  const imageSource = /^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i;
  const richTags = new Set('P DIV BR STRONG B EM I U S STRIKE SPAN FONT UL OL LI H1 H2 H3 H4 H5 H6 BLOCKQUOTE PRE CODE'.split(' '));
  const bulletStyles = [
    ['dot','圆点',['●','○','○','○','●']],
    ['triangle','三角',['▶','▷','▷','▷','▶']],
    ['diamond','菱形',['◆','◇','◇','◇','◆']]
  ];
  const numberStyles = [
    ['outline','多级数字',['1.','1.1','1.2','1.3','2.']],
    ['number-dot','数字与圆圈',['1.','○','○','○','2.']],
    ['number-letter','数字与字母',['1.','a.','b.','c.','2.']],
    ['paren','右括号编号',['1)','a)','b)','c)','2)']],
    ['letter','字母编号',['A.','a.','b.','c.','B.']],
    ['padded','补零编号',['01.','a.','b.','c.','02.']],
    ['chinese','中文编号',['一、','1.','2.','3.','二、']],
    ['chinese-paren','中文括号编号',['（一）','1.','2.','3.','（二）']]
  ];
  let storageWarning = '';
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    for (const item of config.items) {
      const value = saved[item.id];
      if (!value || typeof value !== 'object') continue;
      const clean = {};
      for (const [key] of fields) if (typeof value[key] === 'string') clean[key] = value[key];
      clean.images = Array.isArray(value.images) ? value.images.filter(i=>i && typeof i.src === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,/.test(i.src)).map(i=>({src:i.src,name:String(i.name || '标注图片')})) : [];
      if (typeof value.content === 'string') clean.content = value.content;
      overrides[item.id] = clean; Object.assign(item,clean);
    }
  } catch (_) { storageWarning = '浏览器无法读取本地标注；保存时将再次尝试。'; }
  if (storageWarning) {
    const warning = document.createElement('p');
    warning.className = 'review-storage-hint'; warning.textContent = storageWarning;
    notesContent.append(warning);
  }
  function cleanContent(html) {
    const source = document.createElement('template'); source.innerHTML = html;
    const result = document.createElement('div');
    function copy(node, parent) {
      if (node.nodeType === Node.TEXT_NODE) { parent.append(node.data); return; }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName;
      if (['SCRIPT','STYLE','IFRAME','OBJECT','SVG','TEMPLATE'].includes(tag)) return;
      if (tag === 'IMG') {
        const src = node.getAttribute('src') || '';
        if (!imageSource.test(src)) return;
        const img = document.createElement('img'); img.src = src; img.alt = node.alt || '标注图片';
        parent.append(img); return;
      }
      const child = richTags.has(tag) ? document.createElement(tag === 'FONT' ? 'span' : tag) : parent;
      if (child !== parent) {
        const color = node.style?.color || (tag === 'FONT' ? node.getAttribute('color') : '');
        if (color && /^(?:#[\da-f]{3,8}|rgba?\([\d.,% /]+\))$/i.test(color)) child.style.color = color;
        const listStyle = node.getAttribute('data-review-list');
        const allowedStyles = tag === 'UL' ? bulletStyles : tag === 'OL' ? numberStyles : [];
        if (allowedStyles.some(([value])=>value === listStyle)) child.dataset.reviewList = listStyle;
        if (tag === 'OL' && /^-?\d+$/.test(node.getAttribute('start') || '')) {
          child.start = node.start;
          child.style.setProperty('--review-list-start', String(node.start - 1));
        }
        parent.append(child);
      }
      for (const nested of node.childNodes) copy(nested, child);
    }
    for (const node of source.content.childNodes) copy(node, result);
    return result;
  }
  function contentFor(item) {
    if (typeof item.content === 'string') return cleanContent(item.content);
    const result = document.createElement('div');
    const heading = document.createElement('h3'); heading.textContent = item.title; result.append(heading);
    for (const [key,label] of fields.slice(1)) {
      const p = document.createElement('p'), strong = document.createElement('strong');
      strong.textContent = label + '：'; p.append(strong, item[key] || ''); result.append(p);
    }
    for (const image of item.images || []) {
      if (!imageSource.test(image.src)) continue;
      const img = document.createElement('img'); img.src = image.src; img.alt = image.name;
      result.append(img);
    }
    return result;
  }
  function displayContent(item) {
    const body = contentFor(item); body.className = 'review-rich';
    for (const img of body.querySelectorAll('img')) img.replaceWith(imageButton({src:img.src,name:img.alt}));
    return body;
  }
  function previewImage(image) {
    const viewer = document.createElement('dialog'); viewer.className='review-image-viewer'; viewer.setAttribute('aria-label','图片预览');
    const close=document.createElement('button'); close.textContent='关闭'; close.onclick=()=>viewer.close();
    const img=document.createElement('img'); img.src=image.src; img.alt=image.name;
    viewer.append(close,img); document.body.append(viewer); viewer.addEventListener('close',()=>viewer.remove());
    viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close();}); viewer.showModal();
  }
  function imageButton(image) {
    const button=document.createElement('button'); button.type='button'; button.className='review-image-thumb'; button.setAttribute('aria-label','放大查看：'+image.name);
    const img=document.createElement('img'); img.src=image.src; img.alt=image.name; button.append(img); button.onclick=()=>previewImage(image); return button;
  }
  function editItem(item, render, trigger) {
    const dialog = document.createElement('dialog'); dialog.className = 'review-editor';
    dialog.setAttribute('aria-label','编辑标注 '+item.id);
    const title = document.createElement('h2'); title.textContent = '编辑标注 '+item.id;
    const editor = document.createElement('div'); editor.className = 'review-rich review-rich-editor';
    editor.contentEditable = 'true'; editor.setAttribute('role','textbox');
    editor.setAttribute('aria-multiline','true'); editor.setAttribute('aria-label','标注正文');
    editor.replaceChildren(...contentFor(item).childNodes);

    const toolbar = document.createElement('div'); toolbar.className = 'review-editor-toolbar';
    toolbar.setAttribute('role','group'); toolbar.setAttribute('aria-label','正文格式');
    let cursor;
    function rememberCursor() {
      const selection = window.getSelection();
      if (selection.rangeCount && editor.contains(selection.getRangeAt(0).commonAncestorContainer)) {
        cursor = selection.getRangeAt(0).cloneRange();
      }
    }
    function restoreCursor(range = cursor) {
      editor.focus();
      const selection = window.getSelection();
      if (!range || !editor.contains(range.commonAncestorContainer)) {
        range = document.createRange(); range.selectNodeContents(editor); range.collapse(false);
      }
      selection.removeAllRanges(); selection.addRange(range);
    }
    let activeMenu;
    function closeMenu(returnFocus = false) {
      if (!activeMenu) return;
      const {panel, button} = activeMenu;
      panel.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      activeMenu = null;
      if (returnFocus) button.focus();
    }
    function buttonFor(parent, label, text, action) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.setAttribute('aria-label', label);
      button.title = label;
      button.addEventListener('mousedown', event=>event.preventDefault());
      button.onclick = action;
      parent.append(button);
      return button;
    }
    function format(command, value) {
      rememberCursor();
      closeMenu();
      // Keep the browser's active typing format when the editor still owns focus.
      if (document.activeElement !== editor) restoreCursor();
      document.execCommand(command, false, value);
      rememberCursor();
      refreshToolbar();
    }
    function dropdown(group, label, text, panelClass = '') {
      const panel = document.createElement('div');
      panel.className = 'review-format-menu ' + panelClass;
      panel.hidden = true;
      const button = buttonFor(group, label, text, ()=>{
        rememberCursor();
        if (activeMenu?.panel === panel) { closeMenu(); return; }
        closeMenu();
        panel.hidden = false;
        button.setAttribute('aria-expanded', 'true');
        activeMenu = {panel, button};
        panel.style.left = '0px';
        const overflow = panel.getBoundingClientRect().right - toolbar.getBoundingClientRect().right;
        if (overflow > 0) panel.style.left = -overflow + 'px';
        panel.querySelector('button')?.focus();
      });
      button.setAttribute('aria-expanded', 'false');
      group.append(panel);
      return {button, panel};
    }
    function group() {
      const element = document.createElement('div');
      element.className = 'review-format-group';
      toolbar.append(element);
      return element;
    }
    const blockStyles = [['h1','标题1','H₁'],['h2','标题2','H₂'],['h3','标题3','H₃'],['p','正文','T']];
    const block = dropdown(group(), '段落样式', '正文 ⌄', 'review-block-menu');
    const blockOptions = blockStyles.map(([tag,label,icon])=>{
      const option = buttonFor(block.panel, label, icon + '  ' + label, ()=>format('formatBlock', tag));
      return [tag, option];
    });
    const bold = buttonFor(toolbar, '加粗', 'B', ()=>format('bold'));
    bold.className = 'review-format-bold';
    const colors = [
      ['橙红','#ed4e09'],['橙色','#ff9300'],['金黄','#c59b00'],['玫红','#e9008b'],
      ['青蓝','#0085a5'],['草绿','#509e00'],['翠绿','#00ba55'],['紫色','#b61cf6'],
      ['默认颜色','#253447']
    ];
    const colorGroup = group();
    let lastColor = colors.at(-1)[1];
    const colorButton = buttonFor(colorGroup, '应用文字颜色', 'A', ()=>format('foreColor', lastColor));
    colorButton.className = 'review-format-color';
    const colorMenu = dropdown(colorGroup, '选择文字颜色', '⌄', 'review-color-menu');
    colorMenu.button.classList.add('review-format-arrow');
    for (const [label, color] of colors) {
      const swatch = buttonFor(colorMenu.panel, label, '', ()=>{
        lastColor = color;
        format('foreColor', color);
      });
      swatch.style.setProperty('--swatch', color);
      if (label === '默认颜色') {
        swatch.textContent = label;
        swatch.className = 'review-color-default';
      } else swatch.className = 'review-color-swatch';
    }
    const italic = buttonFor(toolbar, '斜体', 'I', ()=>format('italic'));
    italic.className = 'review-format-italic';
    const strike = buttonFor(toolbar, '删除线', 'S', ()=>format('strikeThrough'));
    strike.className = 'review-format-strike';

    function currentList() {
      const selection = window.getSelection();
      const node = selection.anchorNode;
      const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
      const list = element?.closest('ul,ol');
      return editor.contains(list) ? list : null;
    }
    function listTools(tag, label, icon, styles, command) {
      const listGroup = group();
      let lastStyle = styles[0][0];
      function applyList(style, toggleExisting) {
        rememberCursor();
        closeMenu();
        if (document.activeElement !== editor) restoreCursor();
        const selection = window.getSelection();
        const existing = currentList();
        if (existing?.localName !== tag || toggleExisting) document.execCommand(command, false);
        const selected = currentList();
        if (selected?.localName === tag) {
          const range = selection.rangeCount && selection.getRangeAt(0);
          selected.dataset.reviewList = style;
          if (range && !range.collapsed) {
            for (const list of editor.querySelectorAll(tag)) {
              if (range.intersectsNode(list) && !list.contains(selected) && !selected.contains(list)) {
                list.dataset.reviewList = style;
              }
            }
          }
        }
        rememberCursor();
        refreshToolbar();
      }
      const main = buttonFor(listGroup, label, icon, ()=>applyList(lastStyle, true));
      main.classList.add('review-list-icon');
      const menu = dropdown(listGroup, '选择' + label + '样式', '⌄', 'review-list-menu review-list-menu-' + tag);
      menu.button.classList.add('review-format-arrow');
      const options = styles.map(([value, name, markers])=>{
        const option = buttonFor(menu.panel, name, '', ()=>{
          lastStyle = value;
          applyList(value, false);
        });
        markers.forEach((marker,index)=>{
          const row = document.createElement('span');
          row.className = 'review-list-sample';
          if (index > 0 && index < markers.length - 1) row.classList.add('review-list-sample-nested');
          const glyph = document.createElement('span');
          glyph.textContent = marker;
          row.append(glyph, document.createElement('i'));
          option.append(row);
        });
        return [value,option];
      });
      return {tag, main, options, defaultStyle:styles[0][0]};
    }
    const bullets = listTools('ul','项目列表','',bulletStyles,'insertUnorderedList');
    bullets.main.classList.add('review-bullet-icon');
    const numbering = listTools('ol','编号列表','≡',numberStyles,'insertOrderedList');
    const numberingIcon = document.createElement('span');
    numberingIcon.className = 'review-number-icon';
    numberingIcon.textContent = '₁₂';
    numbering.main.prepend(numberingIcon);

    function refreshToolbar() {
      const selection = window.getSelection();
      if (!selection.rangeCount || !editor.contains(selection.getRangeAt(0).commonAncestorContainer)) return;
      const tag = String(document.queryCommandValue('formatBlock')).toLowerCase();
      const currentBlock = blockStyles.find(([value])=>value === tag) || blockStyles.at(-1);
      block.button.textContent = currentBlock[1] + ' ⌄';
      for (const [value, option] of blockOptions) option.setAttribute('aria-pressed', String(value === currentBlock[0]));
      for (const [button, command] of [[bold,'bold'],[italic,'italic'],[strike,'strikeThrough']]) {
        button.setAttribute('aria-pressed', String(document.queryCommandState(command)));
      }
      colorButton.style.setProperty('--swatch', lastColor);
      const current = currentList();
      for (const {tag, main, options, defaultStyle} of [bullets, numbering]) {
        const isActive = current?.localName === tag;
        main.setAttribute('aria-pressed', String(isActive));
        for (const [value, option] of options) {
          option.setAttribute('aria-pressed', String(isActive && value === (current.dataset.reviewList || defaultStyle)));
        }
      }
    }
    function updateSelection() {
      rememberCursor();
      refreshToolbar();
    }
    dialog.addEventListener('pointerdown', event=>{
      if (!activeMenu) return;
      if (!activeMenu.panel.parentElement.contains(event.target)) closeMenu();
    });
    dialog.addEventListener('keydown', event=>{
      if (event.key !== 'Escape' || !activeMenu) return;
      event.preventDefault();
      event.stopPropagation();
      closeMenu(true);
    });
    editor.addEventListener('keydown', event=>{
      if (event.key !== 'Tab' || !currentList()) return;
      // Let keyboard users leave the editor from the first list level with Shift+Tab.
      if (event.shiftKey && !currentList().parentElement.closest('ol,ul')) return;
      event.preventDefault();
      format(event.shiftKey ? 'outdent' : 'indent');
    });
    const upload = document.createElement('input'); upload.type = 'file'; upload.hidden = true;
    const mimeTypes = ['image/png','image/jpeg','image/webp','image/gif'];
    upload.accept = mimeTypes.join(','); upload.multiple = true;
    let uploadPosition;
    const insert = buttonFor(toolbar, '插入图片', '插入图片', ()=>{rememberCursor(); closeMenu(); uploadPosition = cursor?.cloneRange(); upload.click();});
    insert.className = 'review-format-insert';
    const status = document.createElement('p'); status.setAttribute('role','status');
    const actions = document.createElement('div'); actions.className = 'review-editor-actions';
    const save = document.createElement('button'); save.textContent = '保存';
    const cancel = document.createElement('button'); cancel.textContent = '取消';
    cancel.onclick = ()=>dialog.close(); actions.append(save,cancel);
    async function insertImages(files, position) {
      if (!files.length || save.disabled) return;
      save.disabled = insert.disabled = true; status.textContent = '正在读取图片…';
      try {
        const images = document.createElement('div');
        for (const file of files) {
          if (!mimeTypes.includes(file.type) || file.size > 2*1024*1024) {
            throw new Error('请选择 PNG、JPG、WebP 或 GIF 图片，每张不超过 2 MB。');
          }
          const src = await new Promise((resolve,reject)=>{
            const reader = new FileReader(); reader.onload = ()=>resolve(reader.result);
            reader.onerror = ()=>reject(new Error('图片读取失败，请重试。'));
            reader.readAsDataURL(file);
          });
          const img = document.createElement('img'); img.src = src; img.alt = file.name || '标注图片';
          images.append(img);
        }
        if (!dialog.open) return;
        restoreCursor(position); document.execCommand('insertHTML',false,images.innerHTML); rememberCursor();
        status.textContent = '';
      } catch (error) { status.textContent = error.message; }
      finally { save.disabled = insert.disabled = false; upload.value = ''; }
    }
    upload.onchange = ()=>insertImages(Array.from(upload.files),uploadPosition);
    editor.addEventListener('paste',event=>{
      event.preventDefault();
      const files = Array.from(event.clipboardData.files).filter(file=>file.type.startsWith('image/'));
      if (files.length) { rememberCursor(); insertImages(files,cursor?.cloneRange()); return; }
      const html = event.clipboardData.getData('text/html');
      const clean = html && cleanContent(html);
      if (clean?.innerHTML) document.execCommand('insertHTML',false,clean.innerHTML);
      else document.execCommand('insertText',false,event.clipboardData.getData('text/plain'));
      rememberCursor();
    });
    editor.addEventListener('drop',event=>event.preventDefault());
    save.onclick = ()=>{
      const draft = {content:cleanContent(editor.innerHTML).innerHTML};
      try { localStorage.setItem(storageKey,JSON.stringify({...overrides,[item.id]:draft})); }
      catch (_) { status.textContent = '保存失败：浏览器存储不可用或空间不足。当前内容仍保留，可减少图片后重试。'; return; }
      overrides[item.id] = draft; item.content = draft.content; render(); dialog.close();
    };
    dialog.append(title,toolbar,editor,upload,status,actions); document.body.append(dialog);
    document.addEventListener('selectionchange',updateSelection);
    editor.addEventListener('input',updateSelection);
    dialog.addEventListener('close',()=>{
      document.removeEventListener('selectionchange',updateSelection);
      dialog.remove();
      (document.getElementById('review-'+item.id)?.querySelector('.review-edit-button') || trigger).focus();
    });
    dialog.showModal(); restoreCursor(); updateSelection();
  }
  for (const item of config.items) {
    const card = document.createElement('article'); card.id = 'review-' + item.id;
    function render() {
      card.replaceChildren();
      const button = createMarker(item.id, '定位改动', () => locate(item));
      const edit=document.createElement('button');edit.className='review-edit-button';edit.textContent='编辑';edit.setAttribute('aria-label','编辑标注 '+item.id);edit.onclick=()=>editItem(item,render,card.querySelector('.review-edit-button'));
      card.append(button,edit);
      card.append(displayContent(item));
    }
    render(); notesContent.append(card);
  }
  layout.append(left,right,notes); document.body.prepend(bar,layout);
  let comparing = false, annotations = true;
  compare.onclick = () => { comparing = !comparing; left.hidden = !comparing; layout.classList.toggle('review-comparing',comparing); compare.textContent = comparing?'单页操作':'左右对照'; rightTitle.hidden = !comparing; report(); };
  toggle.onclick = () => { annotations = !annotations; document.body.classList.toggle('review-hidden',!annotations); notes.hidden = !annotations; toggle.textContent = annotations?'隐藏改动标注':'显示改动标注'; report(); };
  function report() { if(hosted) window.parent.postMessage({type:'prototype-review-state',comparing,annotations},'*'); }
  window.addEventListener('message',event=>{
    if(!hosted||event.source!==window.parent||event.data?.type!=='prototype-review-command')return;
    if(event.data.action==='compare')compare.onclick();
    else if(event.data.action==='annotations')toggle.onclick();
    else if(event.data.action==='state')report();
  });
  report();
  function annotate() {
    for (const target of document.querySelectorAll('[data-change]')) {
      if (target.dataset.annotated) continue; target.dataset.annotated = 'true';
      const marker = createMarker(target.dataset.change, '查看改动', () => {
        const item = config.items.find(item => item.id === target.dataset.change);
        if (target.closest('dialog')) {
          let detail = target.closest('dialog').querySelector('.review-inline-note');
          if (!detail) { detail = document.createElement('div'); detail.className = 'review-inline-note'; target.closest('dialog').querySelector('.prototype-modal-body').append(detail); }
          if (typeof item.content === 'string') detail.replaceChildren(displayContent(item));
          else detail.textContent = item.id + ' · ' + item.after + ' 交互：' + item.interaction + ' 处理：' + item.logic;
        } else {
          setNotesExpanded(true);
          document.getElementById('review-'+item.id)?.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'});
        }
      });
      target.after(marker);
    }
  }
  annotate(); new MutationObserver(annotate).observe(document.body,{childList:true,subtree:true});
})();

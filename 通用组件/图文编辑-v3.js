(() => {
window.createPrototypeEditor = (persist) => {
const fields = [['title','标题'],['before','修改前'],['after','本次改动'],['interaction','交互逻辑'],['logic','处理逻辑'],['acceptance','验收要点']];
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
    save.onclick = async()=>{
      const draft = {content:cleanContent(editor.innerHTML).innerHTML};
      const previous = item.content;
      item.content = draft.content;
      save.disabled=cancel.disabled=true;editor.contentEditable='false';toolbar.inert=true;
      let saved=false;
      try{saved=await persist();}catch{}finally{save.disabled=cancel.disabled=false;editor.contentEditable='true';toolbar.inert=false;}
      if (!saved) { item.content = previous; status.textContent = '未保存到项目，请查看顶部提示；编辑内容仍保留在框中。'; return; }
      render(); dialog.close();
    };
    dialog.append(title,toolbar,editor,upload,status,actions); document.body.append(dialog);
    document.addEventListener('selectionchange',updateSelection);
    editor.addEventListener('input',updateSelection);
    dialog.addEventListener('cancel',event=>{if(cancel.disabled)event.preventDefault();});
    dialog.addEventListener('close',()=>{
      document.removeEventListener('selectionchange',updateSelection);
      dialog.remove();
      const nextFocus = trigger?.isConnected ? trigger : document.getElementById('review-'+item.id)?.querySelector('.review-edit-button');
      nextFocus?.focus();
    });
    dialog.showModal(); restoreCursor(); updateSelection();
  }

return {editItem, displayContent, cleanContent};
};
})();

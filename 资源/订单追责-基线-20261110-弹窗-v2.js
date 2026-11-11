(() => {
  let current, sequence = 0;
  window.openPrototypeModal = function ({title, content, width = 1050, confirmText = '确认', cancelText = '取消', onConfirm, onClose} = {}) {
    if (current) current.close('replaced');
    const opener = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'prototype-modal';
    dialog.style.width = width + 'px';
    const heading = document.createElement('h2');
    heading.id = 'prototype-modal-title-' + (++sequence);
    heading.textContent = title;
    dialog.setAttribute('aria-labelledby', heading.id);
    const head = document.createElement('header'); head.className = 'prototype-modal-head';
    const x = document.createElement('button'); x.type = 'button'; x.className = 'prototype-modal-close';
    x.textContent = '×'; x.setAttribute('aria-label', '关闭弹窗');
    const body = document.createElement('div'); body.className = 'prototype-modal-body'; body.append(content);
    const foot = document.createElement('footer'); foot.className = 'prototype-modal-footer';
    const confirm = document.createElement('button'); confirm.type = 'button'; confirm.className = 'green'; confirm.textContent = confirmText;
    const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'gray'; cancel.textContent = cancelText;
    const feedback = document.createElement('p'); feedback.className = 'prototype-modal-feedback'; feedback.hidden = true; feedback.setAttribute('role', 'status');
    let closed = false, busy = false;
    const api = {element: dialog, close(reason = 'cancel') {
      if (closed) return; closed = true;
      dialog.close(); dialog.remove();
      if (current === api) current = null;
      if (opener?.isConnected) opener.focus();
      onClose?.(reason);
    }, setMessage(text) { feedback.textContent = text; feedback.hidden = !text; }};
    x.onclick = () => api.close(); cancel.onclick = () => api.close();
    dialog.addEventListener('cancel', event => { event.preventDefault(); api.close('escape'); });
    confirm.onclick = async () => {
      if (busy) return; busy = true; confirm.disabled = true;
      try { if (onConfirm && await onConfirm(api) === true) api.close('confirm'); }
      catch (error) { api.setMessage('操作未完成，请重试。'); }
      finally { busy = false; confirm.disabled = false; }
    };
    head.append(heading, x); foot.append(confirm, cancel); body.append(feedback);
    dialog.append(head, body, foot); document.body.append(dialog);
    current = api; dialog.showModal(); x.focus(); return api;
  };
})();

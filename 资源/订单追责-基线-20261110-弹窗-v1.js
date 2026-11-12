window.showPrototypeDialog = function(title, content) {
  let dialog = document.getElementById('prototype-dialog');
  if (!dialog) { dialog = document.createElement('dialog'); dialog.id = 'prototype-dialog'; document.body.append(dialog); }
  dialog.replaceChildren();
  const head = document.createElement('div'); head.className = 'dialog-head';
  const heading = document.createElement('h2'); heading.textContent = title;
  const close = document.createElement('button'); close.textContent = '关闭'; close.onclick = () => dialog.close();
  head.append(heading, close); dialog.append(head, content); dialog.showModal();
};

window.showPrototypeMessage = (() => {
  const region = document.createElement('div');
  region.className = 'prototype-message-region';
  region.setAttribute('role', 'status');
  document.body.append(region);
  let dismissal;

  return function showMessage(text, type = 'success') {
    clearTimeout(dismissal);
    const message = document.createElement('div');
    message.className = 'prototype-message prototype-message-' + type;
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = type === 'success' ? '✓' : '!';
    message.append(icon, document.createTextNode(text));
    region.replaceChildren(message);
    dismissal = setTimeout(() => region.replaceChildren(), 2000);
  };
})();

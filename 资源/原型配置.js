window.prototypeConfig = {
  releases: ['v1.1'],
  pages: [{ id: 'orders', group: '商务处理', name: '订单追责', fresh: false,
    versions: [{ id: 'v1.0', hidden: true, label: 'v1.0 · 首轮复核定稿', path: '页面原型/订单追责-v1.0-截图复刻.html' }, { id: 'live', hidden: true, label: '现网页面', path: '页面原型/订单追责-现网复刻.html', role: 'live' }, { id: 'baseline-20261110', hidden: true, label: '本次基线 · 20261110', path: '页面原型/订单追责-基线-20261110.html', role: 'baseline' }, { id: 'v1.1', label: 'V1.1', path: '页面原型/订单追责-v1.1-迭代版.html', role: 'iteration', baseline: 'baseline-20261110' }] },
  { id: 'third-party-after-sales', group: '回收业务', name: '三方售后规则', fresh: false,
    versions: [{ id: 'live', hidden: true, label: '现网页面', path: '页面原型/三方售后规则-现网复刻.html', role: 'live' },
      { id: 'baseline-20261111', hidden: true, label: '本次基线 · 20261111', path: '页面原型/三方售后规则-基线-20261111.html', role: 'baseline' },
      { id: 'v1.1', label: 'V1.1', path: '页面原型/三方售后规则-v1.1-迭代版.html', role: 'iteration', baseline: 'baseline-20261111' }] },
  { id: 'xiaomi-claim-mapping', group: '待发布菜单', name: '小米零售通三方追差映射', fresh: true,
    versions: [{ id: 'v1.1', label: 'V1.1', path: '页面原型/小米零售通三方追差映射-v1.1-截图复刻.html', role: 'iteration' }] },
  { id: 'claim-option-mapping', group: '回收业务', name: '三方追差选项映射', fresh: true,
    versions: [{ id: 'v1.1', label: 'V1.1', path: '页面原型/三方追差选项映射-v1.1-截图复刻.html', role: 'iteration' }] }]
};

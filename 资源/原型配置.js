window.prototypeConfig = {
  products: [{id:'boss',name:'BOSS系统'}, {id:'youpin',name:'闪回有品'}, {id:'boss-channel',name:'BOSS-渠道版'}, {id:'h5',name:'H5页面'}],
  releases: ['v1.1', 'v1.2', 'v1.3'],
  releaseNames: { 'v1.1': '生态20261112', 'v1.2': '生态20261120', 'v1.3': 'v1.3' },
  pages: [
    {
      id: 'orders', group: '商务处理', name: '订单追责', fresh: false,
      versions: [
        { id: 'v1.0', hidden: true, label: 'v1.0 · 首轮复核定稿', path: '页面原型/订单追责-v1.0-截图复刻.html' },
        { id: 'live', hidden: true, label: '现网页面', path: '页面原型/订单追责-现网复刻.html', role: 'live' },
        { id: 'baseline-20261110', hidden: true, label: '本次基线 · 20261110', path: '页面原型/订单追责-基线-20261110.html', role: 'baseline' },
        { id: 'v1.1', label: '生态20261112', path: '页面原型/订单追责-v1.1-迭代版.html', role: 'iteration', baseline: 'baseline-20261110' },
        { id: 'v1.3', sourceVersion: 'v1.1', path: '页面原型/订单追责-v1.3-迭代版.html', role: 'iteration' }
      ]
    },
    {
      id: 'return-processing', group: '仓库管理', name: '退货处理单', fresh: true,
      versions: [{ id: 'v1.3', sourceVersion: null, path: '页面原型/退货处理单-v1.3-截图复刻.html', role: 'iteration' }]
    },
    {
      id: 'third-party-after-sales', group: '回收业务', name: '三方售后规则', fresh: false,
      versions: [
        { id: 'live', hidden: true, label: '现网页面', path: '页面原型/三方售后规则-现网复刻.html', role: 'live' },
        { id: 'baseline-20261111', hidden: true, label: '本次基线 · 20261111', path: '页面原型/三方售后规则-基线-20261111.html', role: 'baseline' },
        { id: 'v1.1', label: '生态20261112', path: '页面原型/三方售后规则-v1.1-迭代版.html', role: 'iteration', baseline: 'baseline-20261111' }
      ]
    },
    {
      id: 'xiaomi-claim-mapping', group: '待发布菜单', name: '小米零售通三方追差映射', fresh: true,
      versions: [{ id: 'v1.1', label: '生态20261112', path: '页面原型/小米零售通三方追差映射-v1.1-截图复刻.html', role: 'iteration' }]
    },
    {
      id: 'claim-option-mapping', group: '回收业务', name: '三方追差选项映射', fresh: true,
      versions: [{ id: 'v1.1', label: '生态20261112', path: '页面原型/三方追差选项映射-v1.1-截图复刻.html', role: 'iteration' }]
    },
    {
      id: 'after-sales-orders', group: '销售管理', name: '售后工单', fresh: true,
      versions: [{ id: 'v1.2', label: '生态20261120', path: '页面原型/售后工单-v1.2-截图复刻.html', role: 'iteration' }, { id: 'v1.3', sourceVersion: 'v1.2', path: '页面原型/售后工单-v1.3-迭代版.html', role: 'iteration' }]
    },
    {
      id: 'after-sales-inspection', group: '销售管理', name: '售后检测', fresh: true,
      versions: [{ id: 'v1.2', label: '生态20261120', path: '页面原型/售后检测-v1.2-截图复刻.html', role: 'iteration' }]
    },
    {id:'youpin-buy',product:'youpin',group:'闪回有品',name:'买货',versions:[{id:'v1.2',sourceVersion:null,path:'页面原型/闪回有品-买货-v1.2.html',role:'iteration'}]},
    {id:'youpin-sell',product:'youpin',group:'闪回有品',name:'卖货',versions:[{id:'v1.2',sourceVersion:null,path:'页面原型/闪回有品-卖货-v1.2.html',role:'iteration'}]},
    {id:'youpin-messages',product:'youpin',group:'闪回有品',name:'消息',versions:[{id:'v1.2',sourceVersion:null,path:'页面原型/闪回有品-消息-v1.2.html',role:'iteration'}]},
    {id:'youpin-profile',product:'youpin',group:'闪回有品',name:'我的',versions:[{id:'v1.2',sourceVersion:null,path:'页面原型/闪回有品-我的-v1.2.html',role:'iteration'}]},
    {id:'youpin-orders',product:'youpin',group:'闪回有品',name:'常规订单',versions:[{id:'v1.2',sourceVersion:null,path:'页面原型/闪回有品-常规订单-v1.2.html',role:'iteration'}]},
    {id:'youpin-detail',product:'youpin',group:'闪回有品',name:'订单详情',versions:[{id:'v1.2',sourceVersion:null,path:'页面原型/闪回有品-订单详情-v1.2.html',role:'iteration'}]},
    {id:'youpin-report',product:'youpin',group:'闪回有品',name:'质检报告',versions:[{id:'v1.2',sourceVersion:null,path:'页面原型/闪回有品-质检报告-v1.2.html',role:'iteration'}]},
    {id:'youpin-aftersale',product:'youpin',group:'闪回有品',name:'发起售后',versions:[{id:'v1.2',sourceVersion:null,path:'页面原型/闪回有品-发起售后-v1.2.html',role:'iteration'}]},
    {id:'youpin-services',product:'youpin',group:'闪回有品',name:'买货售后管理',versions:[{id:'v1.2',sourceVersion:null,path:'页面原型/闪回有品-买货售后-v1.2.html',role:'iteration'}]},
    {id:'youpin-service-detail',product:'youpin',group:'闪回有品',name:'售后详情',versions:[{id:'v1.2',sourceVersion:null,path:'页面原型/闪回有品-售后详情-v1.2.html',role:'iteration'}]},
    {id:'channel-staff',product:'boss-channel',group:'管理',name:'店员管理',versions:[{id:'v1.2',sourceVersion:null,path:'页面原型/BOSS渠道版-店员管理-v1.2.html',role:'iteration'}]},
    {id:'pjt-mobile-upload',product:'h5',group:'手机上传',name:'PJT 截图上传',versions:[{id:'v1.3',sourceVersion:null,path:'页面原型/PJT手机上传-v1.3.html',role:'iteration'}]},
  ]
};
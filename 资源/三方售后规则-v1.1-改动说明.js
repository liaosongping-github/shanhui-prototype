window.prototypeReview = {
  "baseline": "三方售后规则-基线-20261111.html",
  "baselineLabel": "现网基线 · 20261111（冻结）",
  "version": "v1.1",
  "items": [
    {
      "id": "C01",
      "title": "列表与筛选",
      "content": "<h3>列表与筛选</h3>",
      "target": "[data-change=\"C01\"]"
    },
    {
      "id": "C02",
      "title": "查看详情",
      "content": "<h3>查看详情</h3>",
      "target": "[data-change=\"C02\"]"
    },
    {
      "id": "C03",
      "title": "新增",
      "content": "<h3>新增</h3>",
      "target": "[data-change=\"C03\"]"
    },
    {
      "id": "C04",
      "title": "售后时效支持两项并列",
      "before": "编辑只能设置一项时效，起算点为签收后或发货后。",
      "after": "字段更名为售后时效，增加付款后。可配置一项或两项。两项水平排列，关系默认“且”，可切换为“或”。启用状态移至表单最后一行。",
      "interaction": "在新增或编辑弹窗点击“添加时效”添加第二项，点击“移除”恢复单项。保存后可在详情核对。",
      "logic": "保留原单项值。两项模式要求两个小时数均填写。演示保存记录两项与关系，“且”表示同时满足，“或”表示满足任一项。实际申请校验、边界时刻和起算事件定义待确认。",
      "acceptance": "将第一项设为付款后72小时，第二项设为签收后24小时；切换为“或”后保存，详情显示所选关系，重新编辑回填。",
      "target": "[data-change=\"C04\"]"
    },
    {
      "id": "C05",
      "title": "新增复议时效和复议次数",
      "before": "现网弹窗无复议时效和复议次数字段。",
      "after": "售后时效下方并排展示复议时效和复议次数，各自可勾选“不限”，详情同步显示。",
      "interaction": "默认留空。勾选“不限”时清空显示并停用对应输入，保存前取消勾选恢复本次输入。",
      "logic": "复议时效按非负小时、次数按非负整数做本地演示，区分留空、0 和不限。起算点、必填性、默认值、0 的业务含义、计次范围及实际限制待确认。",
      "acceptance": "勾选复议时效“不限”，复议次数填 2，保存后详情显示“不限”和“2次”，重开编辑时回填。",
      "target": "[data-change=\"C05\"]"
    }
  ]
};
window.prototypeReview.resolveTarget = item => {
  if (!['C04', 'C05'].includes(item.id)) return;
  const target = '.rule-modal ' + item.target;
  if (!document.querySelector(target)) document.querySelector('[data-rule-edit]')?.click();
  return document.querySelector(target);
};

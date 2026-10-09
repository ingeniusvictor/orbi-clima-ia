import fs from 'node:fs';

const bridgePath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiWidgetBridgePlugin.kt';
const appPath = 'src/App.tsx';
const servicePath = 'src/services/androidWidgetService.ts';

const bridge = fs.readFileSync(bridgePath, 'utf8');
const app = fs.readFileSync(appPath, 'utf8');
const service = fs.readFileSync(servicePath, 'utf8');

const requiredRefreshes = [
  'OrbiSkyOrbWidget().updateAll(context)',
  'OrbiSkyOrbMiniWidget().updateAll(context)',
  'OrbiSkyOrbPanelWidget().updateAll(context)',
  'OrbiSkyOrbCommandWidget().updateAll(context)',
  'OrbiSkyOrbCommandPremiumWidget().updateAll(context)',
];

const assertions = [
  ['App syncs active widget contract when it changes', app.includes('syncAndroidWidgetContract(activeContract)')],
  ['widget service invokes native saveWidgetContract bridge', service.includes('bridge.saveWidgetContract')],
  ['bridge persists the widget contract before refresh', bridge.includes('putString("orbi_skyorb_widget_contract_v1", contractJson)')],
  ...requiredRefreshes.map((needle) => [`bridge refreshes ${needle.split('().')[0]}`, bridge.includes(needle)]),
  ['refreshes are isolated per family', bridge.includes('refreshSafely(') && bridge.includes('Widget refresh failed for $name')],
  ['bridge schedules five widget families', bridge.includes('ret.put("widgetFamilies", 5)')],
];

let failed = false;
for (const [label, ok] of assertions) {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${label}`);
  if (!ok) failed = true;
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log('OC-16 Immediate Multi-Widget Refresh source gate: PASS');
}

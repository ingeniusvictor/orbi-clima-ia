import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const renderer = read('android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotRendererV2.kt');
const host = read('android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotHost.kt');
const generic = read('android/app/src/main/java/com/orbi/clima/widget/OrbiSkyOrbWidget.kt');
const mini = read('android/app/src/main/java/com/orbi/clima/widget/OrbiSkyOrbMiniWidgetReceiver.kt');
const panel = read('android/app/src/main/java/com/orbi/clima/widget/OrbiSkyOrbPanelWidgetReceiver.kt');
const command = read('android/app/src/main/java/com/orbi/clima/widget/OrbiSkyOrbCommandWidgetReceiver.kt');
const premium = read('android/app/src/main/java/com/orbi/clima/widget/OrbiSkyOrbCommandPremiumWidgetReceiver.kt');
const field = read('android/app/src/main/java/com/orbi/clima/widget/OrbiFieldCommandWidgetReceiver.kt');
const cinematic = read('android/app/src/main/java/com/orbi/clima/widget/OrbiCinematicBarWidgetReceiver.kt');
const manifest = read('android/app/src/main/AndroidManifest.xml');
const fieldProvider = read('android/app/src/main/res/xml/orbi_field_command_widget_info.xml');
const cinematicProvider = read('android/app/src/main/res/xml/orbi_cinematic_bar_widget_info.xml');
const mobile = read('src/components/MobileWidgetsScreen.tsx');
const preview = read('src/components/NativeWidgetParityPreview.tsx');

for (const variant of ['MINI', 'PANEL', 'COMMAND', 'PREMIUM_COMMAND', 'FIELD_COMMAND', 'CINEMATIC_BAR']) {
  expect(renderer.includes(variant), `Native renderer missing ${variant} variant.`);
}

expect(renderer.includes('Bitmap.createBitmap'), 'Native widget renderer must paint a deterministic bitmap.');
expect(renderer.includes('Canvas(bitmap)'), 'Native widget renderer must use Android Canvas.');
expect(renderer.includes('drawOrbitalAura'), 'Native renderer must keep premium orbital depth.');
expect(renderer.includes('drawMetricCard'), 'Native renderer must keep premium metric hierarchy.');
expect(renderer.includes('"snow", "cold", "frost" -> ICE'), 'Native renderer must preserve first-class snow/ice treatment.');
expect(renderer.includes('No web/Golden Orb') || renderer.includes('frozen Golden Orb'), 'Native renderer must document Golden Orb isolation.');

expect(host.includes('ImageProvider(bitmap)'), 'Glance host must display the already-rendered native bitmap.');
expect(host.includes('ContentScale.FillBounds'), 'Native bitmap must own the launcher visual surface.');

expect(generic.includes('OrbiNativeWidgetSnapshotRendererV2.renderForHint'), 'Generic widget must route through native V2 renderer.');
expect(mini.includes('OrbiNativeWidgetSnapshotRendererV2.renderMini'), 'Mini widget must route through native V2 renderer.');
expect(panel.includes('OrbiNativeWidgetSnapshotRendererV2.renderPanel'), 'SkyPanel must route through native V2 renderer.');
expect(command.includes('OrbiNativeWidgetSnapshotRendererV2.renderCommand'), 'Command widget must route through native V2 renderer.');
expect(premium.includes('OrbiNativeWidgetSnapshotRendererV2.renderPremiumCommand'), 'Premium command must route through native V2 renderer.');
expect(field.includes('Variant.FIELD_COMMAND'), 'Field Command must have a dedicated native receiver.');
expect(cinematic.includes('Variant.CINEMATIC_BAR'), 'Cinematic Bar must have a dedicated native receiver.');

expect(manifest.includes('.widget.OrbiFieldCommandWidgetReceiver'), 'Android launcher must register Field Command directly.');
expect(manifest.includes('@xml/orbi_field_command_widget_info'), 'Field Command provider metadata must be wired.');
expect(manifest.includes('.widget.OrbiCinematicBarWidgetReceiver'), 'Android launcher must register Cinematic Bar directly.');
expect(manifest.includes('@xml/orbi_cinematic_bar_widget_info'), 'Cinematic Bar provider metadata must be wired.');
expect(fieldProvider.includes('android:targetCellWidth="4"') && fieldProvider.includes('android:targetCellHeight="4"'), 'Field Command must declare 4x4 launcher geometry.');
expect(cinematicProvider.includes('android:targetCellWidth="5"') && cinematicProvider.includes('android:targetCellHeight="2"'), 'Cinematic Bar must declare 5x2 launcher geometry.');

expect(mobile.includes("import NativeWidgetParityPreview"), 'Widgets screen must use native parity preview.');
expect(!mobile.includes("import WidgetsPreviews"), 'Widgets screen must not present the aspirational legacy preview as launcher truth.');
expect(mobile.includes('NATIVE CANVAS V2 · PARIDAD DE LAUNCHER'), 'Widgets screen must explain the native-first rendering model.');
expect(preview.includes('VISTA DE PARIDAD NATIVA · CANVAS V2'), 'Parity preview must identify itself as native parity.');
expect(preview.includes("snow: 'Nevado'"), 'Parity preview must support snow explicitly.');
expect(preview.includes("id: 'mini'"), 'Parity preview must expose Mini.');
expect(preview.includes("id: 'panel'"), 'Parity preview must expose SkyPanel.');
expect(preview.includes("id: 'command'"), 'Parity preview must expose Command.');
expect(preview.includes("id: 'field'"), 'Parity preview must expose Field Command.');
expect(preview.includes("id: 'cinematic'"), 'Parity preview must expose Cinematic Bar.');

if (failures.length) {
  console.error('OC-22I Native Widget Parity gate: FAIL');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('OC-22I Native Widget Parity gate: PASS');
console.log('- all launcher variants use deterministic Canvas snapshots');
console.log('- Glance is only the launcher host/click surface');
console.log('- Field Command and Cinematic Bar are dedicated launcher providers');
console.log('- in-app preview mirrors the native-first widget family');
console.log('- snow and Golden Orb isolation remain explicit');

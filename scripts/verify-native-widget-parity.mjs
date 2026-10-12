import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const renderer = read('android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotRendererV2.kt');
const adaptive = read('android/app/src/main/java/com/orbi/clima/widget/OrbiLauncherAdaptiveRenderer.kt');
const host = read('android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotHost.kt');
const exactBase = read('android/app/src/main/java/com/orbi/clima/widget/OrbiExactNativeWidget.kt');
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

expect(renderer.includes('Bitmap.createBitmap'), 'Native V2 renderer must paint deterministic bitmaps.');
expect(renderer.includes('Canvas(bitmap)'), 'Native V2 renderer must use Android Canvas.');
expect(renderer.includes('drawOrbitalAura'), 'Native V2 renderer must keep premium orbital depth.');
expect(renderer.includes('drawMetricCard'), 'Native V2 renderer must keep premium metric hierarchy.');
expect(renderer.includes('"snow", "cold", "frost" -> ICE'), 'Native V2 renderer must preserve first-class snow/ice treatment.');
expect(renderer.includes('frozen Golden Orb'), 'Native V2 renderer must document Golden Orb isolation.');

expect(adaptive.includes('launcherWidthDp') && adaptive.includes('launcherHeightDp'), 'Adaptive renderer must consume launcher width/height.');
expect(adaptive.includes('MAX_BITMAP_PIXELS = 1_250_000'), 'Adaptive renderer must cap total bitmap pixels.');
expect(adaptive.includes('MAX_DIMENSION_PX = 1440'), 'Adaptive renderer must cap individual bitmap dimensions.');
expect(adaptive.includes('val uniformScale = min('), 'Adaptive renderer must use uniform scaling rather than aspect distortion.');
expect(adaptive.includes('val destination = RectF(left, top, left + fittedWidth, top + fittedHeight)'), 'Adaptive renderer must fit-center V2 content.');
expect(adaptive.includes('OrbiNativeWidgetSnapshotRendererV2.render(context, state, variant)'), 'Adaptive renderer must preserve the certified V2 composition.');
expect(adaptive.includes('base.recycle()'), 'Adaptive renderer must release the intermediate fixed-size bitmap.');

expect(host.includes('ImageProvider(bitmap)'), 'Glance host must display the native bitmap.');
expect(host.includes('LocalSize.current'), 'Shared host must read the actual Glance launcher size.');
expect(host.includes('OrbiLauncherAdaptiveRenderer.render('), 'Shared host must route through launcher-adaptive rendering.');
expect(host.includes('ContentScale.Fit'), 'Shared host must use non-distorting ContentScale.Fit.');
expect(!host.includes('ContentScale.FillBounds'), 'Shared host must never stretch widget artwork with FillBounds.');
expect(exactBase.includes('SizeMode.Exact'), 'All native widget families must compose for exact launcher geometry.');
expect(exactBase.includes('OrbiAdaptiveNativeWidgetSnapshotHost('), 'Exact-size base must invoke the adaptive native host.');

const exactFamilies = [
  [generic, 'generic', null],
  [mini, 'Mini', 'Variant.MINI'],
  [panel, 'SkyPanel', 'Variant.PANEL'],
  [command, 'Command', 'Variant.COMMAND'],
  [premium, 'Premium Command', 'Variant.PREMIUM_COMMAND'],
  [field, 'Field Command', 'Variant.FIELD_COMMAND'],
  [cinematic, 'Cinematic Bar', 'Variant.CINEMATIC_BAR'],
];
for (const [source, label, variant] of exactFamilies) {
  expect(source.includes('OrbiExactNativeWidget('), `${label} must use the exact-size native widget base.`);
  if (variant) expect(source.includes(variant), `${label} must keep its dedicated V2 variant.`);
}

expect(manifest.includes('.widget.OrbiFieldCommandWidgetReceiver'), 'Android launcher must register Field Command directly.');
expect(manifest.includes('@xml/orbi_field_command_widget_info'), 'Field Command provider metadata must be wired.');
expect(manifest.includes('.widget.OrbiCinematicBarWidgetReceiver'), 'Android launcher must register Cinematic Bar directly.');
expect(manifest.includes('@xml/orbi_cinematic_bar_widget_info'), 'Cinematic Bar provider metadata must be wired.');
expect(fieldProvider.includes('android:targetCellWidth="4"') && fieldProvider.includes('android:targetCellHeight="4"'), 'Field Command must remain a 4x4 launcher target.');
expect(cinematicProvider.includes('android:targetCellWidth="5"') && cinematicProvider.includes('android:targetCellHeight="2"'), 'Cinematic Bar must remain a 5x2 launcher target.');

expect(mobile.includes('import NativeWidgetParityPreview'), 'Widgets screen must use native parity preview.');
expect(!mobile.includes('import WidgetsPreviews'), 'Widgets screen must not present the aspirational legacy preview as launcher truth.');
expect(mobile.includes('NATIVE CANVAS V2 · PARIDAD DE LAUNCHER'), 'Widgets screen must explain the native-first rendering model.');
expect(preview.includes('VISTA DE PARIDAD NATIVA · CANVAS V2'), 'Parity preview must identify itself as native parity.');
expect(preview.includes("snow: 'Nevado'"), 'Parity preview must support snow explicitly.');
expect(preview.includes("id: 'mini'"), 'Parity preview must expose Mini.');
expect(preview.includes("id: 'panel'"), 'Parity preview must expose SkyPanel.');
expect(preview.includes("id: 'command'"), 'Parity preview must expose Command.');
expect(preview.includes("id: 'field'"), 'Parity preview must expose Field Command.');
expect(preview.includes("id: 'cinematic'"), 'Parity preview must expose Cinematic Bar.');

if (failures.length) {
  console.error('OC-22I/J Native Widget Parity + Adaptive Launcher gate: FAIL');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('OC-22I/J Native Widget Parity + Adaptive Launcher gate: PASS');
console.log('- all launcher variants retain deterministic Canvas V2 snapshots');
console.log('- exact Glance size drives final bitmap aspect ratio');
console.log('- uniform fit-center scaling prevents OEM stretch distortion');
console.log('- bitmap dimensions are capped for Android memory/performance safety');
console.log('- snow and Golden Orb isolation remain explicit');

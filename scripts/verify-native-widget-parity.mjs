import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const rendererV2 = read('android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotRendererV2.kt');
const rendererV3 = read('android/app/src/main/java/com/orbi/clima/widget/OrbiFluidNativeWidgetRendererV3.kt');
const adaptive = read('android/app/src/main/java/com/orbi/clima/widget/OrbiLauncherAdaptiveRenderer.kt');
const brandOverlay = read('android/app/src/main/java/com/orbi/clima/widget/OrbiWidgetBrandOverlay.kt');
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

const variants = ['MINI', 'PANEL', 'COMMAND', 'PREMIUM_COMMAND', 'FIELD_COMMAND', 'CINEMATIC_BAR'];
for (const variant of variants) {
  expect(rendererV2.includes(variant), `Native V2 fallback missing ${variant} variant.`);
  expect(rendererV3.includes(`Variant.${variant}`), `Native Fluid V3 renderer missing ${variant} variant.`);
}

// V2 remains a deterministic emergency fallback, not the primary adaptive path.
expect(rendererV2.includes('Bitmap.createBitmap'), 'Native V2 fallback must remain deterministic.');
expect(rendererV2.includes('Canvas(bitmap)'), 'Native V2 fallback must remain Canvas based.');
expect(rendererV2.includes('frozen Golden Orb'), 'Native V2 fallback must retain Golden Orb isolation documentation.');

// OC-22O: final launcher geometry is now the render geometry.
expect(rendererV3.includes('object OrbiFluidNativeWidgetRendererV3'), 'Fluid V3 renderer object is missing.');
expect(rendererV3.includes('Bitmap.createBitmap(safeWidth, safeHeight, Bitmap.Config.ARGB_8888)'), 'Fluid V3 must create the final bitmap at the requested launcher width/height.');
expect(rendererV3.includes('val canvas = Canvas(bitmap)'), 'Fluid V3 must paint directly with Android Canvas.');
expect(rendererV3.includes('drawWeatherAtmosphere(canvas, bounds, profile)'), 'Fluid V3 must render weather-specific native atmosphere.');
expect(rendererV3.includes('drawFittedText(') && rendererV3.includes('fitText('), 'Fluid V3 must adapt typography to real launcher geometry.');
expect(rendererV3.includes('state.conditionLabel'), 'Fluid V3 must preserve the exact Weather Truth condition label.');
expect(rendererV3.includes('resolveOrbDrawable(state)'), 'Fluid V3 must retain deterministic native orb artwork.');
expect(rendererV3.includes('frozen Golden Orb'), 'Fluid V3 must explicitly remain isolated from the frozen Golden Orb.');

for (const family of ['CLEAR', 'CLOUD', 'FOG', 'DRIZZLE', 'RAIN', 'STORM', 'SNOW', 'WIND', 'NIGHT']) {
  expect(rendererV3.includes(family), `Fluid V3 weather family ${family} is missing.`);
}
for (const atmosphere of [
  'drawSolarAtmosphere',
  'drawCloudAtmosphere',
  'drawFogAtmosphere',
  'drawRainAtmosphere',
  'drawStormAtmosphere',
  'drawSnowAtmosphere',
  'drawWindAtmosphere',
  'drawNightAtmosphere',
]) {
  expect(rendererV3.includes(atmosphere), `Fluid V3 native atmosphere primitive ${atmosphere} is missing.`);
}

expect(adaptive.includes('launcherWidthDp') && adaptive.includes('launcherHeightDp'), 'Adaptive renderer must consume launcher width/height.');
expect(adaptive.includes('MAX_BITMAP_PIXELS = 1_250_000'), 'Adaptive renderer must cap total bitmap pixels.');
expect(adaptive.includes('MAX_DIMENSION_PX = 1440'), 'Adaptive renderer must cap individual bitmap dimensions.');
expect(adaptive.includes('OrbiFluidNativeWidgetRendererV3.render('), 'Adaptive renderer must route the healthy path through Fluid V3.');
expect(adaptive.includes('OrbiNativeWidgetSnapshotRendererV2.render(context, state, variant)'), 'Adaptive renderer must retain V2 as emergency fallback.');
expect(adaptive.includes('catch (_: Throwable)'), 'Adaptive renderer must isolate unexpected V3 failures behind the certified V2 fallback.');
expect(adaptive.includes('OrbiWidgetBrandOverlay.apply('), 'Adaptive renderer must apply the official ORBI Clima brand overlay to launcher surfaces.');
expect(!adaptive.includes('uniformScale'), 'Adaptive renderer must not scale a fixed V2 composition in the healthy V3 path.');
expect(!adaptive.includes('fitScale'), 'Adaptive renderer must not fit-scale a fixed bitmap in the healthy V3 path.');
expect(!adaptive.includes('Canvas(output).drawBitmap(base'), 'Adaptive renderer must not copy a fixed intermediate bitmap into launcher geometry.');
expect(!adaptive.includes('base.recycle()'), 'Fluid V3 path must not depend on recycling a fixed V2 intermediate bitmap.');

// OC-22P: official application identity must be visible in Android and widgets.
expect(fs.existsSync('android/app/src/main/res/drawable/orbi_clima_app_icon.jpg'), 'Official Android ORBI Clima icon asset is missing.');
expect(fs.existsSync('public/orbi-clima-app-icon.jpg'), 'Official web parity icon asset is missing.');
expect(manifest.includes('android:icon="@drawable/orbi_clima_app_icon"'), 'Android application must declare the official ORBI Clima icon.');
expect(manifest.includes('android:roundIcon="@drawable/orbi_clima_app_icon"'), 'Android application must declare the official ORBI Clima round icon.');
expect(brandOverlay.includes('R.drawable.orbi_clima_app_icon'), 'Widget brand overlay must render the official ORBI Clima icon.');
expect(brandOverlay.includes('canvas.drawText("ORBI"'), 'Widget brand overlay must retain the ORBI wordmark.');
expect(brandOverlay.includes('canvas.drawText(" CLIMA IA"'), 'Widget brand overlay must retain the CLIMA IA wordmark.');

expect(host.includes('ImageProvider(bitmap)'), 'Glance host must display the native bitmap.');
expect(host.includes('LocalSize.current'), 'Shared host must read the actual Glance launcher size.');
expect(host.includes('OrbiLauncherAdaptiveRenderer.render('), 'Shared host must route through launcher-adaptive rendering.');
expect(host.includes('ContentScale.Fit'), 'Shared host must keep non-distorting ContentScale.Fit.');
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
  if (variant) expect(source.includes(variant), `${label} must keep its dedicated native variant.`);
}

expect(manifest.includes('.widget.OrbiFieldCommandWidgetReceiver'), 'Android launcher must register Field Command directly.');
expect(manifest.includes('@xml/orbi_field_command_widget_info'), 'Field Command provider metadata must be wired.');
expect(manifest.includes('.widget.OrbiCinematicBarWidgetReceiver'), 'Android launcher must register Cinematic Bar directly.');
expect(manifest.includes('@xml/orbi_cinematic_bar_widget_info'), 'Cinematic Bar provider metadata must be wired.');
expect(fieldProvider.includes('android:targetCellWidth="4"') && fieldProvider.includes('android:targetCellHeight="4"'), 'Field Command must remain a 4x4 launcher target.');
expect(cinematicProvider.includes('android:targetCellWidth="5"') && cinematicProvider.includes('android:targetCellHeight="2"'), 'Cinematic Bar must remain a 5x2 launcher target.');

expect(mobile.includes('import NativeWidgetParityPreview'), 'Widgets screen must use native parity preview.');
expect(!mobile.includes('import WidgetsPreviews'), 'Widgets screen must not present the aspirational legacy preview as launcher truth.');
expect(preview.includes("id: 'mini'"), 'Parity preview must expose Mini.');
expect(preview.includes("id: 'panel'"), 'Parity preview must expose SkyPanel.');
expect(preview.includes("id: 'command'"), 'Parity preview must expose Command.');
expect(preview.includes("id: 'field'"), 'Parity preview must expose Field Command.');
expect(preview.includes("id: 'cinematic'"), 'Parity preview must expose Cinematic Bar.');
expect(preview.includes("useState<NativeVariant>('command')"), 'Physical parity preview must default to the launcher-tested Command surface.');
expect(preview.includes('MetricBubble'), 'Command parity preview must use the same circular metric-bubble hierarchy as Fluid V3.');
expect(preview.includes('/orbi-clima-app-icon.jpg'), 'Parity preview must use the official ORBI Clima app icon.');
expect(preview.includes('VISTA DE PARIDAD NATIVA · CANVAS V3'), 'Parity preview must identify the actual Canvas V3 renderer.');
expect(!preview.includes('CANVAS V2'), 'Parity preview must not claim legacy Canvas V2 parity.');
expect(preview.includes('conditionLabel'), 'Parity preview must preserve exact condition-label semantics.');

if (failures.length) {
  console.error('OC-22I/J/O/P Native Widget Parity + Fluid Launcher + Brand gate: FAIL');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('OC-22I/J/O/P Native Widget Parity + Fluid Launcher + Brand gate: PASS');
console.log('- Fluid Canvas V3 paints directly at the exact launcher bitmap size');
console.log('- in-app Command preview mirrors the native circular metric hierarchy');
console.log('- official ORBI Clima icon is required in Android app + widget branding + preview');
console.log('- no fixed-size fit-center scaling remains in the healthy launcher path');
console.log('- deterministic weather micro-atmospheres cover clear/cloud/fog/drizzle/rain/storm/snow/wind/night');
console.log('- exact condition labels and adaptive typography are required');
console.log('- bitmap dimensions remain capped for Android memory/performance safety');
console.log('- V2 remains available only as an emergency fallback');
console.log('- Golden Orb remains isolated from native widget rendering');

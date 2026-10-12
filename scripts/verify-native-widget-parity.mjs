import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

const rendererV2 = read('android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotRendererV2.kt');
const rendererV3 = read('android/app/src/main/java/com/orbi/clima/widget/OrbiFluidNativeWidgetRendererV3.kt');
const rendererV4 = read('android/app/src/main/java/com/orbi/clima/widget/OrbiOrbitalCommandRendererV4.kt');
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
const contractKt = read('android/app/src/main/java/com/orbi/clima/widget/OrbiWidgetContract.kt');
const contractTs = read('src/services/androidWidgetService.ts');
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

expect(rendererV2.includes('Bitmap.createBitmap'), 'Native V2 fallback must remain deterministic.');
expect(rendererV2.includes('Canvas(bitmap)'), 'Native V2 fallback must remain Canvas based.');
expect(rendererV2.includes('frozen Golden Orb'), 'Native V2 fallback must retain Golden Orb isolation documentation.');

// OC-22O/P: final launcher geometry is the render geometry.
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
  expect(rendererV4.includes(family), `Orbital V4 weather family ${family} is missing.`);
}

// OC-22Q: original SkyOrb Commander orbital language is now a first-class native renderer.
expect(rendererV4.includes('object OrbiOrbitalCommandRendererV4'), 'Commander Orbital V4 renderer is missing.');
expect(rendererV4.includes('Bitmap.createBitmap(safeWidth, safeHeight, Bitmap.Config.ARGB_8888)'), 'Orbital V4 must paint at exact launcher dimensions.');
expect(rendererV4.includes('drawOrbitalArchitecture('), 'Orbital V4 must contain the full orbital energy architecture.');
expect(rendererV4.includes('drawForecastSatellites('), 'Orbital V4 must render forecast satellites.');
expect(rendererV4.includes('drawCoreOrb('), 'Orbital V4 must render a dominant central weather core.');
expect(rendererV4.includes('drawOperationalSatellites('), 'Orbital V4 must render operational metric satellites.');
expect(rendererV4.includes('drawNarrativeRail('), 'Orbital V4 must render the ORBI IA narrative rail.');
expect(rendererV4.includes('state.forecastDay1Label') && rendererV4.includes('state.forecastDay2Label') && rendererV4.includes('state.forecastDay3Label'), 'Orbital V4 must consume three forecast-day satellites.');
expect(rendererV4.includes('state.rainProbability') && rendererV4.includes('state.windSpeedKmh') && rendererV4.includes('state.humidity'), 'Orbital V4 must preserve rain/wind/humidity operational satellites.');
expect(rendererV4.includes('state.uvIndex') && rendererV4.includes('uvDescriptor'), 'Orbital V4 must preserve UV in the central core.');
expect(rendererV4.includes('state.conditionLabel'), 'Orbital V4 must display the exact current phenomenon label.');
expect(rendererV4.includes('frozen Golden Orb'), 'Orbital V4 must document isolation from the frozen Golden Orb.');

for (const contract of [contractKt, contractTs]) {
  for (const fieldName of [
    'forecastDay1Label', 'forecastDay1MinC', 'forecastDay1MaxC', 'forecastDay1ConditionCode',
    'forecastDay2Label', 'forecastDay2MinC', 'forecastDay2MaxC', 'forecastDay2ConditionCode',
    'forecastDay3Label', 'forecastDay3MinC', 'forecastDay3MaxC', 'forecastDay3ConditionCode',
  ]) {
    expect(contract.includes(fieldName), `Orbital forecast contract missing ${fieldName}.`);
  }
}
expect(contractTs.includes('readCachedDailyForecast'), 'Web contract must recover daily forecast from the same cached weather bundle when caller data is absent.');
expect(contractTs.includes('hourlyExactLabel'), 'Widget bridge must preserve exact Weather Truth labels instead of family-only labels.');

expect(adaptive.includes('launcherWidthDp') && adaptive.includes('launcherHeightDp'), 'Adaptive renderer must consume launcher width/height.');
expect(adaptive.includes('MAX_BITMAP_PIXELS = 1_250_000'), 'Adaptive renderer must cap total bitmap pixels.');
expect(adaptive.includes('MAX_DIMENSION_PX = 1440'), 'Adaptive renderer must cap individual bitmap dimensions.');
expect(adaptive.includes('OrbiOrbitalCommandRendererV4.render('), 'Commander healthy path must route through Orbital V4.');
expect(adaptive.includes('ORBITAL_V4_MIN_SIDE_PX'), 'Commander V4 must have an explicit geometry eligibility threshold.');
expect(adaptive.includes('OrbiFluidNativeWidgetRendererV3.render('), 'Adaptive renderer must retain Fluid V3 as the progressive fallback.');
expect(adaptive.includes('OrbiNativeWidgetSnapshotRendererV2.render(context, state, variant)'), 'Adaptive renderer must retain V2 as final emergency fallback.');
expect(!adaptive.includes('uniformScale'), 'Adaptive renderer must not scale a fixed V2 composition in the healthy path.');
expect(!adaptive.includes('fitScale'), 'Adaptive renderer must not fit-scale a fixed bitmap in the healthy path.');
expect(!adaptive.includes('Canvas(output).drawBitmap(base'), 'Adaptive renderer must not copy a fixed intermediate bitmap into launcher geometry.');

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
expect(preview.includes('conditionLabel'), 'Parity preview must preserve exact condition-label semantics.');
expect(preview.includes('SKYORB COMMANDER · ORBITAL V4'), 'Parity preview must identify Commander Orbital V4 explicitly.');
expect(preview.includes('ForecastBubble') && preview.includes('MetricBubble'), 'Commander preview must mirror forecast and operational satellite families.');
expect(preview.includes('OC-22Q · SKYORB COMMANDER ORBITAL V4'), 'Preview certification footer must identify OC-22Q.');

if (failures.length) {
  console.error('OC-22I/J/O/P/Q Native Widget Parity + Orbital Commander gate: FAIL');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('OC-22I/J/O/P/Q Native Widget Parity + Orbital Commander gate: PASS');
console.log('- Commander 4x4 uses Orbital V4 when launcher geometry is sufficient');
console.log('- V4 preserves dominant central core + forecast satellites + operational satellites + ORBI IA rail');
console.log('- exact condition labels and 3-day orbital forecast contract are required');
console.log('- Fluid V3 and deterministic V2 remain safe fallbacks');
console.log('- all renderers remain isolated from the frozen Golden Orb');

import fs from 'node:fs';

const receiverPath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiSkyOrbCommandPremiumWidgetReceiver.kt';
const rendererV2Path = 'android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotRendererV2.kt';
const rendererV3Path = 'android/app/src/main/java/com/orbi/clima/widget/OrbiFluidNativeWidgetRendererV3.kt';
const rendererV4Path = 'android/app/src/main/java/com/orbi/clima/widget/OrbiOrbitalCommandRendererV4.kt';
const adaptivePath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiLauncherAdaptiveRenderer.kt';
const hostPath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotHost.kt';
const exactPath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiExactNativeWidget.kt';
const providerPath = 'android/app/src/main/res/xml/orbi_skyorb_command_premium_widget_info.xml';

const receiver = fs.readFileSync(receiverPath, 'utf8');
const rendererV2 = fs.readFileSync(rendererV2Path, 'utf8');
const rendererV3 = fs.readFileSync(rendererV3Path, 'utf8');
const rendererV4 = fs.readFileSync(rendererV4Path, 'utf8');
const adaptive = fs.readFileSync(adaptivePath, 'utf8');
const host = fs.readFileSync(hostPath, 'utf8');
const exact = fs.readFileSync(exactPath, 'utf8');
const provider = fs.readFileSync(providerPath, 'utf8');

const assertions = [
  ['premium receiver uses exact-size native widget base', receiver.includes('OrbiExactNativeWidget(')],
  ['premium receiver preserves dedicated premium variant', receiver.includes('Variant.PREMIUM_COMMAND')],
  ['exact-size base uses SizeMode.Exact', exact.includes('SizeMode.Exact')],
  ['exact-size base delegates to adaptive native host', exact.includes('OrbiAdaptiveNativeWidgetSnapshotHost(')],
  ['shared host reads LocalSize from launcher', host.includes('LocalSize.current')],
  ['shared host renders bitmap through Glance ImageProvider', host.includes('ImageProvider(bitmap)')],
  ['shared host avoids FillBounds aspect distortion', host.includes('ContentScale.Fit') && !host.includes('ContentScale.FillBounds')],

  ['adaptive layer routes capable Command/Premium geometry through Orbital V4', adaptive.includes('OrbiOrbitalCommandRendererV4.render(')],
  ['adaptive layer has explicit Orbital V4 geometry eligibility threshold', adaptive.includes('ORBITAL_V4_MIN_SIDE_PX') && adaptive.includes('supportsOrbitalV4')],
  ['adaptive layer preserves Fluid V3 progressive fallback', adaptive.includes('OrbiFluidNativeWidgetRendererV3.render(')],
  ['adaptive layer preserves certified V2 final emergency fallback', adaptive.includes('OrbiNativeWidgetSnapshotRendererV2.render(context, state, variant)')],
  ['adaptive layer no longer fit-scales a fixed widget surface', !adaptive.includes('uniformScale') && !adaptive.includes('fitScale') && !adaptive.includes('Canvas(output).drawBitmap(base')],
  ['adaptive layer caps bitmap memory', adaptive.includes('MAX_BITMAP_PIXELS = 1_250_000')],
  ['adaptive layer caps bitmap dimensions', adaptive.includes('MAX_DIMENSION_PX = 1440')],
  ['premium receiver no longer falls back to Glance 4x4 content', !receiver.includes('OrbiSkyOrb4x4Content(state)')],

  ['Orbital V4 creates final-size ARGB bitmap', rendererV4.includes('Bitmap.createBitmap(safeWidth, safeHeight, Bitmap.Config.ARGB_8888)')],
  ['Orbital V4 paints directly with Android Canvas', rendererV4.includes('val canvas = Canvas(bitmap)')],
  ['Orbital V4 renders full orbital architecture', rendererV4.includes('drawOrbitalArchitecture(')],
  ['Orbital V4 renders three forecast satellites', rendererV4.includes('drawForecastSatellites(') && ['forecastDay1Label', 'forecastDay2Label', 'forecastDay3Label'].every(field => rendererV4.includes(`state.${field}`))],
  ['Orbital V4 renders dominant current-weather core', rendererV4.includes('drawCoreOrb(') && rendererV4.includes('state.temperatureC') && rendererV4.includes('state.conditionLabel')],
  ['Orbital V4 preserves current feels-like and UV inside the core', rendererV4.includes('state.feelsLikeC') && rendererV4.includes('state.uvIndex') && rendererV4.includes('uvDescriptor')],
  ['Orbital V4 renders rain/wind/humidity operational satellites', rendererV4.includes('drawOperationalSatellites(') && rendererV4.includes('state.rainProbability') && rendererV4.includes('state.windSpeedKmh') && rendererV4.includes('state.humidity')],
  ['Orbital V4 renders ORBI IA narrative rail', rendererV4.includes('drawNarrativeRail(') && rendererV4.includes('"ORBI IA"')],
  ['Orbital V4 responds to all certified weather families', ['CLEAR', 'CLOUD', 'FOG', 'DRIZZLE', 'RAIN', 'STORM', 'SNOW', 'WIND', 'NIGHT'].every(family => rendererV4.includes(family))],
  ['Orbital V4 remains isolated from frozen Golden Orb', rendererV4.includes('frozen Golden Orb')],

  ['Fluid V3 fallback remains exact-size Canvas', rendererV3.includes('Bitmap.createBitmap(safeWidth, safeHeight, Bitmap.Config.ARGB_8888)') && rendererV3.includes('val canvas = Canvas(bitmap)')],
  ['Fluid V3 fallback preserves exact Weather Truth label', rendererV3.includes('state.conditionLabel')],
  ['Fluid V3 fallback uses adaptive typography', rendererV3.includes('drawFittedText(') && rendererV3.includes('fitText(')],
  ['V2 final fallback remains deterministic', rendererV2.includes('Bitmap.createBitmap') && rendererV2.includes('Canvas(bitmap)')],

  ['premium provider remains a 4x4 target', provider.includes('android:targetCellWidth="4"') && provider.includes('android:targetCellHeight="4"')],
  ['premium provider retains the 30-minute system refresh ceiling', provider.includes('android:updatePeriodMillis="1800000"')],
];

let failed = false;
for (const [label, ok] of assertions) {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${label}`);
  if (!ok) failed = true;
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log('OC-15/OC-22I/J/O/P/Q Premium Widget Orbital V4 source gate: PASS');
}

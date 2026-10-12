import fs from 'node:fs';

const receiverPath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiSkyOrbCommandPremiumWidgetReceiver.kt';
const rendererV2Path = 'android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotRendererV2.kt';
const rendererV3Path = 'android/app/src/main/java/com/orbi/clima/widget/OrbiFluidNativeWidgetRendererV3.kt';
const adaptivePath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiLauncherAdaptiveRenderer.kt';
const hostPath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotHost.kt';
const exactPath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiExactNativeWidget.kt';
const providerPath = 'android/app/src/main/res/xml/orbi_skyorb_command_premium_widget_info.xml';

const receiver = fs.readFileSync(receiverPath, 'utf8');
const rendererV2 = fs.readFileSync(rendererV2Path, 'utf8');
const rendererV3 = fs.readFileSync(rendererV3Path, 'utf8');
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

  // OC-22O: the healthy path is fluid V3 at final launcher geometry. V2 remains
  // available only as the deterministic emergency fallback.
  ['adaptive layer routes healthy path through Fluid V3', adaptive.includes('OrbiFluidNativeWidgetRendererV3.render(')],
  ['adaptive layer preserves certified V2 emergency fallback', adaptive.includes('OrbiNativeWidgetSnapshotRendererV2.render(context, state, variant)')],
  ['adaptive layer no longer fit-scales a fixed widget surface', !adaptive.includes('uniformScale') && !adaptive.includes('fitScale') && !adaptive.includes('Canvas(output).drawBitmap(base')],
  ['adaptive layer caps bitmap memory', adaptive.includes('MAX_BITMAP_PIXELS = 1_250_000')],
  ['adaptive layer caps bitmap dimensions', adaptive.includes('MAX_DIMENSION_PX = 1440')],
  ['premium receiver no longer falls back to Glance 4x4 content', !receiver.includes('OrbiSkyOrb4x4Content(state)')],

  ['Fluid V3 creates final-size ARGB bitmap', rendererV3.includes('Bitmap.createBitmap(safeWidth, safeHeight, Bitmap.Config.ARGB_8888)')],
  ['Fluid V3 paints directly with Android Canvas', rendererV3.includes('val canvas = Canvas(bitmap)')],
  ['Fluid V3 exposes dedicated premium-command routing', rendererV3.includes('Variant.PREMIUM_COMMAND -> drawCommand') && rendererV3.includes('premium: Boolean')],
  ['Fluid V3 paints a weather-responsive central orb', rendererV3.includes('drawOrb(canvas, context, state') && rendererV3.includes('resolveOrbDrawable(state)')],
  ['Fluid V3 paints orbital rings', rendererV3.includes('drawOrbitalRing(')],
  ['Fluid V3 paints four command metric bubbles',
    rendererV3.includes('"LLUVIA", "${state.rainProbability}%"') &&
    rendererV3.includes('"HUMEDAD", "${state.humidity}%"') &&
    rendererV3.includes('"VIENTO", "${state.windSpeedKmh}"') &&
    rendererV3.includes('"UV", state.uvIndex.toString()')],
  ['Fluid V3 preserves exact Weather Truth label', rendererV3.includes('state.conditionLabel')],
  ['Fluid V3 uses adaptive typography', rendererV3.includes('drawFittedText(') && rendererV3.includes('fitText(')],
  ['Fluid V3 renders weather-specific micro-atmosphere', rendererV3.includes('drawWeatherAtmosphere(canvas, b, p)') || rendererV3.includes('drawWeatherAtmosphere(canvas, bounds, profile)')],
  ['Fluid V3 covers fog/drizzle/rain/storm/snow families', ['FOG', 'DRIZZLE', 'RAIN', 'STORM', 'SNOW'].every(family => rendererV3.includes(family))],
  ['Fluid V3 resolves existing weather orb assets', rendererV3.includes('R.drawable.orbi_widget_orb_sunny') && rendererV3.includes('R.drawable.orbi_widget_orb_fallback')],
  ['V2 fallback remains deterministic', rendererV2.includes('Bitmap.createBitmap') && rendererV2.includes('Canvas(bitmap)')],

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
  console.log('OC-15/OC-22I/J/O Premium Widget Fluid Snapshot source gate: PASS');
}

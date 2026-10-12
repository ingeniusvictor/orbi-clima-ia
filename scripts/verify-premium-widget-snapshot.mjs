import fs from 'node:fs';

const receiverPath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiSkyOrbCommandPremiumWidgetReceiver.kt';
const rendererPath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotRendererV2.kt';
const adaptivePath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiLauncherAdaptiveRenderer.kt';
const hostPath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotHost.kt';
const exactPath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiExactNativeWidget.kt';
const providerPath = 'android/app/src/main/res/xml/orbi_skyorb_command_premium_widget_info.xml';

const receiver = fs.readFileSync(receiverPath, 'utf8');
const renderer = fs.readFileSync(rendererPath, 'utf8');
const adaptive = fs.readFileSync(adaptivePath, 'utf8');
const host = fs.readFileSync(hostPath, 'utf8');
const exact = fs.readFileSync(exactPath, 'utf8');
const provider = fs.readFileSync(providerPath, 'utf8');

const assertions = [
  ['premium receiver uses exact-size native widget base', receiver.includes('OrbiExactNativeWidget(')],
  ['premium receiver preserves dedicated premium V2 variant', receiver.includes('Variant.PREMIUM_COMMAND')],
  ['exact-size base uses SizeMode.Exact', exact.includes('SizeMode.Exact')],
  ['exact-size base delegates to adaptive native host', exact.includes('OrbiAdaptiveNativeWidgetSnapshotHost(')],
  ['shared host reads LocalSize from launcher', host.includes('LocalSize.current')],
  ['shared host renders bitmap through Glance ImageProvider', host.includes('ImageProvider(bitmap)')],
  ['shared host avoids FillBounds aspect distortion', host.includes('ContentScale.Fit') && !host.includes('ContentScale.FillBounds')],
  ['adaptive layer preserves the certified V2 renderer', adaptive.includes('OrbiNativeWidgetSnapshotRendererV2.render(context, state, variant)')],
  ['adaptive layer fit-centers with uniform scaling', adaptive.includes('val uniformScale = min(')],
  ['adaptive layer caps bitmap memory', adaptive.includes('MAX_BITMAP_PIXELS = 1_250_000')],
  ['premium receiver no longer falls back to Glance 4x4 content', !receiver.includes('OrbiSkyOrb4x4Content(state)')],
  ['renderer creates deterministic ARGB bitmaps', renderer.includes('Bitmap.createBitmap(surface.width, surface.height, Bitmap.Config.ARGB_8888)')],
  ['renderer paints a central orb', renderer.includes('drawCentralOrb(')],
  ['renderer paints orbital rings', renderer.includes('drawOrbitalRing(')],
  ['renderer paints four metric bubbles', renderer.includes('drawMetricBubble(canvas, 125f, 232f') && renderer.includes('drawMetricBubble(canvas, s.width - 125f, 460f')],
  ['renderer resolves existing weather orb assets', renderer.includes('R.drawable.orbi_widget_orb_sunny') && renderer.includes('R.drawable.orbi_widget_orb_fallback')],
  ['renderer exposes dedicated premium-command path', renderer.includes('Variant.PREMIUM_COMMAND') && renderer.includes('renderPremiumCommand')],
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
  console.log('OC-15/OC-22I/J Premium Widget Snapshot source gate: PASS');
}

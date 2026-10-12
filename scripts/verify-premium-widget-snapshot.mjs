import fs from 'node:fs';

const receiverPath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiSkyOrbCommandPremiumWidgetReceiver.kt';
const rendererPath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotRendererV2.kt';
const hostPath = 'android/app/src/main/java/com/orbi/clima/widget/OrbiNativeWidgetSnapshotHost.kt';
const providerPath = 'android/app/src/main/res/xml/orbi_skyorb_command_premium_widget_info.xml';

const receiver = fs.readFileSync(receiverPath, 'utf8');
const renderer = fs.readFileSync(rendererPath, 'utf8');
const host = fs.readFileSync(hostPath, 'utf8');
const provider = fs.readFileSync(providerPath, 'utf8');

const assertions = [
  ['premium receiver uses shared native V2 snapshot renderer', receiver.includes('OrbiNativeWidgetSnapshotRendererV2.renderPremiumCommand(context, state)')],
  ['premium receiver delegates the bitmap to shared Glance snapshot host', receiver.includes('OrbiNativeWidgetSnapshotHost(snapshot')],
  ['shared host renders bitmap through Glance ImageProvider', host.includes('ImageProvider(bitmap)')],
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
  console.log('OC-15/OC-22I Premium Widget Snapshot source gate: PASS');
}

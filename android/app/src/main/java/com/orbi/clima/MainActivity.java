package com.orbi.clima;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;
import com.orbi.clima.alerts.OrbiOfficialAlertWatchPlugin;
import com.orbi.clima.runtime.OrbiRuntimeDiagnosticsPlugin;
import com.orbi.clima.widget.OrbiWidgetBridgePlugin;

/**
 * Canonical Capacitor activity for ORBI Clima IA.
 *
 * Local/native-only Capacitor plugins must be registered explicitly. Keeping
 * this file in source control also makes clean Android regeneration
 * deterministic for the widget, official-alert and diagnostics bridges.
 */
public class MainActivity extends BridgeActivity {
    private static final int ANDROID_15_API = 35;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(OrbiWidgetBridgePlugin.class);
        registerPlugin(OrbiOfficialAlertWatchPlugin.class);
        registerPlugin(OrbiRuntimeDiagnosticsPlugin.class);
        super.onCreate(savedInstanceState);
        configureModernSystemUi();
    }

    private void configureModernSystemUi() {
        if (Build.VERSION.SDK_INT < ANDROID_15_API || bridge == null || bridge.getWebView() == null) {
            return;
        }

        final View webView = bridge.getWebView();
        webView.setBackgroundColor(Color.rgb(7, 11, 20));

        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(
            getWindow(),
            getWindow().getDecorView()
        );
        controller.setAppearanceLightStatusBars(false);
        controller.setAppearanceLightNavigationBars(false);

        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, windowInsets) -> {
            final int safeTypes = WindowInsetsCompat.Type.systemBars()
                | WindowInsetsCompat.Type.displayCutout();
            Insets safeInsets = windowInsets.getInsets(safeTypes);
            view.setPadding(
                safeInsets.left,
                safeInsets.top,
                safeInsets.right,
                safeInsets.bottom
            );

            return new WindowInsetsCompat.Builder(windowInsets)
                .setInsets(safeTypes, Insets.NONE)
                .build();
        });
        ViewCompat.requestApplyInsets(webView);
    }
}

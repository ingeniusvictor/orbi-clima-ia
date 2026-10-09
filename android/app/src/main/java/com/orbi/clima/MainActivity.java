package com.orbi.clima;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.orbi.clima.alerts.OrbiOfficialAlertWatchPlugin;
import com.orbi.clima.widget.OrbiWidgetBridgePlugin;

/**
 * Canonical Capacitor activity for ORBI Clima IA.
 *
 * Local/native-only Capacitor plugins must be registered explicitly. Keeping
 * this file in source control also makes clean Android regeneration
 * deterministic for the widget and official-alert bridges.
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(OrbiWidgetBridgePlugin.class);
        registerPlugin(OrbiOfficialAlertWatchPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

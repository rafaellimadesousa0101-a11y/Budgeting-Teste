package com.budgeting.financial;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NotificationMonitorPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

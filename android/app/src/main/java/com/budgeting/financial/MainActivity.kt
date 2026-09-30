package com.budgeting.financial

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(NotificationMonitorPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}

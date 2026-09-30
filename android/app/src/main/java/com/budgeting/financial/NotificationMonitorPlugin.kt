package com.budgeting.financial

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "NotificationMonitor")
class NotificationMonitorPlugin : Plugin() {

    companion object {
        private var instance: NotificationMonitorPlugin? = null

        fun dispatchNotification(
            packageName: String,
            title: String,
            text: String,
            subText: String,
            timestamp: Long,
            notificationKey: String
        ) {
            instance?.let { plugin ->
                val data = JSObject().apply {
                    put("packageName", packageName)
                    put("title", title)
                    put("text", text)
                    put("subText", subText)
                    put("timestamp", timestamp)
                    put("notificationKey", notificationKey)
                }
                plugin.notifyListeners("onFinancialNotification", data)
            }
        }
    }

    override fun load() {
        super.load()
        instance = this
    }

    override fun handleOnDestroy() {
        if (instance == this) {
            instance = null
        }
        super.handleOnDestroy()
    }

    /**
     * Checks if the user granted NotificationListenerService permission to this app
     */
    @PluginMethod
    fun checkPermission(call: PluginCall) {
        val context = context ?: return call.reject("Context not available")
        val isGranted = isNotificationServiceEnabled(context)
        val ret = JSObject().apply {
            put("granted", isGranted)
        }
        call.resolve(ret)
    }

    /**
     * Opens Android System Settings to grant NotificationListenerService permission
     */
    @PluginMethod
    fun requestPermission(call: PluginCall) {
        val context = context ?: return call.reject("Context not available")
        try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
            call.resolve(JSObject().apply {
                put("openedSettings", true)
            })
        } catch (e: Exception) {
            call.reject("Could not open notification listener settings: ${e.message}", e)
        }
    }

    /**
     * Retrieves currently monitored package names
     */
    @PluginMethod
    fun getMonitoredApps(call: PluginCall) {
        val context = context ?: return call.reject("Context not available")
        val packages = FinancialNotificationListenerService.getMonitoredPackages(context)
        val jsArray = JSArray()
        packages.forEach { jsArray.put(it) }

        val ret = JSObject().apply {
            put("packages", jsArray)
        }
        call.resolve(ret)
    }

    /**
     * Updates the list of monitored banking package names
     */
    @PluginMethod
    fun setMonitoredApps(call: PluginCall) {
        val context = context ?: return call.reject("Context not available")
        val packagesArray = call.getArray("packages") ?: return call.reject("Missing 'packages' array")

        val set = mutableSetOf<String>()
        for (i in 0 until packagesArray.length()) {
            val pkg = packagesArray.optString(i)
            if (!pkg.isNullOrBlank()) {
                set.add(pkg)
            }
        }

        FinancialNotificationListenerService.setMonitoredPackages(context, set)
        call.resolve(JSObject().apply {
            put("success", true)
            put("count", set.size)
        })
    }

    private fun isNotificationServiceEnabled(context: Context): Boolean {
        val packageNames = NotificationManagerCompat.getEnabledListenerPackages(context)
        return packageNames.contains(context.packageName)
    }
}

package com.budgeting.financial

import android.app.Notification
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

class FinancialNotificationListenerService : NotificationListenerService() {

    companion object {
        private const val TAG = "FinancialNotifListener"
        const val ACTION_FINANCIAL_NOTIFICATION = "com.budgeting.financial.NOTIFICATION_POSTED"
        const val PREFS_NAME = "budgeting_monitoring_prefs"
        const val KEY_MONITORED_PACKAGES = "monitored_packages"

        // Default popular Brazilian banking packages monitored if no custom filter set
        val DEFAULT_BANKING_PACKAGES = setOf(
            "com.nu.production",        // Nubank
            "com.itau",                 // Itaú
            "com.itau.personnalite",    // Itaú Personnalité
            "com.bradesco",             // Bradesco
            "com.bradesco.prime",       // Bradesco Prime
            "br.com.bb.android",        // Banco do Brasil
            "com.santander.app",        // Santander
            "br.com.intermedium",       // Banco Inter
            "com.c6bank.app",           // C6 Bank
            "com.picpay",               // PicPay
            "com.mercadopago.wallet",   // Mercado Pago
            "br.gov.caixa.tem",         // Caixa Tem
            "br.com.caixa.mobile"       // Caixa Econômica Federal
        )

        fun getMonitoredPackages(context: Context): Set<String> {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val saved = prefs.getStringSet(KEY_MONITORED_PACKAGES, null)
            return saved ?: DEFAULT_BANKING_PACKAGES
        }

        fun setMonitoredPackages(context: Context, packages: Set<String>) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putStringSet(KEY_MONITORED_PACKAGES, packages).apply()
        }
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val packageName = sbn.packageName ?: return
        val monitored = getMonitoredPackages(applicationContext)

        // Only process notifications from selected/allowed financial applications
        if (!monitored.contains(packageName)) {
            return
        }

        val notification: Notification = sbn.notification ?: return
        val extras: Bundle = notification.extras ?: return

        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: ""
        val subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString() ?: ""

        val effectiveBody = if (bigText.isNotBlank()) bigText else text

        // Ignore empty or irrelevant system status notifications
        if (title.isBlank() && effectiveBody.isBlank()) {
            return
        }

        Log.d(TAG, "Financial notification intercepted from $packageName: $title - $effectiveBody")

        // Broadcast to Capacitor plugin
        NotificationMonitorPlugin.dispatchNotification(
            packageName = packageName,
            title = title,
            text = effectiveBody,
            subText = subText,
            timestamp = sbn.postTime,
            notificationKey = sbn.key ?: "${packageName}_${sbn.postTime}"
        )
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.i(TAG, "FinancialNotificationListenerService connected successfully")
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.w(TAG, "FinancialNotificationListenerService disconnected")
    }
}

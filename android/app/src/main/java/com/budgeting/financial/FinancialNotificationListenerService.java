package com.budgeting.financial;

import android.app.Notification;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class FinancialNotificationListenerService extends NotificationListenerService {

    private static final String TAG = "FinancialNotifListener";
    public static final String PREFS_NAME = "budgeting_monitoring_prefs";
    public static final String KEY_MONITORED_PACKAGES = "monitored_packages";

    public static final Set<String> DEFAULT_BANKING_PACKAGES = new HashSet<>(Arrays.asList(
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
    ));

    public static Set<String> getMonitoredPackages(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        Set<String> saved = prefs.getStringSet(KEY_MONITORED_PACKAGES, null);
        return saved != null ? saved : DEFAULT_BANKING_PACKAGES;
    }

    public static void setMonitoredPackages(Context context, Set<String> packages) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putStringSet(KEY_MONITORED_PACKAGES, packages).apply();
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        super.onNotificationPosted(sbn);
        if (sbn == null) return;

        String packageName = sbn.getPackageName();
        if (packageName == null) return;

        Set<String> monitored = getMonitoredPackages(getApplicationContext());
        if (!monitored.contains(packageName)) {
            return;
        }

        Notification notification = sbn.getNotification();
        if (notification == null) return;

        Bundle extras = notification.extras;
        if (extras == null) return;

        CharSequence titleCs = extras.getCharSequence(Notification.EXTRA_TITLE);
        CharSequence textCs = extras.getCharSequence(Notification.EXTRA_TEXT);
        CharSequence bigTextCs = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
        CharSequence subTextCs = extras.getCharSequence(Notification.EXTRA_SUB_TEXT);

        String title = titleCs != null ? titleCs.toString() : "";
        String text = textCs != null ? textCs.toString() : "";
        String bigText = bigTextCs != null ? bigTextCs.toString() : "";
        String subText = subTextCs != null ? subTextCs.toString() : "";

        String effectiveBody = (bigText != null && !bigText.trim().isEmpty()) ? bigText : text;

        if (title.trim().isEmpty() && effectiveBody.trim().isEmpty()) {
            return;
        }

        Log.d(TAG, "Financial notification intercepted from " + packageName + ": " + title + " - " + effectiveBody);

        String key = sbn.getKey();
        if (key == null || key.isEmpty()) {
            key = packageName + "_" + sbn.getPostTime();
        }

        NotificationMonitorPlugin.dispatchNotification(
            packageName,
            title,
            effectiveBody,
            subText,
            sbn.getPostTime(),
            key
        );
    }

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        Log.i(TAG, "FinancialNotificationListenerService connected successfully");
    }

    @Override
    public void onListenerDisconnected() {
        super.onListenerDisconnected();
        Log.w(TAG, "FinancialNotificationListenerService disconnected");
    }
}

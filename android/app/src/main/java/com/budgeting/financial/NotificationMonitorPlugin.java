package com.budgeting.financial;

import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.HashSet;
import java.util.Set;

@CapacitorPlugin(name = "NotificationMonitor")
public class NotificationMonitorPlugin extends Plugin {

    private static NotificationMonitorPlugin instance;

    public static void dispatchNotification(
        String packageName,
        String title,
        String text,
        String subText,
        long timestamp,
        String notificationKey
    ) {
        if (instance != null) {
            JSObject data = new JSObject();
            data.put("packageName", packageName);
            data.put("title", title);
            data.put("text", text);
            data.put("subText", subText);
            data.put("timestamp", timestamp);
            data.put("notificationKey", notificationKey);

            instance.notifyListeners("onFinancialNotification", data);
        }
    }

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    @Override
    protected void handleOnDestroy() {
        if (instance == this) {
            instance = null;
        }
        super.handleOnDestroy();
    }

    @PluginMethod
    public void checkPermission(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context not available");
            return;
        }

        boolean isGranted = isNotificationServiceEnabled(context);
        JSObject ret = new JSObject();
        ret.put("granted", isGranted);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context not available");
            return;
        }

        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);

            JSObject ret = new JSObject();
            ret.put("openedSettings", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Could not open notification listener settings: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void getMonitoredApps(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context not available");
            return;
        }

        Set<String> packages = FinancialNotificationListenerService.getMonitoredPackages(context);
        JSArray jsArray = new JSArray();
        for (String pkg : packages) {
            jsArray.put(pkg);
        }

        JSObject ret = new JSObject();
        ret.put("packages", jsArray);
        call.resolve(ret);
    }

    @PluginMethod
    public void setMonitoredApps(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context not available");
            return;
        }

        JSArray packagesArray = call.getArray("packages");
        if (packagesArray == null) {
            call.reject("Missing 'packages' array");
            return;
        }

        Set<String> set = new HashSet<>();
        for (int i = 0; i < packagesArray.length(); i++) {
            String pkg = packagesArray.optString(i, null);
            if (pkg != null && !pkg.trim().isEmpty()) {
                set.add(pkg.trim());
            }
        }

        FinancialNotificationListenerService.setMonitoredPackages(context, set);
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("count", set.size());
        call.resolve(ret);
    }

    private boolean isNotificationServiceEnabled(Context context) {
        Set<String> packageNames = NotificationManagerCompat.getEnabledListenerPackages(context);
        return packageNames != null && packageNames.contains(context.getPackageName());
    }
}

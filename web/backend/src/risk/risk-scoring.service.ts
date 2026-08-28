import { Injectable } from '@nestjs/common';
import { RiskLevel } from '@prisma/client';

const PLAY_STORE = 'com.android.vending';
const TRUSTED_INSTALLERS = new Set([
  PLAY_STORE,
  'com.sec.android.app.samsungapps',
  'com.google.android.packageinstaller',
  'com.android.packageinstaller',
]);

export type AppRiskInput = {
  packageName: string;
  appName?: string | null;
  versionName?: string | null;
  versionCode?: number | null;
  installerPackage?: string | null;
  isSystemApp: boolean;
  requestedPermissions: string[];
  dangerousPermissions: string[];
};

@Injectable()
export class RiskScoringService {
  scoreApp(input: AppRiskInput): {
    riskScore: number;
    riskLevel: RiskLevel;
    riskReasons: string[];
  } {
    let score = 0;
    const reasons: string[] = [];
    const perms = new Set(
      [...input.requestedPermissions, ...input.dangerousPermissions].map((p) =>
        p?.toUpperCase() ?? '',
      ),
    );

    const installer = input.installerPackage?.trim().toLowerCase() || null;
    const fromTrustedInstaller = installer !== null && TRUSTED_INSTALLERS.has(installer);
    const trustedApp = input.isSystemApp || fromTrustedInstaller;

    if (input.isSystemApp) {
      reasons.push('System app (trusted baseline)');
    } else if (fromTrustedInstaller) {
      reasons.push('Trusted installer (Google Play or Galaxy Store)');
    } else {
      score += 50;
      reasons.push('App not installed from Google Play');
      if (installer === null) reasons.push('Unknown or missing installer source');
    }
    if (!trustedApp && (perms.has('ANDROID.PERMISSION.SEND_SMS') || perms.has('ANDROID.PERMISSION.RECEIVE_SMS'))) {
      score += 20;
      reasons.push('SMS-related permission requested');
    }
    if (
      !trustedApp && (perms.has('ANDROID.PERMISSION.BIND_ACCESSIBILITY_SERVICE') ||
      input.packageName.toLowerCase().includes('accessibility')
      )
    ) {
      score += 25;
      reasons.push('Accessibility-related capability or permission');
    }
    if (!trustedApp && perms.has('ANDROID.PERMISSION.SYSTEM_ALERT_WINDOW')) {
      score += 20;
      reasons.push('Overlay (SYSTEM_ALERT_WINDOW) permission');
    }
    if (!trustedApp && perms.has('ANDROID.PERMISSION.READ_CONTACTS')) {
      score += 10;
      reasons.push('READ_CONTACTS permission');
    }
    if (!trustedApp && perms.has('ANDROID.PERMISSION.READ_PHONE_STATE')) {
      score += 10;
      reasons.push('READ_PHONE_STATE permission');
    }
    if (!trustedApp && perms.has('ANDROID.PERMISSION.REQUEST_INSTALL_PACKAGES')) {
      score += 25;
      reasons.push('REQUEST_INSTALL_PACKAGES permission');
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    let riskLevel: RiskLevel = 'LOW';
    if (score >= 81) riskLevel = 'CRITICAL';
    else if (score >= 61) riskLevel = 'HIGH';
    else if (score >= 31) riskLevel = 'MEDIUM';

    const uniqueReasons = [...new Set(reasons)];
    return { riskScore: score, riskLevel, riskReasons: uniqueReasons };
  }

  overallFromApps(scores: number[]): number {
    if (!scores.length) return 0;
    const sorted = [...scores].sort((a, b) => b - a);
    const top = sorted.slice(0, 5);
    const avg = top.reduce((a, b) => a + b, 0) / top.length;
    return Math.min(100, Math.round(avg));
  }
}

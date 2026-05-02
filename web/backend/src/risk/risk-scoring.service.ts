import { Injectable } from '@nestjs/common';
import { RiskLevel } from '@prisma/client';

const PLAY_STORE = 'com.android.vending';
const TRUSTED_INSTALLERS = new Set([PLAY_STORE]);

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

    const installer = input.installerPackage?.trim() || null;
    const fromPlay = installer === PLAY_STORE;

    if (!fromPlay) {
      score += 25;
      reasons.push('App not installed from Google Play');
    }
    if (installer === null || installer === '') {
      score += 25;
      reasons.push('Unknown or missing installer source');
    }
    if (perms.has('android.permission.SEND_SMS') || perms.has('android.permission.RECEIVE_SMS')) {
      score += 20;
      reasons.push('SMS-related permission requested');
    }
    if (
      perms.has('android.permission.BIND_ACCESSIBILITY_SERVICE') ||
      input.packageName.toLowerCase().includes('accessibility')
    ) {
      score += 25;
      reasons.push('Accessibility-related capability or permission');
    }
    if (perms.has('android.permission.SYSTEM_ALERT_WINDOW')) {
      score += 20;
      reasons.push('Overlay (SYSTEM_ALERT_WINDOW) permission');
    }
    if (perms.has('android.permission.READ_CONTACTS')) {
      score += 10;
      reasons.push('READ_CONTACTS permission');
    }
    if (perms.has('android.permission.RECORD_AUDIO')) {
      score += 10;
      reasons.push('RECORD_AUDIO permission');
    }
    if (perms.has('android.permission.CAMERA')) {
      score += 8;
      reasons.push('CAMERA permission');
    }
    if (perms.has('android.permission.READ_PHONE_STATE')) {
      score += 10;
      reasons.push('READ_PHONE_STATE permission');
    }
    if (perms.has('android.permission.REQUEST_INSTALL_PACKAGES')) {
      score += 25;
      reasons.push('REQUEST_INSTALL_PACKAGES permission');
    }

    if (input.isSystemApp) {
      score -= 20;
      reasons.push('System app (reduced baseline risk)');
    }
    if (installer && TRUSTED_INSTALLERS.has(installer)) {
      score -= 20;
      reasons.push('Trusted installer (Google Play)');
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

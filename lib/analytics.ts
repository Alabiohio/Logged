/**
 * Centralized Google Analytics event tracking.
 * All events are sent via @next/third-parties/google sendGAEvent.
 * This module provides typed wrappers so call-sites stay clean and
 * event names/parameters are consistent across the codebase.
 */

import { sendGAEvent } from "@next/third-parties/google";

// ─── Dashboard ────────────────────────────────────────────────────────────────

/** Fired when the main dashboard overview page finishes loading data. */
export function trackDashboardViewed(stats: {
  projects: number;
  logsToday: number;
  errorsToday: number;
  warningsToday: number;
}) {
  sendGAEvent("event", "dashboard_viewed", {
    projects_count: stats.projects,
    logs_today: stats.logsToday,
    errors_today: stats.errorsToday,
    warnings_today: stats.warningsToday,
  });
}

// ─── Projects ─────────────────────────────────────────────────────────────────

/** Fired when the user successfully creates a new project. */
export function trackProjectCreated(projectName: string) {
  sendGAEvent("event", "project_created", {
    project_name: projectName,
  });
}

/** Fired when the user switches to a different project via ProjectSwitcher. */
export function trackProjectSwitched(projectId: string, projectName: string) {
  sendGAEvent("event", "project_switched", {
    project_id: projectId,
    project_name: projectName,
  });
}

/** Fired when the user clicks a project card/link in the dashboard. */
export function trackProjectOpened(projectId: string, projectName: string) {
  sendGAEvent("event", "project_opened", {
    project_id: projectId,
    project_name: projectName,
  });
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

/** Fired when the log details drawer is opened for a specific log entry. */
export function trackLogViewed(logId: string, level: string, projectId: string) {
  sendGAEvent("event", "log_viewed", {
    log_id: logId,
    log_level: level,
    project_id: projectId,
  });
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

/** Fired when the user copies an API key to the clipboard. */
export function trackApiKeyCopied(projectId: string, environment: string) {
  sendGAEvent("event", "api_key_copied", {
    project_id: projectId,
    environment,
  });
}

/** Fired when the user successfully regenerates an API key. */
export function trackApiKeyRegenerated(projectId: string, environment: string) {
  sendGAEvent("event", "api_key_regenerated", {
    project_id: projectId,
    environment,
  });
}

// ─── Settings ─────────────────────────────────────────────────────────────────

/** Fired when the user saves a settings section successfully. */
export function trackSettingsSaved(section: string) {
  sendGAEvent("event", "settings_saved", {
    section,
  });
}

/** Fired when the user changes their theme preference. */
export function trackThemeChanged(theme: string) {
  sendGAEvent("event", "theme_changed", {
    theme,
  });
}

/** Fired when the user signs out. */
export function trackSignOut() {
  sendGAEvent("event", "sign_out", {});
}

/** Fired when the user revokes a session from settings. */
export function trackSessionRevoked() {
  sendGAEvent("event", "session_revoked", {});
}

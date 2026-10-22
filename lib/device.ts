export interface ParsedDevice {
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    device: string;
    deviceType: "desktop" | "mobile" | "tablet" | "unknown";
    displayTitle: string;
    displaySubtitle: string;
    osFamily: "windows" | "apple" | "android" | "linux" | "unknown";
    browserFamily: "chrome" | "safari" | "firefox" | "edge" | "opera" | "brave" | "arc" | "other";
}

export function parseUserAgent(uaString: string | null | undefined): ParsedDevice {
    if (!uaString || typeof uaString !== "string" || uaString.trim() === "") {
        return {
            browser: "Unknown Browser",
            browserVersion: "",
            os: "Unknown OS",
            osVersion: "",
            device: "Unknown Device",
            deviceType: "unknown",
            displayTitle: "Unknown Device",
            displaySubtitle: "Web Browser",
            osFamily: "unknown",
            browserFamily: "other",
        };
    }

    const ua = uaString.trim();

    // ─── 1. Detect Operating System & Version ──────────────────────────────
    let os = "Unknown OS";
    let osVersion = "";
    let osFamily: ParsedDevice["osFamily"] = "unknown";
    let deviceType: ParsedDevice["deviceType"] = "desktop";
    let device = "Desktop PC";

    if (/windows nt 10\.0/i.test(ua)) {
        os = "Windows 10 / 11";
        osFamily = "windows";
        device = "Windows PC";
        deviceType = "desktop";
    } else if (/windows nt 6\.3/i.test(ua)) {
        os = "Windows 8.1";
        osFamily = "windows";
        device = "Windows PC";
        deviceType = "desktop";
    } else if (/windows nt 6\.2/i.test(ua)) {
        os = "Windows 8";
        osFamily = "windows";
        device = "Windows PC";
        deviceType = "desktop";
    } else if (/windows nt 6\.1/i.test(ua)) {
        os = "Windows 7";
        osFamily = "windows";
        device = "Windows PC";
        deviceType = "desktop";
    } else if (/windows nt/i.test(ua)) {
        os = "Windows";
        osFamily = "windows";
        device = "Windows PC";
        deviceType = "desktop";
    } else if (/iphone/i.test(ua)) {
        osFamily = "apple";
        deviceType = "mobile";
        device = "iPhone";
        const match = ua.match(/cpu iphone os (\d+[_.]\d+)/i);
        if (match) {
            osVersion = match[1].replace(/_/g, ".");
            os = `iOS ${osVersion}`;
        } else {
            os = "iOS";
        }
    } else if (/ipad/i.test(ua)) {
        osFamily = "apple";
        deviceType = "tablet";
        device = "iPad";
        const match = ua.match(/cpu os (\d+[_.]\d+)/i);
        if (match) {
            osVersion = match[1].replace(/_/g, ".");
            os = `iPadOS ${osVersion}`;
        } else {
            os = "iPadOS";
        }
    } else if (/macintosh|mac os x/i.test(ua)) {
        osFamily = "apple";
        device = "Mac";
        deviceType = "desktop";
        const match = ua.match(/mac os x (\d+[_.]\d+([_.]\d+)?)/i);
        if (match) {
            const raw = match[1].replace(/_/g, ".");
            osVersion = raw;
            const parts = raw.split(".").map(Number);
            const major = parts[0];
            const minor = parts[1];
            if (major === 15) os = "macOS Sequoia";
            else if (major === 14) os = "macOS Sonoma";
            else if (major === 13) os = "macOS Ventura";
            else if (major === 12) os = "macOS Monterey";
            else if (major === 11) os = "macOS Big Sur";
            else if (major === 10 && minor === 15) os = "macOS Catalina";
            else os = `macOS ${raw}`;
        } else {
            os = "macOS";
        }
    } else if (/android/i.test(ua)) {
        osFamily = "android";
        deviceType = /mobile/i.test(ua) ? "mobile" : "tablet";
        const match = ua.match(/android (\d+(\.\d+)?)/i);
        if (match) {
            osVersion = match[1];
            os = `Android ${osVersion}`;
        } else {
            os = "Android";
        }

        // Try to identify Android phone manufacturer or model
        if (/samsung|sm-[a-z0-9]+/i.test(ua)) {
            device = "Samsung Galaxy";
        } else if (/pixel [0-9a-z]+/i.test(ua)) {
            const pMatch = ua.match(/pixel [0-9a-z]+/i);
            device = pMatch ? `Google ${pMatch[0]}` : "Google Pixel";
        } else if (/oneplus/i.test(ua)) {
            device = "OnePlus Device";
        } else if (/xiaomi|redmi|poco/i.test(ua)) {
            device = "Xiaomi Phone";
        } else {
            device = deviceType === "tablet" ? "Android Tablet" : "Android Phone";
        }
    } else if (/cros/i.test(ua)) {
        os = "ChromeOS";
        osFamily = "linux";
        device = "Chromebook";
        deviceType = "desktop";
    } else if (/ubuntu/i.test(ua)) {
        os = "Ubuntu Linux";
        osFamily = "linux";
        device = "Linux PC";
        deviceType = "desktop";
    } else if (/linux/i.test(ua)) {
        os = "Linux";
        osFamily = "linux";
        device = "Linux PC";
        deviceType = "desktop";
    }

    // ─── 2. Detect Browser & Version ──────────────────────────────────────
    let browser = "Web Browser";
    let browserVersion = "";
    let browserFamily: ParsedDevice["browserFamily"] = "other";

    if (/edg\/(\d+[\.\d]*)/i.test(ua)) {
        browserFamily = "edge";
        const match = ua.match(/edg\/(\d+[\.\d]*)/i);
        browserVersion = match ? match[1].split(".")[0] : "";
        browser = "Microsoft Edge";
    } else if (/arc\/(\d+[\.\d]*)/i.test(ua)) {
        browserFamily = "arc";
        const match = ua.match(/arc\/(\d+[\.\d]*)/i);
        browserVersion = match ? match[1].split(".")[0] : "";
        browser = "Arc";
    } else if (/opr\/(\d+[\.\d]*)/i.test(ua) || /opera/i.test(ua)) {
        browserFamily = "opera";
        const match = ua.match(/opr\/(\d+[\.\d]*)/i);
        browserVersion = match ? match[1].split(".")[0] : "";
        browser = "Opera";
    } else if (/samsungbrowser\/(\d+[\.\d]*)/i.test(ua)) {
        browserFamily = "chrome";
        const match = ua.match(/samsungbrowser\/(\d+[\.\d]*)/i);
        browserVersion = match ? match[1].split(".")[0] : "";
        browser = "Samsung Internet";
    } else if (/brave/i.test(ua)) {
        browserFamily = "brave";
        browser = "Brave";
    } else if (/firefox\/(\d+[\.\d]*)/i.test(ua) || /fxios\/(\d+[\.\d]*)/i.test(ua)) {
        browserFamily = "firefox";
        const match = ua.match(/(?:firefox|fxios)\/(\d+[\.\d]*)/i);
        browserVersion = match ? match[1].split(".")[0] : "";
        browser = "Firefox";
    } else if (/chrome\/(\d+[\.\d]*)/i.test(ua) || /crios\/(\d+[\.\d]*)/i.test(ua)) {
        browserFamily = "chrome";
        const match = ua.match(/(?:chrome|crios)\/(\d+[\.\d]*)/i);
        browserVersion = match ? match[1].split(".")[0] : "";
        browser = "Chrome";
    } else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) {
        browserFamily = "safari";
        const match = ua.match(/version\/(\d+[\.\d]*)/i);
        browserVersion = match ? match[1].split(".")[0] : "";
        browser = "Safari";
    }

    // ─── 3. Construct Friendly Display Strings ─────────────────────────────
    const versionSuffix = browserVersion ? ` ${browserVersion}` : "";
    const displayTitle = `${browser} on ${device}`;
    const displaySubtitle = `${os} · ${browser}${versionSuffix}`;

    return {
        browser: `${browser}${versionSuffix}`,
        browserVersion,
        os,
        osVersion,
        device,
        deviceType,
        displayTitle,
        displaySubtitle,
        osFamily,
        browserFamily,
    };
}

export function formatIpAddress(ip: string | null | undefined): string {
    if (!ip) return "Unknown IP";
    const trimmed = ip.trim();
    if (trimmed === "::1" || trimmed === "127.0.0.1" || /^0+:0+:0+/i.test(trimmed)) {
        return "Localhost (Development)";
    }
    return trimmed;
}



/* Shadcn Stuff  */


import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
    y?: number;
    x?: number;
    start?: number;
    duration?: number;
};

export const flyAndScale = (
    node: Element,
    params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;

    const scaleConversion = (
        valueA: number,
        scaleA: [number, number],
        scaleB: [number, number]
    ) => {
        const [minA, maxA] = scaleA;
        const [minB, maxB] = scaleB;

        const percentage = (valueA - minA) / (maxA - minA);
        const valueB = percentage * (maxB - minB) + minB;

        return valueB;
    };

    const styleToString = (
        style: Record<string, number | string | undefined>
    ): string => {
        return Object.keys(style).reduce((str, key) => {
            if (style[key] === undefined) return str;
            return str + `${key}:${style[key]};`;
        }, "");
    };

    return {
        duration: params.duration ?? 200,
        delay: 0,
        css: (t) => {
            const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
            const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
            const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

            return styleToString({
                transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                opacity: t
            });
        },
        easing: cubicOut
    };
};


/** Custom Util */


export function parseUserAgent(uaString: string) {
    const result = {
        browser: null,
        version: null,
        os: null,
    } as any;

    // Check for popular browsers
    if (/firefox/i.test(uaString)) {
        result.browser = 'Firefox';
    } else if (/edg/i.test(uaString)) {
        result.browser = 'Edge';
    } else if (/chrome/i.test(uaString)) {
        result.browser = 'Chrome';
    } else if (/safari/i.test(uaString)) {
        result.browser = 'Safari';
    } else if (/opera|opr/i.test(uaString)) {
        result.browser = 'Opera';
    } else if (/msie|trident/i.test(uaString)) {
        result.browser = 'Internet Explorer';
    }

    // Extract version
    const versionMatch = uaString.match(/(?:version|rv|chrome|firefox|safari|opr|edg|msie|trident)[\/ ]?([\d.]+)/i);
    if (versionMatch && versionMatch[1]) {
        result.version = versionMatch[1];
    }

    // Extract OS information
    if (/windows/i.test(uaString)) {
        result.os = 'Windows';
    } else if (/macintosh|mac os x/i.test(uaString)) {
        result.os = 'MacOS';
    } else if (/linux/i.test(uaString)) {
        result.os = 'Linux';
    } else if (/iphone/i.test(uaString)) {
        result.os = 'iOS';
    } else if (/android/i.test(uaString)) {
        result.os = 'Android';
    }

    return result;
}
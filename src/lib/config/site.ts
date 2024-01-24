export const siteConfig = {
    name: "kit-auth",
    url: "/",
    ogImage: "/og.png",
    description: "The Description of the site",
    links: {
        twitter: "https://twitter.com/shrestho0",
        github: "https://github.com/shrestho0",
        linkedin: "https://www.linkedin.com/in/shrestho0/",
        kitGithub: "https://github.com/shrestho0/kit-auth"
    },
    keywords: `kit-auth`,
    mainNav: [
        { title: "Home", href: "/" },
        { title: "About", href: "/about" },
        { title: "Contact", href: "/contact" },
        // { title: "Settings", href: "/settings" },
    ],
    sidebarNav: [
        {
            title: "Home", href: "/", label: "Home", items: [
                { title: "Sub 1", href: "/", label: 'Sub1', disabled: false, },
            ]
        },
        {
            title: "Home", href: "/", label: "Home", items: [
                { title: "Sub 1", href: "/", label: 'Sub1', disabled: false, },
            ]
        },
    ],

    loggedUserDropdown: [
        { title: "Profile", href: "/profile", shortcutKey: "p" },
        { title: "Settings", href: "/settings", shortcutKey: "s" },
        // { title: "Logout", href: "/logout", shortcutKey: "l" },
    ],

    nonLoggedInUserEvents: new Map([]),

    loggedInUserEventsMap: new Map([
        ["p", {
            title: "Profile", href: "/profile", shortcutKey: "p", visible: true
        },],
        ["s", {
            title: "Settings", href: "/settings", shortcutKey: "s", visible: true
        },],

    ])

};


export type SiteConfig = typeof siteConfig;
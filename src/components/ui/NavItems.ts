type NavItems = {
    label: string;
    href: string;
}

export const NavItemsOrg: NavItems[] = [
    // { label: "แดชบอร์ด", href: "/dashboard" },
    { label: "โพสต์ของฉัน", href: "/posts" },
    { label: "สร้างโพสต์", href: "/create" },
    // { label: "เกี่ยวกับเรา", href: "/about" },
];

export const NavItemsAtten: NavItems[] = [
	{ label: "หน้าหลัก", href: "/feed" },
	{ label: "ชมรม", href: "/clubs" },
	{ label: "ปฏิทิน", href: "/calendar" },
];
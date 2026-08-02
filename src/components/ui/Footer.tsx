"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Linkedin, Instagram, Globe } from 'lucide-react';
import { NavItemsOrg, NavItemsAtten } from '@/components/ui/NavItems';
import { useAuth } from '@/components/ui/context/AuthContext';

export const Footer = () => {
    const { isLoggedIn, isOrg } = useAuth();
    const navItems = (isOrg) ? NavItemsOrg : NavItemsAtten;
    return (
        <footer className="w-full shadow-[0_-1px_6px_0_rgba(0,0,0,0.12)] flex flex-col gap-y-5 lg:px-25 pt-7.5 lg:pb-5 pb-2.5">
            <div className="w-full flex lg:flex-row flex-col justify-center lg:justify-between lg:relative lg:items-center mb-5 gap-y-12.5 lg:gap-auto">
                <div className="flex flex-col items-center lg:items-start gap-y-3">
                    <Image
                        src="/images/svg/logo.svg" 
                        alt="logo" 
                        width={128}
                        height={64}
                        className="h-22.5 lg:h-16 w-auto"/>
                    {/* hidden for first official launch */}
                    <div className="hidden items-center flex gap-2">
                        <Image src="/images/github-logo.svg" alt="github" width={34} height={34}/>
                        <Link href="" target="_blank" className="text-black text-sm">available open source</Link>
                    </div>
                </div>
                <div className="text-text-gray text-sm lg:text-base gap-7.5 flex justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href}>
                            {item.label}
                        </Link>
                    ))}
                </div>
                <div className="gap-2.5 flex justify-center">
                    <Link href="" target="_blank"><Facebook size={28} color="black"/></Link>
                    <Link href="" target="_blank"><Linkedin size={28} color="black"/></Link>
                    <Link href="" target="_blank"><Instagram size={28} color="black"/></Link>
                    <Link href="" target="_blank"><Globe size={28} color="black"/></Link>
                </div>
            </div>
            <div className="flex items-center flex-col justify-center lg:flex-row lg:justify-between">
                <div className="text-[#8C8C8C] text-sm">Thinc. 2025 all right reserved</div>
                <div className="text-[#8C8C8C] text-sm gap-8 flex underline">
                    <Link href="" target="_blank">Privacy Policy</Link>
                    <Link href="" target="_blank">Privacy Reference</Link>
                </div>
            </div>
        </footer>
    );
}
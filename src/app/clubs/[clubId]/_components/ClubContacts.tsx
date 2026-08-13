import type { ReactNode } from "react";
import Image from "next/image";
import { Facebook, Instagram } from "lucide-react";

import type { RouterOutputs } from "@/trpc/react";

type Club = RouterOutputs["clubs"]["getById"];
type ClubContactChannel = keyof NonNullable<Club["contacts"]>;

const ICON_CLASS = "size-4 shrink-0 md:size-5";

type ContactChannel = {
  key: ClubContactChannel;
  name: string;
  baseUrl: string;
  /** LINE official-account ids legitimately begin with "@", so only the others strip it. */
  stripLeadingAt: boolean;
  icon: ReactNode;
};

// lucide has no TikTok or LINE glyph, so those two are brand marks exported from Figma
// into public/svg — asset files loaded through next/image, the same way Navbar loads logo.svg.
const CONTACT_CHANNELS: ContactChannel[] = [
  {
    key: "instagram",
    name: "Instagram",
    baseUrl: "https://www.instagram.com/",
    stripLeadingAt: true,
    icon: <Instagram aria-hidden="true" className={ICON_CLASS} />,
  },
  {
    key: "facebook",
    name: "Facebook",
    baseUrl: "https://www.facebook.com/",
    stripLeadingAt: true,
    icon: <Facebook aria-hidden="true" className={ICON_CLASS} />,
  },
  {
    key: "tiktok",
    name: "TikTok",
    baseUrl: "https://www.tiktok.com/@",
    stripLeadingAt: true,
    icon: <Image src="/svg/tiktok.svg" alt="" width={20} height={20} className={ICON_CLASS} />,
  },
  {
    key: "line_oa",
    name: "LINE",
    baseUrl: "https://line.me/R/ti/p/~",
    stripLeadingAt: false,
    icon: <Image src="/svg/line.svg" alt="" width={20} height={20} className={ICON_CLASS} />,
  },
];

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

/**
 * Stored values are handles, but a club that pasted a full profile URL should still link
 * correctly — so an absolute value is used as-is and anything else is appended to the base.
 */
const buildContactUrl = ({ baseUrl, stripLeadingAt }: ContactChannel, value: string) => {
  if (isAbsoluteUrl(value)) return value;

  const handle = stripLeadingAt ? value.replace(/^@+/, "") : value;
  // encodeURI, not encodeURIComponent — the latter escapes "@" to "%40", which breaks
  // the LINE deep link (line.me/R/ti/p/~@handle).
  return `${baseUrl}${encodeURI(handle)}`;
};

type ClubContactsProps = {
  contacts: NonNullable<Club["contacts"]>;
  clubName: Club["name"];
};

export function ClubContacts({ contacts, clubName }: ClubContactsProps) {
  const channels = CONTACT_CHANNELS.map((channel) => ({
    channel,
    value: contacts[channel.key]?.trim(),
  })).filter((entry): entry is { channel: ContactChannel; value: string } => Boolean(entry.value));

  if (channels.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-ibm-plex text-foreground text-base leading-[26px] font-bold md:text-xl md:leading-[33px]">
        ช่องทางติดต่อ
      </h2>

      <ul className="flex flex-wrap items-start gap-2 md:gap-4">
        {channels.map(({ channel, value }) => (
          <li key={channel.key}>
            <a
              href={buildContactUrl(channel, value)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${channel.name} ของ${clubName}: ${value} (เปิดในแท็บใหม่)`}
              className="border-primary text-primary hover:bg-primary-lighter focus-visible:ring-primary font-ibm-plex flex h-10 items-center gap-2 rounded-xl border px-4 text-sm leading-[23px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:text-base md:leading-[26px]"
            >
              {channel.icon}
              {value}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

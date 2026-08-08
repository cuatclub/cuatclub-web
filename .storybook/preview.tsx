import { useEffect } from "react";
import type { Preview } from "@storybook/nextjs-vite";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "../src/styles/globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

const preview: Preview = {
  decorators: [
    (Story) => {
      // Radix portals (Select dropdown, etc.) mount to document.body, escaping
      // this decorator's wrapper div — apply the font vars to body directly
      // so portaled content inherits them too.
      useEffect(() => {
        document.body.classList.add(plexThai.variable, "font-ibm-plex");
        return () => {
          document.body.classList.remove(plexThai.variable, "font-ibm-plex");
        };
      }, []);

      return (
        <div className={`${plexThai.variable} font-ibm-plex`}>
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;

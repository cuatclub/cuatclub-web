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
    (Story) => (
      <div className={`${plexThai.variable} font-ibm-plex`}>
        <Story />
      </div>
    ),
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

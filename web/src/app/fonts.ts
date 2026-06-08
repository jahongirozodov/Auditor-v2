/**
 * Self-hosted webfonts via next/font (closed-network friendly — no Google CDN
 * at runtime). Each family is exposed as a CSS variable that the design-system
 * token layer (src/styles/tokens/fonts.css) maps onto --font-display/sans/mono.
 *
 * Uzbek (Latin) uses modifier letters (oʻ, gʻ, ʼ), so we include "latin-ext".
 * For a fully air-gapped *build*, swap these to next/font/local with the font
 * files committed under src/app/fonts/.
 */
import { Plus_Jakarta_Sans, Manrope, JetBrains_Mono } from "next/font/google";

export const fontDisplay = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const fontSans = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

/** Combined font CSS-variable classes to put on <html>. */
export const fontVariables = `${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`;

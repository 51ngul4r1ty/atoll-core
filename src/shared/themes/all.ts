/*

  Color Naming
  ============

  Overview
  --------

  Think of the web page as a blank canvas.  You're given a page of a particular color and a pen of a particular color.
  Those two colors are the most basic "build blocks" of your theme.

  Basic Building Blocks
  ---------------------

  page & pen
    - while "background" and "foreground" are often used for this we chose "page" and "pen"
      instead to avoid direct comparison with the CSS property "background-color"
      ("page-color" and "pen-color" won't match typical CSS property names)

  Using these 2 types of building blocks we append `-color` to come up with (1) page-color and (2) pen-color.
  When building new colors that are a part of our theme we can prepend other modifier (see sections below).


  Normal/Inverted Modifiers
  -------------------------

  While page & pen may seem like two obvious contrasting colors in our theme we can't just use them as named in all
  situations, even when the color values may match.  One of those cases is inverted elements.  It would be confusing
  to use `backgroud-color: var(--pen-color)` and `color: var(--page-color)` for these inverted elements.  Instead,
  we'll prepend `normal-` for the typical case and `inverted-` for the inverse case:
    (1) normal-pen-color
    (2) normal-page-color
    (3) inverted-pen-color
    (4) inverted-page-color


  States
  ------

  There are a few element states that we'll also need to represent in our naming convention:
    (a) Enabled/Disabled
    (b) Active/Hover/Focus/Visited

  So we expand our naming convention to cover those:
    (1) normal-active-page-color, normal-active-pen-color
    (2) normal-focus-page-color, normal-focus-pen-color
    (3) normal-disabled-page-color, normal-disabled-pen-color

  Hovering works a little differently because a shadow is often used for this style:
    (4) normal-hover-shadow, normal-hover-shadow-size

*/

export interface Theme {
    "--normal-page-color": string;
    "--normal-pen-color": string;
    "--normal-active-page-color": string;
    "--normal-focus-page-color": string;
    "--normal-hover-shadow": string;
    "--normal-hover-shadow-size": string;
    "--inverted-page-color": string;
    "--inverted-pen-color": string;
    "--standard-font-size": string;
    "--menu-panel-font-size": string;
}

export const defaultTheme: Theme = {
    "--normal-page-color": "white",
    "--normal-pen-color": "black",
    "--normal-active-page-color": "#ddd",
    "--normal-focus-page-color": "#eee",
    "--normal-hover-shadow": "rgba(0, 0, 0, 0.4)",
    "--normal-hover-shadow-size": "0.6rem",
    "--inverted-page-color": "black",
    "--inverted-pen-color": "white",
    "--standard-font-size": "0.95rem",
    "--menu-panel-font-size": "1.3rem"
};

export const darkTheme: Theme = {
    "--normal-page-color": "black",
    "--normal-pen-color": "white",
    "--normal-active-page-color": "#444",
    "--normal-focus-page-color": "#333",
    "--normal-hover-shadow": "rgba(255, 255, 255, 1.0)",
    "--normal-hover-shadow-size": "1.0rem",
    "--inverted-page-color": "white",
    "--inverted-pen-color": "black",
    "--standard-font-size": "0.95rem",
    "--menu-panel-font-size": "1.3rem"
};

export interface ThemeListItem {
    name: string;
    theme: Theme;
}

export const themeList: ThemeListItem[] = [{ name: "default", theme: defaultTheme }, { name: "dark", theme: darkTheme }];

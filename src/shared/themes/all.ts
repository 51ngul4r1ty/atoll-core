export interface Theme {
    '--primary-background-color': string;
    '--primary-line-color': string;
    '--primary-font-color': string;
    '--primary-hover-shadow': string;
    '--primary-hover-shadow-size': string;
    '--primary-active-background-color': string;
    '--primary-focus-background-color': string;
}

export const defaultTheme: Theme = {
    '--primary-background-color': 'white',
    '--primary-line-color': 'black',
    '--primary-font-color': 'black',
    '--primary-hover-shadow': 'rgba(0, 0, 0, 0.4)',
    '--primary-hover-shadow-size': '0.6rem',
    '--primary-active-background-color': '#ddd',
    '--primary-focus-background-color': '#eee'
};

export const darkTheme: Theme = {
    '--primary-background-color': 'black',
    '--primary-line-color': 'white',
    '--primary-font-color': 'white',
    '--primary-hover-shadow': 'rgba(255, 255, 255, 1.0)',
    '--primary-hover-shadow-size': '1.0rem',
    '--primary-active-background-color': '#444',
    '--primary-focus-background-color': '#333'
};

export interface ThemeListItem {
    name: string;
    theme: Theme;
}

export const themeList: ThemeListItem[] = [
    { name: 'default', theme: defaultTheme },
    { name: 'dark', theme: darkTheme }
];
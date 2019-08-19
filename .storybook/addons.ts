/* set up "root attribute" addon for theming use */

// https://github.com/le0pard/storybook-addon-root-attribute

// option 1: use panel
import "storybook-addon-root-attribute/register";
// option 2: use toolbar
// import 'storybook-addon-root-attribute/registerToolbar';

/* other addons */
import '@storybook/addon-actions/register';
import '@storybook/addon-links/register';

/* set up dark mode theme for storybook */
import 'storybook-dark-mode/register';

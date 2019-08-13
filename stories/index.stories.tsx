import React from 'react';

import { addDecorator, addParameters, storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import { withRootAttribute } from 'storybook-addon-root-attribute';

import { Welcome } from '@storybook/react/demo';

import { SimpleButton } from '../src/shared/components/buttons/SimpleButton';
import { HamburgerIcon } from '../src/shared/components/images/HamburgerIcon';

addDecorator(withRootAttribute);
addParameters({
    rootAttribute: {
        root: "html",
        attribute: "class",
        defaultState: {
            name: 'Default',
            value: "theme-default",
        },
        states: [
            {
                name: 'Dark',
                value: "theme-dark",
            },
        ],
    },
});

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Buttons', module)
    .add('SimpleButton', () => (
        <SimpleButton icon={<HamburgerIcon />} onClick={action('clicked')}>
            Menu
        </SimpleButton>
    ));

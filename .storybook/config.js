import {configure, addDecorator} from '@kadira/storybook';
import {muiTheme} from 'storybook-addon-material-ui';

const req = require.context('../src/', true, /.stories.tsx$/);

const loadStories = () => {
  req.keys().forEach((filename) => req(filename))
};

addDecorator(muiTheme());
configure(loadStories, module);

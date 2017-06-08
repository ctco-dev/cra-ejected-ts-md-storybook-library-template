import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

declare module 'react' {
  interface HTMLProps<T> {
    onTouchTap?: React.EventHandler<React.TouchEvent<T>>;
  }
}

// Copyright 2019-2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import { StoryRow } from './StoryRow';
import { ConfirmDialog } from './ConfirmDialog';

storiesOf('Sticker Creator/elements', module).add('ConfirmDialog', () => {
  const title = text('title', 'Foo bar banana baz?');
  const child = text(
    'text',
    'Yadda yadda yadda yadda yadda yadda foo bar banana baz.'
  );
  const confirm = text('confirm', 'Upload');
  const cancel = text('cancel', 'Cancel');

  return (
    <StoryRow>
      <ConfirmDialog
        {...{ title, confirm, cancel }}
        onConfirm={action('onConfirm')}
        onCancel={action('onCancel')}
      >
        {child}
      </ConfirmDialog>
    </StoryRow>
  );
});

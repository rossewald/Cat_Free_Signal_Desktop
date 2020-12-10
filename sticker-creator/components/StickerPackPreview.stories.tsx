// Copyright 2019-2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';

import { StoryRow } from '../elements/StoryRow';
import { StickerPackPreview } from './StickerPackPreview';

storiesOf('Sticker Creator/components', module).add(
  'StickerPackPreview',
  () => {
    const image = text('image url', '/fixtures/512x515-thumbs-up-lincoln.webp');
    const title = text('title', 'Sticker pack title');
    const author = text('author', 'Sticker pack author');
    const images = React.useMemo(() => Array(39).fill(image), [image]);

    return (
      <StoryRow top>
        <StickerPackPreview images={images} title={title} author={author} />
      </StoryRow>
    );
  }
);

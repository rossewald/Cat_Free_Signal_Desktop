// Copyright 2018-2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

/* global $: false */
/* global Whisper: false */

$(document).on('keydown', e => {
  if (e.keyCode === 27) {
    window.closeDebugLog();
  }
});

const $body = $(document.body);
$body.addClass(`${window.theme}-theme`);

// got.js appears to need this to successfully submit debug logs to the cloud
window.setImmediate = window.nodeSetImmediate;

window.view = new Whisper.DebugLogView();
window.view.$el.appendTo($body);

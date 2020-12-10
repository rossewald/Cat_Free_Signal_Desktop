// Copyright 2018-2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

/* global $: false */

// Add version
$('.version').text(`v${window.getVersion()}`);

// Add debugging metadata - environment if not production, app instance name
const states = [];

if (window.getEnvironment() !== 'production') {
  states.push(window.getEnvironment());
}
if (window.getAppInstance()) {
  states.push(window.getAppInstance());
}

$('.environment').text(states.join(' - '));

// Install the 'dismiss with escape key' handler
$(document).on('keydown', e => {
  if (e.keyCode === 27) {
    window.closeAbout();
  }
});

// Localize the acknowledgment and privacy strings
$('.acknowledgments').text(window.i18n('softwareAcknowledgments'));
$('.privacy').text(window.i18n('privacyPolicy'));

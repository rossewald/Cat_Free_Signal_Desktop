// Copyright 2015-2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

/* global Whisper, i18n, getAccountManager, $, textsecure, QRCode */

/* eslint-disable more/no-then */

// eslint-disable-next-line func-names
(function() {
  window.Whisper = window.Whisper || {};

  const Steps = {
    INSTALL_SIGNAL: 2,
    SCAN_QR_CODE: 3,
    ENTER_NAME: 4,
    PROGRESS_BAR: 5,
    TOO_MANY_DEVICES: 'TooManyDevices',
    NETWORK_ERROR: 'NetworkError',
  };

  const DEVICE_NAME_SELECTOR = 'input.device-name';
  const CONNECTION_ERROR = -1;
  const TOO_MANY_DEVICES = 411;
  const TOO_OLD = 409;

  Whisper.InstallView = Whisper.View.extend({
    templateName: 'link-flow-template',
    className: 'main full-screen-flow',
    events: {
      'click .try-again': 'connect',
      'click .second': 'shutdown',
      'click .finish': 'finishLinking',
      // the actual next step happens in confirmNumber() on submit form #link-phone
    },
    initialize(options = {}) {
      window.readyForUpdates();

      this.didLink = false;
      this.selectStep(Steps.SCAN_QR_CODE);
      this.connect();
      this.on('disconnected', this.reconnect);

      // Keep data around if it's a re-link, or the middle of a light import
      this.shouldRetainData =
        window.Signal.Util.Registration.everDone() || options.hasExistingData;
    },
    render_attributes() {
      let errorMessage;
      let errorButton = i18n('installTryAgain');
      let errorSecondButton = null;

      if (this.error) {
        if (
          this.error.name === 'HTTPError' &&
          this.error.code === TOO_MANY_DEVICES
        ) {
          errorMessage = i18n('installTooManyDevices');
        } else if (
          this.error.name === 'HTTPError' &&
          this.error.code === TOO_OLD
        ) {
          errorMessage = i18n('installTooOld');
          errorButton = i18n('upgrade');
          errorSecondButton = i18n('quit');
        } else if (
          this.error.name === 'HTTPError' &&
          this.error.code === CONNECTION_ERROR
        ) {
          errorMessage = i18n('installConnectionFailed');
        } else if (this.error.message === 'websocket closed') {
          // AccountManager.registerSecondDevice uses this specific
          //   'websocket closed' error message
          errorMessage = i18n('installConnectionFailed');
        }

        return {
          isError: true,
          errorHeader: i18n('installErrorHeader'),
          errorMessage,
          errorButton,
          errorSecondButton,
        };
      }

      return {
        isStep3: this.step === Steps.SCAN_QR_CODE,
        linkYourPhone: i18n('linkYourPhone'),
        signalSettings: i18n('signalSettings'),
        linkedDevices: i18n('linkedDevices'),
        androidFinalStep: i18n('plusButton'),
        appleFinalStep: i18n('linkNewDevice'),

        isStep4: this.step === Steps.ENTER_NAME,
        chooseName: i18n('chooseDeviceName'),
        finishLinkingPhoneButton: i18n('finishLinkingPhone'),

        isStep5: this.step === Steps.PROGRESS_BAR,
        syncing: i18n('initialSync'),
      };
    },
    selectStep(step) {
      this.step = step;
      this.render();
    },
    shutdown() {
      window.shutdown();
    },
    connect() {
      if (
        this.error &&
        this.error.name === 'HTTPError' &&
        this.error.code === TOO_OLD
      ) {
        window.location = 'https://signal.org/download';
        return;
      }

      this.error = null;
      this.selectStep(Steps.SCAN_QR_CODE);
      this.clearQR();
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }

      const accountManager = getAccountManager();

      accountManager
        .registerSecondDevice(
          this.setProvisioningUrl.bind(this),
          this.confirmNumber.bind(this)
        )
        .catch(this.handleDisconnect.bind(this));
    },
    handleDisconnect(error) {
      window.log.error(
        'provisioning failed',
        error && error.stack ? error.stack : error
      );

      this.error = error;
      this.render();

      if (error.message === 'websocket closed') {
        this.trigger('disconnected');
      } else if (
        error.name !== 'HTTPError' ||
        (error.code !== CONNECTION_ERROR && error.code !== TOO_MANY_DEVICES)
      ) {
        throw error;
      }
    },
    reconnect() {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.timeout = setTimeout(this.connect.bind(this), 10000);
    },
    clearQR() {
      this.$('#qr img').remove();
      this.$('#qr canvas').remove();
      this.$('#qr .container').show();
      this.$('#qr').removeClass('ready');
    },
    setProvisioningUrl(url) {
      if ($('#qr').length === 0) {
        window.log.error('Did not find #qr element in the DOM!');
        return;
      }

      this.clearQR();
      this.$('#qr .container').hide();
      this.qr = new QRCode(this.$('#qr')[0]).makeCode(url);
      this.$('#qr').removeAttr('title');
      this.$('#qr').addClass('ready');
    },
    setDeviceNameDefault() {
      const deviceName = textsecure.storage.user.getDeviceName();

      this.$(DEVICE_NAME_SELECTOR).val(deviceName || window.getHostName());
      this.$(DEVICE_NAME_SELECTOR).focus();
    },
    finishLinking() {
      // We use a form so we get submit-on-enter behavior
      this.$('#link-phone').submit();
    },
    confirmNumber() {
      const tsp = textsecure.storage.protocol;

      window.removeSetupMenuItems();
      this.selectStep(Steps.ENTER_NAME);
      this.setDeviceNameDefault();

      return new Promise(resolve => {
        this.$('#link-phone').submit(e => {
          e.stopPropagation();
          e.preventDefault();

          let name = this.$(DEVICE_NAME_SELECTOR).val();
          name = name.replace(/\0/g, ''); // strip unicode null
          if (name.trim().length === 0) {
            this.$(DEVICE_NAME_SELECTOR).focus();
            return null;
          }

          this.selectStep(Steps.PROGRESS_BAR);

          const finish = () => {
            this.didLink = true;
            return resolve(name);
          };

          // Delete all data from database unless we're in the middle
          //   of a re-link, or we are finishing a light import. Without this,
          //   app restarts at certain times can cause weird things to happen,
          //   like data from a previous incomplete light import showing up
          //   after a new install.
          if (this.shouldRetainData) {
            return finish();
          }

          return tsp.removeAllData().then(finish, error => {
            window.log.error(
              'confirmNumber: error clearing database',
              error && error.stack ? error.stack : error
            );
            return finish();
          });
        });
      });
    },
  });
})();

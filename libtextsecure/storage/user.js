// Copyright 2015-2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

/* global textsecure, window */

// eslint-disable-next-line func-names
(function() {
  /** *******************************************
   *** Utilities to store data about the user ***
   ********************************************* */
  window.textsecure = window.textsecure || {};
  window.textsecure.storage = window.textsecure.storage || {};

  window.textsecure.storage.user = {
    setNumberAndDeviceId(number, deviceId, deviceName) {
      textsecure.storage.put('number_id', `${number}.${deviceId}`);
      if (deviceName) {
        textsecure.storage.put('device_name', deviceName);
      }
    },

    setUuidAndDeviceId(uuid, deviceId) {
      textsecure.storage.put('uuid_id', `${uuid}.${deviceId}`);
    },

    getNumber() {
      const numberId = textsecure.storage.get('number_id');
      if (numberId === undefined) return undefined;
      return textsecure.utils.unencodeNumber(numberId)[0];
    },

    getUuid() {
      const uuid = textsecure.storage.get('uuid_id');
      if (uuid === undefined) return undefined;
      return textsecure.utils.unencodeNumber(uuid)[0];
    },

    getDeviceId() {
      return this._getDeviceIdFromUuid() || this._getDeviceIdFromNumber();
    },

    _getDeviceIdFromUuid() {
      const uuid = textsecure.storage.get('uuid_id');
      if (uuid === undefined) return undefined;
      return textsecure.utils.unencodeNumber(uuid)[1];
    },

    _getDeviceIdFromNumber() {
      const numberId = textsecure.storage.get('number_id');
      if (numberId === undefined) return undefined;
      return textsecure.utils.unencodeNumber(numberId)[1];
    },

    getDeviceName() {
      return textsecure.storage.get('device_name');
    },

    setDeviceNameEncrypted() {
      return textsecure.storage.put('deviceNameEncrypted', true);
    },

    getDeviceNameEncrypted() {
      return textsecure.storage.get('deviceNameEncrypted');
    },

    getSignalingKey() {
      return textsecure.storage.get('signaling_key');
    },
  };
})();

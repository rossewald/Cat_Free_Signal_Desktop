// Copyright 2019-2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

const { assert } = require('chai');

const {
  findLinks,
  isLinkSafeToPreview,
  isLinkSneaky,
} = require('../../js/modules/link_previews');

describe('Link previews', () => {
  describe('#isLinkSafeToPreview', () => {
    it('returns false for invalid URLs', () => {
      assert.isFalse(isLinkSafeToPreview(''));
      assert.isFalse(isLinkSafeToPreview('https'));
      assert.isFalse(isLinkSafeToPreview('https://'));
      assert.isFalse(isLinkSafeToPreview('https://bad url'));
      assert.isFalse(isLinkSafeToPreview('example.com'));
    });

    it('returns false for non-HTTPS URLs', () => {
      assert.isFalse(isLinkSafeToPreview('http://example.com'));
      assert.isFalse(isLinkSafeToPreview('ftp://example.com'));
      assert.isFalse(isLinkSafeToPreview('file://example'));
    });

    it('returns false if the link is "sneaky"', () => {
      // See `isLinkSneaky` tests below for more thorough checking.
      assert.isFalse(isLinkSafeToPreview('https://user:pass@example.com'));
      assert.isFalse(isLinkSafeToPreview('https://aquí.example'));
      assert.isFalse(isLinkSafeToPreview('https://aqu%C3%AD.example'));
    });

    it('returns true for "safe" urls', () => {
      assert.isTrue(isLinkSafeToPreview('https://example.com'));
      assert.isTrue(
        isLinkSafeToPreview('https://example.com/foo/bar?query=string#hash')
      );
    });
  });

  describe('#findLinks', () => {
    it('returns all links if no caretLocation is provided', () => {
      const text =
        'Check out this link: https://github.com/signalapp/Signal-Desktop\nAnd this one too: https://github.com/signalapp/Signal-Android';

      const expected = [
        'https://github.com/signalapp/Signal-Desktop',
        'https://github.com/signalapp/Signal-Android',
      ];

      const actual = findLinks(text);
      assert.deepEqual(expected, actual);
    });

    it('includes all links if cursor is not in a link', () => {
      const text =
        'Check out this link: https://github.com/signalapp/Signal-Desktop\nAnd this one too: https://github.com/signalapp/Signal-Android';
      const caretLocation = 10;

      const expected = [
        'https://github.com/signalapp/Signal-Desktop',
        'https://github.com/signalapp/Signal-Android',
      ];

      const actual = findLinks(text, caretLocation);
      assert.deepEqual(expected, actual);
    });

    it('excludes a link not at the end if the caret is inside of it', () => {
      const text =
        'Check out this link: https://github.com/signalapp/Signal-Desktop\nAnd this one too: https://github.com/signalapp/Signal-Android';
      const caretLocation = 30;

      const expected = ['https://github.com/signalapp/Signal-Android'];

      const actual = findLinks(text, caretLocation);
      assert.deepEqual(expected, actual);
    });

    it('excludes a link not at the end if the caret is at its end', () => {
      const text =
        'Check out this link: https://github.com/signalapp/Signal-Desktop\nAnd this one too: https://github.com/signalapp/Signal-Android';
      const caretLocation = 64;

      const expected = ['https://github.com/signalapp/Signal-Android'];

      const actual = findLinks(text, caretLocation);
      assert.deepEqual(expected, actual);
    });

    it('excludes a link at the end of the caret is inside of it', () => {
      const text =
        'Check out this link: https://github.com/signalapp/Signal-Desktop\nAnd this one too: https://github.com/signalapp/Signal-Android';
      const caretLocation = 100;

      const expected = ['https://github.com/signalapp/Signal-Desktop'];

      const actual = findLinks(text, caretLocation);
      assert.deepEqual(expected, actual);
    });

    it('includes link at the end if cursor is at its end', () => {
      const text =
        'Check out this link: https://github.com/signalapp/Signal-Desktop\nAnd this one too: https://github.com/signalapp/Signal-Android';
      const caretLocation = text.length;

      const expected = [
        'https://github.com/signalapp/Signal-Desktop',
        'https://github.com/signalapp/Signal-Android',
      ];

      const actual = findLinks(text, caretLocation);
      assert.deepEqual(expected, actual);
    });
  });

  describe('#isLinkSneaky', () => {
    it('returns true for =', () => {
      const link = 'r.id=s.id';
      assert.strictEqual(isLinkSneaky(link), true);
    });

    it('returns true for $', () => {
      const link = 'r.id$s.id';
      assert.strictEqual(isLinkSneaky(link), true);
    });

    it('returns true for +', () => {
      const link = 'r.id+s.id';
      assert.strictEqual(isLinkSneaky(link), true);
    });

    it('returns true for ^', () => {
      const link = 'r.id^s.id';
      assert.strictEqual(isLinkSneaky(link), true);
    });

    it('returns true for URLs with a length of 4097 or higher', () => {
      const href = `https://example.com/${'a'.repeat(4077)}`;
      assert.lengthOf(href, 4097, 'Test href is not the proper length');

      assert.isTrue(isLinkSneaky(href));
      assert.isTrue(isLinkSneaky(`${href}?foo=bar`));
    });

    describe('auth', () => {
      it('returns true for hrefs with auth (or pretend auth)', () => {
        assert.isTrue(isLinkSneaky('https://user:pass@example.com'));
        assert.isTrue(
          isLinkSneaky('http://whatever.com&login=someuser@77777777')
        );
      });
    });

    describe('domain', () => {
      it('returns false for all-latin domain', () => {
        const link = 'https://www.amazon.com';
        const actual = isLinkSneaky(link);
        assert.strictEqual(actual, false);
      });

      it('returns false for IPv4 addresses', () => {
        assert.isFalse(isLinkSneaky('https://127.0.0.1/path'));
      });

      // It's possible that this should return `false` but we'd need to add special logic
      //   for it.
      it('returns true for IPv6 addresses', () => {
        assert.isTrue(
          isLinkSneaky('https://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]/path')
        );
        assert.isTrue(isLinkSneaky('https://[::]/path'));
      });

      it('returns true for Latin + Cyrillic domain', () => {
        const link = 'https://www.aмazon.com';
        const actual = isLinkSneaky(link);
        assert.strictEqual(actual, true);
      });

      it('returns true for Latin + Greek domain', () => {
        const link = 'https://www.αpple.com';
        const actual = isLinkSneaky(link);
        assert.strictEqual(actual, true);
      });

      it('returns true for ASCII and non-ASCII mix', () => {
        const link = 'https://www.аррӏе.com';
        const actual = isLinkSneaky(link);
        assert.strictEqual(actual, true);
      });

      it('returns true for Latin + High Greek domain', () => {
        const link = `https://www.apple${String.fromCodePoint(0x101a0)}.com`;
        const actual = isLinkSneaky(link);
        assert.strictEqual(actual, true);
      });

      it("returns true if the domain doesn't contain a .", () => {
        assert.isTrue(isLinkSneaky('https://example'));
        assert.isTrue(isLinkSneaky('https://localhost'));
        assert.isTrue(isLinkSneaky('https://localhost:3000'));
      });

      it('returns true if the domain has any empty labels', () => {
        assert.isTrue(isLinkSneaky('https://example.'));
        assert.isTrue(isLinkSneaky('https://example.com.'));
        assert.isTrue(isLinkSneaky('https://.example.com'));
        assert.isTrue(isLinkSneaky('https://..example.com'));
      });

      it('returns true if the domain is longer than 2048 UTF-16 code points', () => {
        const domain = `${'a'.repeat(2041)}.example`;
        assert.lengthOf(domain, 2049, 'Test domain is the incorrect length');
        const link = `https://${domain}/foo/bar`;
        assert.isTrue(isLinkSneaky(link));
      });
    });

    describe('pathname', () => {
      it('returns false for no pathname', () => {
        assert.isFalse(isLinkSneaky('https://example.com'));
        assert.isFalse(isLinkSneaky('https://example.com/'));
      });

      it('returns false if the pathname contains valid characters', () => {
        assert.isFalse(isLinkSneaky('https://example.com/foo'));
        assert.isFalse(isLinkSneaky('https://example.com/foo/bar'));
        assert.isFalse(
          isLinkSneaky("https://example.com/:/[]@!$&'()*+,;=abc123-._~%")
        );
        assert.isFalse(
          isLinkSneaky(
            'https://lbry.tv/@ScammerRevolts:b0/DELETING-EVERY-FILE-OFF-A-SCAMMERS-LAPTOP-Destroyed:1'
          )
        );
      });

      it('returns true if the pathname contains invalid characters', () => {
        assert.isTrue(isLinkSneaky('https://example.com/hello world'));
        assert.isTrue(isLinkSneaky('https://example.com/aquí-está'));
        assert.isTrue(isLinkSneaky('https://example.com/hello\x00world'));
        assert.isTrue(isLinkSneaky('https://example.com/hello\nworld'));
        assert.isTrue(isLinkSneaky('https://example.com/hello😈world'));
      });
    });

    describe('query string', () => {
      it('returns false for no query', () => {
        assert.isFalse(isLinkSneaky('https://example.com/foo'));
        assert.isFalse(isLinkSneaky('https://example.com/foo?'));
      });

      it('returns false if the query string contains valid characters', () => {
        assert.isFalse(isLinkSneaky('https://example.com/foo?bar'));
        assert.isFalse(isLinkSneaky('https://example.com/foo?bar=baz'));
        assert.isFalse(
          isLinkSneaky(
            "https://example.com/foo?bar=:/[]@!$&'()*+,;=abc123-._~%"
          )
        );
        assert.isFalse(
          isLinkSneaky(
            "https://example.com/foo?:/[]@!$&'()*+,;=abc123-._~%=baz"
          )
        );
      });

      it('returns true if the query string contains invalid characters', () => {
        assert.isTrue(isLinkSneaky('https://example.com/foo?bar baz'));
        assert.isTrue(isLinkSneaky('https://example.com/foo?bar baz=qux'));
        assert.isTrue(isLinkSneaky('https://example.com/foo?bar=baz qux'));
        assert.isTrue(isLinkSneaky('https://example.com/foo?aquí=está'));
        assert.isTrue(isLinkSneaky('https://example.com/foo?hello=\x00world'));
        assert.isTrue(
          isLinkSneaky('https://example.com/foo?hello=hello\nworld')
        );
        assert.isTrue(isLinkSneaky('https://example.com/foo?hello=😈world'));
      });
    });

    describe('hash', () => {
      it('returns false for no hash', () => {
        assert.isFalse(isLinkSneaky('https://example.com/foo'));
        assert.isFalse(isLinkSneaky('https://example.com/foo#'));
      });

      it('returns false if the hash contains valid characters', () => {
        assert.isFalse(isLinkSneaky('https://example.com/foo#bar'));
        assert.isFalse(
          isLinkSneaky("https://example.com/foo#:/[]@!$&'()*+,;=abc123-._~%")
        );
      });

      it('returns true if the hash contains invalid characters', () => {
        assert.isTrue(isLinkSneaky('https://example.com/foo#bar baz'));
        assert.isTrue(isLinkSneaky('https://example.com/foo#bar baz=qux'));
        assert.isTrue(isLinkSneaky('https://example.com/foo#bar=baz qux'));
        assert.isTrue(isLinkSneaky('https://example.com/foo#aquí_está'));
        assert.isTrue(isLinkSneaky('https://example.com/foo#hello\x00world'));
        assert.isTrue(isLinkSneaky('https://example.com/foo#hello\nworld'));
        assert.isTrue(isLinkSneaky('https://example.com/foo#hello😈world'));
      });
    });
  });
});

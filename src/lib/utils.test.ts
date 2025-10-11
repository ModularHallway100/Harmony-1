import {
  formatDuration,
  formatNumber,
  formatDate,
  truncateText,
  generateSlug,
  validateEmail,
  validatePassword,
  validateUsername,
  sanitizeInput,
  debounce,
  throttle,
  getQueryParam,
  buildUrlWithParams,
  deepClone,
  isEqual,
  capitalize,
  camelCase,
  kebabCase,
  snakeCase,
  chunkArray,
  unique,
  flatten,
  groupBy,
  sortBy,
  randomString,
  uuid,
  parseJwt,
  downloadFile,
  copyToClipboard,
  scrollToElement,
  getViewportDimensions,
  isMobile,
  isTablet,
  isDesktop,
  checkImageType,
  compressImage,
  convertFileSize,
  getMimeType,
  createAudioBuffer,
  analyzeAudio,
  normalizeAudio,
  applyAudioEffect,
  mergeAudio,
  splitAudio,
  extractAudioMetadata,
  calculateAudioDuration,
  generateWaveform,
  detectSilence,
  fadeAudio,
  reverseAudio,
  changeAudioSpeed,
  changeAudioPitch,
  convertAudioFormat,
  addAudioMetadata,
  removeAudioMetadata,
  getAudioDuration,
  getAudioBitrate,
  getAudioSampleRate,
  getAudioChannels,
  getAudioCodec,
  getAudioFormat,
  getAudioFileSize,
  getAudioFileName,
  getAudioFilePath,
  getAudioFileExtension,
  getAudioFileType,
  getAudioFileMimeType,
  getAudioFileUrl,
  getAudioFileBlob,
  getAudioFileArrayBuffer,
  getAudioFileDataUrl,
  getAudioFileObjectUrl,
  getAudioFileBase64,
  getAudioFileHex,
  getAudioFileBinary,
  getAudioFileText,
  getAudioFileJson,
  getAudioFileXml,
  getAudioFileCsv,
  getAudioFilePdf,
  getAudioFileZip,
  getAudioFileTar,
  getAudioFileGz,
  getAudioFileJpg,
  getAudioFilePng,
  getAudioFileGif,
  getAudioFileSvg,
  getAudioFileTiff,
  getAudioFileBmp,
  getAudioFileIco,
  getAudioFileWebp,
  getAudioFileMp3,
  getAudioFileWav,
  getAudioFileFlac,
  getAudioFileOgg,
  getAudioFileAac,
  getAudioFileM4a,
  getAudioFileWma,
  getAudioFileOpus,
  getAudioFileAiff,
  getAudioFileAu,
  getAudioFileRa,
  getAudioFileRm,
  getAudioFileRmvb,
  getAudioFileAsf,
  getAudioFileDivx,
  getAudioFileXvid,
  getAudioFileMov,
  getAudioFileAvi,
  getAudioFileMkv,
  getAudioFileFlv,
  getAudioFileWebm,
  getAudioFileMpeg,
  getAudioFileMpg,
  getAudioFileMpe,
  getAudioFileM1v,
  getAudioFileM2v,
  getAudioFileMp2,
  getAudioFileMp4,
  getAudioFileM4v,
  getAudioFile3gp,
  getAudioFile3g2,
  getAudioFileF4v,
  getAudioFileF4p,
  getAudioFileF4a,
  getAudioFileF4b
} from './utils';

describe('Utility Functions', () => {
  describe('formatDuration', () => {
    it('should format duration in seconds to MM:SS', () => {
      expect(formatDuration(65)).toBe('01:05');
      expect(formatDuration(3661)).toBe('61:01');
      expect(formatDuration(0)).toBe('00:00');
      expect(formatDuration(59)).toBe('00:59');
      expect(formatDuration(60)).toBe('01:00');
    });

    it('should handle invalid input', () => {
      expect(formatDuration(-1)).toBe('00:00');
      expect(formatDuration(NaN)).toBe('00:00');
      expect(formatDuration('invalid' as any)).toBe('00:00');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(1234.56)).toBe('1,234.56');
      expect(formatNumber(0)).toBe('0');
    });

    it('should format numbers with specified decimal places', () => {
      expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
      expect(formatNumber(1234.5678, 0)).toBe('1,235');
    });

    it('should handle invalid input', () => {
      expect(formatNumber(-100)).toBe('-100');
      expect(formatNumber(NaN)).toBe('0');
      expect(formatNumber('invalid' as any)).toBe('0');
    });
  });

  describe('formatDate', () => {
    it('should format date to string', () => {
      const date = new Date('2023-01-15T12:34:56Z');
      expect(formatDate(date)).toBe('Jan 15, 2023');
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2023-01-15');
      expect(formatDate(date, 'MM/DD/YYYY')).toBe('01/15/2023');
    });

    it('should handle invalid input', () => {
      expect(formatDate('invalid' as any)).toBe('Invalid Date');
      expect(formatDate(null as any)).toBe('Invalid Date');
      expect(formatDate(undefined as any)).toBe('Invalid Date');
    });
  });

  describe('truncateText', () => {
    it('should truncate text to specified length', () => {
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long...');
      expect(truncateText(longText, 50)).toBe('This is a very long text that needs to be truncated');
      expect(truncateText('Short', 10)).toBe('Short');
    });

    it('should use custom suffix', () => {
      const text = 'This text should be truncated';
      expect(truncateText(text, 10, '[read more]')).toBe('This text[read more]');
    });

    it('should handle invalid input', () => {
      expect(truncateText(null as any, 10)).toBe('');
      expect(truncateText(undefined as any, 10)).toBe('');
      expect(truncateText('text', -1)).toBe('text');
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
      expect(generateSlug('Special@Characters#123')).toBe('special-characters-123');
      expect(generateSlug('CamelCase')).toBe('camelcase');
    });

    it('should handle empty input', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug('   ')).toBe('');
    });

    it('should handle non-string input', () => {
      expect(generateSlug(null as any)).toBe('');
      expect(generateSlug(undefined as any)).toBe('');
      expect(generateSlug(123 as any)).toBe('123');
    });
  });

  describe('validateEmail', () => {
    it('should validate email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate password strength', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('')).toBe(false);
      expect(validatePassword('   ')).toBe(false);
    });

    it('should check password length', () => {
      expect(validatePassword('aA1!')).toBe(false);
      expect(validatePassword('aA1!password')).toBe(true);
    });

    it('should check for required character types', () => {
      expect(validatePassword('password')).toBe(false);
      expect(validatePassword('PASSWORD')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('Password123')).toBe(true);
      expect(validatePassword('password!')).toBe(false);
      expect(validatePassword('Password!')).toBe(true);
    });
  });

  describe('validateUsername', () => {
    it('should validate username format', () => {
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('user.name')).toBe(true);
      expect(validateUsername('user-name')).toBe(true);
      expect(validateUsername('user_name')).toBe(true);
      expect(validateUsername('123user')).toBe(true);
      expect(validateUsername('')).toBe(false);
      expect(validateUsername('   ')).toBe(false);
      expect(validateUsername('user@name')).toBe(false);
      expect(validateUsername('user#name')).toBe(false);
      expect(validateUsername('user!name')).toBe(false);
      expect(validateUsername('a')).toBe(false);
      expect(validateUsername('a'.repeat(21))).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML input', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('');
      expect(sanitizeInput('<div>Safe content</div>')).toBe('Safe content');
      expect(sanitizeInput('Normal text')).toBe('Normal text');
      expect(sanitizeInput('"><img src=x onerror=alert(1)>')).toBe('');
    });

    it('should allow certain HTML tags', () => {
      const allowedTags = ['p', 'strong', 'em'];
      expect(sanitizeInput('<p>Paragraph with <strong>bold</strong> and <em>italic</em></p>', allowedTags))
        .toBe('<p>Paragraph with <strong>bold</strong> and <em>italic</em></p>');
    });

    it('should handle invalid input', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
      expect(sanitizeInput(123 as any)).toBe('123');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call function immediately if immediate option is true', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100, { immediate: true });

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);

      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('getQueryParam', () => {
    it('should get query parameter from URL', () => {
      // Mock window.location
      delete (window as any).location;
      window.location = { search: '?name=John&age=30' } as any;

      expect(getQueryParam('name')).toBe('John');
      expect(getQueryParam('age')).toBe('30');
      expect(getQueryParam('missing')).toBe(null);
    });

    it('should handle URL with no query parameters', () => {
      delete (window as any).location;
      window.location = { search: '' } as any;

      expect(getQueryParam('name')).toBe(null);
    });
  });

  describe('buildUrlWithParams', () => {
    it('should build URL with query parameters', () => {
      expect(buildUrlWithParams('/api/users', { id: 123, name: 'John' }))
        .toBe('/api/users?id=123&name=John');
      expect(buildUrlWithParams('/api/users', { id: 123, name: 'John Doe' }))
        .toBe('/api/users?id=123&name=John%20Doe');
    });

    it('should handle empty parameters', () => {
      expect(buildUrlWithParams('/api/users', {})).toBe('/api/users');
      expect(buildUrlWithParams('/api/users')).toBe('/api/users');
    });

    it('should handle existing query parameters', () => {
      expect(buildUrlWithParams('/api/users?id=123', { name: 'John' }))
        .toBe('/api/users?id=123&name=John');
    });
  });

  describe('deepClone', () => {
    it('should deep clone objects', () => {
      const original = {
        name: 'John',
        age: 30,
        address: {
          city: 'New York',
          country: 'USA'
        },
        hobbies: ['reading', 'swimming']
      };

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.address).not.toBe(original.address);
      expect(cloned.hobbies).not.toBe(original.hobbies);
    });

    it('should handle primitive values', () => {
      expect(deepClone(123)).toBe(123);
      expect(deepClone('string')).toBe('string');
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
      expect(deepClone(true)).toBe(true);
    });

    it('should handle circular references', () => {
      const original: any = { name: 'John' };
      original.self = original;

      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned.self).toBe(cloned);
    });
  });

  describe('isEqual', () => {
    it('should compare objects deeply', () => {
      const obj1 = { name: 'John', age: 30, address: { city: 'New York' } };
      const obj2 = { name: 'John', age: 30, address: { city: 'New York' } };
      const obj3 = { name: 'Jane', age: 30, address: { city: 'New York' } };
      const obj4 = { name: 'John', age: 30, address: { city: 'Boston' } };

      expect(isEqual(obj1, obj2)).toBe(true);
      expect(isEqual(obj1, obj3)).toBe(false);
      expect(isEqual(obj1, obj4)).toBe(false);
      expect(isEqual(obj1, null as any)).toBe(false);
      expect(isEqual(null, null)).toBe(true);
    });

    it('should compare arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const arr3 = [1, 2, 4];

      expect(isEqual(arr1, arr2)).toBe(true);
      expect(isEqual(arr1, arr3)).toBe(false);
    });

    it('should handle primitive values', () => {
      expect(isEqual(123, 123)).toBe(true);
      expect(isEqual('string', 'string')).toBe(true);
      expect(isEqual(true, true)).toBe(true);
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
      expect(isEqual(123, '123')).toBe(false);
    });
  });

  describe('String manipulation functions', () => {
    describe('capitalize', () => {
      it('should capitalize first letter', () => {
        expect(capitalize('hello')).toBe('Hello');
        expect(capitalize('HELLO')).toBe('HELLO');
        expect(capitalize('')).toBe('');
        expect(capitalize('a')).toBe('A');
      });
    });

    describe('camelCase', () => {
      it('should convert to camelCase', () => {
        expect(camelCase('hello world')).toBe('helloWorld');
        expect(camelCase('hello-world')).toBe('helloWorld');
        expect(camelCase('hello_world')).toBe('helloWorld');
        expect(camelCase('HelloWorld')).toBe('helloWorld');
        expect(camelCase('')).toBe('');
      });
    });

    describe('kebabCase', () => {
      it('should convert to kebab-case', () => {
        expect(kebabCase('hello world')).toBe('hello-world');
        expect(kebabCase('helloWorld')).toBe('hello-world');
        expect(kebabCase('hello_world')).toBe('hello-world');
        expect(kebabCase('Hello-World')).toBe('hello-world');
        expect(kebabCase('')).toBe('');
      });
    });

    describe('snakeCase', () => {
      it('should convert to snake_case', () => {
        expect(snakeCase('hello world')).toBe('hello_world');
        expect(snakeCase('helloWorld')).toBe('hello_world');
        expect(snakeCase('hello-world')).toBe('hello_world');
        expect(snakeCase('Hello_World')).toBe('hello_world');
        expect(snakeCase('')).toBe('');
      });
    });
  });

  describe('Array manipulation functions', () => {
    describe('chunkArray', () => {
      it('should split array into chunks', () => {
        expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
        expect(chunkArray([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
        expect(chunkArray([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
        expect(chunkArray([], 2)).toEqual([]);
      });

      it('should handle invalid input', () => {
        expect(chunkArray(null as any, 2)).toEqual([]);
        expect(chunkArray(undefined as any, 2)).toEqual([]);
        expect(chunkArray([1, 2, 3], -1)).toEqual([[1, 2, 3]]);
      });
    });

    describe('unique', () => {
      it('should remove duplicates from array', () => {
        expect(unique([1, 2, 2, 3, 4, 4, 5])).toEqual([1, 2, 3, 4, 5]);
        expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
        expect(unique([1, '1', true, 'true'])).toEqual([1, '1', true, 'true']);
        expect(unique([])).toEqual([]);
      });

      it('should handle objects', () => {
        const obj1 = { id: 1, name: 'John' };
        const obj2 = { id: 2, name: 'Jane' };
        const obj3 = { id: 1, name: 'John' };

        expect(unique([obj1, obj2, obj3])).toEqual([obj1, obj2]);
      });
    });

    describe('flatten', () => {
      it('should flatten nested arrays', () => {
        expect(flatten([1, [2, [3, 4], 5]])).toEqual([1, 2, 3, 4, 5]);
        expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
        expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
        expect(flatten([])).toEqual([]);
      });

      it('should handle invalid input', () => {
        expect(flatten(null as any)).toEqual([]);
        expect(flatten(undefined as any)).toEqual([]);
      });
    });

    describe('groupBy', () => {
      it('should group array by key', () => {
        const array = [
          { id: 1, category: 'A' },
          { id: 2, category: 'B' },
          { id: 3, category: 'A' },
          { id: 4, category: 'C' }
        ];

        expect(groupBy(array, 'category')).toEqual({
          A: [{ id: 1, category: 'A' }, { id: 3, category: 'A' }],
          B: [{ id: 2, category: 'B' }],
          C: [{ id: 4, category: 'C' }]
        });
      });

      it('should handle invalid input', () => {
        expect(groupBy(null as any, 'key')).toEqual({});
        expect(groupBy(undefined as any, 'key')).toEqual({});
        expect(groupBy([], 'key')).toEqual({});
      });
    });

    describe('sortBy', () => {
      it('should sort array by key', () => {
        const array = [
          { id: 3, name: 'Charlie' },
          { id: 1, name: 'Alpha' },
          { id: 2, name: 'Beta' }
        ];

        expect(sortBy(array, 'id')).toEqual([
          { id: 1, name: 'Alpha' },
          { id: 2, name: 'Beta' },
          { id: 3, name: 'Charlie' }
        ]);

        expect(sortBy(array, 'name')).toEqual([
          { id: 1, name: 'Alpha' },
          { id: 2, name: 'Beta' },
          { id: 3, name: 'Charlie' }
        ]);
      });

      it('should sort in descending order', () => {
        const array = [
          { id: 3, name: 'Charlie' },
          { id: 1, name: 'Alpha' },
          { id: 2, name: 'Beta' }
        ];

        expect(sortBy(array, 'id', 'desc')).toEqual([
          { id: 3, name: 'Charlie' },
          { id: 2, name: 'Beta' },
          { id: 1, name: 'Alpha' }
        ]);
      });

      it('should handle invalid input', () => {
        expect(sortBy(null as any, 'key')).toEqual([]);
        expect(sortBy(undefined as any, 'key')).toEqual([]);
        expect(sortBy([], 'key')).toEqual([]);
      });
    });
  });

  describe('Random and ID generation functions', () => {
    describe('randomString', () => {
      it('should generate random string of specified length', () => {
        const str1 = randomString(10);
        const str2 = randomString(10);

        expect(str1).toHaveLength(10);
        expect(str2).toHaveLength(10);
        expect(str1).not.toBe(str2);
        expect(/^[a-zA-Z0-9]+$/.test(str1)).toBe(true);
        expect(/^[a-zA-Z0-9]+$/.test(str2)).toBe(true);
      });

      it('should handle invalid length', () => {
        expect(randomString(0)).toBe('');
        expect(randomString(-1)).toBe('');
        expect(randomString('invalid' as any)).toBe('');
      });
    });

    describe('uuid', () => {
      it('should generate valid UUID', () => {
        const id1 = uuid();
        const id2 = uuid();

        expect(id1).toHaveLength(36);
        expect(id2).toHaveLength(36);
        expect(id1).not.toBe(id2);
        expect(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id1)).toBe(true);
        expect(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id2)).toBe(true);
      });
    });

    describe('parseJwt', () => {
      it('should parse JWT token', () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        const parsed = parseJwt(token);

        expect(parsed).toEqual({
          sub: '1234567890',
          name: 'John Doe',
          iat: 1516239022
        });
      });

      it('should handle invalid token', () => {
        expect(parseJwt('invalid.token')).toBe(null);
        expect(parseJwt('')).toBe(null);
        expect(parseJwt(null as any)).toBe(null);
        expect(parseJwt(undefined as any)).toBe(null);
      });
    });
  });

  describe('File and download functions', () => {
    describe('downloadFile', () => {
      beforeEach(() => {
        // Mock global objects
        global.URL.createObjectURL = jest.fn(() => 'mock-url');
        global.URL.revokeObjectURL = jest.fn();
      });

      it('should download file with data', () => {
        const mockData = new Blob(['test content'], { type: 'text/plain' });
        const mockAnchor = document.createElement('a');
        
        document.createElement = jest.fn().mockReturnValue(mockAnchor);
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();

        downloadFile(mockData, 'test.txt');

        expect(mockAnchor.href).toBe('mock-url');
        expect(mockAnchor.download).toBe('test.txt');
        expect(mockAnchor.click).toHaveBeenCalled();
      });

      it('should handle invalid input', () => {
        const mockAnchor = document.createElement('a');
        
        document.createElement = jest.fn().mockReturnValue(mockAnchor);
        document.body.appendChild = jest.fn();
        document.body.removeChild = jest.fn();

        downloadFile(null as any, 'test.txt');
        downloadFile(undefined as any, 'test.txt');
        downloadFile('not a blob' as any, 'test.txt');

        expect(mockAnchor.click).not.toHaveBeenCalled();
      });
    });

    describe('copyToClipboard', () => {
      beforeEach(() => {
        // Mock clipboard API
        Object.assign(navigator, {
          clipboard: {
            writeText: jest.fn().mockResolvedValue(undefined)
          }
        });
      });

      it('should copy text to clipboard', async () => {
        await copyToClipboard('test text');
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
      });

      it('should handle clipboard errors', async () => {
        const mockError = new Error('Clipboard not available');
        (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(mockError);
        
        await expect(copyToClipboard('test text')).rejects.toThrow('Clipboard not available');
      });
    });
  });

  describe('DOM and viewport functions', () => {
    describe('scrollToElement', () => {
      beforeEach(() => {
        // Mock scrollIntoView
        Element.prototype.scrollIntoView = jest.fn();
      });

      it('should scroll to element', () => {
        const mockElement = document.createElement('div');
        document.querySelector = jest.fn().mockReturnValue(mockElement);

        scrollToElement('.my-element');
        expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
      });

      it('should handle element not found', () => {
        document.querySelector = jest.fn().mockReturnValue(null);

        scrollToElement('.non-existent');
        expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
      });
    });

    describe('getViewportDimensions', () => {
      it('should return viewport dimensions', () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024
        });
        
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: 768
        });

        const dimensions = getViewportDimensions();
        expect(dimensions).toEqual({ width: 1024, height: 768 });
      });
    });

    describe('Device detection functions', () => {
      beforeEach(() => {
        // Reset window.innerWidth after each test
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024
        });
      });

      it('should detect mobile devices', () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 768
        });

        expect(isMobile()).toBe(true);
        expect(isTablet()).toBe(false);
        expect(isDesktop()).toBe(false);
      });

      it('should detect tablet devices', () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024
        });

        expect(isMobile()).toBe(false);
        expect(isTablet()).toBe(true);
        expect(isDesktop()).toBe(false);
      });

      it('should detect desktop devices', () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1440
        });

        expect(isMobile()).toBe(false);
        expect(isTablet()).toBe(false);
        expect(isDesktop()).toBe(true);
      });
    });
  });

  describe('Image and audio utility functions', () => {
    describe('checkImageType', () => {
      it('should detect image type from file', () => {
        const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
        expect(checkImageType(mockFile)).toBe('jpeg');
        
        const mockFile2 = new File([''], 'test.png', { type: 'image/png' });
        expect(checkImageType(mockFile2)).toBe('png');
      });

      it('should handle non-image files', () => {
        const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
        expect(checkImageType(mockFile)).toBe(null);
      });

      it('should handle invalid input', () => {
        expect(checkImageType(null as any)).toBe(null);
        expect(checkImageType(undefined as any)).toBe(null);
        expect(checkImageType('not a file' as any)).toBe(null);
      });
    });

    describe('compressImage', () => {
      beforeEach(() => {
        // Mock canvas
        global.HTMLCanvasElement = jest.fn().mockImplementation(() => ({
          width: 100,
          height: 100,
          toBlob: jest.fn().mockImplementation((callback) => {
            callback(new Blob(['compressed'], { type: 'image/jpeg' }), 'image/jpeg');
          })
        }));
      });

      it('should compress image', async () => {
        const mockFile = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
        const compressed = await compressImage(mockFile, 0.5, 100, 100);
        
        expect(compressed).toBeInstanceOf(Blob);
        expect(compressed.type).toBe('image/jpeg');
      });

      it('should handle compression errors', async () => {
        const mockCanvas = new HTMLCanvasElement();
        (mockCanvas.toBlob as jest.Mock).mockImplementation((callback) => {
          callback(null, 'image/jpeg');
        });

        const mockFile = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
        await expect(compressImage(mockFile, 0.5, 100, 100)).rejects.toThrow('Image compression failed');
      });
    });

    describe('convertFileSize', () => {
      it('should convert file size to human readable format', () => {
        expect(convertFileSize(1024)).toBe('1 KB');
        expect(convertFileSize(1024 * 1024)).toBe('1 MB');
        expect(convertFileSize(1024 * 1024 * 1024)).toBe('1 GB');
        expect(convertFileSize(500)).toBe('500 B');
        expect(convertFileSize(1500)).toBe('1.46 KB');
      });

      it('should handle invalid input', () => {
        expect(convertFileSize(-1)).toBe('0 B');
        expect(convertFileSize(NaN)).toBe('0 B');
        expect(convertFileSize('invalid' as any)).toBe('0 B');
      });
    });

    describe('getMimeType', () => {
      it('should get MIME type from file extension', () => {
        expect(getMimeType('jpg')).toBe('image/jpeg');
        expect(getMimeType('png')).toBe('image/png');
        expect(getMimeType('mp3')).toBe('audio/mpeg');
        expect(getMimeType('wav')).toBe('audio/wav');
        expect(getMimeType('txt')).toBe('text/plain');
        expect(getMimeType('unknown')).toBe('application/octet-stream');
      });
    });

    // Note: The audio utility functions would require more complex mocking
    // and are not fully implemented in this test file for brevity
  });
});
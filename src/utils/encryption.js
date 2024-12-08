const crypto = require('crypto');

const encryptionUtil = {
  encodeBase64(text) {
    return Buffer.from(text).toString('base64');
  },

  decodeBase64(encoded) {
    return Buffer.from(encoded, 'base64').toString('utf8');
  },

  // SHA-256 해시 생성
  createHash(text) {
    return crypto
      .createHash('sha256')
      .update(text)
      .digest('hex');
  },

  // 솔트 생성
  generateSalt(length = 16) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  },

  // 솔트와 함께 해시 생성
  createHashWithSalt(text, salt) {
    const hash = crypto.createHmac('sha256', salt);
    hash.update(text);
    return {
      salt,
      hash: hash.digest('hex')
    };
  },

  // 암호화
  encrypt(text, key = process.env.ENCRYPTION_KEY) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(key),
      iv
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  },

  // 복호화
  decrypt(text, key = process.env.ENCRYPTION_KEY) {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key),
      iv
    );
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
};

module.exports = encryptionUtil;
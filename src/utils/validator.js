const validator = {
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
  
    validatePassword(password) {
      // 최소 8자, 영문/숫자/특수문자 포함
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      return passwordRegex.test(password);
    },
  
    validatePhone(phone) {
      const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
      return phoneRegex.test(phone);
    },
  
    validateURL(url) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
  
    sanitizeHTML(text) {
      return text.replace(/[&<>"']/g, function(match) {
        const escape = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        };
        return escape[match];
      });
    },
  
    validateInput(data, rules) {
      const errors = [];
  
      for (const [field, rule] of Object.entries(rules)) {
        const value = data[field];
  
        // 필수 필드 체크
        if (rule.required && !value) {
          errors.push(`${field} is required`);
          continue;
        }
  
        if (value) {
          // 최소 길이 체크
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(`${field} must be at least ${rule.minLength} characters`);
          }
  
          // 최대 길이 체크
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${field} must be at most ${rule.maxLength} characters`);
          }
  
          // 패턴 체크
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${field} format is invalid`);
          }
  
          // 사용자 정의 검증
          if (rule.validate && !rule.validate(value)) {
            errors.push(rule.message || `${field} is invalid`);
          }
        }
      }
  
      return errors;
    }
  };
  
  module.exports = validator;
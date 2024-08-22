// src/utils/validators.js

export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }
  
  export function isValidPassword(password) {
    // Password must be at least 8 characters long
    return password.length >= 8;
  }
  
  export function isNotEmpty(input) {
    return input.trim().length > 0;
  }
  
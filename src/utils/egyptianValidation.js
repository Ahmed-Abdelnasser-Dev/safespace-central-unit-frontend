/**
 * Egyptian Validation Utilities
 * Validates NID, phone numbers, and emails according to Egyptian standards
 */

/**
 * Validate Egyptian National ID (14 digits)
 * 
 * @param {string} nid - National ID to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateEgyptianNID(nid) {
  // Remove any spaces or dashes
  const cleanNID = (nid || '').replace(/[\s-]/g, '');

  // Must be exactly 14 digits
  if (!/^\d{14}$/.test(cleanNID)) {
    return { valid: false, error: 'National ID must be exactly 14 digits' };
  }

  // Extract components
  const century = parseInt(cleanNID[0]);
  const year = parseInt(cleanNID.substring(1, 3));
  const month = parseInt(cleanNID.substring(3, 5));
  const day = parseInt(cleanNID.substring(5, 7));
  const governorate = parseInt(cleanNID.substring(7, 9));

  // Validate century (2 for 1900s, 3 for 2000s, 4 for 2100s)
  if (century < 2 || century > 4) {
    return { valid: false, error: 'Invalid century digit (must be 2, 3, or 4)' };
  }

  // Validate month (01-12)
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Invalid month (must be 01-12)' };
  }

  // Validate day (01-31)
  if (day < 1 || day > 31) {
    return { valid: false, error: 'Invalid day (must be 01-31)' };
  }

  // Validate governorate code (01-35 for Egyptian governorates)
  if (governorate < 1 || governorate > 35) {
    return { valid: false, error: 'Invalid governorate code (must be 01-35)' };
  }

  // Additional date validation
  const fullYear = century === 2 ? 1900 + year : century === 3 ? 2000 + year : 2100 + year;
  const daysInMonth = new Date(fullYear, month, 0).getDate();
  if (day > daysInMonth) {
    return { valid: false, error: `Invalid day for month ${month}/${fullYear}` };
  }

  return { valid: true };
}

/**
 * Validate Egyptian mobile phone number
 * Format: 01X XXXX XXXX (11 digits starting with 01)
 * Valid prefixes: 010, 011, 012, 015 (major carriers)
 * 
 * @param {string} phone - Phone number to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateEgyptianPhone(phone) {
  // Remove any spaces, dashes, parentheses
  const cleanPhone = (phone || '').replace(/[\s\-()]/g, '');

  // Remove country code if present (+20 or 0020)
  let normalized = cleanPhone;
  if (normalized.startsWith('+20')) {
    normalized = '0' + normalized.substring(3);
  } else if (normalized.startsWith('0020')) {
    normalized = '0' + normalized.substring(4);
  }

  // Must be exactly 11 digits starting with 01
  if (!/^01\d{9}$/.test(normalized)) {
    return { 
      valid: false, 
      error: 'Egyptian mobile number must be 11 digits starting with 01' 
    };
  }

  // Validate carrier prefix (010, 011, 012, 015)
  const prefix = normalized.substring(0, 3);
  const validPrefixes = ['010', '011', '012', '015'];
  if (!validPrefixes.includes(prefix)) {
    return { 
      valid: false, 
      error: 'Invalid carrier prefix (must be 010, 011, 012, or 015)' 
    };
  }

  return { valid: true, normalized };
}

/**
 * Validate email address
 * Standard email validation with Egyptian domain awareness
 * 
 * @param {string} email - Email to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateEmail(email) {
  const cleanEmail = (email || '').trim().toLowerCase();

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check for common typos
  const domain = cleanEmail.split('@')[1];
  const commonTypos = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
  };

  if (commonTypos[domain]) {
    return { 
      valid: false, 
      error: `Did you mean ${cleanEmail.split('@')[0]}@${commonTypos[domain]}?` 
    };
  }

  return { valid: true };
}

/**
 * Format Egyptian phone for display
 * @param {string} phone
 * @returns {string} Formatted as 01X XXXX XXXX
 */
export function formatEgyptianPhone(phone) {
  const { valid, normalized } = validateEgyptianPhone(phone);
  if (!valid) return phone;

  // Format as 01X XXXX XXXX
  return `${normalized.substring(0, 3)} ${normalized.substring(3, 7)} ${normalized.substring(7)}`;
}

/**
 * Format Egyptian NID for display
 * @param {string} nid
 * @returns {string} Formatted as X XX XX XX XX XXXX X
 */
export function formatEgyptianNID(nid) {
  const { valid } = validateEgyptianNID(nid);
  if (!valid) return nid;

  const clean = nid.replace(/[\s-]/g, '');
  // Format as X XX XX XX XX XXXX X
  return `${clean[0]} ${clean.substring(1, 3)} ${clean.substring(3, 5)} ${clean.substring(5, 7)} ${clean.substring(7, 9)} ${clean.substring(9, 13)} ${clean[13]}`;
}

/**
 * Get governorate name from NID
 * @param {string} nid
 * @returns {string} Governorate name or 'Unknown'
 */
export function getGovernorateFromNID(nid) {
  const { valid } = validateEgyptianNID(nid);
  if (!valid) return 'Unknown';

  const governorates = {
    '01': 'Cairo', '02': 'Alexandria', '03': 'Port Said', '04': 'Suez',
    '11': 'Damietta', '12': 'Dakahlia', '13': 'Sharqia', '14': 'Qalyubia',
    '15': 'Kafr El Sheikh', '16': 'Gharbia', '17': 'Monufia', '18': 'Beheira',
    '19': 'Ismailia', '21': 'Giza', '22': 'Beni Suef', '23': 'Fayoum',
    '24': 'Minya', '25': 'Asyut', '26': 'Sohag', '27': 'Qena',
    '28': 'Aswan', '29': 'Luxor', '31': 'Red Sea', '32': 'New Valley',
    '33': 'Matrouh', '34': 'North Sinai', '35': 'South Sinai',
    '88': 'Foreign Born',
  };

  const code = nid.substring(7, 9);
  return governorates[code] || 'Unknown';
}

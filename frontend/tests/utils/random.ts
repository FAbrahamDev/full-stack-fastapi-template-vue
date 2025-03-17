export const randomEmail = () =>
  `test_${Math.random().toString(36).substring(7)}@example.com`

export const randomTeamName = () =>
  `Team ${Math.random().toString(36).substring(7)}`

export const randomPassword = () => {
  // Ensure at least one of each required character type
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  
  // Get one character from each required character set
  const guaranteedUpper = upperCase.charAt(Math.floor(Math.random() * upperCase.length));
  const guaranteedLower = lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));
  const guaranteedNumber = numbers.charAt(Math.floor(Math.random() * numbers.length));
  
  // Generate random string for the rest of the password
  const randomChars = Math.random().toString(36).substring(2, 10);
  
  // Combine all parts and shuffle
  const combinedPassword = guaranteedUpper + guaranteedLower + guaranteedNumber + randomChars;
  
  // Shuffle the password to avoid predictable pattern at beginning
  return combinedPassword
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")

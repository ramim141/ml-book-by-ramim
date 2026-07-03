export const ADMIN_EMAILS = [
  "ahramu584@gmail.com"
];

export const isAdmin = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

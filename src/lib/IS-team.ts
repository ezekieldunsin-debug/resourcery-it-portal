export const IS_TEAM_EMAILS = [
  "ezekiela@resourcery.com",
  "malikm@resourcery.com",
  "is@resourcery.com",
  // ← add all IS emails
].map(e => e.toLowerCase());

export const isISUser = (email: string) => IS_TEAM_EMAILS.includes(email.toLowerCase());

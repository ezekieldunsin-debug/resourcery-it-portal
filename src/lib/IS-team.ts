export const IT_TEAM_EMAILS = [
  "ezekiela@resourcery.com",
  "malikm@resourcery.com",
  "is@resourcery.com",
  // ← add all IT emails
].map(e => e.toLowerCase());

export const isITUser = (email: string) => IT_TEAM_EMAILS.includes(email.toLowerCase());

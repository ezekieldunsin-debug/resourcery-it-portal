export const IS_TEAM_EMAILS = [
  "is@resourcery.com",
  "ezekiel@resourcery.com",
  "malikm@resourcery.com"
  // ← Add all real IS team emails here
].map(email => email.toLowerCase())

export const isISUser = (email: string) => IS_TEAM_EMAILS.includes(email.toLowerCase())

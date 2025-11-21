export const IS_TEAM_EMAILS = [
  "is@resourcery.com.ng",
  "john.doe@resourcery.com.ng",
  "jane.smith@resourcery.com.ng"
  // ← Add all real IS team emails here
].map(e => e.toLowerCase())

export const isISUser = (email: string) => 
  IS_TEAM_EMAILS.includes(email.toLowerCase())

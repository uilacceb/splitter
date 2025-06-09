export const hashedEmail = (email: any) => {
  return email.split("@")[0].slice(0, 3) + "****@" + email.split("@")[1];
};
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export const generateRandomString = (length: number) => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let resultString = "";

  for (let i = 0; i < length; i++) {
    resultString += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return resultString;
};

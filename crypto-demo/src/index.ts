import encryptDataAndKeys from "./sender.js";
import { getPublicKey } from "./receiver.js";


// Get passport data to start with
import demoPassport from "./constants/demo-passport.json" assert { type: "json" };

const start = async () => {
  // get public key from receiver
  const rsaPublicKey = await getPublicKey();

  // pass passport data and public key to sender
  const encryptedResult = await encryptDataAndKeys(demoPassport, rsaPublicKey);
  
  console.log("💬 ~ encryptedResult:", encryptedResult);
  return encryptedResult;
};

start();

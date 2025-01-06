// RECEIVER
import crypto from "crypto";

// Generate an RSA key pair
export const generateRSAKeyPair = async (): Promise<CryptoKeyPair> => {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: "SHA-256" },
    },
    true,
    ["encrypt", "decrypt"]
  );

  return keyPair;
};

// Export the public key as a string
export const getPublicKey = async () => {
  const keyPair = await generateRSAKeyPair();
  const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  const publicKeyString = btoa(
    String.fromCharCode.apply(null, new Uint8Array(publicKey))
  );

  return publicKeyString;
};

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import crypto from "crypto";
import { generateRandomString } from "./util.js";
// Import the RSA public key
export const importRsaPublicKey = (pem) => __awaiter(void 0, void 0, void 0, function* () {
    const key = atob(pem);
    const keyData = new Uint8Array(key.length);
    for (let i = 0; i < key.length; ++i) {
        keyData[i] = key.charCodeAt(i);
    }
    const importedPublicKey = yield crypto.subtle.importKey("spki", keyData, {
        name: "RSA-OAEP",
        hash: { name: "SHA-256" },
    }, true, ["encrypt"]);
    return importedPublicKey;
});
// Encrypt data and keys
const encryptDataAndKeys = (data, publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    // encode data (string to bytes)
    const encoder = new TextEncoder();
    const dataEncoded = encoder.encode(JSON.stringify(data));
    // generate random key and iv strings
    const aesKeyString = generateRandomString(32);
    const aesIvString = generateRandomString(16);
    // Convert the strings to byte arrays
    const keyData = new TextEncoder().encode(aesKeyString);
    const ivData = new TextEncoder().encode(aesIvString);
    // Import as a raw AES-CBC key
    const aesKey = yield crypto.subtle.importKey("raw", keyData, {
        name: "AES-CBC",
        length: 256,
    }, true, ["encrypt", "decrypt"]);
    // Encrypt data
    const cipherText = yield crypto.subtle.encrypt({
        name: "AES-CBC",
        iv: ivData,
    }, aesKey, dataEncoded);
    // Convert to base64 string
    const cipherTextBase64 = btoa(String.fromCharCode.apply(null, [...new Uint8Array(cipherText)]));
    // Stringify AES key and IV
    const aesKeyAndIvStr = `${aesKeyString}:${aesIvString}`;
    // Convert to Uint8Array and Encrypt with RSA public key
    const RsaPublicKey = yield importRsaPublicKey(publicKey);
    const keyIvEncoded = encoder.encode(aesKeyAndIvStr);
    const rsaEncryptedKeyIv = yield crypto.subtle.encrypt({
        name: "RSA-OAEP",
    }, RsaPublicKey, keyIvEncoded);
    const rsaEncryptedKeyIvBase64 = btoa(String.fromCharCode.apply(null, [...new Uint8Array(rsaEncryptedKeyIv)]));
    return {
        data: cipherTextBase64,
        key: rsaEncryptedKeyIvBase64,
    };
});
export default encryptDataAndKeys;

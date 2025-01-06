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
import { generateRandomString, importRsaPublicKey } from "./util.js";
const encryptDataAndKeys = (data, publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    // encode data (string to bytes)
    const encoder = new TextEncoder();
    const dataEncoded = encoder.encode(JSON.stringify(data));
    // generate random key and iv strings
    const keyString = generateRandomString(32);
    const ivString = generateRandomString(16);
    // Convert the strings to byte arrays
    const keyData = new TextEncoder().encode(keyString);
    const ivData = new TextEncoder().encode(ivString);
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
    const aesKeyAndIvStr = `${keyString}:${ivString}`;
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

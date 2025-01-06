var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// RECEIVER
import crypto from "crypto";
// Generate an RSA key pair
export const generateRSAKeyPair = () => __awaiter(void 0, void 0, void 0, function* () {
    const keyPair = yield crypto.subtle.generateKey({
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-256" },
    }, true, ["encrypt", "decrypt"]);
    return keyPair;
});
// Export the public key as a string
export const getPublicKey = () => __awaiter(void 0, void 0, void 0, function* () {
    const keyPair = yield generateRSAKeyPair();
    const publicKey = yield crypto.subtle.exportKey("spki", keyPair.publicKey);
    const publicKeyString = btoa(String.fromCharCode.apply(null, new Uint8Array(publicKey)));
    return publicKeyString;
});

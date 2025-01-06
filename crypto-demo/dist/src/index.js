var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import encryptDataAndKeys from "./sender.js";
import { getPublicKey } from "./receiver.js";
// Get passport data to start with
import demoPassport from "./constants/demo-passport.json" assert { type: "json" };
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    // get public key from receiver
    const rsaPublicKey = yield getPublicKey();
    // pass passport data and public key to sender
    const encryptedResult = yield encryptDataAndKeys(demoPassport, rsaPublicKey);
    console.log("💬 ~ encryptedResult:", encryptedResult);
    return encryptedResult;
});
start();

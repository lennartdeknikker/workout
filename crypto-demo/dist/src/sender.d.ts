import { IdentityDocument } from "./types/IdentityDocument.js";
export declare const importRsaPublicKey: (pem: string) => Promise<CryptoKey>;
declare const encryptDataAndKeys: (data: any, publicKey: string) => Promise<IdentityDocument>;
export default encryptDataAndKeys;
//# sourceMappingURL=sender.d.ts.map
import * as crypto from "crypto";

export function encryptData(
  data: string,
  password: string,
  isPrivateKey: boolean = false
): string {
  if (isPrivateKey) {
    data = data.slice(2);
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    crypto.pbkdf2Sync(password, "salt", 100000, 32, "sha256"),
    iv
  );
  const encryptedDataBuffer = Buffer.concat([
    cipher.update(Buffer.from(data, "utf8")),
    cipher.final(),
  ]);
  return iv.toString("hex") + encryptedDataBuffer.toString("hex");
}

export function decryptData(
  encryptedData: string,
  password: string,
  isPrivateKey: boolean = false
): string {
  const encryptedDataBuffer = Buffer.from(encryptedData, "hex");
  const iv = encryptedDataBuffer.slice(0, 16);
  if (encryptedDataBuffer.length < 16) {
    throw new Error(
      "Invalid encrypted data: initialization vector is missing or too short."
    );
  }
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    crypto.pbkdf2Sync(password, "salt", 100000, 32, "sha256"),
    iv
  );
  let decryptedData =
    decipher.update(encryptedDataBuffer.slice(16)).toString("utf8") +
    decipher.final().toString("utf8");
  if (isPrivateKey) {
    decryptedData = "0x" + decryptedData;
  }
  return decryptedData;
}

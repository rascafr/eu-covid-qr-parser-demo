const Jimp = require("jimp");
const jsQR = require("jsqr");
const fs = require('fs');
const cbor = require('cbor');
const { inflate } = require('zlib');
const { decode } = require("base45");
const { decodeFirst } = require("cbor");
const {
    HEALTH_CERTIFICATE_PREFIX,
    CLAIM_KEY_CERT,
    CLAIM_KEY_V1EU
} = require("./defs");

const Extractor = module.exports;

Extractor.qr2pass = (imagePath) => new Promise(async (resolve, reject) => {

    // read the image as color buffer
    const image = await Jimp.read(fs.readFileSync(imagePath));

    // convert to unsigned 8bit values so we can use jsQR
    const qrCodeImageArray = new Uint8ClampedArray(image.bitmap.data.buffer);

    // decode the QR image data
    const code = jsQR(
        qrCodeImageArray,
        image.bitmap.width,
        image.bitmap.height
    );

    // check prefix health certificate
    if (!code.data || !code.data.startsWith(HEALTH_CERTIFICATE_PREFIX)) {
        return reject(`QR code payload prefix ${HEALTH_CERTIFICATE_PREFIX} not found, skipping`);
    }
    // remove the signature from the payload (HC1:...)
    const targetPayload = code.data.slice(HEALTH_CERTIFICATE_PREFIX.length);

    // decode the data in the base45
    // helpful source -> https://ehealth.vyncke.org/
    const b45decoded = decode(targetPayload);

    // inflate the data since it has been passed into zlib before (0x78)
    inflate(b45decoded, async (err, deflated) => {
        if (err) return reject(err);

        // decode whole payload (COSE/CBOR), returned as a js Map
        const objBase = await cbor.decodeFirst(deflated);
        const partUser = objBase.toJSON().value[2];

        // decode certificate / user payload, returned as a js Map
        const objUser = await decodeFirst(partUser);
        const certData = objUser.get(CLAIM_KEY_CERT);
        const userData = certData.get(CLAIM_KEY_V1EU);

        return resolve(userData);
    });
});

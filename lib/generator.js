const Generator = module.exports;
const { encodeOne, Tagged } = require('cbor');
const { deflate } = require('zlib');
const { toFile } = require('qrcode');
const { encode } = require('base45');

const {
    CLAIM_KEY_CERT,
    CLAIM_KEY_V1EU,
    CLAIM_ISSUER,
    CLAIM_LAST_VAX_DATE,
    CLAIM_QR_GEN_DATE,
    CLAIM_HEADER_SIGN_ALGO,
    CLAIM_HEADER_KEY_IDENTIFIER,
    HEALTH_CERTIFICATE_PREFIX,
    CBOR_TAG_VERSION
} = require('./defs');

Generator.pass2qr = (
    algorithmSignature, keyIdentifier, hcertSignature, certIssuer,
    vaccinationDate, qrCodeGeneratedDate /* opt */, payload, pathToQRimage
) => new Promise((resolve, reject) => {

    const qrCodeGenerationDate = qrCodeGeneratedDate || new Date().getTime();

    const headerMap = new Map();
    headerMap.set(CLAIM_HEADER_SIGN_ALGO, algorithmSignature);
    headerMap.set(CLAIM_HEADER_KEY_IDENTIFIER, keyIdentifier);

    const euPayloadMap = new Map();
    euPayloadMap.set(CLAIM_KEY_V1EU, payload);

    const masterMap = new Map();
    masterMap.set(CLAIM_ISSUER, certIssuer); // eg: CNAM
    masterMap.set(CLAIM_LAST_VAX_DATE, vaccinationDate);
    masterMap.set(CLAIM_QR_GEN_DATE, qrCodeGenerationDate);
    masterMap.set(CLAIM_KEY_CERT, euPayloadMap);

    const taggedObject = new Tagged(
        CBOR_TAG_VERSION,
        [
            encodeOne(headerMap),
            {}, // always empty?
            encodeOne(masterMap),
            hcertSignature
        ],
        null
    );

    const transportCWTdata = encodeOne(taggedObject);
    deflate(transportCWTdata, async (err, deflCWTdata) => {
        if (err) return reject(err);

        const b45CWTdata = encode(deflCWTdata);
        const qrReadyCWTstr = HEALTH_CERTIFICATE_PREFIX + b45CWTdata;

        await toFile(pathToQRimage, qrReadyCWTstr);
        resolve(qrReadyCWTstr);
    });
});

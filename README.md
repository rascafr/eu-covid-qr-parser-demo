# EU Covid QR extractor & generator

Quick Node.js PoC to parse and generate european vaccination certificate QR codes

> 🛑 **DISCLAIMER PLEASE READ 🛑 I'm receiving a lot of messages from people asking if it's possible to create a valid EU Covid Vaccination QRcode so I'll make it clear for you here: NO YOU CAN'T**. The QRcode is signed with a private key to certify its authenticity, so except if you found a way to get it (which is nearly impossible), yes, your QRcode will be decoded with your personal details BUT marked as invalid. This project allows you to play with the QRcodes, not to do forgery, or counterfeiting. If it's your main goal, please: educate yourself, and get vaccinated.

## How it works

```
Read image -> find & decode QRcode -> remove HC1 (health certificate) prefix -> base45 decode -> CBOR decode required fields
```

Same thing for the QRcode creation... reverse order.

## Prerequisites

**Requires Node.js 12 at least**, otherwise you'll get the `ReferenceError: TextDecoder is not defined` error.

```bash
nvm use 12
```

## Install

```bash
git clone https://github.com/rascafr/eu-covid-qr-parser-demo.git
cd eu-covid-qr-parser-demo
npm i
```

## Usage

```bash
npm start <your_certif_qr_image>

# example return
Opening eu_digital_att.png ...
Decoded in 499 ms: {
  v: [
    {
      ci: 'urn:uvci:01:FR:AZERTY123456#7',
      co: 'FR',
      dn: 2,
      dt: '2021-06-17',
      is: 'CNAM',
      ma: 'ORG-PFIZER',
      mp: 'EU/BIONTECH',
      sd: 2,
      tg: '1234567',
      vp: 'XXAA000'
    }
  ],
  dob: '1993-12-12',
  nam: { fn: 'LEPAROUX', gn: 'FRANCOIS', fnt: 'LEPAROUX', gnt: 'FRANCOIS' },
  ver: '1.3.0'
}
```

## Helpful sources

- https://ehealth.vyncke.org/
- https://github.com/ehn-dcc-development/hcert-spec/blob/main/hcert_spec.md
- https://ec.europa.eu/health/sites/default/files/ehealth/docs/covid-certificate_json_specification_en.pdf

## Used libraries

- `jsQR`
- `jimp`
- `base45`
- `cbor`
- `zlib`

const express = require('express');
const AcmeClient = require('acme-client');
const forge = require('forge');
const fs = require('fs');

const app = express();
app.use(express.json());

const accountPrivateKey = './account-private-key.pem';

const client = new AcmeClient.Client({
  directoryUrl: AcmeClient.directory.letsencrypt.staging,
  accountKey: fs.readFileSync(accountPrivateKey, 'utf8'),
});



app.post('/create-certificate', async (req, res) => {
  try {
    const domain = req.body.domain;
    await client.createAccount({ termsOfServiceAgreed: true });
    const myAccountUrl = client.getAccountUrl();
console.log(myAccountUrl);
    const privateKey = await AcmeClient.forge.createPrivateKey();
    //Certificate Signing Request (CSR)
    const [key, csr] = await AcmeClient.forge.createCsr({ commonName: domain});

    // Certificate request
    const autoOpts = {
        csr,
        termsOfServiceAgreed: true,
        challengeCreateFn: async (authz, challenge, keyAuthorization) => {},
        challengeRemoveFn: async (authz, challenge, keyAuthorization) => {}
    };
    
    const certificate = await client.auto(autoOpts);
    fs.writeFileSync('certificate.crt', certificate);
    fs.writeFileSync('privatekey.pem', key);

    res.json({ message: 'Certificate obtained and saved successfully.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Certificate request failed.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

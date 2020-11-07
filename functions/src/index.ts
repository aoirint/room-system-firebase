import * as functions from 'firebase-functions';
import createHmac from 'create-hmac';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const bellWebhook = functions.https.onRequest((request, response) => {
  const bellSecretBase64 = functions.config().bell.secret;
  const bellSecretDecoded = Buffer.from(bellSecretBase64, 'base64');
  const auth = request.get('Authorization');
  const body = request.rawBody.toString();

  const hmacBuf = createHmac('sha256', bellSecretDecoded);
  hmacBuf.update(body);

  const hmac = hmacBuf.digest('base64');

  functions.logger.info(`${bellSecretDecoded} ${auth} ${hmac}`, {structuredData: true});
  response.send("Hello from Firebase!");
});

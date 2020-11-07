import * as functions from 'firebase-functions';
import createHmac from 'create-hmac';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

interface TeamsResponse {
  type: string;
  text: string;
}

interface TeamsRequest {
  type: string;
  id: string;
  timestamp: string;
  localTimestamp: string;
  from: TeamsRequestUser;
  conversation: TeamsRequestConversation;
  text: string;
  attachments: TeamsRequestAttachment[];
}

interface TeamsRequestUser {
  id: string;
  name: string;
  aadObjectId: string;
}

interface TeamsRequestConversation {
  isGroup: boolean;
  id: string;
  name: string | null;
  conversationType?: string;
  tenantId?: string;
}

interface TeamsRequestAttachment {
  contentType: string | null;
  contentUrl: string | null;
  content: string | null;
  name: string | null;
  thumbnailUrl: string | null;
}

export const bellWebhook = functions.https.onRequest((request, response) => {
  const bellSecretBase64 = functions.config().bell.secret;
  const bellSecretDecoded = Buffer.from(bellSecretBase64, 'base64');
  const auth = request.get('Authorization');
  const rawBody = request.rawBody.toString();

  const hmacBuf = createHmac('sha256', bellSecretDecoded);
  hmacBuf.update(rawBody);

  const hmac = 'HMAC ' + hmacBuf.digest('base64');

  if (hmac !== auth) {
    functions.logger.error(`HMAC verification failed.`);
    response.send(`HMAC verification failed.`);
    return;
  }

  const body: TeamsRequest = request.body;
  functions.logger.info(body);

  const msg: TeamsResponse = {
    type: 'message',
    text: 'You said: ' + body.text,
  };

  response.json(msg);
});

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import createHmac from 'create-hmac';

admin.initializeApp()


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
  admin.database().ref().child('messages').push().set(body).then(() => {
    functions.logger.info('Message saved.');
  }).catch((err) => {
    functions.logger.error(err);
  });

  functions.logger.info(body);

  // TODO: クライアントの死活管理
  const msg: TeamsResponse = {
    type: 'message',
    text: '受け付けました（呼び鈴の状態：未チェック）',
  };

  response.json(msg);
});

import * as admin from 'firebase-admin';

import env from '../config/env';

const { googleClientEmail, googlePrivateKey, googleProjectId } = env;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: googleProjectId,
    clientEmail: googleClientEmail,
    privateKey: googlePrivateKey
  })
});

const db: FirebaseFirestore.Firestore = admin.firestore();
db.settings({ timestampsInSnapshots: true });

export default db;

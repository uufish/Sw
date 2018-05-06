import { firestore } from 'firebase-admin';

import { USERS } from '../../constants';

export const getUserByUsername = async (username) => {
  if (!username) {
    throw new Error('username not found');
  }

  const ref = firestore().collection(USERS).where('username', '==', username).limit(1);

  const querySnapshot = await ref.get();
  if (querySnapshot.empty) {
    throw new Error(`user (${username}) not found`);
  }

  const snapshot = querySnapshot.docs[0];

  const data = snapshot.data();

  return { ...data, id: snapshot.id };
};

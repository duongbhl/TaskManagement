import admin from "firebase-admin";

let firestore;

export function initFirebase() {
  if (admin.apps.length) return admin.app();

  admin.initializeApp(); // Firebase tự đọc GOOGLE_APPLICATION_CREDENTIALS

  return admin.app();
}

export function db() {
  initFirebase();
  if (!firestore) firestore = admin.firestore();
  return firestore;
}

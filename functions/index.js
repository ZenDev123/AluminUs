const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.deleteExpiredCompetitions = functions.pubsub
  .schedule("every 24 hours") // or set a different interval
  .onRun(async (context) => {
    const now = new Date();
    const snapshot = await db.collection("competitions").get();

    const deletions = snapshot.docs
      .filter(doc => {
        const toDate = doc.data().toDate?.toDate ? doc.data().toDate.toDate() : new Date(doc.data().toDate);
        return toDate < now;
      })
      .map(doc => doc.ref.delete());

    await Promise.all(deletions);
    console.log(`Deleted ${deletions.length} expired competitions`);
    return null;
  });

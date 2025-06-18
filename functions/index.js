const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.deleteExpiredCompetitions = functions.pubsub
  .schedule("every 24 hours") // Or "every 6 hours", etc
  .timeZone("Asia/Kolkata")
  .onRun(async (context) => {
    const db = admin.firestore();
    const compsRef = db.collection("competitions");
    const snapshot = await compsRef.get();

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    const deletions = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const toDate = data.toDate?.toDate
        ? data.toDate.toDate() // Timestamp object
        : new Date(data.toDate); // Fallback for raw Date

      if (toDate < today) {
        deletions.push(compsRef.doc(doc.id).delete());
      }
    });

    await Promise.all(deletions);
    console.log(`Deleted ${deletions.length} expired competitions.`);
    return null;
  });

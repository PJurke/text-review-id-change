const { MongoClient, ObjectId } = require('mongodb');

async function updateUUIDsToObjectIDs() {
  const uri = process.env.MONGO_URI; // MongoDB-Verbindungsstring aus Umgebungsvariablen
  if (!uri) {
    console.error("MONGO_URI ist nicht gesetzt.");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("text-review-db"); // Ersetze mit deinem Datenbanknamen
    const collection = database.collection("documents"); // Ersetze mit deinem Collectionnamen

    // Finde das Dokument
    const document = await collection.findOne({ title: "Abschiedsrede als Bundeskanzlerin" });
    if (!document) {
      console.log("Dokument nicht gefunden.");
      return;
    }

    // Aktualisiere die UUIDs in den Paragraphs
    const updatedParagraphs = document.paragraphs.map(paragraph => ({
      ...paragraph,
      id: new ObjectId() // Ersetze UUID durch neue ObjectId
    }));

    // Aktualisiere die UUIDs in den Highlights
    const updatedHighlights = document.highlights.map(highlight => ({
      ...highlight,
      id: new ObjectId(), // Ersetze UUID durch neue ObjectId
      paragraphId: updatedParagraphs.find(p => p.id.equals(highlight.paragraphId))?.id || new ObjectId()
    }));

    // Speichere die Änderungen
    const result = await collection.updateOne(
      { _id: document._id },
      { $set: { paragraphs: updatedParagraphs, highlights: updatedHighlights } }
    );

    console.log(`Dokument aktualisiert: ${result.modifiedCount} Dokument(e) geändert.`);
  } catch (error) {
    console.error("Fehler beim Aktualisieren:", error);
  } finally {
    await client.close();
  }
}

updateUUIDsToObjectIDs();

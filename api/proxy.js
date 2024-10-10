import { getStorage, ref, getDownloadURL } from "firebase/storage";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const storage = getStorage();
    const gsUrl = `gs://${url.split('/o/')[1].split('?')[0]}`;
    const gsReference = ref(storage, gsUrl);
    
    const downloadURL = await getDownloadURL(gsReference);
    
    const response = await fetch(downloadURL);
    const arrayBuffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="rom.zip"');
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('Error proxying file:', error);
    res.status(500).json({ error: 'Error proxying file' });
  }
}
// pages/api/delete-image.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.query;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Image name is required' });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, name);

    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Vérifier que le fichier est bien dans le dossier uploads (sécurité)
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(uploadDir);
    
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }

    // Supprimer le fichier
    fs.unlinkSync(filePath);

    return res.status(200).json({ 
      success: true, 
      message: `File ${name} deleted successfully` 
    });

  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: 'Failed to delete file' });
  }
}
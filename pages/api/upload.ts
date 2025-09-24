// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  // Seule la méthode POST est autorisée
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Configuration formidable
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: ({ mimetype }) => {
        return mimetype && mimetype.startsWith('image/')
      }
    })

    const [fields, files] = await form.parse(req)
    const file = Array.isArray(files.file) ? files.file[0] : files.file

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Générer un nouveau nom sécurisé
    const ext = path.extname(file.originalFilename || '')
    const safeName = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext
    const newPath = path.join(uploadDir, safeName)

    // Renommer le fichier
    fs.renameSync(file.filepath, newPath)

    const fileUrl = `/uploads/${safeName}`

    return res.status(200).json({
      success: true,
      fileUrl,
      fileName: file.originalFilename,
      fileSize: file.size
    })

  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ error: 'Upload failed: ' })
  }
}
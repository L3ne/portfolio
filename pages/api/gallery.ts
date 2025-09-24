import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  let files: string[] = [];
  
  if (fs.existsSync(uploadDir)) {
    files = fs.readdirSync(uploadDir)
      .filter(f => f.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .sort((a, b) => {
        const aStats = fs.statSync(path.join(uploadDir, a));
        const bStats = fs.statSync(path.join(uploadDir, b));
        return bStats.mtime.getTime() - aStats.mtime.getTime();
      });
  }

  const badgeText = files.length === 0 ? 'Aucune image' : `${files.length} image${files.length > 1 ? 's' : ''}`;

  let galleryContent = '';
  
  if (files.length === 0) {
    galleryContent = `
      <div class="empty-state gallery-item">
        <div class="empty-emoji">📷</div>
        <div class="empty-text">Votre galerie est vide</div>
        <a href="/api/upload" class="api-link">📸 Uploader votre première image</a>
      </div>
    `;
  } else {
    const imageCards = files.map((file, idx) => {
      const displayName = file.replace(/^\d+-[a-z0-9]+-/, '');
      return `
        <div class="gallery-item" onclick="openModal('/uploads/${file}')">
          <img src="/uploads/${file}" alt="${displayName}" loading="lazy">
          <div class="image-info">
            <div class="image-name">${displayName}</div>
            <button class="delete-btn" onclick="deleteImage(event, '${file}')">
              🗑️ Supprimer
            </button>
          </div>
        </div>
      `;
    }).join('');

    galleryContent = `
      <div class="gallery-list">
        ${imageCards}
      </div>
      <div class="gallery-actions">
        <a href="/api/upload" class="api-link">➕ Ajouter des images</a>
        <a href="/api" class="api-link">← Retour API</a>
      </div>
    `;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Galerie - Portfolio</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono&display=swap" rel="stylesheet">
        <style>
          :root {
            --bg-color: #0A0812;
            --text-color: #D0C8E8;
            --accent-color: #A060D8;
            --secondary-accent-color: #7858C0;
            --secondary-text-color: #9890B8;
            --error-color: #D84860;
            --success-color: #58C8A8;
            --caret-color: var(--accent-color);
            --scanline-dark: rgba(0,0,0,0.20);
            --scanline-v-tint: rgba(60, 40, 100, 0.03);
            --border-color: #201830;
            --body-bg-color: #06040A;
            --glow-color: rgba(160, 96, 216, 0.25);
            --success-glow-color: rgba(88, 200, 168, 0.3);
          }

          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            background-color: var(--body-bg-color);
            font-family: 'Space Mono', monospace;
            font-size: 14px;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow: hidden;
            color: var(--text-color);
            text-shadow: 0 0 3px var(--glow-color);
          }

          .background-blur {
            position: fixed;
            inset: 0;
            z-index: -2;
            background: url('/assets/bg.jpg') center center / cover no-repeat;
            filter: blur(8px) brightness(0.85);
          }

          #terminal-container {
            width: 96vw;
            height: 94vh;
            max-width: 1400px;
            max-height: 900px;
            background-color: rgba(10, 8, 18, 0.65);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--border-color);
            box-shadow: 0 0 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.5);
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding: 15px;
            box-sizing: border-box;
          }

          #terminal-container::before {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            width: 100%; height: 100%;
            background:
              linear-gradient(var(--scanline-dark) 50%, transparent 50%),
              linear-gradient(90deg, var(--scanline-v-tint), transparent 3%, transparent 97%, var(--scanline-v-tint));
            background-size: 100% 2px, 5px 100%;
            z-index: 1;
            pointer-events: none;
          }

          #terminal-container::after {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%);
            z-index: 1;
            pointer-events: none;
          }

          #terminal-content {
            flex-grow: 1;
            overflow-y: auto;
            line-height: 1.3;
            word-wrap: break-word;
            color: var(--text-color);
            font-size: 1em;
            position: relative;
            z-index: 2;
          }
          #terminal-content::-webkit-scrollbar { display: none; }
          #terminal-content { scrollbar-width: none; -ms-overflow-style: none; }

          .line {
            margin-bottom: 2px;
            white-space: pre-wrap;
          }

          .command-header {
            font-size: 1.2em;
            margin-bottom: 15px;
            color: var(--accent-color);
            text-shadow: 0 0 5px var(--glow-color);
          }

          .success { 
            color: var(--success-color); 
            text-shadow: 0 0 5px var(--success-glow-color); 
          }

          .badge-info {
            color: var(--secondary-accent-color);
            margin-bottom: 20px;
          }

          /* Gallery Styles */
          .gallery-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 15px;
            margin-top: 20px;
            margin-bottom: 25px;
          }

          .gallery-item {
            opacity: 0;
            transform: translateY(20px);
            filter: blur(6px);
            animation: blurFadeIn 0.8s ease-out forwards;
            background: rgba(32, 24, 48, 0.4);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(160, 96, 216, 0.1);
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
          }

          .gallery-item:hover {
            background: rgba(32, 24, 48, 0.6);
            border-color: rgba(160, 96, 216, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.4);
          }

          .gallery-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            transition: all 0.3s ease;
            border-bottom: 1px solid rgba(160, 96, 216, 0.1);
          }

          .gallery-item:hover img {
            transform: scale(1.05);
            filter: brightness(1.1);
          }

          .image-info {
            padding: 12px 15px;
            background: rgba(10, 8, 18, 0.8);
          }

          .image-name {
            color: var(--text-color);
            font-size: 0.9em;
            margin-bottom: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .delete-btn {
            background: var(--error-color);
            border: none;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Space Mono', monospace;
          }

          .delete-btn:hover {
            background: #B91C1C;
            transform: translateY(-1px);
          }

          /* Empty State */
          .empty-state {
            text-align: center;
            padding: 40px 20px;
            grid-column: 1 / -1;
          }

          .empty-emoji {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .empty-text {
            font-size: 1.2rem;
            color: var(--secondary-text-color);
            margin-bottom: 2rem;
          }

          /* API Links */
          .api-link {
            color: var(--accent-color);
            text-decoration: none;
            padding: 8px 16px;
            border: 1px solid var(--accent-color);
            border-radius: 6px;
            transition: all 0.3s ease;
            display: inline-block;
            margin: 4px 8px 4px 0;
            font-family: 'Space Mono', monospace;
          }

          .api-link:hover {
            background: var(--accent-color);
            color: var(--bg-color);
            text-shadow: none;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(160, 96, 216, 0.3);
          }

          .gallery-actions {
            text-align: center;
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
          }

          /* Modal */
          .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 1000;
            padding: 2rem;
          }

          .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .modal img {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 8px;
          }

          .modal-close {
            position: absolute;
            top: 2rem;
            right: 2rem;
            background: var(--accent-color);
            border: none;
            color: white;
            font-size: 1.5rem;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Space Mono', monospace;
          }

          .modal-close:hover {
            background: var(--secondary-accent-color);
            transform: scale(1.1);
          }

          /* Animations */
          @keyframes blurFadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
              filter: blur(6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
              filter: blur(0px);
            }
          }

          /* Délais d'animation échelonnés */
          .gallery-item:nth-child(1) { animation-delay: 0.1s; }
          .gallery-item:nth-child(2) { animation-delay: 0.2s; }
          .gallery-item:nth-child(3) { animation-delay: 0.3s; }
          .gallery-item:nth-child(4) { animation-delay: 0.4s; }
          .gallery-item:nth-child(5) { animation-delay: 0.5s; }
          .gallery-item:nth-child(6) { animation-delay: 0.6s; }
          .gallery-item:nth-child(7) { animation-delay: 0.7s; }
          .gallery-item:nth-child(8) { animation-delay: 0.8s; }
          .gallery-item:nth-child(9) { animation-delay: 0.9s; }
          .gallery-item:nth-child(10) { animation-delay: 1.0s; }
          .gallery-item:nth-child(11) { animation-delay: 1.1s; }
          .gallery-item:nth-child(12) { animation-delay: 1.2s; }

          /* Responsive pour le masonry */
          @media (max-width: 768px) {
            body { font-size: 12px; }
            #terminal-container {
              width: 98vw;
              height: 96vh;
              padding: 10px;
            }
            .gallery-list {
              columns: 2;
            }
            .api-link {
              display: inline-block;
              margin: 4px 4px 4px 0;
            }
          }

          @media (max-width: 480px) {
            .gallery-list {
              columns: 1;
            }
            .api-link {
              display: block;
              text-align: center;
              margin: 8px 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="background-blur"></div>
        <div id="terminal-container">
          <div id="terminal-content">
            
            <div class="line command-header">miffy@guest:~# gallery --display</div>
            <div class="line success">[gallery] Interface de gestion des images</div>
            <div class="line badge-info">[status] ${badgeText}</div>
            
            ${galleryContent}
            
          </div>
        </div>

        <!-- Modal -->
        <div class="modal" id="modal" onclick="closeModal(event)">
          <button class="modal-close" onclick="closeModal()">✕</button>
          <img id="modalImage" src="" alt="">
        </div>

        <script>
          function openModal(imageSrc) {
            document.getElementById('modalImage').src = imageSrc;
            document.getElementById('modal').classList.add('active');
            document.body.style.overflow = 'hidden';
          }

          function closeModal(event) {
            if (!event || event.target.id === 'modal' || event.target.classList.contains('modal-close')) {
              document.getElementById('modal').classList.remove('active');
              document.body.style.overflow = 'auto';
            }
          }

          async function deleteImage(event, imageName) {
            event.stopPropagation();
            
            if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
              return;
            }

            try {
              const response = await fetch('/api/delete-image?name=' + imageName, {
                method: 'DELETE'
              });
              
              if (response.ok) {
                location.reload();
              } else {
                alert('Erreur lors de la suppression');
              }
            } catch (error) {
              alert('Erreur lors de la suppression');
            }
          }

          // Fermer modal avec Escape
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
          });
        </script>
      </body>
    </html>
  `);
}
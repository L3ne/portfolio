import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API - Portfolio</title>
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

          .accent-color { 
            color: var(--accent-color); 
            text-shadow: 0 0 5px var(--glow-color); 
          }

          .success { 
            color: var(--success-color); 
            text-shadow: 0 0 5px var(--success-glow-color); 
          }

          .secondary-accent-color { 
            color: var(--secondary-accent-color); 
          }

          .label {
            color: var(--secondary-accent-color);
            display: inline-block;
            width: 110px;
            white-space: nowrap;
          }

          .value {
            color: var(--text-color);
          }

          .api-link {
            color: var(--accent-color);
            text-decoration: none;
            padding: 6px 12px;
            border: 1px solid var(--accent-color);
            border-radius: 4px;
            transition: all 0.3s ease;
            display: inline-block;
            margin: 4px 8px 4px 0;
          }

          .api-link:hover {
            background: var(--accent-color);
            color: var(--bg-color);
            text-shadow: none;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(160, 96, 216, 0.3);
          }

          .api-section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: rgba(32, 24, 48, 0.3);
            backdrop-filter: blur(4px);
            opacity: 0;
            transform: translateY(20px);
            filter: blur(6px);
            animation: blurFadeIn 0.8s ease-out forwards;
          }

          .api-section:nth-child(1) { animation-delay: 0.1s; }
          .api-section:nth-child(2) { animation-delay: 0.25s; }
          .api-section:nth-child(3) { animation-delay: 0.4s; }
          .api-section:nth-child(4) { animation-delay: 0.55s; }
          .api-section:nth-child(5) { animation-delay: 0.7s; }

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

          .api-section:hover {
            border-color: rgba(160, 96, 216, 0.3);
            background: rgba(32, 24, 48, 0.5);
          }

          .api-status {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--success-color);
            margin-right: 8px;
            animation: pulse 2s infinite;
            box-shadow: 0 0 5px var(--success-glow-color);
          }

          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 var(--success-color); }
            70% { box-shadow: 0 0 0 6px rgba(88, 200, 168, 0); }
            100% { box-shadow: 0 0 0 0 rgba(88, 200, 168, 0); }
          }

          .back-link {
            color: var(--accent-color);
            text-decoration: none;
            padding: 8px 16px;
            border: 1px solid var(--accent-color);
            border-radius: 6px;
            transition: all 0.3s ease;
            display: inline-block;
            margin-top: 20px;
          }

          .back-link:hover {
            background: var(--accent-color);
            color: var(--bg-color);
            text-shadow: none;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(160, 96, 216, 0.4);
          }

          .command-header {
            font-size: 1.2em;
            margin-bottom: 15px;
            color: var(--accent-color);
            text-shadow: 0 0 5px var(--glow-color);
          }

          .endpoint-code {
            font-family: 'Space Mono', monospace;
            background: rgba(0, 0, 0, 0.3);
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
            color: var(--success-color);
            font-size: 0.9em;
          }

          @media (max-width: 768px) {
            body { font-size: 12px; }
            #terminal-container {
              width: 98vw;
              height: 96vh;
              padding: 10px;
            }
            .api-section {
              margin: 15px 0;
              padding: 12px;
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
            
            <div class="line command-header">miffy@guest:~# api --list</div>
            <div class="line success">[api] Endpoints disponibles:</div>
            
            <div class="api-section">
              <div class="line">
                <span class="api-status"></span>
                <span class="label">lastfm:</span>
                <span class="value">Dernière musique écoutée sur Last.fm</span>
              </div>
              <div class="line" style="margin-top: 8px;">
                <span class="endpoint-code">/api/lastfm</span>
                <a href="/api/lastfm" target="_blank" class="api-link">Tester l'endpoint</a>
              </div>
            </div>

            <div class="api-section">
              <div class="line">
                <span class="api-status"></span>
                <span class="label">valorant:</span>
                <span class="value">Statistiques et données Valorant</span>
              </div>
              <div class="line" style="margin-top: 8px;">
                <span class="endpoint-code">/api/valorant</span>
                <a href="/api/valorant" target="_blank" class="api-link">Tester l'endpoint</a>
              </div>
            </div>

            <div class="api-section">
              <div class="line">
                <span class="api-status"></span>
                <span class="label">upload:</span>
                <span class="value">Interface d'upload de fichiers</span>
              </div>
              <div class="line" style="margin-top: 8px;">
                <span class="endpoint-code">/api/upload</span>
                <a href="/api/upload" target="_blank" class="api-link">Accéder à l'upload</a>
              </div>
            </div>

            <div class="api-section">
              <div class="line">
                <span class="api-status"></span>
                <span class="label">gallery:</span>
                <span class="value">Galerie d'images avec effets visuels</span>
              </div>
              <div class="line" style="margin-top: 8px;">
                <span class="endpoint-code">/api/gallery</span>
                <a href="/api/gallery" target="_blank" class="api-link">Ouvrir la galerie</a>
              </div>
            </div>

            <div class="line" style="margin-top: 32px;">
              <a href="/" class="back-link">🏠 Retour au terminal</a>
            </div>
            
          </div>
        </div>
      </body>
    </html>
  `);
}
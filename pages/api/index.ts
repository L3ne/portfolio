import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Index - miffyOS</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="/styles/globals.css">
      </head>
      <body>
        <div class="background-blur"></div>
        
        <div id="terminal-container">
          <div id="terminal-content">
            
            <div class="line" style="font-size: 1.3em; margin-bottom: 20px;">
              <span class="accent-color">miffy@guest:~# api --list</span>
            </div>
            
            <div class="line success" style="margin-bottom: 25px;">
              [system] available endpoints
            </div>

            <div class="api-section" style="margin-bottom: 20px; padding: 15px; border: 1px solid var(--border-color); border-radius: 6px; background: rgba(32, 24, 48, 0.3);">
              <div class="line">
                <span class="secondary-accent-color" style="font-weight: bold;">lastfm_api</span>
              </div>
              <div class="line" style="color: var(--secondary-text-color); margin-top: 5px;">
                fetch current playing track from last.fm
              </div>
              <div class="line" style="margin-top: 12px;">
                <span style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); color: var(--success-color); font-size: 0.9em;">/api/lastfm</span>
              </div>
              <div class="line" style="margin-top: 12px;">
                <a href="/api/lastfm" target="_blank" class="api-link">test endpoint</a>
              </div>
            </div>

            <div class="api-section" style="margin-bottom: 20px; padding: 15px; border: 1px solid var(--border-color); border-radius: 6px; background: rgba(32, 24, 48, 0.3);">
              <div class="line">
                <span class="secondary-accent-color" style="font-weight: bold;">valorant_api</span>
              </div>
              <div class="line" style="color: var(--secondary-text-color); margin-top: 5px;">
                valorant stats and game data
              </div>
              <div class="line" style="margin-top: 12px;">
                <span style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); color: var(--success-color); font-size: 0.9em;">/api/valorant</span>
              </div>
              <div class="line" style="margin-top: 12px;">
                <a href="/api/valorant" target="_blank" class="api-link">test endpoint</a>
              </div>
            </div>

            <div class="api-section" style="margin-bottom: 20px; padding: 15px; border: 1px solid var(--border-color); border-radius: 6px; background: rgba(32, 24, 48, 0.3);">
              <div class="line">
                <span class="secondary-accent-color" style="font-weight: bold;">upload_interface</span>
              </div>
              <div class="line" style="color: var(--secondary-text-color); margin-top: 5px;">
                image upload system with drag and drop
              </div>
              <div class="line" style="margin-top: 12px;">
                <span style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); color: var(--success-color); font-size: 0.9em;">/api/uploadpage</span>
              </div>
              <div class="line" style="margin-top: 12px;">
                <a href="/api/uploadpage" class="api-link">open upload</a>
              </div>
            </div>

            <div class="api-section" style="margin-bottom: 20px; padding: 15px; border: 1px solid var(--border-color); border-radius: 6px; background: rgba(32, 24, 48, 0.3);">
              <div class="line">
                <span class="secondary-accent-color" style="font-weight: bold;">gallery_viewer</span>
              </div>
              <div class="line" style="color: var(--secondary-text-color); margin-top: 5px;">
                image gallery with blur fade animations
              </div>
              <div class="line" style="margin-top: 12px;">
                <span style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); color: var(--success-color); font-size: 0.9em;">/api/gallery</span>
              </div>
              <div class="line" style="margin-top: 12px;">
                <a href="/api/gallery" class="api-link">view gallery</a>
              </div>
            </div>

            <div class="line" style="margin-top: 35px;">
              <a href="/" class="api-link">back to terminal</a>
            </div>
            
          </div>
        </div>
      </body>
    </html>
  `)
}

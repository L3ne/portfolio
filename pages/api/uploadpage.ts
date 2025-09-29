import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upload - miffyOS</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="/styles/globals.css">
        <style>
          .drop-zone {
            border: 2px dashed var(--border-color);
            padding: 40px 20px;
            text-align: center;
            background-color: rgba(10, 8, 18, 0.3);
            cursor: pointer;
            transition: all 0.3s;
            margin-bottom: 20px;
            border-radius: 6px;
          }

          .drop-zone.active {
            border-color: var(--accent-color);
            background-color: rgba(160, 96, 216, 0.1);
          }

          .drop-zone:hover {
            border-color: var(--accent-color);
          }

          .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 14px;
            background-color: rgba(32, 24, 48, 0.4);
            margin-bottom: 6px;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            transition: all 0.3s;
          }

          .file-item:hover {
            background-color: rgba(32, 24, 48, 0.6);
            border-color: rgba(160, 96, 216, 0.2);
          }

          .remove-btn {
            background: none;
            border: 1px solid var(--error-color);
            color: var(--error-color);
            cursor: pointer;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.85em;
            font-family: 'Space Mono', monospace;
            transition: all 0.3s;
          }

          .remove-btn:hover {
            background: var(--error-color);
            color: white;
          }

          .upload-btn {
            color: var(--accent-color);
            text-decoration: none;
            padding: 12px 28px;
            border: 1px solid var(--accent-color);
            border-radius: 6px;
            transition: all 0.3s ease;
            display: inline-block;
            font-family: 'Space Mono', monospace;
            background: none;
            cursor: pointer;
            font-size: 1em;
          }

          .upload-btn:hover {
            background: var(--accent-color);
            color: var(--bg-color);
            text-shadow: none;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(160, 96, 216, 0.4);
          }

          .progress-bar {
            width: 100%;
            height: 22px;
            background-color: rgba(32, 24, 48, 0.5);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            overflow: hidden;
            margin-top: 10px;
          }

          .progress-fill {
            height: 100%;
            background-color: var(--accent-color);
            transition: width 0.3s;
            box-shadow: 0 0 10px var(--glow-color);
          }

          .message-box {
            padding: 12px;
            margin-bottom: 18px;
            border: 1px solid var(--border-color);
            background-color: rgba(32, 24, 48, 0.5);
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <div class="background-blur"></div>
        
        <div id="terminal-container">
          <div id="terminal-content">
            
            <div style="margin-bottom: 25px;">
              <div class="line" style="font-size: 1.3em;">
                <span class="accent-color">miffy@guest:~# upload --images</span>
              </div>
              <div class="line success" style="margin-top: 8px;">
                [system] image upload interface
              </div>
              <div class="line" style="color: var(--secondary-text-color); margin-top: 5px;">
                drag and drop or click to select files
              </div>
            </div>

            <div id="message" class="message-box" style="display: none;"></div>

            <input
              type="file"
              id="fileInput"
              accept="image/*"
              multiple
              style="display: none;"
            />
            
            <div id="dropZone" class="drop-zone">
              <div class="line" style="font-size: 2em; margin-bottom: 12px;">
                [SELECT FILES]
              </div>
              <div class="line" style="color: var(--secondary-text-color); margin-bottom: 8px;">
                click or drag files here
              </div>
              <div class="line" style="color: var(--secondary-text-color); font-size: 0.9em;">
                supported: .png .jpg .gif .webp (max 10MB)
              </div>
            </div>

            <div id="fileList" style="margin-bottom: 22px;"></div>

            <div id="uploadButton" style="text-align: center; margin-bottom: 22px; display: none;">
              <button class="upload-btn" onclick="uploadFiles()">
                upload selected images
              </button>
            </div>

            <div id="progressContainer" style="margin-bottom: 22px; display: none;">
              <div class="line" style="margin-bottom: 10px;">
                <span class="accent-color">uploading... <span id="progressText">0</span>%</span>
              </div>
              <div class="progress-bar">
                <div id="progressFill" class="progress-fill" style="width: 0%"></div>
              </div>
            </div>

            <div id="results" style="margin-bottom: 22px;"></div>

            <div style="display: flex; gap: 12px; margin-top: 35px;">
              <a href="/api/gallery" class="api-link">view gallery</a>
              <a href="/api" class="api-link">api index</a>
              <a href="/" class="api-link">terminal</a>
            </div>
            
          </div>
        </div>

        <script>
          let selectedFiles = [];
          const dropZone = document.getElementById('dropZone');
          const fileInput = document.getElementById('fileInput');
          const fileList = document.getElementById('fileList');
          const uploadButton = document.getElementById('uploadButton');
          const message = document.getElementById('message');
          const progressContainer = document.getElementById('progressContainer');
          const progressFill = document.getElementById('progressFill');
          const progressText = document.getElementById('progressText');
          const results = document.getElementById('results');

          function showMessage(text, type) {
            message.innerHTML = '<span class="' + type + '">' + text + '</span>';
            message.style.display = 'block';
            setTimeout(() => {
              message.style.display = 'none';
            }, 5000);
          }

          function handleFileSelect(files) {
            const validFiles = Array.from(files).filter(file => 
              file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
            );
            
            if (validFiles.length !== files.length) {
              showMessage((files.length - validFiles.length) + ' file(s) ignored (invalid type or size > 10MB)', 'error');
            }
            
            selectedFiles = [...selectedFiles, ...validFiles];
            updateFileList();
          }

          function removeFile(index) {
            selectedFiles.splice(index, 1);
            updateFileList();
          }

          function updateFileList() {
            if (selectedFiles.length === 0) {
              fileList.innerHTML = '';
              uploadButton.style.display = 'none';
              return;
            }

            fileList.innerHTML = '<div class="line" style="margin-bottom: 12px;"><span class="accent-color">selected_files (' + selectedFiles.length + ')</span></div>';
            
            selectedFiles.forEach((file, index) => {
              const div = document.createElement('div');
              div.className = 'file-item';
              div.innerHTML = 
                '<span><span class="success">OK</span> ' + file.name + ' <span style="color: var(--secondary-text-color); font-size: 0.9em;">(' + (file.size / (1024 * 1024)).toFixed(2) + ' MB)</span></span>' +
                '<button class="remove-btn" onclick="removeFile(' + index + ')">remove</button>';
              fileList.appendChild(div);
            });

            uploadButton.style.display = 'block';
          }

          async function uploadFiles() {
            if (selectedFiles.length === 0) return;

            uploadButton.style.display = 'none';
            progressContainer.style.display = 'block';
            results.innerHTML = '';
            message.style.display = 'none';

            const uploadResults = [];

            for (let i = 0; i < selectedFiles.length; i++) {
              const file = selectedFiles[i];
              const formData = new FormData();
              formData.append('file', file);

              try {
                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData,
                });

                if (response.ok) {
                  const result = await response.json();
                  uploadResults.push({ file: file.name, success: true, url: result.fileUrl });
                } else {
                  const error = await response.json();
                  uploadResults.push({ file: file.name, success: false, error: error.error });
                }
              } catch (error) {
                uploadResults.push({ file: file.name, success: false, error: 'Network error' });
              }

              const progress = ((i + 1) / selectedFiles.length) * 100;
              progressFill.style.width = progress + '%';
              progressText.textContent = Math.round(progress);
            }

            progressContainer.style.display = 'none';
            selectedFiles = [];
            fileList.innerHTML = '';

            const successful = uploadResults.filter(r => r.success).length;
            const failed = uploadResults.filter(r => r.success === false).length;

            if (failed === 0) {
              showMessage(successful + ' image(s) uploaded successfully', 'success');
            } else {
              showMessage('upload completed: ' + successful + ' success, ' + failed + ' failed', 'error');
            }

            let resultsHTML = '<div>';
            if (successful > 0) {
              resultsHTML += '<div class="line" style="margin-bottom: 12px;"><span class="success">[success] ' + successful + ' image' + (successful > 1 ? 's' : '') + ' uploaded</span></div>';
            }
            if (failed > 0) {
              resultsHTML += '<div class="line" style="margin-bottom: 12px;"><span class="error">[error] ' + failed + ' failed</span></div>';
            }
            resultsHTML += '<div style="margin-top: 15px;">';
            uploadResults.forEach(result => {
              if (result.success) {
                resultsHTML += '<div class="line" style="font-size: 0.9em; margin-bottom: 4px;"><span class="success">OK</span> ' + result.file + '</div>';
              } else {
                resultsHTML += '<div class="line" style="font-size: 0.9em; margin-bottom: 4px;"><span class="error">FAIL</span> ' + result.file + ' - ' + result.error + '</div>';
              }
            });
            resultsHTML += '</div></div>';
            results.innerHTML = resultsHTML;
          }

          dropZone.addEventListener('click', () => fileInput.click());

          fileInput.addEventListener('change', (e) => {
            if (e.target.files) handleFileSelect(e.target.files);
          });

          dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('active');
          });

          dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('active');
          });

          dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('active');
            if (e.dataTransfer.files) handleFileSelect(e.dataTransfer.files);
          });
        </script>
      </body>
    </html>
  `)
}

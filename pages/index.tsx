import { useEffect, useRef } from 'react'
import Head from 'next/head'

export default function Home() {
  const terminalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Code JavaScript original intégré
    const ASCII_ART_COLUMNS = 128;
    const ASCII_ART_ROWS = 45;
    const ASCII_CHAR_WIDTH_FACTOR = 0.56;
    const ASCII_EFFECTIVE_LINE_HEIGHT = 0.85;

    function generateGradientText(text: string, colors: string[]) {
      const spanContainer = document.createElement("span");

      // Convertir les couleurs hex en rgb
      function hexToRgb(hex: string) {
        let bigint = parseInt(hex.slice(1), 16);
        return {
          r: (bigint >> 16) & 255,
          g: (bigint >> 8) & 255,
          b: bigint & 255
        };
      }

      const start = hexToRgb(colors[0]);
      const end = hexToRgb(colors[1]);
      const steps = text.length;

      for (let i = 0; i < steps; i++) {
        const ratio = i / (steps - 1);
        const r = Math.round(start.r + (end.r - start.r) * ratio);
        const g = Math.round(start.g + (end.g - start.g) * ratio);
        const b = Math.round(start.b + (end.b - start.b) * ratio);

        const span = document.createElement("span");
        span.textContent = text[i];
        span.style.color = `rgb(${r},${g},${b})`;

        spanContainer.appendChild(span);
      }
      return spanContainer;
    }

    function adjustAsciiArtSize() {
      const asciiContainer = document.getElementById('welcome-ascii-art-container');
      const asciiArtEl = document.getElementById('welcome-ascii-art');

      if (!asciiContainer || !asciiArtEl) return;

      if (asciiContainer.offsetWidth <= 0 || asciiContainer.offsetHeight <= 0) {
        requestAnimationFrame(adjustAsciiArtSize);
        return;
      }

      const containerWidth = asciiContainer.offsetWidth;
      const containerHeight = asciiContainer.offsetHeight;

      let fontSizeBasedOnWidth = containerWidth / (ASCII_ART_COLUMNS * ASCII_CHAR_WIDTH_FACTOR);
      let fontSizeBasedOnHeight = containerHeight / (ASCII_ART_ROWS * ASCII_EFFECTIVE_LINE_HEIGHT);

      let newFontSize = Math.floor(Math.min(fontSizeBasedOnWidth, fontSizeBasedOnHeight));
      newFontSize = Math.max(1, newFontSize);

      if (asciiArtEl.style.fontSize !== newFontSize + 'px') {
        asciiArtEl.style.fontSize = newFontSize + 'px';
      }
    }

    function gradientText(text: string, colorStart: string, colorEnd: string) {
      function hexToRgb(hex: string) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const num = parseInt(hex, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
      }
      const start = hexToRgb(colorStart);
      const end = hexToRgb(colorEnd);
      const len = text.length;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < len; i++) {
        const ratio = len === 1 ? 0 : i / (len - 1);
        const r = Math.round(start.r + (end.r - start.r) * ratio);
        const g = Math.round(start.g + (end.g - start.g) * ratio);
        const b = Math.round(start.b + (end.b - start.b) * ratio);
        const span = document.createElement('span');
        span.textContent = text[i];
        span.style.color = `rgb(${r},${g},${b})`;
        frag.appendChild(span);
      }
      return frag;
    }

    const terminalContent = terminalContentRef.current;
    if (!terminalContent) return;

    const promptString = "miffy@guest:~# ";

    // Remplace la création du prompt par :
    const line = document.createElement("div");
    line.classList.add("line", "input-line");
    line.appendChild(gradientText(promptString, "#A060D8", "#58C8A8")); // violet → vert
    terminalContent.appendChild(line);
    let currentInputLine: HTMLDivElement | null = null;
    let currentInput: HTMLInputElement | null = null;
    let terminalInCommandMode = false;
    let dynamicInfoInterval: NodeJS.Timeout | null = null;
    const startTime = Date.now();
    
    let commandHistory: string[] = [];
    let historyIndex = -1;

    const newAsciiArt = `
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡶⠖⢶⣄⠀⠀⠀⠀⠀⠀⣠⣤⣤⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⠋⠀⠀⠀⠙⣷⠀⠀⠀⢀⡾⠋⠀⠀⠙⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢰⣿⣿⣷⣀⣀⣀⡀⠀⠀⠀⠀⣸⠇⠀⠀⠀⠀⠀⢹⡆⠀⢀⡾⠁⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⢀⣤⣶⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠈⣧⠀⢸⡇⠀⠀⠀⠀⠀⠀⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠘⢿⣿⣿⣿⣿⣿⣿⣿⣏⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀⣿⠀⣼⠃⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⣿⠀⢿⠀⠀⠀⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠻⠿⠟⠁⠀⠈⠀⠀⠀⠀⠀⠀⢿⡀⠀⠀⠀⠀⠀⠀⢻⠀⣼⡃⠀⠀⠀⠀⠀⣸⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣧⠀⠀⠀⠀⠀⠀⠈⠛⠋⠀⣠⣤⣤⣀⢀⣿⣤⡶⣦⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⠦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡀⠀⢩⣿⣿⣁⣠⣼⠇⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡾⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠛⠛⣿⡿⣿⡍⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⠟⠁⢸⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡾⠋⠀⠀⠈⢿⣇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠇⠀⠀⠀⠀⠀⣿⠷⣤⠄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⡿⠋⠙⣇⠀⠀⣶⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣾⠋⠙⠿⠀⠀⢻⣄⣀⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠿⠃⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠸⣦⡀⠀⠀⠀⣀⠈⠉⠳⣦⠀⠀⠀⢶⣄⣤⡤⠀⠀⠀⠀⠀⠀⠀⣠⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⡖⢠⡟⠉⠙⡃⠀⣻⠁⠀⠀⠛⠉⠻⠆⠀⠀⠀⠀⠀⣠⡾⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣧⡀⠛⠶⠟⠁⣠⣿⣦⣤⣀⣀⣀⣀⣀⣤⣤⣤⣶⣾⣯⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠲⠶⠶⣾⣿⣿⣿⣿⣶⣭⣽⣿⣿⣿⣿⣿⣿⢋⣬⡷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠙⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣯⡙⠛⠿⡿⠿⠿⠟⣻⠟⠀⠀⠀⠀⠀⠀⢀⣀⣀⣰⣿⡆⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠛⠙⠶⠶⠛⠁⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣷⣦⡄
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⣿⣿⣿⣿⠋⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠉⠙⠻⠟⠀⠀
`;

    const commands = {
      help: () => `
<span class="success">COMMAND MIFFY</span>
  <span class="accent-color">aboutme</span>      - display my profile.
  <span class="accent-color">projects</span>     - showcase my projects.
  <span class="accent-color">skills</span>       - list technical skills.
  <span class="accent-color">contact</span>      - contact information.
  <span class="accent-color">api</span>          - show my API endpoints.
  <span class="accent-color">clear</span>        - reset the terminal.
  <span class="accent-color">reboot</span>       - reboot miffyOS.
    `,

      aboutme: () => `
<span class="secondary-accent-color">[user_profile]</span>
  <span class="label">name:</span><span class="value"> len - 20 yo</span>
  <span class="label">title:</span><span class="value"> Fullstack Dev / Discord Bot Developer</span>
  <span class="label">focus:</span><span class="value"> automation & real-time systems</span>

  <span class="label">bio:</span><span class="value"> self-taught developer passionate about rhythm games, visual novels, Discord bots, Valorant API, osu! music tools and web apps.</span>
       <span class="value">I love building systems that feel alive, interactive and dynamic.</span>

  <span class="label">interests:</span><span class="value"> rhythm games, visual novels, coding, osu!, valorant, translating, and music.</span>
    `,

      projects: () => `
<span class="secondary-accent-color">[project_databank]</span>
  > <span class="accent-color">osu! Radio</span>
    Local osu! music player with web dashboard + dynamic Discord Rich Presence.
    stack: [nodejs, express, websocket, discord-rpc, osu!api]

  > <span class="accent-color">custom osu pp counter</span>
    Custom performance point counter for osu! (web & bot).
    stack: [js/ts, osu!api, web]

  > <span class="accent-color">webapi downloader</span>
    Minimalist web API file downloader.
    stack: [nodejs, express, fetch]

  > <span class="accent-color">valorant-stalker</span>
    Discord bot to stalk Valorant matches.
    stack: [discord.js v14, mongoDB, REST API]

  Archives: <a href="https://github.com/" target="_blank">github.com/miffy</a>
    `,

      skills: () => `
<span class="secondary-accent-color">[skillset]</span>
  <span class="label">languages:</span><span class="value"> JavaScript, TypeScript, Python, C</span>
  <span class="label">backend:</span><span class="value"> Node.js, Express, FastAPI</span>
  <span class="label">databases:</span><span class="value"> MongoDB (heavy usage)</span>
  <span class="label">expertise:</span><span class="value"> Discord bots, APIs, real-time systems, automation</span>  <span class="label">interests:</span><span class="value"> osu!, Valorant, LLM experiments, systems optimization</span>
    `,

      contact: () => `
<span class="secondary-accent-color">[contact_channels]</span>
  <span class="label">mail:</span><span class="value"> <a href="mailto:yourmail@example.com">yourmail@example.com</a></span>
  <span class="label">gh:</span><span class="value">   <a href="https://github.com/" target="_blank">github/miffy</a></span>
  <span class="label">discord:</span><span class="value"> miffy#0001</span>
  <span class="label">x:</span><span class="value"> <a href="https://x.com/" target="_blank">@miffy</a></span>
    `,

      api: () => `
<span class="secondary-accent-color">[api_endpoints]</span>
  <span class="label">lastfm:</span><span class="value"> <a href="/api/lastfm" target="_blank">/api/lastfm</a></span>
  <span class="label">valorant:</span><span class="value"> <a href="/api/valorant" target="_blank">/api/valorant</a></span>
  <span class="label">upload:</span><span class="value"> <a href="/api/upload" target="_blank">/api/upload</a></span>
  <span class="label">gallery:</span><span class="value"> <a href="/api/gallery" target="_blank">/api/gallery</a></span>
    `,

      clear: () => {
        displayWelcomeInTerminal(true);
        return "";
      },

      reboot: () => {
        runBootSequence();
        return "";
      }
    };

    function runBootSequence() {
      terminalInCommandMode = false;
      terminalContent.innerHTML = '';
      if (dynamicInfoInterval) clearInterval(dynamicInfoInterval);
      window.removeEventListener('resize', asciiArtResizeHandler);
      document.removeEventListener('keydown', handleInitialKeyPress);
      document.removeEventListener('touchstart', handleInitialKeyPress);

      const bootLines = [
        { text: 'miffyOS v7.7 (len build) bootloader initializing...', delay: 100 },
        { text: 'miffyBIOS v13.37-lts loaded.', delay: 150 },
        { text: 'verifying system integrity... <span class="success">[ok]</span>', delay: 200 },
        { text: 'loading void-len-kernel 3.14.159...', delay: 120 },
        { text: 'mounting /dev/memfs (volatile root)...', delay: 150 },
        { text: 'initializing entangled quantum-core (lenflow arch)...', delay: 200 },
        { text: 'syncing cryogenic miffy cache banks...', delay: 150 },
        { text: 'establishing hyperlane link on qlink0... <span class="success">link up (7 tbps)</span>', delay: 280 },
        { text: 'spawning daemon: len_nexus-shell...', delay: 120 },
        { text: 'boot sequence complete. welcome back, <span class="user">len</span>.', delay: 400 },
      ];

      let delay = 0;
      bootLines.forEach(line => {
        setTimeout(() => {
          const lineDiv = document.createElement('div');
          lineDiv.classList.add('line', 'boot-line');
          lineDiv.innerHTML = line.text;
          terminalContent.appendChild(lineDiv);
          terminalContent.scrollTop = terminalContent.scrollHeight;
        }, delay);
        delay += line.delay;
      });

      setTimeout(() => {
        displayWelcomeInTerminal(false);
      }, delay + 200);
    }

    function displayWelcomeInTerminal(isClearCommand: boolean) {
      terminalInCommandMode = false;
      terminalContent.innerHTML = '';
      
      const welcomeBlock = document.createElement('div');
      welcomeBlock.classList.add('welcome-block');

      const asciiContainer = document.createElement('div');
      asciiContainer.id = 'welcome-ascii-art-container';
      const asciiArtPre = document.createElement('pre');
      asciiArtPre.id = 'welcome-ascii-art';
      asciiArtPre.textContent = newAsciiArt;
      asciiContainer.appendChild(asciiArtPre);
      welcomeBlock.appendChild(asciiContainer);

      const infoDiv = document.createElement('div');
      infoDiv.classList.add('system-info-block');
      infoDiv.innerHTML = `
    <p><span class="label">SYSTEM</span>:<span class="value"> miffyOS v7.7 (len build)</span></p>
    <p><span class="label">KERNEL</span>:<span class="value"> void-len-kernel 3.14.159</span></p>
    <p><span class="label">FIRMWARE</span>:<span class="value"> miffyBIOS v13.37-lts</span></p>
    <p><span class="label">NODE_ID</span>:<span class="value"> len-nexus-01</span></p>
    <p><span class="label">UPTIME</span>:<span class="value"> <span id="uptime-value">initializing...</span></span></p>
    <p><span class="label">DISPLAY</span>:<span class="value"> <span id="resolution-value">detecting...</span> - gpu: voidGL accelerator (miffy edition)</span></p>
    <p><span class="label">CPU</span>:<span class="value"> entangled quantum-core (lenflow arch)</span></p>
    <p><span class="label">MEMORY</span>:<span class="value"> <span id="ram-total-value">777 tb</span> (cryogenic miffy cache)</span></p>
    <p><span class="label">STORAGE</span>:<span class="value"> /dev/memfs (volatile) - usage: <span id="storage-usage-value">--</span>%</span></p>
    <p><span class="label">NET_IFACE</span>:<span class="value"> qlink0: hyperlane (7 tbps) - status: <span id="network-status-value">link up</span></span></p>
    <p><span class="label">SYS_LOAD</span>:<span class="value"> <span id="cpu-load-value">--</span>%</span></p>
    <p><span class="label">DATE</span>:<span class="value"> <span id="current-date-value">--/--/----</span></span></p>
    <p><span class="label">TIME</span>:<span class="value"> <span id="current-time-value">--:--:--</span></span></p>


                `;
      welcomeBlock.appendChild(infoDiv);
      terminalContent.appendChild(welcomeBlock);

      const promptToEnter = document.createElement('p');
      promptToEnter.classList.add('prompt-to-enter');
      terminalContent.appendChild(promptToEnter);
      
      requestAnimationFrame(adjustAsciiArtSize);
      window.addEventListener('resize', asciiArtResizeHandler);
      updateDynamicWelcomeInfo();
      dynamicInfoInterval = setInterval(updateDynamicWelcomeInfo, 1000);

      if (isClearCommand) {
        switchToCommandMode();
      } else {
        typewriter(promptToEnter, `Press any key or tap screen to interface with MIFFY_OS...`, () => {
          document.addEventListener('keydown', handleInitialKeyPress, { once: true });
          document.addEventListener('touchstart', handleInitialKeyPress, { once: true });
        });
      }
      terminalContent.scrollTop = 0;
    }

    function typewriter(element: HTMLElement, text: string, callback?: () => void) {
      let i = 0;
      element.innerHTML = "";
      const cursorSpan = '<span class="type-cursor"></span>';
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          element.innerHTML = text.substring(0, i + 1) + cursorSpan;
          i++;
        } else {
          clearInterval(typingInterval);
          element.innerHTML = text;
          if (callback) callback();
        }
      }, 20);
    }
    
    function asciiArtResizeHandler() {
      if (!terminalInCommandMode) {
        requestAnimationFrame(adjustAsciiArtSize);
      }
    }
    
    function switchToCommandMode() {
      if (dynamicInfoInterval) clearInterval(dynamicInfoInterval);
      window.removeEventListener('resize', asciiArtResizeHandler);
      
      terminalContent.innerHTML = '';
      terminalInCommandMode = true;
      const helpSuggestion = document.createElement('div');
      helpSuggestion.classList.add('line', 'initial-help-message');
      helpSuggestion.innerHTML = `MIFFY_OS v7.7 Initialized. Type '<span class="success">help</span>' for command.`;
      terminalContent.appendChild(helpSuggestion);
      newPrompt();
    }

    function handleInitialKeyPress(event: Event) {
      if (event instanceof KeyboardEvent && event.key === " ") event.preventDefault();
      switchToCommandMode();
    }

    function updateDynamicWelcomeInfo() {
      const uptimeElem = document.getElementById('uptime-value');
      if (uptimeElem) {
        const diffSeconds = Math.floor((Date.now() - startTime) / 1000);
        const d = Math.floor(diffSeconds / (3600*24));
        const h = Math.floor((diffSeconds % (3600*24)) / 3600);
        const m = Math.floor((diffSeconds % 3600) / 60);
        const s = diffSeconds % 60;
        uptimeElem.textContent = `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      }

      const resolutionElem = document.getElementById('resolution-value');
      if (resolutionElem) resolutionElem.textContent = `${window.innerWidth}x${window.innerHeight} @ ${screen.colorDepth}bpp`;
      
      const storageUsageElem = document.getElementById('storage-usage-value');
      if (storageUsageElem) storageUsageElem.textContent = (Math.random() * 5 + 2).toFixed(2);
      
      const cpuLoadElem = document.getElementById('cpu-load-value');
      if (cpuLoadElem) cpuLoadElem.textContent = (Math.random() * 15 + 5).toFixed(1);

      const dateElem = document.getElementById('current-date-value');
      const timeElem = document.getElementById('current-time-value');
      if (dateElem && timeElem) {
        const now = new Date();
        dateElem.textContent = now.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
        timeElem.textContent = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      }
    }

    function appendLineToTerminal(htmlContent: string, type = 'output') {
      const lineDiv = document.createElement('div');
      lineDiv.classList.add('line');
      if (type === 'error') lineDiv.classList.add('error');
      lineDiv.innerHTML = htmlContent;
      terminalContent.appendChild(lineDiv);
      terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    function newPrompt() {
      if (!terminalInCommandMode) return;
      currentInputLine = document.createElement('div');
      currentInputLine.classList.add('line', 'input-line');
      currentInputLine.onclick = () => focusInput();

      const promptSpan = document.createElement('span');
      promptSpan.classList.add('prompt');
      promptSpan.appendChild(gradientText(promptString, "#A060D8", "#58C8A8"));
      currentInputLine.appendChild(promptSpan);
      
      const commandOutput = document.createElement('span');
      commandOutput.classList.add('command-output');
      currentInputLine.appendChild(commandOutput);

      const caret = document.createElement('span');
      caret.classList.add('caret');
      currentInputLine.appendChild(caret);
      
      currentInput = document.createElement('input');
      currentInput.type = 'text';
      currentInput.classList.add('command-input');
      currentInput.setAttribute('autocorrect', 'off');
      currentInput.setAttribute('autocapitalize', 'off');
      currentInput.setAttribute('spellcheck', 'false');
      currentInput.addEventListener('keydown', handleTerminalInput);

      currentInput.addEventListener('input', () => {
        commandOutput.textContent = currentInput!.value;
        terminalContent.scrollTop = terminalContent.scrollHeight;
      });
      
      document.body.appendChild(currentInput);
      terminalContent.appendChild(currentInputLine);
      focusInput();
      terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    function handleTerminalInput(e: KeyboardEvent) {
      if (!terminalInCommandMode || !currentInput) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        const commandStr = currentInput.value.trim();

        if (currentInputLine) {
          currentInputLine.classList.remove('input-line');
          currentInputLine.onclick = null;
          const caret = currentInputLine.querySelector('.caret');
          if (caret) caret.remove();
        }

        currentInput.remove();
        currentInput = null;

        if (commandStr) {
          commandHistory.unshift(commandStr);
          historyIndex = -1;
          processCommand(commandStr);
        }
        
        const commandName = commandStr.toLowerCase().split(' ')[0];
        if (terminalInCommandMode && commandName !== 'clear' && commandName !== 'reboot') {
          newPrompt();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          currentInput.value = commandHistory[historyIndex];
          currentInput.dispatchEvent(new Event('input'));
          currentInput.setSelectionRange(currentInput.value.length, currentInput.value.length);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          currentInput.value = commandHistory[historyIndex];
          currentInput.dispatchEvent(new Event('input'));
          currentInput.setSelectionRange(currentInput.value.length, currentInput.value.length);
        } else {
          historyIndex = -1;
          currentInput.value = "";
          currentInput.dispatchEvent(new Event('input'));
        }
      }
    }

    function processCommand(commandStr: string) {
      const [commandName, ...args] = commandStr.toLowerCase().split(' ');
      if (commands[commandName as keyof typeof commands]) {
        const output = commands[commandName as keyof typeof commands]();
        if (output) {
          appendLineToTerminal(output);
        }
      } else {
        appendLineToTerminal(`MIFFY_OS: ${commandStr.split(' ')[0]}: command not found`, 'error');
      }
    }

    function focusInput() {
      if (terminalInCommandMode && currentInput) {
        currentInput.focus();
      }
    }

    // Initialiser le terminal
    runBootSequence();

    // Cleanup function
    return () => {
      if (dynamicInfoInterval) clearInterval(dynamicInfoInterval);
      window.removeEventListener('resize', asciiArtResizeHandler);
      document.removeEventListener('keydown', handleInitialKeyPress);
      document.removeEventListener('touchstart', handleInitialKeyPress);
    };
  }, []);

  return (
    <>
      <Head>
        <title>ざくろ - len</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="background-blur"></div>
      <div id="terminal-container">
        <div id="terminal-content" ref={terminalContentRef} onClick={() => {
          const input = document.querySelector('.command-input') as HTMLInputElement;
          if (input) input.focus();
        }}>
        </div>
      </div>
    </>
  );
}
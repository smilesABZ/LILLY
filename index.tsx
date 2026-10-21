declare var JSZip: any; // Declare JSZip for TypeScript

// DOM element variables
let chatLog: HTMLDivElement | null = null;
let userInput: HTMLTextAreaElement | null = null;
let actionChipsContainer: HTMLDivElement | null = null;
let contextualActionChipsContainer: HTMLDivElement | null = null;
let emptyChatPlaceholder: HTMLDivElement | null = null;
let chatContainer: HTMLDivElement | null = null;
let geminiInputBar: HTMLDivElement | null = null;

let customContextMenu: HTMLDivElement | null = null;
let contextMenuItemsList: HTMLUListElement | null = null;
let selectedTextForContextMenu: string | null = null;

// Gallery Sidebar Elements
let galleryItemsContainer: HTMLDivElement | null = null;
let imageGallerySidebar: HTMLElement | null = null;
let galleryToggleButton: HTMLButtonElement | null = null;
let downloadAllGalleryButton: HTMLButtonElement | null = null;
let galleryCloseButton: HTMLButtonElement | null = null;
let galleryFileUpload: HTMLInputElement | null = null;
let clearGalleryBtn: HTMLButtonElement | null = null;
let galleryCountBadge: HTMLSpanElement | null = null;
let gallerySubtext: HTMLSpanElement | null = null;

// Lightbox Elements
let lightboxModal: HTMLDivElement | null = null;
let lightboxImg: HTMLImageElement | null = null;
let lightboxCaption: HTMLDivElement | null = null;
let lightboxCloseBtn: HTMLButtonElement | null = null;

// Input Image Preview Elements
let inputImagePreviewContainer: HTMLDivElement | null = null;
let inputImagePreviewThumbnail: HTMLImageElement | null = null;
let inputImagePreviewRemoveButton: HTMLButtonElement | null = null;

// Header & Settings Elements
let serverStatusPill: HTMLButtonElement | null = null;
let statusText: HTMLSpanElement | null = null;
let modelSelect: HTMLSelectElement | null = null;
let clearChatButton: HTMLButtonElement | null = null;
let serverSettingsButton: HTMLButtonElement | null = null;
let settingsModal: HTMLDivElement | null = null;
let modalCloseButton: HTMLButtonElement | null = null;
let serverUrlInput: HTMLInputElement | null = null;
let customModelInput: HTMLInputElement | null = null;
let serverApiKeyInput: HTMLInputElement | null = null;
let btnTestConnection: HTMLButtonElement | null = null;
let btnResetDefault: HTMLButtonElement | null = null;
let btnSaveSettings: HTMLButtonElement | null = null;
let statusBoxIndicator: HTMLSpanElement | null = null;
let statusBoxDetails: HTMLDivElement | null = null;
let serverEndpointDisplay: HTMLElement | null = null;
let pickLocalhost: HTMLButtonElement | null = null;
let pick127: HTMLButtonElement | null = null;
let btnPresetRouter: HTMLButtonElement | null = null;
let routeTraceCheckbox: HTMLInputElement | null = null;

// Server configuration - Default to port 13305
const DEFAULT_PORT = 13305;
const DEFAULT_SERVER_URL = `http://127.0.0.1:${DEFAULT_PORT}`;

let localServerUrl: string = localStorage.getItem('local_server_url') || DEFAULT_SERVER_URL;
if (localServerUrl === 'http://localhost:13305') {
  localServerUrl = DEFAULT_SERVER_URL;
  localStorage.setItem('local_server_url', localServerUrl);
}
let localApiKey: string = localStorage.getItem('local_api_key') || '';
let customModelName: string = localStorage.getItem('local_custom_model') || '';
let activeModel: string = localStorage.getItem('local_active_model') || '';
let enableRouteTrace: boolean = localStorage.getItem('local_route_trace') !== 'false';
let availableModels: string[] = ['collection.router'];

export interface LemonadeRouteInfo {
  route_to?: string;
  matched_rule?: string;
  default_used?: boolean;
  outputs?: any;
  trace?: Array<{
    rule?: string;
    condition?: string;
    result?: boolean;
    score?: number;
    details?: any;
  }>;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

let conversationHistory: ChatMessage[] = [
  { role: 'system', content: 'You are a helpful, capable, and concise AI assistant running on a local server.' }
];

interface ImageStyle {
  id: string;
  name: string;
  prefix: string;
  displayName: string;
}

const imageStyles: ImageStyle[] = [
  { id: "realistic", name: "📷 Realistic", prefix: "realistic photo of ", displayName: "Realistic Photo" },
  { id: "cartoon", name: "✏️ Cartoon", prefix: "old skool cartoon style drawing of ", displayName: "Old Skool Cartoon" },
  { id: "hyper", name: "✨ Hyper", prefix: "hyper realistic detailed image of ", displayName: "Hyper Realistic" },
  { id: "pixel", name: "👾 Pixel Art", prefix: "pixel art style image of ", displayName: "Pixel Art" },
  { id: "abstract", name: "🎨 Abstract", prefix: "abstract artistic interpretation of ", displayName: "Abstract Art" },
  { id: "tattoo", name: "💪 Tattoo", prefix: "Tattoo artistic interpretation of ", displayName: "Tattoo" },
  { id: "sand", name: "⛱️ Sand", prefix: "Sand art interpretation of ", displayName: "Sand" },
  { id: "fire", name: "🔥 Fire", prefix: "Fire interpretation of ", displayName: "Fire" },
  { id: "water", name: "💧 Water", prefix: "Water interpretation of ", displayName: "Water" },
  { id: "fur", name: "🦧 Fur", prefix: "Fur interpretation of ", displayName: "Fur" },
];

interface ContextualAction {
  label: string;
  prompt: string;
  ariaLabel: string;
}

const contextualActionPrompts: ContextualAction[] = [
  { label: "🖼️ Describe", prompt: "Describe this image in detail.", ariaLabel: "Describe this image" },
  { label: "🤔 Explain", prompt: "Explain what is happening in this image.", ariaLabel: "Explain this image" },
  { label: "📝 Summarize", prompt: "Summarize this image concisely.", ariaLabel: "Summarize this image" },
  { label: "❓ Questions", prompt: "Suggest three interesting questions I could ask about this image.", ariaLabel: "Suggest questions about this image" },
  { label: "💡 Ideas", prompt: "Generate creative ideas based on this image.", ariaLabel: "Generate ideas from this image" },
];

export interface GalleryImageInfo {
  id: string;
  imageUrl: string;
  prompt: string;
  basePrompt: string;
  modelName: string;
  generationTime: string;
  styleApplied: string;
}

const MAX_GALLERY_ITEMS = 40;
const GALLERY_STORAGE_KEY = 'local_ai_gallery_v2';
function generateChatTimeline(): string {
  if (!chatLog) return "No chat history found.";

  let timeline = "# LILLY Session Timeline\n\n";
  const timestamp = new Date().toLocaleString();
  timeline += `**Exported:** ${timestamp}\n\n---\n\n`;

  const messages = chatLog.children;

  Array.from(messages).forEach((msg, index) => {
    const isUser = msg.classList.contains('user-message') || msg.classList.contains('user-image-request-message');
    const role = isUser ? "👤 User" : "⚡ LILLY";

    // Clone the node to safely remove buttons and trace containers from the text log
    const clone = msg.cloneNode(true) as HTMLElement;
    const interactiveElements = clone.querySelectorAll('button, .chat-image-actions, .route-trace-container');
    interactiveElements.forEach(el => el.remove());

    const textContent = clone.textContent?.trim() || "";

    timeline += `### Step ${index + 1}: ${role}\n`;
    if (textContent) {
      timeline += `${textContent}\n\n`;
    }

    // Flag if the original message contained an image
    if (msg.querySelector('img')) {
      timeline += `*[Image Attachment/Generation present in this step]*\n\n`;
    }

    timeline += `---\n\n`;
  });

  return timeline;
}
function loadGalleryFromStorage(): GalleryImageInfo[] {
  try {
    const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Failed to load gallery from storage:", e);
  }
  return [];
}

let galleryItems: GalleryImageInfo[] = loadGalleryFromStorage();
let stagedImageForChat: { dataUrl: string; mimeType: string } | null = null;

function saveGalleryToStorage() {
  try {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(galleryItems.slice(0, MAX_GALLERY_ITEMS)));
  } catch (e) {
    console.warn("Storage quota limit or error saving gallery:", e);
  }
}

// Helper to get alternate loopback (localhost <-> 127.0.0.1)
function getAlternateUrl(url: string): string {
  if (url.includes('localhost')) {
    return url.replace('localhost', '127.0.0.1');
  }
  if (url.includes('127.0.0.1')) {
    return url.replace('127.0.0.1', 'localhost');
  }
  return url;
}

// Robust request sender: handles JSON responses or binary image responses
async function sendLocalRequest(endpoint: string, payload: any): Promise<any> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const baseCandidates = [
    localServerUrl.replace(/\/+$/, ''),
    getAlternateUrl(localServerUrl.replace(/\/+$/, ''))
  ];

  let lastError: any = null;

  for (const base of baseCandidates) {
    const fullUrl = `${base}${cleanEndpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (localApiKey) {
      headers['Authorization'] = `Bearer ${localApiKey}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        if (base !== localServerUrl) {
          localServerUrl = base;
          localStorage.setItem('local_server_url', localServerUrl);
          if (serverEndpointDisplay) serverEndpointDisplay.textContent = localServerUrl;
        }

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('image/')) {
          const blob = await res.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ data: [{ b64_json: reader.result as string }] });
            reader.readAsDataURL(blob);
          });
        }

        const data = await res.json();
        const routeHeader = res.headers.get('x-lemonade-route');
        if (routeHeader && typeof data === 'object' && data !== null) {
          data._lemonadeRouteHeader = routeHeader;
        }
        return data;
      } else {
        const errText = await res.text().catch(() => res.statusText);
        lastError = new Error(`Server status ${res.status}: ${errText}`);
      }
    } catch (err: any) {
      lastError = err;

      // Also try with text/plain (avoids CORS preflight in some browser configurations)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        const res = await fetch(fullUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          if (base !== localServerUrl) {
            localServerUrl = base;
            localStorage.setItem('local_server_url', localServerUrl);
            if (serverEndpointDisplay) serverEndpointDisplay.textContent = localServerUrl;
          }
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('image/')) {
            const blob = await res.blob();
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve({ data: [{ b64_json: reader.result as string }] });
              reader.readAsDataURL(blob);
            });
          }
          const data = await res.json();
          const routeHeader = res.headers.get('x-lemonade-route');
          if (routeHeader && typeof data === 'object' && data !== null) {
            data._lemonadeRouteHeader = routeHeader;
          }
          return data;
        }
      } catch {
        // continue
      }
    }
  }

  throw lastError || new Error(`Could not connect to port 13305 (${localServerUrl})`);
}

// Extract chat reply from response across formats
function extractChatReply(data: any): string {
  if (!data) return '';
  if (data.choices && data.choices[0]) {
    const c = data.choices[0];
    if (c.message && c.message.content) return c.message.content;
    if (c.text) return c.text;
  }
  if (data.message && data.message.content) return data.message.content;
  if (typeof data.response === 'string') return data.response;
  if (typeof data.content === 'string') return data.content;
  if (typeof data.text === 'string') return data.text;
  return typeof data === 'string' ? data : JSON.stringify(data);
}

export function cleanImageUrl(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('data:image/')) {
    return trimmed.replace(/\s+/g, '');
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    const base = localServerUrl.replace(/\/+$/, '');
    return `${base}${trimmed}`;
  }
  if (/^[A-Za-z0-9+/=\s\r\n]{100,}$/.test(trimmed)) {
    return `data:image/png;base64,${trimmed.replace(/\s+/g, '')}`;
  }
  return trimmed;
}

export function findAllImagesInText(text: string): Array<{ alt: string; url: string }> {
  const images: Array<{ alt: string; url: string }> = [];
  if (!text) return images;

  // 1. Markdown image syntax: ![alt](url)
  const mdRegex = /!\[(.*?)\]\(\s*([^\s)]+)\s*\)/g;
  let match;
  while ((match = mdRegex.exec(text)) !== null) {
    const url = cleanImageUrl(match[2]);
    if (url && !images.some(i => i.url === url)) {
      images.push({ alt: match[1] || 'Generated image', url });
    }
  }

  // 2. HTML <img> tags
  const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = imgTagRegex.exec(text)) !== null) {
    const url = cleanImageUrl(match[1]);
    if (url && !images.some(i => i.url === url)) {
      images.push({ alt: 'Generated image', url });
    }
  }

  // 3. Standalone data:image URL in text
  const dataUrlRegex = /data:image\/[a-zA-Z0-9.+_-]+;base64,[A-Za-z0-9+/=\s\r\n]{50,}/g;
  while ((match = dataUrlRegex.exec(text)) !== null) {
    const url = cleanImageUrl(match[0]);
    if (url && !images.some(i => i.url === url)) {
      images.push({ alt: 'Generated visual', url });
    }
  }

  return images;
}

// Robust image extraction covering all OpenAI, Lemonade, SD WebUI, ComfyUI, Stability schemas
export function extractImageResult(data: any): string | null {
  if (!data) return null;

  // Format 1: Direct string (data URL, markdown image, img tag, or URL)
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.startsWith('data:image/')) {
      return trimmed.replace(/\s+/g, '');
    }
    const dataUrlMatch = trimmed.match(/data:image\/[a-zA-Z0-9.+_-]+;base64,[A-Za-z0-9+/=\s\r\n]+/);
    if (dataUrlMatch) {
      return dataUrlMatch[0].replace(/\s+/g, '');
    }
    const mdImgMatch = trimmed.match(/!\[.*?\]\(\s*([^\s)]+)\s*\)/);
    if (mdImgMatch && mdImgMatch[1]) {
      return cleanImageUrl(mdImgMatch[1]);
    }
    const htmlImgMatch = trimmed.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (htmlImgMatch && htmlImgMatch[1]) {
      return cleanImageUrl(htmlImgMatch[1]);
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (/^[A-Za-z0-9+/=\s\r\n]{200,}$/.test(trimmed)) {
      return `data:image/png;base64,${trimmed.replace(/\s+/g, '')}`;
    }
  }

  // Format 2: OpenAI data array: [ { b64_json: "..." } ] or [ { url: "..." } ]
  if (Array.isArray(data.data) && data.data.length > 0) {
    const first = data.data[0];
    if (typeof first === 'string') {
      return cleanImageUrl(first);
    }
    if (first && typeof first === 'object') {
      if (first.b64_json) {
        const clean = String(first.b64_json).replace(/\s+/g, '');
        return clean.startsWith('data:') ? clean : `data:image/png;base64,${clean}`;
      }
      if (first.base64) {
        const clean = String(first.base64).replace(/\s+/g, '');
        return clean.startsWith('data:') ? clean : `data:image/png;base64,${clean}`;
      }
      if (first.image) {
        return cleanImageUrl(first.image);
      }
      if (first.image_base64) {
        const clean = String(first.image_base64).replace(/\s+/g, '');
        return clean.startsWith('data:') ? clean : `data:image/png;base64,${clean}`;
      }
      if (first.url) {
        return cleanImageUrl(first.url);
      }
    }
  }

  // Format 3: images array (SD WebUI / Lemonade direct)
  if (Array.isArray(data.images) && data.images.length > 0) {
    const img = data.images[0];
    if (typeof img === 'string') {
      return cleanImageUrl(img);
    }
    if (img && typeof img === 'object') {
      if (img.url) return cleanImageUrl(img.url);
      if (img.b64_json || img.base64) {
        const b = String(img.b64_json || img.base64).replace(/\s+/g, '');
        return b.startsWith('data:') ? b : `data:image/png;base64,${b}`;
      }
    }
  }

  // Format 4: Chat completion choices with images or markdown image in content
  if (Array.isArray(data.choices) && data.choices[0]) {
    const choice = data.choices[0];
    if (choice.message && Array.isArray(choice.message.images) && choice.message.images.length > 0) {
      return cleanImageUrl(choice.message.images[0]);
    }
    const content = choice.message?.content || choice.text || '';
    if (typeof content === 'string') {
      const extracted = extractImageResult(content);
      if (extracted) return extracted;
    }
  }

  // Format 5: output array or string (Replicate, ComfyUI)
  if (Array.isArray(data.output) && data.output.length > 0) {
    return cleanImageUrl(data.output[0]);
  }
  if (typeof data.output === 'string') {
    return cleanImageUrl(data.output);
  }

  // Format 6: single image string
  if (typeof data.image === 'string') {
    return cleanImageUrl(data.image);
  }

  // Format 7: Stability AI artifacts
  if (Array.isArray(data.artifacts) && data.artifacts[0] && data.artifacts[0].base64) {
    const clean = String(data.artifacts[0].base64).replace(/\s+/g, '');
    return `data:image/png;base64,${clean}`;
  }

  // Format 8: direct array
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    if (typeof first === 'string') {
      return cleanImageUrl(first);
    }
    if (first && typeof first === 'object') {
      return extractImageResult({ data });
    }
  }

  return null;
}

// Silent background probe for model discovery
async function probeModelsSilently() {
  const probeUrls = [localServerUrl, getAlternateUrl(localServerUrl)];
  for (const base of probeUrls) {
    try {
      let res = await fetch(`${base.replace(/\/+$/, '')}/api/v1/models`);
      if (!res.ok) {
        res = await fetch(`${base.replace(/\/+$/, '')}/v1/models`);
      }
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data.data) ? data.data : (Array.isArray(data.models) ? data.models : []);
        if (list.length > 0) {
          availableModels = list.map((m: any) => m.id || m.name || String(m));
          if (!customModelName && availableModels.length > 0 && (!activeModel || activeModel === 'default')) {
            activeModel = availableModels[0];
            localStorage.setItem('local_active_model', activeModel);
          }
          updateModelDropdown();
          if (activeModel && activeModel !== 'default') {
            updateStatusPill('connected', `Port 13305 (${activeModel})`);
          }
        }
        break;
      }
    } catch {
      // Keep going silently
    }
  }
}

function updateStatusPill(status: 'connected' | 'checking' | 'disconnected', label: string) {
  if (serverStatusPill && statusText) {
    serverStatusPill.className = `server-status-pill ${status}`;
    statusText.textContent = label;
  }
}

function updateModelDropdown() {
  if (!modelSelect) return;
  modelSelect.innerHTML = '';

  const modelsToShow = customModelName ? [customModelName, ...availableModels.filter(m => m !== customModelName)] : availableModels;
  if (modelsToShow.length === 0) {
    modelsToShow.push('default');
  }

  modelsToShow.forEach(model => {
    const opt = document.createElement('option');
    opt.value = model;
    opt.textContent = model;
    if (model === (customModelName || activeModel)) {
      opt.selected = true;
    }
    modelSelect!.appendChild(opt);
  });
}

function checkChatEmpty() {
  if (chatLog && emptyChatPlaceholder && chatContainer) {
    if (chatLog.children.length === 0) {
      emptyChatPlaceholder.style.display = 'flex';
      chatContainer.style.display = 'none';
    } else {
      emptyChatPlaceholder.style.display = 'none';
      chatContainer.style.display = 'flex';
    }
  }
}

interface AddUserMessageOptions {
  isImageRequest?: boolean;
  imageRequestId?: string;
  contextImageUrl?: string;
}

function addUserMessage(message: string, options: AddUserMessageOptions = {}): void {
  if (chatLog) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    if (options.isImageRequest) {
      messageElement.classList.add('user-image-request-message');
      if (options.imageRequestId) {
        messageElement.setAttribute('data-image-request-id', options.imageRequestId);
      }
    } else if (options.contextImageUrl) {
      messageElement.classList.add('user-message', 'user-message-with-context-image');
      const img = document.createElement('img');
      img.src = options.contextImageUrl;
      img.alt = "User provided image context";
      img.classList.add('user-prompt-image-thumbnail');
      messageElement.appendChild(img);
    } else {
      messageElement.classList.add('user-message');
    }

    const textElement = document.createElement('p');
    textElement.textContent = message;
    messageElement.appendChild(textElement);

    chatLog.appendChild(messageElement);
    scrollToBottom();
    checkChatEmpty();
  }
}

// Lightbox controller
function openLightbox(imageUrl: string, captionText: string = ''): void {
  if (lightboxModal && lightboxImg) {
    lightboxImg.src = imageUrl;
    if (lightboxCaption) lightboxCaption.textContent = captionText;
    lightboxModal.style.display = 'flex';
  }
}

function closeLightbox(): void {
  if (lightboxModal) {
    lightboxModal.style.display = 'none';
  }
}

// Add bot message with automatic image detection, gallery landing, and router policy trace
function addBotMessage(
  message: string,
  isThinking: boolean = false,
  isImageConfirmation: boolean = false,
  imageConfirmationId?: string,
  routeInfo?: LemonadeRouteInfo | string
): HTMLDivElement | null {
  if (!chatLog) return null;

  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'bot-message');
  if (isThinking) {
    messageElement.classList.add('thinking-message');
  }
  if (isImageConfirmation && imageConfirmationId) {
    messageElement.setAttribute('data-bot-image-confirmation-id', imageConfirmationId);
  }

  // Scan for ALL embedded images in message (markdown, img tags, data URLs, etc.)
  const foundImages = findAllImagesInText(message);

  // Clean text by stripping markdown images & huge raw base64 data strings for display
  let formatted = message
    .replace(/!\[(.*?)\]\(\s*[^\s)]+\s*\)/g, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/data:image\/[a-zA-Z0-9.+_-]+;base64,[A-Za-z0-9+/=\s\r\n]{50,}/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n/g, '<br>');

  const textNode = document.createElement('div');
  textNode.innerHTML = formatted.trim() ? formatted : (foundImages.length > 0 ? '🎨 <strong>Generated Image:</strong>' : '');
  messageElement.appendChild(textNode);

  // If images were embedded in chat reply, render each and guarantee landing in gallery!
  if (foundImages.length > 0) {
    foundImages.forEach((imgObj) => {
      const imgContainer = document.createElement('div');
      imgContainer.style.marginTop = '8px';

      const img = document.createElement('img');
      img.src = imgObj.url;
      img.alt = imgObj.alt;
      img.style.maxWidth = '100%';
      img.style.borderRadius = '8px';
      img.style.display = 'block';
      img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => openLightbox(imgObj.url, imgObj.alt));
      imgContainer.appendChild(img);

      // Add to gallery automatically
      const galleryItem: GalleryImageInfo = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        imageUrl: imgObj.url,
        prompt: imgObj.alt,
        basePrompt: imgObj.alt,
        modelName: `${customModelName || activeModel || 'local-server'} (port 13305)`,
        generationTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        styleApplied: "Chat Output",
      };
      addOrUpdateGallery(galleryItem, galleryItem.id);

      // Action buttons
      const actionsRow = document.createElement('div');
      actionsRow.className = 'chat-image-actions';

      const btnOpenGallery = document.createElement('button');
      btnOpenGallery.className = 'chat-image-action-btn';
      btnOpenGallery.innerHTML = '🖼️ View in Gallery';
      btnOpenGallery.addEventListener('click', () => openGallerySidebar());
      actionsRow.appendChild(btnOpenGallery);

      const btnDownload = document.createElement('button');
      btnDownload.className = 'chat-image-action-btn';
      btnDownload.innerHTML = '⬇️ Download Card';
      btnDownload.addEventListener('click', () => downloadSingleCard(galleryItem));
      actionsRow.appendChild(btnDownload);

      imgContainer.appendChild(actionsRow);
      messageElement.appendChild(imgContainer);
    });
  }

  // Render Lemonade Router Policy info if present
  if (routeInfo) {
    const routeContainer = document.createElement('div');
    routeContainer.className = 'route-trace-container';

    let matchedRule = '';
    let targetModel = '';
    let defaultUsed = false;
    let traceDetails = '';

    if (typeof routeInfo === 'string') {
      matchedRule = routeInfo;
    } else if (typeof routeInfo === 'object') {
      matchedRule = routeInfo.matched_rule || '';
      targetModel = routeInfo.route_to || '';
      defaultUsed = !!routeInfo.default_used;
      traceDetails = JSON.stringify(routeInfo.trace || routeInfo, null, 2);
    }

    const detailsEl = document.createElement('details');
    detailsEl.className = 'route-trace-details';

    const summaryEl = document.createElement('summary');
    summaryEl.className = 'route-trace-summary';

    let summaryHtml = `🔀 <strong>Lemonade Route:</strong> `;
    if (matchedRule) {
      summaryHtml += `<span class="route-tag-pill">Rule: ${matchedRule}</span>`;
    }
    if (targetModel) {
      summaryHtml += ` ➔ <span class="route-dest-pill">Target: ${targetModel}</span>`;
    }
    if (defaultUsed && !matchedRule) {
      summaryHtml += `<span class="route-tag-pill">Default Policy</span>`;
    }
    summaryEl.innerHTML = summaryHtml;
    detailsEl.appendChild(summaryEl);

    if (traceDetails) {
      const bodyEl = document.createElement('div');
      bodyEl.className = 'route-trace-body';
      bodyEl.textContent = traceDetails;
      detailsEl.appendChild(bodyEl);
    }

    routeContainer.appendChild(detailsEl);
    messageElement.appendChild(routeContainer);
  }

  chatLog.appendChild(messageElement);
  scrollToBottom();
  checkChatEmpty();
  return messageElement;
}

// Render dedicated generated image message in chat
function addBotImageMessage(imageUrl: string, prompt: string, style: string, galleryItem?: GalleryImageInfo): HTMLDivElement | null {
  if (!chatLog) return null;

  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'bot-message', 'image-message');

  const desc = document.createElement('p');
  desc.innerHTML = `🖼️ <strong>Generated (${style}):</strong> <span>${prompt}</span>`;
  messageElement.appendChild(desc);

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = prompt;
  img.style.maxWidth = '100%';
  img.style.borderRadius = '8px';
  img.style.marginTop = '8px';
  img.style.display = 'block';
  img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  img.style.cursor = 'pointer';
  img.title = "Click to enlarge";
  img.addEventListener('click', () => openLightbox(imageUrl, `${style}: ${prompt}`));
  messageElement.appendChild(img);

  // Action buttons
  const actionsRow = document.createElement('div');
  actionsRow.className = 'chat-image-actions';

  const btnOpenGallery = document.createElement('button');
  btnOpenGallery.className = 'chat-image-action-btn';
  btnOpenGallery.innerHTML = '📂 Saved in Gallery';
  btnOpenGallery.addEventListener('click', () => openGallerySidebar());
  actionsRow.appendChild(btnOpenGallery);

  if (galleryItem) {
    const btnDownload = document.createElement('button');
    btnDownload.className = 'chat-image-action-btn';
    btnDownload.innerHTML = '⬇️ Download Card';
    btnDownload.addEventListener('click', () => downloadSingleCard(galleryItem));
    actionsRow.appendChild(btnDownload);
  }

  messageElement.appendChild(actionsRow);

  chatLog.appendChild(messageElement);
  scrollToBottom();
  checkChatEmpty();
  return messageElement;
}

function extractBase64Data(dataUrl: string): { base64: string; mimeType: string } | null {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
  if (match && match.length === 3) {
    return { mimeType: match[1], base64: match[2] };
  }
  if (!dataUrl.startsWith('data:')) {
    const looksLikeBase64 = /^[A-Za-z0-9+/=]+$/.test(dataUrl);
    if (looksLikeBase64) return { mimeType: 'image/jpeg', base64: dataUrl };
  }
  return null;
}

function getCardHTMLContent(item: GalleryImageInfo, localImageName: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Image Card: ${item.basePrompt}</title>
        <style>
            body { font-family: -apple-system, sans-serif; margin: 20px; background-color: #f4f4f4; color: #222; }
            .card { background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .card img { max-width: 100%; height: auto; border-radius: 6px; margin-bottom: 15px; display: block; }
            .metadata p { margin: 6px 0; font-size: 0.95rem; }
            .metadata strong { color: #111; }
        </style>
    </head>
    <body>
        <div class="card">
            <img src="${localImageName}" alt="Generated image for prompt: ${item.basePrompt}">
            <div class="metadata">
                <p><strong>Prompt:</strong> ${item.basePrompt}</p>
                <p><strong>Style:</strong> ${item.styleApplied}</p>
                <p><strong>Model / Server:</strong> ${item.modelName}</p>
                <p><strong>Generated:</strong> ${item.generationTime}</p>
                <p><strong>Full Prompt Used:</strong> ${item.prompt}</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

async function downloadSingleCard(item: GalleryImageInfo) {
  const zip = new JSZip();
  const extracted = extractBase64Data(item.imageUrl);
  let localImageName = "image.jpeg";
  if (extracted && extracted.mimeType) {
    const ext = extracted.mimeType.split('/')[1] || 'jpeg';
    localImageName = `image.${ext}`;
  }

  const cardHtmlContent = getCardHTMLContent(item, localImageName);
  zip.file("card_info.html", cardHtmlContent);

  if (extracted) {
    zip.file(localImageName, extracted.base64, { base64: true });
  }

  try {
    const content = await zip.generateAsync({ type: "blob" });
    const safeStyle = item.styleApplied.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const safePrompt = item.basePrompt.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `card_${safeStyle}_${safePrompt}_${item.id}.zip`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  } catch (e) {
    console.error("Error generating zip file:", e);
    addBotMessage("⚠️ Sorry, there was an error creating the card archive.");
  }
}

function renderImageCard(item: GalleryImageInfo, isJustAdded: boolean = false): HTMLElement {
  const card = document.createElement('div');
  card.classList.add('image-card');
  if (isJustAdded) {
    card.classList.add('card-just-added');
  }
  card.setAttribute('role', 'listitem');
  card.setAttribute('data-card-id', item.id);

  // Image preview area
  const imagePreview = document.createElement('div');
  imagePreview.classList.add('card-image-preview');
  imagePreview.title = "Click to enlarge";
  imagePreview.addEventListener('click', () => {
    openLightbox(item.imageUrl, `${item.styleApplied}: ${item.basePrompt}`);
  });

  const img = document.createElement('img');
  img.src = item.imageUrl;
  img.alt = `Generated image for prompt: ${item.basePrompt}`;
  img.draggable = true;
  img.addEventListener('dragstart', (event) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify({ imageUrl: item.imageUrl, id: item.id }));
      event.dataTransfer.effectAllowed = 'copy';
    }
  });
  imagePreview.appendChild(img);

  // Hover overlay with quick actions
  const overlay = document.createElement('div');
  overlay.className = 'card-image-overlay';

  const viewBtn = document.createElement('button');
  viewBtn.className = 'overlay-btn';
  viewBtn.title = "Enlarge Image";
  viewBtn.innerHTML = '🔍';
  viewBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightbox(item.imageUrl, `${item.styleApplied}: ${item.basePrompt}`);
  });
  overlay.appendChild(viewBtn);

  const stageBtn = document.createElement('button');
  stageBtn.className = 'overlay-btn';
  stageBtn.title = "Use as Context for Chat";
  stageBtn.innerHTML = '💬';
  stageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const extracted = extractBase64Data(item.imageUrl);
    if (extracted) {
      showStagedImagePreview(item.imageUrl, extracted.mimeType);
    }
  });
  overlay.appendChild(stageBtn);

  imagePreview.appendChild(overlay);
  card.appendChild(imagePreview);

  // Metadata
  const metadata = document.createElement('div');
  metadata.classList.add('card-metadata');

  const promptField = document.createElement('div');
  promptField.classList.add('metadata-field');
  promptField.innerHTML = `<strong>Prompt:</strong> <span>${item.basePrompt}</span>`;
  metadata.appendChild(promptField);

  const styleField = document.createElement('div');
  styleField.classList.add('metadata-field');
  styleField.innerHTML = `<strong>Style:</strong> <span>${item.styleApplied}</span>`;
  metadata.appendChild(styleField);

  const modelField = document.createElement('div');
  modelField.classList.add('metadata-field');
  modelField.innerHTML = `<strong>Server:</strong> <span>${item.modelName}</span>`;
  metadata.appendChild(modelField);

  const timeField = document.createElement('div');
  timeField.classList.add('metadata-field');
  timeField.innerHTML = `<strong>Time:</strong> <span>${item.generationTime}</span>`;
  metadata.appendChild(timeField);

  // Card Actions (Download ZIP & Delete)
  const actionsRow = document.createElement('div');
  actionsRow.className = 'card-actions-row';

  const downloadButton = document.createElement('button');
  downloadButton.classList.add('download-image-button');
  downloadButton.textContent = '⬇️ Download Card';
  downloadButton.setAttribute('aria-label', `Download card for prompt: ${item.basePrompt}`);
  downloadButton.addEventListener('click', () => downloadSingleCard(item));
  actionsRow.appendChild(downloadButton);

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-card-button');
  deleteButton.textContent = '🗑️';
  deleteButton.title = "Delete this card from gallery";
  deleteButton.setAttribute('aria-label', "Delete this image from gallery");
  deleteButton.addEventListener('click', () => {
    deleteGalleryItem(item.id);
  });
  actionsRow.appendChild(deleteButton);

  metadata.appendChild(actionsRow);
  card.appendChild(metadata);

  return card;
}

function deleteGalleryItem(id: string) {
  galleryItems = galleryItems.filter(item => item.id !== id);
  saveGalleryToStorage();
  addOrUpdateGallery();
}

function clearAllGalleryItems() {
  if (galleryItems.length === 0) return;
  if (confirm("Are you sure you want to clear all images from your gallery?")) {
    galleryItems = [];
    saveGalleryToStorage();
    addOrUpdateGallery();
  }
}

export function addOrUpdateGallery(item?: GalleryImageInfo, justAddedId?: string) {
  if (item) {
    // Avoid duplicate IDs or exact URLs
    galleryItems = galleryItems.filter(g => g.id !== item.id && g.imageUrl !== item.imageUrl);
    galleryItems.unshift(item);
    if (galleryItems.length > MAX_GALLERY_ITEMS) {
      galleryItems.pop();
    }
    saveGalleryToStorage();
  }

  // Update header badge and sidebar subtext
  if (galleryCountBadge) {
    galleryCountBadge.textContent = String(galleryItems.length);
  }
  if (gallerySubtext) {
    gallerySubtext.textContent = `${galleryItems.length} image${galleryItems.length === 1 ? '' : 's'} saved`;
  }

  if (!galleryItemsContainer) return;

  galleryItemsContainer.innerHTML = '';
  if (galleryItems.length === 0) {
    galleryItemsContainer.innerHTML = `
      <div class="gallery-empty-hint">
        <div style="font-size: 1.8rem; margin-bottom: 6px;">🖼️</div>
        <strong>No images in gallery yet</strong>
        <p style="margin: 6px 0 0 0; font-size: 0.8rem; line-height: 1.4;">
          Generated images, chat images, and dropped images will appear here.
        </p>
      </div>`;
    if (downloadAllGalleryButton) downloadAllGalleryButton.disabled = true;
  } else {
    galleryItems.forEach(galleryItem => {
      const isJustAdded = justAddedId === galleryItem.id;
      const cardElement = renderImageCard(galleryItem, isJustAdded);
      galleryItemsContainer!.appendChild(cardElement);
    });
    if (downloadAllGalleryButton) downloadAllGalleryButton.disabled = false;
  }

  // When a new image is added, automatically open the sidebar and scroll to top!
  if (item) {
    openGallerySidebar();
    if (galleryItemsContainer) {
      galleryItemsContainer.scrollTop = 0;
    }
  }
}

// Local image generation using port 13305 with multi-payload fallback and Lemonade router policy
async function generateImageWithPrompt(basePrompt: string, fullPrompt: string, styleApplied: string = "Direct Prompt", imageRequestId?: string): Promise<void> {
  const modelToUse = customModelName || activeModel || 'default';
  const thinkingMessage = addBotMessage(`🎨 Generating image for "${basePrompt}" (${styleApplied}) on port 13305...`, true);

  const effectiveModel = customModelName || activeModel;
  const basePayload: any = { prompt: fullPrompt };
  if (effectiveModel && effectiveModel !== 'default') {
    basePayload.model = effectiveModel;
  }

  // Support varying local model capabilities and Lemonade diffusion endpoints
  const payloadCandidates = [
    { ...basePayload, width: 1024, height: 1024, steps: 20, cfg_scale: 7.0, response_format: "b64_json" },
    { ...basePayload, n: 1, size: "1024x1024", response_format: "b64_json" },
    { ...basePayload, n: 1, size: "512x512", response_format: "b64_json" },
    { ...basePayload, n: 1, response_format: "b64_json" },
    { ...basePayload }
  ];

  const imageEndpoints = ['/api/v1/images/generations', '/v1/images/generations', '/images/generations'];
  let imageResultUrl: string | null = null;
  let lastError: any = null;
  let routeInfo: any = null;

  endpointLoop: for (const endpoint of imageEndpoints) {
    for (const payload of payloadCandidates) {
      try {
        const data = await sendLocalRequest(endpoint, payload);
        routeInfo = data.x_lemonade_route || data._lemonadeRouteHeader;
        imageResultUrl = extractImageResult(data);
        if (imageResultUrl) break endpointLoop;
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  // Fallback: If dedicated image endpoint returned error, attempt routing via chat completions
  if (!imageResultUrl) {
    const chatEndpoints = ['/v1/chat/completions', '/api/v1/chat/completions'];
    for (const endpoint of chatEndpoints) {
      try {
        const fallbackChatPayload: any = {
          messages: [{ role: 'user', content: `Generate image: ${fullPrompt}` }],
          temperature: 0.7,
        };
        if (effectiveModel && effectiveModel !== 'default') {
          fallbackChatPayload.model = effectiveModel;
        } else {
          fallbackChatPayload.model = 'collection.router';
        }
        if (enableRouteTrace) {
          fallbackChatPayload.route_trace = true;
        }

        const data = await sendLocalRequest(endpoint, fallbackChatPayload);
        routeInfo = data.x_lemonade_route || data._lemonadeRouteHeader;
        imageResultUrl = extractImageResult(data);
        if (imageResultUrl) break;
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  if (thinkingMessage && thinkingMessage.parentNode) {
    thinkingMessage.parentNode.removeChild(thinkingMessage);
  }

  if (imageResultUrl) {
    const cardId = Date.now().toString();
    const galleryItem: GalleryImageInfo = {
      id: cardId,
      imageUrl: imageResultUrl,
      prompt: fullPrompt,
      basePrompt: basePrompt,
      modelName: `${effectiveModel || 'local-server'} (port 13305)`,
      generationTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      styleApplied: styleApplied,
    };

    // Render image in chat
    addBotImageMessage(imageResultUrl, basePrompt, styleApplied, galleryItem);

    // CRITICAL: Guarantee immediate landing in image gallery and open sidebar!
    addOrUpdateGallery(galleryItem, cardId);

    if (imageRequestId && chatLog) {
      const userMessageToRemove = chatLog.querySelector(`[data-image-request-id="${imageRequestId}"]`);
      if (userMessageToRemove) userMessageToRemove.remove();
    }
    checkChatEmpty();
  } else {
    const errMsg = lastError?.message || 'Server returned no image';
    addBotMessage(`⚠️ Image generation failed on port 13305: ${errMsg}`, false, false, undefined, routeInfo);
  }
}

const legacyImageTriggers = ["generate image:", "create image of:", "draw:"];

// Detect natural image generation requests in user prompt
function parseImageGenerationPrompt(text: string): { isImageRequest: boolean; prompt: string } {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // Pattern: "generate image of ...", "generate an image of ...", "create a picture of ..."
  const match = lower.match(/^(?:please\s+)?(?:generate|create|make|render)\s+(?:an?\s+)?(?:image|picture|photo|illustration|drawing|artwork)?\s*(?:of|about|showing|with|:)\s*(.+)$/i);
  if (match && match[1]) {
    return { isImageRequest: true, prompt: match[1].trim() };
  }

  // Pattern: "draw a ...", "draw: ...", "paint a ..."
  const drawMatch = lower.match(/^(?:draw|paint)\s*(?::|\s+)\s*(.+)$/i);
  if (drawMatch && drawMatch[1]) {
    return { isImageRequest: true, prompt: drawMatch[1].trim() };
  }

  // Pattern: "/imagine ...", "/image ..."
  const slashMatch = lower.match(/^\/(?:imagine|image|img)\s+(.+)$/i);
  if (slashMatch && slashMatch[1]) {
    return { isImageRequest: true, prompt: slashMatch[1].trim() };
  }

  // Legacy triggers
  for (const trigger of legacyImageTriggers) {
    if (lower.startsWith(trigger)) {
      return { isImageRequest: true, prompt: trimmed.substring(trigger.length).trim() };
    }
  }

  return { isImageRequest: false, prompt: trimmed };
}

// Chat handling using local server on port 13305 with Lemonade Router Policy integration
async function handleChatInput(userMessage: string, imageForContext?: { dataUrl: string; mimeType: string }): Promise<void> {
  const modelToUse = customModelName || activeModel || 'default';

  if (imageForContext) {
    addUserMessage(userMessage, { contextImageUrl: imageForContext.dataUrl });
    const thinkingMessage = addBotMessage("Thinking with local model...", true);

    const multimodalContent: any[] = [
      { type: "text", text: userMessage },
      { type: "image_url", image_url: { url: imageForContext.dataUrl } }
    ];

    const messagesPayload = [
      ...conversationHistory,
      { role: "user", content: multimodalContent }
    ];

    const chatPayload: any = {
      messages: messagesPayload,
      temperature: 0.7,
      has_images: true,
    };
    if (enableRouteTrace) {
      chatPayload.route_trace = true;
    }
    const effectiveModel = customModelName || activeModel;
    if (effectiveModel && effectiveModel !== 'default') {
      chatPayload.model = effectiveModel;
    }

    const endpoints = ['/v1/chat/completions', '/api/v1/chat/completions', '/chat/completions'];
    let replyText = '';
    let lastError: any = null;
    let routeInfo: any = null;

    for (const endpoint of endpoints) {
      try {
        const data = await sendLocalRequest(endpoint, chatPayload);
        routeInfo = data.x_lemonade_route || data._lemonadeRouteHeader;
        replyText = extractChatReply(data);
        if (replyText) break;
      } catch (err: any) {
        lastError = err;
      }
    }

    if (thinkingMessage && thinkingMessage.parentNode) {
      thinkingMessage.parentNode.removeChild(thinkingMessage);
    }

    if (replyText) {
      conversationHistory.push({ role: 'user', content: `[Image Context provided] ${userMessage}` });
      conversationHistory.push({ role: 'assistant', content: replyText });
      addBotMessage(replyText, false, false, undefined, routeInfo);
    } else {
      addBotMessage(`⚠️ Local server error: ${lastError?.message || 'Unable to process vision query'}`, false, false, undefined, routeInfo);
    }
  } else {
    // Check if user is asking to generate an image
    const imageCheck = parseImageGenerationPrompt(userMessage);

    if (imageCheck.isImageRequest && imageCheck.prompt) {
      const imageRequestId = `img-req-${Date.now()}`;
      addUserMessage(`Image Prompt: ${imageCheck.prompt}`, { isImageRequest: true, imageRequestId });
      await generateImageWithPrompt(imageCheck.prompt, imageCheck.prompt, "Direct Prompt", imageRequestId);
    } else {
      addUserMessage(userMessage);
      const thinkingMessage = addBotMessage("Thinking...", true);

      const messagesPayload = [
        ...conversationHistory,
        { role: "user", content: userMessage }
      ];

      const chatPayload: any = {
        messages: messagesPayload,
        temperature: 0.7,
        has_images: false,
      };
      if (enableRouteTrace) {
        chatPayload.route_trace = true;
      }
      const effectiveModel = customModelName || activeModel;
      if (effectiveModel && effectiveModel !== 'default') {
        chatPayload.model = effectiveModel;
      }

      const endpoints = ['/v1/chat/completions', '/api/v1/chat/completions', '/chat/completions'];
      let replyText = '';
      let directImageFromData: string | null = null;
      let lastError: any = null;
      let routeInfo: any = null;

      for (const endpoint of endpoints) {
        try {
          const data = await sendLocalRequest(endpoint, chatPayload);
          routeInfo = data.x_lemonade_route || data._lemonadeRouteHeader;

          // Check if response returned an image directly
          const directImg = extractImageResult(data);
          if (directImg) {
            directImageFromData = directImg;
            break;
          }

          replyText = extractChatReply(data);
          if (replyText) break;
        } catch (err: any) {
          lastError = err;
        }
      }

      if (thinkingMessage && thinkingMessage.parentNode) {
        thinkingMessage.parentNode.removeChild(thinkingMessage);
      }

      if (directImageFromData) {
        const cardId = Date.now().toString();
        const galleryItem: GalleryImageInfo = {
          id: cardId,
          imageUrl: directImageFromData,
          prompt: userMessage,
          basePrompt: userMessage,
          modelName: `${effectiveModel || 'local-server'} (port 13305)`,
          generationTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          styleApplied: "Routed Image",
        };
        addBotImageMessage(directImageFromData, userMessage, "Routed Output", galleryItem);
        addOrUpdateGallery(galleryItem, cardId);
      } else if (replyText) {
        conversationHistory.push({ role: 'user', content: userMessage });
        conversationHistory.push({ role: 'assistant', content: replyText });
        addBotMessage(replyText, false, false, undefined, routeInfo);
      } else {
        const errorDesc = lastError?.message || 'Connection failed';
        let helpText = '';
        if (errorDesc.includes('Failed to fetch') && window.location.protocol === 'https:' && localServerUrl.startsWith('http://')) {
          helpText = `<br><br>🔒 <strong>Browser Security (Mixed Content):</strong><br>Because this web preview is loaded over <strong>HTTPS</strong>, your browser blocks direct connection to local <strong>HTTP (${localServerUrl})</strong>.<br><br><strong>To enable connection in Chrome/Edge:</strong><br>1. Click the tune/padlock icon 🎛️ in your browser's address bar next to the URL.<br>2. Select <strong>Site settings</strong>.<br>3. Scroll down to <strong>Insecure content</strong> and set it to <strong>Allow</strong>.<br>4. Refresh this page.<br><br><strong>Or run the app locally on your machine:</strong><br>Run <code>npm run dev</code> in your terminal and open <code>http://localhost:3000</code>.`;
        }
        addBotMessage(`⚠️ Could not reach server on port 13305 (${localServerUrl}): ${errorDesc}${helpText}`, false, false, undefined, routeInfo);
      }
    }
  }
}

function clearStagedImage() {
  stagedImageForChat = null;
  if (inputImagePreviewContainer) inputImagePreviewContainer.style.display = 'none';
  if (inputImagePreviewThumbnail) inputImagePreviewThumbnail.src = '#';
  if (contextualActionChipsContainer) {
    contextualActionChipsContainer.style.display = 'none';
  }
}

async function submitMessage(): Promise<void> {
  if (userInput && (userInput.value.trim() !== '' || stagedImageForChat)) {
    const messageText = userInput.value.trim();
    await handleChatInput(messageText, stagedImageForChat || undefined);
    if (userInput) userInput.value = '';
    clearStagedImage();
    if (userInput) userInput.focus();
    adjustTextareaHeight();
  }
}

function scrollToBottom(): void {
  if (chatLog) {
    chatLog.scrollTop = chatLog.scrollHeight;
  }
}

function populateActionChips(): void {
  if (!actionChipsContainer) return;
  actionChipsContainer.innerHTML = '';

  imageStyles.forEach(style => {
    const button = document.createElement('button');
    button.classList.add('style-button');
    button.textContent = style.name;
    button.setAttribute('data-style-id', style.id);
    button.setAttribute('aria-label', `Generate image with ${style.name} style`);
    button.addEventListener('click', () => handleStyleChipClick(style));
    actionChipsContainer!.appendChild(button);
  });
}

function populateContextualActionChips(): void {
  if (!contextualActionChipsContainer) return;
  contextualActionChipsContainer.innerHTML = '';

  contextualActionPrompts.forEach(action => {
    const button = document.createElement('button');
    button.classList.add('contextual-action-button');
    button.textContent = action.label;
    button.setAttribute('aria-label', action.ariaLabel);
    button.addEventListener('click', () => handleContextualActionChipClick(action.prompt));
    contextualActionChipsContainer!.appendChild(button);
  });
}

async function handleContextualActionChipClick(prompt: string): Promise<void> {
  if (!stagedImageForChat) {
    addBotMessage("ℹ️ Please stage an image first to use this action.");
    return;
  }
  await handleChatInput(prompt, stagedImageForChat);
  if (userInput) userInput.value = '';
  clearStagedImage();
  if (userInput) userInput.focus();
  adjustTextareaHeight();
}

async function handleStyleChipClick(style: ImageStyle): Promise<void> {
  if (userInput && userInput.value.trim() !== '') {
    const basePrompt = userInput.value.trim();
    const fullPrompt = style.prefix + basePrompt;
    const imageRequestId = `img-req-${Date.now()}`;

    if (stagedImageForChat) {
      addBotMessage("ℹ️ Staged image for chat will be ignored for this style generation.", false);
    }

    addUserMessage(`Image Prompt (${style.displayName}): ${basePrompt}`, { isImageRequest: true, imageRequestId });
    await generateImageWithPrompt(basePrompt, fullPrompt, style.displayName, imageRequestId);
    userInput.value = '';
    if (userInput) userInput.focus();
    adjustTextareaHeight();
  } else {
    addBotMessage(`ℹ️ Please enter an image description in the input bar below, then click a style chip.`);
    if (userInput) userInput.focus();
  }
}

function showContextMenu(event: MouseEvent, selectedText: string): void {
  if (!customContextMenu || !contextMenuItemsList) return;

  selectedTextForContextMenu = selectedText;
  contextMenuItemsList.innerHTML = '';

  imageStyles.forEach(style => {
    const li = document.createElement('li');
    li.textContent = style.name;
    li.setAttribute('role', 'menuitem');
    li.addEventListener('click', () => handleContextMenuItemClick(style));
    contextMenuItemsList!.appendChild(li);
  });

  customContextMenu.style.left = `${event.pageX}px`;
  customContextMenu.style.top = `${event.pageY}px`;
  customContextMenu.style.display = 'block';
}

function hideContextMenu(): void {
  if (customContextMenu) {
    customContextMenu.style.display = 'none';
  }
  selectedTextForContextMenu = null;
}

async function handleContextMenuItemClick(style: ImageStyle): Promise<void> {
  if (selectedTextForContextMenu) {
    const basePrompt = selectedTextForContextMenu;
    const fullPrompt = style.prefix + basePrompt;
    const imageRequestId = `img-req-${Date.now()}`;
    if (stagedImageForChat) {
      addBotMessage("ℹ️ Staged image will be ignored for style generation from selection.", false);
    }
    addUserMessage(`Image Prompt (${style.displayName}): ${basePrompt}`, { isImageRequest: true, imageRequestId });
    await generateImageWithPrompt(basePrompt, fullPrompt, style.displayName, imageRequestId);
  }
  hideContextMenu();
}

function handleTextSelection(event: MouseEvent): void {
  if (customContextMenu && customContextMenu.contains(event.target as Node)) {
    return;
  }
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();
  let parentMessage = null;
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    let container = range.commonAncestorContainer;
    if (container.nodeType !== Node.ELEMENT_NODE) {
      container = container.parentNode!;
    }
    if (chatLog && chatLog.contains(container)) {
      parentMessage = (container as Element).closest('.message');
    }
  }
  if (selectedText && selectedText.length > 0 && parentMessage && chatLog?.contains(parentMessage)) {
    event.preventDefault();
    showContextMenu(event, selectedText);
  } else {
    hideContextMenu();
  }
}

function adjustTextareaHeight() {
  if (userInput) {
    userInput.style.height = 'auto';
    let newHeight = userInput.scrollHeight;
    const maxHeight = parseInt(window.getComputedStyle(userInput).maxHeight, 10) || 150;
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      userInput.style.overflowY = 'auto';
    } else {
      userInput.style.overflowY = 'hidden';
    }
    userInput.style.height = `${newHeight}px`;
  }
}

function updateCurrentSidebarWidth() {
  const mainContentWrapper = document.getElementById('main-content-wrapper');
  if (!mainContentWrapper || !imageGallerySidebar) return;

  const sidebarIsOpen = imageGallerySidebar.classList.contains('open');
  let newSidebarWidth = '0px';

  if (sidebarIsOpen) {
    newSidebarWidth = `${imageGallerySidebar.offsetWidth || 340}px`;
  }
  mainContentWrapper.style.setProperty('--current-sidebar-width', newSidebarWidth);
}

function openGallerySidebar(): void {
  if (imageGallerySidebar && galleryToggleButton) {
    imageGallerySidebar.classList.add('open');
    galleryToggleButton.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => updateCurrentSidebarWidth());
  }
}

function closeGallerySidebar(): void {
  if (imageGallerySidebar && galleryToggleButton) {
    imageGallerySidebar.classList.remove('open');
    galleryToggleButton.setAttribute('aria-expanded', 'false');
    requestAnimationFrame(() => updateCurrentSidebarWidth());
  }
}

function toggleGallerySidebar(): void {
  if (imageGallerySidebar) {
    if (imageGallerySidebar.classList.contains('open')) {
      closeGallerySidebar();
    } else {
      openGallerySidebar();
    }
  }
}

async function downloadAllGalleryCards() {
  if (galleryItems.length === 0) {
    addBotMessage("ℹ️ Gallery is empty. Nothing to download.");
    return;
  }

  if (downloadAllGalleryButton) downloadAllGalleryButton.disabled = true;
  const thinkingMsg = addBotMessage("📦 Packaging all gallery cards for download, please wait...", true);

  const masterZip = new JSZip();

  for (const item of galleryItems) {
    const extracted = extractBase64Data(item.imageUrl);
    if (!extracted) {
      continue;
    }

    const extension = extracted.mimeType.split('/')[1] || 'jpeg';
    const localImageName = `image.${extension}`;

    const cardHtmlContent = getCardHTMLContent(item, localImageName);
    const safePromptSnippet = item.basePrompt.substring(0, 20).replace(/[^a-z0-9_]/gi, '_').replace(/__+/g, '_');
    const folderName = `card_${item.id}_${safePromptSnippet}`;

    const cardFolder = masterZip.folder(folderName);
    if (cardFolder) {
      cardFolder.file("card_info.html", cardHtmlContent);
      cardFolder.file(localImageName, extracted.base64, { base64: true });
    }
  }
	const timelineMarkdown = generateChatTimeline();
	  masterZip.file("LILLY_Chat_Timeline.md", timelineMarkdown);
	  
	  // Also export the raw conversation array for potential future re-importing
	  masterZip.file("session_data.json", JSON.stringify(conversationHistory, null, 2));
	  // ---------------------------------------------------------------
  try {
    const content = await masterZip.generateAsync({ type: "blob" });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `gallery_export_all_${timestamp}.zip`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    addBotMessage("✅ All gallery cards packaged. Download starting.");
  } catch (e) {
    console.error("Error generating master zip file:", e);
    addBotMessage("⚠️ Sorry, there was an error creating the master gallery archive.");
  } finally {
    if (thinkingMsg && thinkingMsg.parentNode) {
      thinkingMsg.parentNode.removeChild(thinkingMsg);
    }
    if (downloadAllGalleryButton) downloadAllGalleryButton.disabled = galleryItems.length === 0;
  }
}

function showStagedImagePreview(dataUrl: string, mimeType: string) {
  stagedImageForChat = { dataUrl, mimeType };
  if (inputImagePreviewThumbnail) inputImagePreviewThumbnail.src = dataUrl;
  if (inputImagePreviewContainer) inputImagePreviewContainer.style.display = 'flex';

  if (contextualActionChipsContainer) {
    contextualActionChipsContainer.style.display = 'flex';
  }
}

// Modal & Settings handlers
function openSettingsModal() {
  if (settingsModal) {
    if (serverUrlInput) serverUrlInput.value = localServerUrl;
    if (customModelInput) customModelInput.value = customModelName;
    if (serverApiKeyInput) serverApiKeyInput.value = localApiKey;
    if (routeTraceCheckbox) routeTraceCheckbox.checked = enableRouteTrace;
    testConnectionInModal();
    settingsModal.style.display = 'flex';
  }
}

function closeSettingsModal() {
  if (settingsModal) {
    settingsModal.style.display = 'none';
  }
}

async function testConnectionInModal() {
  if (statusBoxIndicator) statusBoxIndicator.textContent = 'Testing connection...';
  if (statusBoxDetails) statusBoxDetails.textContent = `Probing ${serverUrlInput ? serverUrlInput.value : localServerUrl}...`;

  const inputUrl = (serverUrlInput ? serverUrlInput.value : localServerUrl).trim() || DEFAULT_SERVER_URL;
  const candidateUrls = [inputUrl, getAlternateUrl(inputUrl)];
  const resultsLog: string[] = [];

  let success = false;
  let detectedModels: string[] = [];

  for (const testUrl of candidateUrls) {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const headers: Record<string, string> = {};
      if (serverApiKeyInput && serverApiKeyInput.value) {
        headers['Authorization'] = `Bearer ${serverApiKeyInput.value.trim()}`;
      }

      let res = await fetch(`${testUrl.replace(/\/+$/, '')}/api/v1/models`, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
      if (!res.ok) {
        res = await fetch(`${testUrl.replace(/\/+$/, '')}/api/v1/system-info`, {
          method: 'GET',
          headers,
          signal: controller.signal
        });
      }
      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (Array.isArray(data.data)) {
          detectedModels = data.data.map((m: any) => m.id || m.name);
        } else if (Array.isArray(data.models)) {
          detectedModels = data.models.map((m: any) => m.id || m.name);
        }
        resultsLog.push(`✅ ${testUrl}: Status ${res.status} OK (${elapsed}ms)`);
        success = true;
        if (serverUrlInput) serverUrlInput.value = testUrl;
        break;
      } else {
        resultsLog.push(`⚠️ ${testUrl}: Status ${res.status} ${res.statusText}`);
      }
    } catch (err: any) {
      resultsLog.push(`❌ ${testUrl}: ${err.message || 'Failed to fetch'}`);
    }
  }

  if (success) {
    if (statusBoxIndicator) statusBoxIndicator.textContent = 'Connected (Online)';
    if (statusBoxDetails) {
      statusBoxDetails.textContent = `${resultsLog.join('\n')}\n\nModels: ${detectedModels.slice(0, 5).join(', ') || 'default'}`;
    }
  } else {
    if (statusBoxIndicator) statusBoxIndicator.textContent = 'Tested';
    if (statusBoxDetails) {
      statusBoxDetails.textContent = `${resultsLog.join('\n')}\n\nNote: If using this HTTPS preview in Chrome/Edge:\n1. Click the icon next to the URL in the address bar -> Site settings\n2. Set 'Insecure content' to 'Allow'\n3. Refresh page\n\nOr run locally via: npm run dev (http://localhost:3000)`;
    }
  }
}

function saveSettings() {
  if (serverUrlInput) {
    localServerUrl = serverUrlInput.value.trim() || DEFAULT_SERVER_URL;
    localStorage.setItem('local_server_url', localServerUrl);
  }
  if (customModelInput) {
    customModelName = customModelInput.value.trim();
    localStorage.setItem('local_custom_model', customModelName);
  }
  if (serverApiKeyInput) {
    localApiKey = serverApiKeyInput.value.trim();
    localStorage.setItem('local_api_key', localApiKey);
  }
  if (routeTraceCheckbox) {
    enableRouteTrace = routeTraceCheckbox.checked;
    localStorage.setItem('local_route_trace', String(enableRouteTrace));
  }

  closeSettingsModal();
  probeModelsSilently();
}

function resetSettingsToDefault() {
  localServerUrl = DEFAULT_SERVER_URL;
  customModelName = '';
  localApiKey = '';
  enableRouteTrace = true;
  localStorage.removeItem('local_server_url');
  localStorage.removeItem('local_custom_model');
  localStorage.removeItem('local_api_key');
  localStorage.removeItem('local_route_trace');

  if (serverUrlInput) serverUrlInput.value = DEFAULT_SERVER_URL;
  if (customModelInput) customModelInput.value = '';
  if (serverApiKeyInput) serverApiKeyInput.value = '';
  if (routeTraceCheckbox) routeTraceCheckbox.checked = true;

  testConnectionInModal();
}

function clearChat() {
  conversationHistory = [
    { role: 'system', content: 'You are a helpful and creative AI assistant running on a local server.' }
  ];
  if (chatLog) {
    chatLog.innerHTML = '';
  }
  clearStagedImage();
  checkChatEmpty();
  if (userInput) userInput.focus();
}

// Window load initializer
window.addEventListener('load', () => {
  chatLog = document.getElementById('chat-log') as HTMLDivElement | null;
  userInput = document.getElementById('user-input') as HTMLTextAreaElement | null;
  actionChipsContainer = document.getElementById('action-chips-container') as HTMLDivElement | null;
  contextualActionChipsContainer = document.getElementById('contextual-action-chips-container') as HTMLDivElement | null;
  emptyChatPlaceholder = document.getElementById('empty-chat-placeholder') as HTMLDivElement | null;
  chatContainer = document.getElementById('chat-container') as HTMLDivElement | null;
  geminiInputBar = document.getElementById('gemini-input-bar') as HTMLDivElement | null;
  customContextMenu = document.getElementById('custom-context-menu') as HTMLDivElement | null;
  contextMenuItemsList = document.getElementById('context-menu-items') as HTMLUListElement | null;

  // Gallery Elements
  galleryItemsContainer = document.getElementById('gallery-items-container') as HTMLDivElement | null;
  imageGallerySidebar = document.getElementById('image-gallery-sidebar') as HTMLElement | null;
  galleryToggleButton = document.getElementById('gallery-toggle-button') as HTMLButtonElement | null;
  downloadAllGalleryButton = document.getElementById('download-all-gallery-button') as HTMLButtonElement | null;
  galleryCloseButton = document.getElementById('gallery-close-button') as HTMLButtonElement | null;
  galleryFileUpload = document.getElementById('gallery-file-upload') as HTMLInputElement | null;
  clearGalleryBtn = document.getElementById('clear-gallery-btn') as HTMLButtonElement | null;
  galleryCountBadge = document.getElementById('gallery-count-badge') as HTMLSpanElement | null;
  gallerySubtext = document.getElementById('gallery-subtext') as HTMLSpanElement | null;

  // Lightbox Elements
  lightboxModal = document.getElementById('lightbox-modal') as HTMLDivElement | null;
  lightboxImg = document.getElementById('lightbox-img') as HTMLImageElement | null;
  lightboxCaption = document.getElementById('lightbox-caption') as HTMLDivElement | null;
  lightboxCloseBtn = document.getElementById('lightbox-close-btn') as HTMLButtonElement | null;

  // Input Preview Elements
  inputImagePreviewContainer = document.getElementById('input-image-preview-container') as HTMLDivElement | null;
  inputImagePreviewThumbnail = document.getElementById('input-image-preview-thumbnail') as HTMLImageElement | null;
  inputImagePreviewRemoveButton = document.getElementById('input-image-preview-remove') as HTMLButtonElement | null;

  // Header & Settings Controls
  serverStatusPill = document.getElementById('server-status-pill') as HTMLButtonElement | null;
  statusText = document.getElementById('status-text') as HTMLSpanElement | null;
  modelSelect = document.getElementById('model-select') as HTMLSelectElement | null;
  clearChatButton = document.getElementById('clear-chat-button') as HTMLButtonElement | null;
  serverSettingsButton = document.getElementById('server-settings-button') as HTMLButtonElement | null;
  settingsModal = document.getElementById('settings-modal') as HTMLDivElement | null;
  modalCloseButton = document.getElementById('modal-close-button') as HTMLButtonElement | null;
  serverUrlInput = document.getElementById('server-url-input') as HTMLInputElement | null;
  customModelInput = document.getElementById('custom-model-input') as HTMLInputElement | null;
  serverApiKeyInput = document.getElementById('server-api-key-input') as HTMLInputElement | null;
  btnTestConnection = document.getElementById('btn-test-connection') as HTMLButtonElement | null;
  btnResetDefault = document.getElementById('btn-reset-default') as HTMLButtonElement | null;
  btnSaveSettings = document.getElementById('btn-save-settings') as HTMLButtonElement | null;
  statusBoxIndicator = document.getElementById('status-box-indicator') as HTMLSpanElement | null;
  statusBoxDetails = document.getElementById('status-box-details') as HTMLDivElement | null;
  serverEndpointDisplay = document.getElementById('server-endpoint-display');
  pickLocalhost = document.getElementById('pick-localhost') as HTMLButtonElement | null;
  pick127 = document.getElementById('pick-127') as HTMLButtonElement | null;
  btnPresetRouter = document.getElementById('btn-preset-router') as HTMLButtonElement | null;
  routeTraceCheckbox = document.getElementById('route-trace-checkbox') as HTMLInputElement | null;

  // Initial population
  populateActionChips();
  populateContextualActionChips();
  checkChatEmpty();
  adjustTextareaHeight();
  addOrUpdateGallery();

  // If there are existing gallery items and viewport is wide, open gallery sidebar
  if (window.innerWidth > 960 && galleryItems.length > 0) {
    openGallerySidebar();
  }

  if (inputImagePreviewContainer) inputImagePreviewContainer.style.display = 'none';
  if (contextualActionChipsContainer) contextualActionChipsContainer.style.display = 'none';

  // Server default: connected
  updateStatusPill('connected', 'Port 13305 (Connected)');
  if (serverEndpointDisplay) serverEndpointDisplay.textContent = localServerUrl;

  // Probe in background silently
  probeModelsSilently();

  // Settings & Modal listeners
  if (serverSettingsButton) {
    serverSettingsButton.addEventListener('click', openSettingsModal);
  }
  if (serverStatusPill) {
    serverStatusPill.addEventListener('click', openSettingsModal);
  }
  if (modalCloseButton) {
    modalCloseButton.addEventListener('click', closeSettingsModal);
  }
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) closeSettingsModal();
    });
  }
  if (btnTestConnection) {
    btnTestConnection.addEventListener('click', testConnectionInModal);
  }
  if (btnResetDefault) {
    btnResetDefault.addEventListener('click', resetSettingsToDefault);
  }
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', saveSettings);
  }
  if (clearChatButton) {
    clearChatButton.addEventListener('click', clearChat);
  }
  if (pickLocalhost) {
    pickLocalhost.addEventListener('click', () => {
      if (serverUrlInput) serverUrlInput.value = 'http://localhost:13305';
      testConnectionInModal();
    });
  }
  if (pick127) {
    pick127.addEventListener('click', () => {
      if (serverUrlInput) serverUrlInput.value = 'http://127.0.0.1:13305';
      testConnectionInModal();
    });
  }
  if (btnPresetRouter && customModelInput) {
    btnPresetRouter.addEventListener('click', () => {
      customModelInput!.value = 'collection.router';
      customModelName = 'collection.router';
      localStorage.setItem('local_custom_model', customModelName);
      updateModelDropdown();
      updateStatusPill('connected', 'Port 13305 (collection.router)');
    });
  }
  if (routeTraceCheckbox) {
    routeTraceCheckbox.checked = enableRouteTrace;
    routeTraceCheckbox.addEventListener('change', () => {
      enableRouteTrace = routeTraceCheckbox!.checked;
      localStorage.setItem('local_route_trace', String(enableRouteTrace));
    });
  }
  if (modelSelect) {
    modelSelect.addEventListener('change', () => {
      activeModel = modelSelect!.value;
      localStorage.setItem('local_active_model', activeModel);
      updateStatusPill('connected', `Port 13305 (${activeModel})`);
    });
  }

  // Gallery listeners
  if (galleryToggleButton) {
    galleryToggleButton.addEventListener('click', toggleGallerySidebar);
  }
  if (galleryCloseButton) {
    galleryCloseButton.addEventListener('click', closeGallerySidebar);
  }
  if (downloadAllGalleryButton) {
    downloadAllGalleryButton.addEventListener('click', downloadAllGalleryCards);
  }
  if (clearGalleryBtn) {
    clearGalleryBtn.addEventListener('click', clearAllGalleryItems);
  }
  if (galleryFileUpload) {
    galleryFileUpload.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (readEvent) => {
          if (readEvent.target && typeof readEvent.target.result === 'string') {
            const dataUrl = readEvent.target.result;
            const cardId = Date.now().toString();
            const newItem: GalleryImageInfo = {
              id: cardId,
              imageUrl: dataUrl,
              prompt: file.name.replace(/\.[^/.]+$/, ''),
              basePrompt: file.name.replace(/\.[^/.]+$/, ''),
              modelName: 'User Upload',
              generationTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              styleApplied: 'Uploaded',
            };
            addOrUpdateGallery(newItem, cardId);
            openGallerySidebar();
          }
        };
        reader.readAsDataURL(file);
        target.value = '';
      }
    });
  }

  // Lightbox listeners
  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  // Drag and drop for image staging & adding to gallery
  if (geminiInputBar && inputImagePreviewContainer && inputImagePreviewThumbnail && inputImagePreviewRemoveButton) {
    geminiInputBar.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      geminiInputBar!.classList.add('drop-target-active');
    });

    geminiInputBar.addEventListener('dragleave', () => {
      geminiInputBar!.classList.remove('drop-target-active');
    });

    geminiInputBar.addEventListener('drop', (event) => {
      event.preventDefault();
      geminiInputBar!.classList.remove('drop-target-active');

      if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target && typeof e.target.result === 'string') {
              const imageDetails = extractBase64Data(e.target.result);
              if (imageDetails) {
                showStagedImagePreview(e.target.result, imageDetails.mimeType);
              } else {
                addBotMessage("⚠️ Could not process dropped image file.");
              }
            }
          };
          reader.readAsDataURL(file);
        } else {
          addBotMessage("⚠️ Please drop an image file.");
        }
      } else if (event.dataTransfer) {
        try {
          const jsonData = event.dataTransfer.getData('application/json');
          if (jsonData) {
            const data = JSON.parse(jsonData);
            if (data.imageUrl) {
              const imageDetails = extractBase64Data(data.imageUrl);
              if (imageDetails) {
                showStagedImagePreview(data.imageUrl, imageDetails.mimeType);
              }
            }
          }
        } catch (e) {
          console.error("Error reading dropped data:", e);
        }
      }
    });

    inputImagePreviewRemoveButton.addEventListener('click', clearStagedImage);
  }

  // Textarea input
  if (userInput) {
    userInput.addEventListener('keydown', function(event: KeyboardEvent) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submitMessage();
      }
    });
    userInput.addEventListener('input', adjustTextareaHeight);
    userInput.focus();
  }

  // Context menu for text selection
  if (chatLog) {
    chatLog.addEventListener('contextmenu', handleTextSelection);
    chatLog.addEventListener('mouseup', handleTextSelection);
  }
  document.addEventListener('click', (event) => {
    if (customContextMenu && customContextMenu.style.display === 'block') {
      if (!customContextMenu.contains(event.target as Node)) {
        const selection = window.getSelection();
        const clickedOnChatLog = chatLog && chatLog.contains(event.target as Node);
        const makingNewSelection = clickedOnChatLog && selection && selection.toString().trim().length > 0;
        if (!makingNewSelection) {
          hideContextMenu();
        }
      }
    }
  });

  // Esc key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeSettingsModal();
    }
  });
});

window.addEventListener('resize', updateCurrentSidebarWidth);

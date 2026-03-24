const canvas = document.getElementById('posterCanvas');
const ctx = canvas.getContext('2d');

const el = {
  apiKey: document.getElementById('apiKey'),
  prompt: document.getElementById('prompt'),
  model: document.getElementById('model'),
  size: document.getElementById('size'),
  headline: document.getElementById('headline'),
  subheading: document.getElementById('subheading'),
  footer: document.getElementById('footer'),
  textColor: document.getElementById('textColor'),
  accentColor: document.getElementById('accentColor'),
  fontFamily: document.getElementById('fontFamily'),
  generateBtn: document.getElementById('generateBtn'),
  mockBtn: document.getElementById('mockBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  status: document.getElementById('status')
};

let backgroundImage = null;

function setStatus(message, isError = false) {
  el.status.textContent = message;
  el.status.style.color = isError ? '#ff9b9b' : '';
}

function resizeCanvasFromPreset() {
  const [width, height] = el.size.value.split('x').map(Number);
  canvas.width = width;
  canvas.height = height;
  drawPoster();
}

function drawBackground() {
  if (backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#191f48');
  gradient.addColorStop(1, '#05070f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawOverlay() {
  const grad = ctx.createLinearGradient(0, canvas.height * 0.3, 0, canvas.height);
  grad.addColorStop(0, 'rgba(5,8,15,0)');
  grad.addColorStop(1, 'rgba(5,8,15,0.88)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawText(text, x, y, size, color, align = 'left', shadow = true) {
  if (!text) return;
  ctx.save();
  ctx.font = `${size}px ${el.fontFamily.value}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';

  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 2;
  }

  const maxWidth = canvas.width * 0.84;
  wrapText(text, x, y, maxWidth, size * 1.04);
  ctx.restore();
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let i = 0; i < words.length; i += 1) {
    const testLine = `${line}${words[i]} `;
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, y);
      line = `${words[i]} `;
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line.trim(), x, y);
}

function drawPoster() {
  drawBackground();
  drawOverlay();

  const isPortrait = canvas.height >= canvas.width;
  const margin = canvas.width * 0.08;
  const headlineSize = isPortrait ? canvas.width * 0.112 : canvas.width * 0.09;
  const subSize = isPortrait ? canvas.width * 0.043 : canvas.width * 0.037;
  const footerSize = isPortrait ? canvas.width * 0.035 : canvas.width * 0.03;

  drawText(el.headline.value, margin, canvas.height * 0.72, headlineSize, el.textColor.value);

  drawText(
    el.subheading.value,
    margin,
    canvas.height * 0.84,
    subSize,
    el.accentColor.value,
    'left',
    false
  );

  drawText(
    el.footer.value,
    canvas.width - margin,
    canvas.height * 0.94,
    footerSize,
    el.textColor.value,
    'right',
    false
  );

  ctx.strokeStyle = el.accentColor.value;
  ctx.lineWidth = Math.max(3, canvas.width * 0.0055);
  ctx.strokeRect(margin * 0.8, margin * 0.8, canvas.width - margin * 1.6, canvas.height - margin * 1.6);
}

async function loadImageFromDataUrl(dataUrl) {
  const img = new Image();
  img.decoding = 'async';
  img.src = dataUrl;

  await img.decode();
  backgroundImage = img;
  drawPoster();
}

async function generateWithAI() {
  const apiKey = el.apiKey.value.trim();
  const prompt = el.prompt.value.trim();

  if (!apiKey) {
    setStatus('Add your OpenAI API key first.', true);
    return;
  }

  if (!prompt) {
    setStatus('Enter a prompt first.', true);
    return;
  }

  el.generateBtn.disabled = true;
  setStatus('Generating image with AI...');

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: el.model.value,
        prompt,
        size: el.size.value
      })
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Image generation failed (${response.status}): ${details}`);
    }

    const data = await response.json();
    const imageBase64 = data?.data?.[0]?.b64_json;

    if (!imageBase64) {
      throw new Error('No image returned from API.');
    }

    await loadImageFromDataUrl(`data:image/png;base64,${imageBase64}`);
    setStatus('Poster background generated successfully.');
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Failed to generate image.', true);
  } finally {
    el.generateBtn.disabled = false;
  }
}

async function generateDemoBackground() {
  const gradientCanvas = document.createElement('canvas');
  gradientCanvas.width = canvas.width;
  gradientCanvas.height = canvas.height;
  const gctx = gradientCanvas.getContext('2d');

  const bg = gctx.createLinearGradient(0, 0, gradientCanvas.width, gradientCanvas.height);
  bg.addColorStop(0, '#131d4f');
  bg.addColorStop(0.5, '#7a1fa2');
  bg.addColorStop(1, '#140b26');
  gctx.fillStyle = bg;
  gctx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);

  for (let i = 0; i < 120; i += 1) {
    gctx.fillStyle = `hsla(${(i * 13) % 360} 95% 72% / 0.32)`;
    const x = Math.random() * gradientCanvas.width;
    const y = Math.random() * gradientCanvas.height;
    const r = Math.random() * 180 + 15;
    gctx.beginPath();
    gctx.arc(x, y, r, 0, Math.PI * 2);
    gctx.fill();
  }

  await loadImageFromDataUrl(gradientCanvas.toDataURL('image/png'));
  setStatus('Loaded demo background.');
}

function downloadPoster() {
  const link = document.createElement('a');
  link.download = `poster-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  setStatus('Poster downloaded as PNG.');
}

['headline', 'subheading', 'footer', 'textColor', 'accentColor', 'fontFamily'].forEach((id) => {
  el[id].addEventListener('input', drawPoster);
});

el.size.addEventListener('change', resizeCanvasFromPreset);
el.generateBtn.addEventListener('click', generateWithAI);
el.mockBtn.addEventListener('click', generateDemoBackground);
el.downloadBtn.addEventListener('click', downloadPoster);

el.headline.value = 'AURORA NIGHTS';
el.subheading.value = 'Immersive Light & Sound Experience';
el.footer.value = 'Saturday 9PM • Downtown Hall';
el.prompt.value =
  'An atmospheric neon city at night with volumetric lights, cinematic composition, and space for title text';

resizeCanvasFromPreset();
setStatus('Ready. Generate with AI or use demo background.');

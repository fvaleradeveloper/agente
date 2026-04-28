// api/send-telegram.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!BOT_TOKEN) return res.status(500).json({ error: 'Falta TELEGRAM_BOT_TOKEN en variables' });

  try {
    const { chat_id, status, mediaType, base64 } = req.body;
    if (!chat_id || !status || !base64) throw new Error('Datos incompletos');

    // Decodificar base64 a Buffer
    const buffer = Buffer.from(base64.split(',')[1], 'base64');
    const fileType = mediaType === 'image' ? 'image/jpeg' : 'video/mp4';
    const fileName = `reporte_${Date.now()}.${mediaType === 'image' ? 'jpg' : 'mp4'}`;

    const formData = new FormData();
    formData.append('chat_id', chat_id);
    formData.append(mediaType, new Blob([buffer], { type: fileType }), fileName);
    formData.append('caption', `<b>🛡️ REPORTE DE VIGILANCIA</b>\n📝 Estado: ${status}\n📅 ${new Date().toLocaleString('es-ES')}`);
    formData.append('parse_mode', 'HTML');

    const endpoint = mediaType === 'image' ? 'sendPhoto' : 'sendVideo';
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, {
      method: 'POST',
      body: formData
    });

    const result = await tgRes.json();
    if (!result.ok) throw new Error(`Telegram: ${result.description}`);

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
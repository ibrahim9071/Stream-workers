// ============================================================
//  DiziYou.com Modülü (TÜM VARYANTLAR İÇİN GÜNCELLENDİ)
// ============================================================

async function extractDiziYou(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
                'Referer': 'https://www.diziyou.one/'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Sayfa yüklenemedi`);
        }
        
        const html = await response.text();
        const sources = [];
        
        // 1. Master M3U8 playlistleri
        const masterRegex = /(https?:\/\/[^\s"'<>]+master\.m3u8[^\s"'<>]*)/gi;
        let match;
        while ((match = masterRegex.exec(html)) !== null) {
            if (!sources.some(s => s.url === match[1])) {
                sources.push({
                    url: match[1],
                    quality: 'Master HD',
                    type: 'application/vnd.apple.mpegurl'
                });
            }
        }
        
        // 2. Diğer M3U8 linkleri
        const m3u8Regex = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/gi;
        while ((match = m3u8Regex.exec(html)) !== null) {
            if (!sources.some(s => s.url === match[1])) {
                sources.push({
                    url: match[1],
                    quality: 'M3U8',
                    type: 'application/vnd.apple.mpegurl'
                });
            }
        }
        
        // 3. MP4 linkleri
        const mp4Regex = /(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/gi;
        while ((match = mp4Regex.exec(html)) !== null) {
            if (!sources.some(s => s.url === match[1])) {
                sources.push({
                    url: match[1],
                    quality: 'MP4 HD',
                    type: 'video/mp4'
                });
            }
        }
        
        // 4. JSON-LD ve script içindeki video linkleri
        const jsonRegex = /"contentUrl"\s*:\s*"([^"]+\.(?:m3u8|mp4)[^"]*)"/gi;
        while ((match = jsonRegex.exec(html)) !== null) {
            if (!sources.some(s => s.url === match[1])) {
                sources.push({
                    url: match[1],
                    quality: 'Video',
                    type: match[1].includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4'
                });
            }
        }
        
        // 5. Video etiketleri
        const videoSrcRegex = /<video[^>]*>[\s\S]*?<source[^>]+src=["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/gi;
        while ((match = videoSrcRegex.exec(html)) !== null) {
            if (!sources.some(s => s.url === match[1])) {
                sources.push({
                    url: match[1],
                    quality: 'Video Source',
                    type: match[1].includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4'
                });
            }
        }
        
        // Başlık bul
        let title = 'Dizi/Film';
        const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                          html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
            title = titleMatch[1].replace('DiziYou', '').replace('|', '').trim();
        }
        
        return {
            title: title,
            sources: sources,
            captions: []
        };
        
    } catch (error) {
        throw new Error(`DiziYou hatası: ${error.message}`);
    }
}

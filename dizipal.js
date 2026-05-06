// ============================================================
//  Dizipal.com Modülü (TÜM VARYANTLAR İÇİN GÜNCELLENDİ)
// ============================================================

async function extractDizipal(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Sayfa yüklenemedi`);
        }
        
        const html = await response.text();
        const sources = [];
        
        // 1. M3U8 linkleri (master ve kalite varyantları)
        const m3u8Regex = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/gi;
        let match;
        while ((match = m3u8Regex.exec(html)) !== null) {
            if (!sources.some(s => s.url === match[1])) {
                sources.push({
                    url: match[1],
                    quality: 'M3U8',
                    type: 'application/vnd.apple.mpegurl'
                });
            }
        }
        
        // 2. MP4 linkleri
        const mp4Regex = /(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/gi;
        while ((match = mp4Regex.exec(html)) !== null) {
            if (!sources.some(s => s.url === match[1])) {
                sources.push({
                    url: match[1],
                    quality: 'MP4',
                    type: 'video/mp4'
                });
            }
        }
        
        // 3. JavaScript içindeki video config'leri
        const jsConfigRegex = /(?:file|video|source|src|url)\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/gi;
        while ((match = jsConfigRegex.exec(html)) !== null) {
            if (!sources.some(s => s.url === match[1])) {
                sources.push({
                    url: match[1],
                    quality: 'Video',
                    type: match[1].includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4'
                });
            }
        }
        
        // 4. iframe içindeki linkler
        const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
        while ((match = iframeRegex.exec(html)) !== null) {
            if (match[1].includes('http') && !sources.some(s => s.url === match[1])) {
                sources.push({
                    url: match[1],
                    quality: 'Iframe',
                    type: 'text/html'
                });
            }
        }
        
        // Başlık bul
        let title = 'Dizi/Film';
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
            title = titleMatch[1].replace('Dizipal', '').replace('|', '').trim();
        }
        
        return {
            title: title,
            sources: sources,
            captions: []
        };
        
    } catch (error) {
        throw new Error(`Dizipal hatası: ${error.message}`);
    }
}

// ============================================================
//  FilmModu.com Modülü
//  Film modu platformundan video linklerini çıkarır
// ============================================================

async function extractFilmModu(url) {
    try {
        // Sayfayı fetch et
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const html = await response.text();
        
        // Video linklerini bul (çeşitli pattern'ler)
        const sources = [];
        
        // M3U8 linkleri
        const m3u8Regex = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/gi;
        let match;
        while ((match = m3u8Regex.exec(html)) !== null) {
            sources.push({
                url: match[1],
                quality: 'M3U8',
                type: 'application/vnd.apple.mpegurl'
            });
        }
        
        // MP4 linkleri
        const mp4Regex = /(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/gi;
        while ((match = mp4Regex.exec(html)) !== null) {
            sources.push({
                url: match[1],
                quality: 'MP4',
                type: 'video/mp4'
            });
        }
        
        // JavaScript içindeki video linkleri
        const jsVideoRegex = /(?:file|video|source|src):\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/gi;
        while ((match = jsVideoRegex.exec(html)) !== null) {
            if (!sources.some(s => s.url === match[1])) {
                sources.push({
                    url: match[1],
                    quality: 'Video',
                    type: match[1].includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4'
                });
            }
        }
        
        // Title bul
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace('FilmModu', '').replace('|', '').trim() : 'Film';
        
        return {
            title: title,
            sources: sources,
            captions: [] // Altyapı varsa eklenebilir
        };
        
    } catch (error) {
        throw new Error(`FilmModu hatası: ${error.message}`);
    }
}

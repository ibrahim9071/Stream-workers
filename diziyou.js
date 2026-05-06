// ============================================================
//  DiziYou.com Modülü
//  DiziYou platformundan video linklerini çıkarır
// ============================================================

async function extractDiziYou(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const html = await response.text();
        
        const sources = [];
        
        // M3U8 master playlist
        const masterRegex = /(https?:\/\/[^\s"'<>]+master\.m3u8[^\s"'<>]*)/gi;
        let match;
        while ((match = masterRegex.exec(html)) !== null) {
            sources.push({
                url: match[1],
                quality: 'Master',
                type: 'application/vnd.apple.mpegurl'
            });
        }
        
        // Diğer M3U8'ler
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
        
        // MP4 linkleri
        const mp4Regex = /(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/gi;
        while ((match = mp4Regex.exec(html)) !== null) {
            sources.push({
                url: match[1],
                quality: 'MP4',
                type: 'video/mp4'
            });
        }
        
        // Title
        const titleMatch = html.match(/<h1[^>]*class=["'][^"']*title[^"']*["'][^>]*>([^<]+)<\/h1>/i) ||
                          html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace('DiziYou', '').trim() : 'Dizi';
        
        return {
            title: title,
            sources: sources,
            captions: []
        };
        
    } catch (error) {
        throw new Error(`DiziYou hatası: ${error.message}`);
    }
}

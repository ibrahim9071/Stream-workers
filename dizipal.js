// ============================================================
//  Dizipal.com Modülü
//  Dizipal platformundan video linklerini çıkarır
// ============================================================

async function extractDizipal(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const html = await response.text();
        
        const sources = [];
        
        // Video.js config'ini bul
        const videoConfigRegex = /videojs\s*\([^)]*\)\s*\.src\s*\(\s*([^;]+)\)/i;
        const configMatch = html.match(videoConfigRegex);
        
        if (configMatch) {
            try {
                // JSON benzeri yapıyı parse et
                const configStr = configMatch[1];
                const urlMatch = configStr.match(/["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/);
                if (urlMatch) {
                    sources.push({
                        url: urlMatch[1],
                        quality: 'HD',
                        type: urlMatch[1].includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4'
                    });
                }
            } catch (e) {}
        }
        
        // Direkt M3U8/MP4 linkleri
        const videoRegex = /(https?:\/\/[^\s"'<>]+\.(?:m3u8|mp4)[^\s"'<>]*)/gi;
        let match;
        while ((match = videoRegex.exec(html)) !== null) {
            if (!sources.some(s => s.url === match[1])) {
                sources.push({
                    url: match[1],
                    quality: 'Video',
                    type: match[1].includes('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4'
                });
            }
        }
        
        // Title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace('Dizipal', '').trim() : 'Dizi';
        
        return {
            title: title,
            sources: sources,
            captions: []
        };
        
    } catch (error) {
        throw new Error(`Dizipal hatası: ${error.message}`);
    }
}

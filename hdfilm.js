// ============================================================
//  HDFilmCehennemi.com Modülü
//  HDFilmCehennemi platformundan video linklerini çıkarır
// ============================================================

async function extractHDFilmCehennemi(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const html = await response.text();
        
        const sources = [];
        
        // M3U8 linkleri
        const m3u8Regex = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/gi;
        let match;
        while ((match = m3u8Regex.exec(html)) !== null) {
            sources.push({
                url: match[1],
                quality: 'HD',
                type: 'application/vnd.apple.mpegurl'
            });
        }
        
        // iframe içindeki linkler
        const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
        while ((match = iframeRegex.exec(html)) !== null) {
            sources.push({
                url: match[1],
                quality: 'Iframe',
                type: 'text/html'
            });
        }
        
        // Title
        const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                          html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace('HDFilmCehennemi', '').trim() : 'Film';
        
        return {
            title: title,
            sources: sources,
            captions: []
        };
        
    } catch (error) {
        throw new Error(`HDFilmCehennemi hatası: ${error.message}`);
    }
}

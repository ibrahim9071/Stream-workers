async function extractFilmModu(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const html = await response.text();
        const sources = [];
        
        const m3u8Regex = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/gi;
        let match;
        while ((match = m3u8Regex.exec(html)) !== null) {
            sources.push({ url: match[1], quality: 'M3U8', type: 'application/vnd.apple.mpegurl' });
        }
        
        const mp4Regex = /(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/gi;
        while ((match = mp4Regex.exec(html)) !== null) {
            sources.push({ url: match[1], quality: 'MP4', type: 'video/mp4' });
        }
        
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace('FilmModu', '').trim() : 'Film';
        
        return { title: title, sources: sources, captions: [] };
    } catch (error) {
        throw new Error(`FilmModu hatası: ${error.message}`);
    }
}

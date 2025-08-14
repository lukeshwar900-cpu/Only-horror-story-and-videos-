const API_KEY = 'AIzaSyAdALhf9xyYrsUhk-hiSRNNbBKCriR37Jg';

const HORROR_SEARCH_TERM = 'animated horror stories';

function displayVideos(videos, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    
    videos.forEach(video => {
        const videoId = video.id.videoId;
        const videoTitle = video.snippet.title;
        const thumbnailUrl = video.snippet.thumbnails.high.url;
        
        const videoElement = document.createElement('div');
        videoElement.className = 'video-item';
        videoElement.innerHTML = `
            <a href="video.html?id=${videoId}">
                <img src="${thumbnailUrl}" alt="${videoTitle}">
                <h3>${videoTitle}</h3>
            </a>
        `;
        container.appendChild(videoElement);
    });
}

async function getVideos(searchTerm) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=video&key=${API_KEY}&maxResults=12`);
    const data = await response.json();
    return data.items;
}

async function loadHomePageVideos(searchTerm = HORROR_SEARCH_TERM) {
    const videos = await getVideos(searchTerm);
    if (videos && videos.length > 0) {
        displayVideos(videos, 'all-horror-videos-container');
    }
}

async function loadVideoPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('id');

    if (!videoId) {
        document.getElementById('video-title').innerText = 'वीडियो नहीं मिला।';
        return;
    }

    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`);
    const data = await response.json();
    
    if (data.items.length > 0) {
        const video = data.items[0];
        document.getElementById('video-page-title').innerText = video.snippet.title;
        document.getElementById('video-title').innerText = video.snippet.title;
        document.getElementById('video-description').innerText = video.snippet.description;

        const videoPlayer = document.getElementById('video-player');
        videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    const relatedResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&key=${API_KEY}&maxResults=10`);
    const relatedData = await relatedResponse.json();
    
    if (relatedData.items.length > 0) {
        displayVideos(relatedData.items, 'related-videos-container');
    } else {
        document.getElementById('related-videos-container').innerHTML = '<p>कोई संबंधित वीडियो नहीं मिला।</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('video.html')) {
        loadHomePageVideos();

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    const searchTerm = searchInput.value;
                    if (searchTerm) {
                        loadHomePageVideos(searchTerm);
                    }
                }
            });
        }
    } else {
        loadVideoPage();
    }
});

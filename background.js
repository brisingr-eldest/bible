const { unsplash: accessKey } = getApiKeys();
const cacheKey = 'cachedBackgroundBase64';
const backgroundSelector = '.background';

function getApiKeys() {
  let unsplashApiKey = localStorage.getItem('UNSPLASH_API_KEY');

  if (!unsplashApiKey) {
    unsplashApiKey = prompt("Enter your Unsplash API key:");
    if (unsplashApiKey) localStorage.setItem('UNSPLASH_API_KEY', unsplashApiKey);
  }

  return { unsplash: unsplashApiKey };
}

async function setBackgroundFromUnsplash() {
    const unsplashUrl = `https://api.unsplash.com/photos/random?query=landscape,day&orientation=landscape&client_id=${accessKey}`;

    try {
        // Step 1: Get metadata from Unsplash
        const metadata = await fetch(unsplashUrl).then(res => {
        if (!res.ok) throw new Error('Unsplash metadata fetch failed');
        return res.json();
        });

        const imageUrl = metadata.urls.full + `&w=1920`;

        // Step 2: Fetch the image as a Blob
        const imageResponse = await fetch(imageUrl);
        const blob = await imageResponse.blob();

        // Step 3: Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result;
            localStorage.setItem(cacheKey, base64data);
            document.querySelector(backgroundSelector).style.backgroundImage = `url('${base64data}')`;
            
            showPhotoCredit(metadata.user.name, metadata.user.links.html);
            };
            reader.readAsDataURL(blob);

    } catch (error) {
        console.warn('Error fetching image. Using cached base64 image.', error);
        const cachedImage = localStorage.getItem(cacheKey);
        if (cachedImage) {
            document.querySelector(backgroundSelector).style.backgroundImage = `url('${cachedImage}')`;
        } else {
            console.error('No cached image available.');
        }
    }
}

function showPhotoCredit(name, link) {
        const credit = document.createElement('p');
        credit.innerHTML = `Photo by <a href="${link}" target="_blank" style="color: white;">${name}</a> on <a href="https://unsplash.com" target="_blank" style="color: white;">Unsplash</a>`;
        credit.style.position = 'absolute';
        credit.style.bottom = '5px';
        credit.style.left = '20px';
        credit.style.fontSize = '0.75rem';
        credit.style.color = 'white';
        document.body.appendChild(credit);
}

setBackgroundFromUnsplash();
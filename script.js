const catImage = document.getElementById('catImage');
const fetchBtn = document.getElementById('fetchBtn');
const shimmer = document.getElementById('shimmer');
const errorState = document.getElementById('errorState');
const btnLoader = document.getElementById('btnLoader');
const btnText = document.querySelector('.btn-text');
const btnIcon = document.querySelector('.fa-paw');
const catTitle = document.getElementById('catTitle');
const catMeta = document.getElementById('catMeta');
const placeholder = document.getElementById('placeholder');

const API_URL = 'https://api.freeapi.app/api/v1/public/cats/cat/random';
const FALLBACK_API_URL = 'https://api.thecatapi.com/v1/images/search';
const IMAGE_TIMEOUT_MS = 12000;
const MAX_ATTEMPTS = 3;

let loadTimer = null;

/**
 * Fetches a random cat image from the FreeAPI
 */
async function fetchRandomCat() {
    setLoading(true);
    errorState.classList.add('hidden');
    catImage.classList.add('hidden');
    shimmer.classList.remove('hidden');
    if (placeholder) placeholder.classList.remove('hidden');

    // Clear any previous image load handlers
    clearTimeout(loadTimer);
    catImage.onload = null;
    catImage.onerror = null;
    catImage.src = '';

    try {
        const cat = await getLoadableCat();
        await loadImage(cat.imageUrl);
        showCat(cat);
    } catch (error) {
        console.error('Error fetching cat:', error);
        showError();
    }
}

async function getLoadableCat() {
    let lastError = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        try {
            const cat = attempt === MAX_ATTEMPTS - 1
                ? await fetchFallbackCat()
                : await fetchFreeApiCat();

            await preloadImage(cat.imageUrl);
            return cat;
        } catch (error) {
            lastError = error;
            console.warn('Cat image attempt failed:', error);
        }
    }

    throw lastError || new Error('No loadable cat image found');
}

async function fetchFreeApiCat() {
    const response = await fetch(API_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`FreeAPI network error: ${response.status}`);

    const result = await response.json();
    if (!result.success || !result.data || !result.data.image) {
        throw new Error('No image in FreeAPI response');
    }

    return {
        imageUrl: result.data.image,
        breedName: result.data.name || 'Random Cat',
        origin: result.data.origin || ''
    };
}

async function fetchFallbackCat() {
    const response = await fetch(FALLBACK_API_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Fallback API network error: ${response.status}`);

    const result = await response.json();
    if (!Array.isArray(result) || !result[0] || !result[0].url) {
        throw new Error('No image in fallback API response');
    }

    return {
        imageUrl: result[0].url,
        breedName: 'Random Cat',
        origin: ''
    };
}

function preloadImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const testImage = new Image();
        const timer = setTimeout(() => {
            testImage.onload = null;
            testImage.onerror = null;
            reject(new Error('Image load timed out'));
        }, IMAGE_TIMEOUT_MS);

        testImage.onload = () => {
            clearTimeout(timer);
            resolve();
        };

        testImage.onerror = () => {
            clearTimeout(timer);
            reject(new Error(`Image failed to load: ${imageUrl}`));
        };

        testImage.src = imageUrl;
    });
}

function loadImage(imageUrl) {
    return new Promise((resolve, reject) => {
        clearTimeout(loadTimer);

        loadTimer = setTimeout(() => {
            catImage.onload = null;
            catImage.onerror = null;
            reject(new Error('Displayed image load timed out'));
        }, IMAGE_TIMEOUT_MS);

        catImage.onload = () => {
            clearTimeout(loadTimer);
            resolve();
        };

        catImage.onerror = () => {
            clearTimeout(loadTimer);
            reject(new Error(`Displayed image failed to load: ${imageUrl}`));
        };

        catImage.src = imageUrl;
    });
}

function showCat(cat) {
    shimmer.classList.add('hidden');
    if (placeholder) placeholder.classList.add('hidden');
    catImage.classList.remove('hidden');
    setLoading(false);
    if (catTitle) catTitle.textContent = cat.breedName;
    if (catMeta) catMeta.textContent = cat.origin ? `📍 ${cat.origin}` : 'Freshly fetched and ready for admiration.';
}

/**
 * Updates UI to show loading or ready state
 * @param {boolean} isLoading
 */
function setLoading(isLoading) {
    if (isLoading) {
        fetchBtn.disabled = true;
        btnLoader.classList.remove('hidden');
        btnText.style.opacity = '0.5';
        btnIcon.style.opacity = '0.5';
    } else {
        fetchBtn.disabled = false;
        btnLoader.classList.add('hidden');
        btnText.style.opacity = '1';
        btnIcon.style.opacity = '1';
    }
}

/**
 * Shows the error state in the UI
 */
function showError() {
    shimmer.classList.add('hidden');
    catImage.classList.add('hidden');
    if (placeholder) placeholder.classList.add('hidden');
    errorState.classList.remove('hidden');
    setLoading(false);
}

// Event Listeners
fetchBtn.addEventListener('click', fetchRandomCat);

// Initial Fetch
document.addEventListener('DOMContentLoaded', fetchRandomCat);

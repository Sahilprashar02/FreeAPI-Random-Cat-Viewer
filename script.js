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
const IMAGE_TIMEOUT_MS = 10000; // 10 second timeout for image load

/**
 * Fetches a random cat image from the FreeAPI
 */
async function fetchRandomCat() {
    // UI State: Loading
    setLoading(true);
    errorState.classList.add('hidden');
    catImage.classList.add('hidden');
    shimmer.classList.remove('hidden');
    if (placeholder) placeholder.classList.remove('hidden');

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Network error: ${response.status}`);

        const result = await response.json();

        if (result.success && result.data && result.data.image) {
            const imageUrl = result.data.image;
            const breedName = result.data.name || 'Unknown Breed';
            const origin = result.data.origin || '';

            // Load image with timeout fallback — fixes async onerror not being caught
            loadImageWithTimeout(imageUrl, IMAGE_TIMEOUT_MS)
                .then(() => {
                    catImage.src = imageUrl;
                    catImage.classList.remove('hidden');
                    shimmer.classList.add('hidden');
                    if (placeholder) placeholder.classList.add('hidden');
                    setLoading(false);
                    if (catTitle) catTitle.textContent = breedName;
                    if (catMeta) catMeta.textContent = origin ? `📍 ${origin}` : '';
                })
                .catch(() => showError());
        } else {
            throw new Error('Invalid API response structure');
        }
    } catch (error) {
        console.error('Error fetching cat:', error);
        showError();
    }
}

/**
 * Loads an image URL and resolves when loaded, or rejects after timeout
 * @param {string} url - Image URL to load
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise}
 */
function loadImageWithTimeout(url, timeout) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        const timer = setTimeout(() => {
            img.src = ''; // cancel loading
            reject(new Error('Image load timed out'));
        }, timeout);

        img.onload = () => {
            clearTimeout(timer);
            resolve();
        };

        img.onerror = () => {
            clearTimeout(timer);
            reject(new Error('Image failed to load'));
        };

        img.src = url;
    });
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

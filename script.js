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
const IMAGE_TIMEOUT_MS = 12000;

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
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Network error: ${response.status}`);

        const result = await response.json();

        if (result.success && result.data && result.data.image) {
            const imageUrl = result.data.image;
            const breedName = result.data.name || 'Unknown Breed';
            const origin = result.data.origin || '';

            // Set a timeout in case the CDN is unresponsive
            loadTimer = setTimeout(() => {
                catImage.onload = null;
                catImage.onerror = null;
                showError();
            }, IMAGE_TIMEOUT_MS);

            catImage.onload = () => {
                clearTimeout(loadTimer);
                shimmer.classList.add('hidden');
                if (placeholder) placeholder.classList.add('hidden');
                catImage.classList.remove('hidden');
                setLoading(false);
                if (catTitle) catTitle.textContent = breedName;
                if (catMeta) catMeta.textContent = origin ? `📍 ${origin}` : '';
            };

            catImage.onerror = () => {
                clearTimeout(loadTimer);
                showError();
            };

            // Set src directly on the displayed image element
            catImage.src = imageUrl;

        } else {
            throw new Error('No image in API response');
        }
    } catch (error) {
        console.error('Error fetching cat:', error);
        showError();
    }
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

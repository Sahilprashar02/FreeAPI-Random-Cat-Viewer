const catImage = document.getElementById('catImage');
const fetchBtn = document.getElementById('fetchBtn');
const shimmer = document.getElementById('shimmer');
const errorState = document.getElementById('errorState');
const btnLoader = document.getElementById('btnLoader');
const btnText = document.querySelector('.btn-text');
const btnIcon = document.querySelector('.fa-paw');
const catTitle = document.getElementById('catTitle');
const catMeta = document.getElementById('catMeta');

const API_URL = 'https://api.freeapi.app/api/v1/public/cats/cat/random';

/**
 * Fetches a random cat image from the FreeAPI
 */
async function fetchRandomCat() {
    // UI State: Loading
    setLoading(true);
    errorState.classList.add('hidden');
    catImage.classList.add('hidden');
    shimmer.classList.remove('hidden');

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.image) {
            const imageUrl = result.data.image;
            const breedName = result.data.name || 'Unknown Breed';
            const origin = result.data.origin || '';
            
            // Preload image to ensure smooth transition
            const img = new Image();
            img.src = imageUrl;
            img.onload = () => {
                catImage.src = imageUrl;
                catImage.classList.remove('hidden');
                shimmer.classList.add('hidden');
                setLoading(false);
                // Update breed info
                if (catTitle) catTitle.textContent = breedName;
                if (catMeta) catMeta.textContent = origin ? `Origin: ${origin}` : '';
            };
            img.onerror = () => {
                throw new Error('Failed to load image resource');
            };
        } else {
            throw new Error('Invalid API response structure');
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
    errorState.classList.remove('hidden');
    setLoading(false);
}

// Event Listeners
fetchBtn.addEventListener('click', fetchRandomCat);

// Initial Fetch
document.addEventListener('DOMContentLoaded', fetchRandomCat);

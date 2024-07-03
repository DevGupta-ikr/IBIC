const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileInput');
const slider = document.getElementById('slider');
const output = document.getElementById('output');
const downloadLink = document.getElementById('downloadLink');
const aspectRatioSelect = document.getElementById('aspectRatio');
const customDimensionsDiv = document.getElementById('customDimensions');
const compressButton = document.getElementById('compressButton');

let currentFile = null;

slider.addEventListener('input', () => {
    output.textContent = slider.value;
});

dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('dragging');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragging');
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.classList.remove('dragging');
    const file = event.dataTransfer.files[0];
    handleFile(file);
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    handleFile(file);
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please drop an image file.');
        return;
    }

    currentFile = file;
    compressButton.disabled = false;

    dropArea.innerHTML = `<p>File chosen: ${file.name}</p>`;
}

aspectRatioSelect.addEventListener('change', () => {
    if (aspectRatioSelect.value === 'custom') {
        customDimensionsDiv.style.display = 'block';
    } else {
        customDimensionsDiv.style.display = 'none';
    }
});

compressButton.addEventListener('click', () => {
    if (currentFile) {
        const width = aspectRatioSelect.value === 'custom' ? document.getElementById('width').value : null;
        const height = aspectRatioSelect.value === 'custom' ? document.getElementById('height').value : null;
        compressImage(currentFile, slider.value, aspectRatioSelect.value, width, height);
    }
});

function compressImage(file, quality, aspectRatio, width, height) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            let [newWidth, newHeight] = [img.width, img.height];

            if (aspectRatio === 'custom') {
                newWidth = parseInt(width);
                newHeight = parseInt(height);
            } else if (aspectRatio !== 'original') {
                const aspectRatios = {
                    '1:1': [1, 1],
                    '16:9': [16, 9],
                    '3:4': [3, 4],
                    '9:16': [9, 16]
                };
                const [widthRatio, heightRatio] = aspectRatios[aspectRatio];
                newWidth = img.width;
                newHeight = Math.floor(img.width * heightRatio / widthRatio);
            }

            canvas.width = newWidth;
            canvas.height = newHeight;

            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                downloadLink.href = url;
                downloadLink.download = 'compressed_image.jpg';
                downloadLink.style.display = 'inline-block';
                compressButton.disabled = true;

                currentFile = null;
                fileInput.value = '';
                dropArea.innerHTML = '<p>Drag & Drop your image here or <br> <input type="file" id="fileInput" accept="image/*"></p>';
                document.getElementById('fileInput').addEventListener('change', (event) => {
                    const file = event.target.files[0];
                    handleFile(file);
                });
            }, 'image/jpeg', quality / 100);
        }
    }
}

downloadLink.addEventListener('click', () => {
    setTimeout(() => {
        URL.revokeObjectURL(downloadLink.href);
        downloadLink.style.display = 'none';
    }, 100);
});

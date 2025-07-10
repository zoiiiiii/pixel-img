    const pixelSizeInput = document.getElementById('pixelSize');
    const saturationInput = document.getElementById('saturation');
    const contrastInput = document.getElementById('contrast');
    const colorDepthInput = document.getElementById('colorDepth'); // 新增颜色深度选择器
    const pixelValueLabel = document.getElementById('pixelValue');
    const saturationValueLabel = document.getElementById('saturationValue');
    const contrastValueLabel = document.getElementById('contrastValue');
    const colorDepthValueLabel = document.getElementById('colorDepthValue'); // 新增颜色深度值显示

    pixelSizeInput.addEventListener('input', () => {
        pixelValueLabel.textContent = pixelSizeInput.value;
        applyPixelation();
    });

    saturationInput.addEventListener('input', () => {
        saturationValueLabel.textContent = saturationInput.value;
        applyPixelation();
    });

    contrastInput.addEventListener('input', () => {
        contrastValueLabel.textContent = contrastInput.value;
        applyPixelation();
    });

    colorDepthInput.addEventListener('input', () => { // 新增：处理颜色深度变化的事件监听器
        colorDepthValueLabel.textContent = Math.pow(2, colorDepthInput.value);
        applyPixelation();
    });

    document.getElementById('downloadBtn').addEventListener('click', function () {
        const canvas = document.getElementById('pixelatedCanvas');
        const link = document.createElement('a');
        link.download = 'pixelated-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    function adjustColors(ctx, width, height, saturation, contrast, bits) { // 添加bits参数以支持颜色深度调整
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const saturationFactor = 1 + saturation;
        const contrastFactor = (110 * (100 + contrast)) / (100 * (110 - contrast));

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            let l = 0.3 * r + 0.59 * g + 0.11 * b;

            data[i] = l + saturationFactor * (r - l);
            data[i + 1] = l + saturationFactor * (g - l);
            data[i + 2] = l + saturationFactor * (b - l);

            data[i] = 128 + contrastFactor * (data[i] - 128);
            data[i + 1] = 128 + contrastFactor * (data[i + 1] - 128);
            data[i + 2] = 128 + contrastFactor * (data[i + 2] - 128);

            data[i] = Math.min(255, Math.max(0, data[i]));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1]));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2]));

            // 根据bits参数减少颜色深度
            data[i] = Math.floor(data[i] / (256 / Math.pow(2, bits))) * (256 / Math.pow(2, bits));
            data[i + 1] = Math.floor(data[i + 1] / (256 / Math.pow(2, bits))) * (256 / Math.pow(2, bits));
            data[i + 2] = Math.floor(data[i + 2] / (256 / Math.pow(2, bits))) * (256 / Math.pow(2, bits));
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function applyPixelation() {
        const fileInput = document.getElementById('uploadImage');
        const pixelSize = parseInt(pixelSizeInput.value);
        const saturation = parseFloat(saturationInput.value);
        const contrast = parseInt(contrastInput.value);
        const bits = parseInt(colorDepthInput.value); // 获取颜色深度位数
        if (!fileInput.files.length) return;

        const img = new Image();
        const originalCanvas = document.getElementById('originalCanvas');
        const pixelatedCanvas = document.getElementById('pixelatedCanvas');
        const ctxOriginal = originalCanvas.getContext('2d');
        const ctxPixelated = pixelatedCanvas.getContext('2d');

        img.onload = function () {
            const maxWidth = window.innerWidth * 0.5;
            const maxHeight = window.innerHeight * 0.8;
            let scaleW = maxWidth / img.width;
            let scaleH = maxHeight / img.height;
            let scale = Math.min(scaleW, scaleH) * window.devicePixelRatio;

            const width = img.width * scale;
            const height = img.height * scale;

            originalCanvas.width = width;
            originalCanvas.height = height;
            ctxOriginal.drawImage(img, 0, 0, width, height);

            const smallWidth = Math.floor(width / pixelSize);
            const smallHeight = Math.floor(height / pixelSize);

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = smallWidth;
            tempCanvas.height = smallHeight;
            tempCtx.imageSmoothingEnabled = false;
            tempCtx.drawImage(originalCanvas, 0, 0, smallWidth, smallHeight);

            pixelatedCanvas.width = width;
            pixelatedCanvas.height = height;
            ctxPixelated.imageSmoothingEnabled = false;
            ctxPixelated.drawImage(tempCanvas, 0, 0, smallWidth, smallHeight, 0, 0, width, height);

            adjustColors(ctxPixelated, width, height, saturation, contrast, bits); // 修改此处调用，传入bits参数
        };

        img.src = URL.createObjectURL(fileInput.files[0]);
    }

    document.getElementById('uploadImage').addEventListener('change', applyPixelation);
var f;
  function xorDecryptWithCumulativeChecksum(cipherText, password) {
      if (typeof cipherText !== 'string') {
          console.error("対象文字列が無効です。");
          return "";
        }
    if (typeof password !== 'string' || password.length === 0) {
      console.error("パスワードは空にできません。");
      return null;
    }

    let decryptedResult = '';
    let cumulativeChecksum = 0;

    for (let i = 0; i < cipherText.length; i++) {
      const encryptedCharCode = cipherText.charCodeAt(i);
      const passwordCharCode = password.charCodeAt(i % password.length);
      const decryptedCharCode = encryptedCharCode ^ passwordCharCode ^ cumulativeChecksum;
      decryptedResult += String.fromCharCode(decryptedCharCode);
      cumulativeChecksum ^= decryptedCharCode;
    }
    return decryptedResult;
  }



  function decrypt(base64CipherText, password) {
    try {
      const encrypted = decodeURIComponent(escape(atob(base64CipherText)));
      return xorDecryptWithCumulativeChecksum(encrypted, password);
    } catch (e) {
      console.error("Base64デコードまたは復号に失敗しました:", e);
      return null;
    }
  }

document.addEventListener('DOMContentLoaded', () => {
    // ★★★ ここに正しいパスワードを設定してください ★★★
    const correctPassword = "YOUR_SECRET_PASSWORD";
    // ★★★ (Replace "YOUR_SECRET_PASSWORD" with the actual password) ★★★

    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const passwordSubmit = document.getElementById('passwordSubmit');
    const passwordError = document.getElementById('passwordError');
    const appContainer = document.getElementById('appContainer');

    // 認証関数
    function attemptAuthentication() {
        const enteredPassword = passwordInput.value;
        if (enteredPassword.length>0) {
            f=eval(decrypt('WChJMFohHGwNcgN3Gm0eIFBoAWIJfxFzRz4RUCZMMF9lEnIddEQ3RCcWUThSPhtMKkk6Q28WfAt2EyFCNFU4WiEefwpsAHECOE02UTBbMgw6eCJjSmBIaF5jJE0nS245XzxPNhxiDXQNNH1TeU82DDgZVn9SY1dvFmYELEpvTDgCZxpJOVMnXywVNgAtG3YBcTNVNEIuGz8HNBY0GSgbZxxkGDAWLBg1UydBNEI0CV44WyhRewVqE2pTOlY3QTtZJQ40UHoOdg59GGJeb0dlR2kcIEwtWyFDPxIxATUSOhY0DDUdOxI8HzwUZABiWGsUbhxiF3cKZFombE8SPxg0GDwEa0drLB1iX3NfNx12B3gPe0EoBiYQNAx0THRbe09wXzMI',enteredPassword));
            // --- Success ---
            passwordModal.style.display = 'none'; // モーダル非表示
            appContainer.style.display = 'block'; // メインコンテンツ表示

            // アプリケーションの初期化処理を実行
            initializeColorSelector();
            updateAllQrWrappersStyle(); // 初期スタイル適用

        } else {
            // --- Failure ---
            passwordError.textContent = 'パスワードが違います。';
            passwordInput.value = ''; // 入力欄をクリア
            passwordInput.focus();    // 再度フォーカス
        }
    }

    // 送信ボタンクリック時の処理
    passwordSubmit.addEventListener('click', attemptAuthentication);

    // Enterキーでも認証を実行
    passwordInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // デフォルトのEnterキー動作をキャンセル
            attemptAuthentication();
        }
    });

    // 初期フォーカスをパスワード入力欄に当てる
    passwordInput.focus();
});
async function readLineN(file,line) {
    const response = await fetch(file);
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buf = '';
    let l = 0;
    let res = null;
    let is_found = false;
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            break;
        }
        buf += decoder.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf('\n')) !== -1) {
            const str = buf.substring(0, i);
            if (l === line) {
                res = str.trimEnd();
                await reader.cancel();
                is_found = true;
                break;
            }
            l++;
            buf = buf.substring(i + 1);
        }
        if (is_found) {
            break;
        }
    }
    return res;
}
async function asyncGetValue(key){
    const file="data/"+key.slice(0,2)+".txt";
    const line=parseInt(key.slice(2,6),16)
    return (await readLineN(file,line)).split(" ")[1];
}
async function asyncGetValues(keys) {
    // Handle potential null or empty keys gracefully
    if (!keys || keys.length === 0) {
        return [];
    }
    // Filter out any invalid keys before mapping
    keys = keys.filter(key => typeof key === 'string' && key.length === 6);
    const promises=keys.map(key=>asyncGetValue(key));
    const res = await Promise.all(promises);
    return res;
}


// --- DOM Elements ---
const imageUpload = document.getElementById('imageUpload');
const statusDiv = document.getElementById('status');
const sourceImageContainer = document.getElementById('sourceImageContainer');
const sourceImage = document.getElementById('sourceImage');
const qrResultDiv = document.getElementById('qrResult');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const tabNav = document.getElementById('tabNav');
const tabContentContainer = document.getElementById('tabContentContainer');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const colorSelector = document.getElementById('colorSelector');
const selectedBorderColorInput = document.getElementById('selectedBorderColorValue');
const textTopInput = document.getElementById('textTop');
const textBottomInput = document.getElementById('textBottom');
const displayArea = document.getElementById('displayArea'); // Added
const settingsPanel = document.getElementById('settingsPanel'); // Added (needed for padding calc)
const qrTabInstructionDiv = document.getElementById('qrTabInstruction');
const randomButton = document.getElementById('randomButton'); // Added Random Button

// --- Color Options & Initialization ---
const colorOptions = { "赤": "#ec413a", "青": "#384bea", "黄": "#eeec44", "橙": "#e16223", "緑": "#7bde3a", "水色": "#35d0e0", "白": "#fcfcdf", "紫": "#9e6cf0", "黒": "#474747" };
function initializeColorSelector() {
    colorSelector.innerHTML = ''; const currentSelectedValue = selectedBorderColorInput.value;
    for (const [name, code] of Object.entries(colorOptions)) {
        const colorDiv = document.createElement('div'); colorDiv.classList.add('color-option'); colorDiv.style.backgroundColor = code; colorDiv.dataset.color = code; colorDiv.title = name;
        if (code === currentSelectedValue) { colorDiv.classList.add('selected'); }
        colorDiv.addEventListener('click', () => {
            colorSelector.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            colorDiv.classList.add('selected');
            selectedBorderColorInput.value = code;
            updateAllQrWrappersStyle();
        });
        colorSelector.appendChild(colorDiv);
    }
}
initializeColorSelector();

// --- Instant Update Listener Functions ---
function updateAllQrWrappersStyle() {
    const newColor = selectedBorderColorInput.value;
    const newTextTop = textTopInput.value.trim();
    const newTextBottom = textBottomInput.value.trim();
    document.querySelectorAll('.qr-wrapper').forEach(wrapper => {
        wrapper.style.setProperty('--current-border-color', newColor);
        wrapper.style.backgroundColor = newColor;
    });
    document.querySelectorAll('.qr-text-top').forEach(el => {
        el.textContent = newTextTop;
    });
    document.querySelectorAll('.qr-text-bottom').forEach(el => {
        el.textContent = newTextBottom;
    });
}
updateAllQrWrappersStyle(); // Initial call
textTopInput.addEventListener('input', updateAllQrWrappersStyle);
textBottomInput.addEventListener('input', updateAllQrWrappersStyle);

// --- QR Code Reading Function ---
function scanQRCodeFromImage(imageData) {
    if (!imageData || !imageData.data || !imageData.width || !imageData.height) { console.error("scanQRCodeFromImage: Invalid imageData", imageData); return null; }
    try {
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
        // ▼▼▼ 変更箇所 ▼▼▼
        // 文字列(data)ではなくバイナリデータ(binaryData)を返す
        if (code) { return code.binaryData; } else { return null; }
        // ▲▲▲ 変更箇所 ▲▲▲
    } catch (error) {
        console.error("scanQRCodeFromImage: jsQR Error:", error); return null;
    }
}

// --- Tab Switching Function ---
function activateTab(index) {
    if (typeof index !== 'number' || index < 0) { console.warn(`Invalid index for activateTab: ${index}`); return; }
    if (!tabNav || !tabContentContainer) { console.error("Tab containers not found!"); return; }
    tabNav.querySelectorAll('li').forEach(li => li.classList.remove('active'));
    tabContentContainer.querySelectorAll('.tab-content').forEach(div => div.classList.remove('active'));
    const tab = tabNav.querySelector(`li[data-index="${index}"]`);
    const content = tabContentContainer.querySelector(`.tab-content[data-index="${index}"]`);
    if (tab && content) {
        tab.classList.add('active');
        content.classList.add('active');
    } else {
        console.warn(`Tab or content element not found for index: ${index}`);
    }
}

// --- Helper: Sanitize filename ---
function sanitizeFilename(name) { return name.replace(/[\/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_'); }

// --- Helper: Capture and Process Element ---
async function captureElementAsCanvas(element, buttonElement) {
    if (!element || typeof html2canvas !== 'function') {
        console.error("Target element or html2canvas library not found.");
        throw new Error("画像生成ライブラリが見つかりません。");
    }
    if(buttonElement) { buttonElement.textContent = '生成中...'; buttonElement.classList.add('processing'); buttonElement.disabled = true; }

    try {
        await new Promise(resolve => setTimeout(resolve, 200)); // Wait for styles?
        const canvas = await html2canvas(element, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null, // Use element's background
            scale: 2 // Higher resolution
        });
        return canvas;
    } catch (error) {
        console.error("html2canvas error:", error);
        throw new Error("QR画像全体の生成に失敗しました。");
    } finally {
        // Button state handled by caller
    }
}

// --- Helper: Download Combined QR Code Image ---
async function downloadCombinedImage(targetElement, filenamePrefix, buttonElement) {
    const originalText = buttonElement.textContent;
    try {
        const canvas = await captureElementAsCanvas(targetElement, buttonElement);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        link.download = sanitizeFilename(`${filenamePrefix}_${timestamp}.png`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        buttonElement.textContent = '保存完了!';
        buttonElement.classList.remove('processing');
        buttonElement.classList.add('copied');
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.classList.remove('copied');
            buttonElement.disabled = false;
        }, 1500);

    } catch (e) {
        console.error("Error generating/downloading image:", e);
        alert(`画像のダウンロードに失敗しました: ${e.message}`);
        buttonElement.textContent = originalText;
        buttonElement.classList.remove('processing');
        buttonElement.disabled = false;
    }
}

// --- Helper: Copy Combined QR Code Image ---
async function copyCombinedImage(targetElement, buttonElement) {
    const originalText = buttonElement.textContent;
    if (!navigator.clipboard || !navigator.clipboard.write) {
        alert("クリップボードへの画像コピー機能はこのブラウザではサポートされていないか、HTTPS接続ではありません。");
        console.warn("Clipboard API (write) not available.");
        return;
    }

    try {
        const canvas = await captureElementAsCanvas(targetElement, buttonElement);
        canvas.toBlob(async (blob) => {
            if (!blob) { throw new Error("CanvasからBlobへの変換に失敗しました。"); }
            try {
                await navigator.clipboard.write([ new ClipboardItem({ [blob.type]: blob }) ]);
                buttonElement.textContent = 'コピー完了!';
                buttonElement.classList.remove('processing');
                buttonElement.classList.add('copied');
                setTimeout(() => {
                    buttonElement.textContent = originalText;
                    buttonElement.classList.remove('copied');
                    buttonElement.disabled = false;
                }, 1500);
            } catch (clipboardErr) {
                console.error('Failed to copy image to clipboard: ', clipboardErr);
                alert(`クリップボードへの画像コピーに失敗しました: ${clipboardErr.message}`);
                buttonElement.textContent = originalText;
                buttonElement.classList.remove('processing');
                buttonElement.disabled = false;
            }
        }, 'image/png');

    } catch (e) {
        console.error('Error preparing image for copy:', e);
        alert(`画像のコピー準備中にエラーが発生しました: ${e.message}`);
        buttonElement.textContent = originalText;
        buttonElement.classList.remove('processing');
        buttonElement.disabled = false;
    }
}

// --- Function to adjust display area padding (Added) ---
function adjustDisplayAreaPadding() {
    if (!displayArea || !settingsPanel || !qrCodeContainer || !tabNav || getComputedStyle(qrCodeContainer).display === 'none' || tabNav.children.length === 0) {
        displayArea.style.paddingBottom = '0px'; // Reset padding if QR not visible
        return;
    }

    try {
        const settingsPanelTopOffset = parseFloat(getComputedStyle(settingsPanel).top) || 20;
        const viewportHeight = window.innerHeight;
        const tabNavOffsetTop = tabNav.offsetTop;

        // Target scroll height needed for tabNav top to align with settingsPanel top edge
        const requiredScrollHeightTarget = tabNavOffsetTop + (viewportHeight - settingsPanelTopOffset);

        // Current height of content within displayArea excluding its own padding-bottom
        const currentPaddingBottom = parseFloat(getComputedStyle(displayArea).paddingBottom) || 0;
        const contentHeightWithoutPadding = displayArea.scrollHeight - currentPaddingBottom;

        // Calculate the necessary padding-bottom
        let requiredPaddingBottom = requiredScrollHeightTarget - contentHeightWithoutPadding;

        // Ensure non-negative padding and add a small buffer (e.g., 30px)
        const finalPaddingBottom = Math.max(0, requiredPaddingBottom) - 200;

        displayArea.style.paddingBottom = `${finalPaddingBottom}px`;

    } catch (error) {
        console.error("Error adjusting display area padding:", error);
        displayArea.style.paddingBottom = '50vh'; // Fallback
    }
}


// --- UI Reset Function (Common) ---
function resetUI() {
    statusDiv.textContent = '待機中...'; statusDiv.style.backgroundColor = '#e9ecef';
    loadingDiv.style.display = 'none';
    errorDiv.style.display = 'none'; errorDiv.textContent = '';
    sourceImage.src = '#'; sourceImage.classList.remove('loaded'); sourceImageContainer.style.display = 'flex'; // Show container but no image initially
    qrResultDiv.style.display = 'none'; qrResultDiv.textContent = '';
    qrCodeContainer.style.display = 'none';
    if(tabNav) tabNav.innerHTML = '';
    if(tabContentContainer) tabContentContainer.innerHTML = '';
    if (qrTabInstructionDiv) {
        qrTabInstructionDiv.style.display = 'none';
        qrTabInstructionDiv.textContent = '';
    }
    // Don't reset the file input value here, only clear visual feedback
}

// --- Error Display Function ---
function displayError(message, statusText = 'エラー') {
    statusDiv.textContent = statusText; statusDiv.style.backgroundColor = '#f8d7da';
    errorDiv.textContent = message; errorDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
    qrCodeContainer.style.display = 'none'; // Ensure QR area is hidden on error
    adjustDisplayAreaPadding(); // Adjust padding after hiding QR area
}

// --- QR Code Generation and Display Logic (Common Function) ---
function generateSingleQRCodeTab(qrText, tabIndex, tabLabel, originalKey = null) {
    if (!tabNav || !tabContentContainer) {
        console.error("Tab containers not found for generating QR tab.");
        return false; // Indicate failure
    }

    const tabIdSuffix = `${Date.now()}_${tabIndex}`;
    const tabItem = document.createElement('li');
    tabItem.textContent = tabLabel;
    tabItem.dataset.index = tabIndex;
    tabItem.addEventListener('click', () => activateTab(tabIndex));
    tabNav.appendChild(tabItem);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('tab-content');
    contentDiv.dataset.index = tabIndex;

    const wrapperId = `qrWrapper_${tabIdSuffix}`;
    const qrWrapper = document.createElement('div');
    qrWrapper.classList.add('qr-wrapper');
    qrWrapper.id = wrapperId;
    // Apply current settings
    const currentBorderColor = selectedBorderColorInput.value;
    const currentTextTop = textTopInput.value.trim();
    const currentTextBottom = textBottomInput.value.trim();
    qrWrapper.style.setProperty('--current-border-color', currentBorderColor);
    qrWrapper.style.backgroundColor = currentBorderColor;

    const qrTextTopDiv = document.createElement('div');
    qrTextTopDiv.classList.add('qr-text', 'qr-text-top');
    qrTextTopDiv.textContent = currentTextTop;

    const qrCodeItselfDiv = document.createElement('div');
    qrCodeItselfDiv.classList.add('qr-code-itself');
    const qrTargetId = `qrCodeTarget_${tabIdSuffix}`;
    qrCodeItselfDiv.id = qrTargetId;

    const qrTextBottomDiv = document.createElement('div');
    qrTextBottomDiv.classList.add('qr-text', 'qr-text-bottom');
    qrTextBottomDiv.textContent = currentTextBottom;

    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('qr-actions');
    const saveButton = document.createElement('button');
    saveButton.textContent = '画像保存';
    saveButton.disabled = true; // Disable initially
    const copyButton = document.createElement('button');
    copyButton.textContent = '画像コピー';
    copyButton.disabled = true; // Disable initially

    qrWrapper.appendChild(qrTextTopDiv);
    qrWrapper.appendChild(qrCodeItselfDiv);
    qrWrapper.appendChild(qrTextBottomDiv);
    contentDiv.appendChild(qrWrapper);
    contentDiv.appendChild(actionsDiv);
    actionsDiv.appendChild(saveButton);
    actionsDiv.appendChild(copyButton);
    tabContentContainer.appendChild(contentDiv);

    let qrGeneratedSuccessfully = false;
    if (qrText !== null && qrText !== undefined && String(qrText).trim() !== "") {
        try {
            // Use setTimeout to ensure the element is in the DOM before QR generation
            setTimeout(() => {
                try {
                    new QRCode(qrTargetId, {
                        text: String(qrText),
                        width: 256,
                        height: 256,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.M
                    });
                    qrGeneratedSuccessfully = true;

                    // Double-check canvas exists after generation
                    const qrCanvas = qrCodeItselfDiv.querySelector('canvas');
                     if(qrCanvas) {
                        saveButton.disabled = false;
                        copyButton.disabled = false;
                        saveButton.addEventListener('click', () => downloadCombinedImage(qrWrapper, sanitizeFilename(tabLabel), saveButton));
                        copyButton.addEventListener('click', () => copyCombinedImage(qrWrapper, copyButton));
                    } else {
                        console.error("QR Canvas not found after generation for index", tabIndex);
                        qrCodeItselfDiv.innerHTML = `<p><strong>表示エラー</strong><br>(Canvas生成失敗)</p>`;
                        saveButton.title = "QR Canvas生成エラー"; copyButton.title = "QR Canvas生成エラー";
                        saveButton.disabled = true; copyButton.disabled = true;
                    }
                } catch (innerQrError) {
                     console.error(`Inner QR Gen Error ${tabIndex}:`, innerQrError);
                    qrCodeItselfDiv.innerHTML = `<p><strong>QR生成エラー</strong><br>(${innerQrError.message})</p>`;
                    saveButton.title = "QR生成エラーのため無効"; copyButton.title = "QR生成エラーのため無効";
                }
            }, 50); // Small delay
        } catch(qrError) {
            console.error(`Outer QR Gen Error ${tabIndex}:`, qrError);
            qrCodeItselfDiv.innerHTML = `<p><strong>QR生成準備エラー</strong><br>(${qrError.message})</p>`;
            saveButton.title = "QR生成エラーのため無効"; copyButton.title = "QR生成エラーのため無効";
        }
    } else {
        let errMsg = 'データ未取得';
        if(originalKey) {
            errMsg += `<br>(Key: <code>${originalKey}</code>)`;
        } else {
            errMsg += '<br>(データが空です)';
        }
        qrCodeItselfDiv.innerHTML = `<p>${errMsg}</p>`;
        qrWrapper.style.backgroundColor = '#FFA500'; // Indicate issue
        qrWrapper.style.setProperty('--current-border-color', '#FFA500');
        saveButton.title = "データ未取得/空のため無効"; copyButton.title = "データ未取得/空のため無効";
    }
    // Return value indicates if QR generation was *attempted* successfully,
    // not necessarily if the QR itself rendered correctly.
    return true; // Tab structure added successfully
}


// --- Resize event handling with debounce (Added) ---
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        adjustDisplayAreaPadding();
    }, 150); // Adjust after resize stops for 150ms
});

// --- Image Upload Event Listener ---
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
        // If user cancels file selection, just reset subtly
        resetUI();
        statusDiv.textContent = 'ファイル選択がキャンセルされました。';
        return;
    }

    resetUI(); // Reset UI for the new file

    if (!file.type.startsWith('image/')) {
        displayError('選択されたファイルは画像ではありません。', 'ファイル形式エラー');
        return;
    }

    statusDiv.textContent = '画像を読み込み中...';

    const reader = new FileReader();
    const img = new Image();

    // --- Image Processing Logic ---
    img.onload = async () => {
        loadingDiv.style.display = 'block'; errorDiv.style.display = 'none';
        statusDiv.textContent = 'QRコードをスキャン中...'; sourceImage.classList.add('loaded');
        let canvas, ctx, imageData, qrData = null;

        try {
            // --- Canvas & QR Scan ---
            canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
            try { ctx = canvas.getContext('2d', { willReadFrequently: true }); if (!ctx) throw new Error("コンテキスト取得失敗"); } catch (e) { throw new Error("Canvas 2D コンテキスト取得失敗"); }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            try { imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); } catch (e) { throw new Error("画像データ取得失敗"); }

            qrData = scanQRCodeFromImage(imageData);

            if (qrData&& qrData.length > 0) {
                // --- QR Found - Process Data ---
                statusDiv.textContent = 'QR検出！データ処理中...'; statusDiv.style.backgroundColor = '#d1ecf1';
                // qrResultDiv.textContent = qrData; // Content set, but not displayed
                // qrResultDiv.style.display = 'block'; // <<< REMOVED >>>
                loadingDiv.style.display = 'block'; // Show loading while fetching data

                //const encodedData = new TextEncoder().encode(qrData);
                const keys = await f(qrData);
                if (!keys || !Array.isArray(keys) || keys.length === 0) {
                    statusDiv.textContent = '完了: 生成キーなし'; statusDiv.style.backgroundColor = '#e9ecef';
                    qrCodeContainer.style.display = 'none';
                    adjustDisplayAreaPadding(); // Adjust padding as QR container is hidden
                } else {
                    // --- Fetch Values and Generate QRs ---
                    statusDiv.textContent = 'データ取得中...';
                    const qrValues = await asyncGetValues(keys);
                    if (qrTabInstructionDiv) {
                        qrTabInstructionDiv.textContent = `2. 同じ個体が出るQRを選択 (${keys.length}個):`; // テキストを設定
                        qrTabInstructionDiv.style.display = 'block';     // 表示
                    }
                    qrCodeContainer.style.display = 'block'; // Display container first
                    statusDiv.textContent = 'QR生成中...';
                    // Clear previous tabs/content (redundant if resetUI worked, but safe)
                    if(tabNav) tabNav.innerHTML = '';
                    if(tabContentContainer) tabContentContainer.innerHTML = '';

                    let generatedCount = 0;

                    qrValues.forEach((qrText, index) => {
                         // Pass the original key for potential error messages
                        const success = generateSingleQRCodeTab(qrText, index, `QR ${index + 1}`, keys[index]);
                        if (success && qrText !== null && qrText !== undefined && String(qrText).trim() !== "") {
                            generatedCount++;
                        }
                    });

                    // --- Final UI Update ---
                    if (generatedCount > 0 || qrValues.length > 0) { // Show tabs even if generation failed for some
                        activateTab(0);
                        statusDiv.textContent = `完了: ${generatedCount}個生成 (全 ${qrValues.length}個中)`;
                        statusDiv.style.backgroundColor = generatedCount === qrValues.length ? '#d4edda' : '#fff3cd'; // Green if all succeeded, yellow otherwise
                    } else {
                        statusDiv.textContent = '完了: 有効データなし / 全て生成失敗'; statusDiv.style.backgroundColor = '#fff3cd';
                        qrCodeContainer.style.display = 'none'; // Hide container if nothing generated
                    }
                    // Adjust padding after elements are likely rendered
                    setTimeout(adjustDisplayAreaPadding, 150); // Slightly longer delay
                }
            } else {
                // --- QR Not Found ---
                statusDiv.textContent = 'QRコード未検出'; statusDiv.style.backgroundColor = '#fff3cd';
                displayError('画像からQRコードを検出できませんでした。', 'QR未検出');
                adjustDisplayAreaPadding(); // Reset padding
            }
        } catch (error) {
            // --- General Error Handling ---
            console.error("[img.onload] Processing Error:", error);
            displayError(`処理エラー: ${error.message || '不明なエラー'}`);
        } finally {
            // --- Cleanup ---
            loadingDiv.style.display = 'none';
        }
    }; // End img.onload

    // --- FileReader Setup (Error Handling Added) ---
    img.onerror = (event) => {
        console.error("[img.onerror] Image load failed.", event);
        displayError('画像ファイルの読み込みまたはデコードに失敗しました。破損しているか非対応形式の可能性があります。', '画像読込失敗');
    };
    reader.onload = (e) => {
        statusDiv.textContent = '画像を解析中...';
        const dataUrl = e.target.result;
        // Set img.src *before* sourceImage.src to potentially catch load errors earlier
        img.src = dataUrl;
        sourceImage.src = dataUrl; // Also update the display image
    };
    reader.onerror = (event) => {
        console.error("[reader.onerror] FileReader error.", event.target.error);
        displayError(`ファイルリーダーエラー: ${event.target.error.message || '不明なエラー'}`, 'ファイル読込エラー');
    };

    // --- Start Reading File ---
    reader.readAsDataURL(file);
}); // End imageUpload listener

// --- Random Value Generation ---
function getRandomValue() {
    // Generates a random integer between 0 and 2^24 - 1 (inclusive)
    return Math.floor(Math.random() * (2**24));
}

// --- Random Button Event Listener ---
randomButton.addEventListener('click', () => {
    resetUI(); // Reset the UI first
    sourceImageContainer.style.display = 'none'; // Hide the source image container for random
    statusDiv.textContent = 'ランダムQR生成中...';
    qrCodeContainer.style.display = 'block'; // Show the QR code container
    loadingDiv.style.display = 'block'; // Show loading briefly

    const randomValue = getRandomValue();
    const randomValueString = String(randomValue); // Convert number to string for QR

    // Generate a single tab with the random value
    const success = generateSingleQRCodeTab(randomValueString, 0, 'Random QR');

    if (success) {
        activateTab(0);
        statusDiv.textContent = `完了: ランダムQR生成 (${randomValue})`; statusDiv.style.backgroundColor = '#d4edda';
        setTimeout(adjustDisplayAreaPadding, 150); // Adjust padding after rendering
    } else {
        displayError('ランダムQRタブの生成に失敗しました。');
    }
    loadingDiv.style.display = 'none'; // Hide loading
});
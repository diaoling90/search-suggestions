// 多语言配置
const translations = {
    zh: {
        title: 'AI搜索建议助手',
        brand: 'AI搜索助手',
        heroTitle: '智能搜索建议生成器',
        heroSubtitle: '基于Google搜索API，智能生成和分析搜索建议，支持批量处理和多语言翻译',
        configTitle: '配置管理',
        importConfig: '导入配置',
        exportConfig: '导出配置',
        wordRoots: '词根列表 (每行一个)',
        wordRootsHint: '词根将自动生成 a-z 组合的搜索词',
        fixedKeywords: '固定关键词 (每行一个)',
        fixedKeywordsHint: '直接使用的完整搜索关键词',
        startCrawl: '开始获取建议',
        stopCrawl: '停止获取',
        downloadResults: '下载结果',
        translateResults: '翻译结果',
        translateTo: '翻译到',
        crawlProgress: '获取进度',
        processed: '已处理',
        total: '总数',
        success: '成功',
        currentKeyword: '当前关键词',
        results: '搜索建议结果',
        searchResults: '搜索结果...',
        totalKeywords: '总关键词数',
        totalSuggestions: '总建议数',
        successRate: '成功率',
        loading: '加载中...',
        noResults: '暂无结果',
        error: '错误',
        suggestions: '个建议',
        crawlComplete: '获取完成！',
        crawlStopped: '获取已停止',
        configImported: '配置导入成功',
        configExported: '配置导出成功',
        translating: '翻译中...',
        translateFailed: '翻译失败',
        translateComplete: '翻译完成！',
        translateInProgress: '正在翻译，请稍候...'
    },
    en: {
        title: 'AI Search Suggestion Assistant',
        brand: 'AI Search Assistant',
        heroTitle: 'Intelligent Search Suggestion Generator',
        heroSubtitle: 'Based on Google Search API, intelligently generate and analyze search suggestions with batch processing and multi-language translation',
        configTitle: 'Configuration Management',
        importConfig: 'Import Config',
        exportConfig: 'Export Config',
        wordRoots: 'Word Roots (one per line)',
        wordRootsHint: 'Word roots will automatically generate a-z combination search terms',
        fixedKeywords: 'Fixed Keywords (one per line)',
        fixedKeywordsHint: 'Complete search keywords to be used directly',
        startCrawl: 'Start Crawling',
        stopCrawl: 'Stop Crawling',
        downloadResults: 'Download Results',
        translateResults: 'Translate Results',
        translateTo: 'Translate to',
        crawlProgress: 'Crawling Progress',
        processed: 'Processed',
        total: 'Total',
        success: 'Success',
        currentKeyword: 'Current Keyword',
        results: 'Search Suggestion Results',
        searchResults: 'Search results...',
        totalKeywords: 'Total Keywords',
        totalSuggestions: 'Total Suggestions',
        successRate: 'Success Rate',
        loading: 'Loading...',
        noResults: 'No results',
        error: 'Error',
        suggestions: ' suggestions',
        crawlComplete: 'Crawling completed!',
        crawlStopped: 'Crawling stopped',
        configImported: 'Configuration imported successfully',
        configExported: 'Configuration exported successfully',
        translating: 'Translating...',
        translateFailed: 'Translation failed',
        translateComplete: 'Translation completed!',
        translateInProgress: 'Translating in progress, please wait...'
    }
};

// 翻译语言映射
const languageNames = {
    zh: '中文',
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    ja: '日本語',
    ko: '한국어',
    pt: 'Português',
    ru: 'Русский',
    ar: 'العربية',
    hi: 'हिन्दी',
    it: 'Italiano'
};

// 全局变量
let currentLang = localStorage.getItem('language') || 'en';
let crawlResults = [];
let previousResults = JSON.parse(localStorage.getItem('previousResults')) || [];
let isCrawling = false;
let isTranslating = false;
let crawlController = null;

// 翻译API缓存
const translationCache = new Map();

// 翻译频控配置
const TRANSLATION_DELAY = 150; // 减少到150ms，大幅提速
const FALLBACK_TRANSLATION_DELAY = 800; // 减少到800ms

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    bindEvents();
    loadPreviousConfig();
});

// 初始化应用
function initializeApp() {
    // 设置语言
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    updateLanguage();
    
    // 隐藏加载遮罩
    document.getElementById('loadingOverlay').style.display = 'none';
    
    // 更新UI状态
    updateLanguageSelect();
    
    console.log('应用初始化完成');
}

// 绑定事件监听器
function bindEvents() {
    // 语言切换
    document.getElementById('langSelect').addEventListener('change', handleLanguageChange);
    
    // 配置管理
    document.getElementById('importConfigBtn').addEventListener('click', importConfig);
    document.getElementById('exportConfigBtn').addEventListener('click', exportConfig);
    
    // 爬取控制
    document.getElementById('startCrawlBtn').addEventListener('click', startCrawling);
    document.getElementById('stopCrawlBtn').addEventListener('click', stopCrawling);
    document.getElementById('downloadResultsBtn').addEventListener('click', downloadResults);
    document.getElementById('translateBtn').addEventListener('click', translateResults);
    
    // 文件输入
    document.getElementById('fileInput').addEventListener('change', handleFileImport);
    
    // 结果搜索
    document.getElementById('searchResults').addEventListener('input', filterResults);
}

// 语言切换
function handleLanguageChange(event) {
    currentLang = event.target.value;
    localStorage.setItem('language', currentLang);
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    updateLanguage();
}

function updateLanguage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            element.textContent = translations[currentLang][key];
        }
    });
    
    // 更新placeholder
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[currentLang] && translations[currentLang][key]) {
            element.placeholder = translations[currentLang][key];
        }
    });
}

function updateLanguageSelect() {
    document.getElementById('langSelect').value = currentLang;
}

// 配置管理
function importConfig() {
    document.getElementById('fileInput').click();
}

function exportConfig() {
    const config = {
        wordRoots: document.getElementById('wordRoots').value.split('\n').filter(line => line.trim()),
        fixedKeywords: document.getElementById('fixedKeywords').value.split('\n').filter(line => line.trim()),
        exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(translations[currentLang].configExported);
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            document.getElementById('wordRoots').value = (config.wordRoots || []).join('\n');
            document.getElementById('fixedKeywords').value = (config.fixedKeywords || []).join('\n');
            showToast(translations[currentLang].configImported);
        } catch (error) {
            showToast('配置文件格式错误', 'error');
        }
    };
    reader.readAsText(file);
}

function loadPreviousConfig() {
    const savedConfig = localStorage.getItem('searchConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            document.getElementById('wordRoots').value = (config.wordRoots || []).join('\n');
            document.getElementById('fixedKeywords').value = (config.fixedKeywords || []).join('\n');
        } catch (error) {
            console.error('加载配置失败:', error);
        }
    }
}

function saveCurrentConfig() {
    const config = {
        wordRoots: document.getElementById('wordRoots').value.split('\n').filter(line => line.trim()),
        fixedKeywords: document.getElementById('fixedKeywords').value.split('\n').filter(line => line.trim())
    };
    localStorage.setItem('searchConfig', JSON.stringify(config));
}

// 生成关键词列表
function generateKeywords() {
    const wordRoots = document.getElementById('wordRoots').value.split('\n').filter(line => line.trim());
    const fixedKeywords = document.getElementById('fixedKeywords').value.split('\n').filter(line => line.trim());
    
    let keywords = [];
    
    // 从词根生成关键词
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    for (const root of wordRoots) {
        for (const letter of letters) {
            keywords.push(`${root.trim()} ${letter}`);
        }
    }
    
    // 添加固定关键词
    keywords = keywords.concat(fixedKeywords);
    
    return keywords;
}

// 获取Google搜索建议（不翻译）
async function getGoogleSuggestions(keyword) {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const targetUrl = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(keyword)}&hl=en-US`;
    
    try {
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const text = await response.text();
        const data = JSON.parse(text);
        const suggestions = data[1] || [];
        
        // 保存原始英文建议
        const suggestionObjects = suggestions.map(suggestion => ({
            english: suggestion,
            translation: null, // 默认不翻译
            translated: false,
            targetLang: null
        }));
        
        return {
            keyword: keyword,
            suggestions: suggestionObjects,
            count: suggestions.length,
            timestamp: new Date().toISOString(),
            success: true,
            translated: false
        };
        
    } catch (error) {
        console.error(`获取建议失败 - ${keyword}:`, error);
        return {
            keyword: keyword,
            suggestions: [],
            count: 0,
            error: error.message,
            timestamp: new Date().toISOString(),
            success: false,
            translated: false
        };
    }
}

// 翻译文本到指定语言 - 使用在线Google翻译API（类似Python版本）
async function translateText(text, targetLang) {
    // 快速返回英文
    if (targetLang === 'en') return text;
    
    // 检查缓存
    const cacheKey = `${text}_${targetLang}`;
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }
    
    try {
        // 使用Google翻译API（类似Python版本的GoogleTranslator）
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const data = await response.json();
        
        let translated = text; // 默认返回原文
        
        if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
            translated = data.responseData.translatedText;
        }
        
        translationCache.set(cacheKey, translated);
        
        // 添加延迟避免API限制
        await delay(200);
        
        return translated;
    } catch (error) {
        console.error('翻译失败:', error);
        // 翻译失败直接返回原文（类似Python版本）
        translationCache.set(cacheKey, text);
        return text;
    }
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 增量添加单个结果卡片（避免重新渲染）
function addSingleResultCard(result) {
    const grid = document.getElementById('resultsGrid');
    const card = createResultCard(result);
    
    // 添加淡入动画
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    grid.appendChild(card);
    
    // 触发动画
    requestAnimationFrame(() => {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });
}

// 开始爬取
async function startCrawling() {
    if (isCrawling) return;
    
    const keywords = generateKeywords();
    if (keywords.length === 0) {
        showToast('请先配置关键词', 'error');
        return;
    }
    
    // 保存当前配置
    saveCurrentConfig();
    
    // 初始化状态
    isCrawling = true;
    crawlResults = [];
    crawlController = new AbortController();
    
    // 清空并初始化结果显示区域
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = '';
    
    // 更新UI
    updateCrawlUI(true);
    showProgressSection(true);
    updateProgress(0, keywords.length, 0);
    
    try {
        for (let i = 0; i < keywords.length; i++) {
            if (!isCrawling) break;
            
            const keyword = keywords[i];
            updateCurrentKeyword(keyword);
            
            const result = await getGoogleSuggestions(keyword);
            crawlResults.push(result);
            
            // 增量添加单个卡片，避免重新渲染整个列表
            addSingleResultCard(result);
            
            const successCount = crawlResults.filter(r => r.success).length;
            updateProgress(i + 1, keywords.length, successCount);
            updateStats();
            
            // 随机延迟 1-3 秒
            if (i < keywords.length - 1) {
                const delay_time = Math.random() * 2000 + 1000;
                await delay(delay_time);
            }
        }
        
        if (isCrawling) {
            showToast(translations[currentLang].crawlComplete, 'success');
            showStatsSection(true);
        }
        
    } catch (error) {
        console.error('爬取过程出错:', error);
        showToast('爬取过程出现错误', 'error');
    } finally {
        finishCrawling();
    }
}

// 停止爬取
function stopCrawling() {
    if (!isCrawling) return;
    
    isCrawling = false;
    if (crawlController) {
        crawlController.abort();
    }
    
    showToast(translations[currentLang].crawlStopped, 'warning');
    finishCrawling();
}

// 完成爬取
function finishCrawling() {
    isCrawling = false;
    updateCrawlUI(false);
    
    // 保存结果到本地存储
    if (crawlResults.length > 0) {
        localStorage.setItem('previousResults', JSON.stringify(crawlResults));
        document.getElementById('downloadResultsBtn').style.display = 'inline-flex';
        document.getElementById('translateControls').style.display = 'flex';
    }
}

// 更新爬取UI状态
function updateCrawlUI(crawling) {
    const startBtn = document.getElementById('startCrawlBtn');
    const stopBtn = document.getElementById('stopCrawlBtn');
    
    if (crawling) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-flex';
    } else {
        startBtn.style.display = 'inline-flex';
        stopBtn.style.display = 'none';
    }
}

// 显示/隐藏进度区域
function showProgressSection(show) {
    const section = document.getElementById('progressSection');
    section.style.display = show ? 'block' : 'none';
}

// 显示/隐藏统计区域
function showStatsSection(show) {
    const section = document.getElementById('statsSection');
    section.style.display = show ? 'block' : 'none';
}

// 更新进度
function updateProgress(processed, total, success) {
    document.getElementById('processedCount').textContent = processed;
    document.getElementById('totalCount').textContent = total;
    document.getElementById('successCount').textContent = success;
    
    const percentage = total > 0 ? (processed / total) * 100 : 0;
    document.getElementById('progressFill').style.width = `${percentage}%`;
}

// 更新当前关键词显示
function updateCurrentKeyword(keyword) {
    document.getElementById('currentKeywordText').textContent = keyword;
}

// 更新统计信息
function updateStats() {
    const totalKeywords = crawlResults.length;
    const totalSuggestions = crawlResults.reduce((sum, result) => sum + result.count, 0);
    const successCount = crawlResults.filter(r => r.success).length;
    const successRate = totalKeywords > 0 ? Math.round((successCount / totalKeywords) * 100) : 0;
    
    document.getElementById('totalKeywords').textContent = totalKeywords;
    document.getElementById('totalSuggestions').textContent = totalSuggestions;
    document.getElementById('successRate').textContent = `${successRate}%`;
}

// 更新结果显示（完整重新渲染，仅在必要时使用）
function updateResultsDisplay() {
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = '';
    
    crawlResults.forEach(result => {
        const card = createResultCard(result);
        grid.appendChild(card);
    });
    
    updateStats();
}

// 创建结果卡片
function createResultCard(result) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    if (result.translated) {
        card.classList.add('translated');
    }
    
    const keyword = document.createElement('div');
    keyword.className = 'result-keyword';
    keyword.innerHTML = `
        <span class="keyword-text">${result.keyword}</span>
        <span style="color: var(--text-muted); font-size: 0.8rem;">
            ${result.success ? result.count + translations[currentLang].suggestions : translations[currentLang].error}
        </span>
    `;
    
    const suggestions = document.createElement('div');
    suggestions.className = 'result-suggestions';
    
    if (result.success && result.suggestions.length > 0) {
        result.suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            
            if (typeof suggestion === 'object') {
                item.innerHTML = `<div class="suggestion-english">${suggestion.english}</div>`;
                
                if (suggestion.translation && suggestion.translated) {
                    const translationDiv = document.createElement('div');
                    translationDiv.className = 'suggestion-translation';
                    translationDiv.textContent = suggestion.translation;
                    item.appendChild(translationDiv);
                }
            } else {
                item.innerHTML = `<div class="suggestion-english">${suggestion}</div>`;
            }
            
            suggestions.appendChild(item);
        });
    } else if (!result.success) {
        const errorItem = document.createElement('div');
        errorItem.className = 'suggestion-item';
        errorItem.style.color = 'var(--text-muted)';
        errorItem.textContent = result.error || '获取失败';
        suggestions.appendChild(errorItem);
    } else {
        const noResults = document.createElement('div');
        noResults.className = 'suggestion-item';
        noResults.style.color = 'var(--text-muted)';
        noResults.textContent = translations[currentLang].noResults;
        suggestions.appendChild(noResults);
    }
    
    card.appendChild(keyword);
    card.appendChild(suggestions);
    
    return card;
}

// 下载结果
function downloadResults() {
    if (crawlResults.length === 0) {
        showToast('没有结果可下载', 'warning');
        return;
    }
    
    const data = {
        crawlInfo: {
            totalKeywords: crawlResults.length,
            crawlTime: new Date().toISOString(),
            successCount: crawlResults.filter(r => r.success).length,
            errorCount: crawlResults.filter(r => !r.success).length,
            translated: crawlResults.some(r => r.translated),
            targetLanguage: crawlResults.find(r => r.targetLang)?.targetLang || 'none'
        },
        results: crawlResults
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `google-suggestions-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('结果下载成功', 'success');
}

// 过滤结果
function filterResults() {
    const searchTerm = document.getElementById('searchResults').value.toLowerCase();
    const cards = document.querySelectorAll('.result-card');
    
    cards.forEach(card => {
        const keyword = card.querySelector('.keyword-text').textContent.toLowerCase();
        const suggestions = Array.from(card.querySelectorAll('.suggestion-english')).map(el => el.textContent.toLowerCase());
        
        const matches = keyword.includes(searchTerm) || suggestions.some(suggestion => suggestion.includes(searchTerm));
        card.style.display = matches ? 'block' : 'none';
    });
}

// 显示提示消息
function showToast(message, type = 'info') {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 样式
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    // 根据类型设置背景色
    switch (type) {
        case 'success':
            toast.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            break;
        case 'error':
            toast.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            break;
        case 'warning':
            toast.style.background = 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)';
            break;
        default:
            toast.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    document.body.appendChild(toast);
    
    // 动画显示
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('全局错误:', e.error);
    showToast('发生未知错误，请刷新页面重试', 'error');
});

// 页面卸载时保存状态
window.addEventListener('beforeunload', function() {
    saveCurrentConfig();
});

console.log('AI搜索建议助手已加载完成');

// 翻译结果 - 最简单版本，必须能工作
async function translateResults() {
    if (isTranslating || crawlResults.length === 0) return;
    
    const targetLang = document.getElementById('translateLangSelect').value;
    const translateBtn = document.getElementById('translateBtn');
    
    isTranslating = true;
    translateBtn.disabled = true;
    translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>翻译中...</span>';
    
    try {
        console.log('=== 开始翻译 ===');
        console.log('目标语言:', targetLang);
        console.log('结果数量:', crawlResults.length);
        
        // 直接遍历所有卡片和建议
        for (let cardIndex = 0; cardIndex < crawlResults.length; cardIndex++) {
            const result = crawlResults[cardIndex];
            
            if (!result.success || !result.suggestions) continue;
            
            console.log(`处理卡片 ${cardIndex}: ${result.keyword}`);
            
            for (let sugIndex = 0; sugIndex < result.suggestions.length; sugIndex++) {
                const suggestion = result.suggestions[sugIndex];
                
                console.log(`翻译建议 ${sugIndex}: ${suggestion.english}`);
                
                // 翻译文本
                const translated = await translateText(suggestion.english, targetLang);
                console.log(`翻译结果: ${translated}`);
                
                // 更新按钮进度
                const progress = Math.round(((cardIndex * 10 + sugIndex + 1) / (crawlResults.length * 10)) * 100);
                translateBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>翻译中... ${progress}%</span>`;
                
                // 立即显示翻译 - 用最直接的方法
                addTranslationToPage(cardIndex, sugIndex, translated);
                
                await delay(100);
            }
        }
        
        console.log('=== 翻译完成 ===');
        showToast('翻译完成！', 'success');
        
    } catch (error) {
        console.error('翻译出错:', error);
        showToast('翻译失败', 'error');
    } finally {
        isTranslating = false;
        translateBtn.disabled = false;
        translateBtn.innerHTML = '<i class="fas fa-language"></i> <span>翻译结果</span>';
    }
}

// 添加翻译到页面 - 最简单直接的方法
function addTranslationToPage(cardIndex, suggestionIndex, translatedText) {
    console.log(`=== 添加翻译到页面 ===`);
    console.log(`卡片索引: ${cardIndex}, 建议索引: ${suggestionIndex}`);
    console.log(`翻译内容: ${translatedText}`);
    
    // 获取所有卡片
    const allCards = document.querySelectorAll('.result-card');
    console.log(`找到 ${allCards.length} 个卡片`);
    
    if (cardIndex >= allCards.length) {
        console.error('卡片索引超出范围');
        return;
    }
    
    const targetCard = allCards[cardIndex];
    console.log('目标卡片:', targetCard);
    
    // 获取卡片内的所有建议项
    const suggestionItems = targetCard.querySelectorAll('.suggestion-item');
    console.log(`找到 ${suggestionItems.length} 个建议项`);
    
    if (suggestionIndex >= suggestionItems.length) {
        console.error('建议索引超出范围');
        return;
    }
    
    const targetItem = suggestionItems[suggestionIndex];
    console.log('目标建议项:', targetItem);
    
    // 删除已有的翻译（如果存在）
    const oldTranslation = targetItem.querySelector('.suggestion-translation');
    if (oldTranslation) {
        oldTranslation.remove();
        console.log('删除了旧的翻译');
    }
    
    // 创建翻译元素
    const translationElement = document.createElement('div');
    translationElement.className = 'suggestion-translation';
    translationElement.innerHTML = `<strong style="color: #ffffff;">${translatedText}</strong>`;
    
    // 设置明显的样式，确保可见
    translationElement.style.cssText = `
        padding: 5px !important;
        margin: 5px 0 !important;
        border-radius: 5px !important;
        font-weight: bold !important;
        font-size: 14px !important;
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
    `;
    
    // 添加到建议项
    targetItem.appendChild(translationElement);
    
    // 标记卡片
    targetCard.style.borderLeft = '5px';
    
    console.log('✅ 翻译元素已添加到页面');
    console.log('翻译元素:', translationElement);
} 
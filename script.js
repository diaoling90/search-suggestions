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
let currentLang = localStorage.getItem('language') || 'zh';
let crawlResults = [];
let previousResults = JSON.parse(localStorage.getItem('previousResults')) || [];
let isCrawling = false;
let isTranslating = false;
let crawlController = null;

// 翻译API缓存
const translationCache = new Map();

// 翻译频控配置
const TRANSLATION_DELAY = 800; // 每次翻译间隔800ms
const FALLBACK_TRANSLATION_DELAY = 2000; // 备用API延迟2秒

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

// 翻译文本到指定语言
async function translateText(text, targetLang) {
    // 检查缓存
    const cacheKey = `${text}_${targetLang}`;
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
    }
    
    try {
        // 先尝试本地词典翻译
        let translated = await mockTranslate(text, targetLang);
        
        // 如果本地翻译效果不好，尝试在线翻译
        if (shouldUseFallbackTranslation(text, translated, targetLang)) {
            translated = await fallbackTranslate(text, targetLang);
        }
        
        translationCache.set(cacheKey, translated);
        return translated;
    } catch (error) {
        console.error('翻译失败:', error);
        return text; // 翻译失败返回原文
    }
}

// 判断是否需要使用备用翻译
function shouldUseFallbackTranslation(originalText, translatedText, targetLang) {
    if (targetLang !== 'zh') return false; // 目前只对中文做深度翻译
    
    // 如果翻译后还有很多英文单词，说明翻译不完整
    const englishWords = translatedText.match(/\b[a-zA-Z]+\b/g) || [];
    const totalWords = originalText.split(/\s+/).length;
    
    // 如果超过30%的词汇没有被翻译，使用备用翻译
    return englishWords.length > totalWords * 0.3;
}

// 备用在线翻译
async function fallbackTranslate(text, targetLang) {
    try {
        // 使用MyMemory免费翻译API
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const data = await response.json();
        
        if (data.responseStatus === 200 && data.responseData) {
            await delay(FALLBACK_TRANSLATION_DELAY); // 频控
            return data.responseData.translatedText;
        }
    } catch (error) {
        console.error('在线翻译失败:', error);
    }
    
    // 如果在线翻译失败，返回增强的本地翻译
    return await enhancedMockTranslate(text, targetLang);
}

// 增强的本地翻译
async function enhancedMockTranslate(text, targetLang) {
    if (targetLang === 'en') return text;
    
    // 超大型中文翻译词典
    const enhancedDict = {
        // 基础动词 (大幅扩展)
        'delete': '删除', 'remove': '移除', 'erase': '擦除', 'clear': '清除',
        'deactivate': '停用', 'disable': '禁用', 'enable': '启用', 'activate': '激活',
        'edit': '编辑', 'modify': '修改', 'change': '更改', 'update': '更新',
        'create': '创建', 'make': '制作', 'build': '构建', 'generate': '生成',
        'find': '查找', 'search': '搜索', 'locate': '定位', 'discover': '发现',
        'open': '打开', 'close': '关闭', 'start': '开始', 'stop': '停止',
        'install': '安装', 'uninstall': '卸载', 'download': '下载', 'upload': '上传',
        'save': '保存', 'backup': '备份', 'restore': '恢复', 'sync': '同步',
        'share': '分享', 'send': '发送', 'receive': '接收', 'transfer': '传输',
        'connect': '连接', 'disconnect': '断开', 'link': '链接', 'bind': '绑定',
        'login': '登录', 'logout': '退出', 'signin': '登录', 'register': '注册',
        'reset': '重置', 'restart': '重启', 'refresh': '刷新', 'reload': '重新加载',
        'copy': '复制', 'paste': '粘贴', 'cut': '剪切', 'move': '移动',
        'add': '添加', 'insert': '插入', 'append': '附加', 'include': '包含',
        'block': '阻止', 'unblock': '解除阻止', 'ban': '禁止', 'allow': '允许',
        'hide': '隐藏', 'show': '显示', 'view': '查看', 'preview': '预览',
        'play': '播放', 'pause': '暂停', 'record': '录制', 'capture': '捕获',
        'format': '格式化', 'convert': '转换', 'compress': '压缩', 'extract': '提取',
        'encrypt': '加密', 'decrypt': '解密', 'protect': '保护', 'secure': '保护',
        'scan': '扫描', 'analyze': '分析', 'check': '检查', 'verify': '验证',
        'repair': '修复', 'fix': '修复', 'solve': '解决', 'troubleshoot': '故障排除',
        'optimize': '优化', 'improve': '改进', 'enhance': '增强', 'boost': '提升',
        
        // 食物和烹饪
        'cook': '烹饪', 'bake': '烘烤', 'boil': '煮', 'fry': '炸',
        'eat': '吃', 'drink': '喝', 'taste': '品尝', 'prepare': '准备',
        'cut': '切', 'slice': '切片', 'chop': '切碎', 'dice': '切丁',
        'mix': '混合', 'stir': '搅拌', 'blend': '搅拌', 'whisk': '打蛋',
        
        // 学习和工作
        'learn': '学习', 'study': '学习', 'practice': '练习', 'train': '训练',
        'teach': '教', 'explain': '解释', 'understand': '理解', 'remember': '记住',
        'write': '写', 'read': '读', 'calculate': '计算', 'solve': '解决',
        'work': '工作', 'job': '工作', 'career': '职业', 'profession': '职业',
        
        // 健康和身体
        'sleep': '睡觉', 'wake': '醒来', 'exercise': '锻炼', 'walk': '走路',
        'run': '跑步', 'jump': '跳', 'swim': '游泳', 'dance': '跳舞',
        'relax': '放松', 'rest': '休息', 'breathe': '呼吸', 'stretch': '伸展',
        
        // 疑问词和短语
        'how to': '如何', 'what is': '什么是', 'where is': '在哪里',
        'when to': '何时', 'why does': '为什么', 'which one': '哪一个',
        'how do i': '我如何', 'how can i': '我怎么能', 'what does': '什么是',
        
        // 介词和连词
        'for': '为了', 'in': '在', 'on': '在上面', 'at': '在',
        'with': '与', 'without': '没有', 'from': '从', 'to': '到',
        'by': '通过', 'through': '通过', 'during': '在期间', 'after': '之后',
        'before': '之前', 'until': '直到', 'since': '自从', 'while': '当时',
        
        // 设备和技术
        'phone': '手机', 'iphone': '苹果手机', 'android': '安卓',
        'computer': '电脑', 'laptop': '笔记本电脑', 'desktop': '台式电脑',
        'tablet': '平板电脑', 'ipad': '苹果平板', 'mac': '苹果电脑',
        'windows': 'Windows系统', 'linux': 'Linux系统', 'ios': 'iOS系统',
        'app': '应用', 'application': '应用程序', 'software': '软件',
        'browser': '浏览器', 'chrome': 'Chrome浏览器', 'firefox': 'Firefox浏览器',
        'safari': 'Safari浏览器', 'edge': 'Edge浏览器',
        
        // 社交媒体
        'instagram': 'Instagram', 'facebook': 'Facebook', 'twitter': 'Twitter',
        'tiktok': 'TikTok', 'youtube': 'YouTube', 'snapchat': 'Snapchat',
        'whatsapp': 'WhatsApp', 'telegram': 'Telegram', 'wechat': '微信',
        'account': '账户', 'profile': '个人资料', 'post': '发布',
        'follow': '关注', 'unfollow': '取消关注', 'like': '点赞',
        'comment': '评论', 'share': '分享', 'message': '消息',
        
        // 常见名词
        'email': '邮件', 'password': '密码', 'username': '用户名',
        'file': '文件', 'folder': '文件夹', 'document': '文档',
        'photo': '照片', 'image': '图片', 'video': '视频',
        'music': '音乐', 'song': '歌曲', 'movie': '电影',
        'game': '游戏', 'book': '书', 'news': '新闻',
        
        // 时间相关
        'today': '今天', 'tomorrow': '明天', 'yesterday': '昨天',
        'morning': '早上', 'afternoon': '下午', 'evening': '晚上',
        'night': '夜晚', 'week': '周', 'month': '月', 'year': '年',
        
        // 形容词
        'best': '最好的', 'good': '好的', 'bad': '坏的', 'new': '新的',
        'old': '旧的', 'big': '大的', 'small': '小的', 'fast': '快的',
        'slow': '慢的', 'easy': '容易的', 'hard': '困难的', 'free': '免费的',
        'cheap': '便宜的', 'expensive': '昂贵的', 'safe': '安全的',
        'dangerous': '危险的', 'important': '重要的', 'useful': '有用的',
        
        // 数字和数量
        'one': '一', 'two': '二', 'three': '三', 'many': '许多',
        'few': '几个', 'some': '一些', 'all': '全部', 'most': '大多数',
        'first': '第一', 'last': '最后', 'next': '下一个', 'previous': '上一个'
    };
    
    let translated = text;
    
    // 按词汇长度排序，确保长词汇优先匹配
    const sortedEntries = Object.entries(enhancedDict).sort((a, b) => b[0].length - a[0].length);
    
    // 应用翻译规则 - 使用词边界匹配
    for (const [en, zh] of sortedEntries) {
        const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        translated = translated.replace(regex, zh);
    }
    
    // 频控延迟
    await delay(TRANSLATION_DELAY);
    
    return translated;
}

// 模拟翻译函数（支持多语言）
async function mockTranslate(text, targetLang) {
    // 如果目标语言是英文，直接返回原文
    if (targetLang === 'en') {
        return text;
    }
    
    // 对于中文，使用增强翻译
    if (targetLang === 'zh') {
        return await enhancedMockTranslate(text, targetLang);
    }
    
    // 其他语言使用简化词典
    const basicDicts = {
        es: {
            'how to': 'cómo', 'delete': 'eliminar', 'edit': 'editar',
            'find': 'encontrar', 'make': 'hacer', 'best': 'mejor'
        },
        fr: {
            'how to': 'comment', 'delete': 'supprimer', 'edit': 'modifier',
            'find': 'trouver', 'make': 'faire', 'best': 'meilleur'
        },
        de: {
            'how to': 'wie man', 'delete': 'löschen', 'edit': 'bearbeiten',
            'find': 'finden', 'make': 'machen', 'best': 'beste'
        },
        ja: {
            'how to': 'の方法', 'delete': '削除', 'edit': '編集',
            'find': '見つける', 'make': '作る', 'best': '最高の'
        },
        ko: {
            'how to': '하는 방법', 'delete': '삭제', 'edit': '편집',
            'find': '찾기', 'make': '만들기', 'best': '최고의'
        }
    };
    
    const dict = basicDicts[targetLang] || {};
    let translated = text;
    
    const sortedEntries = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);
    for (const [en, target] of sortedEntries) {
        const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        translated = translated.replace(regex, target);
    }
    
    await delay(TRANSLATION_DELAY);
    return translated;
}

// 批量处理翻译
async function processBatch(batch, targetLang) {
    const promises = batch.map(async ({ result, suggestion }) => {
        suggestion.translation = await translateText(suggestion.english, targetLang);
        suggestion.translated = true;
        suggestion.targetLang = targetLang;
    });
    
    await Promise.all(promises);
}

// 更新已翻译的卡片
function updateTranslatedCards(batch, targetLang) {
    const cardElementsMap = new Map();
    
    // 建立结果到卡片元素的映射
    document.querySelectorAll('.result-card').forEach((card, index) => {
        if (index < crawlResults.length) {
            cardElementsMap.set(crawlResults[index], card);
        }
    });
    
    // 更新相关的卡片
    const updatedResults = new Set();
    batch.forEach(({ result }) => {
        updatedResults.add(result);
    });
    
    updatedResults.forEach(result => {
        const cardElement = cardElementsMap.get(result);
        if (cardElement) {
            updateExistingCardTranslations(cardElement, result, targetLang);
        }
    });
}

// 更新现有卡片的翻译内容
function updateExistingCardTranslations(cardElement, result, targetLang) {
    // 更新建议内容
    const suggestionItems = cardElement.querySelectorAll('.suggestion-item');
    result.suggestions.forEach((suggestion, index) => {
        if (index < suggestionItems.length && suggestion.translated && suggestion.targetLang === targetLang) {
            const item = suggestionItems[index];
            let translationEl = item.querySelector('.suggestion-translation');
            
            if (suggestion.translation && !translationEl) {
                // 添加翻译内容
                translationEl = document.createElement('div');
                translationEl.className = 'suggestion-translation';
                translationEl.textContent = suggestion.translation;
                item.appendChild(translationEl);
            } else if (suggestion.translation && translationEl) {
                // 更新翻译内容
                translationEl.textContent = suggestion.translation;
            }
        }
    });
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

// 翻译结果
async function translateResults() {
    if (isTranslating || crawlResults.length === 0) return;
    
    const targetLang = document.getElementById('translateLangSelect').value;
    const translateBtn = document.getElementById('translateBtn');
    const originalText = translateBtn.querySelector('span').textContent;
    
    isTranslating = true;
    
    // 更新按钮状态
    translateBtn.disabled = true;
    translateBtn.querySelector('span').textContent = translations[currentLang].translating;
    translateBtn.querySelector('i').className = 'fas fa-spinner fa-spin';
    
    showToast(translations[currentLang].translateInProgress, 'info');
    
    try {
        let totalResults = crawlResults.filter(r => r.success).length;
        let translatedResults = 0;
        let highQualityCount = 0;
        let fallbackUsedCount = 0;
        
        // 逐个处理每个结果卡片
        for (let i = 0; i < crawlResults.length; i++) {
            const result = crawlResults[i];
            
            if (result.success) {
                // 更新进度显示
                const progress = Math.round((translatedResults / totalResults) * 100);
                translateBtn.querySelector('span').textContent = `${translations[currentLang].translating} ${progress}% (${translatedResults + 1}/${totalResults})`;
                
                // 翻译当前结果的所有建议
                for (const suggestion of result.suggestions) {
                    if (!suggestion.translated || suggestion.targetLang !== targetLang) {
                        const originalText = suggestion.english;
                        suggestion.translation = await translateText(originalText, targetLang);
                        suggestion.translated = true;
                        suggestion.targetLang = targetLang;
                        
                        // 检查翻译质量
                        const qualityScore = checkTranslationQuality(originalText, suggestion.translation, targetLang);
                        if (qualityScore > 0.7) {
                            highQualityCount++;
                        } else if (qualityScore < 0.3) {
                            fallbackUsedCount++;
                        }
                    }
                }
                
                result.translated = true;
                result.targetLang = targetLang;
                
                // 立即更新当前卡片的显示
                updateSingleCardTranslation(i, result, targetLang);
                
                translatedResults++;
                
                // 显示实时质量统计
                if (translatedResults % 5 === 0) {
                    const qualityRate = Math.round((highQualityCount / (translatedResults * 10)) * 100);
                    console.log(`翻译质量统计: 高质量翻译率 ${qualityRate}%, 使用备用翻译 ${fallbackUsedCount} 次`);
                }
            }
        }
        
        // 计算最终翻译质量
        const totalSuggestions = crawlResults.reduce((sum, r) => sum + (r.success ? r.suggestions.length : 0), 0);
        const qualityRate = Math.round((highQualityCount / totalSuggestions) * 100);
        
        let completeMessage = translations[currentLang].translateComplete;
        if (targetLang === 'zh') {
            completeMessage += ` (翻译质量: ${qualityRate}%)`;
        }
        
        showToast(completeMessage, 'success');
        
        // 显示所有翻译结果
        setTimeout(() => {
            document.querySelectorAll('.suggestion-translation').forEach(el => {
                el.classList.add('show');
            });
            
            // 标记所有卡片为已翻译
            document.querySelectorAll('.result-card').forEach(card => {
                card.classList.add('translated');
            });
        }, 100);
        
    } catch (error) {
        console.error('翻译过程出错:', error);
        showToast(translations[currentLang].translateFailed + ': ' + error.message, 'error');
    } finally {
        isTranslating = false;
        translateBtn.disabled = false;
        translateBtn.querySelector('span').textContent = originalText;
        translateBtn.querySelector('i').className = 'fas fa-language';
    }
}

// 检查翻译质量
function checkTranslationQuality(originalText, translatedText, targetLang) {
    if (targetLang !== 'zh') return 1; // 暂时只对中文做质量检查
    
    const originalWords = originalText.toLowerCase().split(/\s+/);
    const translatedWords = translatedText.split(/\s+/);
    
    // 计算英文单词残留率
    const remainingEnglishWords = translatedText.match(/\b[a-zA-Z]+\b/g) || [];
    const englishRetentionRate = remainingEnglishWords.length / originalWords.length;
    
    // 计算翻译覆盖率
    const coverageRate = 1 - englishRetentionRate;
    
    // 检查是否有关键词被翻译
    const keyWords = ['how', 'to', 'what', 'is', 'the', 'and', 'or', 'for', 'in', 'on', 'with'];
    const translatedKeyWords = keyWords.filter(word => 
        !translatedText.toLowerCase().includes(word)
    ).length;
    const keyWordScore = translatedKeyWords / keyWords.length;
    
    // 综合评分
    return (coverageRate * 0.7) + (keyWordScore * 0.3);
} 
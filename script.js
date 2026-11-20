"use strict";

/* =====================================================
   GAMEDEV AI ULTRA
   LOCAL DEVELOPER ENGINE
   Version 4.0
===================================================== */

/* ================= STORAGE ================= */

const STORAGE = {
    projects: "gamedev_ultra_projects",
    chat: "gamedev_ultra_chat",
    theme: "gamedev_ultra_theme",
    library: "gamedev_ultra_library",
    scripts: "gamedev_ultra_scripts",
    selectedGenre: "gamedev_ultra_genre"
};

function loadData(key, fallback = []) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.warn("Storage read error:", error);
        return fallback;
    }
}

function saveData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        showToast("تعذر الحفظ في المتصفح");
        console.error(error);
        return false;
    }
}

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


/* ================= TOAST ================= */

let toastTimer;

function showToast(message) {
    const toast = $("#gameToast");
    const toastMessage = $("#toastMessage");

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}


/* ================= PAGE NAVIGATION ================= */

const PAGE_NAMES = {
    home: "الرئيسية",
    assistant: "المساعد الذكي",
    ideas: "مصنع الأفكار",
    scripts: "مختبر السكربتات",
    projects: "مشاريعي",
    library: "مكتبة الأكواد",
    community: "المجتمع",
    team: "فريق التطوير"
};

function openPage(pageName) {
    if (!PAGE_NAMES[pageName]) return;

    $$(".page").forEach(page => {
        page.classList.remove("active");
    });

    const target = $("#" + pageName);

    if (target) {
        target.classList.add("active");
    }

    $$(".nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    const title = $("#pageTitle");

    if (title) {
        title.textContent = PAGE_NAMES[pageName];
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (pageName === "projects") {
        renderProjects();
    }

    if (pageName === "library") {
        renderLibrary();
    }
}

$$(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        openPage(button.dataset.page);
    });
});

$$("[data-goto]").forEach(button => {
    button.addEventListener("click", () => {
        openPage(button.dataset.goto);
    });
});

$$(".tool-card").forEach(card => {
    card.addEventListener("click", () => {
        openPage(card.dataset.goto);
    });
});


/* ================= THEME ================= */

function loadTheme() {
    const theme = localStorage.getItem(STORAGE.theme);

    document.body.classList.toggle(
        "light-mode",
        theme === "light"
    );
}

$("#themeButton")?.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-mode");

    localStorage.setItem(
        STORAGE.theme,
        isLight ? "light" : "dark"
    );

    showToast(
        isLight ? "تم تفعيل المظهر الفاتح" : "تم تفعيل المظهر الداكن"
    );
});


/* ================= TEXT NORMALIZATION ================= */

function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[ًٌٍَُِّْـ]/g, "")
        .replace(/[أإآ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/[^\u0600-\u06FFa-z0-9\s_]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function containsAny(text, words) {
    return words.some(word => text.includes(normalizeText(word)));
}


/* ================= ROBLOX KNOWLEDGE BASE ================= */

const KNOWLEDGE = [

    {
        title: "Leaderstats",
        keywords: ["leaderstats", "الاحصائيات", "احصائيات", "الفلوس", "النقاط", "wins", "power"],
        category: "Players",
        answer: `Leaderstats نظام يعرض إحصائيات اللاعب بجانب اسمه في قائمة اللاعبين.

مثلاً:
- Wins
- Power
- Coins
- Level

مكان السكربت:
ServerScriptService

نوع السكربت:
Script

مثال:

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)

    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local wins = Instance.new("IntValue")
    wins.Name = "Wins"
    wins.Value = 0
    wins.Parent = leaderstats

end)

ملاحظة: هذا مثال أساسي. لحفظ البيانات بعد الخروج تحتاج DataStoreService.`
    },

    {
        title: "DataStoreService",
        keywords: ["datastore", "حفظ البيانات", "حفظ", "البيانات", "تخزين", "حفظ الفلوس"],
        category: "Data",
        answer: `DataStoreService يسمح لك بحفظ بيانات اللاعبين بين جلسات اللعب.

تقدر تحفظ:
- الأموال
- الانتصارات
- المستوى
- القوة
- عدد مرات Rebirth

تذكر:
1. استخدمه من Script على السيرفر.
2. فعّل الوصول إلى API Services في إعدادات اللعبة أثناء الاختبار في Studio.
3. استخدم pcall لمعالجة الأخطاء.
4. لا تثق ببيانات يرسلها اللاعب من جهازه.

مثال للحصول على الخدمة:

local DataStoreService = game:GetService("DataStoreService")

local PlayerData = DataStoreService:GetDataStore("PlayerData")

هذا السطر ينشئ مرجعاً لمخزن بيانات اسمه PlayerData.`
    },

    {
        title: "RemoteEvent",
        keywords: ["remoteevent", "ريموت ايفنت", "ريموت", "التواصل", "السيرفر", "اللاعب"],
        category: "Networking",
        answer: `RemoteEvent يسمح بالتواصل بين العميل والسيرفر بدون انتظار نتيجة.

مثال الاستخدام:

السيرفر:
RemoteEvent.OnServerEvent:Connect(function(player, value)
    print(player.Name, value)
end)

العميل:
RemoteEvent:FireServer("Hello")

مهم جداً:
لا تسمح للعميل بتحديد مكافأة أو مبلغ مالي بنفسه.
تحقق من كل البيانات على السيرفر.`
    },

    {
        title: "RemoteFunction",
        keywords: ["remotefunction", "ريموت فانكشن"],
        category: "Networking",
        answer: `RemoteFunction يسمح للعميل والسيرفر بطلب قيمة وإرجاع نتيجة.

مثال:

-- Server
RemoteFunction.OnServerInvoke = function(player)
    return "Welcome " .. player.Name
end

-- Client
local result = RemoteFunction:InvokeServer()

print(result)

الفرق:
RemoteEvent لإرسال حدث.
RemoteFunction لطلب نتيجة والانتظار حتى تصل.`
    },

    {
        title: "LocalScript",
        keywords: ["localscript", "لوكال سكربت", "لوكال", "الكاميرا", "الواجهة"],
        category: "Scripting",
        answer: `LocalScript يعمل على جهاز اللاعب.

استخداماته:
- واجهات المستخدم.
- الكاميرا.
- إدخال لوحة المفاتيح.
- المؤثرات المحلية.
- عرض التنبيهات.

أما الأشياء المهمة مثل الأموال والحفظ والمكافآت فيجب أن يتحقق منها السيرفر.

أماكن شائعة:
StarterPlayerScripts
StarterGui
StarterCharacterScripts`
    },

    {
        title: "ModuleScript",
        keywords: ["modulescript", "موديول", "موديول سكربت", "الموديولات"],
        category: "Scripting",
        answer: `ModuleScript يسمح لك بتنظيم الأكواد وإعادة استخدامها.

مثال:

local Module = {}

function Module.Greet(player)
    return "Hello " .. player.Name
end

return Module

لاستخدامه:

local Module = require(script.Parent.ModuleScript)

يمكنك وضع الدوال والأنظمة المشتركة داخله.`
    },

    {
        title: "TweenService",
        keywords: ["tweenservice", "tween", "انميشن", "انيميشن", "تحريك", "حركة"],
        category: "Effects",
        answer: `TweenService يستخدم لتحريك الخصائص بسلاسة.

مثال:

local TweenService = game:GetService("TweenService")

local part = workspace.Part

local tweenInfo = TweenInfo.new(
    2,
    Enum.EasingStyle.Quad,
    Enum.EasingDirection.Out
)

local goal = {
    Position = part.Position + Vector3.new(0, 5, 0)
}

local tween = TweenService:Create(
    part,
    tweenInfo,
    goal
)

tween:Play()

يمكنك تحريك:
Position
Size
Transparency
BackgroundColor3
Rotation`
    },

    {
        title: "ScreenGui",
        keywords: ["screengui", "gui", "واجهة", "واجهات", "زر", "ازرار"],
        category: "GUI",
        answer: `ScreenGui هو الحاوية الأساسية لواجهات المستخدم في Roblox.

تركيب مقترح:

StarterGui
 └── ScreenGui
      ├── Frame
      │    ├── TextLabel
      │    ├── TextButton
      │    └── ImageLabel

أهم العناصر:
Frame: حاوية.
TextLabel: نص.
TextButton: زر.
ImageLabel: صورة.
UIListLayout: ترتيب العناصر.
UICorner: زوايا دائرية.
UIStroke: حدود.`
    },

    {
        title: "ProximityPrompt",
        keywords: ["proximityprompt", "برومبت", "التفاعل", "اضغط e", "e"],
        category: "Interaction",
        answer: `ProximityPrompt يسمح للاعب بالتفاعل مع الأجسام القريبة.

مثال:

local prompt = Instance.new("ProximityPrompt")

prompt.ActionText = "فتح"
prompt.ObjectText = "الباب"
prompt.KeyboardKeyCode = Enum.KeyCode.E
prompt.HoldDuration = 1
prompt.Parent = workspace.Door

prompt.Triggered:Connect(function(player)
    print(player.Name .. " opened the door")
end)

تقدر تستخدمه للأبواب والمتاجر والمهام.`
    },

    {
        title: "MarketplaceService",
        keywords: ["marketplaceservice", "gamepass", "قيم باس", "شراء", "developer product", "منتج"],
        category: "Monetization",
        answer: `MarketplaceService مسؤول عن عمليات الشراء داخل Roblox.

من استخداماته:
- Game Passes
- Developer Products
- التحقق من امتلاك Game Pass
- عرض نافذة الشراء

مهم:
تحقق من ملكية Game Pass باستخدام UserOwnsGamePassAsync.
وعالج عمليات Developer Products باستخدام ProcessReceipt على السيرفر.`
    },

    {
        title: "Players",
        keywords: ["players", "اللاعبين", "playeradded", "playerremoving"],
        category: "Players",
        answer: `Players Service يسمح لك بإدارة اللاعبين.

أمثلة:

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    print(player.Name .. " دخل اللعبة")
end)

Players.PlayerRemoving:Connect(function(player)
    print(player.Name .. " خرج من اللعبة")
end)

يمكنك استخدامه لإنشاء بيانات اللاعب عند دخوله وتنظيف بعض البيانات عند خروجه.`
    },

    {
        title: "Humanoid",
        keywords: ["humanoid", "السرعة", "القفز", "الصحة", "health", "walkspeed"],
        category: "Character",
        answer: `Humanoid يتحكم في خصائص الشخصية.

أمثلة:

local character = player.Character
local humanoid = character:WaitForChild("Humanoid")

humanoid.WalkSpeed = 30
humanoid.JumpPower = 60
humanoid.MaxHealth = 200
humanoid.Health = 200

تقدر تتحكم في:
WalkSpeed
JumpPower
Health
MaxHealth
DisplayName`
    },

    {
        title: "Lighting",
        keywords: ["lighting", "الاضاءة", "الليل", "النهار", "الجو", "السماء"],
        category: "Environment",
        answer: `Lighting يتحكم في الإضاءة والجو داخل اللعبة.

مثال:

local Lighting = game:GetService("Lighting")

Lighting.ClockTime = 18
Lighting.Brightness = 2
Lighting.Ambient = Color3.fromRGB(100, 100, 140)

يمكنك إضافة:
Atmosphere
BloomEffect
ColorCorrectionEffect
SunRaysEffect

وهذا يساعدك في صناعة أجواء احترافية.`
    },

    {
        title: "CollectionService",
        keywords: ["collectionservice", "التاج", "tag", "العلامات"],
        category: "Systems",
        answer: `CollectionService يسمح لك بتجميع العناصر باستخدام Tags.

مثال:

local CollectionService = game:GetService("CollectionService")

for _, part in ipairs(CollectionService:GetTagged("Collectible")) do
    print(part.Name)
end

مفيد في أنظمة:
- جمع العملات.
- الأبواب.
- نقاط الحفظ.
- الأعداء.
- مناطق التفاعل.`
    },

    {
        title: "PathfindingService",
        keywords: ["pathfinding", "المسارات", "npc", "العدو", "مطاردة"],
        category: "AI",
        answer: `PathfindingService يساعد الشخصيات على إيجاد طريق حول العوائق.

مثال:

local PathfindingService = game:GetService("PathfindingService")

local path = PathfindingService:CreatePath()

path:ComputeAsync(
    npc.HumanoidRootPart.Position,
    target.Position
)

if path.Status == Enum.PathStatus.Success then
    local waypoints = path:GetWaypoints()

    for _, waypoint in ipairs(waypoints) do
        npc.Humanoid:MoveTo(waypoint.Position)
        npc.Humanoid.MoveToFinished:Wait()
    end
end

هذا مثال تعليمي مبسط، ويحتاج معالجة لإعادة حساب المسار عند تغير الهدف.`
    },

    {
        title: "Raycast",
        keywords: ["raycast", "الاشعة", "التصادم", "كشف", "الليزر"],
        category: "Physics",
        answer: `Raycast يطلق شعاعاً وهمياً لاكتشاف الأجسام.

مثال:

local origin = workspace.Part.Position
local direction = Vector3.new(0, -20, 0)

local result = workspace:Raycast(origin, direction)

if result then
    print("Hit:", result.Instance.Name)
end

يستخدم في:
- الأسلحة.
- كشف الأرض.
- التفاعل.
- أنظمة الرؤية.`
    },

    {
        title: "TeamService",
        keywords: ["team", "teams", "الفريق", "الفرق", "الاحمر", "الازرق"],
        category: "Systems",
        answer: `Teams Service يسمح بتقسيم اللاعبين إلى فرق.

مثال:

local Teams = game:GetService("Teams")

local redTeam = Teams:FindFirstChild("Red")

if redTeam then
    player.Team = redTeam
end

يمكنك إنشاء:
الفريق الأحمر.
الفريق الأزرق.
فريق الإدارة.
فريق المتفرجين.`
    },

    {
        title: "TeleportService",
        keywords: ["teleportservice", "انتقال", "نقل اللاعب", "تلبيورت", "سيرفر ثاني"],
        category: "Networking",
        answer: `TeleportService يسمح بنقل اللاعبين إلى أماكن أو خوادم أخرى.

من استخداماته:
- الانتقال بين المابات.
- الدخول إلى سيرفر خاص.
- نقل اللاعبين إلى تجربة أخرى.

ملاحظة: النقل بين التجارب يحتاج إعدادات صحيحة واختباراً في بيئة منشورة، ولا يعمل بالكامل من بعض أوضاع Studio.`
    },

    {
        title: "SoundService",
        keywords: ["soundservice", "الصوت", "الموسيقى", "اغنية", "صوت"],
        category: "Audio",
        answer: `SoundService مسؤول عن الصوت في اللعبة.

مثال:

local sound = Instance.new("Sound")

sound.SoundId = "rbxassetid://123456"
sound.Volume = 0.5
sound.Looped = true
sound.Parent = game:GetService("SoundService")

sound:Play()

استخدم أصولاً صوتية تملك حق استخدامها أو مسموحاً لك باستخدامها.`
    },

    {
        title: "Attributes",
        keywords: ["attributes", "اتربيوت", "الخصائص", "setattribute", "getattribute"],
        category: "Data",
        answer: `Attributes تسمح لك بإضافة خصائص مخصصة للعناصر.

مثال:

local part = workspace.Part

part:SetAttribute("Damage", 25)

local damage = part:GetAttribute("Damage")

print(damage)

مفيدة لتخزين معلومات بسيطة مرتبطة بالأجسام والشخصيات.`
    },

    {
        title: "ContextActionService",
        keywords: ["contextactionservice", "التحكم", "ازرار الجوال", "كيبورد"],
        category: "Input",
        answer: `ContextActionService يسمح بربط الأفعال بأزرار لوحة المفاتيح أو أدوات الإدخال.

مثال:

local CAS = game:GetService("ContextActionService")

local function handleAction(actionName, inputState)
    if inputState == Enum.UserInputState.Begin then
        print("Action started:", actionName)
    end
end

CAS:BindAction(
    "MyAction",
    handleAction,
    true,
    Enum.KeyCode.F
)

مفيد لأنظمة التفاعل والتحكم.`
    },

    {
        title: "RunService",
        keywords: ["runservice", "heartbeat", "renderstepped", "التحديث المستمر"],
        category: "Performance",
        answer: `RunService يوفر أحداثاً مرتبطة بدورة تحديث اللعبة.

من أشهر الأحداث:
Heartbeat
RenderStepped
Stepped

مثال:

local RunService = game:GetService("RunService")

RunService.Heartbeat:Connect(function(deltaTime)
    -- منطق يتكرر مع تحديثات اللعبة
end)

انتبه من وضع عمليات ثقيلة في أحداث تعمل باستمرار لأنها قد تؤثر على الأداء.`
    },

    {
        title: "MemoryStoreService",
        keywords: ["memorystore", "ذاكرة مؤقتة", "matchmaking", "مطابقة اللاعبين"],
        category: "Advanced",
        answer: `MemoryStoreService يوفر هياكل بيانات سريعة ومؤقتة مشتركة بين خوادم التجربة.

استخداماته:
- Matchmaking.
- طوابير انتظار اللاعبين.
- بيانات مؤقتة بين السيرفرات.
- تنسيق بعض العمليات.

ليس بديلاً عن DataStore للبيانات الدائمة.`
    },

    {
        title: "Developer Products",
        keywords: ["developer product", "developer products", "منتجات المطور", "منتج مطور"],
        category: "Monetization",
        answer: `Developer Products تسمح للاعب بشراء المنتج أكثر من مرة.

مثلاً:
- 1000 Coins.
- مضاعفة القوة لمدة محددة.
- تخطي مرحلة.
- صندوق مكافآت.

يجب معالجة الشراء باستخدام MarketplaceService.ProcessReceipt على السيرفر، وعدم منح المكافأة اعتماداً على إشارة من العميل فقط.`
    },

    {
        title: "Data Validation",
        keywords: ["الحماية", "الهاكر", "استغلال", "الامان", "anti exploit", "حماية السيرفر"],
        category: "Security",
        answer: `حماية ألعاب Roblox تعتمد بشكل كبير على التحقق من جهة السيرفر.

قواعد مهمة:
1. لا تثق بالعميل عند تحديد الأموال أو الجوائز.
2. تحقق من المسافة قبل التفاعل.
3. تحقق من ملكية العناصر.
4. استخدم حدوداً للطلبات المتكررة.
5. لا تسمح للعميل بإرسال قيم غير محدودة.
6. اجعل السيرفر هو صاحب القرار في العمليات المهمة.

لا يوجد سكربت واحد يضمن منع جميع أنواع الاستغلال.`
    }

];


/* ================= KNOWLEDGE SEARCH ================= */

function searchKnowledge(query) {
    const text = normalizeText(query);

    let bestMatch = null;
    let bestScore = 0;

    for (const item of KNOWLEDGE) {
        let score = 0;

        const allWords = [item.title, ...item.keywords];

        for (const keyword of allWords) {
            const normalized = normalizeText(keyword);

            if (!normalized) continue;

            if (text.includes(normalized)) {
                score += normalized.includes(" ") ? 4 : 3;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    }

    return bestScore >= 3 ? bestMatch : null;
}


/* ================= AI INTENTS ================= */

const INTENTS = {
    greeting: [
        "السلام عليكم",
        "هلا",
        "مرحبا",
        "اهلا",
        "كيف حالك",
        "هاي"
    ],

    ideas: [
        "فكرة",
        "افكار",
        "ماب",
        "خريطة",
        "لعبة جديدة",
        "اقترح"
    ],

    scripts: [
        "سكربت",
        "كود",
        "برمجة",
        "اكتب لي",
        "انشاء سكربت"
    ],

    debugging: [
        "خطا",
        "ايرور",
        "error",
        "ما يشتغل",
        "مشكلة",
        "يخرب"
    ],

    explanation: [
        "اشرح",
        "شرح",
        "كيف يعمل",
        "وش معنى",
        "ما معنى"
    ],

    design: [
        "تصميم",
        "واجهة",
        "الوان",
        "انميشن",
        "شكل"
    ],

    map: [
        "ماب",
        "مدينة",
        "خريطة",
        "عالم"
    ]
};

function detectIntent(query) {
    const text = normalizeText(query);

    let bestIntent = "general";
    let bestScore = 0;

    for (const [intent, keywords] of Object.entries(INTENTS)) {
        let score = 0;

        for (const keyword of keywords) {
            if (text.includes(normalizeText(keyword))) {
                score++;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestIntent = intent;
        }
    }

    return bestIntent;
}


/* ================= RESPONSE ENGINE ================= */

function generateResponse(query) {
    const text = normalizeText(query);
    const intent = detectIntent(query);

    if (intent === "greeting") {
        return `وعليكم السلام ورحمة الله وبركاته! 👋

أهلاً بك في GAMEDEV AI ULTRA.

أنا مساعدك المحلي لتطوير الألعاب.

أقدر أساعدك في:
- Roblox Studio.
- Luau.
- تصميم الأنظمة.
- شرح السكربتات.
- أفكار المابات.
- حل الأخطاء الشائعة.

وش نطور اليوم؟ 🚀`;
    }

    if (
        containsAny(text, ["شكرا", "مشكور", "يعطيك العافيه"])
    ) {
        return `العفو! ✨

أنا موجود لمساعدتك في تطوير ألعابك.

خلنا نحول أفكارك إلى مشاريع حقيقية!`;
    }

    if (
        containsAny(text, ["من انت", "عرف نفسك", "اسمك"])
    ) {
        return `أنا GAMEDEV AI ULTRA 🤖

مساعد محلي مخصص لمطوري الألعاب، خصوصاً Roblox.

أعمل من خلال قاعدة معرفة وأمثلة برمجية محفوظة داخل الموقع.

مهم: أنا لست نموذج GPT متصلاً بالإنترنت، لذلك قد لا أتمكن من الإجابة عن كل سؤال جديد.`;
    }

    if (
        containsAny(text, ["روبلوكس", "roblox"])
        && containsAny(text, ["وش", "ما هي", "ماهو", "ما هو"])
    ) {
        return `Roblox منصة لإنشاء الألعاب وتجربتها.

تقدر تستخدم Roblox Studio لبناء:
- مابات.
- ألعاب محاكاة.
- ألعاب مغامرات.
- ألعاب اجتماعية.
- أنظمة اقتصادية.
- ألعاب متعددة اللاعبين.

وتستخدم لغة Luau لبرمجة الأنظمة والتفاعلات.`;
    }

    if (intent === "ideas") {
        return `عندي لك فكرة مبدئية! 💡

أنشئ ماب مدينة خليجية متكاملة.

الأنظمة المقترحة:
1. وظائف متعددة.
2. رواتب دورية.
3. نظام ترقيات.
4. عقارات ومنازل.
5. سيارات ومحطات وقود.
6. اقتصاد بين اللاعبين.
7. مهام يومية.

تقدر تستخدم مصنع الأفكار لتوليد تصورات مختلفة حسب النوع الذي تريده.`;
    }

    if (intent === "debugging") {
        return `خلنا نفحص المشكلة! 🔍

أحتاج منك:
1. رسالة الخطأ كاملة.
2. السكربت الذي فيه المشكلة.
3. مكان السكربت في Explorer.
4. متى يظهر الخطأ؟

أشياء افحصها أولاً:
- هل اسم العنصر صحيح؟
- هل تستخدم WaitForChild عند الحاجة؟
- هل نوع السكربت مناسب؟
- هل الحدث متصل؟
- هل العملية في السيرفر أم العميل؟

أرسل الكود وسأساعدك في تحليل الأخطاء الظاهرة فيه.`;
    }

    if (intent === "design") {
        return `خلنا نصمم واجهة احترافية! 🎨

اقتراحي:
- خلفية داكنة.
- بنفسجي مع أزرق سماوي.
- زوايا دائرية.
- UIStroke خفيف.
- TweenService للانتقالات.
- UIListLayout لترتيب العناصر.
- UIScale لدعم أحجام الشاشات.

نصيحة: لا تكثر المؤثرات حتى لا تصبح الواجهة مزدحمة.`;
    }

    if (intent === "scripts") {
        return `أقدر أساعدك في بناء السكربتات وفهمها! 💻

لكن أحتاج أعرف المطلوب بالتحديد.

مثلاً:
- نظام أموال.
- نظام مستويات.
- نظام Rebirth.
- متجر Game Pass.
- نظام وظائف.
- حفظ بيانات.
- نظام جولات.
- نظام سيارات.

اكتب لي وظيفة السكربت ومكان تشغيله المطلوب.`;
    }

    const knowledge = searchKnowledge(query);

    if (knowledge) {
        return `📚 ${knowledge.title}

${knowledge.answer}

━━━━━━━━━━━━━━
تصنيف المعرفة: ${knowledge.category}

هل تريد مثالاً أكبر على هذا النظام؟`;
    }

    if (intent === "explanation") {
        return `أقدر أشرح لك! 📖

لكن ما حددت المصطلح الذي تريد شرحه.

اكتب مثلاً:
- اشرح DataStore.
- اشرح RemoteEvent.
- اشرح ModuleScript.
- اشرح TweenService.
- اشرح Leaderstats.

وبعطيك شرحاً مع مثال.`;
    }

    return `وصلني سؤالك! ✦

ما لقيت إجابة دقيقة له في قاعدة المعرفة المحلية.

جرب:
- كتابة اسم الخدمة بالإنجليزية.
- توضيح المطلوب أكثر.
- إرسال رسالة الخطأ.
- تحديد نوع نظام Roblox الذي تريد بناءه.

تقدر أيضاً تستخدم مختبر السكربتات لفحص كودك.

ملاحظة: قاعدة المعرفة محلية ومحدودة، وليست ذكاءً اصطناعياً عاماً متصلاً بالإنترنت.`;
}


/* ================= CHAT SYSTEM ================= */

let chatHistory = loadData(STORAGE.chat, []);

if (!Array.isArray(chatHistory)) {
    chatHistory = [];
}

function saveChat() {
    saveData(STORAGE.chat, chatHistory);
    updateStats();
}

function renderMessage(role, text) {
    const container = $("#chatMessages");

    if (!container) return;

    const row = document.createElement("div");

    row.className = role === "user"
        ? "message-row user-message"
        : "message-row ai-message";

    const avatar = document.createElement("div");
    avatar.className = "ai-avatar";
    avatar.textContent = role === "user" ? "U" : "G";

    const content = document.createElement("div");
    content.className = "message-content";

    const name = document.createElement("div");
    name.className = "message-name";
    name.textContent = role === "user" ? "أنت" : "GAMEDEV AI";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = text;

    content.append(name, bubble);
    row.append(avatar, content);

    container.appendChild(row);

    container.scrollTop = container.scrollHeight;
}

function addMessage(role, text) {
    renderMessage(role, text);

    chatHistory.push({
        role,
        text,
        date: Date.now()
    });

    if (chatHistory.length > 100) {
        chatHistory = chatHistory.slice(-100);
    }

    saveChat();
}

function restoreChat() {
    const container = $("#chatMessages");

    if (!container) return;

    container.innerHTML = "";

    if (chatHistory.length === 0) {
        renderMessage(
            "ai",
            "أهلاً بك في GAMEDEV AI ULTRA! 🚀\n\nأنا مساعدك المحلي لتطوير الألعاب. كيف أقدر أساعدك اليوم؟"
        );

        return;
    }

    chatHistory.forEach(message => {
        renderMessage(message.role, message.text);
    });
}

function sendChat() {
    const input = $("#chatInput");
    const button = $("#chatSend");

    if (!input || !button) return;

    const text = input.value.trim();

    if (!text) {
        showToast("اكتب رسالتك أولاً");
        return;
    }

    if (text.length > 5000) {
        showToast("الرسالة طويلة جداً");
        return;
    }

    input.value = "";
    button.disabled = true;

    addMessage("user", text);

    const oldText = button.textContent;
    button.textContent = "...";

    setTimeout(() => {
        const response = generateResponse(text);

        addMessage("ai", response);

        button.textContent = oldText;
        button.disabled = false;

        input.focus();
    }, 450);
}

$("#chatSend")?.addEventListener("click", sendChat);

$("#chatInput")?.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendChat();
    }
});

$$(".chat-suggestions button").forEach(button => {
    button.addEventListener("click", () => {
        const input = $("#chatInput");

        if (!input) return;

        input.value = button.dataset.prompt || button.textContent;
        sendChat();
    });
});


/* ================= IDEA FACTORY ================= */

const IDEA_DATABASE = {
    "واقعية": [
        {
            title: "حياة المدينة الخليجية",
            description: "مدينة مفتوحة يعيش فيها اللاعب حياة كاملة.",
            systems: [
                "وظائف متعددة وترقيات وظيفية",
                "رواتب وميزانية شخصية",
                "معارض سيارات وورش",
                "منازل قابلة للشراء",
                "نظام شرطة وإسعاف",
                "متاجر ومطاعم",
                "نظام مخالفات وقوانين"
            ]
        },
        {
            title: "إمبراطورية المشاريع",
            description: "ابدأ بمشروع صغير وحوله إلى شركة كبيرة.",
            systems: [
                "شراء المحلات",
                "توظيف الموظفين",
                "ترقية المشاريع",
                "نظام أرباح وخسائر",
                "منافسة بين الشركات",
                "تطوير الفروع"
            ]
        },
        {
            title: "حياة الإعلامي",
            description: "ابدأ كمراسل صغير واصعد حتى تصبح مدير قناة.",
            systems: [
                "تصوير الأخبار",
                "مقابلات اللاعبين",
                "نشرات مباشرة",
                "ترقيات إعلامية",
                "استوديوهات تلفزيونية",
                "مهام صحفية"
            ]
        },
        {
            title: "رحلة سائق الشاحنات",
            description: "انقل البضائع بين المدن وابنِ شركة نقل خاصة.",
            systems: [
                "شاحنات متعددة",
                "توصيل الطلبات",
                "محطات وقود",
                "نظام شحن البضائع",
                "ترقية المركبات",
                "شركات منافسة"
            ]
        }
    ],

    "مغامرات": [
        {
            title: "جزيرة الأسرار",
            description: "جزيرة ضخمة تخفي أسراراً وآثاراً ومناطق مجهولة.",
            systems: [
                "خريطة قابلة للاستكشاف",
                "كهوف سرية",
                "جمع الموارد",
                "ألغاز ومفاتيح",
                "زعماء ومواجهات",
                "مكافآت نادرة"
            ]
        },
        {
            title: "آخر محطة",
            description: "رحلة في عالم مليء بالتحديات والموارد.",
            systems: [
                "نظام تصنيع",
                "مناطق مختلفة",
                "مهام رئيسية",
                "تطوير الأدوات",
                "نظام صحة وطاقة",
                "أحداث عشوائية"
            ]
        }
    ],

    "رعب": [
        {
            title: "المنزل رقم 13",
            description: "منزل غامض يتغير تصميمه كلما تقدمت.",
            systems: [
                "أبواب وأقفال",
                "ألغاز مخفية",
                "أصوات ديناميكية",
                "إضاءة متغيرة",
                "مخلوق يلاحق اللاعبين",
                "نهايات متعددة"
            ]
        },
        {
            title: "المستشفى المهجور",
            description: "استكشف مستشفى غامضاً وحاول اكتشاف ما حدث.",
            systems: [
                "غرف سرية",
                "بطاقات دخول",
                "كاميرات مراقبة",
                "مهام جماعية",
                "أحداث مفاجئة",
                "قصة متدرجة"
            ]
        }
    ],

    "محاكاة": [
        {
            title: "محاكي بناء المملكة",
            description: "ابدأ بقطعة أرض صغيرة وابنِ مملكتك.",
            systems: [
                "بناء المباني",
                "جمع الموارد",
                "توظيف السكان",
                "تطوير المدينة",
                "نظام تجارة",
                "ترتيب أفضل الممالك"
            ]
        },
        {
            title: "محاكي المطار",
            description: "أدر مطاراً كاملاً مع الطائرات والموظفين.",
            systems: [
                "تسجيل المسافرين",
                "إدارة الرحلات",
                "موظفو المطار",
                "شراء الطائرات",
                "تطوير الصالات",
                "جدول رحلات"
            ]
        }
    ],

    "اجتماعية": [
        {
            title: "قرية الأولين",
            description: "قرية تراثية يعيش فيها اللاعبون ويتعاونون.",
            systems: [
                "مهن تراثية",
                "مجلس القرية",
                "سوق شعبي",
                "مناسبات جماعية",
                "بيوت قابلة للتطوير",
                "نظام سمعة"
            ]
        },
        {
            title: "المول الكبير",
            description: "مجمع تجاري ضخم مليء بالأنشطة والوظائف.",
            systems: [
                "متاجر متنوعة",
                "وظائف داخل المول",
                "سينما",
                "مطاعم",
                "مسابقات",
                "مناطق ترفيهية"
            ]
        }
    ],

    "جديدة وغريبة": [
        {
            title: "مدينة تحت الطاولة",
            description: "عالم كامل يعيش فيه اللاعبون داخل غرفة عملاقة.",
            systems: [
                "تسلق الأثاث العملاق",
                "بناء منازل مصغرة",
                "جمع أدوات يومية",
                "مناطق سرية",
                "سباقات مصغرة",
                "مهام استكشاف"
            ]
        },
        {
            title: "متحف الزمن",
            description: "كل غرفة تنقلك إلى عصر مختلف.",
            systems: [
                "عصور متعددة",
                "مهام تاريخية خيالية",
                "أدوات مختلفة",
                "ألغاز زمنية",
                "بوابات انتقال",
                "مقتنيات نادرة"
            ]
        }
    ]
};

let selectedGenre =
    localStorage.getItem(STORAGE.selectedGenre) || "واقعية";

let currentIdea = "";

function selectGenre(genre) {
    if (!IDEA_DATABASE[genre]) return;

    selectedGenre = genre;

    localStorage.setItem(STORAGE.selectedGenre, genre);

    $$(".genre").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.genre === genre
        );
    });
}

$$(".genre").forEach(button => {
    button.addEventListener("click", () => {
        selectGenre(button.dataset.genre);
    });
});

function generateIdea() {
    const database = IDEA_DATABASE[selectedGenre];

    if (!database || database.length === 0) {
        showToast("التصنيف غير متوفر");
        return;
    }

    const details = $("#ideaDetails")?.value.trim() || "";

    const idea = database[
        Math.floor(Math.random() * database.length)
    ];

    const result = `🎮 ${idea.title}

━━━━━━━━━━━━━━━━

📖 وصف اللعبة:
${idea.description}

━━━━━━━━━━━━━━━━

⚙️ الأنظمة الرئيسية:

${idea.systems.map((system, index) =>
    `${index + 1}. ${system}`
).join("\n")}

━━━━━━━━━━━━━━━━

🎯 هدف اللاعب:
تطوير شخصيته، استكشاف عالم اللعبة، إنجاز المهام، وفتح محتوى جديد.

👥 نمط اللعب:
Multiplayer

📌 التصنيف:
${selectedGenre}

${details ? `\n✨ طلبك الإضافي:\n${details}` : ""}

━━━━━━━━━━━━━━━━

تم إنشاء الفكرة بواسطة GAMEDEV AI ULTRA`;

    currentIdea = result;

    const placeholder = $("#ideaResult");
    const output = $("#ideaOutput");

    if (placeholder) {
        placeholder.innerHTML = "";

        const resultBox = document.createElement("div");
        resultBox.className = "idea-output";
        resultBox.textContent = result;

        placeholder.appendChild(resultBox);
    }

    if (output) {
        output.textContent = result;
        output.hidden = false;
    }

    showToast("تم إنشاء فكرة جديدة! 💡");
}

$("#generateIdea")?.addEventListener("click", generateIdea);

$("#copyIdea")?.addEventListener("click", async () => {
    if (!currentIdea) {
        showToast("أنشئ فكرة أولاً");
        return;
    }

    await copyText(currentIdea);
});


/* ================= SCRIPT LAB ================= */

const SCRIPT_TEMPLATES = {
    "Leaderstats": `-- Leaderstats System
-- Location: ServerScriptService
-- Type: Script

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)

    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = 0
    coins.Parent = leaderstats

    local wins = Instance.new("IntValue")
    wins.Name = "Wins"
    wins.Value = 0
    wins.Parent = leaderstats

end)`,

    "Door": `-- Proximity Door System
-- Location: ServerScriptService
-- Type: Script

local door = workspace:WaitForChild("Door")

local prompt = Instance.new("ProximityPrompt")
prompt.ActionText = "Open"
prompt.ObjectText = "Door"
prompt.KeyboardKeyCode = Enum.KeyCode.E
prompt.Parent = door

local opened = false

prompt.Triggered:Connect(function(player)

    if opened then
        return
    end

    opened = true
    door.Transparency = 0.5
    door.CanCollide = false

    task.wait(3)

    door.Transparency = 0
    door.CanCollide = true
    opened = false

end)`,

    "Speed": `-- Player Speed System
-- Location: ServerScriptService
-- Type: Script

local Players = game:GetService("Players")

local DEFAULT_SPEED = 16
local BOOST_SPEED = 30

Players.PlayerAdded:Connect(function(player)

    player.CharacterAdded:Connect(function(character)

        local humanoid = character:WaitForChild("Humanoid")

        humanoid.WalkSpeed = DEFAULT_SPEED

    end)

end)

-- Change humanoid speed from trusted server logic.
-- Never let the client choose arbitrary speed values.`,

    "Coins": `-- Basic Coin Collection
-- Location: Script inside the coin part

local coin = script.Parent
local Players = game:GetService("Players")

local collected = false

coin.Touched:Connect(function(hit)

    if collected then
        return
    end

    local character = hit.Parent
    local player = Players:GetPlayerFromCharacter(character)

    if not player then
        return
    end

    local leaderstats = player:FindFirstChild("leaderstats")

    if not leaderstats then
        return
    end

    local coins = leaderstats:FindFirstChild("Coins")

    if not coins then
        return
    end

    collected = true
    coins.Value += 10

    coin:Destroy()

end)`,

    "Tween": `-- Tween Animation
-- Location: Script

local TweenService = game:GetService("TweenService")

local part = workspace:WaitForChild("Part")

local tweenInfo = TweenInfo.new(
    2,
    Enum.EasingStyle.Quad,
    Enum.EasingDirection.Out
)

local goal = {
    Position = part.Position + Vector3.new(0, 5, 0)
}

local tween = TweenService:Create(
    part,
    tweenInfo,
    goal
)

tween:Play()`,

    "RemoteEvent": `-- Server Script
-- Create a RemoteEvent in ReplicatedStorage
-- Name it: ExampleEvent

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local event = ReplicatedStorage:WaitForChild("ExampleEvent")

event.OnServerEvent:Connect(function(player, message)

    if typeof(message) ~= "string" then
        return
    end

    if #message > 100 then
        return
    end

    print(player.Name, message)

end)

-- Client example:
-- event:FireServer("Hello Server")`
};

function showScriptResult(message, type = "info") {
    const result = $("#scriptResult");

    if (!result) return;

    result.innerHTML = "";

    const box = document.createElement("div");

    box.style.padding = "12px";
    box.style.borderRadius = "10px";
    box.style.lineHeight = "2";
    box.style.fontSize = "12px";
    box.style.whiteSpace = "pre-wrap";
    box.style.overflowWrap = "anywhere";

    if (type === "error") {
        box.style.background = "rgba(255,102,139,.08)";
        box.style.color = "#ff91ac";
    } else if (type === "success") {
        box.style.background = "rgba(76,221,163,.08)";
        box.style.color = "#73e7b5";
    } else {
        box.style.background = "rgba(149,100,255,.08)";
        box.style.color = "#d1c2ff";
    }

    box.textContent = message;

    result.appendChild(box);
}

function analyzeScript(code) {
    const issues = [];
    const warnings = [];

    if (!code.trim()) {
        issues.push("المحرر فارغ. اكتب كوداً أولاً.");
        return { issues, warnings };
    }

    if (!/local\s+|function\s+|print\s*\(|game:|script\.|workspace/.test(code)) {
        warnings.push("لم يتم العثور على أنماط Luau شائعة.");
    }

    const opening = {
        "(": ")",
        "[": "]",
        "{": "}"
    };

    const stack = [];

    let inString = null;
    let escaped = false;
    let inLineComment = false;

    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const next = code[i + 1];

        if (inLineComment) {
            if (char === "\n") {
                inLineComment = false;
            }
            continue;
        }

        if (inString) {
            if (escaped) {
                escaped = false;
                continue;
            }

            if (char === "\\") {
                escaped = true;
                continue;
            }

            if (char === inString) {
                inString = null;
            }

            continue;
        }

        if (char === "-" && next === "-") {
            inLineComment = true;
            i++;
            continue;
        }

        if (char === '"' || char === "'") {
            inString = char;
            continue;
        }

        if (opening[char]) {
            stack.push({
                char,
                index: i
            });
            continue;
        }

        if (Object.values(opening).includes(char)) {
            const last = stack.pop();

            if (!last || opening[last.char] !== char) {
                issues.push(`قوس غير متطابق عند الحرف رقم ${i + 1}.`);
            }
        }
    }

    if (inString) {
        issues.push("يوجد نص مفتوح لم يتم إغلاقه.");
    }

    if (stack.length > 0) {
        issues.push("يوجد قوس مفتوح لم يتم إغلاقه.");
    }

    if (/\bthen\s*end\b/.test(code) && !/if\b/.test(code)) {
        warnings.push("راجع استخدام then و end.");
    }

    if (/WaitForChild\s*\(/.test(code)) {
        warnings.push("تأكد أن العناصر المطلوبة موجودة حتى لا ينتظر السكربت إلى ما لا نهاية.");
    }

    if (/OnServerEvent/.test(code) && /FireServer/.test(code)) {
        warnings.push("تأكد من أن العميل لا يستطيع إرسال قيم غير موثوقة للسيرفر.");
    }

    if (/GetAsync|SetAsync|UpdateAsync/.test(code)) {
        warnings.push("عمليات DataStore تحتاج معالجة أخطاء باستخدام pcall.");
    }

    if (/while\s+true\s+do/.test(code) && !/task\.wait/.test(code)) {
        warnings.push("حلقة while true بدون انتظار قد تسبب استهلاكاً مرتفعاً للأداء.");
    }

    if (/\.Touched:Connect/.test(code)) {
        warnings.push("قد يتكرر حدث Touched مرات متعددة. استخدم debounce عند الحاجة.");
    }

    if (/TODO|FIXME/i.test(code)) {
        warnings.push("توجد ملاحظات TODO أو FIXME داخل الكود.");
    }

    return {
        issues,
        warnings
    };
}

function checkScript() {
    const code = $("#scriptInput")?.value || "";

    const result = analyzeScript(code);

    if (result.issues.length === 0 && result.warnings.length === 0) {
        showScriptResult(
            "✓ لم يتم العثور على أخطاء شكلية واضحة.\n\nهذا لا يعني أن السكربت يعمل بشكل صحيح؛ الفحص محلي ومبسط ولا ينفذ Luau.",
            "success"
        );

        return;
    }

    let output = "";

    if (result.issues.length) {
        output += "الأخطاء الشكلية:\n";

        output += result.issues
            .map((item, index) => `${index + 1}. ${item}`)
            .join("\n");

        output += "\n\n";
    }

    if (result.warnings.length) {
        output += "ملاحظات:\n";

        output += result.warnings
            .map((item, index) => `${index + 1}. ${item}`)
            .join("\n");
    }

    output += "\n\nملاحظة: هذا فحص نصي أولي وليس محلل Luau كاملاً.";

    showScriptResult(
        output,
        result.issues.length ? "error" : "info"
    );
}

$("#fixScript")?.addEventListener("click", checkScript);

$("#explainScript")?.addEventListener("click", () => {
    const code = $("#scriptInput")?.value.trim();

    if (!code) {
        showToast("اكتب الكود أولاً");
        return;
    }

    const lines = code.split("\n");

    const explanation = `📖 تحليل الكود

عدد الأسطر: ${lines.length}

عدد الأحرف: ${code.length}

عدد الدوال المحتملة:
${(code.match(/\bfunction\b/g) || []).length}

عدد المتغيرات المحلية:
${(code.match(/\blocal\b/g) || []).length}

عدد الأحداث:
${(code.match(/:Connect\s*\(/g) || []).length}

الخدمات المكتوبة:
${(code.match(/GetService\s*\(/g) || []).length}

━━━━━━━━━━━━━━

ملاحظات:
- local يستخدم لتعريف متغير محلي.
- function لتعريف دالة.
- Connect لربط حدث بدالة.
- GetService للحصول على خدمة من Roblox.

هذا تحليل نصي عام وليس شرحاً دلالياً كاملاً للكود.`;

    showScriptResult(explanation, "info");
});

$("#createScript")?.addEventListener("click", () => {
    const names = Object.keys(SCRIPT_TEMPLATES);

    const choice = prompt(
        "اختر قالباً بكتابة اسمه:\n\n" +
        names.map((name, index) => `${index + 1}. ${name}`).join("\n")
    );

    if (!choice) return;

    const index = Number(choice) - 1;

    const selectedName = names.includes(choice)
        ? choice
        : names[index];

    if (!selectedName) {
        showToast("القالب غير موجود");
        return;
    }

    $("#scriptInput").value = SCRIPT_TEMPLATES[selectedName];

    showToast("تم تحميل قالب " + selectedName);

    showScriptResult(
        `تم تحميل قالب ${selectedName}.\n\nيمكنك الآن تعديله وحفظه.`,
        "success"
    );
});


/* ================= SAVE SCRIPT BUTTON ================= */

function createSaveScriptButton() {
    const actions = $(".editor-actions");

    if (!actions || $("#saveScriptButton")) return;

    const button = document.createElement("button");

    button.id = "saveScriptButton";
    button.className = "secondary-button";
    button.textContent = "حفظ الكود";

    button.addEventListener("click", saveCurrentScript);

    actions.appendChild(button);
}

function saveCurrentScript() {
    const code = $("#scriptInput")?.value.trim();

    if (!code) {
        showToast("اكتب كوداً أولاً");
        return;
    }

    const name = prompt("اكتب اسم السكربت:");

    if (!name || !name.trim()) return;

    const scripts = loadData(STORAGE.scripts, []);

    scripts.unshift({
        id: Date.now(),
        name: name.trim(),
        code,
        date: new Date().toLocaleDateString("ar-SA")
    });

    if (scripts.length > 100) {
        scripts.length = 100;
    }

    if (!saveData(STORAGE.scripts, scripts)) return;

    showToast("تم حفظ السكربت بنجاح");

    updateStats();
}


/* ================= COPY SYSTEM ================= */

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast("تم النسخ بنجاح ✓");
    } catch (error) {
        const textarea = document.createElement("textarea");

        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.select();

        try {
            document.execCommand("copy");
            showToast("تم النسخ بنجاح ✓");
        } catch {
            showToast("تعذر النسخ");
        }

        textarea.remove();
    }
}

$("#copyScript")?.addEventListener("click", async () => {
    const output = $("#scriptOutput");

    if (output && !output.hidden && output.textContent.trim()) {
        await copyText(output.textContent);
        return;
    }

    const code = $("#scriptInput")?.value || "";

    if (!code.trim()) {
        showToast("لا يوجد كود للنسخ");
        return;
    }

    await copyText(code);
});


/* ================= PROJECT SYSTEM ================= */

function getProjects() {
    const projects = loadData(STORAGE.projects, []);
    return Array.isArray(projects) ? projects : [];
}

function renderProjects() {
    const projects = getProjects();

    const grids = [
        $("#projectsGrid"),
        $("#homeProjects")
    ].filter(Boolean);

    grids.forEach(grid => {
        grid.innerHTML = "";

        if (projects.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div>▣</div>
                    <h3>لا توجد مشاريع حتى الآن</h3>
                    <p>أنشئ أول مشروع لك وابدأ التطوير!</p>
                </div>
            `;

            return;
        }

        const displayedProjects =
            grid.id === "homeProjects"
                ? projects.slice(0, 3)
                : projects;

        displayedProjects.forEach(project => {
            const card = document.createElement("article");
            card.className = "project-card";

            const top = document.createElement("div");
            top.className = "project-card-top";

            const icon = document.createElement("div");
            icon.className = "project-card-icon";
            icon.textContent = "▣";

            top.appendChild(icon);

            if (grid.id === "projectsGrid") {
                const remove = document.createElement("button");
                remove.className = "project-delete";
                remove.textContent = "×";
                remove.title = "حذف المشروع";

                remove.addEventListener("click", () => {
                    deleteProject(project.id);
                });

                top.appendChild(remove);
            }

            const title = document.createElement("h3");
            title.textContent = project.name;

            const description = document.createElement("p");
            description.textContent =
                project.description || "لا يوجد وصف للمشروع.";

            const date = document.createElement("small");
            date.className = "project-date";
            date.textContent = project.date || "";

            card.append(top, title, description, date);
            grid.appendChild(card);
        });
    });

    updateStats();
}

function deleteProject(id) {
    const confirmed = confirm("هل تريد حذف هذا المشروع؟");

    if (!confirmed) return;

    const projects = getProjects().filter(
        project => project.id !== id
    );

    if (!saveData(STORAGE.projects, projects)) return;

    renderProjects();

    showToast("تم حذف المشروع");
}

function saveProject() {
    const name = $("#projectName")?.value.trim();
    const description = $("#projectDescription")?.value.trim();

    if (!name) {
        showToast("اكتب اسم المشروع");
        $("#projectName")?.focus();
        return;
    }

    const projects = getProjects();

    projects.unshift({
        id: Date.now(),
        name,
        description,
        date: new Date().toLocaleDateString("ar-SA")
    });

    if (!saveData(STORAGE.projects, projects)) return;

    $("#projectName").value = "";
    $("#projectDescription").value = "";

    $("#projectModal")?.classList.remove("show");

    renderProjects();

    showToast("تم إنشاء مشروعك بنجاح! 🚀");
}

$("#newProject")?.addEventListener("click", () => {
    $("#projectModal")?.classList.add("show");
    $("#projectName")?.focus();
});

$("#closeProjectModal")?.addEventListener("click", () => {
    $("#projectModal")?.classList.remove("show");
});

$("#projectModal")?.addEventListener("click", event => {
    if (event.target.id === "projectModal") {
        $("#projectModal").classList.remove("show");
    }
});

$("#saveProject")?.addEventListener("click", saveProject);


/* ================= LIBRARY SYSTEM ================= */

const DEFAULT_LIBRARY = [
    {
        id: "lib1",
        name: "Leaderstats",
        description: "إنشاء إحصائيات اللاعب الأساسية.",
        category: "player",
        code: SCRIPT_TEMPLATES.Leaderstats
    },
    {
        id: "lib2",
        name: "Coin Collection",
        description: "نظام جمع العملات وإضافة النقاط.",
        category: "systems",
        code: SCRIPT_TEMPLATES.Coins
    },
    {
        id: "lib3",
        name: "Door System",
        description: "باب تفاعلي باستخدام ProximityPrompt.",
        category: "systems",
        code: SCRIPT_TEMPLATES.Door
    },
    {
        id: "lib4",
        name: "Player Speed",
        description: "تعيين سرعة أساسية للشخصية.",
        category: "player",
        code: SCRIPT_TEMPLATES.Speed
    },
    {
        id: "lib5",
        name: "Tween Animation",
        description: "تحريك الأجسام باستخدام TweenService.",
        category: "gui",
        code: SCRIPT_TEMPLATES.Tween
    },
    {
        id: "lib6",
        name: "RemoteEvent",
        description: "مثال على التواصل بين العميل والسيرفر.",
        category: "systems",
        code: SCRIPT_TEMPLATES.RemoteEvent
    }
];

let currentLibraryFilter = "all";

function getLibrary() {
    const saved = loadData(STORAGE.library, null);

    if (Array.isArray(saved)) {
        return [...DEFAULT_LIBRARY, ...saved];
    }

    return [...DEFAULT_LIBRARY];
}

function renderLibrary() {
    const grid = $("#libraryGrid");

    if (!grid) return;

    const search = normalizeText(
        $("#librarySearch")?.value || ""
    );

    const library = getLibrary();

    const filtered = library.filter(item => {
        const matchesFilter =
            currentLibraryFilter === "all" ||
            item.category === currentLibraryFilter;

        const matchesSearch =
            !search ||
            normalizeText(item.name).includes(search) ||
            normalizeText(item.description).includes(search);

        return matchesFilter && matchesSearch;
    });

    grid.innerHTML = "";

    if (filtered.length === 0) {
        const empty = document.createElement("div");

        empty.className = "library-placeholder";
        empty.innerHTML = `
            <div>⌕</div>
            <h3>لا توجد نتائج</h3>
            <p>جرب كلمة بحث أخرى.</p>
        `;

        grid.appendChild(empty);
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement("article");
        card.className = "project-card";

        const icon = document.createElement("div");
        icon.className = "project-card-icon";
        icon.textContent = "⌘";

        const title = document.createElement("h3");
        title.textContent = item.name;

        const description = document.createElement("p");
        description.textContent = item.description;

        const button = document.createElement("button");
        button.className = "secondary-button";
        button.style.width = "100%";
        button.style.marginTop = "14px";
        button.textContent = "فتح الكود";

        button.addEventListener("click", () => {
            $("#scriptInput").value = item.code;

            openPage("scripts");

            showToast("تم فتح الكود في المختبر");
        });

        card.append(icon, title, description, button);

        grid.appendChild(card);
    });
}

$$(".library-filter").forEach(button => {
    button.addEventListener("click", () => {
        currentLibraryFilter = button.dataset.filter;

        $$(".library-filter").forEach(filter => {
            filter.classList.toggle(
                "active",
                filter === button
            );
        });

        renderLibrary();
    });
});

$("#librarySearch")?.addEventListener("input", renderLibrary);


/* ================= STATISTICS ================= */

function updateStats() {
    const projects = getProjects();
    const scripts = loadData(STORAGE.scripts, []);

    const projectCount = $("#projectCount");
    const chatCount = $("#chatCount");
    const scriptCount = $("#scriptCount");

    if (projectCount) {
        projectCount.textContent = projects.length;
    }

    if (chatCount) {
        chatCount.textContent = chatHistory.length;
    }

    if (scriptCount) {
        scriptCount.textContent =
            Array.isArray(scripts) ? scripts.length : 0;
    }
}


/* ================= KEYBOARD SHORTCUTS ================= */

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        $("#projectModal")?.classList.remove("show");
    }

    if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s"
    ) {
        if ($("#scripts")?.classList.contains("active")) {
            event.preventDefault();
            saveCurrentScript();
        }
    }
});


/* ================= INITIALIZATION ================= */

function initializeApp() {
    console.log(
        "%c GAMEDEV AI ULTRA ",
        "background:#8055ff;color:white;font-size:20px;font-weight:bold;padding:10px;"
    );

    console.log("Developer Engine initialized.");

    loadTheme();

    const savedGenre = localStorage.getItem(STORAGE.selectedGenre);

    if (savedGenre && IDEA_DATABASE[savedGenre]) {
        selectGenre(savedGenre);
    }

    restoreChat();

    createSaveScriptButton();

    renderProjects();

    renderLibrary();

    updateStats();

    showToast("مرحباً بك في GAMEDEV AI ULTRA 🚀");
}

initializeApp();/* ==========================================
   GAMEDEV AI - ULTRA CODE EDITOR
   Luau Editor Upgrade
========================================== */

(() => {
    "use strict";

    const editor = document.getElementById("scriptInput");
    if (!editor || editor.dataset.ultraEditor === "true") return;

    editor.dataset.ultraEditor = "true";
    editor.spellcheck = false;
    editor.wrap = "off";

    // إنشاء المحرر
    const wrapper = document.createElement("div");
    wrapper.className = "gai-editor-wrap";

    const lineNumbers = document.createElement("div");
    lineNumbers.className = "gai-line-numbers";

    const highlight = document.createElement("pre");
    highlight.className = "gai-highlight";

    const codeLayer = document.createElement("code");
    highlight.appendChild(codeLayer);

    editor.parentNode.insertBefore(wrapper, editor);
    wrapper.appendChild(lineNumbers);
    wrapper.appendChild(highlight);
    wrapper.appendChild(editor);

    // شريط الأدوات
    const toolbar = document.createElement("div");
    toolbar.className = "gai-editor-toolbar";

    toolbar.innerHTML = `
        <div class="gai-editor-info">
            <span class="gai-live-dot"></span>
            <span>LUАU EDITOR</span>
            <span class="gai-editor-version">ULTRA</span>
        </div>

        <div class="gai-editor-buttons">
            <button type="button" data-editor-action="copy">نسخ</button>
            <button type="button" data-editor-action="download">تحميل LUA</button>
            <button type="button" data-editor-action="fullscreen">تكبير</button>
        </div>
    `;

    wrapper.parentNode.insertBefore(toolbar, wrapper);

    // حماية النصوص قبل عرضها
    function escapeHTML(text) {
        return text.replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    // تلوين Luau
    function highlightCode(source) {
        const tokens = [];
        let output = "";
        let i = 0;

        const keywords = new Set([
            "local", "function", "end", "if", "then",
            "else", "elseif", "for", "while", "do",
            "repeat", "until", "return", "break",
            "continue", "in", "and", "or", "not",
            "true", "false", "nil", "type", "export"
        ]);

        const builtins = new Set([
            "print", "warn", "error", "pairs", "ipairs",
            "next", "select", "unpack", "pcall", "xpcall",
            "assert", "tostring", "tonumber", "typeof",
            "require", "wait", "spawn", "delay", "task",
            "game", "workspace", "script", "Enum",
            "Instance", "Vector3", "Vector2", "CFrame",
            "Color3", "UDim2", "BrickColor"
        ]);

        while (i < source.length) {
            const rest = source.slice(i);
            let match;

            // التعليقات
            if (rest.startsWith("--")) {
                match = rest.match(/^--[^\n]*/);
                if (!match) match = [rest];

                output += `<span class="gai-comment">${escapeHTML(match[0])}</span>`;
                i += match[0].length;
                continue;
            }

            // النصوص
            if (source[i] === '"' || source[i] === "'") {
                const quote = source[i];
                let end = i + 1;

                while (end < source.length) {
                    if (source[end] === "\\") {
                        end += 2;
                        continue;
                    }

                    if (source[end] === quote) {
                        end++;
                        break;
                    }

                    end++;
                }

                const value = source.slice(i, end);
                output += `<span class="gai-string">${escapeHTML(value)}</span>`;
                i = end;
                continue;
            }

            // الأرقام
            match = rest.match(/^\b\d+(\.\d+)?\b/);

            if (match) {
                output += `<span class="gai-number">${match[0]}</span>`;
                i += match[0].length;
                continue;
            }

            // الكلمات
            match = rest.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);

            if (match) {
                const word = match[0];

                if (keywords.has(word)) {
                    output += `<span class="gai-keyword">${word}</span>`;
                } else if (builtins.has(word)) {
                    output += `<span class="gai-builtin">${word}</span>`;
                } else if (/^[A-Z]/.test(word)) {
                    output += `<span class="gai-class">${word}</span>`;
                } else {
                    output += escapeHTML(word);
                }

                i += word.length;
                continue;
            }

            output += escapeHTML(source[i]);
            i++;
        }

        return output + "\n";
    }

    // تحديث الأسطر والتلوين
    function updateEditor() {
        const value = editor.value;

        codeLayer.innerHTML = highlightCode(value);

        const count = Math.max(1, value.split("\n").length);

        lineNumbers.innerHTML = Array.from(
            { length: count },
            (_, index) => `<span>${index + 1}</span>`
        ).join("");

        lineNumbers.scrollTop = editor.scrollTop;
        highlight.scrollTop = editor.scrollTop;
        highlight.scrollLeft = editor.scrollLeft;
    }

    editor.addEventListener("input", updateEditor);

    editor.addEventListener("scroll", () => {
        lineNumbers.scrollTop = editor.scrollTop;
        highlight.scrollTop = editor.scrollTop;
        highlight.scrollLeft = editor.scrollLeft;
    });

    // إكمال الأقواس والاقتباسات
    editor.addEventListener("keydown", event => {
        const pairs = {
            "(": ")",
            "[": "]",
            "{": "}",
            '"': '"',
            "'": "'"
        };

        if (event.key === "Tab") {
            event.preventDefault();

            const start = editor.selectionStart;
            const end = editor.selectionEnd;

            editor.setRangeText("    ", start, end, "end");
            editor.dispatchEvent(new Event("input"));
            return;
        }

        if (pairs[event.key]) {
            event.preventDefault();

            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const selected = editor.value.slice(start, end);

            editor.setRangeText(
                event.key + selected + pairs[event.key],
                start,
                end,
                "select"
            );

            if (!selected) {
                editor.selectionStart = start + 1;
                editor.selectionEnd = start + 1;
            }

            editor.dispatchEvent(new Event("input"));
        }

        if (event.key === "Enter") {
            const start = editor.selectionStart;
            const before = editor.value.slice(0, start);
            const currentLine = before.split("\n").pop();
            const indentation = currentLine.match(/^\s*/)[0];

            if (indentation.length > 0) {
                event.preventDefault();

                editor.setRangeText(
                    "\n" + indentation,
                    start,
                    editor.selectionEnd,
                    "end"
                );

                editor.dispatchEvent(new Event("input"));
            }
        }
    });

    // أزرار المحرر
    toolbar.addEventListener("click", async event => {
        const button = event.target.closest("[data-editor-action]");
        if (!button) return;

        const action = button.dataset.editorAction;

        if (action === "copy") {
            try {
                await navigator.clipboard.writeText(editor.value);
                showEditorToast("تم نسخ الكود بنجاح!");
            } catch {
                editor.select();
                document.execCommand("copy");
                showEditorToast("تم نسخ الكود!");
            }
        }

        if (action === "download") {
            const blob = new Blob(
                [editor.value],
                { type: "text/plain;charset=utf-8" }
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "GameDev-Script.lua";
            link.click();

            URL.revokeObjectURL(url);
            showEditorToast("تم تحميل ملف LUA!");
        }

        if (action === "fullscreen") {
            wrapper.classList.toggle("gai-editor-fullscreen");

            button.textContent = wrapper.classList.contains(
                "gai-editor-fullscreen"
            ) ? "تصغير" : "تكبير";
        }
    });

    function showEditorToast(message) {
        const toast = document.getElementById("gameToast");
        const toastMessage = document.getElementById("toastMessage");

        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.classList.add("show");

            setTimeout(() => {
                toast.classList.remove("show");
            }, 2500);
        } else {
            alert(message);
        }
    }

    updateEditor();

    console.log("GAMEDEV AI ULTRA EDITOR READY");
})();/* =================================================
   GAMEDEV AI - SMART ROBLOX SCRIPT GENERATOR
   Version 5.0
================================================= */

(() => {
    "use strict";

    const STORAGE_KEY = "GAMEDEV_AI_SMART_LIBRARY_V5";

    const editor = document.getElementById("scriptInput");

    if (!editor) {
        console.warn("GAMEDEV AI: Script editor not found.");
        return;
    }

    if (document.getElementById("smartGenerator")) return;

    let savedScripts = [];

    try {
        savedScripts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        savedScripts = [];
    }

    const templates = {
        leaderstats: {
            name: "نظام Leaderstats",
            category: "أنظمة اللاعبين",
            placement: "ServerScriptService",
            description: "ينشئ نظام Power و Wins و Rebirths لكل لاعب.",
            code: `-- GAMEDEV AI
-- Leaderstats System

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)

    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local power = Instance.new("IntValue")
    power.Name = "Power"
    power.Value = 0
    power.Parent = leaderstats

    local wins = Instance.new("IntValue")
    wins.Name = "Wins"
    wins.Value = 0
    wins.Parent = leaderstats

    local rebirths = Instance.new("IntValue")
    rebirths.Name = "Rebirths"
    rebirths.Value = 0
    rebirths.Parent = leaderstats

end)`
        },

        coin: {
            name: "نظام جمع العملات",
            category: "أنظمة الاقتصاد",
            placement: "داخل Part العملة",
            description: "يعطي اللاعب 10 Coins عند لمس العملة ويحذفها.",
            code: `-- GAMEDEV AI
-- Coin Pickup System
-- ضع هذا السكربت داخل Part العملة

local coin = script.Parent
local reward = 10
local collected = false

coin.Touched:Connect(function(hit)

    if collected then return end

    local character = hit.Parent
    local player = game.Players:GetPlayerFromCharacter(character)

    if not player then return end

    local leaderstats = player:FindFirstChild("leaderstats")
    if not leaderstats then return end

    local coins = leaderstats:FindFirstChild("Coins")
    if not coins then return end

    collected = true
    coins.Value += reward

    coin:Destroy()

end)`
        },

        door: {
            name: "باب تفاعلي",
            category: "أنظمة الأبواب",
            placement: "داخل Part الباب",
            description: "باب يفتح ويغلق عند التفاعل مع ProximityPrompt.",
            code: `-- GAMEDEV AI
-- Interactive Door System
-- ضع السكربت داخل Part الباب

local TweenService = game:GetService("TweenService")

local door = script.Parent

local prompt = door:FindFirstChildOfClass("ProximityPrompt")

if not prompt then
    prompt = Instance.new("ProximityPrompt")
    prompt.ActionText = "فتح"
    prompt.ObjectText = "الباب"
    prompt.HoldDuration = 0.3
    prompt.Parent = door
end

local closedPosition = door.CFrame
local openPosition = closedPosition * CFrame.new(0, 8, 0)

local isOpen = false
local busy = false

local tweenInfo = TweenInfo.new(
    1,
    Enum.EasingStyle.Quad,
    Enum.EasingDirection.Out
)

prompt.Triggered:Connect(function(player)

    if busy then return end

    busy = true
    isOpen = not isOpen

    local target = isOpen and openPosition or closedPosition

    prompt.ActionText = isOpen and "إغلاق" or "فتح"

    local tween = TweenService:Create(
        door,
        tweenInfo,
        {CFrame = target}
    )

    tween:Play()
    tween.Completed:Wait()

    busy = false

end)`
        },

        speed: {
            name: "منصة السرعة",
            category: "أنظمة الحركة",
            placement: "داخل Part المنصة",
            description: "تعطي اللاعب سرعة إضافية لمدة 5 ثوانٍ.",
            code: `-- GAMEDEV AI
-- Speed Pad System

local pad = script.Parent

local BOOST_SPEED = 50
local BOOST_TIME = 5

local activePlayers = {}

pad.Touched:Connect(function(hit)

    local character = hit.Parent
    local humanoid = character:FindFirstChildOfClass("Humanoid")

    if not humanoid then return end

    local player = game.Players:GetPlayerFromCharacter(character)

    if not player then return end
    if activePlayers[player] then return end

    activePlayers[player] = true

    local oldSpeed = humanoid.WalkSpeed
    humanoid.WalkSpeed = BOOST_SPEED

    task.delay(BOOST_TIME, function()

        if humanoid and humanoid.Parent then
            humanoid.WalkSpeed = oldSpeed
        end

        activePlayers[player] = nil

    end)

end)`
        },

        killbrick: {
            name: "بلوك الموت",
            category: "أنظمة الماب",
            placement: "داخل Part الخطر",
            description: "يقتل اللاعب عند لمس الجزء.",
            code: `-- GAMEDEV AI
-- Kill Brick System

local part = script.Parent

local debounce = {}

part.Touched:Connect(function(hit)

    local character = hit.Parent
    local humanoid = character:FindFirstChildOfClass("Humanoid")

    if not humanoid then return end
    if debounce[character] then return end

    debounce[character] = true

    humanoid.Health = 0

    task.delay(1, function()
        debounce[character] = nil
    end)

end)`
        },

        respawn: {
            name: "نقطة إعادة الظهور",
            category: "أنظمة الماب",
            placement: "داخل Part نقطة الحفظ",
            description: "يحفظ نقطة اللاعب عند لمسها ويعيده إليها بعد الموت.",
            code: `-- GAMEDEV AI
-- Checkpoint System

local checkpoint = script.Parent
local Players = game:GetService("Players")

local savedPositions = {}

checkpoint.Touched:Connect(function(hit)

    local character = hit.Parent
    local player = Players:GetPlayerFromCharacter(character)

    if not player then return end

    savedPositions[player] = checkpoint.CFrame + Vector3.new(0, 4, 0)

end)

Players.PlayerAdded:Connect(function(player)

    player.CharacterAdded:Connect(function(character)

        local saved = savedPositions[player]

        if saved then
            local root = character:WaitForChild("HumanoidRootPart")
            root.CFrame = saved
        end

    end)

end)

Players.PlayerRemoving:Connect(function(player)
    savedPositions[player] = nil
end)`
        },

        remote: {
            name: "RemoteEvent",
            category: "أنظمة الشبكة",
            placement: "ServerScriptService",
            description: "ينشئ RemoteEvent ويستقبل طلبات اللاعبين من السيرفر.",
            code: `-- GAMEDEV AI
-- RemoteEvent Server

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local remote = ReplicatedStorage:FindFirstChild("GameEvent")

if not remote then
    remote = Instance.new("RemoteEvent")
    remote.Name = "GameEvent"
    remote.Parent = ReplicatedStorage
end

remote.OnServerEvent:Connect(function(player, action)

    if typeof(action) ~= "string" then
        return
    end

    print(player.Name .. " sent: " .. action)

end)

-- LocalScript example:
-- game.ReplicatedStorage.GameEvent:FireServer("Hello")`
        },

        rebirth: {
            name: "نظام Rebirth",
            category: "أنظمة اللاعبين",
            placement: "ServerScriptService",
            description: "يسمح للاعب بإعادة الولادة مقابل 1000 Power.",
            code: `-- GAMEDEV AI
-- Rebirth System

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local event = ReplicatedStorage:FindFirstChild("RebirthEvent")

if not event then
    event = Instance.new("RemoteEvent")
    event.Name = "RebirthEvent"
    event.Parent = ReplicatedStorage
end

local REQUIRED_POWER = 1000

event.OnServerEvent:Connect(function(player)

    local stats = player:FindFirstChild("leaderstats")
    if not stats then return end

    local power = stats:FindFirstChild("Power")
    local rebirths = stats:FindFirstChild("Rebirths")

    if not power or not rebirths then return end

    if power.Value < REQUIRED_POWER then
        return
    end

    power.Value = 0
    rebirths.Value += 1

    print(player.Name .. " completed a Rebirth!")

end)`
        },

        teleport: {
            name: "نظام الانتقال",
            category: "أنظمة الماب",
            placement: "داخل Part الانتقال",
            description: "ينقل اللاعب إلى مكان آخر عند لمس المنصة.",
            code: `-- GAMEDEV AI
-- Teleport Pad

local pad = script.Parent

local destination = workspace:WaitForChild("TeleportDestination")

local debounce = {}

pad.Touched:Connect(function(hit)

    local character = hit.Parent
    local humanoid = character:FindFirstChildOfClass("Humanoid")
    local root = character:FindFirstChild("HumanoidRootPart")

    if not humanoid or not root then return end

    local player = game.Players:GetPlayerFromCharacter(character)

    if not player or debounce[player] then return end

    debounce[player] = true

    root.CFrame = destination.CFrame + Vector3.new(0, 4, 0)

    task.wait(1)

    debounce[player] = nil

end)

-- أنشئ Part في Workspace باسم TeleportDestination`
        },

        timer: {
            name: "عداد تنازلي",
            category: "أنظمة الوقت",
            placement: "ServerScriptService",
            description: "عداد تنازلي من 60 ثانية في نافذة الإخراج.",
            code: `-- GAMEDEV AI
-- Countdown System

local ROUND_TIME = 60

while true do

    for remaining = ROUND_TIME, 0, -1 do

        print("Time Remaining: " .. remaining)

        task.wait(1)

    end

    print("ROUND FINISHED!")

    task.wait(5)

end`
        }
    };

    // واجهة المولد
    const panel = document.createElement("section");
    panel.id = "smartGenerator";
    panel.className = "smart-generator";

    panel.innerHTML = `
        <div class="sg-heading">
            <div>
                <span class="sg-badge">GAMEDEV AI • V5</span>
                <h2>⚡ مولّد السكربتات الذكي</h2>
                <p>اختر نظامك، ولّد الكود، واحفظه في مكتبتك.</p>
            </div>
            <div class="sg-icon">⌘</div>
        </div>

        <div class="sg-generator-grid">

            <div class="sg-form">

                <label for="sgSearch">ابحث عن نظام</label>
                <input id="sgSearch" type="text"
                    placeholder="مثلاً: باب، سرعة، عملات...">

                <label for="sgCategory">القسم</label>
                <select id="sgCategory">
                    <option value="all">كل الأقسام</option>
                </select>

                <label for="sgTemplate">اختر السكربت</label>
                <select id="sgTemplate"></select>

                <div class="sg-info-box">
                    <span>📍 مكان وضع السكربت</span>
                    <strong id="sgPlacement">اختر سكربتاً</strong>
                    <p id="sgDescription">ستظهر تفاصيل السكربت هنا.</p>
                </div>

                <button type="button" id="sgGenerate" class="sg-main-button">
                    ⚡ توليد السكربت
                </button>

            </div>

            <div class="sg-library">

                <div class="sg-library-heading">
                    <div>
                        <h3>📚 مكتبتي الخاصة</h3>
                        <p>السكربتات التي حفظتها</p>
                    </div>
                    <span id="sgLibraryCount">0</span>
                </div>

                <div id="sgLibraryList" class="sg-library-list"></div>

            </div>

        </div>

        <div class="sg-footer">
            <span>🛡️ سكربتات قابلة للتعديل</span>
            <span>💾 الحفظ على جهازك</span>
            <span>🎮 Roblox Luau</span>
        </div>
    `;

    const editorWrapper =
        document.querySelector(".gai-editor-wrap");

    if (editorWrapper) {
        editorWrapper.parentNode.insertBefore(
            panel,
            editorWrapper
        );
    } else {
        editor.parentNode.insertBefore(panel, editor);
    }

    const categorySelect = panel.querySelector("#sgCategory");
    const templateSelect = panel.querySelector("#sgTemplate");
    const searchInput = panel.querySelector("#sgSearch");
    const placement = panel.querySelector("#sgPlacement");
    const description = panel.querySelector("#sgDescription");
    const libraryList = panel.querySelector("#sgLibraryList");
    const libraryCount = panel.querySelector("#sgLibraryCount");

    const categories = [...new Set(
        Object.values(templates).map(item => item.category)
    )];

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    function getFilteredTemplates() {
        const category = categorySelect.value;
        const search = searchInput.value.trim().toLowerCase();

        return Object.entries(templates).filter(([key, item]) => {

            const matchesCategory =
                category === "all" || item.category === category;

            const matchesSearch =
                !search ||
                item.name.toLowerCase().includes(search) ||
                item.description.toLowerCase().includes(search) ||
                item.category.toLowerCase().includes(search);

            return matchesCategory && matchesSearch;
        });
    }

    function updateTemplateOptions() {
        const filtered = getFilteredTemplates();

        templateSelect.innerHTML = "";

        filtered.forEach(([key, item]) => {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = item.name;
            templateSelect.appendChild(option);
        });

        updateTemplateInfo();
    }

    function updateTemplateInfo() {
        const item = templates[templateSelect.value];

        if (!item) {
            placement.textContent = "لا توجد نتائج";
            description.textContent = "جرّب البحث باسم آخر.";
            return;
        }

        placement.textContent = item.placement;
        description.textContent = item.description;
    }

    categorySelect.addEventListener("change", updateTemplateOptions);
    searchInput.addEventListener("input", updateTemplateOptions);
    templateSelect.addEventListener("change", updateTemplateInfo);

    function setEditorCode(code) {
        editor.value = code;
        editor.dispatchEvent(new Event("input", { bubbles: true }));

        editor.focus();
        editor.scrollTop = 0;
        editor.selectionStart = 0;
        editor.selectionEnd = 0;

        if (typeof window.showToast === "function") {
            window.showToast("تم تجهيز السكربت!");
        }
    }

    panel.querySelector("#sgGenerate").addEventListener("click", () => {
        const key = templateSelect.value;
        const item = templates[key];

        if (!item) {
            alert("اختر سكربتاً أولاً.");
            return;
        }

        setEditorCode(item.code);
    });

    function persistLibrary() {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(savedScripts)
        );

        renderLibrary();
    }

    function renderLibrary() {
        libraryCount.textContent = savedScripts.length;

        if (!savedScripts.length) {
            libraryList.innerHTML = `
                <div class="sg-empty">
                    <span>📂</span>
                    <strong>مكتبتك فارغة</strong>
                    <p>ولّد سكربتاً ثم احفظه ليظهر هنا.</p>
                </div>
            `;
            return;
        }

        libraryList.innerHTML = "";

        savedScripts.forEach(item => {
            const card = document.createElement("div");
            card.className = "sg-library-card";

            const title = document.createElement("strong");
            title.textContent = item.name;

            const date = document.createElement("small");
            date.textContent = item.date || "سكربت محفوظ";

            const actions = document.createElement("div");
            actions.className = "sg-card-actions";

            const openButton = document.createElement("button");
            openButton.textContent = "فتح";

            openButton.addEventListener("click", () => {
                setEditorCode(item.code);
            });

            const downloadButton = document.createElement("button");
            downloadButton.textContent = "تحميل";

            downloadButton.addEventListener("click", () => {
                downloadScript(item.name, item.code);
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "حذف";
            deleteButton.className = "sg-delete";

            deleteButton.addEventListener("click", () => {
                if (!confirm("هل تريد حذف هذا السكربت؟")) return;

                savedScripts = savedScripts.filter(
                    script => script.id !== item.id
                );

                persistLibrary();
            });

            actions.append(openButton, downloadButton, deleteButton);
            card.append(title, date, actions);
            libraryList.appendChild(card);
        });
    }

    function downloadScript(name, code) {
        const blob = new Blob(
            [code],
            { type: "text/plain;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = name.replace(/[\\/:*?"<>|]/g, "_") + ".lua";
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // زر الحفظ
    const saveButton = document.createElement("button");

    saveButton.type = "button";
    saveButton.className = "sg-save-current";
    saveButton.textContent = "💾 حفظ السكربت الحالي";

    editorWrapper?.parentNode.insertBefore(
        saveButton,
        editorWrapper.nextSibling
    );

    saveButton.addEventListener("click", () => {
        const code = editor.value.trim();

        if (!code) {
            alert("اكتب أو ولّد سكربتاً أولاً.");
            return;
        }

        const name = prompt("اكتب اسم السكربت:");

        if (!name || !name.trim()) return;

        savedScripts.unshift({
            id: Date.now().toString(),
            name: name.trim(),
            code,
            date: new Date().toLocaleDateString("ar-SA")
        });

        persistLibrary();

        alert("تم حفظ السكربت في مكتبتك بنجاح! 🎉");
    });

    updateTemplateOptions();
    renderLibrary();

    console.log("GAMEDEV AI SMART GENERATOR V5 READY");

})();/* ==========================================
   GAMEDEV AI - AI CODE COPY SYSTEM
========================================== */

(() => {
    "use strict";

    const messages = document.getElementById("chatMessages");

    if (!messages || messages.dataset.codeCopyReady) return;
    messages.dataset.codeCopyReady = "true";

    function escapeHTML(text) {
        return text.replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function extractCodeBlocks(element) {
        element.querySelectorAll("pre").forEach(pre => {
            if (pre.dataset.copyReady) return;

            const code = pre.querySelector("code") || pre;
            const rawCode = code.textContent;

            if (!rawCode.trim()) return;

            pre.dataset.copyReady = "true";

            const toolbar = document.createElement("div");
            toolbar.className = "ai-code-toolbar";

            const label = document.createElement("span");
            label.textContent = "⚡ ROBLOX LUAU";

            const copyButton = document.createElement("button");
            copyButton.textContent = "📋 نسخ السكربت";

            const editorButton = document.createElement("button");
            editorButton.textContent = "📝 فتح في المحرر";

            toolbar.append(label, copyButton, editorButton);
            pre.parentNode.insertBefore(toolbar, pre);

            copyButton.addEventListener("click", async () => {
                try {
                    await navigator.clipboard.writeText(rawCode);
                    copyButton.textContent = "✅ تم النسخ!";
                } catch {
                    const area = document.createElement("textarea");
                    area.value = rawCode;
                    document.body.appendChild(area);
                    area.select();
                    document.execCommand("copy");
                    area.remove();

                    copyButton.textContent = "✅ تم النسخ!";
                }

                setTimeout(() => {
                    copyButton.textContent = "📋 نسخ السكربت";
                }, 2000);
            });

            editorButton.addEventListener("click", () => {
                const editor = document.getElementById("scriptInput");

                if (!editor) {
                    alert("لم يتم العثور على محرر السكربتات.");
                    return;
                }

                editor.value = rawCode;
                editor.dispatchEvent(new Event("input", {
                    bubbles: true
                }));

                const scriptPage = document.querySelector(
                    '[data-page="scripts"]'
                );

                if (scriptPage) scriptPage.click();

                editor.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            });
        });
    }

    const observer = new MutationObserver(() => {
        extractCodeBlocks(messages);
    });

    observer.observe(messages, {
        childList: true,
        subtree: true
    });

    extractCodeBlocks(messages);

    console.log("AI CODE COPY SYSTEM READY");

})();
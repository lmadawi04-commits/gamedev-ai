```javascript
"use strict";

/* =========================================================
   GAMEDEV AI ULTRA X
   COMPLETE LOCAL DEVELOPMENT ENGINE
   VERSION 7.0
========================================================= */

(() => {

    /* =====================================================
       01 - CONFIGURATION
    ===================================================== */

    const CONFIG = {
        name: "GAMEDEV AI ULTRA X",
        version: "7.0",
        storage: {
            chat: "gamedev_ultra_chat_v7",
            projects: "gamedev_ultra_projects_v7",
            theme: "gamedev_ultra_theme_v7"
        },
        maxMessages: 100
    };

    const $ = selector => document.querySelector(selector);

    const chatMessages = $("#chatMessages");
    const chatInput = $("#chatInput");
    const chatForm = $("#chatForm");
    const codeEditor = $("#codeEditor");
    const projectsList = $("#projectsList");
    const toastElement = $("#toast");

    let toastTimer = null;


    /* =====================================================
       02 - UTILITIES
    ===================================================== */

    function normalize(text) {
        return String(text || "")
            .toLowerCase()
            .replace(/[أإآ]/g, "ا")
            .replace(/ة/g, "ه")
            .replace(/ى/g, "ي")
            .replace(/[ًٌٍَُِّْـ]/g, "")
            .replace(/[^\u0600-\u06FFa-z0-9\s_]/gi, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function includesAny(text, words) {
        return words.some(word => text.includes(normalize(word)));
    }

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function showToast(message) {
        if (!toastElement) return;

        toastElement.textContent = message;
        toastElement.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toastElement.classList.remove("show");
        }, 2600);
    }

    function saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error("Storage error:", error);
            showToast("تعذر حفظ البيانات في المتصفح");
            return false;
        }
    }

    function loadData(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.error("Storage loading error:", error);
            return fallback;
        }
    }


    /* =====================================================
       03 - KNOWLEDGE DATABASE
    ===================================================== */

    const KNOWLEDGE = {

        greetings: [
            "هلا والله! 🔥 وش بنطور اليوم؟",
            "أهلًا بالمطور! جاهز نشتغل على مشروعك؟ 🚀",
            "يا مرحبا! عطِني فكرتك ونبدأ بتحويلها إلى نظام.",
            "أهلًا بك في GAMEDEV AI ULTRA X! 🎮"
        ],

        ideas: [
            {
                name: "مدينة الوظائف والترقيات",
                description: "مدينة واقعية يبدأ فيها اللاعب من وظيفة بسيطة ويتطور حتى يصبح مديرًا أو صاحب شركة.",
                features: [
                    "وظائف متعددة",
                    "نظام رواتب",
                    "ترقيات وظيفية",
                    "نظام شركات",
                    "نظام عقارات",
                    "لوحة إحصائيات"
                ]
            },
            {
                name: "حراج المدينة",
                description: "سوق مفتوح يبيع فيه اللاعبون السيارات والممتلكات والأغراض.",
                features: [
                    "نظام مزادات",
                    "نظام بيع وشراء",
                    "متاجر اللاعبين",
                    "نظام عملات",
                    "سجل الصفقات",
                    "نظام تقييم"
                ]
            },
            {
                name: "جزيرة النجاة",
                description: "جزيرة تتغير فيها الظروف الجوية ويجب على اللاعبين جمع الموارد وبناء الملاجئ.",
                features: [
                    "نظام جوع وعطش",
                    "نظام موارد",
                    "نظام طقس",
                    "نظام صناعة",
                    "نظام بناء",
                    "نظام ليالي"
                ]
            },
            {
                name: "أكاديمية الشرطة",
                description: "لعبة محاكاة تدريب وترقيات ومهام داخل أكاديمية متكاملة.",
                features: [
                    "نظام رتب",
                    "نظام اختبارات",
                    "نظام تدريبات",
                    "نظام مهام",
                    "نظام مركبات",
                    "نظام صلاحيات"
                ]
            },
            {
                name: "مصنع الأحلام",
                description: "يبدأ اللاعب بمصنع صغير ثم يوسعه ويضيف خطوط إنتاج.",
                features: [
                    "نظام إنتاج",
                    "نظام عمال",
                    "نظام تطوير",
                    "نظام بيع",
                    "نظام أرباح",
                    "نظام توسعة"
                ]
            }
        ],

        topics: {

            datastore: `
DataStoreService في Roblox:

يستخدم لحفظ بيانات اللاعب بين جلسات اللعب.

أهم النقاط:
1. استخدمه داخل Script على السيرفر.
2. لا تحفظ البيانات من LocalScript.
3. استخدم pcall لمعالجة الأخطاء.
4. استخدم UpdateAsync عند الحاجة لتحديث البيانات بأمان.
5. لا تحفظ البيانات باستمرار دون حاجة.
6. اختبر الحفظ في بيئة Roblox منشورة ومهيأة للوصول إلى API Services.

توثيق Roblox:
https://create.roblox.com/docs/cloud-services/data-stores
`,

            remote: `
RemoteEvent في Roblox:

يتيح التواصل بين العميل والسيرفر.

الاستخدام:
- FireServer من LocalScript.
- OnServerEvent داخل Script.
- FireClient لإرسال رسالة للاعب.
- FireAllClients لإرسال رسالة لجميع اللاعبين.

مهم جدًا:
لا تثق بالقيم التي يرسلها اللاعب من جهازه.
تحقق من المبالغ والصلاحيات والطلبات داخل السيرفر.

توثيق Roblox:
https://create.roblox.com/docs/scripting/events/remote
`,

            leaderstats: `
leaderstats:

مجلد خاص بإحصائيات اللاعب التي تظهر في قائمة اللاعبين.

يمكن استخدامه لعرض:
- Coins
- Wins
- Level
- Rebirths

يتم إنشاؤه عادةً داخل Script في ServerScriptService.
`,

            local: `
LocalScript:

يعمل على جهاز اللاعب.

الاستخدامات:
- واجهات المستخدم.
- الكاميرا.
- التحكم المحلي.
- استقبال الأحداث المرسلة للاعب.

لا تستخدمه لحفظ البيانات أو إعطاء اللاعب مكافآت موثوقة.
`,

            server: `
Script:

يعمل على السيرفر.

الاستخدامات:
- إدارة اللاعبين.
- إعطاء المكافآت.
- التحقق من الصلاحيات.
- حفظ البيانات.
- إدارة الأنظمة المشتركة.
`,

            module: `
ModuleScript:

يساعد على تقسيم الكود وإعادة استخدام الوظائف.

مثال:

local Module = {}

function Module.Greet(name)
    return "Hello " .. name
end

return Module

يمكن استدعاؤه باستخدام require().
`,

            tween: `
TweenService:

يستخدم لإنشاء حركات سلسة للأجزاء والواجهات.

مثال:

local TweenService = game:GetService("TweenService")

local part = workspace.Part

local tweenInfo = TweenInfo.new(
    2,
    Enum.EasingStyle.Quad,
    Enum.EasingDirection.Out
)

local tween = TweenService:Create(
    part,
    tweenInfo,
    {Transparency = 1}
)

tween:Play()
`,

            humanoid: `
Humanoid:

مكوّن أساسي في شخصية اللاعب.

من خصائصه:
- WalkSpeed
- JumpPower
- Health
- MaxHealth

يمكن الوصول إليه من شخصية اللاعب عن طريق FindFirstChildOfClass("Humanoid").
`
        }

    };


    /* =====================================================
       04 - INTENT DETECTION
    ===================================================== */

    function detectIntent(message) {

        const text = normalize(message);

        if (includesAny(text, [
            "السلام عليكم",
            "هلا",
            "مرحبا",
            "اهلا",
            "hello",
            "hi"
        ])) return "greeting";

        if (includesAny(text, [
            "اشرح",
            "علمني",
            "وش معنى",
            "ما معنى",
            "كيف يعمل",
            "فهمني",
            "شرح"
        ])) return "explain";

        if (includesAny(text, [
            "خطا",
            "ايرور",
            "error",
            "bug",
            "ما يشتغل",
            "ما يعمل",
            "خربان",
            "يطلع لي"
        ])) return "debug";

        if (includesAny(text, [
            "فكره",
            "افكار",
            "اقترح",
            "ماب",
            "لعبه",
            "map idea"
        ])) return "idea";

        if (includesAny(text, [
            "واجهه",
            "gui",
            "زر",
            "قائمه",
            "menu",
            "hud"
        ])) return "gui";

        if (includesAny(text, [
            "حسن",
            "طور",
            "تحسين",
            "optimize"
        ])) return "optimize";

        if (includesAny(text, [
            "سكربت",
            "كود",
            "برمج",
            "script",
            "code",
            "lua",
            "luau",
            "انشئ",
            "سوي لي"
        ])) return "script";

        return "general";
    }


    /* =====================================================
       05 - ROBLOX SCRIPT GENERATORS
    ===================================================== */

    const SCRIPT_TEMPLATES = {

        coins: {
            title: "نظام العملات",
            location: "ServerScriptService > Script",
            code: `-- GAMEDEV AI | Coins System
-- Location: ServerScriptService

local Players = game:GetService("Players")

local STARTING_COINS = 100

Players.PlayerAdded:Connect(function(player)

    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = STARTING_COINS
    coins.Parent = leaderstats

end)

-- Example server reward function
local function GiveCoins(player, amount)

    if typeof(amount) ~= "number" then
        return false
    end

    if amount <= 0 or amount > 100000 then
        return false
    end

    local leaderstats = player:FindFirstChild("leaderstats")
    if not leaderstats then
        return false
    end

    local coins = leaderstats:FindFirstChild("Coins")
    if not coins then
        return false
    end

    coins.Value += math.floor(amount)

    return true
end

-- Example:
-- GiveCoins(player, 50)
`
        },

        speed: {
            title: "لوحة زيادة السرعة",
            location: "Workspace > SpeedPad > Script",
            code: `-- GAMEDEV AI | Speed Pad
-- Put this Script inside the Part

local pad = script.Parent

local BOOST = 10
local DEFAULT_SPEED = 16
local COOLDOWN = 2

local debounce = {}

pad.Touched:Connect(function(hit)

    local character = hit:FindFirstAncestorOfClass("Model")
    if not character then return end

    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if not humanoid then return end

    local player = game.Players:GetPlayerFromCharacter(character)
    if not player then return end

    if debounce[player] then return end

    debounce[player] = true

    humanoid.WalkSpeed = math.min(
        humanoid.WalkSpeed + BOOST,
        100
    )

    task.delay(COOLDOWN, function()
        debounce[player] = nil
    end)

end)
`
        },

        killbrick: {
            title: "بلوك القتل",
            location: "Workspace > KillBrick > Script",
            code: `-- GAMEDEV AI | Kill Brick
-- Put this Script inside the Part

local part = script.Parent

local debounce = {}

part.Touched:Connect(function(hit)

    local character = hit:FindFirstAncestorOfClass("Model")
    if not character then return end

    local humanoid = character:FindFirstChildOfClass("Humanoid")
    if not humanoid then return end

    if debounce[humanoid] then return end

    debounce[humanoid] = true

    humanoid.Health = 0

    task.delay(1, function()
        debounce[humanoid] = nil
    end)

end)
`
        },

        checkpoint: {
            title: "نظام نقاط الحفظ",
            location: "Workspace > Checkpoint Part > Script",
            code: `-- GAMEDEV AI | Checkpoint System
-- Put this Script inside every checkpoint Part

local checkpoint = script.Parent

checkpoint.Touched:Connect(function(hit)

    local character = hit:FindFirstAncestorOfClass("Model")
    if not character then return end

    local player = game.Players:GetPlayerFromCharacter(character)
    if not player then return end

    local current = player:GetAttribute("Checkpoint")

    if current == checkpoint.Name then
        return
    end

    player:SetAttribute("Checkpoint", checkpoint.Name)

    print(player.Name .. " reached " .. checkpoint.Name)

end)
`
        },

        rebirth: {
            title: "نظام إعادة الميلاد",
            location: "ServerScriptService > Script",
            code: `-- GAMEDEV AI | Rebirth System
-- ServerScriptService

local Players = game:GetService("Players")

local BASE_REQUIREMENT = 1000

local function getRequirement(rebirths)
    return BASE_REQUIREMENT * (rebirths + 1)
end

Players.PlayerAdded:Connect(function(player)

    local stats = Instance.new("Folder")
    stats.Name = "leaderstats"
    stats.Parent = player

    local power = Instance.new("IntValue")
    power.Name = "Power"
    power.Value = 0
    power.Parent = stats

    local rebirths = Instance.new("IntValue")
    rebirths.Name = "Rebirths"
    rebirths.Value = 0
    rebirths.Parent = stats

end)

local function Rebirth(player)

    local stats = player:FindFirstChild("leaderstats")
    if not stats then return false end

    local power = stats:FindFirstChild("Power")
    local rebirths = stats:FindFirstChild("Rebirths")

    if not power or not rebirths then
        return false
    end

    local requirement = getRequirement(rebirths.Value)

    if power.Value < requirement then
        return false
    end

    power.Value = 0
    rebirths.Value += 1

    return true
end

-- Connect Rebirth to a server-validated RemoteEvent
-- Never allow the client to decide the reward.
`
        },

        door: {
            title: "باب يحتاج عملات",
            location: "Workspace > Door > Script",
            code: `-- GAMEDEV AI | Coins Door

local door = script.Parent

local REQUIRED_COINS = 100
local opened = false

door.Touched:Connect(function(hit)

    if opened then return end

    local character = hit:FindFirstAncestorOfClass("Model")
    if not character then return end

    local player = game.Players:GetPlayerFromCharacter(character)
    if not player then return end

    local stats = player:FindFirstChild("leaderstats")
    if not stats then return end

    local coins = stats:FindFirstChild("Coins")
    if not coins then return end

    if coins.Value < REQUIRED_COINS then
        return
    end

    coins.Value -= REQUIRED_COINS
    opened = true

    door.CanCollide = false
    door.Transparency = 0.6

    task.wait(3)

    door.CanCollide = true
    door.Transparency = 0
    opened = false

end)
`
        }

    };


    /* =====================================================
       06 - SCRIPT REQUEST ANALYSIS
    ===================================================== */

    function generateScriptAnswer(message) {

        const text = normalize(message);

        let selected = null;

        if (includesAny(text, [
            "عملات",
            "فلوس",
            "كوين",
            "coins",
            "money",
            "leaderstats"
        ])) {
            selected = SCRIPT_TEMPLATES.coins;
        }

        else if (includesAny(text, [
            "سرعه",
            "speed",
            "زيادة السرعه",
            "بوست"
        ])) {
            selected = SCRIPT_TEMPLATES.speed;
        }

        else if (includesAny(text, [
            "قتل",
            "kill brick",
            "killbrick",
            "يموت"
        ])) {
            selected = SCRIPT_TEMPLATES.killbrick;
        }

        else if (includesAny(text, [
            "checkpoint",
            "نقطه حفظ",
            "نقاط الحفظ",
            "حفظ التقدم"
        ])) {
            selected = SCRIPT_TEMPLATES.checkpoint;
        }

        else if (includesAny(text, [
            "rebirth",
            "ريبرث",
            "اعادة الميلاد"
        ])) {
            selected = SCRIPT_TEMPLATES.rebirth;
        }

        else if (includesAny(text, [
            "باب",
            "door",
            "يفتح الباب"
        ])) {
            selected = SCRIPT_TEMPLATES.door;
        }

        if (!selected) {
            return `
أقدر أساعدك في إنشاء هذا النظام! 🔥

لكن أحتاج تحديد نوعه بشكل أدق.

أمثلة على الأنظمة المدعومة في المحرك حاليًا:

1. نظام العملات.
2. نظام السرعة.
3. بلوك القتل.
4. نظام نقاط الحفظ.
5. نظام Rebirth.
6. باب يحتاج عملات.

اكتب اسم النظام المطلوب وسأجهز لك قالبًا برمجيًا مع مكان تركيبه.

ملاحظة: هذه قوالب أولية وليست نظامًا متكاملًا بكل الوظائف الإضافية.
`;
        }

        return `
🚀 GAMEDEV AI ULTRA X
━━━━━━━━━━━━━━━━━━━━

💻 النظام: ${selected.title}

📁 مكان التركيب:
${selected.location}

━━━━━━━━━━━━━━━━━━━━

📜 الكود:

\`\`\`lua
${selected.code}
\`\`\`

━━━━━━━━━━━━━━━━━━━━

⚠️ تعليمات:
1. أنشئ العناصر المطلوبة في Explorer.
2. ضع السكربت في المكان المحدد.
3. راجع أسماء العناصر.
4. اختبر النظام في Roblox Studio.

تم إنشاء قالب برمجي محلي.
`;
    }


    /* =====================================================
       07 - IDEA GENERATOR
    ===================================================== */

    function generateIdea() {

        const idea = randomItem(KNOWLEDGE.ideas);

        return `
💡 فكرة لعبتك الجديدة
━━━━━━━━━━━━━━━━━━━━

🎮 ${idea.name}

📝 الوصف:
${idea.description}

⚙️ الأنظمة المقترحة:

${idea.features.map((item, index) =>
    `${index + 1}. ${item}`
).join("\n")}

━━━━━━━━━━━━━━━━━━━━

🚀 اقتراح GAMEDEV AI:

ابدأ بنظام أساسي واحد، ثم أضف الأنظمة تدريجيًا واختبر كل نظام قبل الانتقال للذي بعده.
`;
    }


    /* =====================================================
       08 - GUI PLANNER
    ===================================================== */

    function generateGUI(message) {

        const text = normalize(message);

        let name = "واجهة لعبتك";
        let hierarchy = [];

        if (includesAny(text, ["متجر", "shop", "شراء"])) {

            name = "واجهة المتجر";

            hierarchy = [
                "ScreenGui",
                "└── ShopFrame",
                "    ├── Header",
                "    │   ├── Title",
                "    │   └── CloseButton",
                "    ├── CoinsLabel",
                "    ├── ItemsContainer",
                "    │   ├── ItemCard",
                "    │   └── BuyButton",
                "    └── UIListLayout"
            ];

        } else if (includesAny(text, ["وظائف", "job"])) {

            name = "واجهة الوظائف";

            hierarchy = [
                "ScreenGui",
                "└── JobsFrame",
                "    ├── Header",
                "    ├── CloseButton",
                "    ├── JobsContainer",
                "    │   ├── JobCard",
                "    │   ├── JobName",
                "    │   └── ApplyButton",
                "    └── UIGridLayout"
            ];

        } else {

            hierarchy = [
                "ScreenGui",
                "└── MainFrame",
                "    ├── Header",
                "    │   ├── Title",
                "    │   └── CloseButton",
                "    ├── ContentFrame",
                "    ├── MainButton",
                "    ├── StatusLabel",
                "    └── UIListLayout"
            ];
        }

        return `
🎨 مخطط ${name}

📁 Explorer Hierarchy:

${hierarchy.join("\n")}

━━━━━━━━━━━━━━━━━━━━

اقتراحات التصميم:

1. استخدم UIStroke لإضافة حدود.
2. استخدم UICorner لتدوير الزوايا.
3. استخدم UIGradient للتدرجات.
4. استخدم UIListLayout لترتيب العناصر.
5. استخدم AutomaticSize عند الحاجة.

📱 اجعل الواجهة تدعم الجوال والكمبيوتر.
`;
    }


    /* =====================================================
       09 - ERROR ANALYZER
    ===================================================== */

    function analyzeError(message) {

        const text = normalize(message);

        const problems = [

            {
                keywords: ["attempt to index nil", "nil value"],
                title: "محاولة استخدام قيمة nil",
                explanation: `
هذا الخطأ يعني أنك تحاول الوصول إلى خاصية داخل قيمة غير موجودة.

أسباب محتملة:
- اسم العنصر غير صحيح.
- العنصر لم يتم إنشاؤه بعد.
- الكائن غير موجود في المكان المتوقع.

الحل:
استخدم FindFirstChild أو WaitForChild حسب الحاجة، وتحقق من وجود الكائن قبل استخدامه.
`
            },

            {
                keywords: ["infinite yield", "possible infinite yield"],
                title: "انتظار عنصر لم يظهر",
                explanation: `
غالبًا السكربت ينتظر عنصرًا لم يتم إنشاؤه أو اسمه غير صحيح.

راجع:
- اسم العنصر.
- مكانه في Explorer.
- هل يتم إنشاؤه قبل طلبه؟
- هل يستخدم WaitForChild على العنصر الصحيح؟
`
            },

            {
                keywords: ["syntax error", "expected", "unexpected symbol"],
                title: "خطأ في صياغة الكود",
                explanation: `
يوجد احتمال أن الكود يحتوي على:
- قوس ناقص.
- علامة اقتباس غير مكتملة.
- كلمة محجوزة في مكان غير صحيح.
- نهاية تعبير غير مكتملة.

راجع السطر المشار إليه في رسالة الخطأ.
`
            },

            {
                keywords: ["attempt to call", "not a function"],
                title: "محاولة تشغيل شيء ليس دالة",
                explanation: `
تأكد من اسم الدالة وطريقة استدعائها.

قد تكون:
- نسيت تعريف الدالة.
- استخدمت متغيرًا مكان الدالة.
- كتبت اسم الدالة بشكل مختلف.
`
            },

            {
                keywords: ["datastore", "403", "api services"],
                title: "مشكلة في DataStore",
                explanation: `
تحقق من:
- تفعيل إعدادات API Services عند الاختبار في Studio.
- تشغيل اللعبة في بيئة منشورة.
- استخدام DataStore داخل Script على السيرفر.
- معالجة الأخطاء باستخدام pcall.
`
            },

            {
                keywords: ["remoteevent", "fireserver", "onserverevent"],
                title: "مشكلة في RemoteEvent",
                explanation: `
تأكد من:
- وجود RemoteEvent في المكان المتوقع.
- تطابق الاسم بين السيرفر والعميل.
- استخدام FireServer من LocalScript.
- استقبال الطلب عبر OnServerEvent داخل Script.
- التحقق من البيانات داخل السيرفر.
`
            }

        ];

        const found = problems.find(problem =>
            problem.keywords.some(keyword => text.includes(keyword))
        );

        if (found) {
            return `
🔧 تحليل الخطأ

المشكلة المحتملة:
${found.title}

${found.explanation}

━━━━━━━━━━━━━━━━━━━━

أرسل رسالة الخطأ كاملة والكود المحيط بها للحصول على تحليل أدق.
`;
        }

        return `
🔍 لم أتمكن من تحديد الخطأ بدقة.

أحتاج منك:
1. رسالة الخطأ كاملة من Output.
2. الكود الذي سبب المشكلة.
3. نوع السكربت.
4. مكان السكربت داخل Explorer.

سأساعدك في تحديد السبب المحتمل.

ملاحظة: التحليل المحلي يعطي إرشادات أولية ولا يشغّل الكود أو يضمن اكتشاف جميع الأخطاء.
`;
    }


    /* =====================================================
       10 - EXPLANATION ENGINE
    ===================================================== */

    function explainTopic(message) {

        const text = normalize(message);

        if (includesAny(text, ["datastore", "حفظ البيانات"])) {
            return KNOWLEDGE.topics.datastore;
        }

        if (includesAny(text, ["remoteevent", "remote event", "ريموت"])) {
            return KNOWLEDGE.topics.remote;
        }

        if (includesAny(text, ["leaderstats", "احصائيات"])) {
            return KNOWLEDGE.topics.leaderstats;
        }

        if (includesAny(text, ["localscript", "لوكال"])) {
            return KNOWLEDGE.topics.local;
        }

        if (includesAny(text, ["serverscript", "script", "سيرفر"])) {
            return KNOWLEDGE.topics.server;
        }

        if (includesAny(text, ["modulescript", "module", "موديول"])) {
            return KNOWLEDGE.topics.module;
        }

        if (includesAny(text, ["tween", "حركه سلسه"])) {
            return KNOWLEDGE.topics.tween;
        }

        if (includesAny(text, ["humanoid", "سرعه اللاعب"])) {
            return KNOWLEDGE.topics.humanoid;
        }

        return `
📚 أقدر أشرح لك أساسيات Roblox وLuau.

اختر موضوعًا مثل:

1. DataStore.
2. RemoteEvent.
3. Leaderstats.
4. LocalScript.
5. ServerScript.
6. ModuleScript.
7. TweenService.
8. Humanoid.

اكتب اسم الموضوع وسأشرح لك المعلومات المتوفرة في قاعدة المعرفة.
`;
    }


    /* =====================================================
       11 - GENERAL RESPONSE ENGINE
    ===================================================== */

    function generateResponse(message) {

        const text = String(message || "").trim();
        const normalized = normalize(text);

        if (!text) {
            return "اكتب طلبك أولًا يا مطور! 🚀";
        }

        const intent = detectIntent(text);

        switch (intent) {

            case "greeting":
                return randomItem(KNOWLEDGE.greetings);

            case "idea":
                return generateIdea();

            case "script":
                return generateScriptAnswer(text);

            case "gui":
                return generateGUI(text);

            case "debug":
                return analyzeError(text);

            case "explain":
                return explainTopic(text);

            case "optimize":
                return `
⚡ تحسين أداء السكربتات

أهم النصائح:

1. تجنب الحلقات التي تعمل دون انتظار.
2. لا تكرر عمليات البحث عن العناصر دون حاجة.
3. استخدم الأحداث بدل الفحص المستمر.
4. افصل منطق السيرفر عن العميل.
5. استخدم ModuleScripts لتنظيم المشاريع.
6. عالج الأخطاء المتوقعة.
7. راقب الأداء أثناء الاختبار.

أرسل السكربت الذي تريد تحسينه للحصول على مراجعة أولية.
`;

            default:

                if (includesAny(normalized, [
                    "roblox",
                    "روبلوكس",
                    "luau",
                    "برمجه"
                ])) {
                    return `
🎮 أهلًا بك في GAMEDEV AI ULTRA X!

أستطيع مساعدتك في:

💻 كتابة سكربتات Roblox.
💡 ابتكار أفكار مابات.
🎨 تخطيط واجهات GUI.
🔧 تحليل أخطاء البرمجة.
📚 شرح Luau.
⚙️ تصميم أنظمة الألعاب.

اكتب طلبك بالتفصيل، وسنبدأ بتحليله.
`;
                }

                return `
وصلني طلبك! 🚀

لكن أحتاج تفاصيل أكثر حتى أساعدك بدقة.

وضح لي:
- ماذا تريد أن تنشئ؟
- هل تعمل على Roblox Studio؟
- هل تريد سكربتًا أم فكرة أم شرحًا؟
- هل لديك كود حالي تريد تطويره؟

أنا جاهز لمساعدتك في تطوير مشروعك.
`;
        }
    }


    /* =====================================================
       12 - CHAT STORAGE
    ===================================================== */

    let chatHistory = loadData(
        CONFIG.storage.chat,
        []
    );

    if (!Array.isArray(chatHistory)) {
        chatHistory = [];
    }

    function saveChat() {
        chatHistory = chatHistory.slice(-CONFIG.maxMessages);
        saveData(CONFIG.storage.chat, chatHistory);
    }


    /* =====================================================
       13 - CHAT INTERFACE
    ===================================================== */

    function renderMessage(role, text, save = true) {

        if (!chatMessages) return;

        const isUser = role === "user";

        const message = document.createElement("div");

        message.className = isUser
            ? "message user-message"
            : "message bot-message";

        const avatar = document.createElement("div");
        avatar.className = "message-avatar";
        avatar.textContent = isUser ? "U" : "G";

        const content = document.createElement("div");
        content.className = "message-content";

        const heading = document.createElement("strong");
        heading.textContent = isUser ? "أنت" : "GAMEDEV AI";

        const paragraph = document.createElement("p");

        // النص يعرض كنص عادي لحماية الصفحة من HTML غير الموثوق.
        paragraph.textContent = text;

        content.appendChild(heading);
        content.appendChild(paragraph);

        message.appendChild(avatar);
        message.appendChild(content);

        chatMessages.appendChild(message);

        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (save) {
            chatHistory.push({
                role,
                text,
                time: Date.now()
            });

            saveChat();
        }
    }

    function restoreChat() {

        if (!chatMessages) return;

        chatMessages.innerHTML = "";

        if (chatHistory.length === 0) {
            renderMessage(
                "bot",
                "أهلًا بك في GAMEDEV AI ULTRA X! 🚀 اكتب طلبك ونبدأ التطوير.",
                false
            );

            return;
        }

        chatHistory.forEach(item => {
            renderMessage(item.role, item.text, false);
        });
    }

    function sendMessage(message) {

        const text = String(message || "").trim();

        if (!text) return;

        renderMessage("user", text);

        if (chatInput) {
            chatInput.value = "";
            chatInput.style.height = "auto";
        }

        const response = generateResponse(text);

        setTimeout(() => {
            renderMessage("bot", response);
        }, 350);
    }

    if (chatForm) {

        chatForm.addEventListener("submit", event => {

            event.preventDefault();

            sendMessage(chatInput ? chatInput.value : "");

        });

    }

    if (chatInput) {

        chatInput.addEventListener("keydown", event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey &&
                window.innerWidth > 600
            ) {
                event.preventDefault();

                if (chatForm) {
                    chatForm.requestSubmit();
                }
            }

        });

        chatInput.addEventListener("input", () => {

            chatInput.style.height = "auto";

            chatInput.style.height =
                Math.min(chatInput.scrollHeight, 130) + "px";

        });

    }

    const clearChatButton = $("#clearChat");

    if (clearChatButton) {

        clearChatButton.addEventListener("click", () => {

            const confirmed = window.confirm(
                "هل تريد مسح المحادثة بالكامل؟"
            );

            if (!confirmed) return;

            chatHistory = [];

            saveChat();

            restoreChat();

            showToast("تم مسح المحادثة");

        });

    }


    /* =====================================================
       14 - QUICK PROMPTS
    ===================================================== */

    window.usePrompt = function(text) {

        if (!chatInput) return;

        chatInput.value = text;

        chatInput.focus();

        if (chatForm) {
            chatForm.requestSubmit();
        }

    };


    /* =====================================================
       15 - CODE EDITOR
    ===================================================== */

    window.copyCode = async function() {

        if (!codeEditor) {
            showToast("محرر الأكواد غير موجود");
            return;
        }

        const code = codeEditor.value;

        if (!code.trim()) {
            showToast("المحرر فارغ");
            return;
        }

        try {

            await navigator.clipboard.writeText(code);

            showToast("تم نسخ الكود بنجاح 📋");

        } catch (error) {

            codeEditor.select();

            try {
                document.execCommand("copy");
                showToast("تم نسخ الكود");
            } catch {
                showToast("تعذر النسخ، انسخ الكود يدويًا");
            }

        }

    };

    window.downloadCode = function() {

        if (!codeEditor || !codeEditor.value.trim()) {
            showToast("لا يوجد كود لتحميله");
            return;
        }

        const blob = new Blob(
            [codeEditor.value],
            { type: "text/plain;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "gamedev-script.lua";

        document.body.appendChild(link);

        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        showToast("تم تجهيز ملف Lua");

    };

    window.clearCode = function() {

        if (!codeEditor) return;

        if (!codeEditor.value.trim()) {
            showToast("المحرر فارغ");
            return;
        }

        if (!confirm("هل تريد مسح الكود؟")) return;

        codeEditor.value = "";

        showToast("تم مسح المحرر");

    };


    /* =====================================================
       16 - PROJECT MANAGER
    ===================================================== */

    let projects = loadData(
        CONFIG.storage.projects,
        []
    );

    if (!Array.isArray(projects)) {
        projects = [];
    }

    function renderProjects() {

        if (!projectsList) return;

        projectsList.innerHTML = "";

        if (projects.length === 0) {

            const empty = document.createElement("div");

            empty.className = "empty-state";
            empty.textContent = "🚀 لا توجد مشاريع حتى الآن. أضف مشروعك الأول!";

            projectsList.appendChild(empty);

            return;
        }

        projects.forEach(project => {

            const card = document.createElement("article");

            card.className = "project-card";

            const title = document.createElement("h3");
            title.textContent = project.name;

            const description = document.createElement("p");
            description.textContent = project.description;

            const date = document.createElement("small");
            date.textContent = project.date || "";

            date.style.color = "var(--muted)";
            date.style.display = "block";
            date.style.marginTop = "10px";

            const deleteButton = document.createElement("button");

            deleteButton.textContent = "حذف المشروع";

            deleteButton.addEventListener("click", () => {
                deleteProject(project.id);
            });

            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(date);
            card.appendChild(deleteButton);

            projectsList.appendChild(card);

        });

    }

    window.addProject = function() {

        const nameInput = $("#projectName");
        const descriptionInput = $("#projectDescription");

        if (!nameInput || !descriptionInput) return;

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!name) {
            showToast("اكتب اسم المشروع");
            nameInput.focus();
            return;
        }

        if (!description) {
            showToast("اكتب وصف المشروع");
            descriptionInput.focus();
            return;
        }

        const project = {
            id: Date.now() + Math.random(),
            name,
            description,
            date: new Date().toLocaleDateString("ar-SA")
        };

        projects.unshift(project);

        if (!saveData(CONFIG.storage.projects, projects)) {
            projects.shift();
            return;
        }

        renderProjects();

        nameInput.value = "";
        descriptionInput.value = "";

        showToast("تمت إضافة المشروع بنجاح 🚀");

    };

    function deleteProject(id) {

        if (!confirm("هل تريد حذف هذا المشروع؟")) return;

        const previous = projects;

        projects = projects.filter(
            project => project.id !== id
        );

        if (!saveData(CONFIG.storage.projects, projects)) {
            projects = previous;
            return;
        }

        renderProjects();

        showToast("تم حذف المشروع");

    }


    /* =====================================================
       17 - TOOL NAVIGATION
    ===================================================== */

    window.openTool = function(type) {

        const tools = {
            script: {
                prompt: "أريد إنشاء سكربت Roblox جديد."
            },

            ideas: {
                prompt: "أعطني فكرة ماب Roblox احترافية."
            },

            gui: {
                prompt: "أريد تخطيط واجهة GUI للعبتي."
            },

            errors: {
                prompt: "أريد تحليل خطأ برمجي في Roblox."
            }
        };

        const tool = tools[type];

        if (!tool) return;

        const assistant = $("#assistant");

        if (assistant) {
            assistant.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        setTimeout(() => {
            window.usePrompt(tool.prompt);
        }, 400);

    };


    /* =====================================================
       18 - THEME SYSTEM
    ===================================================== */

    const themeButton = $("#themeToggle");

    function applyTheme(theme) {

        document.body.classList.toggle(
            "light-theme",
            theme === "light"
        );

        if (themeButton) {
            themeButton.textContent =
                theme === "light" ? "☀️" : "🌙";
        }

        try {
            localStorage.setItem(CONFIG.storage.theme, theme);
        } catch (error) {
            console.warn("Theme could not be saved");
        }

    }

    const savedTheme = (() => {
        try {
            return localStorage.getItem(CONFIG.storage.theme);
        } catch {
            return null;
        }
    })();

    applyTheme(savedTheme || "dark");

    if (themeButton) {

        themeButton.addEventListener("click", () => {

            const isLight =
                document.body.classList.contains("light-theme");

            applyTheme(isLight ? "dark" : "light");

        });

    }


    /* =====================================================
       19 - KEYBOARD SHORTCUTS
    ===================================================== */

    document.addEventListener("keydown", event => {

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "enter"
        ) {
            if (chatInput && document.activeElement === chatInput) {
                event.preventDefault();

                if (chatForm) {
                    chatForm.requestSubmit();
                }
            }
        }

    });


    /* =====================================================
       20 - PUBLIC ENGINE API
    ===================================================== */

    window.GAMEDEV_AI = {

        name: CONFIG.name,

        version: CONFIG.version,

        ask: generateResponse,

        analyze: analyzeError,

        generateScript: generateScriptAnswer,

        generateIdea,

        generateGUI,

        detectIntent,

        getStats() {

            return {
                name: CONFIG.name,
                version: CONFIG.version,
                messages: chatHistory.length,
                projects: projects.length,
                templates: Object.keys(SCRIPT_TEMPLATES).length,
                knowledgeTopics: Object.keys(KNOWLEDGE.topics).length
            };

        },

        clearChat() {

            chatHistory = [];

            saveChat();

            restoreChat();

        }

    };


    /* =====================================================
       21 - INITIALIZATION
    ===================================================== */

    function initialize() {

        restoreChat();

        renderProjects();

        console.log(
            `%c ${CONFIG.name} V${CONFIG.version} READY `,
            "background:#7c3aed;color:white;padding:10px;font-weight:bold;border-radius:8px;"
        );

        console.table(window.GAMEDEV_AI.getStats());

    }

    initialize();

})();
```

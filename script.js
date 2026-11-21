```javascript
"use strict";

/* ==========================================
   GAMEDEV AI — MAIN ENGINE
   Local browser engine for Roblox developers
========================================== */

const STORAGE = {
    projects: "gamedev_ai_projects_v3",
    messages: "gamedev_ai_messages_v3",
    library: "gamedev_ai_library_v3",
    theme: "gamedev_ai_theme_v3"
};

const $ = (id) => document.getElementById(id);

function readStorage(key, fallback = []) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

/* ==========================================
   TOAST NOTIFICATIONS
========================================== */

function showToast(message) {
    const toast = $("toast");
    const toastMessage = $("toastMessage");

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

window.showToast = showToast;
window.toast = showToast;

/* ==========================================
   PAGE NAVIGATION
========================================== */

const pageNames = {
    home: "الرئيسية",
    chat: "المساعد الذكي",
    scripts: "مولد السكربتات",
    ideas: "أفكار المابات",
    gui: "تصميم الواجهات",
    errors: "تحليل الأخطاء",
    projects: "مشاريعي",
    library: "مكتبتي",
    studio: "Studio Lite",
    settings: "الإعدادات"
};

function navigate(page) {
    const target = $("page-" + page);

    if (!target) {
        showToast("الصفحة غير موجودة");
        return;
    }

    document.querySelectorAll(".page").forEach(item => {
        item.classList.remove("active");
    });

    target.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.page === page
        );
    });

    if ($("pageTitle")) {
        $("pageTitle").textContent = pageNames[page] || page;
    }

    closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

window.navigate = navigate;

/* ==========================================
   SIDEBAR
========================================== */

function openSidebar() {
    $("sidebar")?.classList.add("open");
}

function closeSidebar() {
    $("sidebar")?.classList.remove("open");
}

window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;

/* ==========================================
   THEME SYSTEM
========================================== */

function applyTheme(theme) {
    document.body.classList.toggle(
        "light-theme",
        theme === "light"
    );

    const label = theme === "light" ? "الوضع الفاتح" : "الوضع الداكن";

    if ($("themeToggle")) {
        $("themeToggle").title = label;
    }

    if ($("settingsThemeToggle")) {
        $("settingsThemeToggle").textContent = label;
    }

    writeStorage(STORAGE.theme, theme);
}

function toggleTheme() {
    const isLight = document.body.classList.contains("light-theme");
    applyTheme(isLight ? "dark" : "light");
}

window.toggleTheme = toggleTheme;

/* ==========================================
   PROJECTS SYSTEM
========================================== */

let projects = readStorage(STORAGE.projects);

function renderProjects() {
    const container = $("projectsList");
    const homeContainer = $("homeRecentProjects");

    const empty = `
        <div class="empty-state">
            <p>ما عندك مشاريع حتى الآن.</p>
        </div>
    `;

    if (container) {
        container.innerHTML = projects.length
            ? projects.map(project => `
                <div class="project-card">
                    <h3>${escapeHTML(project.name)}</h3>
                    <p>${escapeHTML(project.description || "بدون وصف")}</p>
                    <small>${escapeHTML(project.date)}</small>
                    <button class="btn btn-danger"
                        onclick="deleteProject('${project.id}')">
                        حذف المشروع
                    </button>
                </div>
            `).join("")
            : empty;
    }

    if (homeContainer) {
        homeContainer.innerHTML = projects.length
            ? projects.slice(-3).reverse().map(project => `
                <div class="project-card">
                    <h3>${escapeHTML(project.name)}</h3>
                    <p>${escapeHTML(project.description || "بدون وصف")}</p>
                </div>
            `).join("")
            : empty;
    }

    if ($("projectCount")) {
        $("projectCount").textContent = projects.length;
    }
}

function addProject() {
    const name = $("projectName")?.value.trim();
    const description = $("projectDescription")?.value.trim();

    if (!name) {
        showToast("اكتب اسم المشروع أولاً");
        return;
    }

    projects.push({
        id: Date.now().toString(),
        name,
        description,
        date: new Date().toLocaleDateString("ar-SA")
    });

    writeStorage(STORAGE.projects, projects);

    $("projectName").value = "";
    $("projectDescription").value = "";

    renderProjects();
    showToast("تم إنشاء المشروع بنجاح");
}

function deleteProject(id) {
    if (!confirm("هل تريد حذف هذا المشروع؟")) return;

    projects = projects.filter(project => project.id !== id);
    writeStorage(STORAGE.projects, projects);
    renderProjects();

    showToast("تم حذف المشروع");
}

window.addProject = addProject;
window.deleteProject = deleteProject;

/* ==========================================
   ROBLOX SCRIPT GENERATOR
========================================== */

const scriptTemplates = {

leaderstats: `-- Leaderstats System
-- ضع هذا السكربت داخل ServerScriptService

game.Players.PlayerAdded:Connect(function(player)

    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local Coins = Instance.new("IntValue")
    Coins.Name = "Coins"
    Coins.Value = 0
    Coins.Parent = leaderstats

    local Wins = Instance.new("IntValue")
    Wins.Name = "Wins"
    Wins.Value = 0
    Wins.Parent = leaderstats

end)`,

datastore: `-- DataStore System
-- ضع هذا السكربت داخل ServerScriptService
-- فعّل Enable Studio Access to API Services
-- من Game Settings > Security

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

local PlayerData = DataStoreService:GetDataStore("PlayerData_V1")

Players.PlayerAdded:Connect(function(player)

    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local Coins = Instance.new("IntValue")
    Coins.Name = "Coins"
    Coins.Parent = leaderstats

    local success, data = pcall(function()
        return PlayerData:GetAsync(player.UserId)
    end)

    if success and type(data) == "number" then
        Coins.Value = data
    else
        Coins.Value = 0
    end

end)

Players.PlayerRemoving:Connect(function(player)

    local stats = player:FindFirstChild("leaderstats")
    local coins = stats and stats:FindFirstChild("Coins")

    if not coins then return end

    local success, err = pcall(function()
        PlayerData:SetAsync(player.UserId, coins.Value)
    end)

    if not success then
        warn("DataStore Save Error:", err)
    end

end)`,

shop: `-- Simple Shop System
-- ضع السكربت داخل ServerScriptService
-- أنشئ RemoteEvent باسم BuyItem داخل ReplicatedStorage

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local BuyItem = ReplicatedStorage:WaitForChild("BuyItem")

local ITEM_PRICE = 100
local ITEM_NAME = "SpeedTool"

BuyItem.OnServerEvent:Connect(function(player)

    local stats = player:FindFirstChild("leaderstats")
    local coins = stats and stats:FindFirstChild("Coins")

    if not coins then return end
    if coins.Value < ITEM_PRICE then return end

    local item = game.ServerStorage:FindFirstChild(ITEM_NAME)
    if not item then
        warn("Item not found:", ITEM_NAME)
        return
    end

    coins.Value -= ITEM_PRICE

    local clone = item:Clone()
    clone.Parent = player.Backpack

end)`,

rebirth: `-- Rebirth System
-- ضع السكربت داخل ServerScriptService
-- أنشئ RemoteEvent باسم RebirthEvent داخل ReplicatedStorage

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RebirthEvent = ReplicatedStorage:WaitForChild("RebirthEvent")

local BASE_REQUIREMENT = 1000

RebirthEvent.OnServerEvent:Connect(function(player)

    local stats = player:FindFirstChild("leaderstats")
    if not stats then return end

    local power = stats:FindFirstChild("Power")
    local rebirths = stats:FindFirstChild("Rebirths")

    if not power or not rebirths then return end

    local requirement = BASE_REQUIREMENT * (rebirths.Value + 1)

    if power.Value >= requirement then
        power.Value = 0
        rebirths.Value += 1
    end

end)`,

levels: `-- Level System
-- ضع السكربت داخل ServerScriptService

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)

    local stats = Instance.new("Folder")
    stats.Name = "leaderstats"
    stats.Parent = player

    local Level = Instance.new("IntValue")
    Level.Name = "Level"
    Level.Value = 1
    Level.Parent = stats

    local XP = Instance.new("IntValue")
    XP.Name = "XP"
    XP.Value = 0
    XP.Parent = player

    XP.Changed:Connect(function()

        local requiredXP = Level.Value * 100

        while XP.Value >= requiredXP do
            XP.Value -= requiredXP
            Level.Value += 1
            requiredXP = Level.Value * 100
        end

    end)

end)`,

teleport: `-- Teleport System
-- أنشئ Part باسم TeleportPart
-- أنشئ Part باسم Destination
-- ضع السكربت داخل ServerScriptService

local teleportPart = workspace:WaitForChild("TeleportPart")
local destination = workspace:WaitForChild("Destination")

local debounce = {}

teleportPart.Touched:Connect(function(hit)

    local character = hit.Parent
    local humanoid = character:FindFirstChildOfClass("Humanoid")
    local player = game.Players:GetPlayerFromCharacter(character)

    if not humanoid or not player then return end
    if debounce[player] then return end

    debounce[player] = true

    character:PivotTo(destination.CFrame + Vector3.new(0, 4, 0))

    task.wait(2)
    debounce[player] = nil

end)`,

gui: `-- Simple GUI Button
-- ضع LocalScript داخل TextButton

local button = script.Parent

button.MouseButton1Click:Connect(function()

    print("Button clicked!")

    button.Text = "تم الضغط!"

    task.wait(1)

    button.Text = "اضغط هنا"

end)`,

rounds: `-- Basic Round System
-- ضع السكربت داخل ServerScriptService

local Players = game:GetService("Players")

local INTERMISSION = 15
local ROUND_TIME = 60
local MIN_PLAYERS = 2

while true do

    repeat
        print("Waiting for players...")
        task.wait(3)
    until #Players:GetPlayers() >= MIN_PLAYERS

    for i = INTERMISSION, 1, -1 do
        print("Starting in:", i)
        task.wait(1)
    end

    print("ROUND STARTED!")

    for i = ROUND_TIME, 1, -1 do

        if #Players:GetPlayers() < MIN_PLAYERS then
            print("Not enough players!")
            break
        end

        print("Time left:", i)
        task.wait(1)

    end

    print("ROUND ENDED!")

    task.wait(5)

end`,

admin: `-- Basic Admin Command
-- ضع السكربت داخل ServerScriptService
-- استبدل UserId برقم حسابك

local ADMINS = {
    [123456789] = true
}

game.Players.PlayerAdded:Connect(function(player)

    player.Chatted:Connect(function(message)

        if not ADMINS[player.UserId] then return end

        local args = string.split(message, " ")

        if args[1] == "!speed" then

            local amount = tonumber(args[2])
            local character = player.Character
            local humanoid = character and character:FindFirstChildOfClass("Humanoid")

            if humanoid and amount then
                humanoid.WalkSpeed = math.clamp(amount, 0, 100)
            end

        end

    end)

end)`,

custom: `-- Custom Roblox Script
-- اكتب فكرتك في خانة التفاصيل
-- هذا قالب بداية قابل للتعديل

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)

    print("Welcome", player.Name)

end)`
};

function generateScript() {
    const category = $("scriptCategory")?.value;
    const details = $("scriptDetails")?.value.trim();

    if (!category || !scriptTemplates[category]) {
        showToast("اختر نوع السكربت");
        return;
    }

    let code = scriptTemplates[category];

    if (details) {
        code = "-- تفاصيل طلبك: " + details.replace(/\n/g, " ") +
            "\n\n" + code;
    }

    if ($("codeEditor")) {
        $("codeEditor").value = code;
    }

    if ($("editorStatus")) {
        $("editorStatus").textContent = "تم إنشاء السكربت بنجاح";
    }

    showToast("تم توليد السكربت");
}

window.generateScript = generateScript;

/* ==========================================
   COPY AND DOWNLOAD CODE
========================================== */

async function copyCode() {
    const editor = $("codeEditor");

    if (!editor || !editor.value.trim()) {
        showToast("لا يوجد كود لنسخه");
        return;
    }

    try {
        await navigator.clipboard.writeText(editor.value);
        showToast("تم نسخ الكود");
    } catch {
        editor.select();

        try {
            document.execCommand("copy");
            showToast("تم نسخ الكود");
        } catch {
            showToast("تعذر النسخ، حدد الكود وانسخه يدويًا");
        }
    }
}

function downloadCode() {
    const editor = $("codeEditor");

    if (!editor || !editor.value.trim()) {
        showToast("لا يوجد كود لتحميله");
        return;
    }

    const blob = new Blob(
        [editor.value],
        { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "RobloxScript.lua";
    link.click();

    URL.revokeObjectURL(url);
    showToast("تم تحميل ملف Lua");
}

window.copyCode = copyCode;
window.downloadCode = downloadCode;

/* ==========================================
   MAP IDEA GENERATOR
========================================== */

const mapIdeas = {
    "عالم مفتوح": [
        "مدينة ساحلية فيها ميناء ومطار ومناطق سرية ومهام استكشاف.",
        "جزيرة كبيرة تتغير فيها الأحداث حسب قرارات اللاعبين.",
        "مدينة مستقبلية فيها مواصلات عامة ومهن ومتاجر قابلة للتطوير."
    ],
    "محاكاة واقعية": [
        "محاكاة إدارة مطار: وظائف وترقيات وطائرات وخدمات للمسافرين.",
        "محاكاة مستشفى فيها أقسام وأطباء وممرضون ونظام مناوبات.",
        "محاكاة شركة توصيل فيها طلبات ومركبات وتقييمات وترقيات."
    ],
    "رعب": [
        "فندق مهجور يتغير تصميم ممراته في كل جولة.",
        "قرية معزولة تختفي منها الكهرباء تدريجيًا وعلى اللاعبين إصلاحها.",
        "محطة قطار ليلية فيها ألغاز وأبواب ومهام هروب."
    ],
    "مغامرات": [
        "رحلة بحث عن مدينة مفقودة وسط الصحراء.",
        "مغامرة في جزر متعددة ولكل جزيرة تحدياتها وأسرارها.",
        "معبد قديم مليء بالفخاخ والألغاز والكنوز."
    ],
    "حياة واقعية": [
        "مدينة خليجية فيها وظائف إعلامي وشرطي وتاجر وميكانيكي مع ترقيات.",
        "حياة في حي شعبي فيه حراج ومحلات ومدارس ومناسبات.",
        "مدينة فيها نظام سمعة وعلاقات ووظائف ومشاريع تجارية."
    ],
    "تحديات": [
        "برج تحديات يتغير كل طابق فيه عشوائيًا.",
        "سباق جماعي بعقبات متحركة ومكافآت للمراكز الأولى.",
        "تحدي البقاء على منصات تنهار مع مرور الوقت."
    ],
    "قتال": [
        "ساحة فرق فيها أسلحة متنوعة ومهارات ونظام تصنيف.",
        "معارك بين فرق للسيطرة على مناطق الخريطة.",
        "بطولة قتالية فيها جولات ومكافآت وترتيب للاعبين."
    ],
    "اقتصاد": [
        "مدينة تجارية يستطيع اللاعب فيها تأسيس شركة وتوظيف الآخرين.",
        "سوق مزادات للاعبين مع نظام عرض وشراء وتبادل.",
        "جزيرة موارد فيها مصانع ومزارع وسلاسل إنتاج."
    ],
    "بقاء": [
        "جزيرة تتغير فيها الأحوال الجوية ويجب جمع الموارد.",
        "مخيم صحراوي يحتاج إلى إدارة الماء والطعام والطاقة.",
        "عالم بعد عاصفة كبيرة يحتاج اللاعبون فيه إلى بناء ملجأ."
    ]
};

function generateIdea() {
    const category = $("ideaCategory")?.value;
    const details = $("ideaDetails")?.value.trim();
    const ideas = mapIdeas[category];

    if (!ideas) {
        showToast("اختر تصنيف الماب");
        return;
    }

    const idea = ideas[Math.floor(Math.random() * ideas.length)];

    if ($("ideaResult")) {
        $("ideaResult").textContent =
            "💡 فكرة الماب:\n" + idea +
            (details ? "\n\nإضافاتك المطلوبة:\n" + details : "");
    }

    showToast("تم إنشاء فكرة الماب");
}

window.generateIdea = generateIdea;

/* ==========================================
   GUI DESIGN PLANNER
========================================== */

const guiLayouts = {
    "Main Menu": [
        "ScreenGui",
        " ├─ Background",
        " ├─ GameTitle",
        " ├─ PlayButton",
        " ├─ SettingsButton",
        " ├─ CreditsButton",
        " └─ LocalScript"
    ],
    "Shop": [
        "ScreenGui",
        " ├─ ShopFrame",
        " │   ├─ Title",
        " │   ├─ CloseButton",
        " │   ├─ ItemsContainer",
        " │   └─ ItemTemplate",
        " └─ LocalScript"
    ],
    "Inventory": [
        "ScreenGui",
        " ├─ InventoryFrame",
        " │   ├─ Title",
        " │   ├─ CloseButton",
        " │   ├─ ItemsGrid",
        " │   └─ ItemTemplate",
        " └─ LocalScript"
    ],
    "Stats": [
        "ScreenGui",
        " ├─ StatsFrame",
        " │   ├─ PlayerName",
        " │   ├─ CoinsLabel",
        " │   ├─ WinsLabel",
        " │   ├─ LevelLabel",
        " │   └─ CloseButton",
        " └─ LocalScript"
    ],
    "Settings": [
        "ScreenGui",
        " ├─ SettingsFrame",
        " │   ├─ Title",
        " │   ├─ MusicToggle",
        " │   ├─ SoundToggle",
        " │   ├─ GraphicsButton",
        " │   └─ CloseButton",
        " └─ LocalScript"
    ],
    "Admin Panel": [
        "ScreenGui",
        " ├─ AdminFrame",
        " │   ├─ Title",
        " │   ├─ PlayerList",
        " │   ├─ KickButton",
        " │   ├─ BanButton",
        " │   ├─ AnnouncementBox",
        " │   └─ CloseButton",
        " └─ LocalScript"
    ],
    "Loading Screen": [
        "ScreenGui",
        " ├─ LoadingFrame",
        " │   ├─ GameLogo",
        " │   ├─ LoadingText",
        " │   ├─ ProgressBar",
        " │   └─ ProgressFill",
        " └─ LocalScript"
    ]
};

function generateGUI() {
    const category = $("guiCategory")?.value;
    const details = $("guiDetails")?.value.trim();

    if (!guiLayouts[category]) {
        showToast("اختر نوع الواجهة");
        return;
    }

    const result =
        "واجهة: " + category + "\n\n" +
        "Explorer Hierarchy:\n" +
        guiLayouts[category].join("\n") +
        (details ? "\n\nملاحظات إضافية:\n" + details : "") +
        "\n\nملاحظة: هذا مخطط ترتيب العناصر، وليس واجهة منشأة تلقائيًا داخل Roblox Studio.";

    if ($("guiResult")) {
        $("guiResult").textContent = result;
    }

    showToast("تم إنشاء مخطط الواجهة");
}

window.generateGUI = generateGUI;

/* ==========================================
   ERROR ANALYZER
========================================== */

function analyzeError() {
    const input = $("errorInput")?.value.trim();

    if (!input) {
        showToast("الصق رسالة الخطأ أولاً");
        return;
    }

    const text = input.toLowerCase();
    let result = "لم أتعرف على الخطأ بشكل مؤكد. راجع السطر المذكور وتأكد من أسماء المتغيرات والعناصر.";

    const checks = [
        {
            words: ["attempt to index nil", "nil value"],
            answer: "السبب المحتمل: تحاول استخدام عنصر أو متغير قيمته nil.\nالحل: تأكد أن العنصر موجود باستخدام FindFirstChild أو WaitForChild قبل استخدامه."
        },
        {
            words: ["infinite yield possible"],
            answer: "السبب المحتمل: WaitForChild ينتظر عنصرًا لم يتم العثور عليه.\nالحل: تأكد من اسم العنصر ومكانه داخل Explorer."
        },
        {
            words: ["syntax error", "expected"],
            answer: "السبب المحتمل: خطأ في كتابة Lua.\nالحل: راجع الأقواس وعلامات التنصيص و end والفواصل."
        },
        {
            words: ["is not a valid member"],
            answer: "السبب المحتمل: تستخدم خاصية أو عنصرًا غير موجود بهذا الاسم.\nالحل: تحقق من الاسم ونوع العنصر."
        },
        {
            words: ["http 403", "403"],
            answer: "السبب المحتمل: صلاحيات أو إعدادات وصول غير صحيحة.\nالحل: راجع صلاحيات الخدمة أو إعدادات اللعبة."
        },
        {
            words: ["datastore", "502", "503"],
            answer: "قد تكون المشكلة في DataStore أو الاتصال بالخدمة.\nالحل: استخدم pcall، وتأكد من تفعيل API Services عند الاختبار في Studio."
        },
        {
            words: ["attempt to call"],
            answer: "السبب المحتمل: تحاول تشغيل قيمة ليست دالة.\nالحل: تحقق من اسم الدالة ومن أنك لم تستبدلها بمتغير."
        }
    ];

    for (const check of checks) {
        if (check.words.some(word => text.includes(word))) {
            result = check.answer;
            break;
        }
    }

    if ($("errorResult")) {
        $("errorResult").textContent =
            "نتيجة التحليل:\n\n" + result +
            "\n\nالخطأ الذي أرسلته:\n" + input;
    }

    showToast("اكتمل تحليل الخطأ");
}

window.analyzeError = analyzeError;

/* ==========================================
   CHAT ENGINE — LOCAL RESPONSES
========================================== */

let messages = readStorage(STORAGE.messages);

function renderMessages() {
    const container = $("chatMessages");
    if (!container) return;

    container.innerHTML = "";

    messages.forEach(message => {
        const bubble = document.createElement("div");
        bubble.className = "message " + message.role;
        bubble.textContent = message.text;
        container.appendChild(bubble);
    });

    container.scrollTop = container.scrollHeight;

    if ($("messageCount")) {
        $("messageCount").textContent = messages.length;
    }
}

function getAIResponse(question) {
    const q = question.toLowerCase();

    if (q.includes("leaderstats") || q.includes("لوحة") || q.includes("احصائيات")) {
        return "لإنشاء Leaderstats في Roblox:\n1. افتح ServerScriptService.\n2. أضف Script.\n3. أنشئ Folder باسم leaderstats داخل اللاعب.\n4. أضف IntValue مثل Coins أو Wins.\n\nتقدر تستخدم مولد السكربتات للحصول على قالب جاهز.";
    }

    if (q.includes("datastore") || q.includes("حفظ") || q.includes("يحفظ")) {
        return "لحفظ بيانات اللاعبين استخدم DataStoreService.\nضع نظام الحفظ داخل ServerScriptService، واستخدم pcall عند القراءة والكتابة. لا تنس تفعيل API Services في إعدادات اللعبة للاختبار.";
    }

    if (q.includes("فكرة") || q.includes("ماب") || q.includes("map")) {
        return "عندي لك فكرة: مدينة خليجية مفتوحة فيها وظائف وترقيات وحراج ومشاريع تجارية. خل كل وظيفة لها مهام يومية ورتب ومكافآت حتى يستمر اللاعب في التطور.";
    }

    if (q.includes("سرعة") || q.includes("walkspeed")) {
        return "لتغيير سرعة اللاعب في Roblox استخدم Humanoid.WalkSpeed من سكربت سيرفر، وتأكد من التحقق من صلاحيات اللاعب إذا كان التغيير بأمر إداري.";
    }

    if (q.includes("متجر") || q.includes("shop")) {
        return "أنصحك ببناء المتجر باستخدام RemoteEvent، لكن تحقق من السعر والرصيد داخل ServerScriptService، ولا تعتمد على LocalScript في عمليات الشراء.";
    }

    if (q.includes("خطأ") || q.includes("error") || q.includes("خربان")) {
        return "أرسل لي رسالة الخطأ كاملة مع اسم السكربت ومكانه في Explorer. أقدر أساعدك تحدد السبب المحتمل وتقترح إصلاحًا.";
    }

    if (q.includes("واجهة") || q.includes("gui")) {
        return "ابدأ بإنشاء ScreenGui داخل StarterGui، ثم Frame رئيسي وأزرار وعناوين. استخدم UIListLayout أو UIGridLayout لترتيب العناصر تلقائيًا.";
    }

    if (q.includes("السلام") || q.includes("هلا") || q.includes("مرحبا")) {
        return "وعليكم السلام! 👋 وش بنبرمج اليوم؟ أقدر أساعدك في سكربتات Roblox وأفكار المابات وتصميم الأنظمة.";
    }

    if (q.includes("شكرا") || q.includes("مشكور")) {
        return "العفو! 🔥 إذا عندك فكرة ثانية للعبة نقدر نشتغل عليها خطوة بخطوة.";
    }

    return "وصلت فكرتك! عشان أساعدك بشكل أدق، اكتب لي وش تبي تسوي في Roblox، واذكر مكان السكربت ونوعه (Script أو LocalScript). أقدر أعطيك خطوات وكود مبدئي. ملاحظة: المساعد الحالي يعمل بمحرك محلي داخل المتصفح، وليس متصلًا بنموذج ذكاء اصطناعي خارجي.";
}

function sendChat() {
    const input = $("chatInput");
    if (!input) return;

    const question = input.value.trim();
    if (!question) return;

    messages.push({
        role: "user",
        text: question
    });

    messages.push({
        role: "assistant",
        text: getAIResponse(question)
    });

    writeStorage(STORAGE.messages, messages);
    input.value = "";

    renderMessages();
}

function clearChat() {
    if (!confirm("هل تريد مسح المحادثة؟")) return;

    messages = [];
    writeStorage(STORAGE.messages, messages);
    renderMessages();

    showToast("تم مسح المحادثة");
}

window.sendChat = sendChat;
window.clearChat = clearChat;

/* ==========================================
   CODE LIBRARY
========================================== */

let library = readStorage(STORAGE.library);

function renderLibrary() {
    const container = $("libraryList");
    if (!container) return;

    container.innerHTML = library.length
        ? library.map(item => `
            <div class="library-card">
                <h3>${escapeHTML(item.name)}</h3>
                <pre>${escapeHTML(item.code)}</pre>
                <button onclick="copyLibraryCode('${item.id}')">نسخ</button>
                <button onclick="deleteLibraryCode('${item.id}')">حذف</button>
            </div>
        `).join("")
        : "<p>مكتبتك فارغة حاليًا.</p>";
}

function saveLibrary() {
    const name = $("libraryName")?.value.trim();
    const code = $("libraryInput")?.value.trim();

    if (!name || !code) {
        showToast("اكتب اسم الكود والصق الكود");
        return;
    }

    library.push({
        id: Date.now().toString(),
        name,
        code
    });

    writeStorage(STORAGE.library, library);

    $("libraryName").value = "";
    $("libraryInput").value = "";

    renderLibrary();
    showToast("تم حفظ الكود في مكتبتك");
}

async function copyLibraryCode(id) {
    const item = library.find(entry => entry.id === id);
    if (!item) return;

    try {
        await navigator.clipboard.writeText(item.code);
        showToast("تم نسخ الكود");
    } catch {
        showToast("تعذر النسخ من المتصفح");
    }
}

function deleteLibraryCode(id) {
    if (!confirm("حذف هذا الكود من المكتبة؟")) return;

    library = library.filter(item => item.id !== id);
    writeStorage(STORAGE.library, library);

    renderLibrary();
    showToast("تم حذف الكود");
}

window.saveLibrary = saveLibrary;
window.copyLibraryCode = copyLibraryCode;
window.deleteLibraryCode = deleteLibraryCode;

/* ==========================================
   RESET APPLICATION DATA
========================================== */

function resetAllData() {
    if (!confirm("هل أنت متأكد؟ سيتم حذف المشاريع والمحادثات والمكتبة.")) {
        return;
    }

    projects = [];
    messages = [];
    library = [];

    writeStorage(STORAGE.projects, projects);
    writeStorage(STORAGE.messages, messages);
    writeStorage(STORAGE.library, library);

    renderProjects();
    renderMessages();
    renderLibrary();

    showToast("تمت إعادة ضبط بيانات التطبيق");
}

window.resetAllData = resetAllData;

/* ==========================================
   INITIALIZE ALL SYSTEMS
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    // Navigation
    document.querySelectorAll(".nav-item[data-page]").forEach(button => {
        button.addEventListener("click", () => {
            navigate(button.dataset.page);
        });
    });

    // Sidebar
    $("mobileMenu")?.addEventListener("click", openSidebar);
    $("sidebarClose")?.addEventListener("click", closeSidebar);

    // Theme
    $("themeToggle")?.addEventListener("click", toggleTheme);
    $("settingsThemeToggle")?.addEventListener("click", toggleTheme);

    const savedTheme = readStorage(STORAGE.theme, "dark");
    applyTheme(savedTheme);

    // Chat
    $("chatForm")?.addEventListener("submit", function (event) {
        event.preventDefault();
        sendChat();
    });

    $("clearChat")?.addEventListener("click", clearChat);

    // Projects
    $("createProjectBtn")?.addEventListener("click", addProject);

    // Library
    $("saveLibraryBtn")?.addEventListener("click", saveLibrary);

    // Script generator
    $("generateScriptBtn")?.addEventListener("click", generateScript);
    $("copyCode")?.addEventListener("click", copyCode);
    $("downloadCode")?.addEventListener("click", downloadCode);

    // Ideas and GUI
    $("generateIdeaBtn")?.addEventListener("click", generateIdea);
    $("generateGUIBtn")?.addEventListener("click", generateGUI);

    // Error analyzer
    $("analyzeErrorBtn")?.addEventListener("click", analyzeError);

    // Reset
    $("resetAllData")?.addEventListener("click", resetAllData);

    // Notifications
    document.querySelector(".notification-btn")?.addEventListener("click", () => {
        showToast("ما عندك إشعارات جديدة");
    });

    // Enter to send chat
    $("chatInput")?.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendChat();
        }
    });

    // Initial rendering
    renderProjects();
    renderMessages();
    renderLibrary();

    console.log("GAMEDEV AI initialized successfully.");
});
```

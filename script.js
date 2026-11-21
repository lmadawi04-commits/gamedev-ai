"use strict";

/* ============================================================
   GAMEDEV AI — ULTRA CORE ENGINE
   Version 4.0
   Roblox Game Development Assistant
============================================================ */

const GD = {
    version: "4.0.0",
    storage: {
        projects: "gdai_projects_v4",
        theme: "gdai_theme_v4",
        chat: "gdai_chat_v4"
    }
};

/* ============================================================
   HELPERS
============================================================ */

const $ = (id) => document.getElementById(id);

function safeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch {
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        toast("تعذر الحفظ في جهازك", "error");
        return false;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomID() {
    return "GD-" + Math.random().toString(36).slice(2, 9).toUpperCase();
}

function formatDate(date = new Date()) {
    return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function toast(message, type = "success") {
    const container = $("toastContainer");

    if (!container) {
        console.log("[GAMEDEV AI]", message);
        return;
    }

    const item = document.createElement("div");
    item.className = `toast toast-${type}`;
    item.textContent = message;

    container.appendChild(item);

    requestAnimationFrame(() => item.classList.add("show"));

    setTimeout(() => {
        item.classList.remove("show");
        setTimeout(() => item.remove(), 400);
    }, 3000);
}

/* ============================================================
   APP STATE
============================================================ */

const App = {
    currentPage: "home",
    projects: readStorage(GD.storage.projects, []),
    chat: readStorage(GD.storage.chat, []),
    theme: localStorage.getItem(GD.storage.theme) || "dark",
    busy: false
};

/* ============================================================
   LOADING SCREEN
============================================================ */

function initializeLoading() {
    const loader = document.getElementById("loadingScreen");

    if (!loader) return;

    loader.style.opacity = "0";
    loader.style.visibility = "hidden";
    loader.style.pointerEvents = "none";
    loader.style.display = "none";
}

/* ============================================================
   NAVIGATION
============================================================ */

function navigate(page) {
    const target = $(`page-${page}`);

    if (!target) {
        toast("الصفحة غير موجودة", "error");
        return;
    }

    App.currentPage = page;

    document.querySelectorAll(".page").forEach(section => {
        section.classList.remove("active");
    });

    target.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    const title = $("pageTitle");
    const subtitle = $("pageSubtitle");

    const pageNames = {
        home: ["الرئيسية", "لوحة تحكم المطور"],
        chat: ["المساعد الذكي", "اسأل وطور فكرتك"],
        scripts: ["مختبر السكربتات", "إنشاء سكربت Roblox"],
        ideas: ["مولد الأفكار", "اكتشف فكرة لعبتك القادمة"],
        gui: ["مصمم الواجهات", "خطط واجهات لعبتك"],
        errors: ["محلل الأخطاء", "حل أخطاء Lua و Roblox"],
        projects: ["مشاريعي", "إدارة مشاريعك"],
        library: ["مكتبة السكربتات", "أدوات وسكربتات سريعة"],
        studio: ["Studio Lite", "أدوات التطوير"],
        settings: ["الإعدادات", "تخصيص تجربتك"]
    };

    if (title) title.textContent = pageNames[page]?.[0] || page;
    if (subtitle) subtitle.textContent = pageNames[page]?.[1] || "";

    closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function initializeNavigation() {
    document.querySelectorAll("[data-page]").forEach(button => {
        button.addEventListener("click", () => {
            navigate(button.dataset.page);
        });
    });
}

function openTool(tool) {
    const mapping = {
        chat: "chat",
        scripts: "scripts",
        ideas: "ideas",
        gui: "gui",
        errors: "errors",
        projects: "projects",
        library: "library",
        studio: "studio"
    };

    navigate(mapping[tool] || tool);
}

/* ============================================================
   SIDEBAR
============================================================ */

function openSidebar() {
    const sidebar = $("sidebar");
    const overlay = $("sidebarOverlay");

    sidebar?.classList.add("open");
    overlay?.classList.add("active");
}

function closeSidebar() {
    $("sidebar")?.classList.remove("open");
    $("sidebarOverlay")?.classList.remove("active");
}

function initializeSidebar() {
    $("menuToggle")?.addEventListener("click", openSidebar);
    $("sidebarClose")?.addEventListener("click", closeSidebar);
    $("sidebarOverlay")?.addEventListener("click", closeSidebar);
}

/* ============================================================
   THEME SYSTEM
============================================================ */

function applyTheme(theme) {
    App.theme = theme;

    document.documentElement.dataset.theme = theme;

    if (theme === "light") {
        document.body.classList.add("light-theme");
    } else {
        document.body.classList.remove("light-theme");
    }

    localStorage.setItem(GD.storage.theme, theme);

    const icon = $("themeIcon");
    if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
    applyTheme(App.theme === "dark" ? "light" : "dark");
    toast("تم تغيير المظهر");
}

function initializeTheme() {
    applyTheme(App.theme);
    $("themeToggle")?.addEventListener("click", toggleTheme);
}

/* ============================================================
   CHAT ENGINE
   Local response engine — no external API connected.
============================================================ */

const ChatKnowledge = [
    {
        keys: ["سرعة", "speed"],
        response: `لإنشاء نظام سرعة في Roblox:

1. استخدم Humanoid داخل شخصية اللاعب.
2. غيّر WalkSpeed عند التفعيل.
3. لا تجعل العميل يحدد السرعة النهائية بنفسه.
4. استخدم ServerScript للتحقق.

مثال:

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function(character)
        local humanoid = character:WaitForChild("Humanoid")
        humanoid.WalkSpeed = 30
    end)
end)`
    },
    {
        keys: ["فلوس", "مال", "money", "cash"],
        response: `نظام الأموال:

• أنشئ leaderstats في ServerScriptService.
• أضف IntValue باسم Cash.
• استخدم RemoteEvent للطلبات.
• لا تسمح للعميل بإرسال مبلغ المال مباشرة.

مثال:

game.Players.PlayerAdded:Connect(function(player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local cash = Instance.new("IntValue")
    cash.Name = "Cash"
    cash.Value = 0
    cash.Parent = leaderstats
end)`
    },
    {
        keys: ["حفظ", "داتا", "data", "datastore"],
        response: `لحفظ البيانات في Roblox:

• استخدم DataStoreService.
• الحفظ يكون من السيرفر.
• استخدم pcall لتجنب توقف السكربت.
• لا تنس اختبار الحفظ في تجربة منشورة.

مثال:

local DataStoreService =
    game:GetService("DataStoreService")

local Store = DataStoreService:GetDataStore("PlayerData")

local function savePlayer(player, value)
    local success, err = pcall(function()
        Store:SetAsync("Player_" .. player.UserId, value)
    end)

    if not success then
        warn("Save failed:", err)
    end
end`
    },
    {
        keys: ["باب", "door", "بوابة"],
        response: `لعمل باب يفتح عند اقتراب اللاعب:

• ضع Part للباب.
• استخدم ProximityPrompt.
• اربط حركة الباب بالسيرفر.
• تحقق من شروط فتح الباب.

مثال بسيط:

local prompt = script.Parent.ProximityPrompt
local door = script.Parent

prompt.Triggered:Connect(function(player)
    door.Transparency = 1
    door.CanCollide = false

    task.wait(3)

    door.Transparency = 0
    door.CanCollide = true
end)`
    },
    {
        keys: ["زر", "button", "gui"],
        response: `لإنشاء زر GUI:

1. أضف ScreenGui داخل StarterGui.
2. أضف TextButton.
3. أضف LocalScript داخل الزر.
4. استخدم MouseButton1Click.

مثال:

local button = script.Parent

button.MouseButton1Click:Connect(function()
    print("تم الضغط على الزر")
end)`
    },
    {
        keys: ["ماب", "خريطة", "map", "لعبة", "game"],
        response: `فكرة تطوير ماب:

🎮 ابدأ بفكرة أساسية واضحة.
🗺️ قسم الماب إلى مناطق.
🎯 أضف هدفاً للاعب.
💰 أضف نظام مكافآت.
🔓 أضف تقدم وفتح مناطق.
👥 اختبر الماب مع لاعبين.

إذا تبي، أقدر أجهز لك مخطط ماب كامل مع الأنظمة والمهام.`
    },
    {
        keys: ["تسريع", "تايم", "وقت", "timer"],
        response: `لإنشاء نظام مؤقت:

local timeLeft = 60

while timeLeft > 0 do
    print("الوقت:", timeLeft)
    task.wait(1)
    timeLeft -= 1
end

print("انتهى الوقت!")

تقدر تربطه بواجهة TextLabel لتعرض الوقت للاعب.`
    }
];

function getChatResponse(message) {
    const text = message.toLowerCase();

    for (const item of ChatKnowledge) {
        if (item.keys.some(key => text.includes(key))) {
            return item.response;
        }
    }

    if (text.includes("مرحبا") || text.includes("السلام") || text.includes("هلا")) {
        return "ياهلا فيك 👋 أنا مساعد GAMEDEV AI. أقدر أساعدك في سكربتات Roblox، أفكار المابات، واجهات GUI، حل الأخطاء، وأنظمة الألعاب. اكتب لي وش تبي تسوي!";
    }

    if (text.includes("سكربت") || text.includes("script")) {
        return "أقدر أساعدك تكتب سكربت Roblox بلغة Lua. اكتب لي وش وظيفة السكربت، وين تبي تحطه، وهل تبيه ServerScript أو LocalScript، وبجهزه لك مع طريقة تركيبه.";
    }

    if (text.includes("فكرة")) {
        return "عندي أفكار كثيرة! أقدر أطلع لك فكرة ماب كاملة مع الاسم، نظام اللعب، المناطق، المهام، التطوير، والمكافآت. حدد نوع لعبتك أو اكتب (فكرة عشوائية).";
    }

    return `وصلني طلبك:

"${message}"

أقدر أساعدك في:
• برمجة Roblox بلغة Lua
• تصميم أنظمة اللعب
• أفكار المابات
• واجهات GUI
• حل الأخطاء
• تنظيم ملفات المشروع

حدد لي تفاصيل أكثر عن المطلوب حتى أجهز لك حل مناسب.

ملاحظة: المساعد الحالي يعمل بمحرك ردود محلي، وليس متصلاً بنموذج ذكاء اصطناعي خارجي.`;
}

/* ============================================================
   CHAT UI
============================================================ */

function addChatMessage(role, message) {
    const container = $("chatMessages");
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.className = `chat-message ${role}`;

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = role === "user" ? "👤" : "🤖";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";

    const content = document.createElement("div");
    content.className = "chat-content";
    content.textContent = message;

    bubble.appendChild(content);

    if (role === "assistant") {
        const copy = document.createElement("button");
        copy.className = "message-copy";
        copy.textContent = "نسخ الرد";
        copy.addEventListener("click", () => copyText(message));
        bubble.appendChild(copy);
    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    container.appendChild(wrapper);

    container.scrollTop = container.scrollHeight;
}

async function sendChatMessage(message) {
    const text = String(message || "").trim();

    if (!text || App.busy) return;

    App.busy = true;

    const input = $("chatInput");
    if (input) input.value = "";

    addChatMessage("user", text);

    App.chat.push({
        role: "user",
        text,
        time: Date.now()
    });

    writeStorage(GD.storage.chat, App.chat);

    const typing = document.createElement("div");
    typing.className = "chat-typing";
    typing.id = "chatTyping";
    typing.textContent = "GAMEDEV AI يفكر...";
    $("chatMessages")?.appendChild(typing);

    await delay(650);

    typing.remove();

    const response = getChatResponse(text);

    addChatMessage("assistant", response);

    App.chat.push({
        role: "assistant",
        text: response,
        time: Date.now()
    });

    writeStorage(GD.storage.chat, App.chat);

    App.busy = false;
}

function initializeChat() {
    $("chatForm")?.addEventListener("submit", event => {
        event.preventDefault();
        sendChatMessage($("chatInput")?.value);
    });

    $("sendChat")?.addEventListener("click", () => {
        sendChatMessage($("chatInput")?.value);
    });

    document.querySelectorAll("[data-prompt]").forEach(button => {
        button.addEventListener("click", () => {
            usePrompt(button.dataset.prompt);
        });
    });

    const input = $("chatInput");

    input?.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendChatMessage(input.value);
        }
    });
}

function usePrompt(prompt) {
    if (!prompt) return;

    navigate("chat");

    const input = $("chatInput");
    if (input) input.value = prompt;

    setTimeout(() => input?.focus(), 150);
}

function clearChat() {
    App.chat = [];
    writeStorage(GD.storage.chat, App.chat);

    const messages = $("chatMessages");
    if (messages) messages.innerHTML = "";

    toast("تم مسح المحادثة");
}

/* ============================================================
   SCRIPT GENERATOR
============================================================ */

const ScriptTemplates = {
    speed: `--[ GAMEDEV AI | SPEED SYSTEM ]--

local Players = game:GetService("Players")

local DEFAULT_SPEED = 16
local BOOST_SPEED = 32

Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function(character)
        local humanoid = character:WaitForChild("Humanoid")
        humanoid.WalkSpeed = DEFAULT_SPEED
    end)
end)

-- ضع منطق تفعيل السرعة الإضافية هنا
`,

    money: `--[ GAMEDEV AI | MONEY SYSTEM ]--

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local money = Instance.new("IntValue")
    money.Name = "Money"
    money.Value = 0
    money.Parent = leaderstats
end)

-- أضف أنظمة المكافآت في السيرفر
`,

    leaderstats: `--[ GAMEDEV AI | LEADERSTATS ]--

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local wins = Instance.new("IntValue")
    wins.Name = "Wins"
    wins.Value = 0
    wins.Parent = leaderstats

    local level = Instance.new("IntValue")
    level.Name = "Level"
    level.Value = 1
    level.Parent = leaderstats
end)
`,

    door: `--[ GAMEDEV AI | INTERACTIVE DOOR ]--

local door = script.Parent
local prompt = door:WaitForChild("ProximityPrompt")

local opened = false

prompt.Triggered:Connect(function(player)
    if opened then return end

    opened = true
    door.Transparency = 0.7
    door.CanCollide = false

    task.wait(3)

    door.Transparency = 0
    door.CanCollide = true
    opened = false
end)
`,

    kill: `--[ GAMEDEV AI | KILL PART ]--

local part = script.Parent

part.Touched:Connect(function(hit)
    local character = hit.Parent
    local humanoid = character and character:FindFirstChildOfClass("Humanoid")

    if humanoid then
        humanoid.Health = 0
    end
end)
`,

    checkpoint: `--[ GAMEDEV AI | CHECKPOINT ]--

local checkpoint = script.Parent

checkpoint.Touched:Connect(function(hit)
    local character = hit.Parent
    local player = game.Players:GetPlayerFromCharacter(character)

    if not player then return end

    player:SetAttribute("Checkpoint", checkpoint.Position)
end)
`,

    tool: `--[ GAMEDEV AI | TOOL ]--

local tool = script.Parent

tool.Activated:Connect(function()
    print("Tool activated:", tool.Name)
end)
`,

    teleport: `--[ GAMEDEV AI | TELEPORT PART ]--

local Players = game:GetService("Players")
local destination = workspace:WaitForChild("Destination")
local part = script.Parent

part.Touched:Connect(function(hit)
    local character = hit.Parent
    local player = Players:GetPlayerFromCharacter(character)

    if not player then return end

    local root = character:FindFirstChild("HumanoidRootPart")

    if root then
        root.CFrame = destination.CFrame + Vector3.new(0, 4, 0)
    end
end)
`,

    rebirth: `--[ GAMEDEV AI | REBIRTH SYSTEM ]--

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    local stats = player:WaitForChild("leaderstats")
    local power = stats:WaitForChild("Power")

    local rebirths = Instance.new("IntValue")
    rebirths.Name = "Rebirths"
    rebirths.Value = 0
    rebirths.Parent = stats
end)

-- تحقق من متطلبات Rebirth في السيرفر
-- لا تسمح للعميل بتحديد المكافآت
`,

    datastore: `--[ GAMEDEV AI | DATASTORE ]--

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

local store = DataStoreService:GetDataStore("PlayerData_V1")

local function savePlayer(player)
    local data = {
        Coins = player:GetAttribute("Coins") or 0
    }

    local success, err = pcall(function()
        store:SetAsync("Player_" .. player.UserId, data)
    end)

    if not success then
        warn("Save error:", err)
    end
end

local function loadPlayer(player)
    local success, data = pcall(function()
        return store:GetAsync("Player_" .. player.UserId)
    end)

    if success and data then
        player:SetAttribute("Coins", data.Coins or 0)
    else
        player:SetAttribute("Coins", 0)
    end
end

Players.PlayerAdded:Connect(loadPlayer)
Players.PlayerRemoving:Connect(savePlayer)

game:BindToClose(function()
    for _, player in ipairs(Players:GetPlayers()) do
        savePlayer(player)
    end
end)
`,

    round: `--[ GAMEDEV AI | ROUND SYSTEM BASE ]--

local Players = game:GetService("Players")

local MIN_PLAYERS = 2
local INTERMISSION = 15
local ROUND_TIME = 120

while true do
    while #Players:GetPlayers() < MIN_PLAYERS do
        task.wait(2)
    end

    for timer = INTERMISSION, 1, -1 do
        print("Starting in:", timer)
        task.wait(1)
    end

    print("ROUND START")

    for timer = ROUND_TIME, 1, -1 do
        if #Players:GetPlayers() < MIN_PLAYERS then
            break
        end

        print("Time remaining:", timer)
        task.wait(1)
    end

    print("ROUND END")
    task.wait(5)
end
`,

    ui: `--[ GAMEDEV AI | GUI BUTTON ]--

local button = script.Parent

button.Activated:Connect(function()
    print("Button pressed!")
end)
`,

    npc: `--[ GAMEDEV AI | NPC MOVEMENT BASE ]--

local npc = script.Parent
local humanoid = npc:WaitForChild("Humanoid")

local points = workspace:WaitForChild("NPCPoints"):GetChildren()

while #points > 0 do
    local point = points[math.random(1, #points)]

    humanoid:MoveTo(point.Position)
    humanoid.MoveToFinished:Wait()

    task.wait(1)
end
`,

    pet: `--[ GAMEDEV AI | PET FOLLOW BASE ]--

local Players = game:GetService("Players")
local pet = script.Parent

local function followPlayer(player)
    local character = player.Character
    if not character then return end

    local root = character:FindFirstChild("HumanoidRootPart")
    local petRoot = pet.PrimaryPart

    if root and petRoot then
        petRoot.CFrame = root.CFrame * CFrame.new(3, 0, 3)
    end
end

Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function()
        task.wait(2)
        followPlayer(player)
    end)
end)
`,

    shop: `--[ GAMEDEV AI | SHOP SYSTEM BASE ]--

local Players = game:GetService("Players")

local function purchase(player, itemName, price)
    local stats = player:FindFirstChild("leaderstats")
    local coins = stats and stats:FindFirstChild("Coins")

    if not coins then return false end
    if coins.Value < price then return false end

    coins.Value -= price

    print(player.Name, "purchased", itemName)

    return true
end

-- نفّذ عمليات الشراء من السيرفر
-- أضف التحقق من RemoteEvent عند ربط GUI
`,

    generic: `--[ GAMEDEV AI | NEW SCRIPT ]--

local Players = game:GetService("Players")

-- اكتب وظيفة السكربت هنا

print("GAMEDEV AI script initialized")

-- TODO: Add your game logic
`
};

function detectScriptType(text) {
    const value = (text || "").toLowerCase();

    if (/سرع|speed/.test(value)) return "speed";
    if (/فلوس|مال|money|cash|coin/.test(value)) return "money";
    if (/leaderstat|leaderstats|احصائ/.test(value)) return "leaderstats";
    if (/باب|door/.test(value)) return "door";
    if (/قتل|kill|موت|ضرر/.test(value)) return "kill";
    if (/checkpoint|نقطة حفظ|نقطه حفظ/.test(value)) return "checkpoint";
    if (/tool|اداة|أداة/.test(value)) return "tool";
    if (/teleport|انتقال|نقل لاعب/.test(value)) return "teleport";
    if (/rebirth|ريبرث|إعادة الولادة/.test(value)) return "rebirth";
    if (/data|حفظ|داتا/.test(value)) return "datastore";
    if (/round|جولة|راوند/.test(value)) return "round";
    if (/gui|واجهة|زر/.test(value)) return "ui";
    if (/npc|شخصية|بوت/.test(value)) return "npc";
    if (/pet|حيوان|مرافق/.test(value)) return "pet";
    if (/shop|متجر|شراء/.test(value)) return "shop";

    return "generic";
}

function generateScript() {
    const category = $("scriptCategory")?.value || "generic";
    const details = $("scriptDetails")?.value || "";

    const type = category === "custom"
        ? detectScriptType(details)
        : category;

    const code = ScriptTemplates[type] || ScriptTemplates.generic;

    const output = $("codeEditor");
    if (output) output.value = code;

    updateLineNumbers();
    updateEditorStatus();
    toast("تم إنشاء السكربت");
}

function updateLineNumbers() {
    const editor = $("codeEditor");
    const lineNumbers = $("lineNumbers");

    if (!editor || !lineNumbers) return;

    const count = Math.max(1, editor.value.split("\n").length);

    lineNumbers.innerHTML = Array.from(
        { length: count },
        (_, i) => `<div>${i + 1}</div>`
    ).join("");

    lineNumbers.scrollTop = editor.scrollTop;
}

function updateEditorStatus() {
    const editor = $("codeEditor");
    const status = $("editorStatus");

    if (!editor || !status) return;

    status.textContent = `${editor.value.split("\n").length} Lines • Lua`;
}

function copyCode() {
    copyText($("codeEditor")?.value || "");
}

function downloadCode() {
    const code = $("codeEditor")?.value || "";

    if (!code.trim()) {
        toast("أنشئ سكربت أولاً", "error");
        return;
    }

    const blob = new Blob([code], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "GAMEDEV_AI_Script.lua";
    link.click();

    URL.revokeObjectURL(url);
    toast("تم تحميل ملف Lua");
}

/* ============================================================
   IDE EDITOR
============================================================ */

function initializeEditor() {
    const editor = $("codeEditor");

    if (!editor) return;

    editor.addEventListener("input", () => {
        updateLineNumbers();
        updateEditorStatus();
    });

    editor.addEventListener("scroll", updateLineNumbers);

    updateLineNumbers();
    updateEditorStatus();
}

/* ============================================================
   IDEA GENERATOR
============================================================ */

const Ideas = {
    simulator: [
        "محاكي بناء مدينة يبدأ اللاعب فيه من قطعة أرض صغيرة ويطورها إلى مدينة ضخمة.",
        "محاكي جمع الطاقة: كل منطقة تحتوي مصادر طاقة نادرة وتطويرات مختلفة.",
        "محاكي صناعة السيارات: اجمع القطع واصنع مركباتك ثم اختبرها.",
        "محاكي مطعم: ابدأ بعربة طعام وطورها إلى سلسلة مطاعم."
    ],

    survival: [
        "جزيرة تتغير كل ليلة وتظهر فيها تحديات وموارد جديدة.",
        "عاصفة رملية تقترب كل عدة دقائق ويجب تجهيز الملجأ.",
        "لاعبون عالقون في محطة مهجورة ويحتاجون جمع أجزاء للهروب.",
        "مدينة غارقة ترتفع مياهها تدريجياً ويجب الانتقال إلى مناطق أعلى."
    ],

    tycoon: [
        "Tycoon بناء محطة فضاء مع أقسام إنتاج وطاقم.",
        "Tycoon إدارة مدينة ألعاب وتطوير الألعاب والمرافق.",
        "Tycoon إدارة شركة سيارات تبدأ بورشة صغيرة.",
        "Tycoon بناء سوق عربي ضخم مع محلات قابلة للتطوير."
    ],

    horror: [
        "فندق مهجور يحتوي طوابق تتغير كل مرة يدخل اللاعب.",
        "مدرسة قديمة تختفي فيها الفصول بعد منتصف الليل.",
        "قرية ضبابية يجب اكتشاف أسرارها قبل طلوع الشمس.",
        "مستشفى مهجور يعمل فيه مصعد ينقلك إلى أماكن غريبة."
    ],

    obby: [
        "Obby فوق مدينة مستقبلية مع مسارات تختفي.",
        "Obby داخل مصنع ضخم يتغير اتجاه الآلات.",
        "Obby مراحل بألوان، ولكل لون قدرة مختلفة.",
        "Obby داخل عالم عملاق من الأدوات اليومية."
    ],

    roleplay: [
        "مدينة خليجية فيها وظائف وتجارة ومنازل وتطوير وظيفي.",
        "قرية شعبية فيها سوق ومزارع وورش وأسرار.",
        "مدينة إعلامية فيها مذيعون ومصورون وصحف ومهام.",
        "مدينة سياحية فيها مطار وفنادق ومناطق فعاليات."
    ],

    battleground: [
        "ساحة معارك تتغير تضاريسها خلال القتال.",
        "معركة فرق مع قدرات يتم اكتسابها من المناطق.",
        "قتال في مدينة يمكن فتح الطرق وإغلاقها.",
        "Arena تحتوي أحداثاً عشوائية وتحديات كل دقيقة."
    ],

    custom: [
        "عالم مفتوح مع مهام سرية وأماكن مخفية.",
        "لعبة تطوير شخصية مع نظام سمعة ومهارات.",
        "لعبة سباق مناطق متعددة مع تحديات جماعية.",
        "لعبة استكشاف فيها آثار وألغاز وأدوات."
    ]
};

function generateIdea() {
    const category = $("ideaCategory")?.value || "custom";
    const details = $("ideaDetails")?.value || "";

    const pool = Ideas[category] || Ideas.custom;
    const idea = pool[Math.floor(Math.random() * pool.length)];

    const title = idea.split(":")[0].slice(0, 70);

    const fullIdea = `
🎮 الفكرة:
${idea}

🗺️ تصميم الماب:
• منطقة بداية واضحة.
• مناطق تطوير تدريجية.
• مكان خاص للمكافآت.
• أماكن سرية للاستكشاف.

🎯 نظام اللعب:
• مهام قصيرة ومتنوعة.
• مكافآت على الإنجاز.
• تطوير مستمر.
• أهداف يومية.

⭐ إضافات مميزة:
• أحداث عشوائية.
• تحديات أسبوعية.
• عناصر نادرة.
• لوحة ترتيب اللاعبين.

🧩 تفاصيل طلبك:
${details || "لم يتم تحديد تفاصيل إضافية."}

🚀 اقتراح التطوير:
ابدأ بنموذج صغير قابل للعب، ثم أضف المناطق والأنظمة تدريجياً.
`;

    const result = $("ideaResult");

    if (result) {
        result.innerHTML = `
            <h3>${safeHTML(title)}</h3>
            <pre>${safeHTML(fullIdea)}</pre>
        `;
    }

    toast("تم توليد فكرة جديدة");
}

/* ============================================================
   GUI PLANNER
============================================================ */

const GUIPlans = {
    shop: [
        "واجهة متجر متكاملة",
        "Header: اسم المتجر + رصيد اللاعب.",
        "Categories: أدوات، قدرات، عناصر، ترقيات.",
        "Item Card: صورة العنصر + الاسم + السعر + زر شراء.",
        "Footer: زر إغلاق + تنبيه عند عدم كفاية الرصيد."
    ],

    inventory: [
        "واجهة Inventory",
        "Header: عنوان المخزون + عدد العناصر.",
        "Grid: مربعات العناصر.",
        "Details: وصف العنصر المحدد.",
        "Actions: Equip / Unequip / Drop.",
        "Footer: زر إغلاق."
    ],

    settings: [
        "واجهة الإعدادات",
        "Audio: صوت الموسيقى والمؤثرات.",
        "Graphics: جودة العرض.",
        "Gameplay: خيارات اللعب.",
        "Controls: أزرار التحكم.",
        "زر إعادة الضبط."
    ],

    leaderboard: [
        "واجهة ترتيب اللاعبين",
        "Header: أفضل اللاعبين.",
        "Top 3: تصميم خاص للمراكز الثلاثة.",
        "List: بقية اللاعبين.",
        "Stats: Wins / Level / Coins.",
        "زر تحديث الترتيب."
    ],

    loading: [
        "واجهة تحميل",
        "Logo: اسم اللعبة.",
        "Progress Bar: نسبة التحميل.",
        "Tips: نصائح تتغير.",
        "Background: صورة أو عالم اللعبة.",
        "Animation: انتقال تدريجي."
    ],

    hud: [
        "واجهة HUD",
        "Health Bar.",
        "Cash / Coins.",
        "Level / XP.",
        "Quest Tracker.",
        "Buttons: متجر، حقيبة، إعدادات."
    ],

    custom: [
        "واجهة GUI مخصصة",
        "Header: عنوان الواجهة.",
        "Main Content: المحتوى الأساسي.",
        "Buttons: أزرار التفاعل.",
        "Footer: خيارات إضافية.",
        "Animations: انتقالات ناعمة."
    ]
};

function generateGUI() {
    const category = $("guiCategory")?.value || "custom";
    const details = $("guiDetails")?.value || "";

    const plan = GUIPlans[category] || GUIPlans.custom;

    const resultText = [
        ...plan,
        "",
        "🎨 اقتراح الشكل:",
        "• خلفية داكنة مع تدرج بنفسجي.",
        "• زوايا مستديرة.",
        "• حدود شفافة.",
        "• تأثير Hover للأزرار.",
        "• Animation عند فتح الواجهة.",
        "",
        "📌 تفاصيل إضافية:",
        details || "لم يتم تحديد تفاصيل."
    ].join("\n");

    const result = $("guiResult");

    if (result) {
        result.innerHTML = `<pre>${safeHTML(resultText)}</pre>`;
    }

    toast("تم تجهيز مخطط الواجهة");
}

/* ============================================================
   ERROR ANALYZER
============================================================ */

const ErrorKnowledge = [
    {
        match: ["attempt to index nil", "index nil"],
        title: "Nil Error",
        explanation: "تحاول استخدام عنصر أو متغير غير موجود أو قيمته nil.",
        solutions: [
            "تأكد من اسم العنصر.",
            "استخدم WaitForChild عند الحاجة.",
            "تأكد أن العنصر موجود في المكان الصحيح.",
            "لا تستخدم العنصر قبل التأكد من وجوده."
        ],
        example: `local part = workspace:WaitForChild("Part")
print(part.Name)`
    },
    {
        match: ["infinite yield", "yield"],
        title: "Infinite Yield Warning",
        explanation: "السكربت ينتظر عنصرًا لم يظهر أو اسمه غير صحيح.",
        solutions: [
            "تأكد من اسم العنصر.",
            "تأكد من مكانه داخل Explorer.",
            "راجع مسار العنصر.",
            "تأكد أن العنصر يتم إنشاؤه."
        ],
        example: `local object = workspace:WaitForChild("Part", 10)

if not object then
    warn("Part not found")
end`
    },
    {
        match: ["syntax error", "expected", "unexpected symbol"],
        title: "Syntax Error",
        explanation: "يوجد خطأ في كتابة Lua أو ترتيب الأقواس أو الكلمات.",
        solutions: [
            "راجع الأقواس () و {}.",
            "راجع علامات الاقتباس.",
            "تأكد من كتابة end.",
            "راجع الفواصل وعلامات العمليات."
        ],
        example: `if true then
    print("Hello")
end`
    },
    {
        match: ["attempt to call", "not a function"],
        title: "Function Error",
        explanation: "تحاول تشغيل شيء ليس دالة، أو اسم الدالة غير صحيح.",
        solutions: [
            "تأكد أن الاسم صحيح.",
            "راجع طريقة استدعاء الدالة.",
            "تأكد أنك لم تستخدم متغيرًا مكان الدالة."
        ],
        example: `local function hello()
    print("Hello")
end

hello()`
    },
    {
        match: ["remoteevent", "remote event", "remote function"],
        title: "Remote Error",
        explanation: "قد يكون RemoteEvent أو RemoteFunction غير موجود أو استخدامه غير صحيح.",
        solutions: [
            "تأكد من مكان RemoteEvent.",
            "استخدم FireServer من LocalScript.",
            "استخدم OnServerEvent من Script.",
            "لا تستخدم FireServer من السيرفر."
        },
        example: `-- LocalScript
RemoteEvent:FireServer()

-- Server Script
RemoteEvent.OnServerEvent:Connect(function(player)
    print(player.Name)
end)`
    },
    {
        match: ["datastore", "data store", "save", "429"],
        title: "DataStore Error",
        explanation: "مشكلة في حفظ البيانات أو الوصول إلى DataStore.",
        solutions: [
            "فعّل Enable Studio Access to API Services.",
            "تأكد أن اللعبة منشورة.",
            "استخدم pcall.",
            "لا تكرر طلبات الحفظ بشكل مفرط.",
            "راجع حدود DataStore."
        ],
        example: `local success, result = pcall(function()
    return Store:GetAsync(key)
end)

if not success then
    warn(result)
end`
    },
    {
        match: ["permission", "not authorized", "403"],
        title: "Permission Error",
        explanation: "لا توجد صلاحيات للوصول إلى العنصر أو الخدمة.",
        solutions: [
            "تأكد من صلاحيات اللعبة.",
            "راجع إعدادات API.",
            "تأكد من أن السكربت يعمل في المكان المناسب.",
            "راجع إعدادات المجموعة."
        ],
        example: `-- تأكد من تنفيذ عمليات السيرفر
-- داخل Script في ServerScriptService`
    },
    {
        match: ["timeout", "timed out"],
        title: "Timeout",
        explanation: "العملية لم تنته خلال الوقت المحدد.",
        solutions: [
            "راجع الحلقات الطويلة.",
            "تأكد أن الدالة لا تنتظر بلا نهاية.",
            "راجع الاتصالات والأحداث.",
            "قلل العمليات المتكررة."
        ],
        example: `task.wait(1)
print("Finished")`
    }
];

function analyzeError() {
    const input = $("errorInput")?.value?.trim();

    if (!input) {
        toast("اكتب الخطأ أولاً", "error");
        return;
    }

    const lowered = input.toLowerCase();

    const found = ErrorKnowledge.find(item =>
        item.match.some(key => lowered.includes(key))
    );

    let output;

    if (found) {
        output = `
🔍 ${found.title}

📖 شرح الخطأ:
${found.explanation}

🛠️ الحلول المقترحة:
${found.solutions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

💻 مثال:
${found.example}

⚠️ هذا تحليل مبدئي. راجع مكان الخطأ في Output وتأكد من سياق السكربت.
`;
    } else {
        output = `
🔍 تحليل الخطأ:

لم أجد تطابقاً دقيقاً مع قاعدة الأخطاء المحلية.

جرب التالي:
1. اقرأ أول سطر أحمر في Output.
2. راجع رقم السطر المشار إليه.
3. تأكد من أسماء العناصر.
4. تحقق من مكان السكربت.
5. راجع الأقواس والكلمات المحجوزة.
6. تأكد من نوع السكربت Script أو LocalScript.

📌 أرسل رسالة الخطأ كاملة مع السكربت للحصول على تشخيص أدق.
`;
    }

    const result = $("errorResult");

    if (result) {
        result.innerHTML = `<pre>${safeHTML(output)}</pre>`;
    }

    toast("اكتمل تحليل الخطأ");
}

/* ============================================================
   PROJECT MANAGER
============================================================ */

function createProject() {
    const name = $("projectName")?.value?.trim();
    const description = $("projectDescription")?.value?.trim();

    if (!name) {
        toast("اكتب اسم المشروع", "error");
        $("projectName")?.focus();
        return;
    }

    const project = {
        id: randomID(),
        name,
        description: description || "مشروع Roblox جديد",
        date: Date.now(),
        type: "Roblox"
    };

    App.projects.unshift(project);

    writeStorage(GD.storage.projects, App.projects);

    if ($("projectName")) $("projectName").value = "";
    if ($("projectDescription")) $("projectDescription").value = "";

    renderProjects();
    toast("تم إنشاء المشروع بنجاح 🚀");
}

function deleteProject(id) {
    App.projects = App.projects.filter(project => project.id !== id);

    writeStorage(GD.storage.projects, App.projects);

    renderProjects();
    toast("تم حذف المشروع");
}

function renderProjects() {
    const container = $("projectsList");
    const homeContainer = $("recentProjects");

    const count = $("projectCount");
    if (count) count.textContent = App.projects.length;

    if (container) {
        if (!App.projects.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>📁</div>
                    <h3>لا توجد مشاريع بعد</h3>
                    <p>ابدأ بإنشاء أول مشروع لك</p>
                </div>
            `;
        } else {
            container.innerHTML = App.projects.map(project => `
                <article class="project-card">
                    <div class="project-icon">🎮</div>
                    <div class="project-info">
                        <h3>${safeHTML(project.name)}</h3>
                        <p>${safeHTML(project.description)}</p>
                        <small>${formatDate(new Date(project.date))}</small>
                    </div>
                    <button class="project-delete" data-delete-project="${safeHTML(project.id)}">🗑️</button>
                </article>
            `).join("");
        }
    }

    if (homeContainer) {
        homeContainer.innerHTML = App.projects.slice(0, 3).map(project => `
            <div class="recent-project">
                <strong>${safeHTML(project.name)}</strong>
                <span>${safeHTML(project.description)}</span>
            </div>
        `).join("") || `<div class="empty-state">ابدأ مشروعك الأول!</div>`;
    }

    document.querySelectorAll("[data-delete-project]").forEach(button => {
        button.addEventListener("click", () => {
            deleteProject(button.dataset.deleteProject);
        });
    });
}

function initializeProjects() {
    $("createProjectBtn")?.addEventListener("click", createProject);
    renderProjects();
}

/* ============================================================
   SCRIPT LIBRARY
============================================================ */

function initializeLibrary() {
    document.querySelectorAll("[data-library-script]").forEach(button => {
        button.addEventListener("click", () => {
            const type = button.dataset.libraryScript;

            navigate("scripts");

            if ($("scriptCategory")) {
                $("scriptCategory").value = type;
            }

            generateScript();
        });
    });
}

/* ============================================================
   CLIPBOARD
============================================================ */

async function copyText(text) {
    if (!text) {
        toast("لا يوجد شيء لنسخه", "error");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        toast("تم النسخ 📋");
    } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();

        const success = document.execCommand("copy");
        textarea.remove();

        toast(success ? "تم النسخ 📋" : "تعذر النسخ", success ? "success" : "error");
    }
}

/* ============================================================
   RESET
============================================================ */

function resetAllData() {
    const confirmReset = window.confirm(
        "هل أنت متأكد؟ سيتم حذف المشاريع والمحادثات المحفوظة على هذا الجهاز."
    );

    if (!confirmReset) return;

    localStorage.removeItem(GD.storage.projects);
    localStorage.removeItem(GD.storage.chat);

    App.projects = [];
    App.chat = [];

    renderProjects();

    const messages = $("chatMessages");
    if (messages) messages.innerHTML = "";

    toast("تمت إعادة ضبط البيانات");
}

/* ============================================================
   SETTINGS
============================================================ */

function initializeSettings() {
    $("resetData")?.addEventListener("click", resetAllData);
    $("clearChat")?.addEventListener("click", clearChat);
}

/* ============================================================
   KEYBOARD SHORTCUTS
============================================================ */

function initializeKeyboard() {
    document.addEventListener("keydown", event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            navigate("chat");
            $("chatInput")?.focus();
        }

        if (event.key === "Escape") {
            closeSidebar();
        }
    });
}

/* ============================================================
   INITIALIZATION
============================================================ */

function initializeApp() {
    initializeLoading();
    initializeNavigation();
    initializeSidebar();
    initializeTheme();
    initializeChat();
    initializeEditor();
    initializeProjects();
    initializeLibrary();
    initializeSettings();
    initializeKeyboard();

    updateLineNumbers();
    updateEditorStatus();
    renderProjects();

    console.log(
        `%c GAMEDEV AI ${GD.version} %c Ready 🚀`,
        "background:#7c3aed;color:white;padding:5px;border-radius:5px;",
        "color:#22d3ee;font-weight:bold;"
    );
}

document.addEventListener("DOMContentLoaded", initializeApp);

/* ============================================================
   GLOBAL FUNCTIONS
   Used by HTML buttons.
============================================================ */

window.navigate = navigate;
window.openTool = openTool;
window.usePrompt = usePrompt;
window.generateScript = generateScript;
window.copyCode = copyCode;
window.downloadCode = downloadCode;
window.generateIdea = generateIdea;
window.generateGUI = generateGUI;
window.analyzeError = analyzeError;
window.createProject = createProject;
window.deleteProject = deleteProject;
window.toggleTheme = toggleTheme;
window.copyText = copyText;
window.clearChat = clearChat;
window.resetAllData = resetAllData;
window.sendChatMessage = sendChatMessage;
/* =========================================
   GAMEDEV AI — HTML COMPATIBILITY PATCH
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // Mobile menu
    document.getElementById("mobileMenu")
        ?.addEventListener("click", openSidebar);

    // Settings theme button
    document.getElementById("settingsThemeToggle")
        ?.addEventListener("click", toggleTheme);

    // Project counter
    const projectCount = document.getElementById("projectCount");

    if (projectCount) {
        projectCount.textContent = App.projects.length;
    }

    // Chat message counter
    const messageCount = document.getElementById("messageCount");

    if (messageCount) {
        messageCount.textContent = App.chat.length;
    }

});

// Match HTML project button
window.addProject = createProject;

// Match HTML notification element
toast = function (message, type = "success") {
    const box = document.getElementById("toast");
    const text = document.getElementById("toastMessage");

    if (!box || !text) {
        console.log(message);
        return;
    }

    text.textContent = message;
    box.classList.add("show");

    clearTimeout(window.GDToastTimer);

    window.GDToastTimer = setTimeout(() => {
        box.classList.remove("show");
    }, 2600);
};

// Match script categories with generator
const originalGenerateScript = generateScript;

generateScript = function () {
    const select = document.getElementById("scriptCategory");
    if (!select) return;

    const originalValue = select.value;

    const categories = {
        gui: "ui",
        rounds: "round",
        levels: "generic",
        admin: "generic"
    };

    select.value = categories[originalValue] || originalValue;

    originalGenerateScript();

    select.value = originalValue;
};

// Match GUI categories
generateGUI = function () {
    const select = document.getElementById("guiCategory");

    if (!select) return;

    const originalValue = select.value;

    const categories = {
        "Main Menu": "custom",
        "Shop": "shop",
        "Inventory": "inventory",
        "Stats": "hud",
        "Settings": "settings",
        "Admin Panel": "custom",
        "Loading Screen": "loading"
    };

    select.value = categories[originalValue] || "custom";

    const originalDetails = document.getElementById("guiDetails");
    const details = originalDetails?.value || "";

    const plan = GUIPlans[select.value] || GUIPlans.custom;

    const result = document.getElementById("guiResult");

    if (result) {
        result.innerHTML = `<pre>${safeHTML([
            ...plan,
            "",
            "تفاصيل التصميم:",
            details || "لا توجد تفاصيل إضافية."
        ].join("\n"))}</pre>`;
    }

    select.value = originalValue;

    toast("تم إنشاء مخطط الواجهة");
};

console.log("GAMEDEV AI Compatibility Patch Loaded");
/* =====================================================
   GAMEDEV AI — FINAL BUTTONS & FEATURES FIX
   Compatibility + Button Connections
===================================================== */

(function () {
    "use strict";

    /* ---------- TOAST NOTIFICATIONS ---------- */

    toast = function (message, type = "success") {
        const box = document.getElementById("toast");
        const text = document.getElementById("toastMessage");

        if (!box || !text) {
            console.log("[GAMEDEV AI]", message);
            return;
        }

        text.textContent = message;
        box.classList.add("show");

        clearTimeout(window.GDToastTimer);

        window.GDToastTimer = setTimeout(() => {
            box.classList.remove("show");
        }, 2600);
    };


    /* ---------- MOBILE MENU ---------- */

    document.getElementById("mobileMenu")
        ?.addEventListener("click", openSidebar);


    /* ---------- THEME BUTTONS ---------- */

    document.getElementById("settingsThemeToggle")
        ?.addEventListener("click", toggleTheme);


    /* ---------- PROJECT BUTTON ---------- */

    window.addProject = createProject;


    /* ---------- PROJECT DISPLAY ---------- */

    const originalRenderProjects = renderProjects;

    renderProjects = function () {
        originalRenderProjects();

        const home = document.getElementById("homeRecentProjects");

        if (home) {
            if (!App.projects.length) {
                home.innerHTML = `
                    <div class="empty-state">
                        <div>▣</div>
                        <strong>لا توجد مشاريع حتى الآن</strong>
                        <p>أنشئ أول مشروع لك وابدأ رحلتك.</p>
                        <button onclick="openTool('projects')">
                            إنشاء مشروع جديد
                        </button>
                    </div>
                `;
            } else {
                home.innerHTML = App.projects.slice(0, 3).map(project => `
                    <div class="recent-project">
                        <strong>${safeHTML(project.name)}</strong>
                        <span>${safeHTML(project.description)}</span>
                    </div>
                `).join("");
            }
        }

        const counter = document.getElementById("projectCount");

        if (counter) {
            counter.textContent = App.projects.length;
        }
    };


    /* ---------- CHAT COUNTER ---------- */

    function updateChatCounter() {
        const counter = document.getElementById("messageCount");

        if (counter) {
            counter.textContent = App.chat.length;
        }
    }

    const originalSendChat = sendChatMessage;

    sendChatMessage = async function (message) {
        await originalSendChat(message);
        updateChatCounter();
    };

    window.sendChatMessage = sendChatMessage;

    const originalClearChat = clearChat;

    clearChat = function () {
        originalClearChat();
        updateChatCounter();
    };

    window.clearChat = clearChat;


    /* ---------- SCRIPT GENERATOR FIX ---------- */

    ScriptTemplates.levels = `-- GAMEDEV AI | LEVEL SYSTEM

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)

    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local level = Instance.new("IntValue")
    level.Name = "Level"
    level.Value = 1
    level.Parent = leaderstats

    local xp = Instance.new("IntValue")
    xp.Name = "XP"
    xp.Value = 0
    xp.Parent = player

    xp.Changed:Connect(function()

        local neededXP = level.Value * 100

        while xp.Value >= neededXP do
            xp.Value -= neededXP
            level.Value += 1
            neededXP = level.Value * 100
        end

    end)

end)
`;

    ScriptTemplates.admin = `-- GAMEDEV AI | BASIC ADMIN SYSTEM

local Players = game:GetService("Players")

local ADMINS = {
    [123456789] = true
}

Players.PlayerAdded:Connect(function(player)

    player.Chatted:Connect(function(message)

        if not ADMINS[player.UserId] then
            return
        end

        local args = string.split(message, " ")

        if args[1] == "!speed" then

            local speed = tonumber(args[2])

            if speed and player.Character then
                local humanoid =
                    player.Character:FindFirstChildOfClass("Humanoid")

                if humanoid then
                    humanoid.WalkSpeed = math.clamp(speed, 0, 100)
                end
            end

        end

    end)

end)

-- استبدل 123456789 بمعرف حسابك.
`;

    const originalGenerateScript = generateScript;

    generateScript = function () {

        const select = document.getElementById("scriptCategory");

        if (!select) return;

        const oldValue = select.value;

        const mapping = {
            gui: "ui",
            rounds: "round",
            levels: "levels",
            admin: "admin"
        };

        select.value = mapping[oldValue] || oldValue;

        originalGenerateScript();

        select.value = oldValue;
    };

    window.generateScript = generateScript;


    /* ---------- GUI GENERATOR FIX ---------- */

    const originalGenerateGUI = generateGUI;

    generateGUI = function () {

        const select = document.getElementById("guiCategory");

        if (!select) return;

        const oldValue = select.value;

        const mapping = {
            "Main Menu": "custom",
            "Shop": "shop",
            "Inventory": "inventory",
            "Stats": "hud",
            "Settings": "settings",
            "Admin Panel": "custom",
            "Loading Screen": "loading"
        };

        select.value = mapping[oldValue] || "custom";

        originalGenerateGUI();

        select.value = oldValue;
    };

    window.generateGUI = generateGUI;


    /* ---------- IDEA GENERATOR FIX ---------- */

    const originalGenerateIdea = generateIdea;

    generateIdea = function () {

        const select = document.getElementById("ideaCategory");

        if (!select) return;

        const oldValue = select.value;

        const mapping = {
            "عالم مفتوح": "custom",
            "محاكاة واقعية": "simulator",
            "رعب": "horror",
            "مغامرات": "survival",
            "حياة واقعية": "roleplay",
            "تحديات": "obby",
            "قتال": "battleground",
            "اقتصاد": "tycoon",
            "بقاء": "survival"
        };

        select.value = mapping[oldValue] || "custom";

        originalGenerateIdea();

        select.value = oldValue;
    };

    window.generateIdea = generateIdea;


    /* ---------- NOTIFICATION BUTTON ---------- */

    document.querySelector(".notification-btn")
        ?.addEventListener("click", function () {
            toast("لا توجد إشعارات جديدة 🔔");
        });


    /* ---------- INITIAL COUNTERS ---------- */

    document.addEventListener("DOMContentLoaded", function () {

        updateChatCounter();

        const counter = document.getElementById("projectCount");

        if (counter) {
            counter.textContent = App.projects.length;
        }

        renderProjects();

        console.log("GAMEDEV AI — All compatibility fixes loaded.");
    });

})();
/* ============================================
   GAMEDEV AI — BUTTONS MASTER FIX V5
============================================ */

// 1. إضافة المشروع
window.addProject = createProject;


// 2. القائمة الجانبية
document.getElementById("mobileMenu")
    ?.addEventListener("click", openSidebar);


// 3. زر المظهر في الإعدادات
document.getElementById("settingsThemeToggle")
    ?.addEventListener("click", toggleTheme);


// 4. إصلاح الإشعارات
toast = function (message, type = "success") {
    let container = document.getElementById("toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";

        Object.assign(container.style, {
            position: "fixed",
            bottom: "25px",
            left: "25px",
            zIndex: "99999"
        });

        document.body.appendChild(container);
    }

    const item = document.createElement("div");
    item.textContent = message;

    Object.assign(item.style, {
        background: type === "error" ? "#991b1b" : "#25203c",
        color: "#ffffff",
        padding: "14px 22px",
        marginTop: "8px",
        borderRadius: "12px",
        boxShadow: "0 5px 25px #0005",
        fontFamily: "Cairo, sans-serif"
    });

    container.appendChild(item);

    setTimeout(() => item.remove(), 3000);
};


// 5. إضافة قوالب السكربتات الناقصة
ScriptTemplates.levels = `
-- GAMEDEV AI | LEVEL SYSTEM

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)

    local stats = Instance.new("Folder")
    stats.Name = "leaderstats"
    stats.Parent = player

    local level = Instance.new("IntValue")
    level.Name = "Level"
    level.Value = 1
    level.Parent = stats

    local xp = Instance.new("IntValue")
    xp.Name = "XP"
    xp.Value = 0
    xp.Parent = player

    xp.Changed:Connect(function()

        while xp.Value >= level.Value * 100 do
            xp.Value -= level.Value * 100
            level.Value += 1
        end

    end)

end)
`;

ScriptTemplates.admin = `
-- GAMEDEV AI | ADMIN SYSTEM

local Players = game:GetService("Players")

local ADMINS = {
    [123456789] = true
}

Players.PlayerAdded:Connect(function(player)

    player.Chatted:Connect(function(message)

        if not ADMINS[player.UserId] then
            return
        end

        local args = string.split(message, " ")

        if args[1] == "!speed" then

            local speed = tonumber(args[2])

            if speed and player.Character then
                local humanoid =
                    player.Character:FindFirstChildOfClass("Humanoid")

                if humanoid then
                    humanoid.WalkSpeed = math.clamp(speed, 0, 100)
                end
            end

        end

    end)

end)

-- غيّر 123456789 إلى UserId الخاص بك.
`;


// 6. إصلاح تصنيفات مولد السكربتات
const oldGenerateScript = generateScript;

generateScript = function () {

    const select = document.getElementById("scriptCategory");
    if (!select) return;

    const oldValue = select.value;

    const mapping = {
        gui: "ui",
        rounds: "round",
        levels: "levels",
        admin: "admin"
    };

    select.value = mapping[oldValue] || oldValue;

    oldGenerateScript();

    select.value = oldValue;
};

window.generateScript = generateScript;


// 7. إصلاح تصنيفات مصمم الواجهات
const oldGenerateGUI = generateGUI;

generateGUI = function () {

    const select = document.getElementById("guiCategory");
    if (!select) return;

    const oldValue = select.value;

    const mapping = {
        "Main Menu": "custom",
        "Shop": "shop",
        "Inventory": "inventory",
        "Stats": "hud",
        "Settings": "settings",
        "Admin Panel": "custom",
        "Loading Screen": "loading"
    };

    select.value = mapping[oldValue] || "custom";

    oldGenerateGUI();

    select.value = oldValue;
};

window.generateGUI = generateGUI;


// 8. إصلاح تصنيفات مولد الأفكار
const oldGenerateIdea = generateIdea;

generateIdea = function () {

    const select = document.getElementById("ideaCategory");
    if (!select) return;

    const oldValue = select.value;

    const mapping = {
        "عالم مفتوح": "custom",
        "محاكاة واقعية": "simulator",
        "رعب": "horror",
        "مغامرات": "survival",
        "حياة واقعية": "roleplay",
        "تحديات": "obby",
        "قتال": "battleground",
        "اقتصاد": "tycoon",
        "بقاء": "survival"
    };

    select.value = mapping[oldValue] || "custom";

    oldGenerateIdea();

    select.value = oldValue;
};

window.generateIdea = generateIdea;


// 9. تحديث عداد المحادثات
const oldSendChat = sendChatMessage;

sendChatMessage = async function (message) {
    await oldSendChat(message);

    const counter = document.getElementById("messageCount");

    if (counter) {
        counter.textContent = App.chat.length;
    }
};

window.sendChatMessage = sendChatMessage;


// 10. تحديث عداد المشاريع
const oldRenderProjects = renderProjects;

renderProjects = function () {
    oldRenderProjects();

    const counter = document.getElementById("projectCount");

    if (counter) {
        counter.textContent = App.projects.length;
    }
};


// 11. إصلاح زر الإشعارات
document.querySelector(".notification-btn")
    ?.addEventListener("click", function () {
        toast("لا توجد إشعارات جديدة 🔔");
    });


console.log("GAMEDEV AI V5 — BUTTONS FIXED");
/* =========================================
   GAMEDEV AI — BUTTON SYSTEM V1
   نظام ربط الأزرار الأساسي
========================================= */

(function () {
    "use strict";

    // منع تكرار تشغيل النظام
    if (window.GAMEDEV_BUTTONS_V1) return;
    window.GAMEDEV_BUTTONS_V1 = true;

    // الإشعارات
    window.toast = function (message, type = "success") {
        const box = document.getElementById("toast");
        const text = document.getElementById("toastMessage");

        if (box && text) {
            text.textContent = message;
            box.classList.add("show");

            clearTimeout(window.GDToastTimer);

            window.GDToastTimer = setTimeout(() => {
                box.classList.remove("show");
            }, 2800);

            return;
        }

        console.log("[GAMEDEV AI]", message);
    };

    // زر القائمة الجانبية
    const mobileMenu = document.getElementById("mobileMenu");

    if (mobileMenu && typeof window.openSidebar === "function") {
        mobileMenu.addEventListener("click", window.openSidebar);
    }

    // زر إغلاق القائمة
    const sidebarClose = document.getElementById("sidebarClose");

    if (sidebarClose && typeof window.closeSidebar === "function") {
        sidebarClose.addEventListener("click", window.closeSidebar);
    }

    // زر المظهر في الإعدادات
    const settingsTheme = document.getElementById("settingsThemeToggle");

    if (settingsTheme && typeof window.toggleTheme === "function") {
        settingsTheme.addEventListener("click", window.toggleTheme);
    }

    // تحديث العدادات
    function updateCounters() {
        const projects = document.getElementById("projectCount");
        const messages = document.getElementById("messageCount");

        if (projects && window.App?.projects) {
            projects.textContent = window.App.projects.length;
        }

        if (messages && window.App?.chat) {
            messages.textContent = window.App.chat.length;
        }
    }

    // تشغيل بعد تحميل الصفحة
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", updateCounters);
    } else {
        updateCounters();
    }

    console.log("GAMEDEV AI BUTTON SYSTEM V1 LOADED");
})();
/* =========================================
   GAMEDEV AI — NAVIGATION SYSTEM V2
   نظام التنقل بين الصفحات
========================================= */

(function () {
    "use strict";

    if (window.GAMEDEV_NAV_V2) return;
    window.GAMEDEV_NAV_V2 = true;

    document.addEventListener("click", function (event) {

        const button = event.target.closest(".nav-item[data-page]");

        if (!button) return;

        const page = button.getAttribute("data-page");

        if (!page) return;

        // منع السلوك الافتراضي
        event.preventDefault();

        // الانتقال إلى الصفحة
        if (typeof window.navigate === "function") {
            window.navigate(page);
        } else {
            console.error("GAMEDEV AI: navigate function not found");
        }

        // إغلاق القائمة الجانبية
        if (typeof window.closeSidebar === "function") {
            window.closeSidebar();
        }

    }, true);

    // أزرار الانتقال السريع
    document.addEventListener("click", function (event) {

        const button = event.target.closest("[data-open-page]");

        if (!button) return;

        const page = button.dataset.openPage;

        if (page && typeof window.navigate === "function") {
            window.navigate(page);
        }

    });

    console.log("GAMEDEV AI NAVIGATION V2 LOADED");

})();
/* =====================================================
   GAMEDEV AI — UNIVERSAL BUTTON FIX
   إصلاح شامل للأزرار والتفاعلات
===================================================== */

(function () {
    "use strict";

    if (window.GD_UNIVERSAL_FIX) return;
    window.GD_UNIVERSAL_FIX = true;

    /* ---------- NOTIFICATIONS ---------- */

    window.toast = function (message, type = "success") {
        let toastBox = document.getElementById("toast");

        if (!toastBox) {
            toastBox = document.createElement("div");
            toastBox.id = "toast";

            Object.assign(toastBox.style, {
                position: "fixed",
                bottom: "25px",
                right: "25px",
                zIndex: "999999",
                padding: "15px 22px",
                borderRadius: "14px",
                background: "#181827",
                color: "#ffffff",
                boxShadow: "0 0 25px #7c3aed55",
                display: "none"
            });

            document.body.appendChild(toastBox);
        }

        toastBox.textContent = message;
        toastBox.style.display = "block";
        toastBox.style.border = type === "error"
            ? "1px solid #ef4444"
            : "1px solid #8b5cf6";

        clearTimeout(window.GDToastTimeout);

        window.GDToastTimeout = setTimeout(() => {
            toastBox.style.display = "none";
        }, 3000);
    };


    /* ---------- SAFE CLICK HANDLER ---------- */

    function bind(id, callback) {
        const element = document.getElementById(id);

        if (!element || element.dataset.gdBound) return;

        element.dataset.gdBound = "true";

        element.addEventListener("click", function (event) {
            try {
                callback(event);
            } catch (error) {
                console.error("Button error:", id, error);
                toast("حدث خطأ أثناء تشغيل الزر", "error");
            }
        });
    }


    /* ---------- NAVIGATION ---------- */

    document.addEventListener("click", function (event) {
        const item = event.target.closest(".nav-item[data-page]");

        if (!item) return;

        const page = item.dataset.page;

        if (page && typeof window.navigate === "function") {
            window.navigate(page);
        }

        if (typeof window.closeSidebar === "function") {
            window.closeSidebar();
        }
    });


    /* ---------- MOBILE MENU ---------- */

    bind("mobileMenu", function () {
        if (typeof window.openSidebar === "function") {
            window.openSidebar();
        }
    });

    bind("sidebarClose", function () {
        if (typeof window.closeSidebar === "function") {
            window.closeSidebar();
        }
    });


    /* ---------- THEME ---------- */

    bind("settingsThemeToggle", function () {
        if (typeof window.toggleTheme === "function") {
            window.toggleTheme();
        }
    });


    /* ---------- ADD PROJECT ---------- */

    window.addProject = function () {
        if (typeof window.createProject === "function") {
            window.createProject();
        } else {
            toast("نظام المشاريع غير جاهز", "error");
        }
    };


    /* ---------- CLEAR CHAT ---------- */

    bind("clearChat", function () {
        if (typeof window.clearChat === "function") {
            window.clearChat();
        }
    });


    /* ---------- COPY CODE ---------- */

    bind("copyCode", function () {
        if (typeof window.copyCode === "function") {
            window.copyCode();
        }
    });


    /* ---------- DOWNLOAD CODE ---------- */

    bind("downloadCode", function () {
        if (typeof window.downloadCode === "function") {
            window.downloadCode();
        }
    });


    /* ---------- GENERATE SCRIPT ---------- */

    bind("generateScriptBtn", function () {
        if (typeof window.generateScript === "function") {
            window.generateScript();
        }
    });


    /* ---------- GENERATE IDEA ---------- */

    bind("generateIdeaBtn", function () {
        if (typeof window.generateIdea === "function") {
            window.generateIdea();
        }
    });


    /* ---------- GENERATE GUI ---------- */

    bind("generateGUIBtn", function () {
        if (typeof window.generateGUI === "function") {
            window.generateGUI();
        }
    });


    /* ---------- ANALYZE ERROR ---------- */

    bind("analyzeErrorBtn", function () {
        if (typeof window.analyzeError === "function") {
            window.analyzeError();
        }
    });


    /* ---------- RESET ---------- */

    bind("resetAllData", function () {
        if (typeof window.resetAllData === "function") {
            window.resetAllData();
        }
    });


    /* ---------- COUNTERS ---------- */

    function updateCounters() {
        if (!window.App) return;

        const projects = document.getElementById("projectCount");
        const messages = document.getElementById("messageCount");

        if (projects && Array.isArray(App.projects)) {
            projects.textContent = App.projects.length;
        }

        if (messages && Array.isArray(App.chat)) {
            messages.textContent = App.chat.length;
        }
    }


    /* ---------- START ---------- */

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", updateCounters);
    } else {
        updateCounters();
    }

    console.log("GAMEDEV AI UNIVERSAL FIX LOADED");

})();

document.addEventListener("DOMContentLoaded", function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
    };

    /* ---------- 1. DAY / NIGHT MODE ---------- */
    const root = document.documentElement;
    const toggle = $("#themeToggle");
    function applyTheme(theme) {
        const night = theme === "dark";
        root.setAttribute("data-bs-theme", theme);
        document.body.classList.toggle("dark-mode", night);
        if (!toggle) return;
        $(".theme-toggle-icon", toggle).innerHTML = night ? "&#9728;" : "&#9790;";
        $(".theme-toggle-text", toggle).textContent = night ? "Light" : "Dark";
        toggle.setAttribute("aria-pressed", String(night));
        toggle.setAttribute("aria-label", night ? "Switch to light mode" : "Switch to dark mode");
    }
    let theme = store.get("theme");
    if (theme !== "dark" && theme !== "light") {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    applyTheme(theme);
    if (toggle) {
        toggle.addEventListener("click", function () {
            theme = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
            applyTheme(theme);
            store.set("theme", theme);
        });
    }

    const year = $("#currentYear");
    if (year) year.textContent = new Date().getFullYear();

    /* ---------- DATA (JSON-style) ---------- */
    const DESTINATIONS = [
        {
                "title": "Maletsunyane Falls",
                "cat": "Nature",
                "img": "destination-maletsunyane.jpg",
                "alt": "Maletsunyane Falls dropping into a green gorge",
                "text": "A tall waterfall surrounded by the dramatic scenery near Semonkong.",
                "badge": "Popular"
        },
        {
                "title": "Katse Dam",
                "cat": "Nature",
                "img": "destination-katse.jpg",
                "alt": "Katse Dam and its spillway among the mountains",
                "text": "A large dam in the Maloti highlands with impressive views."
        },
        {
                "title": "Mohale Dam",
                "cat": "Nature",
                "img": "destination-mohale.jpg",
                "alt": "Mohale Dam reservoir under a blue sky",
                "text": "Calm blue water surrounded by open mountain country."
        },
        {
                "title": "Sani Pass",
                "cat": "Adventure",
                "img": "destination-sani-pass.jpg",
                "alt": "The winding Sani Pass road in the mountains",
                "text": "A famous winding mountain road for adventurous travellers."
        },
        {
                "title": "Afriski",
                "cat": "Adventure",
                "img": "destination-afriski.jpg",
                "alt": "Snow-covered slopes at Afriski mountain resort",
                "text": "A high mountain resort known for snow and winter fun."
        },
        {
                "title": "Bokong",
                "cat": "Nature",
                "img": "destination-bokong.jpg",
                "alt": "The Bokong viewpoint above a misty mountain valley",
                "text": "A high-altitude nature area with wide valley views."
        },
        {
                "title": "Sehlabathebe",
                "cat": "Adventure",
                "img": "destination-sehlabathebe.jpg",
                "alt": "Still water reflecting the sky at Sehlabathebe",
                "text": "A quiet, remote area that suits hikers and nature lovers."
        },
        {
                "title": "Thaba-Bosiu",
                "cat": "Culture",
                "img": "destination-thaba-bosiu.jpg",
                "alt": "Thaba-Bosiu flat-topped mountain in the countryside",
                "text": "A historic mountain linked to the story of the Basotho nation."
        }
];

    /* ---------- 2 + 3 + 4. SEARCH, FILTER, DYNAMIC CARDS, PAGINATION ---------- */
    const search = $("#destinationSearch");
    const message = $("#searchMessage");
    const grid = $("#destinationGrid");
    let category = "All", query = "", page = 1;
    const PAGE_SIZE = 6;

    function say(count) {
        if (!message) return;
        message.textContent = (query || category !== "All")
            ? (count ? count + (count === 1 ? " destination found." : " destinations found.")
                     : "No destinations found. Try another word or category.")
            : "";
    }

    function renderDestinations() {
        const list = DESTINATIONS.filter(d =>
            (category === "All" || d.cat === category) &&
            (d.title + " " + d.cat + " " + d.text).toLowerCase().includes(query));
        const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
        page = Math.min(page, pages);
        const shown = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

        grid.innerHTML = shown.map(d => `
            <div class="col-12 col-sm-6 col-xl-4">
              <article class="destination-card h-100">
                <div class="destination-image-wrap">
                  <img src="images/${d.img}" class="destination-image" alt="${d.alt}" loading="lazy">
                </div>
                <div class="destination-content">
                  <h3>${d.title} ${d.badge ? '<span class="badge badge-gold">' + d.badge + "</span>" : ""}</h3>
                  <p>${d.text}</p>
                  <a href="gallery.html" class="btn btn-primary">See Photos</a>
                </div>
              </article>
            </div>`).join("");

        const pg = $("#destPagination");
        if (pg) {
            pg.innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) =>
                `<li class="page-item${i + 1 === page ? " active" : ""}">
                   <a class="page-link" href="#" data-page="${i + 1}"${i + 1 === page ? ' aria-current="page"' : ""}>${i + 1}</a>
                 </li>`).join("") : "";
        }
        say(list.length);
    }

    function filterStatic() {
        // Index cards and gallery items
        let visible = 0;
        $$(".destination-item").forEach(item => {
            const hay = ((item.dataset.search || "") + " " + item.textContent).toLowerCase();
            const show = query === "" || hay.includes(query);
            item.classList.toggle("d-none", !show);
            if (show) visible++;
        });
        $$("[data-category]").forEach(el => {
            el.classList.toggle("d-none", category !== "All" && el.dataset.category !== category);
        });
        say(visible);
    }

    if (grid) renderDestinations();
    if (search) {
        search.addEventListener("input", function () {
            query = search.value.trim().toLowerCase();
            page = 1;
            grid ? renderDestinations() : filterStatic();
        });
    }
    $$(".filter-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            $$(".filter-btn").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
            btn.classList.add("active");
            btn.setAttribute("aria-pressed", "true");
            category = btn.dataset.filter;
            page = 1;
            grid ? renderDestinations() : filterStatic();
        });
    });
    const pager = $("#destPagination");
    if (pager) {
        pager.addEventListener("click", function (e) {
            const link = e.target.closest("[data-page]");
            if (!link) return;
            e.preventDefault();
            page = Number(link.dataset.page);
            renderDestinations();
        });
    }

    /* ---------- 6. GALLERY LIGHTBOX ---------- */
    const lightbox = $("#lightbox");
    if (lightbox && window.bootstrap) {
        const modal = new bootstrap.Modal(lightbox);
        const buttons = $$(".gallery-item");
        let index = 0;
        const visible = () => buttons.filter(b => !b.closest("[data-category]").classList.contains("d-none"));
        function show(n) {
            const list = visible();
            index = (n + list.length) % list.length;
            const img = $("img", list[index]);
            $("#lightboxImg").src = img.src;
            $("#lightboxImg").alt = img.alt;
            $("#lightboxCaption").textContent = img.alt;
        }
        buttons.forEach(b => b.addEventListener("click", () => { show(visible().indexOf(b)); modal.show(); }));
        $("#lightboxPrev").addEventListener("click", () => show(index - 1));
        $("#lightboxNext").addEventListener("click", () => show(index + 1));
        lightbox.addEventListener("keydown", e => {
            if (e.key === "ArrowLeft") show(index - 1);
            if (e.key === "ArrowRight") show(index + 1);
        });
    }

    /* ---------- 7. BOOKING COST CALCULATOR (sample prices) ---------- */
    const cost = $("#costSummary");
    let updateCost = () => {};
    if (cost) {
        const PRICES = { "Maletsunyane Falls": 850, "Maloti Mountains": 700, "Basotho Culture": 500, "Katse Dam": 900, "Other": 600 };
        const dest = $("#preferredDestination"), guests = $("#guests"), nights = $("#nights");
        updateCost = function () {
            const p = PRICES[dest.value], g = Number(guests.value), n = Number(nights.value);
            cost.textContent = p && g > 0 && n > 0
                ? "Estimated cost: M" + (p * g * n).toLocaleString() + " (M" + p + " per person per night, sample rate)"
                : "Choose a destination, guests and nights to see an estimate.";
        };
        [dest, guests, nights].forEach(el => el.addEventListener("input", updateCost));
        updateCost();
    }

    /* ---------- 5. FORM VALIDATION ---------- */
    const today = new Date();
    const iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    $$('input[type="date"]').forEach(d => { d.min = iso; });

    function check(f) {
        const v = f.value.trim();
        if (f.required && !v) return "This field is required.";
        if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email, for example name@example.com.";
        if (f.type === "tel" && v && !/^\+?[0-9\s-]{7,15}$/.test(v)) return "Enter a valid phone number (7 to 15 digits).";
        if (f.dataset.min && v && v.length < Number(f.dataset.min)) return "Enter at least " + f.dataset.min + " characters.";
        if (f.type === "date" && v && f.min && v < f.min) return "Choose today or a future date.";
        if (f.type === "number" && v && (Number(v) < Number(f.min) || Number(v) > Number(f.max))) return "Enter a number from " + f.min + " to " + f.max + ".";
        return "";
    }
    function mark(f) {
        const msg = check(f);
        f.classList.toggle("is-invalid", Boolean(msg));
        f.classList.toggle("is-valid", !msg && f.value.trim() !== "");
        let fb = f.parentElement.querySelector(".invalid-feedback");
        if (!fb) { fb = document.createElement("div"); fb.className = "invalid-feedback"; f.after(fb); }
        fb.textContent = msg;
        return !msg;
    }

    $$("form[data-validate]").forEach(form => {
        form.noValidate = true;
        const fields = $$("input, select, textarea", form);
        const status = $(".form-status", form);
        fields.forEach(f => f.addEventListener("blur", () => mark(f)));
        form.addEventListener("reset", () => setTimeout(() => {
            fields.forEach(f => f.classList.remove("is-valid", "is-invalid"));
            updateCost();
        }));

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            const ok = fields.map(mark).every(Boolean);
            if (!ok) {
                status.className = "form-status alert alert-danger mt-3";
                status.textContent = "Please fix the highlighted fields and try again.";
                fields.find(f => f.classList.contains("is-invalid")).focus();
                return;
            }
            const nameField = fields.find(f => /name/i.test(f.id));
            const name = nameField ? nameField.value.trim() : "friend";
            store.set("visitorName", name);
            const text = "Thank you, " + name + ". Your " + (form.id === "bookingForm" ? "enquiry" : "message") +
                " is ready. This is a demonstration form, so nothing was sent.";
            status.className = "form-status alert alert-success mt-3";
            status.textContent = text;
            if (form.id === "bookingForm" && window.bootstrap) {
                $("#successText").textContent = text + " " + cost.textContent;
                bootstrap.Modal.getOrCreateInstance($("#successModal")).show();
            }
            form.reset();
        });
    });

    /* ---------- 8. SAVED VISITOR NAME (localStorage) ---------- */
    const saved = store.get("visitorName");
    if (saved) {
        const welcome = $("#welcomeBack");
        if (welcome) welcome.textContent = "Welcome back, " + saved + "!";
        $$("#visitorName, #contactName").forEach(f => { f.value = saved; });
    }

    /* ---------- 9. INTERACTIVE NAVIGATION + BACK TO TOP ---------- */
    $$("#mainNavigation .nav-link:not(.dropdown-toggle), #mainNavigation .dropdown-item").forEach(link => {
        link.addEventListener("click", () => {
            const menu = $("#mainNavigation");
            if (menu && menu.classList.contains("show") && window.bootstrap) {
                bootstrap.Collapse.getOrCreateInstance(menu).hide();
            }
        });
    });
    const topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "back-to-top";
    topBtn.setAttribute("aria-label", "Back to top");
    topBtn.innerHTML = "&#8593;";
    document.body.appendChild(topBtn);
    window.addEventListener("scroll", () => topBtn.classList.toggle("show", window.scrollY > 400));
    topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
});
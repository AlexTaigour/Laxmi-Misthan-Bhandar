
(function () {
    var basket = {}; // name -> qty
    var fabCount = document.getElementById('fabCount');
    var fabButton = document.getElementById('fabBtn');
    var menuToggle = document.getElementById('menuToggle');
    var mobileMenu = document.getElementById('mainNav');
    var drawer = document.getElementById('drawer');
    var scrim = document.getElementById('scrim');
    var drawerBody = document.getElementById('drawerBody');
    var formBasketBox = document.getElementById('formBasketBox');
    var toast = document.getElementById('toast');
    var toastTimer = null;
    var scrollCue = document.querySelector('.scroll-cue');
    var pageSections = Array.prototype.slice.call(document.querySelectorAll('main > section.block[id]'));

    function updateScrollCue() {
        var header = document.querySelector('header.site');
        var scrollPadding = parseFloat(window.getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        var sectionOffset = window.scrollY + Math.max(header.getBoundingClientRect().height, scrollPadding) + 1;
        var currentIndex = -1;
        pageSections.forEach(function (section, index) {
            if (section.getBoundingClientRect().top + window.scrollY <= sectionOffset) currentIndex = index;
        });
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) currentIndex = pageSections.length - 1;
        var isLastSection = currentIndex === pageSections.length - 1;
        var nextSection = isLastSection ? document.getElementById('top') : pageSections[currentIndex + 1];
        scrollCue.href = '#' + nextSection.id;
        scrollCue.setAttribute('aria-label', isLastSection ? 'Return to the top of the page' : 'Scroll to the ' + (nextSection.id === 'enquire' ? 'order and enquiry' : nextSection.id) + ' section');
        scrollCue.classList.toggle('scroll-cue--top', isLastSection);
    }

    window.addEventListener('scroll', updateScrollCue, { passive: true });
    window.addEventListener('resize', updateScrollCue);
    updateScrollCue();

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    }
    function totalQty() {
        var t = 0; for (var k in basket) t += basket[k]; return t;
    }
    function render() {
        var count = totalQty();
        fabCount.textContent = count;
        fabButton.setAttribute('aria-label', 'Open enquiry list, ' + count + (count === 1 ? ' item' : ' items'));
        var keys = Object.keys(basket);
        if (!keys.length) {
            drawerBody.innerHTML = '<p style="color:var(--muted)">Your enquiry list is empty. Add sweets, dishes or gift boxes from the catalogue above.</p>';
            formBasketBox.innerHTML = '<span class="basket-empty">Nothing added yet — tap “Add to enquiry” on the items above, or just describe what you need below.</span>';
            return;
        }
        var html = '';
        keys.forEach(function (name) {
            html += '<div class="qty-row"><div style="flex:1;min-width:0"><b style="font-size:.94rem">' + name + '</b></div>' +
                '<div class="qty-ctrl"><button type="button" data-dec="' + encodeURIComponent(name) + '" aria-label="Decrease quantity">−</button><span>' + basket[name] + '</span><button type="button" data-inc="' + encodeURIComponent(name) + '" aria-label="Increase quantity">+</button></div></div>';
        });
        drawerBody.innerHTML = html;
        var list = '<ul>';
        keys.forEach(function (name) { list += '<li><span>' + name + '</span><b>× ' + basket[name] + '</b></li>'; });
        list += '</ul>';
        formBasketBox.innerHTML = list;
    }
    document.addEventListener('click', function (e) {
        var add = e.target.closest('[data-add]');
        if (add) {
            var name = add.getAttribute('data-add');
            basket[name] = (basket[name] || 0) + 1;
            render();
            add.classList.add('added');
            var old = add.textContent;
            add.textContent = '✓ Added';
            setTimeout(function () { add.textContent = old; add.classList.remove('added'); }, 1400);
            showToast('Added to your enquiry list');
            return;
        }
        var inc = e.target.closest('[data-inc]');
        if (inc) { basket[decodeURIComponent(inc.getAttribute('data-inc'))]++; render(); return; }
        var dec = e.target.closest('[data-dec]');
        if (dec) {
            var n = decodeURIComponent(dec.getAttribute('data-dec'));
            basket[n]--; if (basket[n] <= 0) delete basket[n];
            render(); return;
        }
    });

    function openDrawer() {
        closeMobileMenu();
        drawer.hidden = false;
        void drawer.offsetWidth; /* reflow so the slide-in transition runs */
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        scrim.classList.add('open');
        scrim.setAttribute('aria-hidden', 'false');
        fabButton.setAttribute('aria-expanded', 'true');
        document.body.classList.add('drawer-open');
        document.getElementById('drawerClose').focus();
    }
    function closeDrawer(restoreFocus) {
        if (!drawer.classList.contains('open')) return;
        drawer.classList.remove('open'); scrim.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        scrim.setAttribute('aria-hidden', 'true');
        fabButton.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('drawer-open');
        if (restoreFocus !== false) fabButton.focus();
        setTimeout(function () { if (!drawer.classList.contains('open')) drawer.hidden = true; }, 260);
    }
    fabButton.addEventListener('click', openDrawer);
    document.getElementById('drawerClose').addEventListener('click', closeDrawer);
    scrim.addEventListener('click', closeDrawer);
    document.getElementById('drawerGo').addEventListener('click', function () {
        closeDrawer(false);
        document.getElementById('fName').focus();
    });
    function closeMobileMenu() {
        mobileMenu.hidden = true;
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation menu');
    }
    menuToggle.addEventListener('click', function () {
        var isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenu.hidden = isOpen;
        menuToggle.setAttribute('aria-expanded', String(!isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
    });
    mobileMenu.addEventListener('click', function (e) {
        if (e.target.closest('a')) closeMobileMenu();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (drawer.classList.contains('open')) closeDrawer();
            else if (menuToggle.getAttribute('aria-expanded') === 'true') {
                closeMobileMenu();
                menuToggle.focus();
            }
            return;
        }
        if (e.key !== 'Tab' || !drawer.classList.contains('open')) return;
        var focusable = drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    render();

    // Enquiry form — prepares an on-page summary only; nothing is sent or saved.
    document.getElementById('enquiryForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var name = document.getElementById('fName').value.trim();
        var phone = document.getElementById('fPhone').value.trim();
        if (!name || !phone) {
            showToast('Please add your name and phone number');
            (!name ? document.getElementById('fName') : document.getElementById('fPhone')).focus();
            return;
        }
        var type = document.getElementById('fType').value;
        var date = document.getElementById('fDate').value;
        var msg = document.getElementById('fMsg').value.trim();
        var keys = Object.keys(basket);
        var lines = [];
        lines.push('Namaste, I am ' + name + ' (' + phone + ').');
        lines.push('Enquiry: ' + type + (date ? ' · Needed by: ' + date : ''));
        if (keys.length) {
            lines.push('Items:');
            keys.forEach(function (n) { lines.push('  • ' + n + ' × ' + basket[n]); });
        } else {
            lines.push('Items: (none picked — I will describe them on the call)');
        }
        if (msg) lines.push('Note: ' + msg);
        lines.push('Please confirm availability and the actual price. Dhanyabad!');
        document.getElementById('resultText').textContent = lines.join('\n');
        var result = document.getElementById('formResult');
        result.classList.add('show');
        result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
})();
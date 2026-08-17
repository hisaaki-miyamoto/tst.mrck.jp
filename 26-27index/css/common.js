/* ============================================================================
   株式会社丸近　公式サイト　全ページ共通スクリプト
   クリエイターモード ＞ 全ページ共通 ＞ JavaScript に貼り付けてください。

   次の機能が入っています。どれも対象が無いページでは何もしないので、
   全ページに読み込ませて問題ありません。
     1. 上へ戻るボタン／スクロール時のヘッダー変化
     2. スクロールに合わせて要素をふわりと表示
     3. メインビジュアルの自動切り替え（TOPのみ）
     4. ヘッダー「商品を探す」のカテゴリーメニュー開閉
     5. 今いるカテゴリーのリンクに色を付ける
     6. 商品詳細の数量の増減ボタン
     7. 商品詳細の写真の切り替え（サムネイル）
     8. カートの数量の増減ボタン（明細の行ごと）
     9. お知らせ本文の行送りをそろえる
    10. レビューが1件も無いときに「お客様の声」を見出しごと隠す
    11. お知らせのタイトル先頭【　】を色付きカテゴリーラベルにする
   ============================================================================ */

/* 1. 上へ戻るボタン ＋ ヘッダーの背景切り替え */
(function () {
  var btn = document.getElementById('toTop');
  var hdr = document.querySelector('header');
  function onScroll() {
    var y = window.pageYOffset;
    if (btn) { if (y > 400) { btn.classList.add('show'); } else { btn.classList.remove('show'); } }
    if (hdr) { if (y > 40) { hdr.classList.add('scrolled'); } else { hdr.classList.remove('scrolled'); } }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (!btn) return;
  btn.addEventListener('click', function () {
    var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
})();

/* 2. スクロールで要素をふわりと表示 */
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) {
      if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); }
    });
  }, { threshold: .14 });
  els.forEach(function (e) { io.observe(e); });
})();

/* 3. メインビジュアルの自動切り替え（TOPのみ動作）
      写真の切り替えと、左下の説明の入れ替えを揃える。
      PCで動画が流れているときは、動画のシーンの変わり目に合わせる。
      動画が無い（スマホ）／動画が再生できないときは、5秒ごとに切り替える。 */
(function () {
  var slides = document.querySelectorAll('#heroSlides .slide');
  var leads  = document.querySelectorAll('#heroLeads .lead');
  if (slides.length < 2 && leads.length < 2) return;

  var CUTS = [0, 5.0, 9.5];   // 動画のシーンの変わり目（秒）
  var cur = 0;

  function show(n) {
    if (n === cur) return;
    if (slides[cur]) slides[cur].classList.remove('active');
    if (leads[cur])  leads[cur].classList.remove('active');
    cur = n;
    if (slides[cur]) slides[cur].classList.add('active');
    if (leads[cur])  leads[cur].classList.add('active');
  }

  var timer = setInterval(function () {
    show((cur + 1) % Math.max(slides.length, leads.length));
  }, 5000);

  var movie = document.querySelector('.hero .movie');
  if (!movie) return;

  /* 動画が実際に流れ始めたときだけ、動画の時間に合わせる方式へ切り替える。
     読み込みに失敗した場合は上の5秒ごとの切り替えがそのまま続くので、
     どちらに転んでも説明が止まったままにはならない。 */
  movie.addEventListener('playing', function () {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    movie.addEventListener('timeupdate', function () {
      var t = movie.currentTime, n = 0, k;
      for (k = 0; k < CUTS.length; k++) { if (t >= CUTS[k]) n = k; }
      show(n);
    });
  });
})();

/* 4. ヘッダー「商品を探す」のカテゴリーメニュー
      マウスはCSSのホバーで開く。タッチ端末とクリック操作のためにJSでも開閉する。 */
(function () {
  var wrap = document.querySelector('nav.main .has-drop');
  if (!wrap) return;
  var trigger = wrap.querySelector('a');
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  function setOpen(v) {
    wrap.classList.toggle('open', v);
    trigger.setAttribute('aria-expanded', v ? 'true' : 'false');
  }
  trigger.addEventListener('click', function (e) {
    e.preventDefault();
    setOpen(!wrap.classList.contains('open'));
  });
  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();

/* 5. カテゴリー切替ナビ／ヘッダーのメニューで、今いるカテゴリーに色を付ける
      テンプレートの条件分岐に頼らず、URLを見て判定するので確実に動く。 */
(function () {
  var here = decodeURIComponent(location.pathname).replace(/\/$/, '');
  var links = document.querySelectorAll('.catnav a, nav.main .drop a');
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute('href') || '';
    var path = decodeURIComponent(href.split('?')[0]).replace(/\/$/, '');
    if (path && path === here) {
      links[i].classList.add('on');
    }
  }
})();

/* 6. 商品詳細の数量の増減ボタン
      入力欄そのものはMakeShopが使うので、値だけを書き換える。 */
(function () {
  var box = document.querySelector('.pd-buy .qty');
  if (!box) return;
  var input = box.querySelector('input');
  if (!input) return;
  function step(d) {
    var min = parseInt(input.getAttribute('min'), 10);
    if (isNaN(min) || min < 1) { min = 1; }
    var v = parseInt(input.value, 10);
    if (isNaN(v)) { v = min; }
    v += d;
    if (v < min) { v = min; }
    input.value = v;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  var minus = box.querySelector('.qty-minus');
  var plus = box.querySelector('.qty-plus');
  if (minus) { minus.addEventListener('click', function () { step(-1); }); }
  if (plus) { plus.addEventListener('click', function () { step(1); }); }
})();

/* 7. 商品詳細の写真の切り替え（サムネイルをクリックでメイン写真を差し替え） */
(function () {
  var thumbs = document.getElementById('pdThumbs');
  var main = document.getElementById('pdMain');
  if (!thumbs || !main) return;
  thumbs.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.thumb') : null;
    if (!btn) return;
    var full = btn.getAttribute('data-full');
    if (!full) return;
    main.src = full;
    var all = thumbs.querySelectorAll('.thumb');
    for (var i = 0; i < all.length; i++) { all[i].classList.remove('on'); }
    btn.classList.add('on');
  });
})();

/* 8. カートの数量の増減ボタン
      商品詳細と違って明細の行数だけ存在するので、クリックを親でまとめて拾う。
      数量を変えただけでは金額は変わらない（MakeShopの仕様）ので、
      「数量を更新」リンクを押していただく必要がある。 */
(function () {
  var list = document.querySelector('.cart-list');
  if (!list) return;
  list.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.minus,.plus') : null;
    if (!btn) return;
    var box = btn.closest('.stepper');
    var input = box ? box.querySelector('input') : null;
    if (!input) return;
    var n = parseInt(input.value, 10);
    if (isNaN(n)) { n = 1; }
    n += btn.classList.contains('plus') ? 1 : -1;
    if (n < 1) { n = 1; }
    input.value = n;
  });
})();

/* 9. お知らせ本文の行送りをそろえる
      管理画面のお知らせは、行末に <br> があるものと、素の改行だけのものが
      混在している（現行サイトの10件中 6件が<br>／3件が素の改行／1件が混在）。
      CSSを white-space:pre-line にして素の改行も行にしているため、
      「<br> ＋ 改行」の行だけ2行分空いてしまう。
      そこで <br> の直後の改行1つを取り除いて相殺する。
      このJSが動かなくても、行間が広くなるだけで文章は崩れない。 */
(function () {
  var body = document.querySelector('.news-body');
  if (!body) return;
  var brs = body.querySelectorAll('br');
  for (var i = 0; i < brs.length; i++) {
    var next = brs[i].nextSibling;
    if (next && next.nodeType === 3 && next.nodeValue.charAt(0) === '\n') {
      next.nodeValue = next.nodeValue.slice(1);
    }
  }
})();

/* 10. レビューが1件も無いときは「お客様の声」を見出しごと出さない
       レビューはMakeShopの新レビュー機能のウィジェットが後から描画する。
       1件も無い商品では見出しだけが残って間延びしてしまう。

       そこで CSS で最初から隠しておき、中身が描画されたら表示する
       （逆にすると、空だと分かるまでの数秒間、見出しが見えてから
         消えることになり、画面がガタつく）。
       JavaScriptが動かない環境ではウィジェット自体も描画されないので、
       隠したままで正しい。
       対象は data-hide-if-empty="中を見るセレクタ" が付いた要素。 */
(function () {
  var secs = document.querySelectorAll('[data-hide-if-empty]');
  if (!secs.length) return;

  /* CSS 側が [data-hide-if-empty]:not([data-checked]) を隠している。
     data-checked を付けることで表示に切り替わる。 */
  function show(sec) {
    sec.setAttribute('data-checked', '1');
  }
  function filled(box) {
    return !!box && (box.children.length > 0 || box.textContent.trim() !== '');
  }

  for (var i = 0; i < secs.length; i++) {
    (function (sec) {
      var box = sec.querySelector(sec.getAttribute('data-hide-if-empty'));
      if (!box) return;
      if (filled(box)) { show(sec); return; }
      /* ウィジェットが描画した瞬間に表示する */
      if (window.MutationObserver) {
        var ob = new MutationObserver(function () {
          if (filled(box)) { show(sec); ob.disconnect(); }
        });
        ob.observe(box, { childList: true, subtree: true, characterData: true });
        setTimeout(function () { ob.disconnect(); }, 15000);
      }
      /* MutationObserverが使えない場合の保険 */
      var tries = 0;
      (function poll() {
        if (sec.getAttribute('data-checked')) return;
        if (filled(box)) { show(sec); return; }
        if (++tries < 30) { setTimeout(poll, 500); }
      })();
    })(secs[i]);
  }
})();

/* 11. お知らせのカテゴリー色分け
       MakeShopのお知らせには「カテゴリー」の項目が無い。そこで、運用で
       付けているタイトル先頭の【　】（例「【重要】…」）を読み取り、
       色付きのラベルにして本文タイトルからは【　】を取り除く。
       対象＝一覧の .news-list .ttl と、詳細の見出し .news-hero h1。
       【　】が無いタイトルは、何もせずそのまま表示する（安全側）。
       ラベルの色は下の分類にゆるく一致させ、どれにも当たらなければ既定色。 */
(function () {
  var MAP = [
    ['important', ['重要', '緊急', '注意']],
    ['event',     ['イベント', 'キャンペーン', 'セール', 'フェア', '特集']],
    ['stock',     ['入荷', '解禁', '予約', '受付', '再販', '限定']],
    ['holiday',   ['休業', '年末年始', 'お盆', '休み', '営業']],
    ['greet',     ['ご挨拶', '御礼', 'お礼']]
  ];
  var re = /^\s*【([^】]{1,14})】\s*/;
  function kindOf(label) {
    for (var i = 0; i < MAP.length; i++) {
      var keys = MAP[i][1];
      for (var j = 0; j < keys.length; j++) {
        if (label.indexOf(keys[j]) !== -1) return MAP[i][0];
      }
    }
    return 'default';
  }
  function decorate(el) {
    if (!el || el.getAttribute('data-cat-done')) return;
    var m = el.textContent.match(re);
    if (!m) return;
    var label = m[1];
    var badge = document.createElement('span');
    badge.className = 'news-cat news-cat--' + kindOf(label);
    badge.textContent = label;
    /* タイトルから【…】を取り除き、その先頭にラベルを差し込む。
       ラベルを .ttl / h1 の中に入れることで、一覧のグリッド（日付＋本文）を
       崩さずに済む。 */
    el.textContent = el.textContent.replace(re, '');
    el.insertBefore(badge, el.firstChild);
    el.setAttribute('data-cat-done', '1');
  }
  var items = document.querySelectorAll('.news-list .ttl');
  for (var i = 0; i < items.length; i++) decorate(items[i]);
  decorate(document.querySelector('.news-hero h1'));
})();

/* 12. フッターの著作権表示の西暦を、その年に合わせる
       毎年の書き換えを不要にするため。HTML側にも年を書いてあるので、
       このJSが動かなくても空欄にはならない（書いてある年がそのまま出る）。 */
(function () {
  var el = document.getElementById('copyYear');
  if (!el) return;
  var y = String(new Date().getFullYear());
  if (el.textContent !== y) el.textContent = y;
})();

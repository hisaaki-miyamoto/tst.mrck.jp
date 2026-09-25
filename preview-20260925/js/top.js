$(function() {
    // スライダーを設定している場合は識別用のclassを追加する
    if (0 < $('.back-image #M_slider').length) {
        $('body').addClass('slide-mode');
    }
    
    $(window).on('scroll', function () {
        // スクロール時のフェードイン
        $('.fadein').each(function() {
            if ($(window).scrollTop() > $(this).offset().top - $(window).height() + 50) {
                $(this).addClass('scrollin');
            }
        });
        
        // スクロール時の背景の影
        if ($(window).scrollTop() > $('body.slide-mode div#mv').height()) {
            $('body.slide-mode .back-image').addClass("on-shadow");
        } else {
            $('body.slide-mode .back-image').removeClass("on-shadow");
        }
    });
    
    $('a[href="#special-product"]').on('click', function() {
        var speed = 800;
        var position = $(this).offset().top + 150;
        $('body, html').animate({ scrollTop: position }, speed, 'swing');
        return false;
    });
});

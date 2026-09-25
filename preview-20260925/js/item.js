$(function() {
    $('.gallery').slick({
        infinite: true,
        prevArrow: '<div class="slick-prev"></div>',
        nextArrow: '<div class="slick-next"></div>'
    });
    
    $('.choice-btn').slick({
        infinite: true,
        slidesToShow: 100,
        focusOnSelect: true,
        asNavFor: '.gallery'
    });
    
    $('.gallery').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
        $('.choice-btn .slick-slide').removeClass('slick-current').eq(nextSlide).addClass('slick-current');
    });
    
    $('.modal-close, .modal-bg').on('click', function() {
        $('.modal-area').fadeOut();
    });
    
    $('img.option-image').on('click', function() {
        showOptionImage($(this).attr('data-option-image'));
    });
    
    //商品画像の拡大
    const lightbox = GLightbox({
        loop: true,
        touchNavigation: true,
        draggable: true
    });

    if (typeof slider !== 'undefined') {
        slider.on('observerUpdate', function() {
            lightbox.reload();
        });
        slider.on('slideChangeTransitionEnd', function() {
            lightbox.reload();
        });
    }
    
});

function MakeShop_afterItemOptionChange(data) {
    if (data.isSoldout) {
        $('.instock').removeClass('on').addClass('off');
        $('.outstock').removeClass('off').addClass('on');
    } else {
        $('.instock').removeClass('off').addClass('on');
        $('.outstock').removeClass('on').addClass('off');
    }

    showOptionImage(data.imageL);
}

function MakeShop_afterCartEntry(data) {
    if (data.result) {
        $('.cart-badge').text(data.totalQuantity).show();
        $('.ham-cart-badge').text(data.totalQuantity).show();
        $('.modal-area').fadeIn();
    } else {
        data.method.modal(data.error.message);
    }  
    return false;
}

function showOptionImage(url) {
    if (url == '') {
        return;
    }
    $('div.item-image-block ul.choice-btn img[src="' + url + '"]').trigger('click');
}

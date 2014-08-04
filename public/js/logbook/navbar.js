function menu_hover() {
    var menu_item = $('.nav').find('li');

    menu_item.hover(
        function (e) {
            var icon = $(this).find('.icon');

            var left_pos = icon.offset().left - $('.nav').offset().left;
            var el_width = icon.width() + $(this).find('.text').width() + 10;

            var hover_bar = $('<div class="active-menu special-active-menu"></div>')
                .css('left', left_pos)
                .css('width', el_width)
                .attr('id', 'special-active-menu-' + $(this).data('slide'));

            $('.active-menu').after(hover_bar);
        },
        function (e) {
            $('.special-active-menu').remove();
        }
    );
}

function menu_focus(element, i) {
    $('.nav > li').removeClass('active');
    $(element).addClass('active');

    var icon = $(element).find('.icon');

    var left_pos = icon.offset().left - $('.nav').offset().left;
    var el_width = icon.width() + $(element).find('.text').width() + 10;

    $('.active-menu').stop(false, false).animate(
        {
            left: left_pos,
            width: el_width
        },
        1500,
        'easeInOutQuart'
    );
}
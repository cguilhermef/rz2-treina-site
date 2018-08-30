$(document).ready(function() {

  $(document).on('click', '.js-toggle-menu', function(e) {
    e.preventDefault();
    $('.menu-bar__links').toggleClass('menu-bar__links--active');
  });
});
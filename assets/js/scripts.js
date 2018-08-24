$(document).ready(function() {
  Navigation();
});

var Navigation = function() {
  const moving = Moving().init();
  $(document).on('keydown', function(e) {
    switch(e.keyCode) {
      case 40: {
        moving.down();
        break;
      }
      case 38: {
        moving.up();
        break;
      }
    }
  });
  $(document).on('click', '.js-navigation-item', function(e, f){
    e.preventDefault();
    const el$ = $(e.currentTarget);
    const index = el$.data('target');
    // navigation$.find('.js-navigation-item').removeClass('--active');
    // el$.addClass('--active');
    moving.active(index);
  });
}

var Progress = function() {
  const bar = $('.js-bar');
  const count = $('.js-count');
  let timer = null;
  return {
    set: function(actualIndex, nextIndex) {
      let result = nextIndex * 33;
      if (result > 66) {
        result = 100;
      }
      bar.css('width', `${ result }%`);
      // if (actualIndex === nextIndex) {
      //   count.text(`${ (actualIndex + 1) * 25 }%`);
      //   return;
      // }
      let start = actualIndex * 33;
      let end = nextIndex === 3 ? 100 : nextIndex * 33;
      timer = clearInterval(timer);
      timer = setInterval(function() {
        if (start === end) {
          timer = clearInterval(timer);
          return;
        }
        if (start < end) {
          start ++;
        } else {
          start --;
        }
        count.text(`${start}%`);
      }, 25);
    }
  };
}

var Moving = function() {

  let activeIndex = 0;
  const progress = Progress();
  const sections$ = $('.section');
  const sectionsCount = sections$.length;

  sections$.each(function(k, el) {
    var el$ = $(el);
    el$.css('z-index', sectionsCount - k);
  });

  return {
    getIndex: function() {
      return activeIndex;
    },
    active: function(index) {
      progress.set(activeIndex, index);
      if (index === activeIndex) {
        $(`.js-navigation-item:eq(${ index })`).addClass('--active');
        return;
      }
      
      const actual$ = $(sections$[activeIndex]);
      const next$ = $(sections$[index]);
      this.removeMvClasses(actual$);
      this.removeMvClasses(next$);

      if (index > activeIndex) {
        actual$.addClass('mv--exit-to-top');
        next$.addClass('mv--enter-from-bottom');
      } else {
        actual$.addClass('mv--exit-to-bottom');
        next$.addClass('mv--enter-from-top');
      }
      $(`.js-navigation-item:eq(${ activeIndex})`).removeClass('--active');
      $(`.js-navigation-item:eq(${ index })`).addClass('--active');
      activeIndex = index;
    },
    removeMvClasses: function(el) {
      let classes = el.attr('class');
      classes = classes
        .split(' ')
        .filter( c => {
          return !c.match(/^mv--/);
        })
        .join(' ');
      el.attr('class', classes);
    },
    down: function() {
      if (activeIndex === sectionsCount -1) {
        return;
      }
      this.active(activeIndex + 1);
    },
    up: function() {
      if (activeIndex === 0) {
        return;
      }
      this.active(activeIndex - 1);
    },
    init: function() {
      this.active(0);
      // progress.set(0);
      return this;
    }
  }
}
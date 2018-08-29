$(document).ready(function() {
  Navigation();
  let timer = null;
  const board1 = BoardTips('board-1').init();
  const board2 = BoardTips('board-2').init();
  $(document).on('click', '.js-content', function(event) {
    timer = clearTimeout(timer);
    timer = setTimeout(function() {
      board1.activeContent($(event.currentTarget).data('content'));
    }, 800);
  });
  $(document).on('click', '.js-content-space', function(event) {
    timer = clearTimeout(timer);
    timer = setTimeout(function() {
      board2.activeContent($(event.currentTarget).data('content'));
    }, 800);
  });
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

var BoardTips = function(boardId) {
  const board$ = $(`#${boardId}`);
  const contents$ = board$.find('.js-content');
  contents$.each( (k, el) => $(el).hide());

  const drawBox$ = $('<div>');
  drawBox$.addClass('js-draw').attr('id', `js-draw-${ boardId }`);
  board$.prepend(drawBox$);
  const svg1 = SVG(`js-draw-${ boardId }`).size(board$.outerWidth(), board$.outerHeight());
  let running = false;
  return {
    activeContent: function(contentId) {
      if (running) {
        return;
      }
      const el$ = board$.find(`.js-module[data-content="${ contentId }"]`);
      if ( el$.hasClass('--active')) {
        return;
      }
      running = true;
      board$.find('.js-module').removeClass('--active'); 
      
      el$.addClass('--active');
      const content$ = $(`#${ contentId}`);
    
      svg1.clear();
      contents$.hide();
      content$.fadeIn();
      let x1;
      if (window.screen.outerWidth < 992) {
        x1 = content$.offset().left + (( content$.outerWidth() / 2) * .3);
      } else {
        x1 = content$.offset().left + ( content$.outerWidth() / 2);
      }
      let x2 = el$.offset().left + (el$.outerWidth() / 2) - 6;// - el$.outerWidth()*.6;
      let y1 = content$.offset().top + content$.outerHeight();
      let y2 = el$.offset().top - 6; // + el$.outerHeight() * .2;
      if ( y2 < y1 ) {
        y1 = content$.offset().top - 6;
      }
      let line1 = svg1.line(x1, y1, x1, y1);
      const circle1 = svg1.circle(12).fill('#fff').stroke({color: '#ff9500', width: 3}).move(x1 - 6, y1 - 6);
      line1
        .animate(200)
        .plot(x1, y1, x1, y2)
        .after(function() {
          const line2 = svg1.line(x1, y2, x1, y2);
          line2.stroke({ color: '#ff9500', width: 4, linecap: 'round'});
          line2
            .animate(200)
            .plot(x1, y2, x2, y2)
            .after(function() {
              const circle2 = svg1.circle(12).fill('#fff').stroke({color: '#ff9500', width: 3}).move(x2, y2 - 6 );
              running = false;
            });
        })
      line1.stroke({ color: '#ff9500', width: 4, linecap: 'round'});
    },
    init: function() {
      const self = this;
      board$.on('click', '.js-module', function(event) {
        console.log($(event.currentTarget));
        self.activeContent($(event.currentTarget).data('content'));
      });
      return self;
    }
  }
}
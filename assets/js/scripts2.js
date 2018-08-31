(function() {

  $(document).ready(function() {

    const sectionsHeight = SectionHeight().init();
    const navigation = Navigation();
    const board1 = ConnectElements().init($('#board-1'));
    const boxInfoControl = BoxInfoControl();
    const moduleTrigger = ModuleTrigger();
    let timer = null;

    $(window).on('resize', function() {
      sectionsHeight
        .updateWindowHeigh()
        .resizeSections();
    });
  
    $(document).on('click', '.js-toggle-menu', function(e) {
      e.preventDefault();
      $('.menu-bar__links').toggleClass('menu-bar__links--active ');
      $('.btn-menu').toggleClass('btn-menu--active');
    });
  
    $(document).on('keydown', function(e) {
      switch(e.keyCode) {
        case 40: {
          console.log('thi');
          navigation.moveDown();
          break;
        }
        case 38: {
          navigation.moveUp();
          break;
        }
      }
    });

    $(document).on('click', '.js-goto-section', function(e) {
      const target = $(e.currentTarget).data('target');
      if (!target && target !== 0) {
        return;
      }
      navigation.active(target);
    });

    $('.info-box').hide();
    // const board1 = BoardTips('board-1').init();
    // const board2 = BoardTips('board-2').init();
    $(document).on('click', '.js-module', function(event) {
      const target$ = $(event.currentTarget);
      const box$ = boxInfoControl.active(target$.data('content'));
      moduleTrigger.active(target$);
      board1.draw(box$, target$); 
    });
  });

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
        }, 15);
      }
    };
  }
  
  const SectionHeight = function() {
    const sections$ = $('.section');
    let windowHeight = window.innerHeight;
    return {
      resizeSections: function() {
        const self = this;
        sections$.each(function(k, el) {
          $(el).height(windowHeight);
        });
        return self;
      },
      updateWindowHeigh: function() {
        windowHeight = window.innerHeight;
        return this;
      },
      init: function() {
        return this
          .updateWindowHeigh()
          .resizeSections();
      }
    }
  }
  
  const Navigation = function() {
    let sectionActive = 0;
    const first$ = $('.section:eq(0)');
    const progress = Progress();
    return {
      moveDown: function() {
        if (sectionActive === 3) {
          return;
        }
        sectionActive++;
        this.active(sectionActive);
      },
      moveUp: function() {
        if (sectionActive === 0) {
          return;
        }
        sectionActive--;
        this.active(sectionActive);
      },
      active: function(section) {
        console.log(section, sectionActive);
        if (Number(section) === Number(sectionActive)) {
          return;
        }
        progress.set(sectionActive, section);
        first$.stop();
        first$.animate({
          marginTop: `-${ section * first$.outerHeight() }px`
        }, 600);
        sectionActive = section;
        return this;
      }
    }
  };

  var ModuleTrigger = function() {
    const modules$ = $('.js-module');
    return {
      active: function(module$) {
        if (module$.data('activated')) {
          return;
        }
        modules$.each((k, el) => $(el).removeClass('--active'));
        module$.addClass('--active');
        return module$;
      }
    }
  }

  var BoxInfoControl = function() {
    const boxInfoList$ = $('.js-content');
    return {
      active: function(boxInfoId) {
        const box$ = $(`#${boxInfoId}`);
        if (box$.data('activated')) {
          return;
        }
        boxInfoList$.each((k, el) => $(el).hide());
        box$.show();
        return box$;
      }
    }
  };

  var ConnectElements = function() {
    return {
      board: null,
      boardDimension: {},
      createBoard: function(recipe$) {
        const boardName = `${ recipe$.attr('id')}-draw`;
        $('<div>')
          .addClass('js-draw')
          .attr('id', boardName)
          .appendTo(recipe$);
        return SVG(boardName).size(recipe$.outerWidth(), recipe$.outerHeight());
      },
      metricsOf: function(el) {
        const el$ = $(el)
        const elPosition = el$.offset();
        const elDimensions = { w: el$.outerWidth(), h: el$.outerHeight() };
        const self = this;
        return {
          t: elPosition.top,
          r: self.boardDimension.w - elPosition.left + elDimensions.w,
          b: self.boardDimension.h - elPosition.top + elDimensions.h,
          l: elPosition.left,
          h: elDimensions.h,
          w: elDimensions.w,
          hCenter: elPosition.l + (elPosition.w / 2),
          vCenter: elPosition.t + (elPosition.h / 2)
        }
      },
      draw: function(fromEl, toEl) {
        const fromEl$ = $(fromEl);
        const toEl$ = $(toEl);
        const fromElMetrics = this.metricsOf(fromEl);
        const toElMetrics = this.metricsOf(toEl);
        this.board
          .clear()
          .line()
          .stroke({
            color: '#ff9500',
            linecap: 'round',
            dasharray: [1, 18],
            width: 9
          })
          .plot(
            fromElMetrics.l + fromElMetrics.w * .5, 
            fromElMetrics.t + fromElMetrics.h - 106 + 4, 
            toElMetrics.l + toElMetrics.w * .5, 
            toElMetrics.t - 106
          );
      },
      init: function(recipe$) {
        this.boardDimension = {
          h: recipe$.outerHeight(),
          w: recipe$.outerWidth()
        };
        this.board = this.createBoard(recipe$);
        console.log(this.board);
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
        let y1 = content$.offset().top + content$.outerHeight() - 106;
        let y2 = el$.offset().top - 6 - 106; // + el$.outerHeight() * .2;
        if (boardId === 'board-2') {
          y2 += el$.outerHeight() * .8;
        }
        if ( y2 < y1 ) {
          y1 = content$.offset().top - 6;
        }
        let line1 = svg1.line(x1, y1, x1, y1);
        const circle1 = svg1.circle(12).fill('#fff').stroke({
          color: '#ff9500', 
          dashArray: [ 20,10,5,5,5,10 ],
          width: 3
        }).move(x1 - 6, y1 - 6);
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
                const circle2 = svg1.circle(12).fill('#fff').stroke({color: '#ff9500', width: 3, dashArray: [ 20,10,5,5,5,10 ],}).move(x2, y2 - 6 );
                running = false;
              });
          })
        line1.stroke({ color: '#ff9500', width: 4, linecap: 'round'});
      },
      init: function() {
        const self = this;
        board$.on('click', '.js-module', function(event) {
          self.activeContent($(event.currentTarget).data('content'));
        });
        return self;
      }
    }
  }

})();


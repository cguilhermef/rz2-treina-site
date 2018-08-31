(function() {

  $(document).ready(function() {

    const sectionsHeight = SectionHeight().init();
    const navigation = Navigation();
    const board1 = ConnectElements().init($('#board-1')); 
    const board2 = ConnectElements().init($('#board-2'));
    const boxInfoControl1 = new BoxInfoControl().init('board-1');
    const boxInfoControl2 = new BoxInfoControl().init('board-2');
    const moduleTrigger1 =  new ModuleTrigger().init('board-1');
    const moduleTrigger2 = new ModuleTrigger().init('board-2');
    const mountainBoxes = new InfoBoxControl().init(board1, boxInfoControl1, moduleTrigger1);
    const spaceBoxes = new InfoBoxControl().init(board2, boxInfoControl2, moduleTrigger2);
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
      if (target === 1) {
        timer = clearTimeout(timer);
        timer = setTimeout(function() {
          mountainBoxes.activate('content-1');
        }, 800);
        return;
      }
      if (target === 2) {
        timer = clearTimeout(timer);
        timer = setTimeout(function() {
          spaceBoxes.activate('content-5');
        }, 800);
      }
    });

    $('.info-box').hide();
    $(document).on('click', '#board-1 .js-module, #board-1 .js-trigger-module', function(event) {
      mountainBoxes.activate($(event.currentTarget).data().content);
    });
    $(document).on('click', '#board-2 .js-module, #board-2 .js-trigger-module', function(event) {
      spaceBoxes.activate($(event.currentTarget).data().content);
    });
  });

  const Progress = function() {
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

  const ModuleTrigger = function() {
    return {
      getModuleByDataContent: function(contentId) {
        const self = this;
        let el$;
        self.modules$.each((k, el) => {
          if ($(el).data().content === contentId) {
            el$ = $(el);
          }
        });
        return el$;
      },
      activate: function(contentId) {
        const module$ = this.getModuleByDataContent(contentId);
        if (!module$) {
          return;
        }
        if (module$.data('activated')) {
          return;
        }
        this.deactivateAll();
        module$.addClass('--active');
        return module$;
      },
      deactivateAll: function() {
        this.modules$.each((k, el) => $(el).removeClass('--active'));
      },
      modules$: null,
      init: function(boardId) {
        this.modules$ = $(`#${ boardId } .js-module`);
        return this;
      }
    }
  }

  const BoxInfoControl = function() {
    let boxInfoList$;
    return {
      deactivateAll: function() {
        boxInfoList$.each((k, el) => $(el).hide());
      },
      activate: function(boxInfoId) {
        const box$ = $(`#${ boxInfoId }`);
        if (box$.data('activated')) {
          return;
        }
        this.deactivateAll();
        box$.fadeIn();
        return box$;
      },
      init: function(boardId) {
        boxInfoList$ = $(`#${ boardId } .js-content`);
        return this;
      }
    }
  };

  const InfoBoxControl = function() {
    return {
      timer: null,
      board: null,
      boxControl: null,
      moduleTrigger: null,
      activate: function(contentId) {
        const self = this;
        const target$ = this.moduleTrigger.getModuleByDataContent(contentId);
        this.moduleTrigger.deactivateAll();
        this.boxControl.deactivateAll();
        this.moduleTrigger.activate(contentId);
        this.boxControl.activate(contentId);
        this.timer = clearTimeout(this.timer);
        this.tiemr = setTimeout(function() { 
          self.board.draw($(`#${ contentId }`), target$); 
        }, 20);
      },
      init: function(board, boxControl, moduleTrigger) {
        this.board = board;
        this.boxControl = boxControl;
        this.moduleTrigger = moduleTrigger;
        return this;
      }
    }
  }

  const ConnectElements = function() {
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
})();


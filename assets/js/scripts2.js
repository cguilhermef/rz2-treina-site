(function() {

  $(document).ready(function() {

    const sectionsHeight = SectionHeight().init();
    const navigation = Navigation();
    const body = document.getElementById('hm');
    const hammertime = new Hammer(body);
    hammertime.on('swipeup', function(ev) {
      navigation.moveUp();
    });
    hammertime.on('swipedown', function(ev){
      navigation.moveDown();
    });
  
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
    })
  });
  
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
        first$.stop();
        first$.animate({
          marginTop: `-${ section * first$.outerHeight() }px`
        }, 600);
        return this;
      }
    }
  }

})();


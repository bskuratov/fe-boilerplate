$(document).ready(() => {
  let wWidth = $(window).width();
  let navState = false;
  const $header = $('.page-header');
  const $nav = $header.find('.nav');
  const $parentLi = $nav.find('.menu-item-has-children');
  const $parentLinks = $parentLi.children('a');
  const $subMenus = $parentLi.children('.sub-menu');
  let isObserver = true;
  let observer;
  let isTouch;

  if (
    !('IntersectionObserver' in window) ||
    !('IntersectionObserverEntry' in window) ||
    !('isIntersecting' in window.IntersectionObserverEntry.prototype)
  ) {
    isObserver = false;
    $('html').removeClass('is-observer');
  }

  if (isObserver) {
    observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -15% 0px' }
    );
  }

  function isTouchDevice() {
    const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    const mq = query => {
      return window.matchMedia(query).matches;
    };

    if (
      'ontouchstart' in window ||
      // eslint-disable-next-line no-undef
      (window.DocumentTouch && document instanceof DocumentTouch)
    ) {
      return true;
    }

    // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    // https://git.io/vznFH
    const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join(
      ''
    );
    return mq(query);
  }

  if (isTouchDevice()) {
    isTouch = true;
    $('html').addClass('is-touch');
  }

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  function debounce(func, wait, immediate, ...args) {
    let timeout;
    return function() {
      const context = this;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  function disableScrolling() {
    if ($(document).height() > $(window).height()) {
      const scrollTop = $('html').scrollTop()
        ? $('html').scrollTop()
        : $('body').scrollTop(); // Works for Chrome, Firefox, IE...
      $('html')
        .addClass('disable-scrolling')
        .css('top', -scrollTop);
    }
  }

  function enableScrolling() {
    const scrollTop = parseInt($('html').css('top'), 10);
    $('html').removeClass('disable-scrolling');
    $('html,body').scrollTop(-scrollTop);
  }

  function updateNav() {
    $header.removeClass('is-opened');
    $parentLi.removeClass('is-active');
    $parentLinks.attr('aria-expanded', 'false');

    if (wWidth < 1280) {
      $subMenu.slideUp();
    } else {
      $subMenu.show();
    }
  }

  function handleNavTouch(e) {
    const $item = $(e.target);
    const $curSubMenu = $item.siblings('.sub-menu');

    if ($item.parent().hasClass('is-opened')) {
      $item.parent().removeClass('is-opened');

      if (wWidth < 1280) {
        $curSubMenu.slideUp();
      }
    } else {
      $parentLi.removeClass('is-opened');
      $item.parent().addClass('is-opened');

      if (wWidth < 1280) {
        $subMenus.slideUp();
        $curSubMenu.slideDown();
      }
    }
  }

  function bindEvents() {
    $('.hamburger').on('click', () => {
      if (navState) {
        $header.removeClass('is-opened');
        enableScrolling();
      } else {
        $header.addClass('is-opened');
        disableScrolling();
      }

      navState = !navState;
    });

    $parentLinks.on('touchend', e => {
      e.preventDefault();
      handleNavTouch(e);
    });

    /* Navigation with tabbing */
    $(window).keyup(e => {
      const code = e.keyCode ? e.keyCode : e.which;

      if (code === 9) {
        if ($parentLinks.filter(':focus').length) {
          handleNavTouch(e);
        } else {
          const link = $nav.find('a:focus');

          if (
            link.length &&
            !link.parent().hasClass('.menu-item-has-children') &&
            !link.closest('.sub-menu').length
          ) {
            $parentLi.removeClass('is-opened');
            $parentLi.children('.sub-menu').slideUp();
          }
        }
      }
    });

    // FOCUS STYLING
    // Let the document know when the mouse is being used
    document.body.addEventListener('mousedown', () => {
      document.body.classList.remove('is-tab');
    });

    // Re-enable focus styling when Tab is pressed
    document.body.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        document.body.classList.add('is-tab');
      }
    });
  }

  const doneResizing = debounce(() => {
    const width = $(window).width();

    if (wWidth !== width) {
      wWidth = width;
    }
  }, 500);

  /* FUNCTION CALLS */
  /* ============= */
  bindEvents();

  if (isObserver) {
    $('.js-visibility').each((i, el) => {
      observer.observe(el);
    });
  }

  $(window).on('scroll', () => {});
  $(window).on('resize', doneResizing);
});

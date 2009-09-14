jQuery.ajaxQueue = function(o){
  var q = jQuery([jQuery.ajaxQueue]),
      _old = o.complete;
  o.complete = function(){
    if ( _old ) _old.apply( this, arguments );
    q.dequeue("ajax");
  };

  q.queue("ajax", function(){
    jQuery.ajax( o );
  });

  if (q.queue("ajax").length === 1)
    q.dequeue("ajax");
};

var S = {
  post: function( url, data, callback, type ) {
    if ( jQuery.isFunction( data ) ) {
      callback = data;
      data = {};
    }

    return $.ajaxQueue({
      type: "POST",
      url: url,
      data: data,
      success: callback,
      dataType: type
    });
  },

  create: function(form, li) {
    var url = form.attr('action');
    li.data('task', 'waiting');
    S.post(url, form.serialize(), function(t) {
      li.data('task', t.task);
    }, 'json');
  },

  update: function(li) {
    li = $(li).closest('li');
    var params = {
      'task[person_id]': li.parent().data('person_id'),
      'task[kind]': li.parent().data('kind'),
      'task[body]': li.children('label').text(),
      'task[done]': li.children(':checkbox').attr('checked'),
      'task[position]': li.prevAll('li').length
    };
    if (li.data('task')) {
      if (li.data('task') === 'waiting') {
        S.status('Conflict', true);
        return;
      }
      S.post('/tasks/' + li.data('task').id + '.json',
        $.extend(params, { _method: 'put' }));
    } else {
      params['task[day]'] = $('form input#task_day').val();
      li.data('task', 'waiting');
      S.post('/tasks.json', params, function(t) {
        li.data('task', t.task);
        li.removeClass('ui-state-disabled');
      }, 'json');
    }
  },

  destroy: function(li) {
    li = $(li).closest('li');
    if (li.hasClass('ui-state-disabled')) return;
    S.post('/tasks/' + li.data('task').id + '.json',
      { _method: 'delete' });
  },

  task: function(t) {
    var li = $('li#template').clone(true).removeAttr('id');
    li.children('label').html(t.body);
    if (t.done) {
      li.children(':checkbox').attr('checked', true);
      li.children('label').addClass('done');
    }
    li.data('task', t);

    return li;
  },

  index: function(tasks, last) {
    var ajaxStatus = function() {
      $('#status').
        ajaxError(function() {
          S.status('Error', true);
        }).
        ajaxStart(function() {
          S.status('Saving');
        }).
        ajaxStop(function() {
          S.status();
        });
    };

    var sortables = function() {
      $('ul')
        .each(function(i) {
          $(this)
            .data('kind', this.className)
            .data('person_id', $(this).closest('tr').get(0).id);
        })
        .sortable({
          connectWith: 'ul',
          update: function(e, ui) {
            if (ui.sender)  return;

            if (e.metaKey || e.ctrlKey) {
              var copy = ui.item.clone(true);
              var prev = ui.item.prev('li');
              if (prev.length > 0)
                prev.after(copy);
              else
                ui.item.parent().prepend(copy);

              $(this).sortable('cancel');
              S.update(copy);
            } else {
              S.update(ui.item);
            }
          }
        });
    };

    var datepicker = function() {
      $('#date').datepicker({
        defaultDate: new Date($('form input#task_day').val().replace(/-/g,'/')),
        onSelect: function(dateText, inst) {
          window.location = '/?date=' + dateText;
        }
      });
    };

    var events = function() {
      // check for done
      $('li :checkbox').click(function(e) {
        var c = $(e.currentTarget);
        c.next('label').toggleClass('done', c.attr('checked'));

        S.update(c);
      });

      // edit in place
      var edit = function(e) {
        var label = $(e.currentTarget).closest('li').children('label').hide();
        var input = $('<input />').val($.trim(label.text()));
        var form = $('<form>').append(input);

        var done = function(e) {
          label.html(input.val()).show();
          form.remove();
          S.update(label);
          return false;
        };
        input.blur(done);
        form.submit(done);

        label.after(form);
        input.select();

        return false;
      };
      $('li label').dblclick(edit);
      $('li a.edit').click(edit)
        .addClass('ui-icon ui-icon-pencil')
        .hover(function() { $(this).wrap('<span class="ui-state-hover">'); },
               function() { $(this).parent().replaceWith(this); });

      // destroy
      $('li a.destroy').click(function(e) {
        var x = $(e.currentTarget);
        S.destroy(x);

        x.closest('li').remove();

        return false;
      })
        .addClass('ui-icon ui-icon-close')
        .hover(function() { $(this).wrap('<span class="ui-state-hover">'); },
               function() { $(this).parent().replaceWith(this); });

      // new
      $('form.new').submit(function(e) {
        var form = $(e.currentTarget);
        var input = form.children(':text');
        var li = S.task({ body: input.val() });

        S.create(form, li);

        form.siblings('ul').append(li);
        input.val('');

        return false;
      });
    };

    $(document).ready(function() {
      ajaxStatus();
      sortables();
      datepicker();
      events();

      // initialize
      $.each(tasks, function(i, t) {
        t = t.task;
        var ul = $('tr#' + t.person_id + ' ul.' + t.kind);
        ul.append(S.task(t));
      });

      // missing yesterday tasks
      $.each(last, function(i, t) {
        t = t.task;
        var ul = $('tr#' + t.person_id + ' ul.yesterday');
        ul.append(S.task(t).addClass('ui-state-disabled').removeData('task'));
      });
    });
  },

  status: function(message, error) {
    var st = $('#status');
    if (st.data('error')) return;
    if (message) {
      error = error || false;
      st.text(message)
        .toggleClass('ui-state-error', error)
        .css('left', ($(document).width()-st.width())/2)
        .data('error', error)
        .fadeIn();
    } else {
      st.fadeOut(function() { $(this).text(''); });
    }
  }
};

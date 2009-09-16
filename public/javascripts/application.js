var S = {
  create: function(form, li) {
    li.queue(function() {
      var q = $(this);
      var url = form.attr('action');
      $.post(url, form.serialize(), function(t) {
        li.data('task', t.task);
        q.dequeue();
      }, 'json');
    });
  },

  update: function(li) {
    li = $(li).closest('li');
    li.queue(function() {
      var q = $(this);
      var params = {
        'task[person_id]': li.parent().data('person_id'),
        'task[kind]': li.parent().data('kind'),
        'task[day]': li.closest('td').find('form input#task_day').val(),
        'task[body]': li.children('label').text(),
        'task[done]': li.children(':checkbox').attr('checked'),
        'task[position]': li.prevAll('li').length
      };
      if (li.data('task')) {
        $.post('/tasks/' + li.data('task').id + '.json',
          $.extend(params, { _method: 'put' }),
          function() { q.dequeue(); });
      } else {
        $.post('/tasks.json', params, function(t) {
          li.data('task', t.task);
          li.removeClass('ui-state-disabled');
          q.dequeue();
        }, 'json');
      }
    });
  },

  destroy: function(li) {
    li = $(li).closest('li');
    li.queue(function() {
      var q = $(this);
      if (li.hasClass('ui-state-disabled')) return;
      $.post('/tasks/' + li.data('task').id + '.json',
        { _method: 'delete' },
        function() { q.dequeue(); });
    });
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
        defaultDate: new Date($('ul.today ~ form input#task_day').val().replace(/-/g,'/')),
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
      // new show/hide
      $('form.new :text').focus(function() { $(this).addClass('focused'); });
      $('form.new :text').blur(function() {
        $(this).removeClass('focused').fadeTo('fast', 0);
      });
      $('form.new').hover(
        function() { $(':text', this).fadeTo('fast', 1); },
        function() { $(':text:not(.focused)', this).fadeTo('fast', 0); }
      );
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

var S = {
  status: function(message) {
    var st = $('#status');
    if (message) {
      st.text(message).css('left', ($(document).width()-st.width())/2).fadeIn();
    } else {
      st.fadeOut(function() { $(this).text(''); });
    }
  },

  create: function(form, li) {
    var url = form.attr('action');
    $.post(url, form.serialize(), function(t) {
      li.data('task', t.task);
    }, 'json');
  },

  update: function(li) {
    li = $(li).closest('li');
    var id = li.data('task').id;
    var params = {
      'task[body]': li.children('label').text(),
      'task[done]': li.children(':checkbox').attr('checked')
    };
    $.post('/tasks/' + id + '.json', $.extend(params, { _method: 'put' }));
  },

  destroy: function(li) {
    li = $(li).closest('li');
    var id = li.data('task').id;
    $.post('/tasks/' + id + '.json', { _method: 'delete' });
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

  index: function(tasks) {
    $(document).ready(function() {
      $('#status').
        ajaxError(function() {
          this.error = true;
          S.status('Error');
        }).
        ajaxStart(function() {
          if (!this.error)
            S.status('Saving');
        }).
        ajaxStop(function() {
          if (!this.error)
            S.status();
        });

      // check for done
      $('li :checkbox').click(function(e) {
        var c = $(e.currentTarget);
        c.next('label').toggleClass('done', c.attr('checked'));

        S.update(c);
      });

      // edit in place
      var edit = function(e) {
        var label = $(e.currentTarget).parent().children('label').hide();
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
      $('li a.edit').click(edit);
      $('li label').dblclick(edit);

      // destroy
      $('li a.destroy').click(function(e) {
        var x = $(e.currentTarget);
        S.destroy(x);

        x.parent().remove();

        return false;
      });

      // new
      $('form.new').submit(function(e) {
        var form = $(e.currentTarget);
        var input = form.children(':text');
        var li = S.task({ body: input.val() });

        S.create(form, li);

        form.prev('ul').append(li);
        input.val('');

        return false;
      });

      // sortable
      $('ul').sortable({
        connectWith: 'ul',
        update: function(e, ui) {
        }
      });

      $.each(tasks, function(i, t) {
        t = t.task;
        var ul = $('tr#' + t.person_id + ' ul.' + t.kind);
        ul.append(S.task(t));
      });

      // datepicker
      $('#date').datepicker();
    });
  }
};

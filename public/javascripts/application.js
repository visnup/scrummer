var S = {
  create: function(form) {
    var url = form.attr('action');
    $.post(url, form.serialize()); // TODO queue
  },

  update: function(li) {
    var li = $(li).closest('li');  // make sure we have the li
    var id = li.data('id');
    //$.post('/tasks/' + id + '.json', { _method: 'put' });
  },

  destroy: function(li) {
    li = $(li).closest('li');
    var id = li.data('task').id;
    $.post('/tasks/' + id + '.json', { _method: 'delete' });
  },

  task: function(t) {
    var li = $('li#template').clone(true).removeAttr('id');
    li.children('label').html(t.body);
    li.data('task', t);

    return li;
  },

  index: function(tasks) {
    $(document).ready(function() {
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
        S.create(form);

        var ul = form.prev('ul'),
            input = form.children(':text');
        ul.append(S.task({ body: input.val() }));
        input.val('');

        return false;
      });

      // sortable
      $('ul').sortable({ connectWith: 'ul' });

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

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
        'task[body]': li.children('label').data('body'),
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

  showdown: new Showdown.converter(),
  markdown: function(text) {
    return S.showdown.makeHtml(text).replace(/^<p>/, '').replace(/<\/p>$/, '');
  },

  task: function(t) {
    var li = $('li#template').clone(true).removeAttr('id');
    li.children('label')
      .data('body', t.body)
      .html(S.markdown(t.body));
    if (t.done) {
      li.children(':checkbox').attr('checked', true);
      li.children('label').addClass('done');
    }
    li.data('task', t);

    return li;
  },

  index: function(options) {
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
              copy.children('label').data('body', ui.item.children('label').data('body'));  // HACK
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
        var input = $('<input />').val($.trim(label.data('body')));
        var form = $('<form>').append(input);

        var done = function(e) {
          label
            .data('body', input.val())
            .html(S.markdown(input.val())).show();
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

      // late
      $('a.late').click(function() {
        var a = $(this);

        var late = new Date();
        var minutes = (late.getHours() - 10) * 60 + late.getMinutes();
        var input = $('<input />')
          .blur(function() { form.remove(); a.show(); })
          .val(a.data('minutes') || minutes);
        var form = $('<form>')
          .submit(function() {
            var m = input.val(), td = a.closest('td');
            var params = {
              'task[person_id]': $('ul', td).data('person_id'),
              'task[kind]': 'late',
              'task[day]': $('form input#task_day', td).val(),
              'task[body]': m
            };
            a.queue(function() {
              if (a.data('task')) {
                $.post('/tasks/' + a.data('task').id + '.json',
                  $.extend(params, { _method: 'put' }),
                  function() { a.dequeue(); });
              } else {
                $.post('/tasks.json', params, function(t) {
                  a.data('task', t.task).dequeue();
                }, 'json');
              }
            });

            a
              .data('minutes', m)
              .text('late ' + m + ' minutes')
              .removeClass('ui-state-disabled')
              .show();
            form.remove();
            return false;
          })
          .append(input)
          .append(' minutes');

        a
          .hide()
          .after(form);
        input.select();

        return false;
      });

      // show/hide only one person
      $('h1 *').toggle(
        function() {
          $(this)
            .closest('tr')
              .next().andSelf()
              .addClass('keep')
              .parent()
                .find('tr:not(.keep)')
                .fadeOut('fast');
          return false;
        },
        function() {
          $(this)
            .closest('table').find('tr')
              .removeClass('keep')
              .fadeIn('slow');
        });
    };

    var plots = function(productivity) {
      console.log(productivity);
      $.each(productivity, function(personId, series) {
        if (!$('#sparkline' + personId).length) return true;
        $.jqplot('sparkline' + personId, series, {
          stackSeries: true,
          seriesDefaults: {
            renderer: $.jqplot.BarRenderer,
            rendererOptions: {barWidth: 2},
            shadow: false
          },
          seriesColors: [ '#2e83ff', '#f9dd34' ],
          axesDefaults: {
            show: false,
            showTicks: false
          },
          axes: {
            yaxis: { min: 0, max: 12 }
          },
          grid: {
            background: '#f2f5f7',
            borderColor: '#f2f5f7',
            borderWidth: 0,
            shadow: false
          },
          gridPadding: { top: 0, right: 0, bottom: 0, left: 0 }
        });
      });
    };

    $(document).ready(function() {
      ajaxStatus();
      sortables();
      datepicker();
      events();
      plots(options.productivity);

      // initialize
      $.each(options.tasks, function() {
        var t = this.task;
        $('tr#' + t.person_id + ' ul.' + t.kind).append(S.task(t)).length ||
        $('tr#' + t.person_id + ' .' + t.kind)
          .data('task', t)
          .data('minutes', t.body)
          .removeClass('ui-state-disabled')
          .text('late ' + t.body + ' minutes');
      });

      // missing yesterday tasks
      $.each(options.empty, function() {
        var t = this.task;
        var ul = $('tr#' + t.person_id + ' ul.yesterday');
        ul.append(S.task(t).addClass('ui-state-disabled').removeData('task'));

        ul.prev('h3:not(:has(a))').append(
          $('<a href="#">copy</a>')
            .click(function() {
              ul.children('li').each(function() { S.update(this); });
              $(this).remove();
              return false;
            })
        );
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

class Task < ActiveRecord::Base
  belongs_to :person
  default_scope :order => 'position ASC'
  named_scope :kind, lambda { |kind| { :conditions => { :kind => kind } } }
  named_scope :on, lambda { |date|
    { :conditions => [ 'date(day) = ?', date ],
      :order => '`position` ASC' }
  }

  before_create :append_to_end
  before_update :move_in_list
  after_destroy :remove_from_list

  private
    def append_to_end
      max = person.tasks.kind(kind).on(day).maximum('position') || -1
      self.position = max + 1
    end

    def remove_from_list
      list = person.tasks.kind(kind).on(day)
      list.update_all 'position = position - 1', ['position > ?', position]
    end

    def move_in_list
      p = {
        :person => person_id_changed? ? Person.find(person_id_was) : person,
        :kind => kind_changed? ? kind_was : kind,
        :position => position_changed? ? position_was : position
      }
      list = p[:person].tasks.kind(p[:kind]).on(day)
      list.update_all 'position = position - 1', ['position > ?', p[:position]]

      list = person.tasks.kind(kind).on(day)
      list.update_all 'position = position + 1', ['position >= ? AND id != ?', position, id]
    end
end

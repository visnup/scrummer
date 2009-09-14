class Task < ActiveRecord::Base
  belongs_to :person
  default_scope :order => 'position ASC'
  named_scope :kind, lambda { |kind| { :conditions => { :kind => kind } } }
  named_scope :before, lambda { |date|
    { :conditions => [ 'date(day) < ?', date ] }
  }
  named_scope :on, lambda { |date|
    { :conditions => [ 'date(day) = ?', date ],
      :order => 'position ASC' }
  }

  before_create :insert_in_list
  before_update :move_in_list
  after_destroy :remove_from_list

  private
    def insert_in_list
      list = person.tasks.kind(kind).on(day)
      if position
        list.update_all 'position = position + 1', ['position >= ?', position]
      else
        self.position = (list.maximum('position') || -1) + 1
      end
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

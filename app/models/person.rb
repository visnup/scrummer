class Person < ActiveRecord::Base
  has_many :tasks
  has_many :weekly_tasks, :class_name => Task.name,
    :conditions => { :kind => 'weekly' }
  has_many :yesterday_tasks, :class_name => Task.name,
    :conditions => { :kind => 'yesterday' }
  has_many :today_tasks, :class_name => Task.name,
    :conditions => { :kind => 'today' }
  named_scope :active, :conditions => { :active => true }
end

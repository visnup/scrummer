class Person < ActiveRecord::Base
  has_many :tasks
  named_scope :active, :conditions => { :active => true }
end
